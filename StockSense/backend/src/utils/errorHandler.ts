import { Response, Request, NextFunction } from "express";
import { sendError } from "./response";

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  // PostgreSQL Error Code Translations
  if (err.code === "23505") {
    return sendError(res, "CONFLICT", "A duplicate record already exists with these unique values", 409, err.detail);
  }
  if (err.code === "23503") {
    return sendError(res, "FOREIGN_KEY_VIOLATION", "The referenced foreign entity does not exist", 400, err.detail);
  }
  if (err.code === "23514") {
    return sendError(res, "CHECK_VIOLATION", "Value violates database constraint check", 400);
  }

  console.error("[StockSense Error Caught]:", err);
  return sendError(res, "INTERNAL_SERVER_ERROR", "An internal server error occurred", 500);
};
