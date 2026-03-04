import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Queue } from 'bull';
import { RESET_BALANCE_QUEUE } from './constants';

const RESET_BALANCE_JOB = 'reset-all-balances';

@Injectable()
export class ResetBalanceService {
  private readonly logger = new Logger(ResetBalanceService.name);

  constructor(
    @InjectQueue(RESET_BALANCE_QUEUE)
    private readonly resetBalanceQueue: Queue,
  ) {}

  async enqueueResetBalances() {
    this.logger.log('Enqueuing reset balances job (manual trigger)');
    return this.resetBalanceQueue.add(RESET_BALANCE_JOB, {});
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async enqueueResetBalancesPeriodic() {
    this.logger.log(
      'Enqueuing reset balances job (scheduled every 10 minutes)',
    );
    await this.resetBalanceQueue.add(RESET_BALANCE_JOB, {});
  }
}
