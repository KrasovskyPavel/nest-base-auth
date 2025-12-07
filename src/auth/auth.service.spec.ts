import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterRequest } from './dto/register.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginRequest } from './dto/login.dto';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let configService: ConfigService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findByLoginOrEmail: jest.fn(),
    findByLoginOrEmailWithPassword: jest.fn(),
    findById: jest.fn(),
    findByIdSelectId: jest.fn(),
    create: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config = {
        JWT_ACCESS_TOKEN_TTL: '15m',
        JWT_REFRESH_TOKEN_TTL: '7d',
        COOKIE_DOMAIN: 'localhost',
        NODE_ENV: 'test',
      };
      return config[key];
    }),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const mockDto: RegisterRequest = {
      login: 'testuser',
      email: 'test@example.com',
      password: '123asdf',
      age: 20,
      description: 'test description',
    };

    const createdUser = {
      id: 'user-id-123',
      login: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      age: 20,
      description: 'test description',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findByLoginOrEmail.mockResolvedValue(null);

      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      mockUserRepository.create.mockResolvedValue(createdUser);

      mockJwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');

      const result = await service.register(mockDto);

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(userRepository.findByLoginOrEmail).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
      );

      expect(userRepository.create).toHaveBeenCalledWith({
        login: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password',
        age: 20,
        description: 'test description',
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = {
        id: 'existing-id',
        login: 'testuser',
        email: 'test@example.com',
      };
      mockUserRepository.findByLoginOrEmail.mockResolvedValue(existingUser);

      await expect(service.register(mockDto)).rejects.toThrow(
        ConflictException,
      );

      await expect(service.register(mockDto)).rejects.toThrow(
        'User already exist',
      );

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const mockDto: LoginRequest = {
      identifier: 'testuser',
      password: '123asdf',
    };

    const foundUser = {
      id: 'user-id-123',
      password: 'hashed-password-from-db',
    };

    it('should login user successfully with correct credentials', async () => {
      mockUserRepository.findByLoginOrEmailWithPassword.mockResolvedValue(
        foundUser,
      );

      (argon2.verify as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');

      const result = await service.login(mockDto);

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      });

      expect(
        userRepository.findByLoginOrEmailWithPassword,
      ).toHaveBeenCalledWith('testuser');

      expect(argon2.verify).toHaveBeenCalledWith(
        'hashed-password-from-db',
        '123asdf',
      );

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findByLoginOrEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(mockDto)).rejects.toThrow(NotFoundException);

      await expect(service.login(mockDto)).rejects.toThrow('User not found');

      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if password is incorrect', async () => {
      mockUserRepository.findByLoginOrEmailWithPassword.mockResolvedValue(
        foundUser,
      );

      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockDto)).rejects.toThrow(NotFoundException);

      await expect(service.login(mockDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(argon2.verify).toHaveBeenCalledWith(
        'hashed-password-from-db',
        '123asdf',
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const result = await service.logout();

      expect(result).toBe(true);
    });
  });

  describe('validate', () => {
    const mockUser = {
      id: 'user-id-123',
      login: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      age: 25,
      description: 'Test user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validate('user-id-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user-id-123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.validate('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.validate('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('refresh', () => {
    const mockRefreshToken = 'valid-refresh-token';

    const mockPayload = {
      id: 'user-id-123',
    };

    it('should refresh tokens successfully', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      mockUserRepository.findByIdSelectId.mockResolvedValue({
        id: 'user-id-123',
      });

      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refresh(mockRefreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
      );

      expect(userRepository.findByIdSelectId).toHaveBeenCalledWith(
        'user-id-123',
      );

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      await expect(service.refresh('')).rejects.toThrow(UnauthorizedException);

      await expect(service.refresh('')).rejects.toThrow(
        'Invalid refresh token',
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found after token verification', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      mockUserRepository.findByIdSelectId.mockResolvedValue(null);

      await expect(service.refresh(mockRefreshToken)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.refresh(mockRefreshToken)).rejects.toThrow(
        'User not found',
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
