# Sprints — Portfolio Fabien Villedieu

Chaque sprint livre **une fonctionnalité** complète et vérifiée. Une fonctionnalité
n'est « terminée » qu'après vérification (navigateur interne, puis test dans Firefox)
et mise à jour du `CHANGELOG.md`.

Légende : ✅ terminé · 🚧 en cours · ⬜ à faire

---

## État actuel

- Version en ligne : **v1.7.0** (`main`, `public/version.json`). Un commit publié sur
  `main` = une version taguée `vMAJEUR.MINEUR.CORRECTIF`.
- 🚧 **Refonte v2 « OS personnel »** sur la branche **`refonte-v2`** (la v1 reste en
  ligne jusqu'à la fusion). DA validée le 2026-11-18 : le portfolio est un système
  d'exploitation fictif, chaque projet est un programme avec une animation pixel art
  dessinée en code. Style rétro / terminal, base sombre, violet en minorité, glitch
  ponctuel. Maquette de référence hors dépôt : `Portofolio_Project/maquette-os.html`.
- Sprints v2-1 (fondations), v2-2 (pixel art) et **v2-3 (programmes système)**
  terminés côté code, en attente du test dans Firefox. Fond d'écran : bannière convertie en ASCII (variante 4), image
  définitive à récupérer.
- Le statut affiché vient de `public/data/profile.json`.

## Prochaines étapes

- [ ] Suite de la frise selon les événements : une piste d'alternance dès 2026 reste
      possible. Selon l'issue, PMA ou CPE deviendra la voie principale (l'autre passant
      en parallèle) : clé `prioritaire` à basculer dans `public/data/parcours.json`
      (CPE = 1 aujourd'hui), dates et descriptions à ajuster, et `profile.json`.
- [ ] Fond d'écran : piste retenue = bannière LinkedIn convertie en ASCII (variante 4).
      Le logo du serveur communautaire reste visible (décision du 2026-11-18). Récupérer
      l'image définitive en haute résolution (`public/assets/img/fond-banniere.png`, pas encore versionnée),
      puis retirer les variantes 1-3 et le sélecteur de test du menu.
- [ ] Tester dans Firefox les scènes DAP, stage et plaine (rendu, fluidité, consommation).
- [ ] Tester le formulaire de contact en conditions réelles (un vrai envoi depuis le
      site en ligne ou en local) et vérifier la réception du mail.
- [ ] Vérifier au premier déploiement de la v2 que l'aperçu du CV est bien généré par
      GitHub Actions (`public/assets/img/cv-apercu.png`).
- [ ] Sprint v2-4 : fenêtres complètes des autres projets + animations (s'appuie sur
      les fiches projet en Markdown à rassembler).
- [ ] Sprint v2-5 : accessibilité, audit de performance, polices hébergées sur le site,
      SEO, docs, `version.json` 2.0.0, fusion dans `main`, tag `v2.0.0`.
- [ ] Photos des PyMoDAQ Days à intégrer dans la fenêtre DAP.
- [ ] Sprint v2-4 : animation de la fenêtre `devis-api` (contenu déjà en place).

## Journal

- 2026-11-19 : frise du parcours, clé `prioritaire` (1 = oui, 0 = non) sur les grands
  encadrés : l'encadré prioritaire reste sur la ligne de vie, l'autre passe sur la voie
  parallèle. CPE est prioritaire par défaut. Vérifié dans les deux sens (CPE prolongé
  et non prioritaire → passe en parallèle, PMA sur la ligne de vie), sans chevauchement.
- 2026-11-19 : frise du parcours. Règle unique de placement des titres et descriptions
  (une ligne dedans → description sous le titre dedans → dehors aligné à gauche → dehors
  centré → retours à la ligne), dedans en haut / dehors au-dessus pour les grands
  encadrés, dedans en bas / dehors juste dessous pour les encadrés imbriqués. Frise qui
  commence en décembre 2022 (`debut_affichage`), encadrés antérieurs ouverts à gauche ;
  lycée terminé avec la terminale. Activités en parallèle : deux grands encadrés qui se
  chevauchent passent sur une voie à part, reliée à la ligne de vie par une piste.
  Ajout de PMA : temps partiel en novembre 2026 (en parallèle de CPE) et CDD de
  décembre 2026 à juillet 2027 ; ce qui est à venir est en pointillés, et la branche
  « Alternance » part de la fin du CDD. Contrôle automatique : aucun chevauchement,
  aucune étiquette sur le bord d'un encadré.
- 2026-11-19 : frise du parcours à échelle de temps constante (42 px par mois) : les
  durées redeviennent comparables (les deux années de BTS ont la même largeur). La
  frise, plus longue que la fenêtre, défile horizontalement, s'ouvre centrée sur
  aujourd'hui et se déplace aussi en glissant à la souris ; tous les mois sont repérés.
  Étiquettes des encadrés imbriqués trop étroits alignées sur le bord gauche de leur
  encadré, débordant vers la droite si besoin mais toujours dans le grand encadré et
  sans passer sur un autre encadré. Contrôle automatique : aucun chevauchement, aucune
  étiquette hors de son grand encadré.
- 2026-11-19 : frise du parcours, mise en page reprise. Ligne de vie et encadré du
  lycée prolongés hors champ à gauche (`debut_affichage`, la seconde n'est pas
  présentée). Grands encadrés titrés en haut, encadrés imbriqués titrés en bas, ou
  juste dessous s'ils sont trop étroits, toujours dans leur parent ; les encadrés
  grandissent selon le texte (description sur la même ligne, puis sous le titre,
  puis retours à la ligne). Textes mesurés avec la vraie police. Nœuds légendés en
  haut puis en bas quand le haut est plein. BTS découpé en 1re / 2e année (cassure de
  l'été 2025), projet DAP en encadré dans la 2e année (février → juin 2026). CPE :
  stagiaire de la formation professionnelle, pas d'alternance trouvée pour continuer
  mais cours suivis. Liens croisés frise ↔ version texte pour les éléments sans
  programme (clic = défilement + surbrillance). « Sacred timeline » → « Timeline ».
  Contrôle automatique : aucun chevauchement de textes.
- 2026-11-19 : Parcours refait en frise chronologique sur une seule ligne de vie (les
  branches donnaient l'idée de timelines parallèles). Périodes en encadrés imbriqués
  (lycée ⊃ première / terminale, BTS ⊃ stage, CPE ⊃ PyMoDAQ Days relié au projet DAP),
  projets et diplômes en nœuds légendés sur la ligne, branche « Alternance · sept.
  2027 » en pointillés qui s'estompent, avec école et rythme lus depuis
  `profile.json` (nouveau champ `ecole`). Tout le contenu vient de
  `public/data/parcours.json` (périodes, événements, futur) : graphique et version
  texte (encadrés imbriqués, du plus récent au plus ancien) se reconstruisent à partir
  de ce fichier. Échelle automatique qui élargit les mois chargés ; étiquettes placées
  par étages sans chevauchement (contrôle automatique : aucun chevauchement).
- 2026-11-19 : ajout du projet `devis-api` (API REST de devis en TypeScript, Express 5,
  PostgreSQL), livrable technique d'une candidature d'alternance réalisé en 4-5 jours
  sur une stack nouvelle. Décisions : l'entreprise n'est pas nommée ; une section
  « Apprendre vite » explique l'usage de l'IA comme professeur, dans l'esprit d'un TP
  (troisième exception validée à la règle des mentions IA). Fenêtre complète (contexte,
  routes, règles métier, choix techniques, limites assumées), icône, entrée dans le
  menu, le terminal, la timeline et le journal. Timeline : étiquettes de la branche
  CPE déplacées sous la trace (la croix les recouvrait), « MAINTENANT » sous la ligne
  rouge ; contrôle automatique des chevauchements d'étiquettes : aucun.
- 2026-11-19 : Recherche textuelle replacée en terminale (2023-2024), comme l'indique
  la description du dépôt GitHub. Fenêtre du stage : ajout du plugin
  `pymodaq_plugins_cellkraft` (pilotage du générateur de vapeur Cellkraft E1500 en
  Modbus TCP, lecture de pression), co-écrit avec deux chercheurs et publié sur PyPI
  dans l'organisation PyMoDAQ. `pymodaq_plugins_teaching` (fork de test au début du
  stage) n'est pas présenté.
- 2026-11-19 : sprint v2-3 (programmes système). Profil : « Méthode de travail »
  (5 étapes) et aparté « Comment j'utilise l'IA » repris de la section du README.
  Parcours : timeline façon *Loki* en SVG (`parcours.js`) — ligne principale de la
  première au BTS obtenu, projets en branches cliquables, branche élaguée pour CPE
  Lyon, ligne arrêtée à aujourd'hui avec un curseur « ALTERNANCE 2027 — à écrire » ;
  journal texte conservé dessous. Dates des projets d'école : Recherche textuelle en
  première (2022-2023), Pygame en terminale (2023-2024), Unity en BTS 1 (2024-2025) —
  les dates de commit GitHub ne servent pas (dépôts recréés le 2026-01-08). CV : aperçu
  de la première page généré par GitHub Actions au déploiement (`pdftoppm`, étape non
  bloquante), repli affiché sinon. Contact : formulaire relié à Formspree en
  JavaScript simple (`contact.js`, sans bibliothèque externe), validation en français,
  champ piège anti-robots, objet du mail préfixé « Portfolio — », envoi classique sans
  JavaScript ; testé avec un envoi simulé uniquement.
- 2026-11-18 : sprint v2-2 (pixel art). Moteur `scenes.js` : une seule boucle
  d'animation, qui ne dessine que les scènes visibles (fenêtre ouverte, non réduite, à
  l'écran, onglet actif) et dort entre deux images (≈15 réveils/s avec trois scènes,
  0 quand rien n'est visible) ; décors fixes pré-rendus ; image fixe si les animations
  sont réduites ; images/s affichées dans la barre d'état de la fenêtre. Scènes :
  DAP (trois capteurs → Raspberry Pi → un seul lien ZMQ → PyMoDAQ, chaque trame met à
  jour les trois voies), stage (PC d'acquisition, NI-DAQmx, bain thermostaté avec
  afficheur, veine d'essai, vapeur, ventilateur), plaine (cycle jour/nuit). Mesure dans
  le navigateur interne : ≈12 ms de JS par seconde avec les trois scènes ouvertes.
- 2026-11-18 : fond d'écran bannière illisible en première version (un caractère traité
  comme un pixel, résolution trop faible). Réécriture : choix du caractère par
  correspondance de forme (6 zones circulaires par caractère, comparées aux 95
  caractères ASCII dessinés dans la police du site, méthode d'Alex Harri « ASCII
  characters are not pixels ») + renforcement du contraste, police de 8 px (≈300
  colonnes sur un écran 1440 px), bloc de logos agrandi, dessin sur un canvas au lieu
  de milliers d'éléments texte. Calcul unique ≈250 ms dans le navigateur interne. Les
  textes minuscules des logos restent illisibles (taille inférieure à une case).
- 2026-11-18 : correction du bouton de fermeture des fenêtres (une variable locale
  masquait la fonction de fermeture ; Échap fonctionnait). Fond d'écran : ajout d'un
  convertisseur image → ASCII dans le navigateur (variante 4) — détection automatique
  de la zone des logos, bloc ancré en bas à droite, caractère choisi selon la forme du
  trait (`|` `-` `/` `\` `#`), dégradé prolongé sur tout l'écran. Calcul unique au
  chargement et au redimensionnement.
- 2026-11-18 : sprint v2-1 (fondations) sur la branche `refonte-v2`. Nouvelle page
  unique en forme de bureau : boot de première visite (passable, non rejoué), encadré
  Profil, icônes dessinées en code, fond d'écran ASCII (3 variantes en test), barre des
  tâches avec raccourci CV et statut, gestionnaire de fenêtres (déplacer, réduire,
  fermer, Échap en cascade, défilement remis en haut à chaque ouverture, une adresse
  par fenêtre), affichage mobile en écran d'accueil, statut lu depuis
  `data/profile.json`. Contenus des fenêtres DAP, stage et bénévolat repris de la
  maquette (scènes au sprint 2). Anciennes pages v1 remplacées par des redirections
  vers les fenêtres correspondantes ; 404 refaite ; `styles.css` et `main.js` retirés.
- 2026-11-18 : retours sur la maquette OS et validation du plan v2 (5 sprints, branche
  dédiée pour ne pas exposer un site à moitié fait pendant la recherche d'alternance).
- 2026-11-17 : reprise du chantier DA. Analyse du portfolio v1 et du TVA Dashboard ;
  maquette « dashboard » écartée (trop proche du TVA), maquette « OS » retenue.
- 2026-09-23 : ajout du projet « Plugins DAP Pymodaq » au portfolio (projet
  d'examen E6/U62, invitation aux PyMoDAQ Days 2026), correction du lien CV cassé
  dans `a-propos.html`. Publication en v1.7.0, premier commit sous la nouvelle
  convention de versionnage par commit.
- 2026-09-23 : nettoyage de l'historique Git (suppression des lignes d'attribution
  automatique dans les messages de commit existants), conformément à la règle
  « Mention IA » du `README.md`.
- 2026-09-23 : mise en pause du chantier DA (pistes Cynosure / GIMMI) pendant la
  recherche d'alternance, pour construire l'identité visuelle sans urgence.
- 2026-09-10 : reprise du projet. `git pull` (branche locale réalignée sur `origin/main`,
  jusqu'à `05793d7`). Documentation racine réalignée sur le nouveau chemin du CV
  (`assets/pdf/`). Lien CV cassé repéré dans `a-propos.html`.
- 2026-09-10 : première piste de refonte, DA « Cynosure » (inspiration Cyberpunk 2077),
  maquette statique produite hors dépôt.

---

## 🚧 Refonte v2 — « OS personnel »

### 🚧 Sprint v2-1 — Fondations
Boot, bureau, fond d'écran ASCII, barre des tâches (raccourci CV, statut), gestionnaire
de fenêtres (Échap, défilement réinitialisé, adresses directes), mobile, `profile.json`,
LISEZ-MOI, redirections des anciennes adresses, 404.

### 🚧 Sprint v2-2 — Pixel art
Moteur d'animation (une boucle, arrêt hors écran), scènes DAP, stage et plaine.
Code terminé, en attente du test Firefox.

### 🚧 Sprint v2-3 — Programmes système
Profil, Parcours en timeline façon *Loki*, CV avec aperçu, contact Formspree, terminal.
Code terminé, en attente du test Firefox et d'un vrai envoi de formulaire.

### ⬜ Sprint v2-4 — Autres projets
TVA Dashboard, CC Radio System, Unity, Pygame, recherche textuelle, portfolio.

### ⬜ Sprint v2-5 — Finitions et sortie
Accessibilité, performance, polices locales, SEO, documentation, v2.0.0.

---

## v1 — site multi-pages (archivé)

## ✅ Sprint 0 — Fondations (v0.1.0)
Scaffold du projet : structure `public/`, thème clair/sombre, icônes Lucide,
responsive WCAG AA, linters (ESLint/Stylelint/Prettier), CI/CD GitHub Actions,
documentation (README, ARCHITECTURE, CHANGELOG).

## ✅ Sprint 1 — Architecture multi-pages & assets (v0.2.0)
Passage d'une page unique à un site **multi-pages**, comme le portfolio d'origine.
Coquille partagée, thème persistant sans clignotement, assets importés depuis GitHub,
pages Accueil / Projets / À propos / Contact / 404, navigation avec page active.

## ✅ Sprint 2 — Pages détail des projets (v0.3.0)
Une page détail par projet, fidèle à l'original (présentation, objectifs,
fonctionnalités, difficultés, axes d'amélioration, technologies, durée, type,
code source), avec galerie d'images et agrandissement (lightbox).

## ✅ Sprint 3 — Page À propos détaillée (v0.4.0)
Bio + photo et faits rapides, compétences avec niveaux, qualités, centres d'intérêt,
expérience (CETHIL), formation, langues, et téléchargement du CV mis en avant.

## ✅ Sprint 4 — Page Contact (v0.5.0)
Formulaire de contact (validation temps réel, toasts de feedback, envoi mailto
sans dépendance + Formspree optionnel, honeypot anti-spam), coordonnées (email,
GitHub, LinkedIn, localisation).

## ✅ Sprint 5 — SEO, performance & accessibilité (v1.0.0)
Métadonnées + Open Graph + `canonical` + `theme-color` par page, `sitemap.xml`,
`robots.txt`, lazy-loading des images, navigation clavier et contrastes vérifiés,
documentation racine actualisée. Première version « production », tag Git `v1.0.0`.
