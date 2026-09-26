import { Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { sendSuccess } from '../../shared/response';

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      return sendSuccess(res, settings);
    } catch (err) {
      return next(err);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      const updated = await settingsService.updateSettings(settings);
      return sendSuccess(res, updated);
    } catch (err) {
      return next(err);
    }
  }
}

export const settingsController = new SettingsController();
