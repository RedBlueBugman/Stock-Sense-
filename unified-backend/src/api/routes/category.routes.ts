import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryQuerySchema,
  categoryIdParamSchema,
} from '../schemas/category.schema';

const router = Router();

// GET /api/v1/categories - Flat list with parent references + optional counts
router.get(
  '/',
  validateRequest({ query: categoryQuerySchema }),
  categoryController.list
);

// GET /api/v1/categories/:id - Detail + direct children + product count
router.get(
  '/:id',
  validateRequest({ params: categoryIdParamSchema }),
  categoryController.getById
);

// POST /api/v1/categories - Create category (INVENTORY_MANAGER)
router.post(
  '/',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ body: categoryCreateSchema }),
  categoryController.create
);

// PATCH /api/v1/categories/:id - Update category with circular check (INVENTORY_MANAGER)
router.patch(
  '/:id',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ params: categoryIdParamSchema, body: categoryUpdateSchema }),
  categoryController.update
);

// DELETE /api/v1/categories/:id - Delete check (0 products only) (ADMIN)
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: categoryIdParamSchema }),
  categoryController.delete
);

export default router;
