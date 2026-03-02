import { Injectable, computed, signal } from "@angular/core";
import { User } from "./models";

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "timesheet.mock.token";
  private readonly userKey = "timesheet.mock.user";
  private readonly publishableKey = (
    window as unknown as { CLERK_PUBLISHABLE_KEY?: string }
  ).CLERK_PUBLISHABLE_KEY;

  private clerk: any = null;
  private readonly initialized = signal(false);
  private readonly mockUser = signal<User | null>(null);
  private readonly mockToken = signal<string>("");
  private readonly clerkUser = signal<User | null>(null);

  readonly isMockMode = computed(() => !this.publishableKey);
  readonly currentUser = computed(() =>
    this.isMockMode() ? this.mockUser() : this.clerkUser(),
  );
  readonly isAuthenticated = computed(() =>
    this.isMockMode()
      ? !!this.mockToken() && !!this.mockUser()
      : !!this.clerkUser(),
  );
  readonly isReady = computed(() =>
    this.isMockMode() ? true : this.initialized(),
  );

  async init(): Promise<void> {
    if (this.initialized()) {
      return;
    }

    if (this.isMockMode()) {
      const token = localStorage.getItem(this.tokenKey) || "";
      const userRaw = localStorage.getItem(this.userKey);
      const user = userRaw ? (JSON.parse(userRaw) as User) : null;

      this.mockToken.set(token);
      this.mockUser.set(user);
      this.initialized.set(true);
      return;
    }

    await this.loadClerkScript();
    const globalClerk = (
      window as unknown as {
        Clerk?: {
          load: (options: { publishableKey: string }) => Promise<void>;
        };
      }
    ).Clerk;

    if (!globalClerk) {
      this.initialized.set(true);
      return;
    }

    await globalClerk.load({ publishableKey: this.publishableKey as string });
    this.clerk = globalClerk;

    this.syncFromClerk();
    this.clerk.addListener(() => {
      this.syncFromClerk();
    });

    this.initialized.set(true);
  }

  private syncFromClerk(): void {
    if (!this.clerk) {
      this.clerkUser.set(null);
      return;
    }

    const user = this.clerk.user;
    if (!user) {
      this.clerkUser.set(null);
      return;
    }

    const role =
      (user.publicMetadata?.["role"] as "employee" | "admin" | undefined) ||
      "employee";
    const name =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Clerk User";
    const email =
      user.primaryEmailAddress?.emailAddress || "unknown@example.com";

    this.clerkUser.set({
      id: user.id,
      name,
      email,
      role,
    });
  }

  getClerk(): any {
    return this.clerk;
  }

  private async loadClerkScript(): Promise<void> {
    if ((window as unknown as { Clerk?: unknown }).Clerk) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-clerk="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Clerk script")),
        );
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
      script.async = true;
      script.defer = true;
      script.dataset["clerk"] = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Clerk script"));
      document.head.appendChild(script);
    });
  }

  setMockRole(role: "employee" | "admin"): void {
    this.mockUser.update((user) => (user ? { ...user, role } : user));
    const updated = this.mockUser();
    if (updated) {
      localStorage.setItem(this.userKey, JSON.stringify(updated));
    }
  }

  async loginWithPassword(username: string, password: string): Promise<void> {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const body = await response
        .json()
        .catch(() => ({ message: "Login failed." }));
      throw new Error(body.message || "Login failed.");
    }

    const payload = (await response.json()) as LoginResponse;
    this.mockToken.set(payload.token);
    this.mockUser.set(payload.user);
    localStorage.setItem(this.tokenKey, payload.token);
    localStorage.setItem(this.userKey, JSON.stringify(payload.user));
  }

  async signOut(): Promise<void> {
    if (this.isMockMode()) {
      this.mockToken.set("");
      this.mockUser.set(null);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      return;
    }

    await this.clerk?.signOut();
    this.clerkUser.set(null);
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.isMockMode()) {
      const token = this.mockToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    }

    await this.init();
    const token = await this.clerk?.session?.getToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }
}
