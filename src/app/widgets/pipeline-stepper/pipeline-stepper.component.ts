import { Component, computed, input } from '@angular/core';
import { AskResponse } from '@interfaces/ask.interface';

type StepState = 'done' | 'skipped' | 'pending';

interface Step {
  id: string;
  label: string;
  detail: string;
  state: StepState;
}

@Component({
  selector: 'app-pipeline-stepper',
  templateUrl: './pipeline-stepper.component.html',
  styleUrl: './pipeline-stepper.component.scss',
})
export class PipelineStepperComponent {
  // null = requête en cours
  readonly response = input<AskResponse | null>(null);
  readonly questionLength = input(0);
  readonly validCitations = input<number | null>(null);
  readonly reveal = input(4);

  protected readonly stateLabel: Record<StepState, string> = {
    done: 'terminée',
    skipped: 'non exécutée',
    pending: 'en cours',
  };

  protected readonly icon: Record<StepState, string> = {
    done: '✓',
    skipped: '–',
    pending: '•',
  };

  protected readonly steps = computed<Step[]>(() => {
    const question: Step = {
      id: 'question',
      label: 'Question reçue',
      detail: `Validée (${this.questionLength()} car.)`,
      state: 'done',
    };

    const r = this.response();
    if (!r) {
      return [
        question,
        { id: 'cache', label: 'Cache mémoire', detail: 'Vérification…', state: 'pending' },
        { id: 'search', label: 'Recherche BM25', detail: 'En attente', state: 'pending' },
        { id: 'llm', label: 'Synthèse IA', detail: 'En attente', state: 'pending' },
      ];
    }

    const cached = r.cached === true;
    const passages = r.meta.passages;

    const cache: Step = {
      id: 'cache',
      label: 'Cache mémoire',
      detail: cached ? 'Hit : servie sans appel IA' : 'Manqué',
      state: 'done',
    };

    const search: Step = cached
      ? { id: 'search', label: 'Recherche BM25', detail: 'Évitée par le cache', state: 'skipped' }
      : {
          id: 'search',
          label: 'Recherche BM25',
          detail:
            passages === 0
              ? 'Aucun passage pertinent'
              : `${passages} passage${passages > 1 ? 's' : ''} extrait${passages > 1 ? 's' : ''}`,
          state: 'done',
        };

    let llm: Step;
    if (cached) {
      llm = { id: 'llm', label: 'Synthèse IA', detail: 'Évitée par le cache', state: 'skipped' };
    } else if (r.mode === 'ai') {
      const parts: string[] = [];
      if (r.meta.tokens != null) parts.push(`${r.meta.tokens} tokens`);
      if (r.meta.llmMs != null) parts.push(`${(r.meta.llmMs / 1000).toFixed(1)} s`);
      llm = {
        id: 'llm',
        label: 'Synthèse IA',
        detail: parts.join(' · ') || 'Réponse rédigée',
        state: 'done',
      };
    } else if (r.mode === 'sources_only') {
      llm = {
        id: 'llm',
        label: 'Synthèse IA',
        detail: 'Indisponible : sources seules',
        state: 'skipped',
      };
    } else {
      llm = {
        id: 'llm',
        label: 'Synthèse IA',
        detail: 'Non sollicitée : rien de pertinent',
        state: 'skipped',
      };
    }

    const all = [question, cache, search, llm];
    const shown = this.reveal();
    return all.map((step, i): Step =>
      i < shown ? step : { ...step, state: 'pending', detail: 'En attente' },
    );
  });
}
