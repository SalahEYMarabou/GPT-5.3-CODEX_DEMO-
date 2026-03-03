import { Routes } from "@angular/router";
import { adminGuard } from "./core/guards/admin.guard";
import { authGuard } from "./core/guards/auth.guard";
import { AdminDashboardPageComponent } from "./pages/admin-dashboard/admin-dashboard-page.component";
import { EmployeeHistoryPageComponent } from "./pages/employee-history/employee-history-page.component";
import { EmployeeWeeklyPageComponent } from "./pages/employee-weekly/employee-weekly-page.component";
import { MetricsPageComponent } from "./pages/metrics/metrics-page.component";
import { ReportsPageComponent } from "./pages/reports/reports-page.component";
import { SignInPageComponent } from "./pages/sign-in/sign-in-page.component";

export const routes: Routes = [
  { path: "", redirectTo: "sign-in", pathMatch: "full" },
  { path: "sign-in", component: SignInPageComponent },
  {
    path: "employee/weekly",
    component: EmployeeWeeklyPageComponent,
    canActivate: [authGuard],
  },
  {
    path: "employee/history",
    component: EmployeeHistoryPageComponent,
    canActivate: [authGuard],
  },
  {
    path: "admin/dashboard",
    component: AdminDashboardPageComponent,
    canActivate: [adminGuard],
  },
  {
    path: "admin/reports",
    component: ReportsPageComponent,
    canActivate: [adminGuard],
  },
  {
    path: "admin/metrics",
    component: MetricsPageComponent,
    canActivate: [adminGuard],
  },
  { path: "**", redirectTo: "sign-in" },
];
