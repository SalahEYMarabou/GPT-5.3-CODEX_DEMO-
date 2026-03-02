export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(input: string | Date): Date {
  const date = new Date(input);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfWeek(input: string | Date): Date {
  const date = startOfWeek(input);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function getWeekDates(weekStart: string): string[] {
  const start = startOfWeek(weekStart);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toIsoDate(date);
  });
}

export function getWeekKey(date: string): string {
  return toIsoDate(startOfWeek(date));
}

export function inDateRange(target: string, from: string, to: string): boolean {
  return target >= from && target <= to;
}
