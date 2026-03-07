import * as AWS from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3Lib } from './constants/do-spaces-service-lib.constant';
import { S3Service } from './s3.service';

@Module({
  providers: [
    S3Service,
    {
      provide: S3Lib,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new AWS.S3({
          endpoint: configService.getOrThrow<string>('S3_ENDPOINT'),
          region: configService.getOrThrow<string>('S3_REGION'),
          credentials: {
            accessKeyId: configService.getOrThrow<string>('MINIO_ROOT_USER'),
            secretAccessKey: configService.getOrThrow<string>(
              'MINIO_ROOT_PASSWORD',
            ),
          },
        });
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
