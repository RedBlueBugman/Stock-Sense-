import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type) where.operationType = String(type);
    if (status) where.status = String(status);

    const operations = await prisma.stockOperation.findMany({
      where,
      include: {
        sourceLocation: true,
        destinationLocation: true,
        partner: true,
        moves: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, operations);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const operation = await prisma.stockOperation.findUnique({
      where: { id },
      include: {
        sourceLocation: true,
        destinationLocation: true,
        partner: true,
        moves: { include: { product: true, lot: true } },
      },
    });
    if (!operation) return sendError(res, "NOT_FOUND", "Operation not found", 404);
    return sendSuccess(res, operation);
  } catch (err) {
    return next(err);
  }
});

router.post("/execute", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { operationType, sourceLocationId, destinationLocationId, partnerId, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, "INVALID_INPUT", "Items array is required with at least 1 item", 400);
    }

    const prefixMap: Record<string, string> = {
      receipt: "REC",
      delivery: "DEL",
      internal: "INT",
      adjustment: "ADJ",
    };
    const prefix = prefixMap[operationType] || "OP";
    const refCode = `${prefix}-${Date.now().toString().slice(-6)}`;

    const result = await prisma.$transaction(async (tx) => {
      const op = await tx.stockOperation.create({
        data: {
          referenceCode: refCode,
          operationType: String(operationType || "receipt"),
          status: "done",
          sourceLocationId: String(sourceLocationId),
          destinationLocationId: String(destinationLocationId),
          partnerId: partnerId ? String(partnerId) : null,
          notes: notes ? String(notes) : null,
          completedDate: new Date(),
        },
      });

      const moves = [];
      for (const item of items) {
        const move = await tx.stockMove.create({
          data: {
            operationId: op.id,
            productId: String(item.productId),
            lotId: item.lotId ? String(item.lotId) : null,
            quantity: Number(item.quantity),
            unitOfMeasure: item.unitOfMeasure ? String(item.unitOfMeasure) : "pcs",
            sourceLocationId: String(sourceLocationId),
            destinationLocationId: String(destinationLocationId),
            status: "done",
          },
        });
        moves.push(move);
      }

      return { ...op, moves };
    });

    return sendSuccess(res, result, undefined, 201);
  } catch (err) {
    return next(err);
  }
});

export default router;