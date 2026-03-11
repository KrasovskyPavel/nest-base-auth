import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { DEFAULT_PAGE_SIZE } from '../common/constants';
import { UserRepository } from '../repositories/user.repository';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { TransferBalanceDto } from './dto/transfer-balance.dto';

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

  async transferBalance(
    fromUserId: string,
    dto: TransferBalanceDto,
  ): Promise<{ success: true }> {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }
    const amountRounded = Math.round(dto.amount * 100) / 100;
    try {
      await this.userRepository.transferBalance(
        fromUserId,
        dto.toUserId,
        amountRounded,
      );
      return { success: true };
    } catch (err) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_BALANCE') {
        throw new BadRequestException('Insufficient balance');
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
  }
}
