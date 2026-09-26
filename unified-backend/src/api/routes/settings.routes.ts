import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import { settingsUpdateSchema } from '../schemas/user.schema';

const router = Router();

// GET /api/v1/settings - System settings (ADMIN only)
router.get('/', requireRole(['ADMIN']), settingsController.getSettings);

// PATCH /api/v1/settings - Update settings (ADMIN only)
router.patch(
  '/',
  requireRole(['ADMIN']),
  validateRequest({ body: settingsUpdateSchema }),
  settingsController.updateSettings
);

export default router;
