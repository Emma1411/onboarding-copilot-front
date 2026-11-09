import { Component, computed, input, signal } from '@angular/core';
import { MarkdownViewComponent } from '@components/markdown-view/markdown-view.component';
import { StatusBadgeComponent } from '@components/status-badge/status-badge.component';
import { SITE_LINKS } from '@data/site-links';
import { AdrDetail } from '@interfaces/adr.interface';
import { adrCode, formatDate } from '@utils/format-date';

@Component({
  selector: 'app-adr-detail',
  imports: [MarkdownViewComponent, StatusBadgeComponent],
  templateUrl: './adr-detail.component.html',
  styleUrl: './adr-detail.component.scss',
})
export class AdrDetailComponent {
  readonly adr = input.required<AdrDetail>();

  protected readonly copied = signal(false);
  protected readonly code = computed(() => adrCode(this.adr().id));
  protected readonly date = computed(() => formatDate(this.adr().date));
  // Suppose que la branche s'appelle « main » et que le backend est dans le dossier backend/
  protected readonly sourceUrl = computed(() => `${SITE_LINKS.github}/${this.adr().file}`);

  protected async copyMarkdown(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.adr().content);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // presse-papiers indisponible : rien à faire
    }
  }
}
