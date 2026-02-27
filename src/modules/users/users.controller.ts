import type { Response } from 'express';
import { UsersService } from './users.service.js';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import createHttpError from 'http-errors';
import { AppDataSource } from '../../config/data-source.config.js';
import { User } from '../../domain/entities/user.entity.js';

const userRepository = AppDataSource.getRepository(User);
const usersService = new UsersService(userRepository);

export class UsersController {
  async getById(req: AuthRequest, res: Response) {
    if (!req.userId)
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    const user = await usersService.getById(req.userId);
    return res.json(user);
  }

  async update(req: AuthRequest, res: Response) {
    if (!req.userId)
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    const user = await usersService.update(req.userId, req.body);
    return res.json(user);
  }

  async delete(req: AuthRequest, res: Response) {
    if (!req.userId)
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    await usersService.delete(req.userId);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}
