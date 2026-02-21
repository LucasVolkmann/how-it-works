import type { User } from '../../domain/entities/user.entity.js';
import type { UserOutputDTO } from './users.dto.js';

export default class UsersMapper {
  static mapOutputDto(user: User): UserOutputDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
