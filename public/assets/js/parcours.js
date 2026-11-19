/* =====================================================================
   Parcours : timeline façon « Loki ». La ligne principale est le parcours,
   les branches sont les projets, CPE est une branche élaguée, et le futur
   (la recherche d'alternance) n'est pas encore dessiné.
   La version texte (journal) reste dans le HTML, sous le graphique.
   ===================================================================== */
'use strict';

(function (FV) {
  const NS = 'http://www.w3.org/2000/svg';
  const NOW = 2026.88;
  const Y0 = 250; // hauteur de la ligne principale

  // Échelle par morceaux : plus de place pour 2026, très chargé.
  const STOPS = [
    [2022.6, 40],
    [2024.6, 380],
    [2026.4, 760],
    [2027.0, 1100],
  ];
  function xOf(t) {
    for (let i = 1; i < STOPS.length; i++) {
      const [t0, x0] = STOPS[i - 1];
      const [t1, x1] = STOPS[i];
      if (t <= t1) return x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
    }
    return STOPS[STOPS.length - 1][1];
  }
  const yOf = (x) => Y0 + Math.sin(x / 55) * 4 + Math.sin(x / 23) * 1.5;

  // Étapes de la ligne principale (étiquettes en dessous, sur 3 niveaux).
  const MAIN = [
    { t: 2022.7, title: 'PREMIÈRE', sub: 'Spé. maths + NSI', level: 0 },
    { t: 2023.7, title: 'TERMINALE', sub: 'Spé. maths + NSI', level: 1 },
    { t: 2024.5, title: 'BAC GÉNÉRAL', sub: 'Juin 2024', level: 0, key: true },
    { t: 2024.72, title: 'BTS CIEL', sub: 'Option informatique & réseaux', level: 2 },
    { t: 2026.45, title: 'BTS OBTENU', sub: 'Juin 2026', level: 0, key: true },
    { t: 2026.77, title: 'PYMODAQ DAYS', sub: 'Paris · en anglais', level: 0, key: true },
  ];

  // Branches : les projets, partis de la ligne au moment où je les ai faits.
  const BRANCHES = [
    { t0: 2023.72, t1: 2024.02, h: 80, code: 'RECH', sub: 'Recherche textuelle', app: 'recherche' },
    { t0: 2023.88, t1: 2024.38, h: 140, code: 'PYG', sub: 'Jeu Pygame', app: 'pygame' },
    { t0: 2024.8, t1: 2025.25, h: 80, code: 'UNTY', sub: 'Jeu Unity', app: 'unity' },
    { t0: 2025.38, t1: 2025.56, h: 170, code: 'STAGE', sub: 'IHM Pymodaq · CETHIL', app: 'ihm' },
    { t0: 2025.68, t1: 2026.38, h: 140, code: 'DAP', sub: 'Projet de fin de BTS', app: 'dap', flag: true },
    { t0: 2026.47, t1: 2026.6, h: 80, code: 'RSMP', sub: 'CC Radio System', app: 'rsmp' },
    { t0: 2026.73, t1: 2026.87, h: 170, code: 'TVA', sub: 'TVA Dashboard', app: 'tva' },
    { t0: 2026.8, t1: 2026.84, h: 110, code: 'API', sub: 'API REST de devis', app: 'devis' },
  ];

  // Branche élaguée : les trois mois à CPE Lyon.
  const PRUNED = { t0: 2026.67, t1: 2026.86, depth: 95, title: 'CPE LYON', sub: 'Sept. – nov. 2026 · élaguée' };

  const node = (tag, attrs, text) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  };

  function mainPath(t0, t1) {
    let d = '';
    for (let x = xOf(t0); x <= xOf(t1); x += 6) d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + yOf(x).toFixed(1);
    return d;
  }

  function draw(root) {
    const svg = node('svg', {
      class: 'tl',
      viewBox: '0 0 1200 440',
      role: 'img',
      'aria-label':
        'Timeline du parcours : de la première au BTS CIEL obtenu, avec les projets en branches, une branche élaguée pour CPE Lyon, et la suite pas encore écrite : la recherche d\'alternance.',
    });

    // repères temporels
    [[2023, '2023'], [2024, '2024'], [2025, '2025'], [2026, '2026'], [2026.67, 'SEPT.'], [2026.83, 'NOV.']].forEach(([t, label]) => {
      const x = xOf(t);
      svg.append(node('line', { x1: x, x2: x, y1: 36, y2: 424, class: 'tl__tick' }));
      svg.append(node('text', { x: x + 6, y: 30, class: 'tl__year' }, label));
    });
    // lignes rouges : les limites de la ligne temporelle
    svg.append(node('line', { x1: 0, x2: 1200, y1: 44, y2: 44, class: 'tl__bound' }));
    svg.append(node('line', { x1: 0, x2: 1200, y1: 420, y2: 420, class: 'tl__bound' }));

    // branches (projets), au-dessus de la ligne
    BRANCHES.forEach((b) => {
      const g = node('g', { class: 'tl__branch' + (b.flag ? ' tl__branch--flag' : ''), tabindex: 0, role: 'link', 'aria-label': `${b.sub} — ouvrir` });
      const x0 = xOf(b.t0);
      const x1 = xOf(b.t1);
      const yb = yOf(x0);
      const yt = Y0 - b.h;
      const xc = x0 + Math.min(40, (x1 - x0) * 0.5);
      g.append(node('path', { d: `M${x0} ${yb} C ${x0 + 12} ${yb}, ${x0 + 6} ${yt}, ${xc} ${yt} L ${x1} ${yt}` }));
      g.append(node('rect', { x: x1 - 6, y: yt - 6, width: 12, height: 12 }));
      g.append(node('text', { x: x1 - 6, y: yt - 28, class: 'tl__code' }, b.code));
      g.append(node('text', { x: x1 - 6, y: yt - 13, class: 'tl__sub' }, b.sub));
      g.append(node('title', {}, `${b.sub} — ouvrir le programme`));
      const open = () => FV.windows.open(b.app);
      g.addEventListener('click', open);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
      svg.append(g);
    });

    // branche élaguée (CPE) : trace fantôme en pointillés, marquée ✕
    {
      const x0 = xOf(PRUNED.t0);
      const x1 = xOf(PRUNED.t1);
      const yb = yOf(x0);
      const yd = Y0 + PRUNED.depth;
      const g = node('g', { class: 'tl__pruned' });
      g.append(node('path', { d: `M${x0} ${yb} C ${x0 + 12} ${yb}, ${x0 + 6} ${yd}, ${x0 + 34} ${yd} L ${x1} ${yd}` }));
      g.append(node('text', { x: x1 - 6, y: yd + 6, class: 'tl__cross' }, '✕'));
      // étiquettes sous la trace, pour ne pas croiser la croix de fin
      g.append(node('text', { x: x0 + 40, y: yd + 24, class: 'tl__code' }, PRUNED.title));
      g.append(node('text', { x: x0 + 40, y: yd + 40, class: 'tl__sub' }, PRUNED.sub));
      svg.append(g);
    }

    // la ligne principale s'arrête à aujourd'hui…
    svg.append(node('path', { d: mainPath(2022.6, NOW), class: 'tl__main' }));

    // étapes du parcours, sous la ligne
    MAIN.forEach((m) => {
      const x = xOf(m.t);
      const y = yOf(x);
      const ly = Y0 + 52 + m.level * 40;
      const g = node('g', { class: 'tl__node' + (m.key ? ' tl__node--key' : '') });
      g.append(node('line', { x1: x, x2: x, y1: y + 8, y2: ly - 14, class: 'tl__lead' }));
      g.append(node('rect', { x: x - 7, y: y - 7, width: 14, height: 14 }));
      g.append(node('text', { x: x - 7, y: ly, class: 'tl__code' }, m.title));
      g.append(node('text', { x: x - 7, y: ly + 16, class: 'tl__sub' }, m.sub));
      svg.append(g);
    });

    // … et le futur n'est pas encore écrit : un curseur qui attend la suite
    const xn = xOf(NOW);
    const yn = yOf(xn);
    svg.append(node('line', { x1: xn, x2: xn, y1: 52, y2: 426, class: 'tl__now' }));
    svg.append(node('text', { x: xn - 6, y: 435, class: 'tl__now-label', 'text-anchor': 'end' }, 'MAINTENANT'));
    svg.append(node('rect', { x: xn + 6, y: yn - 9, width: 9, height: 18, class: 'tl__caret' }));
    const future = node('g', { class: 'tl__future' });
    future.append(node('text', { x: xn + 24, y: yn - 6, class: 'tl__code' }, 'ALTERNANCE 2027'));
    future.append(node('text', { x: xn + 24, y: yn + 12, class: 'tl__sub' }, 'à écrire…'));
    svg.append(future);

    root.replaceChildren(svg);
  }

  FV.parcours = {
    init() {
      const root = FV.$('#timeline');
      if (root) draw(root);
    },
  };
})(window.FV);
