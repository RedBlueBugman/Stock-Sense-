import { z } from 'zod';

export const partnerTypeEnum = z.enum(['supplier', 'customer', 'both']);

export const partnerCreateSchema = z.object({
  name: z.string().min(1, 'Partner name is required').max(150),
  type: partnerTypeEnum.default('both'),
  email: z.string().email('Invalid email address format').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const partnerUpdateSchema = partnerCreateSchema.partial();

export const partnerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit cannot exceed 100').default(20),
  search: z.string().optional(),
  type: partnerTypeEnum.optional(),
  sort_by: z.enum(['name', 'created_at', 'type']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const partnerIdParamSchema = z.object({
  id: z.string().uuid('Partner ID must be a valid UUID'),
});

export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>;
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>;
export type PartnerQueryInput = z.infer<typeof partnerQuerySchema>;
