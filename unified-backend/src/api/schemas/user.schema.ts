import { z } from 'zod';

export const userRoleEnum = z.enum(['ADMIN', 'INVENTORY_MANAGER', 'VIEWER']);

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: userRoleEnum.optional(),
  warehouse_id: z.string().uuid().optional(),
  is_active: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  search: z.string().optional(),
  sort_by: z.enum(['name', 'email', 'role', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional().nullable(),
  role: userRoleEnum.optional(),
  assigned_warehouse_ids: z.array(z.string().uuid()).optional(),
  is_active: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(50).optional().nullable(),
  notification_preferences: z.record(z.string(), z.any()).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const settingsUpdateSchema = z.object({
  settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});
