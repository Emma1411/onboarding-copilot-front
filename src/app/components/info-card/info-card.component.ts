import { Component, input } from '@angular/core';

@Component({
  selector: 'app-info-card',
  template: `
    <article class="card">
      <p class="card__eyebrow">{{ eyebrow() }}</p>
      <h3 class="card__title">{{ title() }}</h3>
      <p class="card__text">{{ text() }}</p>
      @if (tags().length) {
        <ul class="card__tags">
          @for (tag of tags(); track tag) {
            <li>{{ tag }}</li>
          }
        </ul>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      height: 100%;
      padding: var(--space-6);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
    }
    .card__eyebrow {
      margin: 0;
      color: var(--primary);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .card__title {
      font-size: 18px;
    }
    .card__text {
      margin: 0;
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.65;
    }
    .card__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: auto 0 0;
      padding: var(--space-3) 0 0;
      list-style: none;
    }
    .card__tags li {
      padding: 2px 10px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--primary) 8%, transparent);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 12px;
    }
  `,
})
export class InfoCardComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly tags = input<readonly string[]>([]);
}