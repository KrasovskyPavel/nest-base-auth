import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { RESET_BALANCE_QUEUE } from './constants';
import { UserRepository } from '../repositories/user.repository';

const RESET_BALANCE_JOB = 'reset-all-balances';

@Processor(RESET_BALANCE_QUEUE)
export class ResetBalanceProcessor {
  private readonly logger = new Logger(ResetBalanceProcessor.name);

  constructor(private readonly userRepository: UserRepository) {}

  @Process(RESET_BALANCE_JOB)
  async handleResetBalances(job: Job): Promise<void> {
    const jobId = job.id as string;
    this.logger.log(`Processing reset balances job started (jobId=${jobId})`);
    try {
      const affected = await this.userRepository.resetAllBalances();
      this.logger.log(
        `Reset balances job completed (jobId=${jobId}), affected users: ${affected}`,
      );
    } catch (err) {
      this.logger.error(
        `Reset balances job failed (jobId=${jobId}): ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
  }
}
