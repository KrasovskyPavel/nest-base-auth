import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ResetBalanceModule } from './reset-balance/reset-balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [createKeyv(config.getOrThrow<string>('REDIS_URI'))],
        ttl: Number(config.getOrThrow<string>('REDIS_TTL')),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.getOrThrow<string>('REDIS_URI');
        const url = new URL(redisUrl);
        const [host, portString] = url.host.split(':');
        const port = portString ? Number(portString) : 6379;
        return {
          redis: {
            host,
            port,
            password: url.password || undefined,
            username: url.username || undefined,
          },
        };
      },
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ResetBalanceModule,
  ],
})
export class AppModule {}
