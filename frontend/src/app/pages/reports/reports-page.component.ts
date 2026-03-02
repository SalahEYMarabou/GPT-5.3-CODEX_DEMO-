import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-reports-page",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./reports-page.component.html",
  styleUrl: "./reports-page.component.scss",
})
export class ReportsPageComponent implements OnInit {
  readonly from = signal(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10),
  );
  readonly to = signal(new Date().toISOString().slice(0, 10));
  readonly summaries = signal<any[]>([]);

  constructor(private readonly api: ApiService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.summaries.set(
      await this.api.get<any[]>(
        `/summaries/daily?from=${this.from()}&to=${this.to()}`,
      ),
    );
  }

  async downloadCsv() {
    await this.api.download(`/reports/csv?from=${this.from()}&to=${this.to()}`);
  }

  async downloadPdf() {
    await this.api.download(`/reports/pdf?from=${this.from()}&to=${this.to()}`);
  }
}
