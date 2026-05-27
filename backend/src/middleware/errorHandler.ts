import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  statusCode?: number;
  code?: number;
  errors?: Array<{ field: string; message: string }>;
};

export function errorHandler(error: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = error.statusCode || (error.code === 11000 ? 400 : 500);
  const detail = error.code === 11000 ? "Duplicate record" : error.message || "Server error";

  res.status(statusCode).json({ detail, errors: error.errors || [] });
}
