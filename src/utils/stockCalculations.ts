import { Product } from '../types/inventory';

export interface StockCalculationResult {
  current: number;
  newStock: number;
  change: number;
  isOverstock: boolean;
  isRestockedFromZero: boolean;
  isLowStockResolved: boolean;
}

/**
 * Calculates new stock projection when receiving incoming units
 */
export function calculateNewStock(product: Product, quantity: number): StockCalculationResult {
  const current = product.current_stock;
  const newStock = Math.max(0, current + quantity);
  const change = quantity;
  const isOverstock = Boolean(product.max_stock && newStock > product.max_stock);
  const isRestockedFromZero = current === 0 && newStock > 0;
  const isLowStockResolved = current < product.min_stock && newStock >= product.min_stock;

  return {
    current,
    newStock,
    change,
    isOverstock,
    isRestockedFromZero,
    isLowStockResolved,
  };
}
