import { Module } from '@nestjs/common';
import { JsonStorageService } from '../common/json-storage.service';
import { MetricsModule } from '../metrics/metrics.module';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { ValidationService } from './validation.service';

@Module({
  imports: [MetricsModule],
  controllers: [TimesheetsController],
  providers: [TimesheetsService, ValidationService, JsonStorageService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
