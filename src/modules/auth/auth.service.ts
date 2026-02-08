import { AppDataSource } from '../../config/data-source.config.js';
import { User } from '../../domain/entities/user.entity.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { signToken } from '../../shared/utils/jwt.js';
import type { LoginDTO, RegisterDTO } from './auth.dto.js';
import createHttpError from 'http-errors';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(data: RegisterDTO) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw createHttpError(StatusCodes.CONFLICT, 'Email ja está em uso');
    }

    const passwordHash = await hashPassword(data.password);

    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    await this.userRepo.save(user);

    const token = signToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const validPassword = await comparePassword(data.password, user.passwordHash);
    if (!validPassword) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const token = signToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}
