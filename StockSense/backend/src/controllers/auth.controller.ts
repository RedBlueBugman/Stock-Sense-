import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { TokenPayload, AuthResponse } from "../types/auth";

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).optional().default(Role.WAREHOUSE_WORKER),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (payload: TokenPayload): string => jwt.sign(payload, env.JWT_SECRET, { expiresIn: "24h" });

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return next(new AppError(409, "Email already registered", "EMAIL_EXISTS"));
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({ data: { name: data.name, email: data.email, phone: data.phone, passwordHash, role: data.role } });
    const tokenPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role, assignedWarehouseIds: user.assignedWarehouseIds };
    const accessToken = generateToken(tokenPayload);
    res.status(201).json({ data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, assignedWarehouseIds: user.assignedWarehouseIds }, accessToken } });
  } catch (err: any) { if (err instanceof z.ZodError) return next(new AppError(400, err.errors[0].message, "VALIDATION_ERROR")); next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) return next(new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS"));
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) return next(new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS"));
    const tokenPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role, assignedWarehouseIds: user.assignedWarehouseIds };
    const accessToken = generateToken(tokenPayload);
    res.json({ data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, assignedWarehouseIds: user.assignedWarehouseIds }, accessToken } });
  } catch (err: any) { if (err instanceof z.ZodError) return next(new AppError(400, err.errors[0].message, "VALIDATION_ERROR")); next(err); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 600000 });
    res.json({ data: { message: "Reset code generated", demoOtp: otp } });
  } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = z.object({ email: z.string().email(), otp: z.string().length(6), newPassword: z.string().min(6) }).parse(req.body);
    const record = otpStore.get(email);
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) return next(new AppError(400, "Invalid or expired OTP", "INVALID_OTP"));
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    otpStore.delete(email);
    res.json({ data: { message: "Password reset successful" } });
  } catch (err) { next(err); }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError(401, "Unauthenticated", "UNAUTHORIZED"));
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true, phone: true, role: true, assignedWarehouseIds: true, isActive: true, createdAt: true } });
    if (!user) return next(new AppError(404, "User not found", "NOT_FOUND"));
    res.json({ data: user });
  } catch (err) { next(err); }
};
