import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { StatusCodes } from 'http-status-codes';

import { UsersService } from './users.service.js';

vi.mock('./users.mapper.js', () => ({
  default: {
    mapOutputDto: vi.fn(),
  },
}));

import UsersMapper from './users.mapper.js';
import type { UserOutputDTO } from './users.dto.js';

const DEFAULT_USER: UserOutputDTO = {
  id: 'user-id',
  name: 'Lucas',
  email: 'lucas@email.com',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

function makeUser(overrides: Partial<UserOutputDTO> = {}): UserOutputDTO {
  return {
    ...DEFAULT_USER,
    ...overrides,
  };
}

const mockedMapOutputDto = UsersMapper.mapOutputDto as MockedFunction<
  typeof UsersMapper.mapOutputDto
>;

describe('UsersService (unit)', () => {
  let usersService: UsersService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      findOne: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };

    usersService = new UsersService(mockRepo);
  });

  describe('getById', () => {
    it('should return user when found', async () => {
      const fakeUser = makeUser();
      mockRepo.findOne.mockResolvedValue(fakeUser);
      mockedMapOutputDto.mockReturnValue(fakeUser);

      const result = await usersService.getById(fakeUser.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
      });

      expect(mockedMapOutputDto).toHaveBeenCalledWith(fakeUser);

      expect(result).toEqual(fakeUser);
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(usersService.getById('invalid-id')).rejects.toMatchObject({
        status: StatusCodes.NOT_FOUND,
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const fakeUser = makeUser();
      const updateData = { name: 'Novo Nome' };

      mockRepo.findOne.mockResolvedValue(fakeUser);
      mockRepo.save.mockResolvedValue(undefined);

      mockedMapOutputDto.mockReturnValue(fakeUser);

      const result = await usersService.update(fakeUser.id, updateData);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
      });

      expect(mockRepo.save).toHaveBeenCalledWith({
        ...fakeUser,
        ...updateData,
      });

      expect(mockedMapOutputDto).toHaveBeenCalledWith({
        ...fakeUser,
        ...updateData,
      });

      expect(result).toEqual(fakeUser);
    });

    it('should throw NOT_FOUND when updating non-existing user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        usersService.update('invalid-id', { name: 'Teste' }),
      ).rejects.toMatchObject({
        status: StatusCodes.NOT_FOUND,
      });
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const fakeUser = makeUser();
      mockRepo.findOne.mockResolvedValue(fakeUser);
      mockRepo.remove.mockResolvedValue(undefined);

      await usersService.delete(fakeUser.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
      });

      expect(mockRepo.remove).toHaveBeenCalledWith(fakeUser);
    });

    it('should throw NOT_FOUND when deleting non-existing user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(usersService.delete('invalid-id')).rejects.toMatchObject({
        status: StatusCodes.NOT_FOUND,
      });
    });
  });
});
