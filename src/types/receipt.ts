import { Product } from './inventory';

export interface ReceiptItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface ReceiptSummaryData {
  id: string;
  type: 'receipt';
  status: 'draft' | 'completed' | 'cancelled';
  vendor?: string;
  items: ReceiptItem[];
  total_products: number;
  total_units: number;
  timestamp: Date;
}
