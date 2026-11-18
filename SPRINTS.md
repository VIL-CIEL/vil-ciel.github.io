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
- **Sprint v2-1 (fondations) terminé côté code**, en attente du test dans Firefox et
  du choix du fond d'écran ASCII (3 variantes dans le menu ◆, ou `?fond=1|2|3`).
- Le statut affiché vient de `public/data/profile.json`.

## Prochaines étapes

- [ ] Fond d'écran : piste retenue = bannière LinkedIn convertie en ASCII (variante 4).
      Décider si le logo du serveur communautaire reste visible (anonymat), récupérer
      l'image définitive (`public/assets/img/fond-banniere.png`, pas encore versionnée),
      puis retirer les variantes 1-3 et le sélecteur de test du menu.
- [ ] Sprint v2-2 : moteur pixel art + scènes DAP (capteurs → Raspberry → un lien ZMQ
      → PC), stage (banc vapeur, bain thermostaté, ventilateur, NI-DAQmx → PC), plaine.
- [ ] Sprint v2-3 : Profil (méthode de travail + aparté sur l'usage de l'IA), Parcours
      en timeline façon *Loki* (branches, CPE élagué, futur non dessiné), aperçu du CV
      généré au déploiement, contact via Formspree (compte à créer), terminal.
- [ ] Sprint v2-4 : fenêtres complètes des autres projets + animations (s'appuie sur
      les fiches projet en Markdown à rassembler).
- [ ] Sprint v2-5 : accessibilité, audit de performance, polices hébergées sur le site,
      SEO, docs, `version.json` 2.0.0, fusion dans `main`, tag `v2.0.0`.
- [ ] Photos des PyMoDAQ Days à intégrer dans la fenêtre DAP ; dates des projets
      d'école à confirmer pour la timeline.

## Journal

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

### ⬜ Sprint v2-2 — Pixel art
Moteur d'animation (une boucle, arrêt hors écran), scènes DAP, stage et plaine.

### ⬜ Sprint v2-3 — Programmes système
Profil, Parcours en timeline façon *Loki*, CV avec aperçu, contact Formspree, terminal.

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
