import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Response } from 'express';

import { authMiddleware, type AuthRequest } from './auth.middleware.js';

vi.mock('../utils/jwt.utils.js', () => ({
  verifyToken: vi.fn(),
}));

import { verifyToken } from '../utils/jwt.utils.js';

const mockedVerifyToken = verifyToken as MockedFunction<typeof verifyToken>;

function makeReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    headers: {},
    ...overrides,
  } as AuthRequest;
}

function makeRes(): Response {
  return {} as Response;
}

function makeNext(): NextFunction {
  return vi.fn();
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('missing authorization header', () => {
    it('should throw UNAUTHORIZED when authorization header is absent', () => {
      const req = makeReq({ headers: {} });

      expect(() => authMiddleware(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({ status: StatusCodes.UNAUTHORIZED }),
      );
    });
  });

  describe('malformed authorization header', () => {
    it('should throw UNAUTHORIZED when scheme is not Bearer', () => {
      const req = makeReq({ headers: { authorization: 'Basic some-token' } });

      expect(() => authMiddleware(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({ status: StatusCodes.UNAUTHORIZED }),
      );
    });

    it('should throw UNAUTHORIZED when token is missing after Bearer', () => {
      const req = makeReq({ headers: { authorization: 'Bearer' } });

      expect(() => authMiddleware(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({ status: StatusCodes.UNAUTHORIZED }),
      );
    });

    it('should throw UNAUTHORIZED when authorization header has no space', () => {
      const req = makeReq({ headers: { authorization: 'BearerSomeToken' } });

      expect(() => authMiddleware(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({ status: StatusCodes.UNAUTHORIZED }),
      );
    });
  });

  describe('invalid token', () => {
    it('should throw UNAUTHORIZED when verifyToken throws', () => {
      const req = makeReq({ headers: { authorization: 'Bearer invalid-token' } });
      mockedVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authMiddleware(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({ status: StatusCodes.UNAUTHORIZED }),
      );
    });
  });

  describe('valid token', () => {
    it('should set req.userId from token payload and call next', () => {
      const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
      const next = makeNext();
      mockedVerifyToken.mockReturnValue({ userId: 'user-123' } as any);

      authMiddleware(req, makeRes(), next);

      expect(req.userId).toBe('user-123');
      expect(next).toHaveBeenCalledOnce();
    });

    it('should not throw when token is valid', () => {
      const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
      mockedVerifyToken.mockReturnValue({ userId: 'user-abc' } as any);

      expect(() => authMiddleware(req, makeRes(), makeNext())).not.toThrow();
    });
  });
});
