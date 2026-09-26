import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../utils/prisma";
import { AppError } from "../utils/errorHandler";
import { sendSuccess, sendError } from "../utils/response";
import { createOperation, transitionOperation } from "../services/ledger.service";

const executeSchema = z.object({
  operationType: z.string(),
  sourceLocationId: z.string(),
  destinationLocationId: z.string(),
  partnerId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
      unitOfMeasure: z.string().optional(),
      lotId: z.string().optional(),
    })
  ),
});

export const executeOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = executeSchema.parse(req.body);
    const userId = (req as any).user?.userId || "00000000-0000-0000-0000-000000000001";
    const result = await createOperation(parsed as any, userId);
    return sendSuccess(res, result, undefined, 201);
  } catch (err: any) {
    const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || err.message;
    if (err instanceof z.ZodError || err.name === "ZodError") {
      return next(new AppError(400, msg, "VALIDATION_ERROR"));
    }
    return next(err);
  }
};

export const transition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { action } = req.body;
    const userId = (req as any).user?.userId || "00000000-0000-0000-0000-000000000001";
    const updated = await transitionOperation(id, String(action), userId);
    return sendSuccess(res, updated);
  } catch (err: any) {
    const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || err.message;
    if (err instanceof z.ZodError || err.name === "ZodError") {
      return next(new AppError(400, msg, "VALIDATION_ERROR"));
    }
    return next(err);
  }
};

export const listOperations = async (req: Request, res: Response, next: NextFunction) => {
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
};

export const getOperation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const op = await prisma.stockOperation.findUnique({
      where: { id },
      include: {
        sourceLocation: true,
        destinationLocation: true,
        partner: true,
        moves: { include: { product: true, lot: true } },
      },
    });
    if (!op) return sendError(res, "NOT_FOUND", "Operation not found", 404);
    return sendSuccess(res, op);
  } catch (err) {
    return next(err);
  }
};