import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from '../repositories/user.repository';
import { ResetBalanceController } from './reset-balance.controller';
import { ResetBalanceService } from './reset-balance.service';
import { ResetBalanceProcessor } from './reset-balance.processor';
import { RESET_BALANCE_QUEUE } from './constants';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: RESET_BALANCE_QUEUE,
    }),
  ],
  controllers: [ResetBalanceController],
  providers: [ResetBalanceService, ResetBalanceProcessor, UserRepository],
})
export class ResetBalanceModule {}
