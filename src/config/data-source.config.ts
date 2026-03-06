import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env.config.js';
import { SnakeNamingStrategy } from './snake-naming-strategy.config.js';
import { User } from '../domain/entities/user.entity.js';
import { Post } from '../domain/entities/post.entity.js';

export const AppDataSource =
  env.nodeEnv === 'test' ? createTestDataSource() : createProductionDataSource();

function createProductionDataSource() {
  return new DataSource({
    type: 'postgres',
    host: env.db.host,
    port: env.db.port,
    username: env.db.user,
    password: env.db.password,
    database: env.db.database,
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: env.nodeEnv === 'development',
    logging: true,
    entities: [Post, User],
  });
}

function createTestDataSource() {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [User, Post],
  });
}
