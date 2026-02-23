import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import { AuthService } from './auth.service.js';

vi.mock('../../shared/utils/password.utils.js', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));
vi.mock('../../shared/utils/jwt.utils.js', () => ({
  signToken: vi.fn(),
}));

import { hashPassword, comparePassword } from '../../shared/utils/password.utils.js';
import { signToken } from '../../shared/utils/jwt.utils.js';

type UserEntity = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

const DEFAULT_USER_PROPS = {
  id: 'user-id',
  name: 'Lucas',
  email: 'lucas@email.com',
};

const DEFAULT_PASSWORD = '123456';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    ...DEFAULT_USER_PROPS,
    passwordHash: 'hashed-password',
    ...overrides,
  };
}

const mockedHashPassword = hashPassword as MockedFunction<typeof hashPassword>;
const mockedComparePassword = comparePassword as MockedFunction<
  typeof comparePassword
>;
const mockedSignToken = signToken as MockedFunction<typeof signToken>;

describe('AuthService (unit)', () => {
  let authService: AuthService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    authService = new AuthService(mockRepo);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockedHashPassword.mockResolvedValue('hashed-password');
      mockRepo.create.mockReturnValue(makeUser());
      mockRepo.save.mockResolvedValue(undefined);
      mockedSignToken.mockReturnValue('fake-jwt');

      const result = await authService.register({
        name: DEFAULT_USER_PROPS.name,
        email: DEFAULT_USER_PROPS.email,
        password: DEFAULT_PASSWORD,
      });

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email: DEFAULT_USER_PROPS.email },
      });
      expect(mockedHashPassword).toHaveBeenCalledWith(DEFAULT_PASSWORD);
      expect(mockRepo.create).toHaveBeenCalledWith({
        name: DEFAULT_USER_PROPS.name,
        email: DEFAULT_USER_PROPS.email,
        passwordHash: 'hashed-password',
      });
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockedSignToken).toHaveBeenCalledWith({
        userId: DEFAULT_USER_PROPS.id,
      });

      expect(result).toEqual({
        user: DEFAULT_USER_PROPS,
        token: 'fake-jwt',
      });
    });

    it('should not allow registration with an existing email', async () => {
      mockRepo.findOne.mockResolvedValue(makeUser());

      await expect(
        authService.register({
          name: DEFAULT_USER_PROPS.name,
          email: DEFAULT_USER_PROPS.email,
          password: DEFAULT_PASSWORD,
        }),
      ).rejects.toMatchObject({
        status: StatusCodes.CONFLICT,
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const fakeUser = makeUser();
      mockRepo.findOne.mockResolvedValue(fakeUser);
      mockedComparePassword.mockResolvedValue(true);
      mockedSignToken.mockReturnValue('fake-jwt');

      const result = await authService.login({
        email: DEFAULT_USER_PROPS.email,
        password: DEFAULT_PASSWORD,
      });

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email: DEFAULT_USER_PROPS.email },
      });
      expect(mockedComparePassword).toHaveBeenCalledWith(
        DEFAULT_PASSWORD,
        fakeUser.passwordHash,
      );
      expect(mockedSignToken).toHaveBeenCalledWith({ userId: fakeUser.id });

      expect(result).toEqual({
        user: DEFAULT_USER_PROPS,
        token: 'fake-jwt',
      });
    });

    it('should fail when user is not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        authService.login({
          email: DEFAULT_USER_PROPS.email,
          password: DEFAULT_PASSWORD,
        }),
      ).rejects.toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
      });
    });

    it('should fail when password is invalid', async () => {
      mockRepo.findOne.mockResolvedValue(makeUser());
      mockedComparePassword.mockResolvedValue(false);

      await expect(
        authService.login({
          email: DEFAULT_USER_PROPS.email,
          password: 'wrong-password',
        }),
      ).rejects.toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: ReasonPhrases.UNAUTHORIZED,
      });
    });
  });
});
