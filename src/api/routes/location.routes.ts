import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  locationCreateSchema,
  locationUpdateSchema,
  locationQuerySchema,
  locationIdParamSchema,
} from '../schemas/location.schema';

const router = Router();

// GET /api/v1/locations?warehouse_id=... - List locations with stock summaries
router.get(
  '/',
  validateRequest({ query: locationQuerySchema }),
  locationController.list
);

// GET /api/v1/locations/:id - Location detail + children + stock summary
router.get(
  '/:id',
  validateRequest({ params: locationIdParamSchema }),
  locationController.getById
);

// POST /api/v1/locations - Create location with hierarchy checks (INVENTORY_MANAGER)
router.post(
  '/',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ body: locationCreateSchema }),
  locationController.create
);

// PATCH /api/v1/locations/:id - Update location (INVENTORY_MANAGER)
router.patch(
  '/:id',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ params: locationIdParamSchema, body: locationUpdateSchema }),
  locationController.update
);

export default router;
