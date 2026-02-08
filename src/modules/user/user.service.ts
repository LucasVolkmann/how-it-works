import createHttpError from "http-errors";
import { AppDataSource } from "../../config/data-source.config.js";
import { User } from "../../domain/entities/user.entity.js";
import type { UpdateUserDTO } from "./user.dto.js";
import { StatusCodes } from "http-status-codes";

export class UsersService {
  private userRepo = AppDataSource.getRepository(User);

  async list() {
    const users = await this.userRepo.find();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
    }));
  }

  async getById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
        throw createHttpError(StatusCodes.NOT_FOUND, "Usuário não encontrado.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, data: UpdateUserDTO) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
        throw createHttpError(StatusCodes.NOT_FOUND, "Usuário não encontrado.");
    }

    Object.assign(user, data);

    await this.userRepo.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async delete(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
        throw createHttpError(StatusCodes.NOT_FOUND, "Usuário não encontrado.");
    }

    await this.userRepo.remove(user);
  }
}