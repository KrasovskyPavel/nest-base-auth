import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { UserRepository } from 'src/repositories/user.repository';
import { GetUsersDto } from './dto/get-users.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/constants';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepository = module.get<UserRepository>(UserRepository);

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
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(userRepository.findMany).toHaveBeenCalledWith({
        where: undefined,
        take: DEFAULT_PAGE_SIZE,
        skip: undefined,
      });
      expect(userRepository.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return users with pagination (limit and skip)', async () => {
      const dto: GetUsersDto = {
        limit: 10,
        skip: 5,
      };
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(userRepository.findMany).toHaveBeenCalledWith({
        where: undefined,
        take: 10,
        skip: 5,
      });
    });

    it('should return users with search filter by login', async () => {
      const dto: GetUsersDto = {
        search: 'user1',
      };
      const filteredUsers = [mockUsers[0]];
      mockUserRepository.findMany.mockResolvedValue(filteredUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(filteredUsers);
      expect(userRepository.findMany).toHaveBeenCalledWith({
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
      mockUserRepository.findMany.mockResolvedValue(filteredUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(filteredUsers);
      expect(userRepository.findMany).toHaveBeenCalledWith({
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
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual(mockUsers);
      expect(userRepository.findMany).toHaveBeenCalledWith({
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
      mockUserRepository.findMany.mockResolvedValue([]);

      const result = await service.getAllUsers(dto);

      expect(result).toEqual([]);
      expect(userRepository.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
