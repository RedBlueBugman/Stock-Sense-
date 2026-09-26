import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { validateRequest } from '../middleware/validate';
import { requireRole } from '../../core/middleware/rbac';
import {
  dashboardKpiQuerySchema,
  recentOperationsQuerySchema,
  lowStockQuerySchema,
  movementTrendQuerySchema,
} from '../schemas/dashboard.schema';

const router = Router();

// GET /api/v1/dashboard/kpis - 30s Redis cached metrics (VIEWER+)
router.get(
  '/kpis',
  requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ query: dashboardKpiQuerySchema }),
  dashboardController.getKpis
);

// GET /api/v1/dashboard/recent-operations - Latest 10 stock operations
router.get(
  '/recent-operations',
  requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ query: recentOperationsQuerySchema }),
  dashboardController.getRecentOperations
);

// GET /api/v1/dashboard/low-stock - Products below reorder threshold
router.get(
  '/low-stock',
  requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ query: lowStockQuerySchema }),
  dashboardController.getLowStock
);

// GET /api/v1/dashboard/movement-trend - Movement trends by date for charts
router.get(
  '/movement-trend',
  requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']),
  validateRequest({ query: movementTrendQuerySchema }),
  dashboardController.getMovementTrend
);

export default router;
