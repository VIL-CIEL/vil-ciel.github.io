# Portfolio — Fabien Villedieu

Portfolio web personnel de Fabien Villedieu (étudiant BTS CIEL, développeur junior).
Site **statique** déployé via **GitHub Pages**.

🔗 **En ligne** : https://vil-ciel.github.io/

## Aperçu

Site vitrine d'une seule page (single-page scroll) présentant le profil, l'expérience,
les compétences, les projets, la formation et les moyens de contact. Construit en
**vanilla** (HTML5 / CSS3 / JavaScript ES6+), sans framework ni étape de build :
les fichiers de `public/` sont servis directement.

## Stack technique

- **HTML5** sémantique
- **CSS vanilla** (variables CSS, Grid, Flexbox, dark mode)
- **JavaScript vanilla** (ES6+, modules, `fetch`, `IntersectionObserver`)
- **Icônes** : [Lucide](https://lucide.dev/)
- **Hébergement** : GitHub Pages
- **CI/CD** : GitHub Actions (lint + déploiement)

Conforme au niveau « Vanilla » (Niveau 1) du référentiel de développement : aucune
dépendance d'exécution, aucun backend.

## Structure du projet

```
portfolio/
├── public/                 # Tout ce qui est servi sur le web
│   ├── index.html
│   ├── version.json        # Version courante (affichée en footer)
│   ├── .nojekyll           # Désactive le traitement Jekyll de GitHub Pages
│   └── assets/
│       ├── css/styles.css
│       ├── js/main.js
│       └── img/            # Images (photo de profil, miniatures projets)
├── .github/workflows/      # CI/CD GitHub Actions
├── package.json            # Outillage de lint/format (dev uniquement)
├── ARCHITECTURE.md         # Choix techniques et organisation
├── CHANGELOG.md            # Historique des versions
└── README.md
```

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour le détail.

## Développement local

Aucune compilation n'est nécessaire. Il suffit de servir le dossier `public/`.

```bash
# Avec Python (déjà installé)
cd public
python -m http.server 8000
# → http://localhost:8000
```

> Astuce : ouvrir `public/index.html` directement dans le navigateur fonctionne aussi,
> mais un petit serveur local évite les restrictions liées au protocole `file://`.

## Qualité de code (linters)

Les linters sont optionnels en local (nécessitent [Node.js](https://nodejs.org/)) et
s'exécutent automatiquement en CI à chaque push.

```bash
npm install        # une seule fois
npm run lint       # ESLint + Stylelint + vérification Prettier
npm run format     # Applique le formatage Prettier
```

## Déploiement

Le déploiement est **automatique** : tout push sur `main` déclenche le workflow
GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) qui
lint le code puis publie `public/` sur GitHub Pages.

Flux Git : on travaille sur des branches `feature/<nom-court>` puis on fusionne dans
`main`. Un tag Git (`vX.Y.Z`) est posé à chaque version publiée.

## Versionnage

Format `MAJEUR.MINEUR.CORRECTIF`. La version courante est définie dans
[public/version.json](public/version.json), affichée dans le footer du site, et
historisée dans [CHANGELOG.md](CHANGELOG.md).
