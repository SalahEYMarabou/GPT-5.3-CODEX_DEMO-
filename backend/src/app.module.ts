import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { ApiMetricsInterceptor } from "./metrics/api-metrics.interceptor";
import { MetricsModule } from "./metrics/metrics.module";
import { ReportsModule } from "./reports/reports.module";
import { SummariesModule } from "./summaries/summaries.module";
import { TimesheetsModule } from "./timesheets/timesheets.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TimesheetsModule,
    SummariesModule,
    MetricsModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiMetricsInterceptor,
    },
  ],
})
export class AppModule {}
