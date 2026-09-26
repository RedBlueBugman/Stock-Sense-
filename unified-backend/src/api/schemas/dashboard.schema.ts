import { z } from 'zod';

export const dashboardKpiQuerySchema = z.object({
  warehouse_id: z.string().uuid('Invalid warehouse ID format').optional(),
});

export const recentOperationsQuerySchema = z.object({
  warehouse_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const lowStockQuerySchema = z.object({
  warehouse_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const movementTrendQuerySchema = z.object({
  warehouse_id: z.string().uuid().optional(),
  days: z.coerce.number().int().min(1).max(365).default(30),
});
