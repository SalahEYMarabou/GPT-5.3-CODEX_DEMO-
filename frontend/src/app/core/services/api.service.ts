import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly baseUrl = this.resolveBaseUrl();

  constructor(private readonly authService: AuthService) {}

  private resolveBaseUrl(): string {
    const configured = (
      window as unknown as {
        API_BASE_URL?: string;
      }
    ).API_BASE_URL;

    if (configured?.trim()) {
      const normalized = configured.trim().replace(/\/$/, "");
      if (
        normalized.startsWith("http://") ||
        normalized.startsWith("https://") ||
        normalized.startsWith("/")
      ) {
        return normalized;
      }

      return `https://${normalized}`;
    }

    return window.location.hostname === "localhost"
      ? "http://localhost:3000/api"
      : "/api";
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.authService.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!response.ok) {
      throw await response.json();
    }
    return (await response.json()) as T;
  }

  async post<T>(path: string, payload: unknown): Promise<T> {
    const headers = await this.authService.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await response.json();
    }

    return (await response.json()) as T;
  }

  async download(path: string): Promise<void> {
    const headers = await this.authService.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!response.ok) {
      throw await response.json();
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const filename =
      disposition.split("filename=")[1]?.replace(/\"/g, "") || "report";
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
