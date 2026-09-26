import { Request, Response, NextFunction } from 'express';
import { createOperation, getOperationById, listOperations } from '../../core/services/ledger';
import { sendSuccess } from '../../shared/response';

export class OperationController {
  async createReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createOperation({
        operation_type: 'receipt',
        source_location_id: req.body.source_location_id,
        destination_location_id: req.body.destination_location_id,
        partner_id: req.body.partner_id,
        notes: req.body.notes,
        items: req.body.items,
      }, req.user?.id);
      return sendSuccess(res, result, undefined, 201);
    } catch (err) { return next(err); }
  }

  async createDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createOperation({
        operation_type: 'delivery',
        source_location_id: req.body.source_location_id,
        destination_location_id: req.body.destination_location_id,
        partner_id: req.body.partner_id,
        notes: req.body.notes,
        items: req.body.items,
      }, req.user?.id);
      return sendSuccess(res, result, undefined, 201);
    } catch (err) { return next(err); }
  }

  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createOperation({
        operation_type: 'internal',
        source_location_id: req.body.source_location_id,
        destination_location_id: req.body.destination_location_id,
        notes: req.body.notes,
        items: req.body.items,
      }, req.user?.id);
      return sendSuccess(res, result, undefined, 201);
    } catch (err) { return next(err); }
  }

  async createAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createOperation({
        operation_type: 'adjustment',
        source_location_id: req.body.source_location_id,
        destination_location_id: req.body.destination_location_id,
        notes: req.body.notes || 'Stock adjustment',
        items: req.body.items,
      }, req.user?.id);
      return sendSuccess(res, result, undefined, 201);
    } catch (err) { return next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getOperationById(req.params.id);
      return sendSuccess(res, result);
    } catch (err) { return next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await listOperations({
        type: req.query.type as string,
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      });
      return sendSuccess(res, result);
    } catch (err) { return next(err); }
  }
}

export const operationController = new OperationController();
