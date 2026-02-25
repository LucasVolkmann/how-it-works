import type { Repository } from 'typeorm';
import type { User } from '../../domain/entities/user.entity.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.utils.js';
import { signToken } from '../../shared/utils/jwt.utils.js';
import type { UserAuthenticatedOutputDTO } from './auth.dto.js';
import createHttpError from 'http-errors';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { LoginDTO, RegisterDTO } from './auth-schemas.dto.js';
import AuthMapper from './auth.mapper.js';

export class AuthService {
  constructor(private userRepo: Repository<User>) {}

  async register(data: RegisterDTO): Promise<UserAuthenticatedOutputDTO> {
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

    return AuthMapper.mapAuthenticatedUserOutputDTO(user, token);
  }

  async login(data: LoginDTO): Promise<UserAuthenticatedOutputDTO> {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const validPassword = await comparePassword(data.password, user.passwordHash);
    if (!validPassword) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    const token = signToken({ userId: user.id });

    return AuthMapper.mapAuthenticatedUserOutputDTO(user, token);
  }
}
