import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Nest Auth API')
    .setDescription('Api documentation for base auth')
    .setVersion('1.0.0')
    .setContact('Pavel Krasousky', 'https://github.com/KrasovskyPavel', '')
    .addBearerAuth()
    .build();
}
