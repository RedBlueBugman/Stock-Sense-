import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess, sendPaginated } from '../../shared/response';

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as any;
      const { products, total } = await productService.listProducts(filters);
      return sendPaginated(res, products, total, filters.page, filters.limit);
    } catch (err) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userRole = req.user?.role;
      const product = await productService.getProductById(id, userRole);
      return sendSuccess(res, product);
    } catch (err) {
      return next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'system';
      const product = await productService.createProduct(req.body, userId);
      return sendSuccess(res, product, undefined, 201);
    } catch (err) {
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await productService.updateProduct(id, req.body);
      return sendSuccess(res, product);
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await productService.deleteProduct(id);
      return sendSuccess(res, result);
    } catch (err) {
      return next(err);
    }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'system';
      const { products } = req.body;
      const report = await productService.bulkCreateProducts(products, userId);
      return sendSuccess(res, report, undefined, 201);
    } catch (err) {
      return next(err);
    }
  }
}

export const productController = new ProductController();
