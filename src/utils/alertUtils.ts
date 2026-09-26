import { Product, AlertType, AlertItem } from '../types/inventory';

/**
 * Evaluates stock metrics and produces an alert object if applicable.
 */
export function triggerStockAlert(product: Product): Omit<AlertItem, 'id' | 'timestamp' | 'isRead'> | null {
  if (product.current_stock === 0) {
    return {
      type: 'critical',
      title: 'OUT OF STOCK',
      message: `${product.name} is completely out of stock in warehouse.`,
      productName: product.name,
    };
  }

  if (product.current_stock < product.min_stock) {
    return {
      type: 'warning',
      title: 'Low Stock Warning',
      message: `${product.name}: ${product.current_stock}/${product.min_stock} units remaining (below reorder threshold).`,
      productName: product.name,
    };
  }

  if (product.max_stock && product.current_stock > product.max_stock) {
    return {
      type: 'info',
      title: 'Overstock Notice',
      message: `${product.name} (${product.current_stock} units) exceeds maximum facility capacity (${product.max_stock}).`,
      productName: product.name,
    };
  }

  // Healthy stock notification
  return {
    type: 'info',
    title: 'Stock Level Verified',
    message: `${product.name} has optimal inventory (${product.current_stock} units in stock).`,
    productName: product.name,
  };
}

/**
 * Format relative time ago string
 */
export function formatTimeAgo(date: Date | string | number): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 5) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

/**
 * Generates sample warehouse alerts for testing
 */
export const RANDOM_ALERT_TEMPLATES = [
  {
    type: 'critical' as AlertType,
    title: 'Temperature Sensor Anomaly',
    message: 'Cold Storage Zone D temperature spiked to +8.2°C.',
  },
  {
    type: 'warning' as AlertType,
    title: 'Dock 3 Shipment Delayed',
    message: 'Inbound shipment PO-8829 is delayed by 45 minutes.',
  },
  {
    type: 'info' as AlertType,
    title: 'Automated Cycle Count Complete',
    message: 'Aisle 12 cycle count completed with 99.8% precision.',
  },
  {
    type: 'critical' as AlertType,
    title: 'Forklift Telemetry Alert',
    message: 'Battery critically low on Vehicle #FL-09 (Zone B).',
  },
  {
    type: 'warning' as AlertType,
    title: 'Pending Transfer Approval',
    message: 'Transfer request #TR-402 awaiting supervisor sign-off.',
  },
];
