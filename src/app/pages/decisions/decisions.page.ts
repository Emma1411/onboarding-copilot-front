import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ModeBannerComponent } from '@components/mode-banner/mode-banner.component';
import { STATUS_LABEL, STATUS_ORDER } from '@data/adr-status';
import { AdrStatus } from '@interfaces/adr.interface';
import { DocsStore } from '@store/docs.store';
import { normalize } from '@utils/normalize';
import { AdrDetailComponent } from '@widgets/adr-detail/adr-detail.component';
import { AdrTimelineComponent } from '@widgets/adr-timeline/adr-timeline.component';

type StatusFilter = AdrStatus | 'all';

@Component({
  selector: 'app-decisions-page',
  imports: [RouterLink, AdrTimelineComponent, AdrDetailComponent, ModeBannerComponent],
  templateUrl: './decisions.page.html',
  styleUrl: './decisions.page.scss',
})
export class DecisionsPage {
  protected readonly store = inject(DocsStore);
  private readonly route = inject(ActivatedRoute);

  // Décision choisie dans l'URL (?adr=3), ou null
  protected readonly selectedId = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const n = Number(params.get('adr'));
        return Number.isInteger(n) && n > 0 ? n : null;
      }),
    ),
    { initialValue: null },
  );

  protected readonly query = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly tagFilter = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const q = normalize(this.query());
    const status = this.statusFilter();
    const tag = this.tagFilter();

    return this.store.list().filter((adr) => {
      if (status !== 'all' && adr.status !== status) return false;
      if (tag && !adr.tags.includes(tag)) return false;
      if (!q) return true;
      return normalize(`${adr.title} ${adr.summary} ${adr.tags.join(' ')}`).includes(q);
    });
  });

  // Sans sélection dans l'URL, on affiche la première décision (sur ordinateur)
  protected readonly detailId = computed(() => this.selectedId() ?? this.filtered()[0]?.id ?? null);

  protected readonly statusOptions = computed(() => {
    const all = this.store.list();
    const options: { value: StatusFilter; label: string; count: number }[] = [
      { value: 'all', label: 'Tous', count: all.length },
    ];
    for (const status of STATUS_ORDER) {
      const count = all.filter((adr) => adr.status === status).length;
      if (count > 0) options.push({ value: status, label: STATUS_LABEL[status], count });
    }
    return options;
  });

  protected readonly tags = computed(() =>
    [...new Set(this.store.list().flatMap((adr) => adr.tags))].sort((a, b) => a.localeCompare(b, 'fr')),
  );

  protected readonly hasFilters = computed(
    () => this.query().trim() !== '' || this.statusFilter() !== 'all' || this.tagFilter() !== null,
  );

  constructor() {
    this.store.loadList();

    effect(() => {
      const id = this.detailId();
      if (id !== null) untracked(() => this.store.loadDetail(id));
    });
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected toggleTag(tag: string): void {
    this.tagFilter.update((current) => (current === tag ? null : tag));
  }

  protected resetFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
    this.tagFilter.set(null);
  }

  protected retryDetail(): void {
    const id = this.detailId();
    if (id !== null) this.store.loadDetail(id, true);
  }
}