import { Injectable } from '@nestjs/common';
import { GetUsersDto } from './dto/get-users.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/constants';
import { UserRepository } from 'src/repositories/user.repository';
import { GetActiveUsersDto } from './dto/get-active-users.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(getUsersDto: GetUsersDto) {
    const where = getUsersDto.search
      ? {
          OR: [
            {
              login: {
                contains: getUsersDto.search,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: getUsersDto.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    return this.userRepository.findMany({
      where,
      take: getUsersDto.limit ?? DEFAULT_PAGE_SIZE,
      skip: getUsersDto.skip,
    });
  }

  async getActiveUsers(getActiveUsersDto: GetActiveUsersDto) {
    return this.userRepository.findManyActiveUsers({
      minAge: getActiveUsersDto.minAge,
      maxAge: getActiveUsersDto.maxAge,
      take: getActiveUsersDto.limit ?? DEFAULT_PAGE_SIZE,
      skip: getActiveUsersDto.skip,
    });
  }
}
