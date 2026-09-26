import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { getStockQuants, getDashboardKpis } from '../../core/services/stock-calculator';
import { sendSuccess } from '../../shared/response';
import { requireRole } from '../../core/middleware/rbac';

const router = Router();

router.get('/quants/:productId', requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quants = await getStockQuants(req.params.productId, req.query.warehouse_id as string);
    return sendSuccess(res, quants);
  } catch (err) { return next(err); }
});

router.get('/kpis', requireRole(['VIEWER', 'INVENTORY_MANAGER', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kpis = await getDashboardKpis(req.query.warehouse_id as string);
    return sendSuccess(res, kpis);
  } catch (err) { return next(err); }
});

export default router;
