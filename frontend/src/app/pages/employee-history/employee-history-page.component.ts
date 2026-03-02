import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { Status, TimesheetEntry } from "../../core/services/models";

interface HistoryEntry {
  date: string;
  status: Status;
}

interface HistoryGroup {
  period: string;
  entries: HistoryEntry[];
}

@Component({
  selector: "app-employee-history-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./employee-history-page.component.html",
  styleUrl: "./employee-history-page.component.scss",
})
export class EmployeeHistoryPageComponent implements OnInit {
  readonly mode = signal<"weekly" | "monthly">("weekly");
  readonly from = signal(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10),
  );
  readonly to = signal(new Date().toISOString().slice(0, 10));
  readonly historyGroups = signal<HistoryGroup[]>([]);

  constructor(private readonly api: ApiService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const result = await this.api.get<Record<string, TimesheetEntry[]>>(
      `/timesheets/history?mode=${this.mode()}&from=${this.from()}&to=${this.to()}`,
    );

    const groups = Object.keys(result)
      .sort((a, b) => b.localeCompare(a))
      .map((period) => ({
        period,
        entries: [...result[period]]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((entry) => ({ date: entry.date, status: entry.status })),
      }));

    this.historyGroups.set(groups);
  }
}
