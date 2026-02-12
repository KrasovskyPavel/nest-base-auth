import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { AvatarService } from './avatar.service';
import { UserRepository } from 'src/repositories/user.repository';
import { AvatarRepository } from 'src/repositories/avatar.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FilesModule } from 'src/providers/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ProfileController],
  providers: [ProfileService, AvatarService, UserRepository, AvatarRepository],
})
export class ProfileModule {}
