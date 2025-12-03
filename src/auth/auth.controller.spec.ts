import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
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

      const expectedResult = { accessToken: 'access-token-123' };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(mockResponse, mockDto);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(mockResponse, mockDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const mockDto: LoginRequest = {
        identifier: 'testuser',
        password: '123asdf',
      };

      const expectedResult = { accessToken: 'access-token-123' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(mockResponse, mockDto);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(mockResponse, mockDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with Request and Response', async () => {
      const mockRequest = {
        cookies: {
          refreshToken: 'valid-refresh-token',
        },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const expectedResult = { accessToken: 'new-access-token' };
      mockAuthService.refresh.mockResolvedValue(expectedResult);

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(result).toEqual(expectedResult);
      expect(authService.refresh).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(authService.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with Response', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      mockAuthService.logout.mockResolvedValue(true);

      const result = await controller.logout(mockResponse);

      expect(result).toBe(true);
      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('me', () => {
    it('should return user from request', async () => {
      const mockUser = {
        id: 'user-id-123',
        login: 'testuser',
        email: 'test@example.com',
        age: 25,
        description: 'Test user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const result = await controller.me(mockRequest);

      expect(result).toEqual(mockUser);
      expect(result).toBe(mockRequest.user);
    });

    it('should return user with all properties', async () => {
      const mockUser = {
        id: 'user-id-456',
        login: 'john_doe',
        email: 'john@example.com',
        age: 30,
        description: 'Software developer',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const result = await controller.me(mockRequest);

      expect(result).toHaveProperty('id', 'user-id-456');
      expect(result).toHaveProperty('login', 'john_doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('age', 30);
    });
  });
});
