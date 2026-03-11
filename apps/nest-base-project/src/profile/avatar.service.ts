import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IFileService } from '../providers/files.adapter';
import type { IUploadedMulterFile } from '../providers/s3/interfaces/upload-file.interface';
import { AvatarRepository } from '../repositories/avatar.repository';
import { Avatar } from '@prisma/client';

const MAX_ACTIVE_AVATARS = 5;
const AVATARS_FOLDER = 'avatars';

@Injectable()
export class AvatarService {
  constructor(
    private readonly avatarRepository: AvatarRepository,
    private readonly fileService: IFileService,
  ) {}

  async uploadAvatar(
    userId: string,
    file: IUploadedMulterFile,
  ): Promise<Avatar> {
    const count = await this.avatarRepository.countActiveByUserId(userId);
    if (count >= MAX_ACTIVE_AVATARS) {
      throw new BadRequestException(
        `Maximum ${MAX_ACTIVE_AVATARS} active avatars allowed`,
      );
    }

    const ext = this.getExtension(file.originalname);
    const name = `${randomUUID()}${ext}`;

    const { path } = await this.fileService.uploadFile({
      folder: AVATARS_FOLDER,
      file,
      name,
    });

    return this.avatarRepository.create({ userId, path });
  }

  async deleteAvatar(userId: string, avatarId: string): Promise<void> {
    const avatar = await this.avatarRepository.findByIdAndUserId(
      avatarId,
      userId,
    );
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }
    if (!avatar.isActive) {
      throw new NotFoundException('Avatar already deleted');
    }

    await this.avatarRepository.setInactive(avatarId);

    try {
      await this.fileService.removeFile({ path: avatar.path });
    } catch {
      // Файл в MinIO можно не удалять — запись уже неактивна
    }
  }

  private getExtension(originalname: string): string {
    const lastDot = originalname.lastIndexOf('.');
    if (lastDot === -1) return '';
    return originalname.slice(lastDot);
  }
}
