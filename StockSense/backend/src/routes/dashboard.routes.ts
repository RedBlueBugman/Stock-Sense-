import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/kpis", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalProducts, pendingReceipts, pendingDeliveries, scheduledTransfers, unreadAlerts] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.stockOperation.count({ where: { operationType: "receipt", status: { in: ["waiting", "ready", "draft"] } } }),
        prisma.stockOperation.count({ where: { operationType: "delivery", status: { in: ["waiting", "ready", "draft"] } } }),
        prisma.stockOperation.count({ where: { operationType: "internal", status: { in: ["waiting", "ready", "draft"] } } }),
        prisma.alert.count({ where: { isRead: false } }),
      ]);

    return sendSuccess(res, {
      total_products: totalProducts,
      pending_receipts: pendingReceipts,
      pending_deliveries: pendingDeliveries,
      scheduled_transfers: scheduledTransfers,
      unread_alerts: unreadAlerts,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/recent-operations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ops = await prisma.stockOperation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { sourceLocation: true, destinationLocation: true, partner: true },
    });
    return sendSuccess(res, ops);
  } catch (err) {
    return next(err);
  }
});

export default router;