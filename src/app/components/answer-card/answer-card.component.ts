import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { parseAnswer } from '@utils/parse-answer';
import { countValidCitations } from '@utils/parse-citations';

@Component({
  selector: 'app-answer-card',
  imports: [NgTemplateOutlet],
  templateUrl: './answer-card.component.html',
  styleUrl: './answer-card.component.scss',
})
export class AnswerCardComponent {
  readonly answer = input.required<string>();
  readonly sourcesCount = input.required<number>();
  readonly highlighted = input<number | null>(null);
  readonly cached = input(false);

  readonly citationClick = output<number>();
  readonly citationHover = output<number | null>();

  protected readonly copied = signal(false);
  protected readonly blocks = computed(() => parseAnswer(this.answer(), this.sourcesCount()));
  protected readonly validCitations = computed(() => countValidCitations(this.answer(), this.sourcesCount()));

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.answer());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // presse-papiers indisponible : rien à faire
    }
  }
}