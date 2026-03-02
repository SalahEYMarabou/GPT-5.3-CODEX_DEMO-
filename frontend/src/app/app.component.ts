import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "./core/services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  readonly selectedWeek = signal(new Date().toISOString().slice(0, 10));

  constructor(
    public readonly authService: AuthService,
    public readonly router: Router,
  ) {
    void this.authService.init();
  }

  get isSignInRoute(): boolean {
    return this.router.url.startsWith("/sign-in");
  }

  get isAdmin(): boolean {
    return this.authService.currentUser()?.role === "admin";
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigateByUrl("/sign-in");
  }
}
