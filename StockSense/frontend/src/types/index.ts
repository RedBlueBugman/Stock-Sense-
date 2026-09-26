export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  unitOfMeasure: string;
  reorderMin: number;
  reorderMax: number;
  reorderQty: number;
  isActive: boolean;
  onHand?: number;
}

export interface Location {
  id: string;
  warehouseId: string;
  name: string;
  barcode?: string;
  locationType: "internal" | "vendor" | "customer" | "loss" | "production" | string;
  warehouse?: Warehouse;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  locations?: Location[];
}

export interface Partner {
  id: string;
  name: string;
  type: "supplier" | "customer" | "both" | string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface StockMove {
  id: string;
  operationId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitOfMeasure: string;
  sourceLocationId: string;
  destinationLocationId: string;
  status: string;
  createdAt: string;
}

export interface StockOperation {
  id: string;
  referenceCode: string;
  operationType: "receipt" | "delivery" | "internal" | "adjustment" | string;
  status: "draft" | "waiting" | "ready" | "done" | "cancelled" | string;
  sourceLocationId: string;
  destinationLocationId: string;
  sourceLocation?: Location;
  destinationLocation?: Location;
  partnerId?: string;
  partner?: Partner;
  notes?: string;
  completedDate?: string;
  createdAt: string;
  moves?: StockMove[];
}

export interface DashboardKPIs {
  total_products: number;
  pending_receipts: number;
  pending_deliveries: number;
  scheduled_transfers: number;
  unread_alerts: number;
}

export interface StockQuant {
  product: Product;
  location: Location;
  onHand: number;
}