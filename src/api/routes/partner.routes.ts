import { Router } from 'express';
import { partnerController } from '../controllers/partner.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  partnerCreateSchema,
  partnerUpdateSchema,
  partnerQuerySchema,
  partnerIdParamSchema,
} from '../schemas/partner.schema';

const router = Router();

// GET /api/v1/partners - Paginated list with type & name search
router.get(
  '/',
  validateRequest({ query: partnerQuerySchema }),
  partnerController.list
);

// GET /api/v1/partners/:id - Partner detail + operation stats
router.get(
  '/:id',
  validateRequest({ params: partnerIdParamSchema }),
  partnerController.getById
);

// POST /api/v1/partners - Create partner (INVENTORY_MANAGER)
router.post(
  '/',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ body: partnerCreateSchema }),
  partnerController.create
);

// PATCH /api/v1/partners/:id - Update partner (INVENTORY_MANAGER)
router.patch(
  '/:id',
  requireRole(['INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ params: partnerIdParamSchema, body: partnerUpdateSchema }),
  partnerController.update
);

// DELETE /api/v1/partners/:id - Soft delete with active ops check (ADMIN)
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: partnerIdParamSchema }),
  partnerController.delete
);

export default router;
