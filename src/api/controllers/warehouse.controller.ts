import { Request, Response, NextFunction } from 'express';
import { warehouseService } from '../services/warehouse.service';
import { sendSuccess } from '../../shared/response';

export class WarehouseController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouses = await warehouseService.listWarehouses(req.user);
      return sendSuccess(res, warehouses);
    } catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'system';
      const warehouse = await warehouseService.createWarehouse(req.body, userId);
      return sendSuccess(res, warehouse, undefined, 201);
    } catch (err) {
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const warehouse = await warehouseService.updateWarehouse(id, req.body);
      return sendSuccess(res, warehouse);
    } catch (err) {
      return next(err);
    }
  }
}

export const warehouseController = new WarehouseController();
