import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(dto: RegisterRequest) {
    const { login, email, password, age } = dto;

    const existUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ login: login }, { email: email }],
      },
    });

    if (existUser) {
      throw new ConflictException('User already exist');
    }

    const user = await this.prismaService.user.create({
      data: {
        login,
        email,
        password,
        age,
      },
    });

    return user;
  }
}
