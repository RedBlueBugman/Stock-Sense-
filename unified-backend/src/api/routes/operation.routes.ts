import { Router } from 'express';
import { operationController } from '../controllers/operation.controller';
import { requireRole } from '../../core/middleware/rbac';

const router = Router();

// List all operations with filters
router.get('/', requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']), operationController.list);

// Get single operation with moves
router.get('/:id', requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']), operationController.getById);

// Core Operations (the 4 pillars of the ledger)
router.post('/receipt', requireRole(['INVENTORY_MANAGER', 'ADMIN']), operationController.createReceipt);
router.post('/delivery', requireRole(['INVENTORY_MANAGER', 'ADMIN']), operationController.createDelivery);
router.post('/transfer', requireRole(['INVENTORY_MANAGER', 'ADMIN']), operationController.createTransfer);
router.post('/adjustment', requireRole(['INVENTORY_MANAGER', 'ADMIN']), operationController.createAdjustment);

export default router;
