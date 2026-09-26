import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendPaginated } from '../../shared/response';
import { AppError } from '../../shared/errorHandler';

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as any;
      const { users, total } = await userService.listUsers(filters);
      return sendPaginated(res, users, total, filters.page, filters.limit);
    } catch (err) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user?.id;
      const currentUserRole = req.user?.role;

      if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
        throw new AppError(403, 'FORBIDDEN', 'Access denied');
      }

      const user = await userService.getUserById(id);
      return sendSuccess(res, user);
    } catch (err) {
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user?.id || 'system';
      const user = await userService.updateUser(id, adminId, req.body);
      return sendSuccess(res, user);
    } catch (err) {
      return next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user?.id || 'system';
      const result = await userService.deactivateUser(id, adminId);
      return sendSuccess(res, result);
    } catch (err) {
      return next(err);
    }
  }
}

export const userController = new UserController();
