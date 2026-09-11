# Sprints — Portfolio Fabien Villedieu

Chaque sprint livre **une fonctionnalité** complète et vérifiée. Une fonctionnalité
n'est « terminée » qu'après vérification (thème clair/sombre, icônes, navigation,
responsive) et mise à jour du `CHANGELOG.md`.

Légende : ✅ terminé · 🚧 en cours · ⬜ à faire

---

## État actuel

- Dernière version publiée : **v1.0.3** (`public/version.json`, `CHANGELOG.md`).
- Sprints 0 à 5 (v1) terminés.
- 🚧 **Refonte v2 en cours — direction artistique « Cynosure »** (thème programme
  corpo fictif façon Cyberpunk 2077 / Phantom Liberty). Nom conservé, aucun asset du
  jeu réutilisé (tout recréé maison : logo SVG, schémas filaires, effets CSS). Voir
  détails palette/typo/motifs dans le fichier de règles multi-PC.
- Une **maquette statique HTML autonome** (`cynosure-maquette.html`, une seule page,
  contenu de démonstration) a été produite et envoyée à l'utilisateur **hors dépôt**
  (pas commitée, pas présente automatiquement sur les deux PC). Elle sert de référence
  visuelle validée pour la suite. Si absente sur le poste courant, la redemander à
  l'utilisateur plutôt que de réinventer la DA.
- Le CV a été déplacé vers `public/assets/pdf/CV_VILLEDIEU_FABIEN.pdf` (commits distants
  « Update CV » / « Fix Button Download CV »). `index.html` pointe sur le nouveau chemin.
- Documentation racine (`README.md`, `ARCHITECTURE.md`, `public/assets/img/README.md`)
  réalignée sur ce nouveau chemin (en attente de commit, voir Prochaines étapes).

## Prochaines étapes

- [ ] Valider/ajuster la maquette Cynosure avec l'utilisateur (retours en attente).
- [ ] **Reset de l'historique Git distant** (branche orpheline + tag de sauvegarde
      `archive/pre-cynosure` avant force-push) — proposé, **pas encore exécuté**,
      nécessite un feu vert explicite avant toute action destructive.
- [ ] Une fois la DA validée : sprint 1 de la refonte sur la page d'accueil réelle
      (intégration multi-pages, vrai contenu, accessibilité WCAG AA, thème clair/sombre
      ou « papier »).
- [ ] `public/assets/pages/a-propos.html` référence encore `../cv-fabien-villedieu.pdf`
      (2 liens) : chemin cassé, à corriger en `../pdf/CV_VILLEDIEU_FABIEN.pdf`.
- [ ] Committer le nettoyage de `.gitignore` (bloc `.claude/` retiré, dossier déplacé
      hors du dépôt) + les mises à jour de doc du chemin CV.
- [ ] Décider si le déplacement du CV justifie une entrée `CHANGELOG.md` + un bump de
      `version.json` (correctif v1.0.4) — probablement obsolète si la refonte v2 réécrit
      l'historique.

## Journal

- 2026-09-10 : reprise du projet. `git pull` (branche locale réalignée sur `origin/main`,
  jusqu'à `05793d7`). Ajout des sections de suivi ci-dessus. Documentation racine
  réalignée sur le nouveau chemin du CV (`assets/pdf/`). Lien CV cassé repéré dans
  `a-propos.html` (voir Prochaines étapes).
- 2026-09-10 : décision de refonte complète de la charte graphique, DA « Cynosure »
  (inspiration Cyberpunk 2077 / Phantom Liberty, fan work non officiel, nom conservé
  car usage strictement personnel). Analyse des sources d'inspiration locales et
  production d'une maquette statique HTML de validation (envoyée hors dépôt).
  Proposition de reset de l'historique Git en branche orpheline, en attente de
  validation avant exécution.

---

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
