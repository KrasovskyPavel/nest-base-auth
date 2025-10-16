import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/pagination';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllUsers(paginationDto: PaginationDto) {
    return this.prismaService.user.findMany({
      take: paginationDto.limit ?? DEFAULT_PAGE_SIZE,
      skip: paginationDto.skip,
    });
  }
}
