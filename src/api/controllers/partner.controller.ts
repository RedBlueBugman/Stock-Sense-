import { Request, Response, NextFunction } from 'express';
import { partnerService } from '../services/partner.service';
import { sendSuccess, sendPaginated } from '../../shared/response';

export class PartnerController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as any;
      const { partners, total } = await partnerService.listPartners(filters);
      return sendPaginated(res, partners, total, filters.page, filters.limit);
    } catch (err) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const partner = await partnerService.getPartnerById(id);
      return sendSuccess(res, partner);
    } catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const partner = await partnerService.createPartner(req.body);
      return sendSuccess(res, partner, undefined, 201);
    } catch (err) {
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const partner = await partnerService.updatePartner(id, req.body);
      return sendSuccess(res, partner);
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await partnerService.deletePartner(id);
      return sendSuccess(res, result);
    } catch (err) {
      return next(err);
    }
  }
}

export const partnerController = new PartnerController();
