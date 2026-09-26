import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { sendSuccess } from '../../shared/response';

export class CategoryController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const includeCounts = req.query.include_counts === 'true';
      const categories = await categoryService.listCategories(includeCounts);
      return sendSuccess(res, categories);
    } catch (err) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const category = await categoryService.getCategoryById(id);
      return sendSuccess(res, category);
    } catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);
      return sendSuccess(res, category, undefined, 201);
    } catch (err) {
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const category = await categoryService.updateCategory(id, req.body);
      return sendSuccess(res, category);
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await categoryService.deleteCategory(id);
      return sendSuccess(res, result);
    } catch (err) {
      return next(err);
    }
  }
}

export const categoryController = new CategoryController();
