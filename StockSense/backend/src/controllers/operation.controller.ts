import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { OperationType, OperationStatus } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { createOperation, transitionOperation } from "../services/ledger.service";
import { AppError } from "../middleware/errorHandler";

const createOpSchema = z.object({
  operationType: z.nativeEnum(OperationType),
  sourceLocationId: z.string().uuid(),
  destinationLocationId: z.string().uuid(),
  partnerId: z.string().uuid().optional(),
  scheduledDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    lotId: z.string().uuid().optional(),
    quantity: z.number().positive("Quantity must be positive"),
    unitOfMeasure: z.string().optional(),
  })).min(1, "At least one item required"),
});

export const createOp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthenticated", "UNAUTHORIZED"));
    const data = createOpSchema.parse(req.body);
    const operation = await createOperation({ ...data, userId: req.user.userId });
    res.status(201).json({ data: operation });
  } catch (err: any) { if (err instanceof z.ZodError) return next(new AppError(400, err.errors[0].message, "VALIDATION_ERROR")); next(err); }
};

export const transitionOp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthenticated", "UNAUTHORIZED"));
    const { id } = req.params;
    const { action } = z.object({ action: z.enum(["confirm", "assign", "validate", "cancel"]) }).parse(req.body);
    const updated = await transitionOperation(id, action, req.user.userId);
    res.json({ data: updated });
  } catch (err: any) { if (err instanceof z.ZodError) return next(new AppError(400, err.errors[0].message, "VALIDATION_ERROR")); next(err); }
};

export const getOperations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, status } = req.query;
    const operations = await prisma.stockOperation.findMany({
      where: { ...(type ? { operationType: type as OperationType } : {}), ...(status ? { status: status as OperationStatus } : {}) },
      include: { moves: { include: { product: true } }, sourceLocation: true, destinationLocation: true, partner: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: operations });
  } catch (err) { next(err); }
};

export const getOperationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation = await prisma.stockOperation.findUnique({
      where: { id: req.params.id },
      include: { moves: { include: { product: true, lot: true } }, sourceLocation: true, destinationLocation: true, partner: true, createdBy: { select: { name: true, email: true } } },
    });
    if (!operation) return next(new AppError(404, "Operation not found", "NOT_FOUND"));
    res.json({ data: operation });
  } catch (err) { next(err); }
};
