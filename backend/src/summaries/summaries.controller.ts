import { Controller, Get, Query } from '@nestjs/common';
import { SummariesService } from './summaries.service';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  @Get('daily')
  getDaily(@Query('from') from: string, @Query('to') to: string) {
    return this.summariesService.getDailySummaries(from, to);
  }
}
