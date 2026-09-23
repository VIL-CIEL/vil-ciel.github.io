# Sprints — Portfolio Fabien Villedieu

Chaque sprint livre **une fonctionnalité** complète et vérifiée. Une fonctionnalité
n'est « terminée » qu'après vérification (thème clair/sombre, icônes, navigation,
responsive) et mise à jour du `CHANGELOG.md`.

Légende : ✅ terminé · 🚧 en cours · ⬜ à faire

---

## État actuel

- Dernière version publiée : **v1.7.0** (`public/version.json`, `CHANGELOG.md`). Le
  projet passe à un versionnage par commit, un commit publié = une version taguée
  `vMAJEUR.MINEUR.CORRECTIF`.
- Sprints 0 à 5 (v1) terminés.
- Nouveau projet ajouté au portfolio existant : **Plugins DAP Pymodaq** (projet
  d'examen E6/U62, BTS CIEL, CETHIL), avec page de détail, carte projets, mise en
  avant sur l'accueil et entrée dans la timeline À propos.
- 🚧 **Refonte DA en réflexion — piste « Cynosure » / « GIMMI »** : deux maquettes
  statiques autonomes ont été produites hors dépôt (thème programme corpo type
  Cyberpunk 2077, et une variante palette « Gimmi »). Retours reçus sur la première
  maquette (retrait LED, retrait thème clair, renommage GIMMI). Question en cours de
  discussion avec l'utilisateur : la bascule DA impliquerait de refaire aussi le CV,
  de futures cartes de visite et la bannière LinkedIn (même dégradé bleu-violet
  partout) — à évaluer face à l'échéance de recherche d'alternance du 30 novembre.
  Pas de décision prise, voir Journal.
- L'historique Git a été nettoyé de toute mention IA (`Co-Authored-By: Claude`) dans
  les messages de commit existants, conformément à la règle « Mention IA » du
  `README.md`. Nouvelle convention : plus de mention IA dans aucun commit à venir.

## Prochaines étapes

- [ ] Trancher s'il faut généraliser la DA Cynosure/GIMMI à tout le reste (CV,
      cartes de visite, bannière LinkedIn) maintenant ou après la recherche
      d'alternance (échéance 30 novembre) : discussion en cours, pas de décision.
- [ ] Vraies captures d'écran supplémentaires pour la page Plugins DAP Pymodaq si
      disponibles (dashboard, wiki), en complément de la capture déjà intégrée.

## Journal

- 2026-09-23 : ajout du projet « Plugins DAP Pymodaq » au portfolio (projet
  d'examen E6/U62, invitation aux PyMoDAQ Days 2026), correction du lien CV cassé
  dans `a-propos.html`. Publication en v1.7.0, premier commit sous la nouvelle
  convention de versionnage par commit.
- 2026-09-23 : nettoyage de l'historique Git (suppression des mentions
  `Co-Authored-By: Claude` dans les commits existants) à la demande de l'utilisateur.
- 2026-09-23 : échange amorcé sur l'intérêt de généraliser la DA Cynosure/GIMMI (CV,
  cartes de visite, bannière LinkedIn) à moins de 3 mois de la fin de la recherche
  d'alternance (statut spécial de l'école, échéance 30 novembre). Pas de décision
  prise à ce stade.
- 2026-09-10 : reprise du projet. `git pull` (branche locale réalignée sur `origin/main`,
  jusqu'à `05793d7`). Documentation racine réalignée sur le nouveau chemin du CV
  (`assets/pdf/`). Lien CV cassé repéré dans `a-propos.html`.
- 2026-09-10 : décision de refonte complète de la charte graphique, DA « Cynosure »
  (inspiration Cyberpunk 2077 / Phantom Liberty, fan work non officiel, nom conservé
  car usage strictement personnel). Analyse des sources d'inspiration locales et
  production d'une maquette statique HTML de validation (envoyée hors dépôt).

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
