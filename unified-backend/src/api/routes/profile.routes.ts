import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  profileUpdateSchema,
  changePasswordSchema,
} from '../schemas/user.schema';

const router = Router();

// All profile routes require authentication
router.use(requireRole(['ADMIN', 'INVENTORY_MANAGER', 'VIEWER']));

// GET /api/v1/profile - Current user profile
router.get('/', profileController.getProfile);

// PATCH /api/v1/profile - Update name/phone/notifications
router.patch('/', validateRequest({ body: profileUpdateSchema }), profileController.updateProfile);

// POST /api/v1/profile/change-password - Change password & invalidate other sessions
router.post(
  '/change-password',
  validateRequest({ body: changePasswordSchema }),
  profileController.changePassword
);

export default router;
