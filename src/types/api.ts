export type UserRole = 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_SUPERVISOR' | 'WAREHOUSE_WORKER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  assignedWarehouses?: Warehouse[];
  assigned_warehouse_ids?: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  parent_category_id?: string | null;
  parentCategoryId?: string | null;
  productCount?: number;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  category_id?: string | null;
  category_name?: string;
  description?: string;
  unit_price: number;
  unitOfMeasure?: string;
  unit_of_measure?: string;
  trackingType?: 'none' | 'lot' | 'serial';
  tracking_type?: 'none' | 'lot' | 'serial';
  barcode?: string | null;
  quantity?: number;
  stock_qty?: number;
  stockQty?: number;
  image_url?: string | null;
  imageUrl?: string | null;
  reorder_min?: number;
  reorderMin?: number;
  reorder_max?: number;
  reorderMax?: number;
  reorder_qty?: number;
  reorderQty?: number;
  is_active?: boolean;
  isActive?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  location?: string;
  address?: string;
  capacity?: number;
  current_stock?: number;
  isActive?: boolean;
  is_active?: boolean;
}

export interface Location {
  id: string;
  warehouse_id?: string;
  warehouseId?: string;
  parent_location_id?: string | null;
  parentLocationId?: string | null;
  name: string;
  barcode?: string | null;
  location_type?: 'internal' | 'vendor' | 'customer' | 'inventory_loss' | 'transit' | string;
  locationType?: string;
  is_active?: boolean;
  isActive?: boolean;
  children?: Location[];
  total_products?: number;
  total_qty?: number;
}

export interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'customer' | 'both';
  email?: string;
  phone?: string;
  address?: string;
  operations_summary?: {
    total_receipts: number;
    total_deliveries: number;
    last_operation_date: string | null;
  };
}

export interface StockMove {
  id: string;
  operation_id?: string;
  operationId?: string;
  product_name?: string;
  product?: Product;
  quantity: number;
  unit_of_measure?: string;
  unitOfMeasure?: string;
  source_location_name?: string;
  dest_location_name?: string;
  status?: string;
  created_at?: string;
}

export interface StockOperation {
  id: string;
  reference?: string;
  referenceCode?: string;
  operation_type?: 'receipt' | 'delivery' | 'internal' | 'adjustment';
  operationType?: 'receipt' | 'delivery' | 'internal' | 'adjustment';
  type?: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled' | 'PENDING' | 'VALIDATED' | 'CANCELLED';
  source_location_name?: string;
  dest_location_name?: string;
  partner_name?: string;
  partner?: Partner | null;
  scheduledDate?: string;
  created_at?: string;
  createdAt?: string;
  items_count?: number;
  total_quantity?: number;
  notes?: string;
  moves?: StockMove[];
}

export interface DashboardKPIs {
  totalProducts?: number;
  total_products?: number;
  total_stock_value?: number;
  lowStockCount?: number;
  low_stock_count?: number;
  outOfStockCount?: number;
  out_of_stock_count?: number;
  pendingReceipts?: number;
  pending_receipts?: number;
  pendingDeliveries?: number;
  pending_deliveries?: number;
  scheduledTransfers?: number;
  scheduled_transfers?: number;
  todayMovements?: number;
  today_movements?: number;
}

export interface MovementTrend {
  date: string;
  receipts: number;
  deliveries: number;
  transfers: number;
  adjustments: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
