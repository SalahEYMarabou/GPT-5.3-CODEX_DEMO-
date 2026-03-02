import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { getWeekDates, getWeekKey, inDateRange } from '../common/date.utils';
import { JsonStorageService } from '../common/json-storage.service';
import { RuleViolation, TimesheetEntry, TimesheetStatus } from '../common/types';
import { MetricsService } from '../metrics/metrics.service';
import { SubmitWeeklyDto } from './dto/submit-weekly.dto';
import { ValidationService } from './validation.service';

@Injectable()
export class TimesheetsService {
  private readonly file = 'timesheets.json';

  constructor(
    private readonly storage: JsonStorageService,
    private readonly validationService: ValidationService,
    private readonly metricsService: MetricsService,
  ) {}

  async findAll(): Promise<TimesheetEntry[]> {
    return this.storage.read<TimesheetEntry[]>(this.file, []);
  }

  async submitWeekly(userId: string, body: SubmitWeeklyDto): Promise<TimesheetEntry[]> {
    const now = Date.now();
    const existing = await this.findAll();
    const incomingDates = new Set<string>();
    const violations: Array<{ date: string; violations: RuleViolation[] }> = [];

    for (const entry of body.entries) {
      if (incomingDates.has(entry.date)) {
        violations.push({
          date: entry.date,
          violations: [
            {
              code: 'DUPLICATE_ENTRY',
              message: 'Duplicate date within payload.',
              details: { date: entry.date },
            },
          ],
        });
        continue;
      }
      incomingDates.add(entry.date);

      const entryViolations = this.validationService.validateNewEntry(userId, entry.date, entry.status, existing);
      if (entryViolations.length > 0) {
        violations.push({ date: entry.date, violations: entryViolations });
      }
    }

    const validationDuration = Date.now() - now;
    this.metricsService.recordValidation(validationDuration);
    const violationCount = violations.reduce((acc, item) => acc + item.violations.length, 0);
    this.metricsService.recordViolation(body.weekStart, violationCount);

    if (violations.length > 0) {
      throw new BadRequestException({
        error: 'RULE_VIOLATION',
        message: 'Timesheet submission blocked by business rules.',
        violations,
      });
    }

    const created = body.entries.map((entry) => {
      const row: TimesheetEntry = {
        id: uuid(),
        userId,
        date: entry.date,
        status: entry.status as TimesheetStatus,
        createdAt: new Date().toISOString(),
      };
      this.metricsService.recordSubmission(entry.date);
      return row;
    });

    await this.storage.write(this.file, [...existing, ...created]);
    return created;
  }

  async getWeek(userId: string, weekStart: string): Promise<TimesheetEntry[]> {
    const entries = await this.findAll();
    const dates = new Set(getWeekDates(weekStart));
    return entries.filter((entry) => entry.userId === userId && dates.has(entry.date));
  }

  async getHistory(userId: string, mode: 'weekly' | 'monthly', from: string, to: string): Promise<unknown> {
    const entries = await this.findAll();
    const scoped = entries.filter((entry) => entry.userId === userId && inDateRange(entry.date, from, to));

    if (mode === 'monthly') {
      const byMonth = scoped.reduce<Record<string, TimesheetEntry[]>>((acc, entry) => {
        const key = entry.date.slice(0, 7);
        acc[key] = acc[key] || [];
        acc[key].push(entry);
        return acc;
      }, {});
      return byMonth;
    }

    const byWeek = scoped.reduce<Record<string, TimesheetEntry[]>>((acc, entry) => {
      const key = getWeekKey(entry.date);
      acc[key] = acc[key] || [];
      acc[key].push(entry);
      return acc;
    }, {});
    return byWeek;
  }

  async getWfhCounter(userId: string, weekStart: string): Promise<{ week: string; wfhCount: number; max: number }> {
    const weekEntries = await this.getWeek(userId, weekStart);
    const wfhCount = weekEntries.filter((entry) => entry.status === 'wfh').length;
    return {
      week: getWeekKey(weekStart),
      wfhCount,
      max: Number(process.env.MAX_WFH_PER_WEEK || 3),
    };
  }
}
