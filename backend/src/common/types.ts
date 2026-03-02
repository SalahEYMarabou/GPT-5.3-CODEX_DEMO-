export type UserRole = "employee" | "admin";
export type TimesheetStatus = "onsite" | "wfh" | "leave";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  clerkUserId?: string;
}

export interface TimesheetEntry {
  id: string;
  userId: string;
  date: string;
  status: TimesheetStatus;
  createdAt: string;
}

export interface RuleViolation {
  code: "DUPLICATE_ENTRY" | "MAX_WFH_EXCEEDED" | "MIN_ONSITE_BREACH";
  message: string;
  details: Record<string, unknown>;
}

export interface DaySummary {
  date: string;
  onsiteCount: number;
  wfhCount: number;
  leaveCount: number;
  violations: RuleViolation[];
  computedAt: string;
}

export interface SubmitWeeklyRequest {
  weekStart: string;
  entries: Array<{ date: string; status: TimesheetStatus }>;
}
