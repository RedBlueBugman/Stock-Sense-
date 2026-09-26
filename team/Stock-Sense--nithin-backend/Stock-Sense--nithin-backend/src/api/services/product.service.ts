import pool, { query } from '../../shared/db';
import { AppError } from '../../shared/errorHandler';
import { createOperation } from '../../core/services/ledger';
import { ProductCreateInput, ProductUpdateInput, ProductQueryInput } from '../schemas/product.schema';

export class ProductService {
  /**
   * List products with dynamic filters, pagination, sorting, and stock status joins
   */
  async listProducts(filters: ProductQueryInput) {
    const { page, limit, search, category_id, warehouse_id, stock_status, sort_by, sort_order } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p.is_active = true'];
    const params: any[] = [];
    let paramIndex = 1;

    // Search partial match on SKU or Name (GIN / ILIKE)
    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category_id) {
      conditions.push(`p.category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Stock status conditions (using view_stock_quants)
    let stockJoin = `
      LEFT JOIN (
        SELECT product_id, COALESCE(SUM(qty_available), 0) AS total_stock
        FROM view_stock_quants
        ${warehouse_id ? `WHERE warehouse_id = '${warehouse_id}'` : ''}
        GROUP BY product_id
      ) vsq ON vsq.product_id = p.id
    `;

    if (stock_status === 'in_stock') {
      whereClause += ` AND COALESCE(vsq.total_stock, 0) > p.reorder_min`;
    } else if (stock_status === 'low') {
      whereClause += ` AND COALESCE(vsq.total_stock, 0) > 0 AND COALESCE(vsq.total_stock, 0) <= p.reorder_min`;
    } else if (stock_status === 'out') {
      whereClause += ` AND COALESCE(vsq.total_stock, 0) = 0`;
    }

    // Total Count query for pagination meta
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      ${stockJoin}
      ${whereClause}
    `;

    // Map sort column
    let orderColumn = 'p.created_at';
    if (sort_by === 'name') orderColumn = 'p.name';
    if (sort_by === 'sku') orderColumn = 'p.sku';
    if (sort_by === 'stock_qty') orderColumn = 'COALESCE(vsq.total_stock, 0)';

    // Data query
    const dataSql = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(vsq.total_stock, 0)::numeric AS stock_qty
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${stockJoin}
      ${whereClause}
      ORDER BY ${orderColumn} ${sort_order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        query(countSql, params.slice(0, paramIndex - 1)),
        query(dataSql, params),
      ]);

      const total = parseInt(countResult.rows[0]?.total || '0', 10);
      return { products: dataResult.rows, total };
    } catch (err: any) {
      // Graceful fallback if database tables/views are not yet created by Member 1
      if (err.code === '42P01') {
        return { products: [], total: 0 };
      }
      throw err;
    }
  }

  /**
   * Get single product detail + stock per location
   */
  async getProductById(id: string, userRole?: string) {
    const productSql = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `;

    try {
      const productRes = await query(productSql, [id]);
      if (productRes.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Product not found');
      }

      const product = productRes.rows[0];

      // Hide inactive products unless user is ADMIN
      if (!product.is_active && userRole !== 'ADMIN') {
        throw new AppError(404, 'NOT_FOUND', 'Product not found or inactive');
      }

      // Fetch stock per location from view_stock_quants
      const stockSql = `
        SELECT location_id, location_name, warehouse_id, warehouse_name, qty_available, qty_reserved
        FROM view_stock_quants
        WHERE product_id = $1
      `;
      const stockRes = await query(stockSql, [id]).catch(() => ({ rows: [] }));
      product.locations_stock = stockRes.rows;

      return product;
    } catch (err: any) {
      if (err.code === '42P01') {
        throw new AppError(404, 'NOT_FOUND', 'Product not found (tables initializing)');
      }
      throw err;
    }
  }

  /**
   * Create product + trigger optional initial stock adjustment via Ledger Service
   */
  async createProduct(input: ProductCreateInput, userId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertSql = `
        INSERT INTO products (
          name, sku, barcode, category_id, unit_of_measure, 
          tracking_type, reorder_min, reorder_max, reorder_qty, image_url, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;

      const values = [
        input.name,
        input.sku,
        input.barcode || null,
        input.category_id || null,
        input.unit_of_measure || 'pcs',
        input.tracking_type || 'none',
        input.reorder_min || 0,
        input.reorder_max || 0,
        input.reorder_qty || 0,
        input.image_url || null,
        userId,
      ];

      const res = await client.query(insertSql, values);
      const product = res.rows[0];

      // If initial stock was provided, trigger Member 2's ledger service
      if (input.initial_stock && input.initial_stock.qty > 0) {
        await createOperation({
          operation_type: 'adjustment',
          product_id: product.id,
          warehouse_id: input.initial_stock.warehouse_id,
          destination_location_id: input.initial_stock.location_id,
          qty: input.initial_stock.qty,
          notes: 'Initial stock on product creation',
          created_by: userId,
        });
      }

      await client.query('COMMIT');
      return product;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update product details
   */
  async updateProduct(id: string, input: ProductUpdateInput) {
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
      return this.getProductById(id, 'ADMIN');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND is_active = true
      RETURNING *;
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found or inactive');
    }

    return res.rows[0];
  }

  /**
   * Soft delete product (is_active = false).
   * Refuses deletion if product has active stock (qty > 0).
   */
  async deleteProduct(id: string) {
    // 1. Check if stock > 0 in any location
    try {
      const stockRes = await query(
        `SELECT COALESCE(SUM(qty_available), 0) as total_qty FROM view_stock_quants WHERE product_id = $1`,
        [id]
      );
      const totalQty = parseFloat(stockRes.rows[0]?.total_qty || '0');
      if (totalQty > 0) {
        throw new AppError(400, 'ACTIVE_STOCK_EXISTS', 'Cannot delete product with active stock');
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      // If view doesn't exist yet, proceed with soft delete
    }

    // 2. Soft delete
    const res = await query(
      `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    return { message: 'Product successfully deactivated' };
  }

  /**
   * Bulk insert products (wrapped in transaction, up to 500 items)
   */
  async bulkCreateProducts(products: ProductCreateInput[], userId: string) {
    const client = await pool.connect();
    const report = {
      created: 0,
      failed: 0,
      errors: [] as { row: number; sku: string; reason: string }[],
    };

    try {
      await client.query('BEGIN');

      for (let i = 0; i < products.length; i++) {
        const item = products[i];
        try {
          const insertSql = `
            INSERT INTO products (
              name, sku, barcode, category_id, unit_of_measure, 
              tracking_type, reorder_min, reorder_max, reorder_qty, image_url, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `;
          await client.query(insertSql, [
            item.name,
            item.sku,
            item.barcode || null,
            item.category_id || null,
            item.unit_of_measure || 'pcs',
            item.tracking_type || 'none',
            item.reorder_min || 0,
            item.reorder_max || 0,
            item.reorder_qty || 0,
            item.image_url || null,
            userId,
          ]);
          report.created++;
        } catch (rowErr: any) {
          report.failed++;
          let reason = 'Insertion failed';
          if (rowErr.code === '23505') reason = 'Duplicate SKU or Barcode';
          if (rowErr.code === '23503') reason = 'Category ID not found';
          report.errors.push({ row: i + 1, sku: item.sku, reason });
        }
      }

      // If any row failed, we commit only if needed, or wrap all-or-nothing
      await client.query('COMMIT');
      return report;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export const productService = new ProductService();
