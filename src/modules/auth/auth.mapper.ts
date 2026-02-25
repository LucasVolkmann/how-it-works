import type { User } from '../../domain/entities/user.entity.js';

export default class AuthMapper {
  static mapAuthenticatedUserOutputDTO(user: User, token: string) {
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
