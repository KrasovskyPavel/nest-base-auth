import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterRequest } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface';
import { LoginRequest } from './dto/login.dto';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;

  constructor(
    private readonly userRepository: UserRepository,
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

    const existUser = await this.userRepository.findByLoginOrEmail(
      login,
      email,
    );

    if (existUser) {
      throw new ConflictException('User already exist');
    }

    const user = await this.userRepository.create({
      login,
      email,
      password: await hash(password),
      age,
      description,
    });

    return this.generateTokens(user.id);
  }

  async login(dto: LoginRequest) {
    const { identifier, password } = dto;

    const user =
      await this.userRepository.findByLoginOrEmailWithPassword(identifier);

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
    const user = await this.userRepository.findById(id);

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

    const user = await this.userRepository.findByIdSelectId(payload.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.generateTokens(user.id);
  }
}
