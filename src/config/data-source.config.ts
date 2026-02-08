import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.config.js";
import allEntities from "../domain/entities/index.js";
import { SnakeNamingStrategy } from "./snake-naming-strategy.config.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.database,
  namingStrategy: new SnakeNamingStrategy(), 
  synchronize: env.nodeEnv === "development", 
  logging: true,
  entities: [
    ...allEntities
  ],
});
