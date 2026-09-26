import { z } from 'zod';

export const warehouseCreateSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(100),
  code: z.string().min(1, 'Warehouse code is required (e.g. WH-01)').max(20),
  address: z.string().max(255).optional().nullable(),
});

export const warehouseUpdateSchema = warehouseCreateSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const warehouseIdParamSchema = z.object({
  id: z.string().uuid('Warehouse ID must be a valid UUID'),
});

export type WarehouseCreateInput = z.infer<typeof warehouseCreateSchema>;
export type WarehouseUpdateInput = z.infer<typeof warehouseUpdateSchema>;
