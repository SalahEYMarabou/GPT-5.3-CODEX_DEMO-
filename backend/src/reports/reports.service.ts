import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { TimesheetsService } from "../timesheets/timesheets.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly timesheetsService: TimesheetsService,
    private readonly usersService: UsersService,
  ) {}

  async buildEmployeeStatusRows(from: string, to: string) {
    const [users, entries] = await Promise.all([
      this.usersService.findAll(),
      this.timesheetsService.findAll(),
    ]);
    const rangeEntries = entries.filter(
      (entry) => entry.date >= from && entry.date <= to,
    );

    return users.map((user) => {
      const rows = rangeEntries.filter((entry) => entry.userId === user.id);
      return {
        userId: user.id,
        employee: user.name,
        onsite: rows.filter((row) => row.status === "onsite").length,
        wfh: rows.filter((row) => row.status === "wfh").length,
        leave: rows.filter((row) => row.status === "leave").length,
      };
    });
  }

  async buildCsv(from: string, to: string): Promise<string> {
    const rows = await this.buildEmployeeStatusRows(from, to);
    const lines = ["userId,employee,onsite,wfh,leave"];
    rows.forEach((row) => {
      lines.push(
        `${row.userId},${row.employee},${row.onsite},${row.wfh},${row.leave}`,
      );
    });
    return lines.join("\n");
  }

  async buildPdf(from: string, to: string): Promise<Buffer> {
    const rows = await this.buildEmployeeStatusRows(from, to);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 32 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text("Timesheet Report");
      doc.moveDown();
      doc.fontSize(10).text(`Range: ${from} to ${to}`);
      doc.moveDown();
      doc.text("Employee | Onsite | WFH | Leave");
      doc.moveDown(0.3);

      rows.forEach((row) => {
        doc.text(`${row.employee} | ${row.onsite} | ${row.wfh} | ${row.leave}`);
      });

      doc.end();
    });
  }
}
