import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/location.service';
import { sendSuccess } from '../../shared/response';

export class LocationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as any;
      const locations = await locationService.listLocations(filters);
      return sendSuccess(res, locations);
    } catch (err) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const location = await locationService.getLocationById(id);
      return sendSuccess(res, location);
    } catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.createLocation(req.body);
      return sendSuccess(res, location, undefined, 201);
    } catch (err) {
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const location = await locationService.updateLocation(id, req.body);
      return sendSuccess(res, location);
    } catch (err) {
      return next(err);
    }
  }
}

export const locationController = new LocationController();
