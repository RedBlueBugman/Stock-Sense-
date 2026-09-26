import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../utils/prisma";
import { AppError } from "../utils/errorHandler";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";
import { TokenPayload } from "../types/auth";
import { Role, ROLES } from "../types/enums";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLES).optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
  newPassword: z.string().min(6),
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) throw new AppError(409, "User already exists", "CONFLICT");

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash,
        role: parsed.role || Role.WAREHOUSE_WORKER,
        phone: parsed.phone || null,
      },
    });

    const warehouseIds = user.assignedWarehouseIds ? user.assignedWarehouseIds.split(",").filter(Boolean) : [];
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      assignedWarehouseIds: warehouseIds,
    };
    const token = jwt.sign(tokenPayload, env.JWT_SECRET || "supersecret", { expiresIn: "24h" });

    return sendSuccess(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token }, undefined, 201);
  } catch (err: any) {
    const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || err.message;
    if (err instanceof z.ZodError || err.name === "ZodError") {
      return next(new AppError(400, msg, "VALIDATION_ERROR"));
    }
    return next(err);
  }
};

export const register = signup;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) throw new AppError(401, "Invalid credentials", "UNAUTHORIZED");

    const valid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials", "UNAUTHORIZED");

    const warehouseIds = user.assignedWarehouseIds ? user.assignedWarehouseIds.split(",").filter(Boolean) : [];
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      assignedWarehouseIds: warehouseIds,
    };
    const token = jwt.sign(tokenPayload, env.JWT_SECRET || "supersecret", { expiresIn: "24h" });

    return sendSuccess(res, { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err: any) {
    const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || err.message;
    if (err instanceof z.ZodError || err.name === "ZodError") {
      return next(new AppError(400, msg, "VALIDATION_ERROR"));
    }
    return next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError(401, "Not authenticated", "UNAUTHORIZED");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

    return sendSuccess(res, user);
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) {
      // Return 200 to prevent user enumeration
      return sendSuccess(res, { message: "If this email is registered, a password reset OTP has been sent." });
    }
    // Prototype Mock OTP
    return sendSuccess(res, { message: "Password reset OTP sent to email.", demoOtp: "123456" });
  } catch (err: any) {
    const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || err.message;
    if (err instanceof z.ZodError || err.name === "ZodError") {
      return next(new AppError(400, msg, "VALIDATION_ERROR"));
    }
    return next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = resetPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) throw new AppError(400, "Invalid reset request", "BAD_REQUEST");

    const passwordHash = await bcrypt.hash(parsed.newPassword, 10);
    await prisma.user.update({
      where: { email: parsed.email },
      data: { passwordHash },
    });

    return sendSuccess(res, { message: "Password reset successfully. You can now log in." });
  } catch (err: any) {
    const msg = (err as any).issues?.[0]?.message || (err as any).errors?.[0]?.message || err.message;
    if (err instanceof z.ZodError || err.name === "ZodError") {
      return next(new AppError(400, msg, "VALIDATION_ERROR"));
    }
    return next(err);
  }
};