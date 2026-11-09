import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '@components/status-badge/status-badge.component';
import { AdrSummary } from '@interfaces/adr.interface';
import { adrCode, formatDate } from '@utils/format-date';

@Component({
  selector: 'app-adr-card',
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './adr-card.component.html',
  styleUrl: './adr-card.component.scss',
})
export class AdrCardComponent {
  readonly adr = input.required<AdrSummary>();
  readonly selected = input(false);

  protected readonly code = computed(() => adrCode(this.adr().id));
  protected readonly date = computed(() => formatDate(this.adr().date));
}