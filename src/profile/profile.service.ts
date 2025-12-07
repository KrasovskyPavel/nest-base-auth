import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUsersDto } from './dto/get-users.dto';
import { DEFAULT_PAGE_SIZE } from 'src/common/constants';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

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
      : {};

    return this.prismaService.user.findMany({
      where,
      take: getUsersDto.limit ?? DEFAULT_PAGE_SIZE,
      skip: getUsersDto.skip,
    });
  }
}
