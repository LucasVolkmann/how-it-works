import type { ErrorRequestHandler } from "express";

export const globalErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erro interno no servidor',
    code: err.code || undefined,
  });
}