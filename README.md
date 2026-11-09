# Onboarding Copilot — Frontend

## Description
Interface web d'Onboarding Copilot : un nouvel arrivant pose une question sur un projet logiciel et obtient une réponse **avec citations cliquables** vers les décisions d'architecture (ADR) et la documentation. L'interface montre aussi **comment chaque réponse a été produite** (cache, recherche, IA), à partir de données réelles renvoyées par l'API.

La démo répond aux questions sur **le projet lui-même** : ses propres ADR et ses guides sont le corpus.

🔗 Démo : [onboarding-copilot-front.vercel.app](https://onboarding-copilot-front.vercel.app/)


## Fonctionnalités
- **Questions avec sources** : la réponse contient des pastilles `[1]`, `[2]` ; un clic fait défiler jusqu'à la source correspondante et la met en évidence, et le survol d'une source allume sa pastille
- **Stepper « Comment cette réponse a été produite »** : validation, cache, recherche BM25, synthèse IA, avec passages trouvés, tokens, durée côté serveur et modèle, tels que l'API les renvoie
- **Tous les modes de réponse** : réponse IA, passages seuls quand l'IA est indisponible, absence de réponse avec questions suggérées
- **Décisions d'architecture** : liste en timeline, filtres par statut et tag, recherche sans accents, détail rendu en Markdown, lien direct vers chaque décision (`/decisions?adr=4`)
- **Page « Comment ça marche »** : parcours d'une question, garde-fous, limites connues, et une **simulation qui envoie une vraie requête** à l'API
- **Gestion du serveur gratuit** : vérification de santé dès l'ouverture, bandeau « le serveur se réveille » après 2 secondes sans réponse, délai maximal de 90 secondes
- **États soignés** : chargement (squelettes), erreur réseau avec bouton « Réessayer », limite de requêtes atteinte, décision introuvable
- **Thème clair par défaut** et thème sombre mémorisé dans le navigateur
- **Accessibilité** : navigation complète au clavier, anneau de focus visible, annonce des résultats aux lecteurs d'écran, respect de `prefers-reduced-motion`
- **Responsive** : pensé mobile d'abord, avec menu repliable sous 820 px

## Stack technique
| Composant | Technologie |
|---|---|
| Framework | Angular (composants standalone, nouveau contrôle de flux) |
| Langage | TypeScript en mode strict, templates vérifiés (`strictTemplates`) |
| État | Signals dans des stores injectables, sans NgRx |
| Style | SCSS avec variables CSS (design tokens) |
| Polices | Manrope, Inter, JetBrains Mono |
| Requêtes | `HttpClient` avec RxJS |
| Déploiement | Vercel |

## Architecture
```
frontend/
├── public/                  # favicon, logo
├── src/
│   ├── environments/        # URL de l'API (développement / production)
│   ├── styles/_tokens.scss  # palette bleue, typographie, espacements
│   └── app/
│       ├── components/      # présentation pure : SearchBar, AnswerCard, SourceCard,
│       │                    # ModeBanner, StatusBadge, MarkdownView, AdrCard, InfoCard
│       ├── widgets/         # blocs composés : PipelineStepper, AnswerPanel, AdrTimeline,
│       │                    # AdrDetail, PipelineSimulator
│       ├── layouts/         # MainLayout : navbar, bandeaux d'état, footer
│       ├── pages/           # ask, how-it-works, decisions
│       ├── store/           # ask.store, health.store, docs.store (signals)
│       ├── services/        # api.service (HTTP), theme.service
│       ├── interfaces/      # contrat de l'API
│       ├── data/            # textes statiques, questions d'exemple
│       ├── utils/           # parseurs et fonctions pures
│       ├── app.config.ts
│       └── app.routes.ts
└── vercel.json              # redirection vers index.html pour les routes Angular
```

Les composants ne contiennent pas de logique métier : les stores portent l'état, `api.service` est le seul endroit qui connaît les URL de l'API, et les widgets assemblent composants et stores. Des alias de chemins (`@components/*`, `@store/*`, `@utils/*`…) évitent les imports relatifs profonds.


## Limites connues
- **Pas de tests automatisés côté front** pour l'instant : le backend, lui, est couvert par des tests.
- **Corpus fixe** : l'app répond sur la documentation du projet, pas sur un dépôt GitHub quelconque.
- **Parseur Markdown limité** : titres, paragraphes, listes, citations, blocs de code, gras, code en ligne et liens. Les tableaux ne sont pas gérés.
- **Durée côté serveur uniquement** : « Traité en X ms » n'inclut ni le réseau ni le réveil du serveur gratuit.
- **Réponse de l'IA non garantie** : même avec des sources, elle peut se tromper. Les citations servent à le vérifier.
- **Confidentialité** : la question et les passages trouvés sont envoyés à DeepSeek par le backend. 
