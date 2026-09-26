import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  warehouseCreateSchema,
  warehouseUpdateSchema,
  warehouseIdParamSchema,
} from '../schemas/warehouse.schema';

const router = Router();

// GET /api/v1/warehouses - List all active (filtered by user access)
router.get('/', requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']), warehouseController.list);

// POST /api/v1/warehouses - Create warehouse + auto-create docks (ADMIN)
router.post(
  '/',
  requireRole(['ADMIN']),
  validateRequest({ body: warehouseCreateSchema }),
  warehouseController.create
);

// PATCH /api/v1/warehouses/:id - Update warehouse (ADMIN)
router.patch(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: warehouseIdParamSchema, body: warehouseUpdateSchema }),
  warehouseController.update
);

export default router;
