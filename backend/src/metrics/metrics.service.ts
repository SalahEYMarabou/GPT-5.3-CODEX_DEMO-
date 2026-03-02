import { Injectable } from '@nestjs/common';
import { getWeekKey, toIsoDate } from '../common/date.utils';

interface MetricsSnapshot {
  apiCalls: number;
  avgValidationMs: number;
  totalSubmissions: number;
  submissionsByWeek: Record<string, number>;
  violationsByWeek: Record<string, number>;
}

@Injectable()
export class MetricsService {
  private apiCalls = 0;
  private totalValidationMs = 0;
  private validationRuns = 0;
  private totalSubmissions = 0;
  private submissionsByWeek: Record<string, number> = {};
  private violationsByWeek: Record<string, number> = {};

  recordApiCall(): void {
    this.apiCalls += 1;
  }

  recordValidation(durationMs: number): void {
    this.validationRuns += 1;
    this.totalValidationMs += durationMs;
  }

  recordSubmission(date: string): void {
    this.totalSubmissions += 1;
    const week = getWeekKey(date);
    this.submissionsByWeek[week] = (this.submissionsByWeek[week] || 0) + 1;
  }

  recordViolation(date: string, count: number): void {
    if (count <= 0) {
      return;
    }
    const week = getWeekKey(date);
    this.violationsByWeek[week] = (this.violationsByWeek[week] || 0) + count;
  }

  getSnapshot(): MetricsSnapshot {
    return {
      apiCalls: this.apiCalls,
      avgValidationMs: this.validationRuns ? Number((this.totalValidationMs / this.validationRuns).toFixed(2)) : 0,
      totalSubmissions: this.totalSubmissions,
      submissionsByWeek: this.submissionsByWeek,
      violationsByWeek: this.violationsByWeek,
    };
  }

  getOverview() {
    const today = toIsoDate(new Date());
    const week = getWeekKey(today);
    return {
      ...this.getSnapshot(),
      currentWeek: week,
      submissionsThisWeek: this.submissionsByWeek[week] || 0,
      violationsThisWeek: this.violationsByWeek[week] || 0,
    };
  }
}
