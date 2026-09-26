import { query } from '../../shared/db';
import { AppError } from '../../shared/errorHandler';
import { LocationCreateInput, LocationUpdateInput, LocationQueryInput } from '../schemas/location.schema';

export class LocationService {
  /**
   * Returns locations for a warehouse with stock summary per location
   */
  async listLocations(filters: LocationQueryInput) {
    const { warehouse_id, location_type, parent_location_id } = filters;
    const conditions: string[] = ['l.warehouse_id = $1', 'l.is_active = true'];
    const params: any[] = [warehouse_id];
    let idx = 2;

    if (location_type) {
      conditions.push(`l.location_type = $${idx}`);
      params.push(location_type);
      idx++;
    }

    if (parent_location_id) {
      conditions.push(`l.parent_location_id = $${idx}`);
      params.push(parent_location_id);
      idx++;
    }

    const sql = `
      SELECT 
        l.*,
        COALESCE(sq.total_products, 0)::integer AS total_products,
        COALESCE(sq.total_qty, 0)::numeric AS total_qty
      FROM locations l
      LEFT JOIN (
        SELECT 
          location_id,
          COUNT(DISTINCT product_id) AS total_products,
          SUM(qty_available) AS total_qty
        FROM view_stock_quants
        GROUP BY location_id
      ) sq ON sq.location_id = l.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY l.name ASC;
    `;

    try {
      const res = await query(sql, params);
      return res.rows;
    } catch (err: any) {
      if (err.code === '42P01') return [];
      throw err;
    }
  }

  /**
   * Get location detail + children locations + stock summary
   */
  async getLocationById(id: string) {
    try {
      const locSql = `
        SELECT 
          l.*,
          w.name AS warehouse_name,
          COALESCE(sq.total_products, 0)::integer AS total_products,
          COALESCE(sq.total_qty, 0)::numeric AS total_qty
        FROM locations l
        LEFT JOIN warehouses w ON w.id = l.warehouse_id
        LEFT JOIN (
          SELECT 
            location_id,
            COUNT(DISTINCT product_id) AS total_products,
            SUM(qty_available) AS total_qty
          FROM view_stock_quants
          GROUP BY location_id
        ) sq ON sq.location_id = l.id
        WHERE l.id = $1 AND l.is_active = true;
      `;
      const locRes = await query(locSql, [id]);

      if (locRes.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Location not found or inactive');
      }

      const location = locRes.rows[0];

      // Fetch direct children
      const childrenSql = `
        SELECT id, name, barcode, location_type, is_active
        FROM locations
        WHERE parent_location_id = $1 AND is_active = true
        ORDER BY name ASC;
      `;
      const childrenRes = await query(childrenSql, [id]);
      location.children = childrenRes.rows;

      return location;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.code === '42P01') throw new AppError(404, 'NOT_FOUND', 'Location not found');
      throw err;
    }
  }

  /**
   * Create location with validation
   */
  async createLocation(input: LocationCreateInput) {
    // 1. Verify warehouse exists
    const whRes = await query(`SELECT id FROM warehouses WHERE id = $1 AND is_active = true`, [input.warehouse_id]);
    if (whRes.rows.length === 0) {
      throw new AppError(400, 'INVALID_WAREHOUSE', 'Target warehouse does not exist or is inactive');
    }

    // 2. If parent location is given, verify it belongs to the SAME warehouse
    if (input.parent_location_id) {
      const parentRes = await query(
        `SELECT id, warehouse_id FROM locations WHERE id = $1 AND is_active = true`,
        [input.parent_location_id]
      );
      if (parentRes.rows.length === 0) {
        throw new AppError(400, 'INVALID_PARENT_LOCATION', 'Parent location does not exist');
      }
      if (parentRes.rows[0].warehouse_id !== input.warehouse_id) {
        throw new AppError(400, 'CROSS_WAREHOUSE_PARENT', 'Parent location must belong to the exact same warehouse');
      }
    }

    // 3. Verify barcode uniqueness within warehouse
    if (input.barcode) {
      const barcodeRes = await query(
        `SELECT id FROM locations WHERE warehouse_id = $1 AND barcode = $2 AND is_active = true`,
        [input.warehouse_id, input.barcode]
      );
      if (barcodeRes.rows.length > 0) {
        throw new AppError(409, 'DUPLICATE_BARCODE', 'Barcode already exists in this warehouse');
      }
    }

    const insertSql = `
      INSERT INTO locations (warehouse_id, parent_location_id, name, barcode, location_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const res = await query(insertSql, [
      input.warehouse_id,
      input.parent_location_id || null,
      input.name,
      input.barcode || null,
      input.location_type || 'internal',
    ]);

    return res.rows[0];
  }

  /**
   * Update location (cannot change location_type)
   */
  async updateLocation(id: string, input: LocationUpdateInput) {
    const locRes = await query(`SELECT * FROM locations WHERE id = $1 AND is_active = true`, [id]);
    if (locRes.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Location not found or inactive');
    }
    const currentLocation = locRes.rows[0];

    // Parent location validation
    if (input.parent_location_id) {
      if (input.parent_location_id === id) {
        throw new AppError(400, 'CIRCULAR_REFERENCE', 'Location cannot be its own parent');
      }
      const parentRes = await query(
        `SELECT id, warehouse_id FROM locations WHERE id = $1 AND is_active = true`,
        [input.parent_location_id]
      );
      if (parentRes.rows.length === 0 || parentRes.rows[0].warehouse_id !== currentLocation.warehouse_id) {
        throw new AppError(400, 'INVALID_PARENT_LOCATION', 'Parent location must belong to the same warehouse');
      }
    }

    // Barcode check
    if (input.barcode) {
      const barRes = await query(
        `SELECT id FROM locations WHERE warehouse_id = $1 AND barcode = $2 AND id != $3 AND is_active = true`,
        [currentLocation.warehouse_id, input.barcode, id]
      );
      if (barRes.rows.length > 0) {
        throw new AppError(409, 'DUPLICATE_BARCODE', 'Barcode already in use in this warehouse');
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

    if (fields.length === 0) return currentLocation;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const updateSql = `
      UPDATE locations
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const res = await query(updateSql, values);
    return res.rows[0];
  }
}

export const locationService = new LocationService();
