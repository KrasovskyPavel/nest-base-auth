import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Avatar } from '@prisma/client';

@Injectable()
export class AvatarRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: { userId: string; path: string }): Promise<Avatar> {
    return this.prismaService.avatar.create({
      data,
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.prismaService.avatar.count({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async findById(id: string): Promise<Avatar | null> {
    return this.prismaService.avatar.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Avatar | null> {
    return this.prismaService.avatar.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async setInactive(id: string): Promise<Avatar> {
    return this.prismaService.avatar.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
