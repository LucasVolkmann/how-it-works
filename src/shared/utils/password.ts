import bcrypt from "bcrypt";
import { env } from "../../config/env.config.js";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}