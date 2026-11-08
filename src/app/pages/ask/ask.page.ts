import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AskStore } from '@store/ask.store';

@Component({
  selector: 'app-ask-page',
  imports: [JsonPipe],
  template: `
    <section class="container">
      <h1>Pose une question à ce projet.</h1>
      <p>Page provisoire : elle sert à vérifier la connexion avec l'API.</p>

      <input
        #q
        type="text"
        maxlength="300"
        placeholder="Pourquoi il n'y a pas de base de données ?"
        (keydown.enter)="store.ask(q.value)"
      />
      <button type="button" [disabled]="store.isLoading()" (click)="store.ask(q.value)">Demander</button>

      <p>Statut : {{ store.status() }}</p>
      @if (store.error(); as err) {
        <p role="alert">{{ err.message }}</p>
      }
      <pre>{{ store.response() | json }}</pre>
    </section>
  `,
})
export class AskPage {
  protected readonly store = inject(AskStore);
}