# Architecture

Ce document décrit l'organisation du projet et les choix techniques, conformément
au référentiel de développement (§2.2). Il décrit la **v2** (interface « OS personnel »),
en cours de réalisation sur la branche `refonte-v2`.

## Nature du projet

Portfolio personnel **statique**, déployé sur **GitHub Pages**. GitHub Pages ne sert que
des fichiers statiques (HTML/CSS/JS) : il n'y a **ni backend, ni base de données, ni
code serveur**. Ce constat conditionne l'ensemble des choix ci-dessous et explique les
sections du référentiel qui ne s'appliquent pas (voir « Périmètre »).

## Choix du frontend : Niveau 1 — Vanilla

On reste en **Niveau 1 (Vanilla)** : aucune dépendance d'exécution, aucun bundler, les
fichiers sont livrés tels quels.

- **HTML5 sémantique** : une seule page, **tout le contenu des fenêtres est écrit dans le
  HTML** (référencement, lecture sans JavaScript).
- **CSS vanilla** : variables CSS, Grid/Flexbox, `clip-path` pour les coins biseautés.
- **JavaScript vanilla (ES6+)** : gestionnaire de fenêtres, boot, fond d'écran ASCII,
  icônes et scènes en pixel art sur `<canvas>`.

## Concept : un système d'exploitation fictif

- **Boot** : séquence courte (≈2,5 s), passable (bouton, Échap, Entrée), jouée seulement
  à la première visite (`localStorage`). La classe `is-booting` est posée dès le `<head>`
  pour éviter tout flash du bureau.
- **Bureau** : icônes de programmes (Système / Projets / Bénévolat), encadré Profil
  (statut, début, domaine, zone), fond d'écran ASCII.
- **Barre des tâches** : menu, fenêtres ouvertes, raccourci de téléchargement du CV,
  statut, heure de Lyon.
- **Fenêtres** : une `<section class="win">` par programme, déplaçable, réductible,
  fermable (bouton ou **Échap**, en cascade). Chaque ouverture repart du haut, comme un
  vrai logiciel. Glitch violet à l'ouverture et à la fermeture.
- **Adresses** : chaque fenêtre a son ancre (`/#dap`) ; ouvrir une fenêtre met l'adresse
  à jour (`history.replaceState`), une adresse avec ancre ouvre la fenêtre au chargement.
- **Mobile** (≤ 760 px) : écran d'accueil (grille d'icônes) et fenêtres plein écran avec
  bouton « ← Bureau ».

## Organisation des fichiers

```
public/                          # Racine web (seul dossier publié)
├── index.html                   # Le bureau et toutes les fenêtres
├── 404.html                     # Page d'erreur (chemins absolus)
├── robots.txt, sitemap.xml      # Référencement
├── version.json                 # Version publiée
├── .nojekyll
├── data/profile.json            # Statut affiché (modifiable depuis GitHub)
└── assets/
    ├── css/os.css               # Styles de l'interface
    ├── js/
    │   ├── core.js              # Espace de noms FV, utilitaires, pixel art, profil
    │   ├── icons.js             # Icônes 16×16 dessinées en code
    │   ├── wallpaper.js         # Fond d'écran ASCII (statique)
    │   ├── windows.js           # Fenêtres, barre des tâches, menu, notifications, terminal
    │   ├── scenes.js            # Moteur et scènes pixel art des fenêtres
    │   └── boot.js              # Boot + initialisation (chargé en dernier)
    ├── pdf/CV_VILLEDIEU_FABIEN.pdf
    ├── img/                     # Photo, favicon, captures dans projects/
    └── pages/                   # Anciennes adresses v1 : redirections vers /#fenêtre
```

Les scripts sont des **scripts classiques `defer`** (et non des modules ES) pour
fonctionner aussi en `file://`. Ils partagent un seul espace de noms global, `FV`.

## Statut modifiable : `data/profile.json`

Le HTML contient des valeurs par défaut dans les éléments `[data-profile="clé"]` ;
`core.js` charge `data/profile.json` et les remplace. Seules les clés connues, en texte
court, sont acceptées. Hors serveur (`file://`), les valeurs du HTML restent affichées.
Modifier le fichier sur GitHub suffit : le push sur `main` redéploie le site. Seul le
propriétaire du dépôt peut écrire dans ce fichier ; aucune clé ni aucun secret n'est
exposé dans le site.

## Pixel art et performance

- Fond d'écran ASCII **calculé une fois** (et au redimensionnement), dessiné sur un
  canvas, puis **statique**. Variante bannière : l'image est convertie en ASCII par
  correspondance de forme (6 zones circulaires par caractère, comparées aux 95
  caractères ASCII dessinés dans la police du site) avec renforcement du contraste.
- Icônes dessinées une fois sur des canvas 16×16 agrandis sans lissage
  (`image-rendering: pixelated`).
- Scènes animées (`scenes.js`, 192×64 agrandies sans lissage) : une **seule boucle
  `requestAnimationFrame`** pour tout le site, 8 à 10 images par seconde. Elle ne dessine
  que les scènes visibles (fenêtre ouverte et non réduite, canvas à l'écran via
  `IntersectionObserver`, onglet actif), **dort entre deux images** (`setTimeout` jusqu'à
  la prochaine image utile) et s'arrête complètement quand rien n'est visible. Décors
  fixes pré-rendus sur des calques ; courbes sur de petits calques qui défilent d'un
  pixel. Les images/s s'affichent dans la barre d'état de chaque fenêtre et
  `FV.scenes.stats` donne le coût (ms de JS par seconde).
- `prefers-reduced-motion` : pas de boot, pas de glitch, scènes figées.

## Conventions

- **Commentaires** : français pour le contenu/métier, anglais pour le code technique générique (§2.3).
- **CSS** : classes en `kebab-case` façon BEM (`win__bar`, `pill--ok`), états en `is-*`,
  variables `--kebab-case`, conforme à `stylelint-config-standard`.
- **JS** : variables et fonctions en `camelCase`, constantes en `UPPER_SNAKE_CASE`.
- **URL / fichiers** : `kebab-case`.

## Accessibilité et responsive (§6.4)

- Tout est utilisable au clavier : icônes et boutons natifs, Échap pour fermer, focus
  visible, ordre de tabulation logique.
- Les fenêtres ont `role="dialog"` et un nom accessible ; les éléments décoratifs
  (fond ASCII, icônes, scènes) sont `aria-hidden`.
- Sans JavaScript, toutes les fenêtres s'affichent les unes sous les autres.
- Mobile-first pour le contenu, écran d'accueil dédié sous 760 px.

## Référencement (SEO)

- Titre, description, Open Graph, `canonical` et `theme-color` sur la page.
- Contenu complet dans le HTML ; `sitemap.xml` réduit à la racine.
- Les anciennes pages v1 sont des redirections `noindex` avec `canonical` vers la
  fenêtre correspondante. La page 404 est `noindex`.

## Périmètre : sections du référentiel non applicables

Ces sections supposent un backend que GitHub Pages ne peut pas héberger et sont donc
hors périmètre pour ce portfolio statique : §3.1 `install.php`, §3.2 migrations BDD,
§4 authentification / rôles / 2FA / logs d'audit, §7 IA embarquée (exposerait les clés
API), §8 upload de fichiers, §9 tchat, §10 notifications serveur, §11 sauvegardes BDD,
§15 tâches planifiées, §16 API / Hub / webhooks, §17.1 stack backend PHP/MySQL.

Le site ne dépose aucun cookie. Le formulaire de contact (sprint 3) passera par un
service tiers (Formspree) qui transmet le message par e-mail : une mention l'indiquera
à côté du formulaire.

## Méthode de travail

Développement par **sprints** (1 sprint = 1 fonctionnalité), suivis dans `SPRINTS.md`.
La refonte v2 se fait sur la branche `refonte-v2`, fusionnée dans `main` à la sortie
(tag `v2.0.0`) ; hors refonte, commits directement sur `main`.
