# Portfolio — Fabien Villedieu

Portfolio web personnel de Fabien Villedieu (étudiant BTS CIEL, développeur junior).
Site **statique multi-pages** déployé via **GitHub Pages**.

## Aperçu

Site vitrine **multi-pages** présentant le profil, les projets (avec une page détail
par projet), le parcours et les moyens de contact. Construit en **vanilla**
(HTML5 / CSS3 / JavaScript ES6+), sans framework ni étape de build : les fichiers de
`public/` sont servis directement.

Pages :

- **Accueil** (`index.html`) — présentation, projets phares, accès rapides.
- **Projets** (`assets/pages/projets.html`) — liste des projets, liens vers les détails.
- **Pages détail** (`assets/pages/projets/*.html`) — une page par projet (présentation,
  objectifs, fonctionnalités, difficultés, axes d'amélioration, galerie avec lightbox).
- **À propos** (`assets/pages/a-propos.html`) — bio, compétences avec niveaux, qualités,
  parcours, centres d'intérêt.
- **Contact** (`assets/pages/contact.html`) — formulaire (validation + envoi) et coordonnées.
- **404** (`404.html`) — page d'erreur.

## Stack technique

- **HTML5** sémantique
- **CSS vanilla** (variables CSS, Grid, Flexbox, thème clair/sombre)
- **JavaScript vanilla** (ES6+, scripts classiques `defer`, `fetch`, `IntersectionObserver`)
- **Icônes** : [Lucide](https://lucide.dev/) (icônes de marque GitHub/LinkedIn en SVG inline)
- **Hébergement** : GitHub Pages
- **CI/CD** : GitHub Actions (lint + déploiement)

Conforme au niveau « Vanilla » (Niveau 1) du référentiel de développement : aucune
dépendance d'exécution, aucun backend.

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
│   ├── index.html               # Accueil (point d'entrée)
│   ├── 404.html                 # Page d'erreur (racine requise par GitHub Pages)
│   ├── robots.txt               # Directives robots + lien sitemap
│   ├── sitemap.xml              # Plan du site (SEO)
│   ├── version.json             # Version courante (affichée en footer)
│   ├── .nojekyll                # Désactive le traitement Jekyll de GitHub Pages
│   └── assets/
│       ├── css/styles.css       # Styles + variables de thème
│       ├── js/main.js           # Coquille partagée + comportements UI
│       ├── pdf/CV_VILLEDIEU_FABIEN.pdf
│       ├── img/                 # Photo, favicon, captures (projects/)
│       └── pages/               # Pages HTML secondaires
│           ├── projets.html
│           ├── a-propos.html
│           ├── contact.html
│           └── projets/         # Pages détail (une par projet)
│               ├── ihm-pymodaq.html
│               ├── jeu-unity.html
│               ├── jeu-pygame.html
│               └── recherche-textuelle.html
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
- On **commite directement sur `main`** ; un **tag Git** (`vX.Y.Z`) est posé à chaque
  version publiée.
- Versionnage sémantique `MAJEUR.MINEUR.CORRECTIF`. La version courante est définie
  dans [public/version.json](public/version.json), affichée dans le footer du site,
  et historisée dans [CHANGELOG.md](CHANGELOG.md).
- Les fichiers de documentation racine sont mis à jour **à chaque sprint**.
