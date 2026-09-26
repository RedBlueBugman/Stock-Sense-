import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: { locations: true },
      orderBy: { name: "asc" },
    });
    return sendSuccess(res, warehouses);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, address } = req.body;
    const warehouse = await prisma.warehouse.create({
      data: { name, code: String(code).toUpperCase(), address: address || null },
    });
    return sendSuccess(res, warehouse, undefined, 201);
  } catch (err) {
    return next(err);
  }
});

export default router;