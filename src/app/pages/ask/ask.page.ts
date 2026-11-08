import { Component, computed, inject, signal } from '@angular/core';
import { ModeBannerComponent } from '@components/mode-banner/mode-banner.component';
import { SearchBarComponent } from '@components/search-bar/search-bar.component';
import { EXAMPLE_QUESTIONS } from '@data/example-questions';
import { AskErrorCode } from '@interfaces/ask.interface';
import { AskStore } from '@store/ask.store';
import { countValidCitations } from '@utils/parse-citations';
import { scrollToId } from '@utils/scroll';
import { AnswerPanelComponent } from '@widgets/answer-panel/answer-panel.component';
import { PipelineStepperComponent } from '@widgets/pipeline-stepper/pipeline-stepper.component';

@Component({
  selector: 'app-ask-page',
  imports: [SearchBarComponent, PipelineStepperComponent, AnswerPanelComponent, ModeBannerComponent],
  templateUrl: './ask.page.html',
  styleUrl: './ask.page.scss',
})
export class AskPage {
  protected readonly store = inject(AskStore);
  protected readonly examples = EXAMPLE_QUESTIONS;
  protected readonly draft = signal('');

  protected readonly validCitations = computed(() => {
    const r = this.store.response();
    return r?.answer ? countValidCitations(r.answer, r.sources.length) : null;
  });

  // Message court annoncé aux lecteurs d'écran (la réponse complète n'est pas relue)
  protected readonly statusMessage = computed(() => {
    switch (this.store.status()) {
      case 'loading':
        return 'Recherche en cours…';
      case 'error':
        return this.store.error()?.message ?? 'Une erreur est survenue.';
      case 'done': {
        const r = this.store.response();
        if (!r) return '';
        if (r.mode === 'ai') return `Réponse prête avec ${r.sources.length} sources.`;
        if (r.mode === 'sources_only') return 'Réponse rédigée indisponible : passages trouvés affichés.';
        return "Aucune information trouvée dans la documentation.";
      }
      default:
        return '';
    }
  });

  protected ask(question: string): void {
    this.draft.set(question);
    this.store.ask(question);
    setTimeout(() => scrollToId('results', 'start'), 50); // utile sur mobile
  }

  protected retry(): void {
    this.ask(this.store.question());
  }

  protected errorTitle(code: AskErrorCode): string {
    switch (code) {
      case 'rate_limited':
        return 'Limite atteinte pour cette heure';
      case 'network':
        return 'Connexion impossible';
      case 'server':
        return 'Une erreur est survenue';
      default:
        return 'Question invalide';
    }
  }
}