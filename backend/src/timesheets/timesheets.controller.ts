import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/request-user.interface';
import { SubmitWeeklyDto } from './dto/submit-weekly.dto';
import { TimesheetsService } from './timesheets.service';

@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post('weekly')
  submitWeekly(@CurrentUser() user: RequestUser, @Body() body: SubmitWeeklyDto) {
    return this.timesheetsService.submitWeekly(user.id, body);
  }

  @Get('week')
  getWeek(@CurrentUser() user: RequestUser, @Query('weekStart') weekStart: string) {
    return this.timesheetsService.getWeek(user.id, weekStart);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: RequestUser,
    @Query('mode') mode: 'weekly' | 'monthly' = 'weekly',
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.timesheetsService.getHistory(user.id, mode, from, to);
  }

  @Get('wfh-counter')
  getWfhCounter(@CurrentUser() user: RequestUser, @Query('weekStart') weekStart: string) {
    return this.timesheetsService.getWfhCounter(user.id, weekStart);
  }
}
