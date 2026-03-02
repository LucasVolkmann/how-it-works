import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, vi } from 'vitest';
import type { Request, NextFunction, Response } from 'express';
import { routeNotFound } from './not-found.middleware.js';

function makeRes(): Response {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  (res.json as ReturnType<typeof vi.fn>).mockReturnValue(res);

  return res;
}

function makeReq(): Request {
  return {} as Request;
}

function makeNext(): NextFunction {
  return vi.fn();
}

describe('notFoundMiddleware', () => {
  it('should call next function with 404 status and correct error message inside a HttpError', () => {
    const error = createHttpError(StatusCodes.NOT_FOUND, 'Rota não encontrada');

    const nextFn = makeNext();

    routeNotFound(makeReq(), makeRes(), nextFn);

    expect(nextFn).toHaveBeenCalledWith(error);
  });
});
