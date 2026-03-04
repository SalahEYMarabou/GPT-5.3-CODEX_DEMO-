import { Injectable, UnauthorizedException } from "@nestjs/common";
import { verifyToken } from "@clerk/backend";
import { v4 as uuid } from "uuid";
import { RequestUser } from "./request-user.interface";
import { JsonStorageService } from "../common/json-storage.service";

interface CredentialRow {
  userId: string;
  username: string;
  password: string;
}

interface SessionRow {
  token: string;
  userId: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: RequestUser["role"];
  createdAt: string;
  clerkUserId?: string;
}

@Injectable()
export class AuthService {
  private readonly secretKey = process.env.CLERK_SECRET_KEY;
  private readonly publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

  constructor(private readonly storage: JsonStorageService) {}

  private defaultUsers(): UserRow[] {
    return Array.from({ length: 22 }, (_, index) => {
      const number = index + 1;
      const isAdmin = number <= 2;
      return {
        id: `user-${number}`,
        name:
          number === 1
            ? "Admin"
            : isAdmin
              ? `Admin ${number}`
              : `Employee ${number}`,
        email: `employee${number}@example.com`,
        role: isAdmin ? "admin" : "employee",
        createdAt: new Date().toISOString(),
      };
    });
  }

  private defaultCredentials(users: UserRow[]): CredentialRow[] {
    return users.map((user, index) => ({
      userId: user.id,
      username: user.email,
      password: index < 2 ? "Admin@123" : "Employee@123",
    }));
  }

  isMockMode(): boolean {
    return !(this.secretKey && this.publishableKey);
  }

  private async readJson<T>(fileName: string, fallback: T): Promise<T> {
    return this.storage.read<T>(fileName, fallback);
  }

  private async writeJson<T>(fileName: string, payload: T): Promise<void> {
    await this.storage.write(fileName, payload);
  }

  async loginWithPassword(
    username: string,
    password: string,
  ): Promise<{ token: string; user: RequestUser }> {
    if (!this.isMockMode()) {
      throw new UnauthorizedException(
        "Username/password login is available only in mock mode.",
      );
    }

    const defaultUsers = this.defaultUsers();
    const users = await this.readJson<UserRow[]>("users.json", defaultUsers);
    const credentials = await this.readJson<CredentialRow[]>(
      "credentials.json",
      this.defaultCredentials(users),
    );

    const match = credentials.find(
      (row) =>
        row.username.toLowerCase() === username.toLowerCase() &&
        row.password === password,
    );

    if (!match) {
      throw new UnauthorizedException("Invalid username or password.");
    }

    const user = users.find((row) => row.id === match.userId);
    if (!user) {
      throw new UnauthorizedException("User profile not found.");
    }

    const sessions = await this.readJson<SessionRow[]>("sessions.json", []);
    const token = uuid();
    const created: SessionRow = {
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    await this.writeJson("sessions.json", [...sessions, created]);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clerkUserId: user.clerkUserId,
      },
    };
  }

  private async resolveMockUserByToken(
    token: string,
  ): Promise<RequestUser | null> {
    const defaultUsers = this.defaultUsers();
    const sessions = await this.readJson<SessionRow[]>("sessions.json", []);
    const users = await this.readJson<UserRow[]>("users.json", defaultUsers);
    const session = sessions.find((row) => row.token === token);

    if (!session) {
      return null;
    }

    const user = users.find((row) => row.id === session.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clerkUserId: user.clerkUserId,
    };
  }

  async resolveUser(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<RequestUser> {
    if (this.isMockMode()) {
      const authHeader = headers.authorization as string | undefined;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

      if (token) {
        const userFromToken = await this.resolveMockUserByToken(token);
        if (userFromToken) {
          return userFromToken;
        }
      }

      const mockUserId = headers["x-mock-user-id"] as string | undefined;
      if (mockUserId) {
        return {
          id: mockUserId,
          email: (headers["x-mock-email"] as string) || "employee1@example.com",
          name: (headers["x-mock-name"] as string) || "Employee 1",
          role: ((headers["x-mock-role"] as string) ||
            "employee") as RequestUser["role"],
        };
      }

      throw new UnauthorizedException("Login required.");
    }

    const authHeader = headers.authorization as string | undefined;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!token || !this.secretKey) {
      throw new UnauthorizedException("Missing Clerk bearer token.");
    }

    const payload = await verifyToken(token, { secretKey: this.secretKey });

    return {
      id: payload.sub,
      clerkUserId: payload.sub,
      email: (payload.email as string) || "unknown@example.com",
      name: (payload.name as string) || "Clerk User",
      role:
        ((payload.publicMetadata as Record<string, unknown> | undefined)
          ?.role as RequestUser["role"]) || "employee",
    };
  }
}
