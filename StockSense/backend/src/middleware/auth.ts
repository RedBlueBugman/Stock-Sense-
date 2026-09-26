import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "./errorHandler";
import { TokenPayload } from "../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 5,
  INVENTORY_MANAGER: 4,
  WAREHOUSE_SUPERVISOR: 3,
  WAREHOUSE_WORKER: 2,
  VIEWER: 1,
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication token missing", "UNAUTHORIZED"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError(401, "Invalid or expired token", "TOKEN_EXPIRED"));
  }
};

export const requireRole = (minRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthenticated", "UNAUTHORIZED"));
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
    if (userLevel < requiredLevel) {
      return next(new AppError(403, "Insufficient permissions for this action", "FORBIDDEN"));
    }
    next();
  };
};
