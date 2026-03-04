import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { GetUsersDto } from './dto/get-users.dto';
import { Decimal } from 'generated/prisma/runtime/library';

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockProfileService = {
    getAllUsers: jest.fn(),
  };

  const mockUser = {
    id: '1',
    login: 'testuser',
    email: 'test@example.com',
    password: 'hashed-password',
    age: 25,
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
    balance: new Decimal('100'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('me', () => {
    it('should return user from ReqField decorator', () => {
      const result = controller.me(mockUser);

      expect(result).toEqual(mockUser);
      expect(result).toBe(mockUser);
    });

    it('should return user with all properties', () => {
      const testUser = {
        id: '123',
        login: 'john_doe',
        email: 'john@example.com',
        password: 'hashed-password',
        age: 30,
        description: 'Software developer',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        balance: new Decimal('100'),
      };

      const result = controller.me(testUser);

      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('login', 'john_doe');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('age', 30);
    });
  });

  describe('getAllUsers', () => {
    it('should call profileService.getAllUsers with DTO and return result', async () => {
      const dto: GetUsersDto = {
        limit: 10,
        skip: 0,
        search: 'test',
      };
      const mockUsers = [mockUser];
      mockProfileService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(mockProfileService.getAllUsers).toHaveBeenCalledWith(dto);
      expect(mockProfileService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle empty DTO', async () => {
      const dto: GetUsersDto = {};
      const mockUsers = [mockUser];
      mockProfileService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(mockProfileService.getAllUsers).toHaveBeenCalledWith(dto);
    });

    it('should handle pagination parameters', async () => {
      const dto: GetUsersDto = {
        limit: 5,
        skip: 10,
      };
      const mockUsers = [mockUser];
      mockProfileService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(mockProfileService.getAllUsers).toHaveBeenCalledWith({
        limit: 5,
        skip: 10,
      });
    });

    it('should return empty array when no users found', async () => {
      const dto: GetUsersDto = {};
      mockProfileService.getAllUsers.mockResolvedValue([]);

      const result = await controller.getAllUsers(dto);

      expect(result).toEqual([]);
      expect(mockProfileService.getAllUsers).toHaveBeenCalledWith(dto);
    });
  });
});
