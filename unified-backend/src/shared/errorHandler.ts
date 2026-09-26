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

export const handleDbError = (err: any): AppError => {
  if (err.code === '23505') return new AppError(409, 'CONFLICT', 'Duplicate entry');
  if (err.code === '23503') return new AppError(400, 'FK_VIOLATION', 'Referenced entity not found');
  if (err.code === '23514') return new AppError(400, 'CHECK_VIOLATION', 'Value violates integrity check');
  if (err.code === '23502') return new AppError(400, 'NOT_NULL', `Missing required field: ${err.column}`);
  console.error('[DB Error]:', err);
  return new AppError(500, 'DB_ERROR', 'Database operation failed');
};
