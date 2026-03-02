import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import createHttpError from 'http-errors';
import type { Request, NextFunction, Response } from 'express';

import { globalErrorMiddleware } from './global-error.middleware.js';
import { ValidationError } from '../errors/validation.error.js';

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

describe('globalErrorMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('ValidationError', () => {
    it('should respond with 400 and validation errors shape', () => {
      const errors = ['Invalid email'];
      const err = new ValidationError(errors);
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Requisição inválida',
        errors,
      });
    });

    it('should include all validation errors in the response', () => {
      const errors = ['Name is required', 'Password is too short'];
      const err = new ValidationError(errors);
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors }));
    });
  });

  describe('HttpError (expose: true)', () => {
    it('should respond with the http error status and message', () => {
      const err = createHttpError(StatusCodes.NOT_FOUND, 'Resource not found');
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource not found',
        }),
      );
    });

    it('should respond with 401 for UNAUTHORIZED errors', () => {
      const err = createHttpError(StatusCodes.UNAUTHORIZED);
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
    });

    it('should respond with 403 for FORBIDDEN errors', () => {
      const err = createHttpError(StatusCodes.FORBIDDEN, 'Forbidden');
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    });

    it('should not log to console for known http errors', () => {
      const err = createHttpError(StatusCodes.BAD_REQUEST);
      const consoleSpy = vi.spyOn(console, 'log');

      globalErrorMiddleware(err, makeReq(), makeRes(), makeNext());

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Unknown errors', () => {
    it('should respond with 500 for generic Error instances', () => {
      const err = new Error('Something went wrong');
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro interno no servidor',
      });
    });

    it('should respond with 500 for non-Error thrown values', () => {
      const err = { weird: 'object' };
      const res = makeRes();

      globalErrorMiddleware(err, makeReq(), res, makeNext());

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should log unknown errors to console', () => {
      const err = new Error('Unexpected failure');
      const consoleSpy = vi.spyOn(console, 'log');

      globalErrorMiddleware(err, makeReq(), makeRes(), makeNext());

      expect(consoleSpy).toHaveBeenCalledWith('Unknown Error:', err);
    });
  });
});
