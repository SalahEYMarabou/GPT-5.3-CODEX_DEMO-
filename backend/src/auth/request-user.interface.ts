import { UserRole } from "../common/types";

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clerkUserId?: string;
}
