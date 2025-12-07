import { ConfigService } from '@nestjs/config';

export const isDevEnvironment = (configService: ConfigService) => {
  return configService.getOrThrow<string>('NODE_ENV') === 'development';
};
