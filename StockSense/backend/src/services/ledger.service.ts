import { Prisma, OperationType, OperationStatus, MoveStatus } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

export interface CreateOperationInput {
  operationType: OperationType;
  sourceLocationId: string;
  destinationLocationId: string;
  partnerId?: string;
  scheduledDate?: Date;
  notes?: string;
  userId: string;
  items: Array<{ productId: string; lotId?: string; quantity: number; unitOfMeasure?: string; }>;
}

export const generateReferenceCode = async (type: OperationType): Promise<string> => {
  const prefixMap: Record<OperationType, string> = { receipt: "REC", delivery: "DEL", internal: "INT", adjustment: "ADJ" };
  const year = new Date().getFullYear();
  const count = await prisma.stockOperation.count({ where: { operationType: type } });
  const seq = (count + 1).toString().padStart(4, "0");
  return `${prefixMap[type]}/${year}/${seq}`;
};

export const getStockQuantity = async (productId: string, locationId?: string) => {
  const incoming = await prisma.stockMove.aggregate({ _sum: { quantity: true }, where: { productId, ...(locationId ? { destinationLocationId: locationId } : {}), status: MoveStatus.done } });
  const outgoing = await prisma.stockMove.aggregate({ _sum: { quantity: true }, where: { productId, ...(locationId ? { sourceLocationId: locationId } : {}), status: MoveStatus.done } });
  const inQty = incoming._sum.quantity ? Number(incoming._sum.quantity) : 0;
  const outQty = outgoing._sum.quantity ? Number(outgoing._sum.quantity) : 0;
  return inQty - outQty;
};

export const createOperation = async (input: CreateOperationInput) => {
  const referenceCode = await generateReferenceCode(input.operationType);
  return await prisma.$transaction(async (tx) => {
    const operation = await tx.stockOperation.create({
      data: {
        referenceCode,
        operationType: input.operationType,
        sourceLocationId: input.sourceLocationId,
        destinationLocationId: input.destinationLocationId,
        partnerId: input.partnerId,
        scheduledDate: input.scheduledDate || new Date(),
        createdById: input.userId,
        notes: input.notes,
        status: OperationStatus.draft,
        moves: {
          create: input.items.map((item) => ({
            productId: item.productId,
            lotId: item.lotId,
            quantity: new Prisma.Decimal(item.quantity),
            unitOfMeasure: item.unitOfMeasure || "pcs",
            sourceLocationId: input.sourceLocationId,
            destinationLocationId: input.destinationLocationId,
            status: MoveStatus.draft,
          })),
        },
      },
      include: { moves: { include: { product: true } }, sourceLocation: true, destinationLocation: true, partner: true },
    });
    return operation;
  });
};

export const transitionOperation = async (operationId: string, action: "confirm" | "assign" | "validate" | "cancel", userId: string) => {
  const op = await prisma.stockOperation.findUnique({ where: { id: operationId }, include: { moves: true } });
  if (!op) throw new AppError(404, "Operation not found", "NOT_FOUND");
  if (op.status === OperationStatus.done) throw new AppError(400, "Completed operations cannot be modified", "IMMUTABLE_OPERATION");
  if (op.status === OperationStatus.cancelled) throw new AppError(400, "Operation is already cancelled", "OPERATION_CANCELLED");

  if (action === "confirm") {
    if (op.status !== OperationStatus.draft) throw new AppError(400, "Only draft operations can be confirmed", "INVALID_TRANSITION");
    return await prisma.stockOperation.update({ where: { id: operationId }, data: { status: OperationStatus.waiting } });
  }
  if (action === "assign") {
    return await prisma.stockOperation.update({ where: { id: operationId }, data: { status: OperationStatus.ready, assignedToId: userId } });
  }
  if (action === "validate") {
    return await prisma.$transaction(async (tx) => {
      await tx.stockMove.updateMany({ where: { operationId }, data: { status: MoveStatus.done } });
      const updated = await tx.stockOperation.update({ where: { id: operationId }, data: { status: OperationStatus.done, completedDate: new Date(), approvedById: userId }, include: { moves: true } });
      return updated;
    });
  }
  if (action === "cancel") {
    return await prisma.$transaction(async (tx) => {
      await tx.stockMove.updateMany({ where: { operationId }, data: { status: MoveStatus.cancelled } });
      return await tx.stockOperation.update({ where: { id: operationId }, data: { status: OperationStatus.cancelled } });
    });
  }
};
