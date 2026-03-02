import { Injectable } from '@nestjs/common';
import { RuleViolation } from '../common/types';
import { TimesheetsService } from '../timesheets/timesheets.service';

@Injectable()
export class SummariesService {
  private readonly teamSize = Number(process.env.TEAM_SIZE || 22);
  private readonly minOnsite = Number(process.env.MIN_ONSITE || 8);

  constructor(private readonly timesheetsService: TimesheetsService) {}

  async getDailySummaries(from: string, to: string) {
    const entries = await this.timesheetsService.findAll();
    const byDate = entries
      .filter((entry) => entry.date >= from && entry.date <= to)
      .reduce<Record<string, typeof entries>>((acc, entry) => {
        acc[entry.date] = acc[entry.date] || [];
        acc[entry.date].push(entry);
        return acc;
      }, {});

    return Object.keys(byDate)
      .sort()
      .map((date) => {
        const rows = byDate[date];
        const onsiteCount = rows.filter((row) => row.status === 'onsite').length;
        const wfhCount = rows.filter((row) => row.status === 'wfh').length;
        const leaveCount = rows.filter((row) => row.status === 'leave').length;
        const projectedOnsite = this.teamSize - (wfhCount + leaveCount);

        const violations: RuleViolation[] = [];
        if (projectedOnsite < this.minOnsite) {
          violations.push({
            code: 'MIN_ONSITE_BREACH',
            message: 'Minimum onsite rule failed for the day.',
            details: {
              date,
              minOnsite: this.minOnsite,
              projectedOnsite,
            },
          });
        }

        return {
          date,
          onsiteCount,
          wfhCount,
          leaveCount,
          violations,
          computedAt: new Date().toISOString(),
        };
      });
  }
}
