import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  productCreateSchema,
  productUpdateSchema,
  productQuerySchema,
  productBulkCreateSchema,
  productIdParamSchema,
} from '../schemas/product.schema';

const router = Router();

// GET /api/v1/products - List with pagination, filters, sorting
router.get(
  '/',
  validateRequest({ query: productQuerySchema }),
  productController.list
);

// POST /api/v1/products/bulk - Bulk import (Max 500 items, wrapped in transaction)
router.post(
  '/bulk',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ body: productBulkCreateSchema }),
  productController.bulkCreate
);

// GET /api/v1/products/:id - Single Product detail + stock per location
router.get(
  '/:id',
  validateRequest({ params: productIdParamSchema }),
  productController.getById
);

// POST /api/v1/products - Create Product + initial stock trigger
router.post(
  '/',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ body: productCreateSchema }),
  productController.create
);

// PATCH /api/v1/products/:id - Update product
router.patch(
  '/:id',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ params: productIdParamSchema, body: productUpdateSchema }),
  productController.update
);

// DELETE /api/v1/products/:id - Soft Delete (checks active stock)
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: productIdParamSchema }),
  productController.delete
);

export default router;
