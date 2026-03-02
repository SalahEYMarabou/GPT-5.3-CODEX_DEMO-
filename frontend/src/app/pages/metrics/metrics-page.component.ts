import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ApiService } from "../../core/services/api.service";

@Component({
  selector: "app-metrics-page",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./metrics-page.component.html",
  styleUrl: "./metrics-page.component.scss",
})
export class MetricsPageComponent implements OnInit {
  readonly metrics = signal<any>(null);

  constructor(private readonly api: ApiService) {}

  async ngOnInit() {
    this.metrics.set(await this.api.get("/metrics"));
  }
}
