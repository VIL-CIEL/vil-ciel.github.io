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
├── data/parcours.json           # Frise du parcours : périodes, événements, futur
└── assets/
    ├── css/os.css               # Styles de l'interface
    ├── js/
    │   ├── core.js              # Espace de noms FV, utilitaires, pixel art, profil
    │   ├── icons.js             # Icônes 16×16 dessinées en code
    │   ├── wallpaper.js         # Fond d'écran ASCII (statique)
    │   ├── windows.js           # Fenêtres, barre des tâches, menu, notifications, terminal
    │   ├── scenes.js            # Moteur et scènes pixel art des fenêtres
    │   ├── parcours.js          # Timeline du parcours (SVG)
    │   ├── contact.js           # Formulaire de contact (Formspree)
    │   └── boot.js              # Boot + initialisation (chargé en dernier)
    ├── fonts/                   # IBM Plex Mono et VT323 (WOFF2) + licences OFL
    ├── pdf/CV_VILLEDIEU_FABIEN.pdf
    ├── img/                     # Photo, favicon, image de partage, captures (WebP) dans projects/
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
  `FV.scenes.stats` donne le coût (ms de JS par seconde). Une scène par fenêtre de
  projet : `dap`, `lab` (stage), `plain` (bénévolat), `tva`, `rsmp`, `unity`, `pygame`,
  `recherche`, `devis`, `folio` (le bureau en miniature, redessiné dans sa propre fenêtre
  à partir de l'image précédente). Les textes des scènes utilisent la police 3×5 de
  `core.js` (majuscules, chiffres, quelques signes) ; le coin haut gauche est laissé libre
  pour l'étiquette « SIM // … ».
- `prefers-reduced-motion` : pas de boot, pas de glitch, scènes figées.

## Conventions

- **Commentaires** : français pour le contenu/métier, anglais pour le code technique générique (§2.3).
- **CSS** : classes en `kebab-case` façon BEM (`win__bar`, `pill--ok`), états en `is-*`,
  variables `--kebab-case`, conforme à `stylelint-config-standard`.
- **JS** : variables et fonctions en `camelCase`, constantes en `UPPER_SNAKE_CASE`.
- **URL / fichiers** : `kebab-case`.

## Accessibilité et responsive (§6.4)

- Tout est utilisable au clavier : icônes et boutons natifs, Échap pour fermer, focus
  visible partout (contour violet par défaut), ordre de tabulation logique. À
  l'ouverture, le focus va dans la fenêtre ; à la fermeture de la dernière fenêtre, il
  revient sur l'élément qui l'avait ouverte ; réduire une fenêtre le place sur sa tâche.
- La frise est navigable au clavier (Tab puis Entrée sur un nœud) et doublée d'une
  version texte. La sortie du terminal est annoncée aux lecteurs d'écran (`aria-live`).
- Contrastes vérifiés : textes secondaires ≥ 4,5:1 sur tous les fonds.
- Résumé en anglais (`lang="en"`) dans LISEZ-MOI et avec la commande `en` du terminal.
- Les fenêtres ont `role="dialog"` et un nom accessible ; les éléments décoratifs
  (fond ASCII, icônes, scènes) sont `aria-hidden`.
- Sans JavaScript, toutes les fenêtres s'affichent les unes sous les autres.
- Mobile-first pour le contenu, écran d'accueil dédié sous 760 px.

## Performance

- Polices hébergées sur le site, découpées par plage de caractères (seuls les morceaux
  utilisés sont chargés) et préchargées ; aucune requête vers un autre domaine.
- Captures des projets en WebP (avec ou sans perte selon l'image), chargement différé.
- Mesuré dans le navigateur interne : HTML + CSS + JS ≈ 64 Ko compressés ; dix scènes
  ouvertes ≈ 13,5 ms de JS par seconde, aucun travail quand rien n'est animé.

## Référencement (SEO)

- Titre, description, Open Graph (avec image de partage 1200×630,
  `assets/img/og-image.png`), carte Twitter, `canonical` et `theme-color` sur la page.
- Données structurées `Person` (JSON-LD) : nom, métier, ville, compétences, GitHub.
- Contenu complet dans le HTML ; `sitemap.xml` réduit à la racine.
- Les anciennes pages v1 sont des redirections `noindex` avec `canonical` vers la
  fenêtre correspondante. La page 404 est `noindex`.

## Périmètre : sections du référentiel non applicables

Ces sections supposent un backend que GitHub Pages ne peut pas héberger et sont donc
hors périmètre pour ce portfolio statique : §3.1 `install.php`, §3.2 migrations BDD,
§4 authentification / rôles / 2FA / logs d'audit, §7 IA embarquée (exposerait les clés
API), §8 upload de fichiers, §9 tchat, §10 notifications serveur, §11 sauvegardes BDD,
§15 tâches planifiées, §16 API / Hub / webhooks, §17.1 stack backend PHP/MySQL.

Le site ne dépose aucun cookie. Le formulaire de contact passe par un service tiers
(Formspree, endpoint `https://formspree.io/f/xkjrbaqb`) qui transmet le message par
e-mail ; une mention l'indique sous le formulaire. Envoi en `fetch` (JSON) quand
JavaScript est actif, envoi HTML classique sinon ; champ piège `_gotcha` contre les
robots.

## Parcours : `data/parcours.json`

La fenêtre Parcours est entièrement construite à partir de ce fichier (clé `_aide` en
tête pour le rappel du format) :

- `periodes` : encadrés (études, stage, événement de plusieurs jours), imbriqués via
  `dans` (id du parent), avec titre, sous-titre, description et `programme` optionnel
  (fenêtre ouverte au clic) ;
- `evenements` : nœuds sur la ligne (projets, diplômes), `cle: true` pour une étape
  clé ;
- `futur` : branches possibles après aujourd'hui, en pointillés qui s'estompent ; dans
  `lignes`, `{ecole}`, `{rythme}`… sont remplacés par les valeurs de `profile.json`.

Dates au format `AAAA-MM` ou `AAAA-MM-JJ` ; une fin au mois près couvre tout le mois.
`debut_affichage` fixe le début de la partie visible : ce qui commence avant déborde
à gauche, hors champ. Les entrées invalides sont ignorées (avertissement dans la
console).

Mise en page, calculée à partir des textes mesurés avec la vraie police : l'échelle
de temps est constante (42 px par mois, la frise défile horizontalement, s'ouvre
centrée sur aujourd'hui et se déplace en glissant à la souris) ; chaque encadré est dimensionné de l'intérieur
vers l'extérieur — grands encadrés titrés en haut, encadrés imbriqués titrés en bas
(ou juste dessous s'ils sont trop étroits, sans jamais sortir de leur parent) ; un
texte trop long passe d'abord sous le titre, puis revient à la ligne, et l'encadré
grandit en conséquence. Règle de placement d'un titre + description : une ligne dans
l'encadré, sinon description sous le titre dans l'encadré, sinon dehors aligné sur le
bord gauche, sinon dehors centré, sinon retours à la ligne (dedans = en haut pour un
grand encadré, en bas pour un imbriqué ; dehors = au-dessus / en dessous). Deux grands
encadrés qui se chevauchent dans le temps vont sur des voies parallèles, reliées à la
ligne de vie par une piste ; celui marqué `"prioritaire": 1` reste sur la ligne de vie
(à défaut, celui qui commence en premier). Ce qui commence après aujourd'hui est en pointillés ; les
branches du futur partent du dernier élément prévu. Les légendes des nœuds sont placées
par étages, en haut puis en bas. Un clic ouvre le programme associé ; sans programme, il fait défiler jusqu'à
l'entrée correspondante de la version texte (et inversement, avec surbrillance). La version texte (encadrés imbriqués,
du plus récent au plus ancien) est générée depuis le même fichier ; une liste écrite
dans le HTML sert de repli sans JavaScript ou hors serveur.

## Aperçu du CV

L'aperçu (première page en PNG) n'est pas versionné : le workflow de déploiement le
génère avec `pdftoppm` à partir de `assets/pdf/CV_VILLEDIEU_FABIEN.pdf`. Remplacer le
PDF suffit. L'étape est non bloquante ; sans aperçu, la fenêtre CV affiche un repli.

## Méthode de travail

Développement par **sprints** (1 sprint = 1 fonctionnalité), suivis dans `SPRINTS.md`.
La refonte v2 se fait sur la branche `refonte-v2`, fusionnée dans `main` à la sortie
(tag `v2.0.0`) ; hors refonte, commits directement sur `main`.
