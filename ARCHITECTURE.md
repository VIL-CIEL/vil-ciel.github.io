# Architecture

Ce document décrit l'organisation du projet et les choix techniques, conformément
au référentiel de développement (§2.2).

## Nature du projet

Portfolio personnel **statique**, déployé sur **GitHub Pages**. GitHub Pages ne sert
que des fichiers statiques (HTML/CSS/JS) : il n'y a **ni backend, ni base de données,
ni code serveur**. Ce constat conditionne l'ensemble des choix ci-dessous et explique
les sections du référentiel qui ne s'appliquent pas (voir « Périmètre »).

## Choix du frontend : Niveau 1 — Vanilla

Le référentiel impose de commencer au niveau le plus simple et de ne monter en
complexité que si le besoin l'exige. Un site vitrine d'une page n'exige aucune
interactivité lourde : on reste donc en **Niveau 1 (Vanilla)**.

- **HTML5 sémantique** : `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **CSS vanilla** : variables CSS pour le thème (clair/sombre), Grid et Flexbox pour la mise en page.
- **JavaScript vanilla (ES6+)** : bascule de thème, surbrillance de la section active
  (`IntersectionObserver`), apparition au défilement, chargement de la version via `fetch`.

Aucune dépendance d'exécution, aucun bundler : les fichiers sont livrés tels quels.
Seule exception : la bibliothèque d'icônes **Lucide**, chargée via CDN.

## Organisation des fichiers

```
public/                     # Racine web (seul dossier publié)
├── index.html              # Page unique
├── version.json            # Version courante (lue par main.js, affichée en footer)
├── .nojekyll               # Empêche GitHub Pages de traiter le site avec Jekyll
└── assets/
    ├── css/styles.css      # Styles + variables de thème
    ├── js/main.js          # Comportements UI
    └── img/                # Photo de profil, miniatures de projets, favicon

# Racine du dépôt (hors web) : outillage et documentation
.github/workflows/deploy.yml   # CI/CD : lint + déploiement Pages
package.json                   # Dépendances de développement (linters)
eslint.config.js               # Config ESLint (JS)
.stylelintrc.json              # Config Stylelint (CSS)
.prettierrc.json               # Config Prettier (format)
```

La séparation entre `public/` (servi sur le web) et le reste du dépôt (outillage,
docs) respecte le §2.2 du référentiel : aucun fichier de configuration n'est exposé.

## Conventions

- **Commentaires** : français pour le contenu/métier, anglais pour le code technique générique (§2.3).
- **CSS** : nommage des classes en `kebab-case`, variables `--kebab-case`.
- **JS** : variables et fonctions en `camelCase`, constantes en `UPPER_SNAKE_CASE`.
- **URL/ancres** : `kebab-case` (`#a-propos`, `#projets`).
- **Icônes** : Lucide uniquement — tailles 16px (inline), 20px (boutons), 24px (sections).

## Accessibilité et responsive (§6.4)

- Mobile-first, testé du mobile au desktop.
- Cible WCAG niveau AA : contrastes suffisants, navigation clavier complète,
  attributs ARIA, `alt` sur toutes les images, lien d'évitement (« skip link »).
- Mode sombre par défaut, avec respect de `prefers-color-scheme` et bascule manuelle persistée.
- Animations désactivées si `prefers-reduced-motion`.

## Performance (§12)

- Pas de framework ni de build → charge utile minimale.
- `loading="lazy"` sur les images non critiques.
- Objectif Lighthouse > 80 sur toutes les métriques.

## Périmètre : sections du référentiel non applicables

Ces sections supposent un backend que GitHub Pages ne peut pas héberger et sont donc
hors périmètre pour ce portfolio statique : §3.1 `install.php`, §3.2 migrations BDD,
§4 authentification / rôles / 2FA / logs d'audit, §5.1 & 5.4 RGPD (aucune donnée
collectée), §7 IA embarquée (exposerait les clés API), §8 upload de fichiers,
§9 tchat, §10 notifications serveur, §11 sauvegardes BDD, §15 tâches planifiées,
§16 API / Hub / webhooks, §17.1 stack backend PHP/MySQL.

Décision validée : pas de pages légales ni de bandeau cookies, le site ne déposant
aucun cookie et ne collectant aucune donnée personnelle.

## Note sur le menu (§6.2)

Le référentiel impose un menu vertical à gauche **pour les pages internes d'une
application authentifiée**. Ce portfolio est une page d'accueil publique unique
(cas §6.1) : la convention adaptée est une barre de navigation horizontale en haut
avec ancres vers les sections. La règle §6.2 ne s'applique donc pas ici.
