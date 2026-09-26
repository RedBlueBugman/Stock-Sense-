import { z } from 'zod';

export const locationCreateSchema = z.object({
  warehouse_id: z.string().uuid('warehouse_id must be a valid UUID'),
  parent_location_id: z.string().uuid('parent_location_id must be a valid UUID').optional().nullable(),
  name: z.string().min(1, 'Location name is required').max(100),
  barcode: z.string().max(100).optional().nullable(),
  location_type: z.literal('internal', {
    message: "User created physical locations must have location_type = 'internal'",
  }).default('internal'),
});

export const locationUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  barcode: z.string().max(100).optional().nullable(),
  parent_location_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const locationQuerySchema = z.object({
  warehouse_id: z.string().uuid('warehouse_id is required as a query parameter'),
  location_type: z.string().optional(),
  parent_location_id: z.string().uuid().optional(),
});

export const locationIdParamSchema = z.object({
  id: z.string().uuid('Location ID must be a valid UUID'),
});

export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
export type LocationQueryInput = z.infer<typeof locationQuerySchema>;
