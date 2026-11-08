import { Injectable, inject, signal } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiService } from '@services/api.service';

export type HealthStatus = 'idle' | 'checking' | 'waking' | 'ready' | 'down';

@Injectable({ providedIn: 'root' })
export class HealthStore {
  private readonly api = inject(ApiService);
  private wakeTimer: ReturnType<typeof setTimeout> | undefined;

  readonly status = signal<HealthStatus>('idle');
  // null tant qu'on ne sait pas, puis true ou false selon le champ `ai` de /api/health
  readonly aiAvailable = signal<boolean | null>(null);

  check(): void {
    if (this.status() === 'checking' || this.status() === 'waking') return;

    this.status.set('checking');
    this.wakeTimer = setTimeout(() => {
      if (this.status() === 'checking') this.status.set('waking');
    }, 2000);

    this.api
      .health()
      .pipe(timeout(90_000))
      .subscribe({
        next: (health) => {
          clearTimeout(this.wakeTimer);
          this.aiAvailable.set(health.ai);
          this.status.set('ready');
        },
        error: () => {
          clearTimeout(this.wakeTimer);
          this.status.set('down');
        },
      });
  }
}