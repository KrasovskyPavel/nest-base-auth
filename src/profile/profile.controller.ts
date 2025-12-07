import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { ReqField } from 'src/common/decorators/req-field.decorator';
import type { RequestUser } from 'src/auth/interfaces/user.interface';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Authorization()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@ReqField('user') user: RequestUser) {
    return user;
  }

  @Authorization()
  @Get('get-all-users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() getUsersDto: GetUsersDto) {
    return this.profileService.getAllUsers(getUsersDto);
  }
}
