import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { Status, TimesheetEntry } from "../../core/services/models";

interface DayState {
  date: string;
  status: Status;
}

@Component({
  selector: "app-employee-weekly-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./employee-weekly-page.component.html",
  styleUrl: "./employee-weekly-page.component.scss",
})
export class EmployeeWeeklyPageComponent implements OnInit {
  readonly weekStart = signal(new Date().toISOString().slice(0, 10));
  readonly days = signal<DayState[]>([]);
  readonly warning = signal<string>("");
  readonly success = signal<string>("");
  readonly isSubmitting = signal(false);
  readonly wfhCounter = signal<{
    week: string;
    wfhCount: number;
    max: number;
  } | null>(null);

  constructor(private readonly api: ApiService) {}

  async ngOnInit() {
    await this.loadWeek();
  }

  private getWeekDates(start: string): string[] {
    const base = new Date(start);
    const day = (base.getDay() + 6) % 7;
    base.setDate(base.getDate() - day);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
  }

  async loadWeek() {
    this.warning.set("");
    this.success.set("");
    const weekDates = this.getWeekDates(this.weekStart());
    const fromApi = await this.api.get<TimesheetEntry[]>(
      `/timesheets/week?weekStart=${this.weekStart()}`,
    );
    const byDate = new Map(fromApi.map((entry) => [entry.date, entry.status]));

    this.days.set(
      weekDates.map((date) => ({
        date,
        status: (byDate.get(date) as Status) || "onsite",
      })),
    );

    this.wfhCounter.set(
      await this.api.get(
        `/timesheets/wfh-counter?weekStart=${this.weekStart()}`,
      ),
    );
  }

  updateStatus(date: string, status: Status): void {
    this.days.update((rows: DayState[]) =>
      rows.map((row: DayState) =>
        row.date === date ? { ...row, status } : row,
      ),
    );
  }

  async submit(): Promise<void> {
    this.warning.set("");
    this.success.set("");
    this.isSubmitting.set(true);
    try {
      await this.api.post("/timesheets/weekly", {
        weekStart: this.weekStart(),
        entries: this.days(),
      });
      await this.loadWeek();
      this.success.set("Weekly timesheet submitted successfully.");
    } catch (error: any) {
      const violations = error?.violations || error?.message?.violations || [];
      const msg = violations
        .map(
          (item: any) =>
            `${item.date}: ${item.violations.map((v: any) => v.code).join(", ")}`,
        )
        .join(" | ");
      this.warning.set(msg || "Submission failed.");
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
