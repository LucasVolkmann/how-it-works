import jwt from "jsonwebtoken";
import { env } from "../../config/env.config.js";

export interface JwtPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
}