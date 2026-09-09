# Architecture

Ce document décrit l'organisation du projet et les choix techniques, conformément
au référentiel de développement (§2.2).

## Nature du projet

Portfolio personnel **statique multi-pages**, déployé sur **GitHub Pages**. GitHub Pages
ne sert que des fichiers statiques (HTML/CSS/JS) : il n'y a **ni backend, ni base de
données, ni code serveur**. Ce constat conditionne l'ensemble des choix ci-dessous et
explique les sections du référentiel qui ne s'appliquent pas (voir « Périmètre »).

## Choix du frontend : Niveau 1 — Vanilla

Le référentiel impose de commencer au niveau le plus simple et de ne monter en
complexité que si le besoin l'exige. Un portfolio vitrine n'exige aucune interactivité
lourde : on reste donc en **Niveau 1 (Vanilla)**.

- **HTML5 sémantique** : `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **CSS vanilla** : variables CSS pour le thème (clair/sombre), Grid et Flexbox.
- **JavaScript vanilla (ES6+)** : coquille partagée, bascule de thème, animations
  d'apparition (`IntersectionObserver`), galerie/lightbox, formulaire de contact,
  chargement de la version via `fetch`.

Aucune dépendance d'exécution, aucun bundler : les fichiers sont livrés tels quels.
Seule exception : la bibliothèque d'icônes **Lucide**, chargée via CDN (les icônes de
marque GitHub/LinkedIn, retirées de Lucide, sont fournies en SVG inline).

## Architecture multi-pages

Le site comporte plusieurs pages HTML indépendantes (Accueil, Projets, À propos,
Contact, 404, et une page détail par projet dans `pages/`). Pour rester **DRY** sans
étape de build :

- **Coquille partagée** : l'en-tête (navigation + bascule de thème) et le pied de page
  sont injectés par `main.js` depuis une **source unique**, dans les emplacements
  `<header data-shell="header">` et `<footer data-shell="footer">`.
- **Chemins relatifs** : chaque page déclare sur `<html>` un attribut `data-base` égal
  au chemin relatif vers la racine du site (`""` à la racine, `"../../"` dans
  `assets/pages/`, `"../../../"` dans `assets/pages/projets/`) et `data-page` (clé de la
  page active pour surligner le bon lien de navigation). Les liens de la coquille et la
  lecture de `version.json` sont préfixés par `data-base`, si bien que le site fonctionne
  aussi bien à la racine d'un domaine que dans un sous-dossier (`/portfolio/`).
- **Thème sans clignotement** : un petit script inline dans le `<head>` applique le
  thème (depuis `localStorage` ou la préférence système) **avant le premier rendu**.
- **Robustesse** : les scripts sont des scripts classiques `defer` (et non des modules
  ES), pour fonctionner même en `file://`. Le contenu n'est masqué pour l'animation
  d'apparition que lorsque le JavaScript est actif (classe `.js`) : sans JS, tout
  reste visible.

## Organisation des fichiers

```
public/                          # Racine web (seul dossier publié)
├── index.html                   # Accueil (point d'entrée)
├── 404.html                     # Page d'erreur (racine requise par GitHub Pages)
├── robots.txt                   # Directives robots + lien sitemap
├── sitemap.xml                  # Plan du site (SEO)
├── version.json                 # Version courante (lue par main.js, affichée en footer)
├── .nojekyll                    # Empêche GitHub Pages de traiter le site avec Jekyll
└── assets/
    ├── css/styles.css           # Styles + variables de thème
    ├── js/main.js               # Coquille partagée + comportements UI
    ├── cv-fabien-villedieu.pdf
    ├── img/                     # Photo, favicon, et captures dans projects/
    └── pages/                   # Pages HTML secondaires
        ├── projets.html
        ├── a-propos.html
        ├── contact.html
        └── projets/             # Pages détail (une par projet)
            ├── ihm-pymodaq.html
            ├── jeu-unity.html
            ├── jeu-pygame.html
            └── recherche-textuelle.html

# Racine du dépôt (hors web) : outillage et documentation
.github/workflows/deploy.yml     # CI/CD : lint + déploiement Pages
package.json                     # Dépendances de développement (linters)
eslint.config.js                 # Config ESLint (JS)
.stylelintrc.json                # Config Stylelint (CSS)
.prettierrc.json                 # Config Prettier (format)
```

La séparation entre `public/` (servi sur le web) et le reste du dépôt (outillage,
docs) respecte le §2.2 du référentiel : aucun fichier de configuration n'est exposé.

## Principaux comportements JavaScript (`main.js`)

- `injectHeader` / `injectFooter` — coquille partagée (source unique).
- `setupTheme` — bascule clair/sombre, persistée dans `localStorage`.
- `setupMobileMenu` — menu déroulant responsive.
- `setupReveal` — apparition au défilement (contenu toujours visible sans JS / en
  `prefers-reduced-motion`).
- `setupGallery` — galerie d'images + lightbox accessible (Échap, flèches, précédent/suivant).
- `setupContactForm` — validation côté client, notifications (toasts), envoi par
  `mailto:` ou Formspree (`data-formspree-id`), honeypot anti-spam.
- `loadVersion` — lit `version.json` et affiche la version en footer.

## Conventions

- **Commentaires** : français pour le contenu/métier, anglais pour le code technique générique (§2.3).
- **CSS** : nommage des classes en `kebab-case`, variables `--kebab-case`.
- **JS** : variables et fonctions en `camelCase`, constantes en `UPPER_SNAKE_CASE`.
- **URL / fichiers** : `kebab-case` (`a-propos.html`, `pages/ihm-pymodaq.html`).
- **Icônes** : Lucide uniquement — tailles 16px (inline), 20px (boutons), 24px (sections).

## Accessibilité et responsive (§6.4)

- Mobile-first, testé du mobile au desktop.
- Cible WCAG niveau AA : contrastes suffisants, navigation clavier complète,
  attributs ARIA (formulaire, lightbox, navigation), `alt` sur toutes les images,
  lien d'évitement (« skip link »).
- Mode sombre par défaut, avec respect de `prefers-color-scheme` et bascule manuelle persistée.
- Animations désactivées si `prefers-reduced-motion` (contenu toujours visible).

## Référencement (SEO)

- Titre et description propres à chaque page.
- Balises **Open Graph** (`og:*`) et `theme-color` pour le partage et l'UI navigateur.
- Lien **canonical** par page ; `robots.txt` et `sitemap.xml`.
- La page 404 est marquée `noindex`.

Les URL absolues sont construites sur la base `https://vil-ciel.github.io` (page
utilisateur, à la racine ; à adapter si l'adresse de déploiement change — voir README).

## Performance (§12)

- Pas de framework ni de build → charge utile minimale.
- `loading="lazy"` sur les images non critiques (vignettes et galeries).
- Objectif Lighthouse > 80 sur toutes les métriques.

## Périmètre : sections du référentiel non applicables

Ces sections supposent un backend que GitHub Pages ne peut pas héberger et sont donc
hors périmètre pour ce portfolio statique : §3.1 `install.php`, §3.2 migrations BDD,
§4 authentification / rôles / 2FA / logs d'audit, §5.1 & 5.4 RGPD (aucune donnée
collectée), §7 IA embarquée (exposerait les clés API), §8 upload de fichiers,
§9 tchat, §10 notifications serveur, §11 sauvegardes BDD, §15 tâches planifiées,
§16 API / Hub / webhooks, §17.1 stack backend PHP/MySQL.

Décision validée : pas de pages légales ni de bandeau cookies, le site ne déposant
aucun cookie et ne collectant aucune donnée personnelle. Le formulaire de contact
n'enregistre rien côté serveur (envoi par client mail, ou Formspree si configuré).

## Note sur le menu (§6.2)

Le référentiel impose un menu vertical à gauche **pour les pages internes d'une
application authentifiée**. Ce portfolio est un site vitrine public (cas §6.1) : la
convention adaptée est une barre de navigation horizontale en haut, partagée entre
toutes les pages. La règle §6.2 ne s'applique donc pas ici.

## Méthode de travail

Développement par **sprints** (1 sprint = 1 fonctionnalité), suivis dans `SPRINTS.md`.
Commits **directement sur `main`**, avec un **tag** `vX.Y.Z` par version et mise à jour
du `CHANGELOG.md` et des docs racine à chaque sprint.
