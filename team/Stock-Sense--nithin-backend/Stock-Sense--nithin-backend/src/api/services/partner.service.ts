import { query } from '../../shared/db';
import { AppError } from '../../shared/errorHandler';
import { PartnerCreateInput, PartnerUpdateInput, PartnerQueryInput } from '../schemas/partner.schema';

export class PartnerService {
  /**
   * List paginated partners with search and type filters
   */
  async listPartners(filters: PartnerQueryInput) {
    const { page, limit, search, type, sort_by, sort_order } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['is_active = true'];
    const params: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`name ILIKE $${idx}`);
      params.push(`%${search}%`);
      idx++;
    }

    if (type) {
      conditions.push(`(type = $${idx} OR type = 'both')`);
      params.push(type);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM partners ${whereClause};`;
    const dataSql = `
      SELECT * FROM partners
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order.toUpperCase()}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    params.push(limit, offset);

    try {
      const [countRes, dataRes] = await Promise.all([
        query(countSql, params.slice(0, idx - 1)),
        query(dataSql, params),
      ]);

      const total = parseInt(countRes.rows[0]?.total || '0', 10);
      return { partners: dataRes.rows, total };
    } catch (err: any) {
      if (err.code === '42P01') return { partners: [], total: 0 };
      throw err;
    }
  }

  /**
   * Get partner detail + summary of operations (receipts, deliveries, last operation date)
   */
  async getPartnerById(id: string) {
    try {
      const partnerSql = `SELECT * FROM partners WHERE id = $1 AND is_active = true;`;
      const partnerRes = await query(partnerSql, [id]);

      if (partnerRes.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Partner not found or inactive');
      }

      const partner = partnerRes.rows[0];

      // Aggregate operations summary from Member 2's stock_operations table
      const opsSummarySql = `
        SELECT 
          COUNT(CASE WHEN operation_type = 'receipt' THEN 1 END)::integer AS total_receipts,
          COUNT(CASE WHEN operation_type = 'delivery' THEN 1 END)::integer AS total_deliveries,
          MAX(created_at) AS last_operation_date
        FROM stock_operations
        WHERE partner_id = $1;
      `;

      const summaryRes = await query(opsSummarySql, [id]).catch(() => ({
        rows: [{ total_receipts: 0, total_deliveries: 0, last_operation_date: null }],
      }));

      partner.operations_summary = summaryRes.rows[0];
      return partner;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.code === '42P01') throw new AppError(404, 'NOT_FOUND', 'Partner not found');
      throw err;
    }
  }

  /**
   * Create partner
   */
  async createPartner(input: PartnerCreateInput) {
    const insertSql = `
      INSERT INTO partners (name, type, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const res = await query(insertSql, [
      input.name,
      input.type || 'both',
      input.email || null,
      input.phone || null,
      input.address || null,
    ]);

    return res.rows[0];
  }

  /**
   * Update partner details
   */
  async updatePartner(id: string, input: PartnerUpdateInput) {
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
      return this.getPartnerById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE partners
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND is_active = true
      RETURNING *;
    `;

    const res = await query(sql, values);
    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Partner not found or inactive');
    }

    return res.rows[0];
  }

  /**
   * Soft delete partner.
   * Safety check: Cannot delete if partner has active operations (status != done and != cancelled).
   */
  async deletePartner(id: string) {
    try {
      const activeOpsSql = `
        SELECT COUNT(*)::integer AS active_count
        FROM stock_operations
        WHERE partner_id = $1 AND status NOT IN ('done', 'cancelled');
      `;
      const opsRes = await query(activeOpsSql, [id]);
      const activeCount = parseInt(opsRes.rows[0]?.active_count || '0', 10);

      if (activeCount > 0) {
        throw new AppError(
          400,
          'ACTIVE_OPERATIONS_EXIST',
          `Cannot delete partner with ${activeCount} active operation(s). Complete or cancel them first.`
        );
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;
    }

    const res = await query(
      `UPDATE partners SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Partner not found');
    }

    return { message: 'Partner successfully deactivated' };
  }
}

export const partnerService = new PartnerService();
