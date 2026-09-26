import { query } from '../../shared/db';

export async function getStockQuants(productId: string, warehouseId?: string) {
  try {
    let sql = `SELECT * FROM view_stock_quants WHERE product_id = $1`;
    const params: any[] = [productId];
    if (warehouseId) { sql += ` AND warehouse_id = $2`; params.push(warehouseId); }
    const res = await query(sql, params);
    return res.rows;
  } catch {
    return [{ product_id: productId, qty_available: 0, qty_reserved: 0 }];
  }
}

export async function getDashboardKpis(warehouseId?: string) {
  try {
    const res = await query(`SELECT * FROM view_dashboard_kpis`);
    return res.rows[0] || {};
  } catch {
    return { total_products: 0, low_stock_count: 0, out_of_stock_count: 0, pending_receipts: 0, pending_deliveries: 0, scheduled_transfers: 0 };
  }
}
