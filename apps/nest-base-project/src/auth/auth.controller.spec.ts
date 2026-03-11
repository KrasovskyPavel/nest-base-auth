/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string> = {
        COOKIE_DOMAIN: 'localhost',
        NODE_ENV: 'test',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user and set cookie', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const mockDto: RegisterRequest = {
        login: 'testuser',
        email: 'test@example.com',
        password: '123asdf',
        age: 20,
        description: 'Test description',
      };

      const serviceResult = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      };
      mockAuthService.register.mockResolvedValue(serviceResult);

      const result = await controller.register(mockResponse, mockDto);

      expect(result).toEqual({ accessToken: 'access-token-123' });
      expect(mockAuthService.register).toHaveBeenCalledWith(mockDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-456',
        expect.objectContaining({
          httpOnly: true,
          domain: 'localhost',
        }),
      );
    });
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const mockDto: LoginRequest = {
        identifier: 'testuser',
        password: '123asdf',
      };

      const serviceResult = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      };
      mockAuthService.login.mockResolvedValue(serviceResult);

      const result = await controller.login(mockResponse, mockDto);

      expect(result).toEqual({ accessToken: 'access-token-123' });
      expect(mockAuthService.login).toHaveBeenCalledWith(mockDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-456',
        expect.objectContaining({
          httpOnly: true,
          domain: 'localhost',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set cookie', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const refreshToken = 'valid-refresh-token';

      const serviceResult = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockAuthService.refresh.mockResolvedValue(serviceResult);

      const result = await controller.refresh(refreshToken, mockResponse);

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(mockAuthService.refresh).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          domain: 'localhost',
        }),
      );
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookie', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      mockAuthService.logout.mockReturnValue(true);

      const result = controller.logout(mockResponse);

      expect(result).toBe(true);
      expect(mockAuthService.logout).toHaveBeenCalledWith();
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          domain: 'localhost',
          expires: new Date(0),
        }),
      );
    });
  });

  describe('me', () => {
    it('should return user from ReqField decorator', () => {
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

      const result = controller.me(mockUser);

      expect(result).toEqual(mockUser);
      expect(result).toBe(mockUser);
    });

    it('should return user with all properties', () => {
      const mockUser = {
        id: 'user-id-456',
        login: 'john_doe',
        email: 'john@example.com',
        password: 'hashed-password',
        age: 30,
        description: 'Software developer',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const result = controller.me(mockUser);

      expect(result).toHaveProperty('id', 'user-id-456');
      expect(result).toHaveProperty('login', 'john_doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('age', 30);
    });
  });
});
