import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { Request } from 'express';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { PaginationDto } from './dto/pagination';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Authorization()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request) {
    return req.user;
  }

  @Authorization()
  @Get('get-all-users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() paginationDto: PaginationDto) {
    return this.profileService.getAllUsers(paginationDto);
  }
}
