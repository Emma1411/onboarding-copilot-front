import { Component, computed, input, model, output, signal } from '@angular/core';
import { QUESTION_MAX, QUESTION_MIN } from '@store/ask.store';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  readonly value = model('');
  readonly loading = input(false);
  readonly submitted = output<string>();

  protected readonly max = QUESTION_MAX;
  protected readonly min = QUESTION_MIN;
  protected readonly attempted = signal(false);
  protected readonly tooShort = computed(() => this.value().trim().length < QUESTION_MIN);
  protected readonly showError = computed(() => this.attempted() && this.tooShort());

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    this.attempted.set(false);
  }

  protected submit(): void {
    if (this.loading()) return;
    this.attempted.set(true);
    if (this.tooShort()) return;
    this.submitted.emit(this.value().trim());
  }
}