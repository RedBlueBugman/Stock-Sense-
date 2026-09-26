import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  parent_category_id: z.string().uuid('Invalid parent category ID').optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryQuerySchema = z.object({
  include_counts: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Category ID must be a valid UUID'),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
