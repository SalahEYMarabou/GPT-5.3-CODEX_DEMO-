import { IsArray, IsIn, IsISO8601, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WeeklyEntryDto {
  @IsISO8601({ strict: true }, { message: 'date must be YYYY-MM-DD' })
  date!: string;

  @IsIn(['onsite', 'wfh', 'leave'])
  status!: 'onsite' | 'wfh' | 'leave';
}

export class SubmitWeeklyDto {
  @IsISO8601({ strict: true }, { message: 'weekStart must be YYYY-MM-DD' })
  weekStart!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyEntryDto)
  entries!: WeeklyEntryDto[];
}
