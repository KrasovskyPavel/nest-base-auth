import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

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
}
