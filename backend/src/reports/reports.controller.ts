import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("rows")
  rows(@Query("from") from: string, @Query("to") to: string) {
    return this.reportsService.buildEmployeeStatusRows(from, to);
  }

  @Get("csv")
  async csv(
    @Query("from") from: string,
    @Query("to") to: string,
    @Res() response: Response,
  ) {
    const csv = await this.reportsService.buildCsv(from, to);
    response.setHeader("Content-Type", "text/csv");
    response.setHeader(
      "Content-Disposition",
      'attachment; filename="timesheet-report.csv"',
    );
    response.send(csv);
  }

  @Get("pdf")
  async pdf(
    @Query("from") from: string,
    @Query("to") to: string,
    @Res() response: Response,
  ) {
    const pdf = await this.reportsService.buildPdf(from, to);
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      'attachment; filename="timesheet-report.pdf"',
    );
    response.send(pdf);
  }
}
