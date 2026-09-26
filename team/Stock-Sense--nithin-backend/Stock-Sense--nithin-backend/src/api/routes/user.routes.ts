import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  userQuerySchema,
  userUpdateSchema,
  userIdParamSchema,
} from '../schemas/user.schema';

const router = Router();

// GET /api/v1/users - List users (ADMIN only, password_hash stripped)
router.get(
  '/',
  requireRole(['ADMIN']),
  validateRequest({ query: userQuerySchema }),
  userController.list
);

// GET /api/v1/users/:id - User detail (ADMIN or Self)
router.get(
  '/:id',
  requireRole(['ADMIN', 'INVENTORY_MANAGER', 'VIEWER']),
  validateRequest({ params: userIdParamSchema }),
  userController.getById
);

// PATCH /api/v1/users/:id - Update user role/profile (ADMIN only)
router.patch(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: userIdParamSchema, body: userUpdateSchema }),
  userController.update
);

// POST /api/v1/users/:id/deactivate - Deactivate user & purge sessions (ADMIN only)
router.post(
  '/:id/deactivate',
  requireRole(['ADMIN']),
  validateRequest({ params: userIdParamSchema }),
  userController.deactivate
);

export default router;
