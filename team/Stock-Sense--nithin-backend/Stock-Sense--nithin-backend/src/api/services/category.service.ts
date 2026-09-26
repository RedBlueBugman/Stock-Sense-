import { query } from '../../shared/db';
import { AppError } from '../../shared/errorHandler';
import { getOrSetCache, invalidateCache } from '../../shared/redis';
import { CategoryCreateInput, CategoryUpdateInput } from '../schemas/category.schema';

const CATEGORIES_CACHE_KEY = 'categories:flat_list';

export class CategoryService {
  /**
   * Returns categories as a flat list with parent_id.
   * Frontend builds the tree hierarchy.
   */
  async listCategories(includeCounts = false) {
    const cacheKey = `${CATEGORIES_CACHE_KEY}:${includeCounts}`;

    return getOrSetCache(cacheKey, 300, async () => {
      try {
        let sql = `
          SELECT 
            c.*,
            ${includeCounts ? `COALESCE(p_count.total_products, 0)::integer AS product_count` : `0 AS product_count`}
          FROM categories c
        `;

        if (includeCounts) {
          sql += `
            LEFT JOIN (
              SELECT category_id, COUNT(*) AS total_products
              FROM products
              WHERE is_active = true
              GROUP BY category_id
            ) p_count ON p_count.category_id = c.id
          `;
        }

        sql += ` WHERE c.is_active = true ORDER BY c.name ASC;`;

        const res = await query(sql);
        return res.rows;
      } catch (err: any) {
        if (err.code === '42P01') return [];
        throw err;
      }
    });
  }

  /**
   * Returns category detail + direct children list + product count
   */
  async getCategoryById(id: string) {
    try {
      // 1. Fetch category detail
      const catSql = `
        SELECT 
          c.*,
          COALESCE(COUNT(p.id), 0)::integer AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
        WHERE c.id = $1 AND c.is_active = true
        GROUP BY c.id;
      `;
      const catRes = await query(catSql, [id]);

      if (catRes.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Category not found or inactive');
      }

      const category = catRes.rows[0];

      // 2. Fetch direct children
      const childrenSql = `
        SELECT id, name, description, is_active, created_at
        FROM categories
        WHERE parent_category_id = $1 AND is_active = true
        ORDER BY name ASC;
      `;
      const childrenRes = await query(childrenSql, [id]);
      category.children = childrenRes.rows;

      return category;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.code === '42P01') throw new AppError(404, 'NOT_FOUND', 'Category not found');
      throw err;
    }
  }

  /**
   * Helper: Check for circular references using PostgreSQL Recursive CTE
   */
  private async checkCircularReference(categoryId: string, targetParentId: string): Promise<boolean> {
    if (categoryId === targetParentId) return true;

    // Recursive query: check if categoryId exists anywhere in targetParentId's ancestry
    const sql = `
      WITH RECURSIVE CategoryTree AS (
        SELECT id, parent_category_id
        FROM categories
        WHERE id = $1
        UNION ALL
        SELECT c.id, c.parent_category_id
        FROM categories c
        INNER JOIN CategoryTree ct ON ct.parent_category_id = c.id
      )
      SELECT id FROM CategoryTree WHERE id = $2;
    `;

    try {
      const res = await query(sql, [targetParentId, categoryId]);
      return res.rows.length > 0;
    } catch (err: any) {
      return false;
    }
  }

  /**
   * Create category with duplicate check per parent level
   */
  async createCategory(input: CategoryCreateInput) {
    const parentId = input.parent_category_id || null;

    // Check duplicate name at the same level
    const dupCheckSql = `
      SELECT id FROM categories 
      WHERE name ILIKE $1 
        AND (parent_category_id = $2 OR ($2 IS NULL AND parent_category_id IS NULL))
        AND is_active = true;
    `;
    const dupRes = await query(dupCheckSql, [input.name, parentId]).catch(() => ({ rows: [] }));

    if (dupRes.rows.length > 0) {
      throw new AppError(409, 'CONFLICT', 'A category with this name already exists at this hierarchy level');
    }

    const insertSql = `
      INSERT INTO categories (name, parent_category_id, description)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const res = await query(insertSql, [input.name, parentId, input.description || null]);
    await invalidateCache('categories:*');
    return res.rows[0];
  }

  /**
   * Update category with circular reference check
   */
  async updateCategory(id: string, input: CategoryUpdateInput) {
    if (input.parent_category_id) {
      const isCircular = await this.checkCircularReference(id, input.parent_category_id);
      if (isCircular) {
        throw new AppError(400, 'CIRCULAR_REFERENCE', 'Circular hierarchy detected: a category cannot be its own ancestor');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    Object.entries(input).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    });

    if (fields.length === 0) {
      return this.getCategoryById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE categories
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND is_active = true
      RETURNING *;
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found or inactive');
    }

    await invalidateCache('categories:*');
    return res.rows[0];
  }

  /**
   * Soft delete category (only if it has 0 active products)
   */
  async deleteCategory(id: string) {
    try {
      // 1. Check for attached active products
      const countRes = await query(
        `SELECT COUNT(*)::integer as count FROM products WHERE category_id = $1 AND is_active = true;`,
        [id]
      );
      const productCount = parseInt(countRes.rows[0]?.count || '0', 10);

      if (productCount > 0) {
        throw new AppError(
          400,
          'CATEGORY_IN_USE',
          `Cannot delete category containing ${productCount} active product(s). Reassign products first.`
        );
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;
    }

    // 2. Soft delete
    const res = await query(
      `UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found');
    }

    await invalidateCache('categories:*');
    return { message: 'Category successfully deactivated' };
  }
}

export const categoryService = new CategoryService();
