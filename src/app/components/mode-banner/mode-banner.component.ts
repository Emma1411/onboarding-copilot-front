import { Component, input } from '@angular/core';

export type BannerTone = 'info' | 'warning' | 'error';

@Component({
  selector: 'app-mode-banner',
  template: `
    <div class="banner" [attr.data-tone]="tone()" [attr.role]="tone() === 'error' ? 'alert' : 'status'">
      <ng-content />
    </div>
  `,
  styles: `
    .banner {
      padding: 12px 16px;
      border: 1px solid;
      border-radius: var(--radius-sm);
      font-size: 14px;
    }
    [data-tone='info'] {
      background: color-mix(in srgb, var(--primary) 10%, var(--surface));
      border-color: var(--border);
      color: var(--text);
    }
    [data-tone='warning'] {
      background: #fef3c7;
      border-color: #fcd34d;
      color: #78350f;
    }
    [data-tone='error'] {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #7f1d1d;
    }
  `,
})
export class ModeBannerComponent {
  readonly tone = input<BannerTone>('info');
}