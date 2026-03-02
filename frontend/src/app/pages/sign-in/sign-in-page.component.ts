import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-sign-in-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./sign-in-page.component.html",
  styleUrl: "./sign-in-page.component.scss",
})
export class SignInPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("clerkMount") clerkMount?: ElementRef<HTMLDivElement>;
  username = "";
  password = "";
  error = "";

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.init();

    if (this.authService.isMockMode()) {
      return;
    }

    if (this.authService.isAuthenticated()) {
      await this.router.navigateByUrl("/employee/weekly");
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.authService.isMockMode()) {
      return;
    }

    const clerk = this.authService.getClerk();
    const mountNode = this.clerkMount?.nativeElement;

    if (!clerk || !mountNode) {
      return;
    }

    clerk.mountSignIn(mountNode, {
      afterSignInUrl: "/employee/weekly",
      afterSignUpUrl: "/employee/weekly",
    });
  }

  ngOnDestroy(): void {
    if (this.authService.isMockMode()) {
      return;
    }

    this.authService.getClerk()?.unmountSignIn(this.clerkMount?.nativeElement);
  }

  continueMock(): void {
    void this.router.navigateByUrl("/employee/weekly");
  }

  async loginMock(): Promise<void> {
    this.error = "";
    try {
      await this.authService.loginWithPassword(this.username, this.password);
      await this.router.navigateByUrl("/employee/weekly");
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Login failed.";
    }
  }
}
