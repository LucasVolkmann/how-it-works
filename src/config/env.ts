import dotenv from "dotenv";

dotenv.config();

type NodeEnvType = "development" | "production" | "test";

interface IDB {
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
}

interface IEnv {
  nodeEnv: NodeEnvType,
  port: number,
  db: IDB
}

function required(key: string) {
  const value = process.env[key];
  if (typeof value === "undefined") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: IEnv = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) ? Number(process.env.PORT) : 3000,

  db: {
    host: required("DB_HOST"),
    port: parseInt(required("DB_PORT"), 10),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
  },
};
