import { Component, computed, input, signal } from '@angular/core';
import { AnswerCardComponent } from '@components/answer-card/answer-card.component';
import { ModeBannerComponent } from '@components/mode-banner/mode-banner.component';
import { SourceCardComponent } from '@components/source-card/source-card.component';
import { AskResponse } from '@interfaces/ask.interface';
import { scrollToId } from '@utils/scroll';

@Component({
  selector: 'app-answer-panel',
  imports: [AnswerCardComponent, SourceCardComponent, ModeBannerComponent],
  templateUrl: './answer-panel.component.html',
  styleUrl: './answer-panel.component.scss',
})
export class AnswerPanelComponent {
  readonly response = input.required<AskResponse>();

  // `highlighted` suit le survol ou le focus, `pinned` mémorise le dernier clic
  protected readonly highlighted = signal<number | null>(null);
  protected readonly pinned = signal<number | null>(null);
  protected readonly active = computed(() => this.highlighted() ?? this.pinned());

  protected onCitationClick(n: number): void {
    this.pinned.set(n);
    scrollToId(`source-${n}`);
  }
}