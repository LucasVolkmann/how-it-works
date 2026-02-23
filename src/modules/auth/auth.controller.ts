import type { Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source.config.js';
import { User } from '../../domain/entities/user.entity.js';
import { AuthService } from './auth.service.js';

const userRepository = AppDataSource.getRepository(User);
const authService = new AuthService(userRepository);

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  }
}
