import { Component, computed, input, output, signal } from '@angular/core';
import { Source } from '@interfaces/ask.interface';
import { stripMarkdown } from '@utils/strip-markdown';

@Component({
  selector: 'app-source-card',
  templateUrl: './source-card.component.html',
  styleUrl: './source-card.component.scss',
})
export class SourceCardComponent {
  readonly source = input.required<Source>();
  readonly n = input.required<number>();
  readonly active = input(false);
  readonly hovered = output<number | null>();

  protected readonly expanded = signal(false);
  protected readonly copied = signal(false);
  protected readonly excerpt = computed(() => stripMarkdown(this.source().text));
  protected readonly isLong = computed(() => this.excerpt().length > 260);

  protected async copyPath(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.source().file);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // presse-papiers indisponible : rien à faire
    }
  }
}