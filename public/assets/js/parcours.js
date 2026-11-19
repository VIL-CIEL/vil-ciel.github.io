/* =====================================================================
   Parcours : une seule ligne de vie mêlée à une frise chronologique.
   - périodes (études, stage, événements de plusieurs jours) = encadrés,
     imbriqués les uns dans les autres ;
   - projets et étapes clés = nœuds sur la ligne, avec leur légende ;
   - futur = branches potentielles en pointillés qui s'estompent.
   Tout vient de data/parcours.json : le graphique et la version texte
   se reconstruisent à partir de ce fichier.
   ===================================================================== */
'use strict';

(function (FV) {
  const NS = 'http://www.w3.org/2000/svg';
  const X0 = 40;
  const X1 = 1150;
  const Y0 = 250; // hauteur de la ligne
  const HALF = [72, 52, 36, 24]; // demi-hauteur des encadrés selon la profondeur
  const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const CHAR = 7.4; // largeur moyenne d'un caractère à 12 px (police mono)

  /* ---------- dates ---------- */
  function parseDate(value, end) {
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(value || ''));
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    if (mo < 0 || mo > 11) return null;
    // une fin donnée au mois près couvre tout le mois
    const day = m[3] ? Number(m[3]) : end ? new Date(Date.UTC(y, mo + 1, 0)).getUTCDate() : 1;
    return { y, m: mo, d: day, exact: Boolean(m[3]) };
  }
  const monthIndex = (p) => p.y * 12 + p.m;
  const daysIn = (p) => new Date(Date.UTC(p.y, p.m + 1, 0)).getUTCDate();
  const before = (a, b) => monthIndex(a) * 40 + a.d <= monthIndex(b) * 40 + b.d;

  function formatRange(a, b) {
    if (!b) return (a.exact ? a.d + ' ' : '') + MONTHS[a.m] + ' ' + a.y;
    if (a.exact && b.exact && a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${MONTHS[a.m]} ${a.y}`;
    const left = MONTHS[a.m] + (a.y === b.y ? '' : ' ' + a.y);
    return `${left} – ${MONTHS[b.m]} ${b.y}`;
  }

  /* ---------- lecture et validation du fichier ---------- */
  const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

  function fillPlaceholders(s) {
    return s.replace(/\{(\w+)\}/g, (_, key) => FV.profile[key] || '—');
  }

  function validate(raw) {
    const data = { periods: [], events: [], future: [] };
    const ids = new Set();
    (Array.isArray(raw.periodes) ? raw.periodes : []).forEach((p) => {
      const start = parseDate(p.debut, false);
      const end = parseDate(p.fin, true);
      const title = text(p.titre, 60);
      if (!start || !end || !title || !before(start, end)) return console.warn('Parcours : période ignorée', p);
      const id = text(p.id, 40) || 'p' + data.periods.length;
      ids.add(id);
      data.periods.push({
        id, title, start, end,
        sub: text(p.sous_titre, 60), desc: text(p.description, 240),
        parent: text(p.dans, 40), app: text(p.programme, 20),
      });
    });
    data.periods.forEach((p) => {
      if (p.parent && !ids.has(p.parent)) p.parent = '';
    });
    (Array.isArray(raw.evenements) ? raw.evenements : []).forEach((e) => {
      const date = parseDate(e.date, false);
      const title = text(e.titre, 60);
      if (!date || !title) return console.warn('Parcours : événement ignoré', e);
      data.events.push({ date, title, code: text(e.code, 8) || title.slice(0, 4).toUpperCase(), key: e.cle === true, app: text(e.programme, 20) });
    });
    (Array.isArray(raw.futur) ? raw.futur : []).forEach((f, i) => {
      const start = parseDate(f.debut, false);
      const title = text(f.titre, 40);
      if (!start || !title) return console.warn('Parcours : branche future ignorée', f);
      const lines = (Array.isArray(f.lignes) ? f.lignes : []).map((l) => fillPlaceholders(text(l, 60))).filter(Boolean).slice(0, 4);
      const offset = Number.isFinite(f.decalage) ? Math.max(-110, Math.min(110, f.decalage)) : i % 2 ? 40 : -30;
      data.future.push({ title, start, lines, offset });
    });
    // profondeur d'imbrication (protégée contre les boucles)
    const byId = new Map(data.periods.map((p) => [p.id, p]));
    data.periods.forEach((p) => {
      let depth = 0;
      let cur = p;
      while (cur.parent && depth < 3) {
        cur = byId.get(cur.parent);
        if (!cur) break;
        depth++;
      }
      p.depth = depth;
    });
    return data;
  }

  /* ---------- échelle : plus de place aux mois chargés ---------- */
  function buildScale(data, now) {
    const starts = [...data.periods.map((p) => p.start), ...data.events.map((e) => e.date)];
    const startM = Math.min(...starts.map(monthIndex));
    // le futur garde de la place à droite pour ses légendes
    const lastFuture = Math.max(monthIndex(now) + 8, ...data.future.map((f) => monthIndex(f.start) + 18));
    const n = lastFuture - startM + 1;
    const weight = new Array(n).fill(1);
    // les périodes courtes (≤ 4 mois) sont élargies pour rester lisibles
    data.periods.forEach((p) => {
      const a = monthIndex(p.start) - startM;
      const b = monthIndex(p.end) - startM;
      if (b - a <= 3) for (let m = Math.max(0, a); m <= Math.min(n - 1, b); m++) weight[m] = Math.max(weight[m], 4.5);
    });
    data.events.forEach((e) => {
      const m = monthIndex(e.date) - startM;
      if (m >= 0 && m < n) weight[m] += 0.6;
    });
    const cum = [0];
    weight.forEach((w, i) => cum.push(cum[i] + w));
    const total = cum[n];
    const x = (p) => {
      const m = Math.max(0, Math.min(n - 1, monthIndex(p) - startM));
      const frac = (Math.min(p.d, daysIn(p)) - 1) / daysIn(p);
      return X0 + ((cum[m] + frac * weight[m]) / total) * (X1 - X0);
    };
    return { x, startM, n, weight };
  }

  const yOf = (x) => Y0 + Math.sin(x / 55) * 3 + Math.sin(x / 23) * 1.2;

  /* ---------- dessin ---------- */
  const el = (tag, attrs, content) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (content !== undefined) n.textContent = content;
    return n;
  };

  function linkable(g, app, label) {
    if (!app) return;
    g.classList.add('is-link');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'link');
    g.setAttribute('aria-label', label + ' — ouvrir');
    const open = () => FV.windows.open(app);
    g.addEventListener('click', open);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  // Place des étiquettes sur des « étages » sans chevauchement.
  function stacker(levels) {
    const right = new Array(levels).fill(-Infinity);
    return (x, width) => {
      for (let l = 0; l < levels; l++) {
        if (x > right[l] + 10) {
          right[l] = x + width;
          return l;
        }
      }
      const l = right.indexOf(Math.min(...right));
      right[l] = x + width;
      return l;
    };
  }

  function draw(root, data, now) {
    const S = buildScale(data, now);
    const svg = el('svg', {
      class: 'tl',
      viewBox: '0 0 1200 440',
      role: 'img',
      'aria-label': 'Frise du parcours : périodes d\'études et de stage en encadrés, projets en points sur la ligne, et branches possibles pour la suite.',
    });
    const defs = el('defs');
    svg.append(defs);

    // repères : années et mois élargis
    for (let m = 0; m < S.n; m++) {
      const abs = S.startM + m;
      const p = { y: Math.floor(abs / 12), m: abs % 12, d: 1 };
      const x = S.x(p);
      if (p.m === 0) {
        svg.append(el('line', { x1: x, x2: x, y1: 30, y2: 428, class: 'tl__tick' }));
        svg.append(el('text', { x: x + 5, y: 26, class: 'tl__year' }, String(p.y)));
      } else if (S.weight[m] >= 4.5) {
        svg.append(el('text', { x: x + 3, y: 26, class: 'tl__month' }, MONTHS[p.m].toUpperCase()));
      }
    }
    svg.append(el('line', { x1: 0, x2: 1200, y1: 36, y2: 36, class: 'tl__bound' }));
    svg.append(el('line', { x1: 0, x2: 1200, y1: 428, y2: 428, class: 'tl__bound' }));

    // encadrés, des parents vers les enfants
    const below = stacker(3);
    const outside = [];
    [...data.periods].sort((a, b) => a.depth - b.depth).forEach((p) => {
      const half = HALF[Math.min(p.depth, HALF.length - 1)];
      let xa = S.x(p.start);
      let xb = S.x(p.end);
      if (xb - xa < 16) {
        const c = (xa + xb) / 2;
        xa = c - 8;
        xb = c + 8;
      }
      const g = el('g', { class: `tl__box tl__box--d${Math.min(p.depth, 3)}` });
      g.append(el('rect', { x: xa, y: Y0 - half, width: xb - xa, height: half * 2 }));
      g.append(el('title', {}, `${p.title} — ${formatRange(p.start, p.end)}${p.desc ? '\n' + p.desc : ''}`));
      const label = p.title.toUpperCase();
      const room = xb - xa - 12;
      if (label.length * CHAR <= room) {
        const t = el('text', { x: xa + 6, y: Y0 + half - 8, class: 'tl__box-title' }, label);
        const extra = p.sub ? ' · ' + p.sub : '';
        if (extra && (label.length + extra.length) * CHAR <= room) t.append(el('tspan', { class: 'tl__box-sub' }, extra));
        g.append(t);
      } else {
        outside.push({ p, g, x: xa, cx: (xa + xb) / 2, bottom: Y0 + half });
      }
      linkable(g, p.app, p.title);
      svg.append(g);
    });
    // étiquettes des encadrés trop étroits : sous la frise, reliées par un trait
    outside.forEach(({ p, g, cx, bottom }) => {
      const label = p.title.toUpperCase();
      const lines = [p.desc].filter(Boolean);
      const width = Math.max(label.length, ...lines.map((l) => Math.min(l.length, 46))) * CHAR;
      const x = Math.min(1195 - width, cx - 10);
      const level = below(x, width);
      const y = Y0 + HALF[0] + 24 + level * 34;
      g.append(el('line', { x1: cx, x2: cx, y1: bottom, y2: y - 12, class: 'tl__lead' }));
      g.append(el('text', { x, y, class: 'tl__box-title' }, label));
      if (lines[0]) {
        const desc = lines[0].length > 46 ? lines[0].slice(0, 45) + '…' : lines[0];
        g.append(el('text', { x, y: y + 14, class: 'tl__sub' }, desc + (p.app ? ' →' : '')));
      }
    });

    // la ligne de vie, jusqu'à aujourd'hui
    const xn = S.x(now);
    let d = '';
    for (let x = X0; x <= xn; x += 6) d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + yOf(x).toFixed(1);
    d += ` L${xn.toFixed(1)} ${yOf(xn).toFixed(1)}`;
    svg.append(el('path', { d, class: 'tl__main' }));

    // nœuds : projets et étapes clés, légendes au-dessus des encadrés
    const above = stacker(4);
    [...data.events].sort((a, b) => S.x(a.date) - S.x(b.date)).forEach((e) => {
      const x = S.x(e.date);
      const y = yOf(x);
      const width = Math.max(e.code.length * 8.4, e.title.length * CHAR);
      const lx = Math.min(1195 - width, x - 4);
      const level = above(lx, width);
      const ly = Y0 - HALF[0] - 30 - level * 34;
      const g = el('g', { class: 'tl__node' + (e.key ? ' tl__node--key' : '') });
      g.append(el('line', { x1: x, x2: x, y1: y - 7, y2: ly + 18, class: 'tl__lead' }));
      g.append(el('rect', { x: x - 6, y: y - 6, width: 12, height: 12, transform: `rotate(45 ${x} ${y})` }));
      g.append(el('text', { x: lx, y: ly, class: 'tl__code' }, e.code));
      g.append(el('text', { x: lx, y: ly + 14, class: 'tl__sub' }, e.title));
      g.append(el('title', {}, `${e.title} — ${formatRange(e.date)}`));
      linkable(g, e.app, e.title);
      svg.append(g);
    });

    // aujourd'hui
    const yn = yOf(xn);
    svg.append(el('line', { x1: xn, x2: xn, y1: 40, y2: 424, class: 'tl__now' }));
    svg.append(el('text', { x: xn - 6, y: 422, class: 'tl__now-label', 'text-anchor': 'end' }, 'AUJOURD\'HUI'));

    // futur : branches possibles, en pointillés qui s'estompent vers la droite
    data.future.forEach((f, i) => {
      const xd = Math.max(xn + 50, S.x(f.start));
      const yb = yn + f.offset;
      const xEnd = Math.min(1195, xd + 150);
      const id = 'tl-fade-' + i;
      const grad = el('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: xn, x2: xEnd, y1: 0, y2: 0 });
      grad.append(el('stop', { offset: '0', 'stop-color': '#6cbf45', 'stop-opacity': '0.95' }));
      grad.append(el('stop', { offset: '1', 'stop-color': '#6cbf45', 'stop-opacity': '0.05' }));
      defs.append(grad);
      const g = el('g', { class: 'tl__future' });
      g.append(el('path', {
        d: `M${xn} ${yn} C ${xn + 30} ${yn}, ${xn + 25} ${yb}, ${xn + 60} ${yb} L ${xEnd} ${yb}`,
        stroke: `url(#${id})`,
      }));
      g.append(el('rect', { x: xd - 5, y: yb - 5, width: 10, height: 10 }));
      const head = `${f.title.toUpperCase()} · ${MONTHS[f.start.m].toUpperCase()} ${f.start.y}`;
      const width = Math.max(head.length * 8.2, ...f.lines.map((l) => l.length * CHAR));
      const tx = xd + 10 + width > 1195 ? xd - 10 : xd + 10;
      const anchor = tx < xd ? 'end' : 'start';
      const up = f.offset < 0;
      const top = up ? yb - 12 - f.lines.length * 15 : yb - 10;
      g.append(el('text', { x: tx, y: top, class: 'tl__code', 'text-anchor': anchor }, head));
      f.lines.forEach((line, k) => g.append(el('text', { x: tx, y: top + 15 + k * 15, class: 'tl__sub', 'text-anchor': anchor }, line)));
      svg.append(g);
    });

    root.replaceChildren(svg);
  }

  /* ---------- version texte : encadrés imbriqués, du plus récent au plus ancien ---------- */
  function drawText(root, data) {
    const make = (tag, cls, content) => FV.el(tag, cls, content);
    const key = (p) => monthIndex(p) * 40 + p.d;
    const inside = (date, p) => key(p.start) <= key(date) && key(date) <= key(p.end);

    // chaque événement va dans la période la plus profonde qui le contient
    const children = new Map(data.periods.map((p) => [p.id, []]));
    const top = [];
    data.periods.forEach((p) => (p.parent ? children.get(p.parent) : top).push({ kind: 'period', p, at: key(p.start) }));
    data.events.forEach((e) => {
      const host = data.periods.filter((p) => inside(e.date, p)).sort((a, b) => b.depth - a.depth)[0];
      (host ? children.get(host.id) : top).push({ kind: 'event', e, at: key(e.date) });
    });

    const linkBtn = (app) => {
      const b = make('button', 'link-btn', 'ouvrir');
      b.type = 'button';
      b.dataset.open = app;
      return b;
    };

    function render(items, parent) {
      items.sort((a, b) => b.at - a.at).forEach((item) => {
        if (item.kind === 'period') {
          const { p } = item;
          const box = make('section', 'frise__box');
          const head = make('div', 'frise__head');
          head.append(make('time', null, formatRange(p.start, p.end)), make('b', null, p.title));
          if (p.sub) head.append(make('span', 'frise__sub', p.sub));
          box.append(head);
          if (p.desc || p.app) {
            const desc = make('p', 'frise__desc', p.desc ? p.desc + ' ' : '');
            if (p.app) desc.append(linkBtn(p.app));
            box.append(desc);
          }
          const list = children.get(p.id);
          if (list.length) {
            const inner = make('div', 'frise__inner');
            render(list, inner);
            box.append(inner);
          }
          parent.append(box);
        } else {
          const { e } = item;
          const row = make('div', 'frise__item' + (e.key ? ' frise__item--key' : ''));
          row.append(make('time', null, formatRange(e.date)), make('span', 'frise__mark', e.key ? '★' : '◆'));
          const body = make('span', null, e.title + ' ');
          if (e.app) body.append(linkBtn(e.app));
          row.append(body);
          parent.append(row);
        }
      });
    }

    const frag = document.createDocumentFragment();
    data.future.forEach((f) => {
      const box = make('section', 'frise__box frise__box--future');
      const head = make('div', 'frise__head');
      head.append(make('time', null, 'à partir de ' + formatRange(f.start)), make('b', null, f.title));
      box.append(head);
      if (f.lines.length) box.append(make('p', 'frise__desc', f.lines.join(' · ')));
      frag.append(box);
    });
    render(top, frag);
    root.replaceChildren(frag);
  }

  FV.parcours = {
    async init() {
      const graph = FV.$('#timeline');
      const textRoot = FV.$('#parcours-text');
      if (!graph) return;
      let raw;
      try {
        const res = await fetch('data/parcours.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(res.status);
        raw = await res.json();
      } catch (err) {
        // hors serveur (file://) ou fichier absent : la version texte du HTML reste affichée
        console.warn('Parcours : data/parcours.json indisponible', err);
        graph.replaceChildren(FV.el('p', 'txt__hint pad', 'Frise indisponible hors serveur : voir la version texte ci-dessous.'));
        return;
      }
      const data = validate(raw);
      const today = new Date();
      const now = { y: today.getFullYear(), m: today.getMonth(), d: today.getDate(), exact: true };
      draw(graph, data, now);
      if (textRoot) drawText(textRoot, data);
    },
  };
})(window.FV);
