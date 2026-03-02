import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-admin-dashboard-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-dashboard-page.component.html",
  styleUrl: "./admin-dashboard-page.component.scss",
})
export class AdminDashboardPageComponent implements OnInit {
  readonly from = signal(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .slice(0, 10),
  );
  readonly to = signal(new Date().toISOString().slice(0, 10));
  readonly rows = signal<any[]>([]);
  readonly dailySummaries = signal<any[]>([]);
  readonly metrics = signal<any>(null);

  constructor(private readonly api: ApiService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const [rows, daily, metrics] = await Promise.all([
      this.api.get<any[]>(`/reports/rows?from=${this.from()}&to=${this.to()}`),
      this.api.get<any[]>(
        `/summaries/daily?from=${this.from()}&to=${this.to()}`,
      ),
      this.api.get<any>(`/metrics`),
    ]);

    this.rows.set(rows);
    this.dailySummaries.set(daily);
    this.metrics.set(metrics);
  }

  async exportCsv() {
    await this.api.download(`/reports/csv?from=${this.from()}&to=${this.to()}`);
  }

  async exportPdf() {
    await this.api.download(`/reports/pdf?from=${this.from()}&to=${this.to()}`);
  }
}
