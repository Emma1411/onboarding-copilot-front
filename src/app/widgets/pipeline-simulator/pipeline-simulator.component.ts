import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Subscription, TimeoutError, timeout } from 'rxjs';
import { ModeBannerComponent } from '@components/mode-banner/mode-banner.component';
import { EXAMPLE_QUESTIONS } from '@data/example-questions';
import { AskResponse } from '@interfaces/ask.interface';
import { ApiService } from '@services/api.service';
import { PipelineStepperComponent } from '@widgets/pipeline-stepper/pipeline-stepper.component';

@Component({
  selector: 'app-pipeline-simulator',
  imports: [PipelineStepperComponent, ModeBannerComponent],
  templateUrl: './pipeline-simulator.component.html',
  styleUrl: './pipeline-simulator.component.scss',
})
export class PipelineSimulatorComponent {
  private readonly api = inject(ApiService);
  private subscription: Subscription | undefined;
  private timers: ReturnType<typeof setTimeout>[] = [];

  protected readonly questions = EXAMPLE_QUESTIONS;
  protected readonly selected = signal(EXAMPLE_QUESTIONS[0]);
  protected readonly started = signal(false);
  protected readonly running = signal(false);
  protected readonly response = signal<AskResponse | null>(null);
  protected readonly reveal = signal(4);
  protected readonly error = signal<string | null>(null);

  // Texte de conclusion, affiché une fois la dernière étape révélée
  protected readonly outcome = computed(() => {
    const r = this.response();
    if (!r || this.reveal() < 4) return null;

    if (r.cached) {
      return "Cette question était déjà en cache : le serveur a répondu sans chercher ni appeler l'IA.";
    }
    switch (r.mode) {
      case 'ai': {
        const n = r.meta.passages;
        return `Réponse rédigée par l'IA à partir de ${n} passage${n > 1 ? 's' : ''} trouvé${n > 1 ? 's' : ''} dans la documentation.`;
      }
      case 'sources_only':
        return "L'IA n'a pas été utilisée (budget épuisé ou service indisponible) : l'app renvoie directement les passages trouvés.";
      default:
        return "Aucun passage assez pertinent : l'IA n'a pas été appelée, et l'app le dit au lieu d'inventer une réponse.";
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancel());
  }

  protected run(): void {
    if (this.running()) return;
    this.cancel();
    this.started.set(true);
    this.running.set(true);
    this.error.set(null);
    this.response.set(null);
    this.reveal.set(4);

    this.subscription = this.api
      .ask(this.selected())
      .pipe(timeout(90_000)) // marge pour le réveil du serveur gratuit
      .subscribe({
        next: (response) => this.play(response),
        error: (err: unknown) => {
          this.running.set(false);
          this.error.set(this.toMessage(err));
        },
      });
  }

  protected reset(): void {
    this.cancel();
    this.started.set(false);
    this.running.set(false);
    this.response.set(null);
    this.error.set(null);
  }

  // Révèle les étapes une à une, sauf si l'utilisateur a demandé moins d'animations
  private play(response: AskResponse): void {
    this.response.set(response);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reveal.set(4);
      this.running.set(false);
      return;
    }

    this.reveal.set(1);
    [2, 3, 4].forEach((step, i) => {
      this.timers.push(
        setTimeout(() => {
          this.reveal.set(step);
          if (step === 4) this.running.set(false);
        }, (i + 1) * 600),
      );
    });
  }

  private cancel(): void {
    this.subscription?.unsubscribe();
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
  }

  private toMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 429) {
      return err.error?.message ?? 'Limite atteinte pour cette heure. Réessaie plus tard.';
    }
    if (err instanceof TimeoutError) {
      return 'Le serveur met trop de temps à répondre. Réessaie dans un instant.';
    }
    return 'Impossible de joindre le serveur. Réessaie dans un instant.';
  }
}