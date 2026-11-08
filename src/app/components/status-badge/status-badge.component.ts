import { Component, computed, input } from '@angular/core';
import { STATUS_LABEL } from '@data/adr-status';
import { AdrStatus } from '@interfaces/adr.interface';

@Component({
  selector: 'app-status-badge',
  template: `
    @if (status(); as s) {
      <span class="badge" [attr.data-status]="s">
        <span class="dot" aria-hidden="true"></span>{{ label() }}
      </span>
    }
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      background: color-mix(in srgb, var(--c) 14%, transparent);
      color: color-mix(in srgb, var(--c) 70%, var(--text));
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--c);
    }
    [data-status='accepted'] {
      --c: var(--status-accepted);
    }
    [data-status='proposed'] {
      --c: var(--status-proposed);
    }
    [data-status='rejected'] {
      --c: var(--status-rejected);
    }
    [data-status='superseded'] {
      --c: var(--status-superseded);
    }
  `,
})
export class StatusBadgeComponent {
  readonly status = input<AdrStatus | null>(null);
  protected readonly label = computed(() => {
    const s = this.status();
    return s ? STATUS_LABEL[s] : '';
  });
}