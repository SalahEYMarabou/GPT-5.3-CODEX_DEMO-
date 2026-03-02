import { Injectable } from '@nestjs/common';
import { endOfWeek, getWeekKey, startOfWeek } from '../common/date.utils';
import { RuleViolation, TimesheetEntry, TimesheetStatus } from '../common/types';

@Injectable()
export class ValidationService {
  private readonly teamSize = Number(process.env.TEAM_SIZE || 22);
  private readonly minOnsite = Number(process.env.MIN_ONSITE || 8);
  private readonly maxWfhPerWeek = Number(process.env.MAX_WFH_PER_WEEK || 3);

  validateNewEntry(
    userId: string,
    date: string,
    status: TimesheetStatus,
    existingEntries: TimesheetEntry[],
  ): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const duplicate = existingEntries.some((entry) => entry.userId === userId && entry.date === date);
    if (duplicate) {
      violations.push({
        code: 'DUPLICATE_ENTRY',
        message: 'Duplicate entry for user and date is not allowed.',
        details: { userId, date },
      });
    }

    if (status === 'wfh') {
      const weekStart = startOfWeek(date);
      const weekEnd = endOfWeek(date);
      const wfhCount = existingEntries.filter(
        (entry) =>
          entry.userId === userId &&
          entry.status === 'wfh' &&
          entry.date >= weekStart.toISOString().slice(0, 10) &&
          entry.date <= weekEnd.toISOString().slice(0, 10),
      ).length;

      if (wfhCount >= this.maxWfhPerWeek) {
        violations.push({
          code: 'MAX_WFH_EXCEEDED',
          message: 'WFH limit exceeded for this week.',
          details: { userId, week: getWeekKey(date), max: this.maxWfhPerWeek },
        });
      }
    }

    if (status !== 'onsite') {
      const dayEntries = existingEntries.filter((entry) => entry.date === date);
      const nonOnsiteCount = dayEntries.filter((entry) => entry.status !== 'onsite').length;
      const projectedNonOnsite = nonOnsiteCount + 1;
      const maxNonOnsite = this.teamSize - this.minOnsite;

      if (projectedNonOnsite > maxNonOnsite) {
        violations.push({
          code: 'MIN_ONSITE_BREACH',
          message: 'Submission would break minimum onsite requirement.',
          details: {
            date,
            teamSize: this.teamSize,
            minOnsite: this.minOnsite,
            projectedOnsite: this.teamSize - projectedNonOnsite,
          },
        });
      }
    }

    return violations;
  }
}
