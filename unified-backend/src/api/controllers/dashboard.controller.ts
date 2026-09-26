import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../../shared/response';

export class DashboardController {
  async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouse_id as string | undefined;
      const userWarehouses = req.user?.assigned_warehouses;
      const kpis = await dashboardService.getKpis(warehouseId, userWarehouses);
      return sendSuccess(res, kpis);
    } catch (err) {
      return next(err);
    }
  }

  async getRecentOperations(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouse_id as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const recentOps = await dashboardService.getRecentOperations(warehouseId, limit);
      return sendSuccess(res, recentOps);
    } catch (err) {
      return next(err);
    }
  }

  async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouse_id as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const lowStock = await dashboardService.getLowStockProducts(warehouseId, limit);
      return sendSuccess(res, lowStock);
    } catch (err) {
      return next(err);
    }
  }

  async getMovementTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouse_id as string | undefined;
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const trend = await dashboardService.getMovementTrend(days, warehouseId);
      return sendSuccess(res, trend);
    } catch (err) {
      return next(err);
    }
  }
}

export const dashboardController = new DashboardController();
