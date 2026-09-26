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

// Maps PostgreSQL error codes to friendly HTTP errors as mandated by Section 10
export const handleDbError = (err: any): AppError => {
  // Unique Constraint Violation (e.g. duplicate SKU, email, barcode)
  if (err.code === '23505') {
    const detail = err.detail || '';
    const match = detail.match(/Key \((.*?)\)=\((.*?)\) already exists/);
    const message = match ? `Field '${match[1]}' with value '${match[2]}' already exists` : 'A duplicate entry already exists';
    return new AppError(409, 'CONFLICT', message, { constraint: err.constraint });
  }

  // Foreign Key Violation (e.g. category_id or warehouse_id not found)
  if (err.code === '23503') {
    return new AppError(400, 'FOREIGN_KEY_VIOLATION', 'Referenced entity does not exist', { constraint: err.constraint });
  }

  // Check Constraint Violation (e.g. negative quantities or invalid status)
  if (err.code === '23514') {
    return new AppError(400, 'CHECK_CONSTRAINT_VIOLATION', 'Provided value violates database integrity check', { constraint: err.constraint });
  }

  // Not Null Violation
  if (err.code === '23502') {
    return new AppError(400, 'REQUIRED_FIELD_MISSING', `Required field '${err.column}' is missing`);
  }

  console.error('[Unhandled DB Error]:', err);
  return new AppError(500, 'INTERNAL_SERVER_ERROR', 'A database operation error occurred');
};
