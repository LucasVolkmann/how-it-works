import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

export const routeNotFound: RequestHandler = async (req, res, next) => {
  next(createHttpError(StatusCodes.NOT_FOUND, 'Rota não encontrada'));
};
