import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, search } = req.query;
    const where: any = { isActive: true };
    if (type) where.type = String(type);
    if (search) where.name = { contains: String(search) };

    const partners = await prisma.partner.findMany({ where, orderBy: { name: "asc" } });
    return sendSuccess(res, partners);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, email, phone, address } = req.body;
    const partner = await prisma.partner.create({
      data: {
        name,
        type: type || "supplier",
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    });
    return sendSuccess(res, partner, undefined, 201);
  } catch (err) {
    return next(err);
  }
});

export default router;