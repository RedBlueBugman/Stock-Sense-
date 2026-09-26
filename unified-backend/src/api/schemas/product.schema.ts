import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  sku: z.string().min(1, 'SKU is required').max(100),
  barcode: z.string().max(100).optional().nullable(),
  category_id: z.string().uuid('Invalid category ID format').optional().nullable(),
  unit_of_measure: z.string().min(1, 'Unit of measure is required').default('pcs'),
  tracking_type: z.enum(['none', 'lot', 'serial']).default('none'),
  reorder_min: z.number().int().min(0, 'Reorder min must be >= 0').default(0),
  reorder_max: z.number().int().min(0, 'Reorder max must be >= 0').default(0),
  reorder_qty: z.number().int().min(0, 'Reorder qty must be >= 0').default(0),
  image_url: z.string().url('Invalid image URL format').optional().nullable(),
  initial_stock: z
    .object({
      warehouse_id: z.string().uuid(),
      location_id: z.string().uuid(),
      qty: z.number().positive('Initial stock quantity must be positive'),
    })
    .optional(),
});

export const productUpdateSchema = productCreateSchema
  .omit({ initial_stock: true })
  .partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit cannot exceed 100').default(20),
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid().optional(),
  stock_status: z.enum(['in_stock', 'low', 'out']).optional(),
  sort_by: z.enum(['name', 'sku', 'stock_qty', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const productBulkCreateSchema = z.object({
  products: z
    .array(productCreateSchema)
    .min(1, 'Bulk array cannot be empty')
    .max(500, 'Bulk insert exceeds maximum limit of 500 products per request'),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid('Product ID must be a valid UUID'),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
