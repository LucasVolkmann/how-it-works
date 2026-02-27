import createHttpError from 'http-errors';
import type { User } from '../../domain/entities/user.entity.js';
import type { UpdateUserDTO } from './users-schemas.dto.js';
import { StatusCodes } from 'http-status-codes';
import type { UserOutputDTO } from './users.dto.js';
import UsersMapper from './users.mapper.js';
import type { Repository } from 'typeorm';

export class UsersService {
  constructor(private userRepo: Repository<User>) {}

  async getById(id: string): Promise<UserOutputDTO> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw createHttpError(StatusCodes.NOT_FOUND, 'Usuário não encontrado');
    }

    return UsersMapper.mapOutputDto(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserOutputDTO> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw createHttpError(StatusCodes.NOT_FOUND, 'Usuário não encontrado');
    }

    Object.assign(user, data);

    await this.userRepo.save(user);

    return UsersMapper.mapOutputDto(user);
  }

  async delete(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw createHttpError(StatusCodes.NOT_FOUND, 'Usuário não encontrado');
    }

    await this.userRepo.remove(user);
  }
}
