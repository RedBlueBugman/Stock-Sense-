import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/quants", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, locationId } = req.query;
    const whereIn: any = { status: "done" };
    const whereOut: any = { status: "done" };

    if (productId) {
      whereIn.productId = String(productId);
      whereOut.productId = String(productId);
    }
    if (locationId) {
      whereIn.destinationLocationId = String(locationId);
      whereOut.sourceLocationId = String(locationId);
    }

    const [inMoves, outMoves] = await Promise.all([
      prisma.stockMove.findMany({ where: whereIn, include: { product: true, destinationLocation: true } }),
      prisma.stockMove.findMany({ where: whereOut, include: { product: true, sourceLocation: true } }),
    ]);

    const stockMap = new Map<string, { product: any; location: any; onHand: number }>();

    for (const m of inMoves) {
      const key = `${m.productId}_${m.destinationLocationId}`;
      if (!stockMap.has(key)) {
        stockMap.set(key, { product: m.product, location: m.destinationLocation, onHand: 0 });
      }
      stockMap.get(key)!.onHand += m.quantity;
    }

    for (const m of outMoves) {
      const key = `${m.productId}_${m.sourceLocationId}`;
      if (stockMap.has(key)) {
        stockMap.get(key)!.onHand -= m.quantity;
      }
    }

    const quants = Array.from(stockMap.values()).filter((q) => q.onHand > 0);
    return sendSuccess(res, quants);
  } catch (err) {
    return next(err);
  }
});

export default router;