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
import { GetUsersDto } from './dto/get-users.dto';

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
  async getAllUsers(@Query() getUsersDto: GetUsersDto) {
    return this.profileService.getAllUsers(getUsersDto);
  }
}
