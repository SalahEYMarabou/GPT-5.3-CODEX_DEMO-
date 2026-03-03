import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ApiService } from "../../core/services/api.service";

interface MetricsData {
  apiCalls: number;
  avgValidationMs: number;
  totalSubmissions: number;
  currentWeek: string;
  submissionsByWeek: Record<string, number>;
  violationsByWeek: Record<string, number>;
}

interface WeeklyMetricRow {
  week: string;
  value: number;
}

interface WeeklyTrendRow {
  week: string;
  submissions: number;
  violations: number;
}

@Component({
  selector: "app-metrics-page",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./metrics-page.component.html",
  styleUrl: "./metrics-page.component.scss",
})
export class MetricsPageComponent implements OnInit {
  readonly metrics = signal<MetricsData | null>(null);

  constructor(private readonly api: ApiService) {}

  async ngOnInit() {
    this.metrics.set(await this.api.get<MetricsData>("/metrics"));
  }

  submissionsRows(metrics: MetricsData): WeeklyMetricRow[] {
    return this.toMetricRows(metrics.submissionsByWeek);
  }

  violationsRows(metrics: MetricsData): WeeklyMetricRow[] {
    return this.toMetricRows(metrics.violationsByWeek);
  }

  combinedRows(metrics: MetricsData): WeeklyTrendRow[] {
    const allWeeks = new Set<string>([
      ...Object.keys(metrics.submissionsByWeek || {}),
      ...Object.keys(metrics.violationsByWeek || {}),
    ]);

    return Array.from(allWeeks)
      .sort((a, b) => b.localeCompare(a))
      .map((week) => ({
        week,
        submissions: metrics.submissionsByWeek?.[week] || 0,
        violations: metrics.violationsByWeek?.[week] || 0,
      }));
  }

  private toMetricRows(
    weeklyRecord: Record<string, number> = {},
  ): WeeklyMetricRow[] {
    return Object.entries(weeklyRecord)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([week, value]) => ({ week, value }));
  }
}
