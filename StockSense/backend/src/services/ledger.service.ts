import prisma from "../utils/prisma";
import { AppError } from "../utils/errorHandler";
import { OperationStatus, MoveStatus } from "../types/enums";

export interface CreateOperationInput {
  operationType: string;
  sourceLocationId: string;
  destinationLocationId: string;
  partnerId?: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitOfMeasure?: string;
    lotId?: string;
  }>;
}

export const createOperation = async (input: CreateOperationInput, userId?: string) => {
  if (!input.items || input.items.length === 0) {
    throw new AppError(400, "Operation must have at least one line item", "BAD_REQUEST");
  }

  const prefixMap: Record<string, string> = {
    receipt: "REC",
    delivery: "DEL",
    internal: "INT",
    adjustment: "ADJ",
  };
  const prefix = prefixMap[input.operationType] || "OP";
  const refCode = `${prefix}-${Date.now().toString().slice(-6)}`;

  return prisma.$transaction(async (tx) => {
    const op = await tx.stockOperation.create({
      data: {
        referenceCode: refCode,
        operationType: input.operationType,
        status: OperationStatus.done,
        sourceLocationId: input.sourceLocationId,
        destinationLocationId: input.destinationLocationId,
        partnerId: input.partnerId || null,
        notes: input.notes || null,
        createdById: userId || null,
        completedDate: new Date(),
      },
    });

    const moves = [];
    for (const item of input.items) {
      const move = await tx.stockMove.create({
        data: {
          operationId: op.id,
          productId: item.productId,
          lotId: item.lotId || null,
          quantity: Number(item.quantity),
          unitOfMeasure: item.unitOfMeasure || "pcs",
          sourceLocationId: input.sourceLocationId,
          destinationLocationId: input.destinationLocationId,
          status: MoveStatus.done,
        },
      });
      moves.push(move);
    }

    return { ...op, moves };
  });
};

export const transitionOperation = async (id: string, action: string, userId?: string) => {
  const op = await prisma.stockOperation.findUnique({ where: { id: String(id) } });
  if (!op) throw new AppError(404, "Operation not found", "NOT_FOUND");

  let nextStatus: string = op.status;
  if (action === "validate" || action === "complete") nextStatus = OperationStatus.done;
  if (action === "cancel") nextStatus = OperationStatus.cancelled;
  if (action === "mark_ready") nextStatus = OperationStatus.ready;

  return prisma.stockOperation.update({
    where: { id: String(id) },
    data: {
      status: nextStatus,
      completedDate: nextStatus === OperationStatus.done ? new Date() : undefined,
      approvedById: userId || null,
    },
  });
};

// Calculate real-time on-hand stock for a product from the double-entry ledger
export const getStockQuantity = async (productId: string, locationId?: string): Promise<number> => {
  const whereIn: any = { productId: String(productId), status: MoveStatus.done };
  const whereOut: any = { productId: String(productId), status: MoveStatus.done };

  if (locationId) {
    whereIn.destinationLocationId = String(locationId);
    whereOut.sourceLocationId = String(locationId);
  }

  const [inMoves, outMoves] = await Promise.all([
    prisma.stockMove.aggregate({ where: whereIn, _sum: { quantity: true } }),
    prisma.stockMove.aggregate({ where: whereOut, _sum: { quantity: true } }),
  ]);

  const qtyIn = inMoves._sum.quantity || 0;
  const qtyOut = outMoves._sum.quantity || 0;
  return qtyIn - qtyOut;
};