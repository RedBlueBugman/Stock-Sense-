import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { warehouse_id, type } = req.query;
    const where: any = { isActive: true };
    if (warehouse_id) where.warehouseId = String(warehouse_id);
    if (type) where.locationType = String(type);

    const locations = await prisma.location.findMany({
      where,
      include: { warehouse: true },
      orderBy: { name: "asc" },
    });
    return sendSuccess(res, locations);
  } catch (err) {
    return next(err);
  }
});

export default router;