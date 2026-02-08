import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/validation.error.js";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(
        err => `${err.path}: ${err.message}`
      );
      throw new ValidationError(errors);
    }

    req.body = result.data as T;
    return next();
  };
}