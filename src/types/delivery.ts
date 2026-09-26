import { Product } from './inventory';

export interface DeliveryItem {
  id: string;
  product: Product;
  quantity: number;
}

export type DeliveryStockStatus = 'ok' | 'warning' | 'critical' | 'insufficient';

export interface DeliverySummaryData {
  id: string;
  type: 'delivery';
  status: 'draft' | 'shipped' | 'cancelled';
  customer?: string;
  shippingAddress?: string;
  deliveryDate?: string;
  items: DeliveryItem[];
  total_products: number;
  total_units: number;
  timestamp: Date;
}
