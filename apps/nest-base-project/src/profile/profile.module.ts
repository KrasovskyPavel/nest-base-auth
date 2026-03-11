import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AvatarService } from './avatar.service';
import { UserRepository } from '../repositories/user.repository';
import { AvatarRepository } from '../repositories/avatar.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../providers/files.module';
import { ProfileCacheInterceptor } from './interceptors/profile-cache.interceptor';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    AvatarService,
    UserRepository,
    AvatarRepository,
    ProfileCacheInterceptor,
  ],
})
export class ProfileModule {}
