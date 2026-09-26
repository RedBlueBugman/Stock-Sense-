export interface Product {
  id: number;
  sku: string;
  name: string;
  barcode: string;
  category: string;
  current_stock: number;
  min_stock: number;
  emoji: string;
  unitPrice?: number;
  location?: string;
  batchNumber?: string;
  lastUpdated?: string;
}

export interface ScanRecord {
  id: string;
  product: Product;
  timestamp: Date;
  status: 'success' | 'warning' | 'alert';
  scanType: 'INBOUND' | 'OUTBOUND' | 'AUDIT';
}
