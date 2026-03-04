import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
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
import { TransferBalanceDto } from './dto/transfer-balance.dto';
import { ProfileCacheInterceptor } from './interceptors/profile-cache.interceptor';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly avatarService: AvatarService,
  ) {}

  @Authorization()
  @UseInterceptors(ProfileCacheInterceptor)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  me(@ReqField('user') user: RequestUser) {
    this.logger.log(`GET /profile/me: returning profile (userId=${user.id})`);
    return user;
  }

  @Authorization()
  @UseInterceptors(ProfileCacheInterceptor)
  @Get('get-all-users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() getUsersDto: GetUsersDto) {
    this.logger.log(
      `GET /profile/get-all-users: returning all users (cache miss, query: limit=${getUsersDto.limit ?? 'default'}, skip=${getUsersDto.skip ?? 0})`,
    );
    return this.profileService.getAllUsers(getUsersDto);
  }

  @Authorization()
  @Get('get-active-users')
  @HttpCode(HttpStatus.OK)
  async getActiveUsers(@Query() getActiveUsersDto: GetActiveUsersDto) {
    this.logger.log(
      `GET /profile/get-active-users: minAge=${getActiveUsersDto.minAge ?? '-'}, maxAge=${getActiveUsersDto.maxAge ?? '-'}, limit=${getActiveUsersDto.limit ?? 'default'}, skip=${getActiveUsersDto.skip ?? 0}`,
    );
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
    this.logger.log(
      `POST /profile/avatars: uploading avatar for userId=${user.id}`,
    );
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

  @ApiOperation({
    summary: 'Transfer balance',
    description:
      "Transfer money from the current user's balance to another user. Amount must be at least 0.01 with up to 2 decimal places. Balance cannot go negative.",
  })
  @ApiBody({
    type: TransferBalanceDto,
    examples: {
      transfer: {
        summary: 'Transfer 10.50 to user',
        value: {
          toUserId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 10.5,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Transfer completed successfully',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Insufficient balance, invalid amount, or transfer to yourself',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Insufficient balance' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Recipient user not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @Authorization()
  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transferBalance(
    @ReqField('user') user: RequestUser,
    @Body() dto: TransferBalanceDto,
  ) {
    this.logger.log(
      `POST /profile/transfer: userId=${user.id}, toUserId=${dto.toUserId}, amount=${dto.amount}`,
    );
    const result = await this.profileService.transferBalance(user.id, dto);
    this.logger.log(
      `POST /profile/transfer: success userId=${user.id} to toUserId=${dto.toUserId}, amount=${dto.amount}`,
    );
    return result;
  }
}
