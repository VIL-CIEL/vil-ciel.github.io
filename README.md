# Portfolio — Fabien Villedieu

Portfolio web personnel de Fabien Villedieu (développeur logiciel, BTS CIEL).
Site **statique** déployé via **GitHub Pages**.

> **Refonte v2 en cours** sur la branche `refonte-v2` : la version en ligne (`main`)
> reste la v1 jusqu'à la sortie de la v2.0.0. Avancement dans [SPRINTS.md](SPRINTS.md).

## Aperçu

Le portfolio v2 prend la forme d'un **système d'exploitation fictif** : un court
démarrage, puis un bureau où **chaque projet est un programme**. Ouvrir un programme
affiche une fenêtre qui présente le projet, avec une animation en pixel art dessinée en
code. Style rétro / terminal, base sombre et accent violet.

Programmes :

- **Système** — LISEZ-MOI (par où commencer), Profil, Parcours, CV, Contact, Terminal.
- **Projets** — Plugins DAP Pymodaq, stage IHM Pymodaq, TVA Dashboard, CC Radio System,
  jeu UnderCore (Unity), jeu TaleUnder (Pygame), recherche textuelle, API REST de devis,
  ce portfolio.
- **Bénévolat** — serveur Minecraft communautaire.

Chaque fenêtre a sa propre adresse (`/#dap`, `/#ihm`…) pour partager un projet
directement. Sur mobile, le bureau devient un écran d'accueil et les fenêtres
s'ouvrent en plein écran.

Le statut affiché (recherche d'alternance, date de début, école, rythme, zone…) est
lu depuis [`public/data/profile.json`](public/data/profile.json), et la frise du
parcours depuis [`public/data/parcours.json`](public/data/parcours.json) : il suffit
de modifier ces fichiers sur GitHub pour mettre le site à jour.

## Stack technique

- **HTML5** sémantique : tout le contenu des fenêtres est présent dans la page
- **CSS vanilla** (variables CSS, Grid, Flexbox, `clip-path`)
- **JavaScript vanilla** (ES6+, scripts classiques `defer`, canvas pour le pixel art)
- **Polices** : IBM Plex Mono et VT323
- **Hébergement** : GitHub Pages
- **CI/CD** : GitHub Actions (lint + déploiement)

Aucune dépendance d'exécution, aucun backend, aucune étape de build.

## Mention IA

Ce portfolio a été conçu et développé avec l'assistance d'outils d'intelligence
artificielle, utilisés comme de véritables **outils de productivité**. C'est une démarche
assumée : l'IA fait aujourd'hui partie intégrante du métier de développeur, et je choisis
de **m'y adapter et de la maîtriser** plutôt que de l'ignorer.

Ce qui fait la différence, c'est l'usage : je me **documente en profondeur** sur ces
outils pour les exploiter avec discernement. L'IA accélère la mise en œuvre — elle ne
remplace ni la conception, ni les décisions techniques, ni la compréhension du code. La
très grande majorité des **fonctionnalités** et de la **stack technique** employées ici
me sont familières : je sais ce qui a été construit, pourquoi, et comment le faire évoluer
et le maintenir.

Concrètement, un projet de cette envergure représente normalement **5 à 7 semaines de
travail à temps plein** (plusieurs mois en parallèle de mes études). En m'appuyant sur
l'IA, je l'ai réalisé en une fraction de ce temps, en concentrant mon énergie sur
l'**architecture**, la **qualité** et les **détails** plutôt que sur les tâches
répétitives. C'est exactement le gain de productivité que je recherche dans un
environnement de travail moderne.

## Structure du projet

```
portfolio/
├── public/                      # Tout ce qui est servi sur le web (racine du site)
│   ├── index.html               # Le bureau : boot, icônes, fenêtres, barre des tâches
│   ├── 404.html                 # Page d'erreur (racine requise par GitHub Pages)
│   ├── robots.txt / sitemap.xml # Référencement
│   ├── version.json             # Version publiée
│   ├── .nojekyll                # Désactive le traitement Jekyll de GitHub Pages
│   ├── data/profile.json        # Statut affiché (modifiable depuis GitHub)
│   └── assets/
│       ├── css/os.css           # Styles de l'interface
│       ├── js/                  # core, icons, wallpaper, windows, scenes, parcours, contact, boot
│       ├── pdf/CV_VILLEDIEU_FABIEN.pdf
│       ├── img/                 # Photo, favicon, captures (projects/)
│       └── pages/               # Anciennes adresses v1 → redirections vers /#fenêtre
├── .github/workflows/           # CI/CD GitHub Actions
├── package.json                 # Outillage de lint/format (dev uniquement)
├── ARCHITECTURE.md              # Choix techniques et organisation
├── CHANGELOG.md                 # Historique des versions
├── SPRINTS.md                   # Backlog et avancement par sprint
└── README.md
```

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour le détail des choix techniques.

## Déploiement

Le déploiement est **automatique** : tout push sur `main` déclenche le workflow
GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) qui
lint le code puis publie `public/` sur GitHub Pages (Source : « GitHub Actions »).

## Méthode de travail et versionnage

- Le projet avance par **sprints** (1 sprint = 1 fonctionnalité), suivis dans
  [SPRINTS.md](SPRINTS.md).
- Hors refonte, on **commite directement sur `main`**. La refonte v2 se fait sur la
  branche `refonte-v2`, fusionnée dans `main` à sa sortie.
- Versionnage sémantique `MAJEUR.MINEUR.CORRECTIF`, **tag Git** `vX.Y.Z` à chaque
  version publiée, historisée dans [CHANGELOG.md](CHANGELOG.md).
- Les fichiers de documentation racine sont mis à jour **à chaque sprint**.
