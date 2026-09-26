import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category_id } = req.query;
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } },
      ];
    }
    if (category_id) where.categoryId = String(category_id);

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, products);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, sku, barcode, categoryId, unitOfMeasure, reorderMin, reorderMax, reorderQty } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        categoryId: categoryId || null,
        unitOfMeasure: unitOfMeasure || "pcs",
        reorderMin: Number(reorderMin) || 0,
        reorderMax: Number(reorderMax) || 0,
        reorderQty: Number(reorderQty) || 0,
      },
    });
    return sendSuccess(res, product, undefined, 201);
  } catch (err) {
    return next(err);
  }
});

export default router;