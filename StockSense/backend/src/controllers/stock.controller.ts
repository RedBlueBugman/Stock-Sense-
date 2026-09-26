import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { getStockQuantity } from "../services/ledger.service";

export const getStockQuants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, locationId } = req.query as { productId?: string; locationId?: string };
    const products = await prisma.product.findMany({
      where: { isActive: true, ...(productId ? { id: productId } : {}) },
      include: { category: true },
    });
    const quants = await Promise.all(products.map(async (p) => {
      const onHand = await getStockQuantity(p.id, locationId);
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        category: p.category?.name || null,
        unitOfMeasure: p.unitOfMeasure,
        quantityOnHand: onHand,
        reorderMin: p.reorderMin,
        isLowStock: p.reorderMin > 0 && onHand <= p.reorderMin,
        isOutOfStock: onHand <= 0,
      };
    }));
    res.json({ data: quants });
  } catch (err) { next(err); }
};

export const getMoveHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.query as { productId?: string };
    const moves = await prisma.stockMove.findMany({
      where: { ...(productId ? { productId } : {}) },
      include: { product: true, sourceLocation: true, destinationLocation: true, operation: { select: { referenceCode: true, operationType: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ data: moves });
  } catch (err) { next(err); }
};
