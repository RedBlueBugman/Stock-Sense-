export const OPERATION_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  waiting: { label: 'Waiting', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  ready: { label: 'Ready', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-300 line-through' },
};

export const STOCK_STATUS_CONFIG = {
  in_stock: { label: 'In Stock', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  low: { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  out: { label: 'Out of Stock', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};
