import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { validateBody, validateParams } from './validation.middleware.js';
import { ValidationError } from '../errors/validation.error.js';

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    ...overrides,
  } as Request;
}

function makeRes(): Response {
  return {} as Response;
}

function makeNext(): NextFunction {
  return vi.fn();
}

describe('validateBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  describe('valid payload', () => {
    it('should call next when body is valid', () => {
      const req = makeReq({ body: { name: 'John', age: 30 } });
      const next = makeNext();

      validateBody(schema)(req, makeRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('should assign parsed data back to req.body', () => {
      const req = makeReq({ body: { name: 'John', age: 30 } });

      validateBody(schema)(req, makeRes(), makeNext());

      expect(req.body).toEqual({ name: 'John', age: 30 });
    });

    it('should strip unknown fields from req.body', () => {
      const req = makeReq({ body: { name: 'John', age: 30, extra: 'field' } });

      validateBody(schema)(req, makeRes(), makeNext());

      expect(req.body).not.toHaveProperty('extra');
    });
  });

  describe('invalid payload', () => {
    it('should throw ValidationError when body is invalid', () => {
      const req = makeReq({ body: { name: 123, age: 'not-a-number' } });

      expect(() => validateBody(schema)(req, makeRes(), makeNext())).toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError with field path and message', () => {
      const req = makeReq({ body: { name: 'John' } });

      expect(() => validateBody(schema)(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({
          errors: expect.arrayContaining([expect.stringContaining('age')]),
        }),
      );
    });

    it('should not call next when body is invalid', () => {
      const req = makeReq({ body: {} });
      const next = makeNext();

      expect(() => validateBody(schema)(req, makeRes(), next)).toThrow();
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('validateParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const schema = z.object({
    id: z.string().uuid(),
  });

  describe('valid params', () => {
    it('should call next when params are valid', () => {
      const req = makeReq({
        params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
      });
      const next = makeNext();

      validateParams(schema)(req, makeRes(), next);

      expect(next).toHaveBeenCalledOnce();
    });

    it('should assign parsed data back to req.params', () => {
      const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const req = makeReq({ params: { id } });

      validateParams(schema)(req, makeRes(), makeNext());

      expect(req.params).toEqual({ id });
    });
  });

  describe('invalid params', () => {
    it('should throw ValidationError when params are invalid', () => {
      const req = makeReq({ params: { id: 'not-a-uuid' } });

      expect(() => validateParams(schema)(req, makeRes(), makeNext())).toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError with field path and message', () => {
      const req = makeReq({ params: { id: 'not-a-uuid' } });

      expect(() => validateParams(schema)(req, makeRes(), makeNext())).toThrow(
        expect.objectContaining({
          errors: expect.arrayContaining([expect.stringContaining('id')]),
        }),
      );
    });

    it('should not call next when params are invalid', () => {
      const req = makeReq({ params: { id: 'not-a-uuid' } });
      const next = makeNext();

      expect(() => validateParams(schema)(req, makeRes(), next)).toThrow();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
