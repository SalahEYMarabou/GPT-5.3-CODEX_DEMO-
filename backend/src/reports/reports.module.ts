import { Module } from "@nestjs/common";
import { TimesheetsModule } from "../timesheets/timesheets.module";
import { UsersModule } from "../users/users.module";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [TimesheetsModule, UsersModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
