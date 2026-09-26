export const Role = {
  ADMIN: "ADMIN",
  INVENTORY_MANAGER: "INVENTORY_MANAGER",
  WAREHOUSE_SUPERVISOR: "WAREHOUSE_SUPERVISOR",
  WAREHOUSE_WORKER: "WAREHOUSE_WORKER",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
export const ROLES = Object.values(Role) as [string, ...string[]];

export const LocationType = {
  internal: "internal",
  vendor: "vendor",
  customer: "customer",
  loss: "loss",
  production: "production",
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];
export const LOCATION_TYPES = Object.values(LocationType) as [string, ...string[]];

export const OperationType = {
  receipt: "receipt",
  delivery: "delivery",
  internal: "internal",
  adjustment: "adjustment",
} as const;

export type OperationType = (typeof OperationType)[keyof typeof OperationType];
export const OPERATION_TYPES = Object.values(OperationType) as [string, ...string[]];

export const OperationStatus = {
  draft: "draft",
  waiting: "waiting",
  ready: "ready",
  done: "done",
  cancelled: "cancelled",
} as const;

export type OperationStatus = (typeof OperationStatus)[keyof typeof OperationStatus];
export const OPERATION_STATUSES = Object.values(OperationStatus) as [string, ...string[]];

export const MoveStatus = {
  draft: "draft",
  reserved: "reserved",
  done: "done",
  cancelled: "cancelled",
} as const;

export type MoveStatus = (typeof MoveStatus)[keyof typeof MoveStatus];

export const PartnerType = {
  supplier: "supplier",
  customer: "customer",
  both: "both",
} as const;

export type PartnerType = (typeof PartnerType)[keyof typeof PartnerType];

export const AlertType = {
  low_stock: "low_stock",
  out_of_stock: "out_of_stock",
  expiry_warning: "expiry_warning",
  reorder_triggered: "reorder_triggered",
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];

export const AlertPriority = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
} as const;

export type AlertPriority = (typeof AlertPriority)[keyof typeof AlertPriority];