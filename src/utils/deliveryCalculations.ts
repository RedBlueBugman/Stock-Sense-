import { Product } from '../types/inventory';
import { DeliveryStockStatus, DeliveryItem } from '../types/delivery';

export interface RemainingStockResult {
  available: number;
  remaining: number;
  status: DeliveryStockStatus;
  canShip: boolean;
  errorDetail?: string;
}

/**
 * Calculates remaining stock and determines real-time validation status for outgoing shipments
 */
export function calculateRemainingStock(product: Product, quantity: number): RemainingStockResult {
  const available = product.current_stock;
  const remaining = available - quantity;

  if (quantity <= 0) {
    return {
      available,
      remaining: available,
      status: 'insufficient',
      canShip: false,
      errorDetail: `Quantity must be at least 1 unit`,
    };
  }

  if (quantity > available) {
    return {
      available,
      remaining,
      status: 'insufficient',
      canShip: false,
      errorDetail: `Only ${available} available for ${product.name} (Need ${quantity})`,
    };
  }

  if (remaining === 0) {
    return {
      available,
      remaining: 0,
      status: 'critical', // Will be completely out of stock
      canShip: true,
    };
  }

  if (remaining < product.min_stock) {
    return {
      available,
      remaining,
      status: 'warning', // Below minimum threshold
      canShip: true,
    };
  }

  return {
    available,
    remaining,
    status: 'ok',
    canShip: true,
  };
}

/**
 * Validates entire delivery order prior to shipping against latest warehouse stock
 */
export function validateDeliveryOrder(
  items: DeliveryItem[],
  liveProducts?: Product[]
): {
  isValid: boolean;
  errors: Array<{ product: Product; requested: number; available: number }>;
} {
  const errors: Array<{ product: Product; requested: number; available: number }> = [];

  if (items.length === 0) {
    return { isValid: false, errors: [] };
  }

  for (const item of items) {
    const liveProd = liveProducts?.find((p) => p.id === item.product.id) || item.product;
    if (item.quantity > liveProd.current_stock || item.quantity <= 0) {
      errors.push({
        product: liveProd,
        requested: item.quantity,
        available: liveProd.current_stock,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

