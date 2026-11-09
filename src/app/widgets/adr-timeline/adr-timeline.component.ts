import { Component, input } from '@angular/core';
import { AdrCardComponent } from '@components/adr-card/adr-card.component';
import { AdrSummary } from '@interfaces/adr.interface';

@Component({
  selector: 'app-adr-timeline',
  imports: [AdrCardComponent],
  templateUrl: './adr-timeline.component.html',
  styleUrl: './adr-timeline.component.scss',
})
export class AdrTimelineComponent {
  readonly adrs = input.required<AdrSummary[]>();
  readonly selectedId = input<number | null>(null);
}