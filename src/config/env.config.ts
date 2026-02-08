import dotenv from 'dotenv';
import type { IDBEnv } from '../types/environment/db-env.interface.js';
import type { NodeEnvType } from '../types/environment/node-env.type.js';
import type { IJWTEnv } from '../types/environment/jwt-env.interface.js';
import { isExpiresInValue } from '../types/guards/is-expires-in.guard.js';

dotenv.config();

interface IEnv {
  nodeEnv: NodeEnvType;
  port: number;
  db: IDBEnv;
  bcryptSaltRounds: number;
  jwt: IJWTEnv;
}

function required<T extends string = string>(
  key: string,
  validator?: (value: string) => value is T,
): T {
  const value = process.env[key];

  if (typeof value === 'undefined') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (validator && !validator(value)) {
    throw new Error(`Invalid environment variable: '${key}=${value}'`);
  }

  return value as T;
}

export const env: IEnv = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) ? Number(process.env.PORT) : 3000,

  db: {
    host: required('DB_HOST'),
    port: parseInt(required('DB_PORT'), 10),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
  },

  bcryptSaltRounds: parseInt(required('BCRYPT_SALT_ROUNDS')),

  jwt: {
    expiresIn: required('JWT_EXPIRES_IN', isExpiresInValue),
    secret: required('JWT_SECRET'),
  },
};
