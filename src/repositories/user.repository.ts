import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import type { UserWithLastAvatar } from 'src/profile/interfaces/user.interface';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByLoginOrEmail(login: string, email: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ login }, { email }],
      },
    });
  }

  async findByLoginOrEmailWithPassword(
    identifier: string,
  ): Promise<{ id: string; password: string } | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ login: identifier }, { email: identifier }],
      },
      select: {
        id: true,
        password: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdSelectId(id: string): Promise<{ id: string } | null> {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }

  async create(data: {
    login: string;
    email: string;
    password: string;
    age: number;
    description?: string | null;
  }): Promise<User> {
    return this.prismaService.user.create({
      data,
    });
  }

  async findMany(options: {
    where?: {
      OR?: Array<{
        login?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    };
    take?: number;
    skip?: number;
  }): Promise<User[]> {
    return this.prismaService.user.findMany(options);
  }

  async findManyActiveUsers(options: {
    minAge?: number;
    maxAge?: number;
    take?: number;
    skip?: number;
  }): Promise<UserWithLastAvatar[]> {
    const userIdsWithManyActiveAvatars =
      await this.prismaService.avatar.groupBy({
        by: ['userId'],
        where: { isActive: true },
        _count: { id: true },
        having: {
          userId: { _count: { gte: 2 } },
        },
      });

    const userIds = userIdsWithManyActiveAvatars.map((r) => r.userId);
    if (userIds.length === 0) {
      return [];
    }

    const where: {
      id: { in: string[] };
      AND: Array<{ description?: { not: null | string } }>;
      age?: { gte?: number; lte?: number };
    } = {
      id: { in: userIds },
      AND: [{ description: { not: null } }, { description: { not: '' } }],
    };

    if (options.minAge != null || options.maxAge != null) {
      where.age = {};
      if (options.minAge != null) where.age.gte = options.minAge;
      if (options.maxAge != null) where.age.lte = options.maxAge;
    }

    const rows = await this.prismaService.user.findMany({
      where,
      take: options.take,
      skip: options.skip,
      select: {
        id: true,
        login: true,
        email: true,
        age: true,
        description: true,
        avatars: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            path: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    return rows.map(({ avatars, ...user }) => ({
      ...user,
      lastAvatar: avatars[0] ?? null,
    }));
  }

  async transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const from = await tx.user.findUniqueOrThrow({
        where: { id: fromUserId },
        select: { balance: true },
      });
      const fromBalance = Number(from.balance);
      if (fromBalance < amount) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      await tx.user.findUniqueOrThrow({
        where: { id: toUserId },
        select: { id: true },
      });
      await tx.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: amount } },
      });
      await tx.user.update({
        where: { id: toUserId },
        data: { balance: { increment: amount } },
      });
    });
  }
}
