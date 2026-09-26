import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';
import { sendSuccess } from '../../shared/response';

export class SearchController {
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      const results = await searchService.globalSearch(q);
      return sendSuccess(res, results);
    } catch (err) {
      return next(err);
    }
  }

  async getUnitsOfMeasure(req: Request, res: Response, next: NextFunction) {
    try {
      const uoms = await searchService.getUnitsOfMeasure();
      return sendSuccess(res, uoms);
    } catch (err) {
      return next(err);
    }
  }

  async getOperationStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      const statuses = await searchService.getOperationStatuses();
      return sendSuccess(res, statuses);
    } catch (err) {
      return next(err);
    }
  }

  async getLocationTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await searchService.getLocationTypes();
      return sendSuccess(res, types);
    } catch (err) {
      return next(err);
    }
  }
}

export const searchController = new SearchController();
