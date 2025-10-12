import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { Request } from 'express';
import { Authorization } from 'src/auth/decorators/authorization.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Authorization()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request) {
    return req.user;
  }
}
