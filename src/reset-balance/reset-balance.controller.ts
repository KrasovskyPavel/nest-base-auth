import { Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResetBalanceService } from './reset-balance.service';

@ApiTags('Reset balance')
@Controller('reset-balance')
export class ResetBalanceController {
  private readonly logger = new Logger(ResetBalanceController.name);

  constructor(private readonly resetBalanceService: ResetBalanceService) {}

  @ApiOperation({
    summary: 'Enqueue reset balances job',
    description:
      'Enqueues a background job that will reset balance to 0 for all users. The job is processed asynchronously.',
  })
  @ApiOkResponse({
    description: 'Job successfully enqueued',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        jobId: { type: 'string', example: 'reset-balance-job-123' },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  async enqueueResetBalances() {
    this.logger.log('POST /reset-balance: enqueue reset balances requested');
    const job = await this.resetBalanceService.enqueueResetBalances();
    this.logger.log(
      `POST /reset-balance: job enqueued successfully (jobId=${job.id as string})`,
    );
    return { success: true, jobId: job.id };
  }
}
