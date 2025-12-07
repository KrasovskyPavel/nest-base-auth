import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthResponse } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { isDevEnvironment } from 'src/utils/isDevEnvironment.util';

@Controller('auth')
export class AuthController {
  private static readonly REFRESH_TOKEN_COOKIE_MAX_AGE_MS =
    60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds

  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  @ApiOperation({
    summary: 'Register user',
    description: 'Create new user account',
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiConflictResponse({ description: 'User already exist' })
  @ApiBadRequestResponse({ description: 'Bad request data' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequest,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    this.setCookie(res, refreshToken, this.getRefreshTokenExpirationDate());
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Login into account',
    description: 'Authorize user and get access tokens',
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiBadRequestResponse({ description: 'Bad request data' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequest,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setCookie(res, refreshToken, this.getRefreshTokenExpirationDate());
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Refresh tokens',
    description: 'Refresh access and refresh tokens',
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);
    this.setCookie(res, newRefreshToken, this.getRefreshTokenExpirationDate());
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Logout from account',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));
    return await this.authService.logout();
  }

  private getRefreshTokenExpirationDate(): Date {
    return new Date(
      Date.now() + AuthController.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
    );
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDevEnvironment(this.configService),
      sameSite: isDevEnvironment(this.configService) ? 'none' : 'lax',
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request) {
    return req.user;
  }
}
