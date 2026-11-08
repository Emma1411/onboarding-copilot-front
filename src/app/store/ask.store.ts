import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription, TimeoutError, timeout } from 'rxjs';
import { AskError, AskResponse } from '@interfaces/ask.interface';
import { ApiService } from '@services/api.service';

export const QUESTION_MIN = 5;
export const QUESTION_MAX = 300;

export type AskStatus = 'idle' | 'loading' | 'done' | 'error';

@Injectable({ providedIn: 'root' })
export class AskStore {
  private readonly api = inject(ApiService);
  private subscription: Subscription | undefined;

  readonly status = signal<AskStatus>('idle');
  readonly question = signal('');
  readonly response = signal<AskResponse | null>(null);
  readonly error = signal<AskError | null>(null);
  readonly isLoading = computed(() => this.status() === 'loading');

  ask(raw: string): void {
    const question = raw.trim().slice(0, QUESTION_MAX);
    if (question.length < QUESTION_MIN) {
      this.fail({
        code: 'question_too_short',
        message: `La question doit faire au moins ${QUESTION_MIN} caractères.`,
      });
      return;
    }

    this.subscription?.unsubscribe(); // annule une requête encore en cours
    this.question.set(question);
    this.response.set(null);
    this.error.set(null);
    this.status.set('loading');

    this.subscription = this.api
      .ask(question)
      .pipe(timeout(90_000)) // marge pour le réveil du serveur gratuit
      .subscribe({
        next: (response) => {
          this.response.set(response);
          this.status.set('done');
        },
        error: (err: unknown) => this.fail(this.toAskError(err)),
      });
  }

  reset(): void {
    this.subscription?.unsubscribe();
    this.status.set('idle');
    this.question.set('');
    this.response.set(null);
    this.error.set(null);
  }

  private fail(error: AskError): void {
    this.error.set(error);
    this.status.set('error');
  }

  private toAskError(err: unknown): AskError {
    if (err instanceof TimeoutError) {
      return { code: 'network', message: 'Le serveur met trop de temps à répondre. Réessaie dans un instant.' };
    }
    if (err instanceof HttpErrorResponse) {
      if (err.status === 429) {
        return {
          code: 'rate_limited',
          message: err.error?.message ?? 'Limite atteinte pour cette heure. Réessaie plus tard.',
        };
      }
      if (err.status === 400) {
        const code = err.error?.error === 'question_too_short' ? 'question_too_short' : 'invalid_question';
        return { code, message: 'Question invalide.' };
      }
      if (err.status === 0) {
        return { code: 'network', message: 'Impossible de joindre le serveur.' };
      }
    }
    return { code: 'server', message: 'Une erreur est survenue. Réessaie dans un instant.' };
  }
}