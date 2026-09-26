import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../../shared/response';
import { AppError } from '../../shared/errorHandler';

export class ProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      const profile = await userService.getUserById(userId);
      return sendSuccess(res, profile);
    } catch (err) {
      return next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      const updated = await userService.updateProfile(userId, req.body);
      return sendSuccess(res, updated);
    } catch (err) {
      return next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      const { current_password, new_password } = req.body;
      const result = await userService.changePassword(userId, current_password, new_password);
      return sendSuccess(res, result);
    } catch (err) {
      return next(err);
    }
  }
}

export const profileController = new ProfileController();
