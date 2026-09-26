import { query } from '../../shared/db';
import { getOrSetCache } from '../../shared/redis';

export class DashboardService {
  /**
   * Aggregated Dashboard KPIs cached in Redis for 30s
   */
  async getKpis(warehouseId?: string, userWarehouses?: string[]) {
    const cacheKey = `dashboard:kpis:${warehouseId || 'all'}:${(userWarehouses || []).sort().join(',')}`;

    return getOrSetCache(cacheKey, 30, async () => {
      try {
        // 1. Try DB view first
        let viewSql = `SELECT * FROM view_dashboard_kpis`;
        if (warehouseId) {
          viewSql += ` WHERE warehouse_id = '${warehouseId}'`;
        }
        const viewRes = await query(viewSql).catch(() => null);

        if (viewRes && viewRes.rows.length > 0) {
          return viewRes.rows[0];
        }

        // 2. Direct dynamic calculation if view is not yet created by Member 1
        const [productsRes, stockRes, opsRes, movesRes] = await Promise.all([
          // Product count
          query(`SELECT COUNT(*)::integer AS total_products FROM products WHERE is_active = true`),
          
          // Stock counts & stock value
          query(`
            SELECT 
              COALESCE(SUM(vsq.qty_available * COALESCE(p.unit_cost, 0)), 0)::numeric AS total_stock_value,
              COUNT(CASE WHEN vsq.qty_available <= p.reorder_min AND p.reorder_min > 0 THEN 1 END)::integer AS low_stock_count,
              COUNT(CASE WHEN COALESCE(vsq.qty_available, 0) = 0 THEN 1 END)::integer AS out_of_stock_count
            FROM products p
            LEFT JOIN (
              SELECT product_id, SUM(qty_available) AS qty_available
              FROM view_stock_quants
              ${warehouseId ? `WHERE warehouse_id = '${warehouseId}'` : ''}
              GROUP BY product_id
            ) vsq ON vsq.product_id = p.id
            WHERE p.is_active = true
          `).catch(() => ({ rows: [{ total_stock_value: 0, low_stock_count: 0, out_of_stock_count: 0 }] })),

          // Pending operations
          query(`
            SELECT 
              COUNT(CASE WHEN operation_type = 'receipt' AND status IN ('draft', 'waiting', 'ready') THEN 1 END)::integer AS pending_receipts,
              COUNT(CASE WHEN operation_type = 'delivery' AND status IN ('draft', 'waiting', 'ready') THEN 1 END)::integer AS pending_deliveries,
              COUNT(CASE WHEN operation_type = 'internal' AND status IN ('draft', 'waiting') THEN 1 END)::integer AS scheduled_transfers
            FROM stock_operations
            WHERE 1=1 ${warehouseId ? `AND warehouse_id = '${warehouseId}'` : ''}
          `).catch(() => ({ rows: [{ pending_receipts: 0, pending_deliveries: 0, scheduled_transfers: 0 }] })),

          // Movements today
          query(`
            SELECT COUNT(*)::integer AS today_movements
            FROM stock_moves
            WHERE created_at >= CURRENT_DATE
          `).catch(() => ({ rows: [{ today_movements: 0 }] })),
        ]);

        return {
          total_products: productsRes.rows[0]?.total_products || 0,
          total_stock_value: parseFloat(stockRes.rows[0]?.total_stock_value || '0'),
          low_stock_count: stockRes.rows[0]?.low_stock_count || 0,
          out_of_stock_count: stockRes.rows[0]?.out_of_stock_count || 0,
          pending_receipts: opsRes.rows[0]?.pending_receipts || 0,
          pending_deliveries: opsRes.rows[0]?.pending_deliveries || 0,
          scheduled_transfers: opsRes.rows[0]?.scheduled_transfers || 0,
          today_movements: movesRes.rows[0]?.today_movements || 0,
        };
      } catch (err) {
        return {
          total_products: 0,
          total_stock_value: 0,
          low_stock_count: 0,
          out_of_stock_count: 0,
          pending_receipts: 0,
          pending_deliveries: 0,
          scheduled_transfers: 0,
          today_movements: 0,
        };
      }
    });
  }

  /**
   * Recent operations read from Member 2's operations table
   */
  async getRecentOperations(warehouseId?: string, limit = 10) {
    try {
      let sql = `
        SELECT 
          o.id,
          o.operation_type,
          o.status,
          o.reference,
          o.created_at,
          p.name AS partner_name,
          src_l.name AS source_location_name,
          dest_l.name AS dest_location_name,
          COALESCE(lines.item_count, 0)::integer AS item_count
        FROM stock_operations o
        LEFT JOIN partners p ON p.id = o.partner_id
        LEFT JOIN locations src_l ON src_l.id = o.source_location_id
        LEFT JOIN locations dest_l ON dest_l.id = o.destination_location_id
        LEFT JOIN (
          SELECT operation_id, COUNT(*) AS item_count
          FROM stock_moves
          GROUP BY operation_id
        ) lines ON lines.operation_id = o.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (warehouseId) {
        sql += ` AND o.warehouse_id = $1`;
        params.push(warehouseId);
      }

      sql += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1};`;
      params.push(limit);

      const res = await query(sql, params);
      return res.rows;
    } catch (err: any) {
      if (err.code === '42P01') return [];
      throw err;
    }
  }

  /**
   * Low stock products table
   */
  async getLowStockProducts(warehouseId?: string, limit = 20) {
    try {
      const sql = `
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.reorder_min,
          p.reorder_qty,
          COALESCE(vsq.qty_available, 0)::numeric AS qty_available
        FROM products p
        INNER JOIN (
          SELECT product_id, SUM(qty_available) AS qty_available
          FROM view_stock_quants
          ${warehouseId ? `WHERE warehouse_id = '${warehouseId}'` : ''}
          GROUP BY product_id
        ) vsq ON vsq.product_id = p.id
        WHERE p.is_active = true 
          AND p.reorder_min > 0 
          AND vsq.qty_available <= p.reorder_min
        ORDER BY vsq.qty_available ASC
        LIMIT $1;
      `;
      const res = await query(sql, [limit]);
      return res.rows;
    } catch (err: any) {
      if (err.code === '42P01') return [];
      throw err;
    }
  }

  /**
   * Stock movements aggregated by date for line charts
   */
  async getMovementTrend(days = 30, warehouseId?: string) {
    try {
      const sql = `
        SELECT 
          DATE(sm.created_at) AS date,
          COUNT(CASE WHEN sm.operation_type = 'receipt' THEN 1 END)::integer AS receipts,
          COUNT(CASE WHEN sm.operation_type = 'delivery' THEN 1 END)::integer AS deliveries,
          COUNT(CASE WHEN sm.operation_type = 'internal' THEN 1 END)::integer AS transfers,
          COUNT(CASE WHEN sm.operation_type = 'adjustment' THEN 1 END)::integer AS adjustments
        FROM stock_moves sm
        WHERE sm.created_at >= NOW() - ($1 || ' days')::INTERVAL
        ${warehouseId ? `AND sm.warehouse_id = '${warehouseId}'` : ''}
        GROUP BY DATE(sm.created_at)
        ORDER BY DATE(sm.created_at) ASC;
      `;
      const res = await query(sql, [days]);
      return res.rows;
    } catch (err: any) {
      if (err.code === '42P01') return [];
      throw err;
    }
  }
}

export const dashboardService = new DashboardService();
