import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { timeout } from 'rxjs';
import { AdrDetail, AdrSummary } from '@interfaces/adr.interface';
import { ApiService } from '@services/api.service';

export type ListStatus = 'idle' | 'loading' | 'ready' | 'error';
export type DetailStatus = 'idle' | 'loading' | 'ready' | 'not_found' | 'error';

@Injectable({ providedIn: 'root' })
export class DocsStore {
  private readonly api = inject(ApiService);
  private readonly details = signal<Record<number, AdrDetail>>({});

  readonly list = signal<AdrSummary[]>([]);
  readonly listStatus = signal<ListStatus>('idle');

  readonly detailId = signal<number | null>(null);
  readonly detailStatus = signal<DetailStatus>('idle');
  readonly detail = computed(() => {
    const id = this.detailId();
    return id === null ? null : (this.details()[id] ?? null);
  });

  loadList(force = false): void {
    const status = this.listStatus();
    if (status === 'loading' || (status === 'ready' && !force)) return;

    this.listStatus.set('loading');
    this.api
      .listAdrs()
      .pipe(timeout(90_000)) // marge pour le réveil du serveur gratuit
      .subscribe({
        next: (list) => {
          this.list.set(list);
          this.listStatus.set('ready');
        },
        error: () => this.listStatus.set('error'),
      });
  }

  loadDetail(id: number, force = false): void {
    this.detailId.set(id);
    if (!force && this.details()[id]) {
      this.detailStatus.set('ready');
      return;
    }

    this.detailStatus.set('loading');
    this.api
      .getAdr(id)
      .pipe(timeout(90_000))
      .subscribe({
        next: (adr) => {
          this.details.update((all) => ({ ...all, [id]: adr }));
          // Si l'utilisateur a déjà cliqué sur une autre décision, cette réponse ne change pas l'état affiché
          if (this.detailId() === id) this.detailStatus.set('ready');
        },
        error: (err: unknown) => {
          if (this.detailId() !== id) return;
          this.detailStatus.set(err instanceof HttpErrorResponse && err.status === 404 ? 'not_found' : 'error');
        },
      });
  }
}