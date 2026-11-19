/* =====================================================================
   Noyau partagé : espace de noms FV, utilitaires DOM, pixel art, profil.
   Scripts classiques (defer) pour fonctionner aussi en file://.
   ===================================================================== */
'use strict';

window.FV = window.FV || {};

(function (FV) {
  FV.REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  FV.isMobile = () => window.matchMedia('(max-width: 760px)').matches;

  FV.$ = (sel, root = document) => root.querySelector(sel);
  FV.$$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  FV.el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  /* ---------- stockage local tolérant (navigation privée, blocage) ---------- */
  FV.store = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* stockage indisponible : on continue sans */
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* idem */
      }
    },
  };

  /* ---------- pixel art ---------- */
  // Police 3x5 pour les petites étiquettes dans les scènes.
  const FONT = {
    A: '010101111101101', C: '011100100100011', D: '110101101101110', E: '111100110100111',
    H: '101101111101101', I: '111010010010111', L: '100100100100111', M: '101111111101101',
    N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011',
    R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111',
    X: '101101010101101', Y: '101101010010010', Z: '111001010100111', ' ': '000000000000000',
    0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111',
    4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010',
    8: '111101111101111', 9: '111101111001111', '.': '000000000000010',
  };

  FV.painter = (ctx) => ({
    r(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x | 0, y | 0, w, h);
    },
    p(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x | 0, y | 0, 1, 1);
    },
    t(str, x, y, color) {
      ctx.fillStyle = color;
      let cx = x;
      for (const ch of str) {
        const glyph = FONT[ch] || FONT[' '];
        for (let i = 0; i < 15; i++) {
          if (glyph[i] === '1') ctx.fillRect(cx + (i % 3), y + ((i / 3) | 0), 1, 1);
        }
        cx += 4;
      }
    },
  });

  // Générateur pseudo-aléatoire déterministe (mulberry32) : mêmes décors à chaque visite.
  FV.rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------- profil (statut) ---------- */
  // Valeurs par défaut = celles écrites dans le HTML ; data/profile.json les remplace
  // quand il est disponible (le fichier est modifiable depuis GitHub).
  FV.profile = {
    statut: 'Alternance 2027',
    contrat: 'Alternance',
    debut: 'Rentrée 2027',
    domaine: 'Développement logiciel',
    zone: 'Lyon & alentours',
    rythme: 'À préciser',
    ecole: 'À trouver',
    diplome: 'BTS CIEL (2026)',
    maj: '',
  };

  const PROFILE_KEYS = Object.keys(FV.profile);

  FV.loadProfile = async () => {
    try {
      const res = await fetch('data/profile.json', { cache: 'no-cache' });
      if (!res.ok) return FV.profile;
      const data = await res.json();
      // Seules les clés connues, en texte court, sont acceptées.
      for (const key of PROFILE_KEYS) {
        if (typeof data[key] === 'string' && data[key].length <= 80) FV.profile[key] = data[key];
      }
    } catch {
      /* hors serveur (file://) ou fichier invalide : valeurs par défaut */
    }
    return FV.profile;
  };

  // Remplit tous les éléments [data-profile="clé"].
  FV.renderProfile = () => {
    FV.$$('[data-profile]').forEach((node) => {
      const value = FV.profile[node.dataset.profile];
      if (value) node.textContent = value;
    });
  };
})(window.FV);
