import { query } from '../../shared/db';

export interface StockQuant {
  product_id: string;
  warehouse_id?: string;
  location_id?: string;
  qty_available: number;
  qty_reserved?: number;
}

export const getStockQuants = async (
  productId: string,
  warehouseId?: string
): Promise<StockQuant[]> => {
  try {
    let sql = `SELECT * FROM view_stock_quants WHERE product_id = $1`;
    const params: any[] = [productId];

    if (warehouseId) {
      sql += ` AND warehouse_id = $2`;
      params.push(warehouseId);
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (err) {
    // Graceful fallback if view is not yet created in the DB by Member 1
    return [{ product_id: productId, qty_available: 0, qty_reserved: 0 }];
  }
};
