import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sendSuccess = <T>(res: Response, data: T, meta?: PaginationMeta, statusCode = 200) => {
  const payload: { data: T; meta?: PaginationMeta } = { data };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode = 200
) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return sendSuccess(res, data, { total, page, limit, totalPages }, statusCode);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: any
) => {
  return res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  });
};
