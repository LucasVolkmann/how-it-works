import type { ErrorRequestHandler } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { ValidationError } from "../errors/validation.error.js";

export const globalErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Requisição inválida',
      errors: err.errors
    });
  }

  if (createHttpError.isHttpError(err) && err.expose) {
    const statusCode = err.status || err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Erro desconhecido',
      code: err.code || undefined,
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Erro interno no servidor'
  });
}