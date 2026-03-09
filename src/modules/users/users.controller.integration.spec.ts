import request from 'supertest';
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

import app from '../../app.config.js';
import { AppDataSource } from '../../config/data-source.config.js';
import { User } from '../../domain/entities/user.entity.js';
import { StatusCodes } from 'http-status-codes';

describe('UsersController - Integration', () => {
  const server = app.getInstance();

  let token: string;
  let userId: string;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    const userRepo = AppDataSource.getRepository(User);

    await userRepo.clear();

    const user = await userRepo.save({
      name: 'Lucas',
      email: 'lucas@email.com',
      passwordHash: 'hashed-password',
    });

    userId = user.id;

    token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  });

  describe('GET /api/users', () => {
    it('should return authenticated user', async () => {
      const response = await request(server)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);

      expect(response.body).toMatchObject({
        id: userId,
        name: 'Lucas',
        email: 'lucas@email.com',
      });

      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 401 without token', async () => {
      const response = await request(server).get('/api/users');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('PUT /api/users', () => {
    it('should update user name', async () => {
      const response = await request(server)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Lucas Updated',
        });

      expect(response.status).toBe(StatusCodes.OK);

      expect(response.body.name).toBe('Lucas Updated');
      expect(response.body.email).toBe('lucas@email.com');
    });

    it('should return validation error for invalid name', async () => {
      const response = await request(server)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'a',
        });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 401 without token', async () => {
      const response = await request(server).put('/api/users').send({
        name: 'Novo Nome',
      });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('DELETE /api/users', () => {
    it('should delete user', async () => {
      const response = await request(server)
        .delete('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.NO_CONTENT);

      const userRepo = AppDataSource.getRepository(User);

      const deletedUser = await userRepo.findOne({
        where: { id: userId },
      });

      expect(deletedUser).toBeNull();
    });

    it('should return 401 without token', async () => {
      const response = await request(server).delete('/api/users');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
