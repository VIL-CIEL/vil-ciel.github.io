# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/) (`MAJEUR.MINEUR.CORRECTIF`).

## [0.3.1] - 2026-06-03

### Corrigé
- Le site s'affiche désormais correctement même ouvert en `file://` ou si le
  JavaScript échoue : passage des scripts ES modules à des scripts classiques
  `defer`, et le contenu n'est masqué pour l'animation que lorsque le JS est actif.
- Le contenu déjà visible à l'écran est révélé immédiatement (plus de page « vide »
  si l'IntersectionObserver ne se déclenche pas) ; révélation complète en cas de
  `prefers-reduced-motion`.

## [0.3.0] - 2026-06-03

### Ajouté
- **Pages détail des projets** : IHM Pymodaq, Jeu Unity, Jeu Pygame, Recherche textuelle.
- Gabarit commun : présentation, objectifs, fonctionnalités, difficultés, axes
  d'amélioration, et panneau méta (technologies, durée, type, code source).
- **Galerie d'images** par projet avec **lightbox** accessible (clavier : Échap,
  flèches gauche/droite ; navigation précédent/suivant).
- Fil d'Ariane sur les pages détail.
- Liens « voir le détail » depuis la page Projets et les projets phares de l'accueil.

## [0.2.0] - 2026-06-03

### Ajouté
- Architecture **multi-pages** : Accueil, Projets, À propos, Contact et page 404.
- Coquille partagée (header + navigation + footer) injectée depuis une source unique.
- Indication de la page active dans la navigation.
- Photo de profil, CV (v5) et captures d'écran des projets importés depuis le dépôt d'origine.
- URL LinkedIn réelle.

### Modifié
- Le thème clair/sombre est désormais appliqué avant le rendu (plus de clignotement)
  et persiste d'une page à l'autre.
- `main.js` restructuré pour gérer la coquille partagée et les chemins relatifs.

## [0.1.0] - 2026-06-03

### Ajouté
- Structure initiale du projet (séparation `public/` web et outillage à la racine).
- Page d'accueil statique : profil, expérience, compétences, projets, formation, langues, contact.
- Thème sombre par défaut avec bascule clair/sombre respectant la préférence système.
- Design responsive (mobile-first) et accessibilité WCAG AA (navigation clavier, ARIA, alt text, skip link).
- Icônes Lucide.
- Numéro de version affiché en footer, alimenté par `public/version.json`.
- Documentation : `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`.
- Configuration des linters ESLint, Stylelint et Prettier.
- Workflow GitHub Actions : lint + déploiement automatique sur GitHub Pages depuis `main`.
