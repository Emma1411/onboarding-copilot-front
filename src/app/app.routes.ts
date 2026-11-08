import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Questions · Onboarding Copilot',
        loadComponent: () => import('@pages/ask/ask.page').then((m) => m.AskPage),
      },
      {
        path: 'comment-ca-marche',
        title: 'Comment ça marche · Onboarding Copilot',
        loadComponent: () =>
          import('@pages/how-it-works/how-it-works.page').then((m) => m.HowItWorksPage),
      },
      {
        path: 'decisions',
        title: 'Décisions · Onboarding Copilot',
        loadComponent: () => import('@pages/decisions/decisions.page').then((m) => m.DecisionsPage),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];