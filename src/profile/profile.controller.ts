import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { AvatarService } from './avatar.service';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { ReqField } from 'src/common/decorators/req-field.decorator';
import type { RequestUser } from 'src/auth/interfaces/user.interface';
import type { IUploadedMulterFile } from 'src/providers/s3/interfaces/upload-file.interface';
import { GetActiveUsersDto } from './dto/get-active-users.dto';
import { ProfileCacheInterceptor } from './interceptors/profile-cache.interceptor';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly avatarService: AvatarService,
  ) {}

  @Authorization()
  @UseInterceptors(ProfileCacheInterceptor)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@ReqField('user') user: RequestUser) {
    return user;
  }

  @Authorization()
  @UseInterceptors(ProfileCacheInterceptor)
  @Get('get-all-users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() getUsersDto: GetUsersDto) {
    return this.profileService.getAllUsers(getUsersDto);
  }

  @Authorization()
  @Get('get-active-users')
  @HttpCode(HttpStatus.OK)
  async getActiveUsers(@Query() getActiveUsersDto: GetActiveUsersDto) {
    return this.profileService.getActiveUsers(getActiveUsersDto);
  }

  @Authorization()
  @Post('avatars')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @ReqField('user') user: RequestUser,
    @UploadedFile() file: IUploadedMulterFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.avatarService.uploadAvatar(user.id, file);
  }

  @Authorization()
  @Delete('avatars/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(
    @ReqField('user') user: RequestUser,
    @Param('id') avatarId: string,
  ) {
    await this.avatarService.deleteAvatar(user.id, avatarId);
  }
}
