import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/errorHandler";
import { TokenPayload } from "../types/auth";
import { Role } from "../types/enums";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Default hackathon fallback admin
      req.user = {
        userId: "00000000-0000-0000-0000-000000000001",
        email: "admin@stocksense.local",
        role: Role.ADMIN,
        assignedWarehouseIds: [],
      };
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET || "supersecret") as TokenPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    return next(new AppError(401, "Invalid or expired token", "UNAUTHORIZED"));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as string)) {
      return next(new AppError(403, "Forbidden: insufficient permissions", "FORBIDDEN"));
    }
    return next();
  };
};