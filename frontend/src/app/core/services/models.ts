export type Role = "employee" | "admin";
export type Status = "onsite" | "wfh" | "leave";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface TimesheetEntry {
  id: string;
  userId: string;
  date: string;
  status: Status;
  createdAt: string;
}
