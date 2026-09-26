import pool, { query } from '../../shared/db';
import { AppError } from '../../shared/errorHandler';
import { WarehouseCreateInput, WarehouseUpdateInput } from '../schemas/warehouse.schema';
import { AuthenticatedUser } from '../../core/middleware/rbac';

export class WarehouseService {
  /**
   * List active warehouses. Filters by user assigned warehouses unless ADMIN.
   */
  async listWarehouses(user?: AuthenticatedUser) {
    try {
      let sql = `SELECT * FROM warehouses WHERE is_active = true`;
      const params: any[] = [];

      if (user && user.role !== 'ADMIN' && user.assigned_warehouses && user.assigned_warehouses.length > 0) {
        sql += ` AND id = ANY($1::uuid[])`;
        params.push(user.assigned_warehouses);
      }

      sql += ` ORDER BY name ASC;`;
      const res = await query(sql, params);
      return res.rows;
    } catch (err: any) {
      if (err.code === '42P01') return [];
      throw err;
    }
  }

  /**
   * Create warehouse and auto-create default virtual locations in a transaction
   */
  async createWarehouse(input: WarehouseCreateInput, userId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert warehouse
      const whSql = `
        INSERT INTO warehouses (name, code, address, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const whRes = await client.query(whSql, [
        input.name,
        input.code.toUpperCase(),
        input.address || null,
        userId,
      ]);
      const warehouse = whRes.rows[0];

      // 2. Auto-create default locations
      const defaultLocations = [
        { name: 'Receiving Dock', type: 'internal', barcode: `${warehouse.code}-RCV` },
        { name: 'Shipping Dock', type: 'internal', barcode: `${warehouse.code}-SHP` },
        { name: 'Main Storage', type: 'internal', barcode: `${warehouse.code}-MAIN` },
      ];

      for (const loc of defaultLocations) {
        const locSql = `
          INSERT INTO locations (warehouse_id, name, location_type, barcode)
          VALUES ($1, $2, $3, $4);
        `;
        await client.query(locSql, [warehouse.id, loc.name, loc.type, loc.barcode]);
      }

      await client.query('COMMIT');
      return warehouse;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update warehouse details
   */
  async updateWarehouse(id: string, input: WarehouseUpdateInput) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    Object.entries(input).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(key === 'code' && typeof val === 'string' ? val.toUpperCase() : val);
        idx++;
      }
    });

    if (fields.length === 0) {
      const existing = await query(`SELECT * FROM warehouses WHERE id = $1`, [id]);
      if (existing.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Warehouse not found');
      return existing.rows[0];
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE warehouses
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Warehouse not found');
    }

    return res.rows[0];
  }
}

export const warehouseService = new WarehouseService();
