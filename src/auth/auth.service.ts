import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequest } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface';
import { LoginRequest } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
  }

  async register(dto: RegisterRequest) {
    const { login, email, password, age, description } = dto;

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
        password: await hash(password),
        age,
        description,
      },
    });

    return this.generateTokens(user.id);
  }

  async login(dto: LoginRequest) {
    const { identifier, password } = dto;

    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ login: identifier }, { email: identifier }],
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await verify(user.password, password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  async logout() {
    return true;
  }

  async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return {
      refreshToken,
      accessToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.generateTokens(user.id);
  }
}
