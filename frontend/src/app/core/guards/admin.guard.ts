import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.init();

  if (!authService.isAuthenticated()) {
    return router.parseUrl("/sign-in");
  }

  if (authService.currentUser()?.role === "admin") {
    return true;
  }

  return router.parseUrl("/employee/weekly");
};
