import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

export const routeNotFound: RequestHandler = async (req, res, next) => {
  next(createHttpError(404, 'Rota não encontrada'));
};
