import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SITE_LINKS } from '@data/site-links';
import { ThemeService } from '@services/theme.service';
import { HealthStore } from '@store/health.store';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  protected readonly health = inject(HealthStore);
  protected readonly theme = inject(ThemeService);
  protected readonly links = SITE_LINKS;
  protected readonly menuOpen = signal(false);

  ngOnInit(): void {
    this.health.check(); // réveille le serveur dès l'ouverture du site
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}