import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUsersDto } from './dto/get-users.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/constants';

describe('ProfileService', () => {
  let service: ProfileService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    const mockUsers = [
      {
        id: '1',
        login: 'user1',
        email: 'user1@test.com',
        age: 25,
        description: 'Test user 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        login: 'user2',
        email: 'user2@test.com',
        age: 30,
        description: 'Test user 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all users without filters', async () => {
      const dto: GetUsersDto = {};
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        take: DEFAULT_PAGE_SIZE,
        skip: undefined,
      });
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return users with pagination (limit and skip)', async () => {
      const dto: GetUsersDto = {
        limit: 10,
        skip: 5,
      };
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 5,
      });
    });

    it('should return users with search filter by login', async () => {
      const dto: GetUsersDto = {
        search: 'user1',
      };
      const filteredUsers = [mockUsers[0]];
      mockPrismaService.user.findMany.mockResolvedValue(filteredUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(filteredUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              login: {
                contains: 'user1',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'user1',
                mode: 'insensitive',
              },
            },
          ],
        },
        take: DEFAULT_PAGE_SIZE,
        skip: undefined,
      });
    });

    it('should return users with search filter by email', async () => {
      const dto: GetUsersDto = {
        search: 'user2@test.com',
      };
      const filteredUsers = [mockUsers[1]];
      mockPrismaService.user.findMany.mockResolvedValue(filteredUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(filteredUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              login: {
                contains: 'user2@test.com',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'user2@test.com',
                mode: 'insensitive',
              },
            },
          ],
        },
        take: DEFAULT_PAGE_SIZE,
        skip: undefined,
      });
    });

    it('should return users with search and pagination combined', async () => {
      const dto: GetUsersDto = {
        search: 'test',
        limit: 20,
        skip: 10,
      };
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              login: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
          ],
        },
        take: 20,
        skip: 10,
      });
    });

    it('should return empty array when no users found', async () => {
      const dto: GetUsersDto = {};
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual([]);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
