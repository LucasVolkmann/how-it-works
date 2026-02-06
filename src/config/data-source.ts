import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.database,
  synchronize: false,
  logging: env.nodeEnv === "development",
  entities: [],
});
