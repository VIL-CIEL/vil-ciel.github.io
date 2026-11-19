/* =====================================================================
   Parcours : une seule ligne de vie mêlée à une frise chronologique.
   - périodes (études, stage, projet long, événement) = encadrés imbriqués :
     grands encadrés titrés en haut, encadrés imbriqués titrés en bas ;
   - projets courts et étapes clés = nœuds sur la ligne, légendés en haut
     ou en bas du graphique selon la place ;
   - futur = branches possibles en pointillés qui s'estompent.
   Tout vient de data/parcours.json ; le graphique et la version texte se
   reconstruisent à partir de ce fichier. Les tailles sont calculées à
   partir des textes réellement mesurés : rien ne se chevauche.
   ===================================================================== */
'use strict';

(function (FV) {
  const NS = 'http://www.w3.org/2000/svg';
  const X0 = 30;
  const MONTH_PX = 42; // largeur d'un mois : constante sur toute la frise
  const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const FONT_TITLE = '600 12px "IBM Plex Mono", consolas, monospace';
  const FONT_SUB = '400 11.5px "IBM Plex Mono", consolas, monospace';
  const FONT_CODE = '600 13px "IBM Plex Mono", consolas, monospace';
  const LINE = 15; // hauteur d'une ligne de texte
  const PAD = 7; // marge intérieure des encadrés
  const BASE = [26, 16, 12, 10]; // demi-hauteur minimale autour de la ligne, selon la profondeur
  const NODE_ROW = 34; // hauteur d'un étage de légendes de nœuds
  const RULER = 44; // bande des années, en haut

  /* ---------- dates ---------- */
  function parseDate(value, end) {
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(value || ''));
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    if (mo < 0 || mo > 11) return null;
    const day = m[3] ? Number(m[3]) : end ? new Date(Date.UTC(y, mo + 1, 0)).getUTCDate() : 1;
    return { y, m: mo, d: day, exact: Boolean(m[3]) };
  }
  const monthIndex = (p) => p.y * 12 + p.m;
  const daysIn = (p) => new Date(Date.UTC(p.y, p.m + 1, 0)).getUTCDate();
  const keyOf = (p) => monthIndex(p) * 40 + p.d;

  function formatRange(a, b) {
    if (!b) return (a.exact ? a.d + ' ' : '') + MONTHS[a.m] + ' ' + a.y;
    if (a.exact && b.exact && a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${MONTHS[a.m]} ${a.y}`;
    const left = MONTHS[a.m] + (a.y === b.y ? '' : ' ' + a.y);
    return `${left} – ${MONTHS[b.m]} ${b.y}`;
  }

  /* ---------- lecture et validation du fichier ---------- */
  const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const fillPlaceholders = (s) => s.replace(/\{(\w+)\}/g, (_, key) => FV.profile[key] || '—');

  function validate(raw) {
    const data = { periods: [], events: [], future: [], viewStart: parseDate(raw.debut_affichage, false) };
    const ids = new Set();
    (Array.isArray(raw.periodes) ? raw.periodes : []).forEach((p) => {
      const start = parseDate(p.debut, false);
      const end = parseDate(p.fin, true);
      const title = text(p.titre, 60);
      if (!start || !end || !title || keyOf(start) > keyOf(end)) return console.warn('Parcours : période ignorée', p);
      const id = text(p.id, 40) || 'p' + data.periods.length;
      ids.add(id);
      data.periods.push({
        id, title, start, end,
        sub: text(p.sous_titre, 80), desc: text(p.description, 240),
        parent: text(p.dans, 40), app: text(p.programme, 20),
      });
    });
    data.periods.forEach((p) => {
      if (p.parent && (!ids.has(p.parent) || p.parent === p.id)) p.parent = '';
    });
    (Array.isArray(raw.evenements) ? raw.evenements : []).forEach((e) => {
      const date = parseDate(e.date, false);
      const title = text(e.titre, 60);
      if (!date || !title) return console.warn('Parcours : événement ignoré', e);
      data.events.push({ id: 'e' + data.events.length, date, title, code: text(e.code, 8) || title.slice(0, 4).toUpperCase(), key: e.cle === true, app: text(e.programme, 20) });
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
      while (cur.parent && depth < 4) {
        cur = byId.get(cur.parent);
        if (!cur) break;
        depth++;
      }
      p.depth = Math.min(depth, 3);
    });
    return data;
  }

  /* ---------- échelle : constante, un mois = MONTH_PX pixels ---------- */
  // Les durées restent comparables d'un bout à l'autre ; la frise est plus longue
  // que la fenêtre et défile horizontalement.
  function buildScale(data, now) {
    const firstContent = Math.min(...[...data.periods.map((p) => p.start), ...data.events.map((e) => e.date)].map(monthIndex));
    const startM = data.viewStart ? monthIndex(data.viewStart) : firstContent;
    const lastM = Math.max(monthIndex(now) + 6, ...data.future.map((f) => monthIndex(f.start) + 7));
    const n = lastM - startM + 1;
    // avant le début visible, x devient négatif : hors champ, à gauche
    const x = (p) => X0 + (monthIndex(p) - startM + (Math.min(p.d, daysIn(p)) - 1) / daysIn(p)) * MONTH_PX;
    return { x, startM, n, width: Math.round(X0 + n * MONTH_PX + 20) };
  }

  /* ---------- mesure et découpage des textes ---------- */
  let measurer = null;
  function measure(str, font) {
    if (!measurer) measurer = document.createElement('canvas').getContext('2d');
    measurer.font = font;
    // les titres et codes ont un espacement de lettres de 0,06 em (voir os.css)
    const spacing = font === FONT_TITLE ? 0.72 : font === FONT_CODE ? 0.78 : 0;
    return measurer.measureText(str).width + str.length * spacing;
  }

  function wrap(str, font, maxW) {
    const lines = [];
    let line = '';
    str.split(/\s+/).forEach((word) => {
      const next = line ? line + ' ' + word : word;
      if (line && measure(next, font) > maxW) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    if (line) lines.push(line);
    return lines;
  }

  // Titre + description : sur une ligne si possible, sinon description sous le
  // titre, et seulement en dernier recours retours à la ligne.
  function layoutText(title, desc, maxW) {
    const T = title.toUpperCase();
    const lines = [];
    if (desc && measure(T, FONT_TITLE) + measure(' · ' + desc, FONT_SUB) <= maxW) {
      lines.push({ title: T, sub: ' · ' + desc });
    } else {
      (measure(T, FONT_TITLE) <= maxW ? [T] : wrap(T, FONT_TITLE, maxW)).forEach((t) => lines.push({ title: t }));
      if (desc) (measure(desc, FONT_SUB) <= maxW ? [desc] : wrap(desc, FONT_SUB, maxW)).forEach((s) => lines.push({ sub: s }));
    }
    const width = Math.max(
      ...lines.map((l) => (l.title ? measure(l.title, FONT_TITLE) : 0) + (l.sub ? measure(l.sub, FONT_SUB) : 0))
    );
    return { lines, width, height: lines.length * LINE };
  }

  /* ---------- mise en page des encadrés (de l'intérieur vers l'extérieur) ---------- */
  // Chaque encadré reçoit : xa/xb (bords), va/vb (partie visible), top/bottom
  // (distances à la ligne), label, labelPos ('top' | 'inside' | 'below').
  function layoutBox(p, kids, S) {
    p.xa = S.x(p.start);
    p.xb = S.x(p.end);
    if (p.xb - p.xa < 16) {
      const c = (p.xa + p.xb) / 2;
      p.xa = c - 8;
      p.xb = c + 8;
    }
    p.va = Math.max(p.xa, 4);
    p.vb = Math.min(p.xb, S.width - 4);
    const children = kids.get(p.id) || [];
    children.forEach((c) => layoutBox(c, kids, S));
    const ct = Math.max(0, ...children.map((c) => c.top));
    const cb = Math.max(0, ...children.map((c) => c.bottom));

    const base = BASE[p.depth];
    const desc = p.sub || p.desc;
    const room = p.vb - p.va - PAD * 2;
    if (p.depth === 0) {
      // grand encadré : titre et description en haut, à l'intérieur
      p.label = layoutText(p.title, desc, Math.max(60, room));
      p.labelPos = 'top';
      p.bottom = Math.max(base, cb) + PAD;
      p.top = Math.max(base, ct) + PAD + p.label.height + 4;
    } else {
      // encadré imbriqué : en bas, à l'intérieur s'il tient (2 lignes max),
      // sinon sous l'encadré (placé ensuite par placeBelow)
      const inside = layoutText(p.title, desc, Math.max(10, room));
      const fits = inside.lines.length <= 2 && inside.width <= room;
      p.label = inside;
      p.labelPos = fits ? 'inside' : 'below';
      p.top = Math.max(base, ct) + PAD;
      p.bottom = Math.max(base, cb) + PAD + (fits ? p.label.height + 2 : 0);
      if (fits) p.labelY = p.bottom - PAD - p.label.height;
    }
  }

  // Étiquettes « sous l'encadré » : alignées sur le bord gauche de leur encadré,
  // elles peuvent en déborder vers la droite mais restent dans le grand encadré,
  // sans jamais passer sur un autre encadré ni sur une autre étiquette.
  function placeBelow(root, kids) {
    const all = [];
    const walk = (p) => (kids.get(p.id) || []).forEach((c) => {
      all.push(c);
      walk(c);
    });
    walk(root);
    const obstacles = all.map((d) => ({ x0: d.va, x1: d.vb, y0: -d.top, y1: d.bottom }));
    let bottom = root.bottom - PAD;
    all.filter((c) => c.labelPos === 'below').sort((a, b) => a.va - b.va).forEach((c) => {
      const left = Math.max(c.va, root.va + PAD);
      const room = root.vb - PAD - left;
      // trop près du bord droit du grand encadré : toute sa largeur intérieure,
      // en restant le plus près possible de l'encadré
      const alignRight = room < 150;
      const maxW = alignRight ? root.vb - root.va - PAD * 2 : Math.min(room, 300);
      c.label = layoutText(c.title, c.sub || c.desc, Math.max(40, maxW));
      const w = c.label.width;
      const x = alignRight ? Math.max(root.va + PAD, Math.min(c.va, root.vb - PAD - w)) : left;
      let y = c.bottom + 6;
      let moved = true;
      while (moved) {
        moved = false;
        for (const r of obstacles) {
          if (x < r.x1 + 6 && r.x0 < x + w + 6 && y < r.y1 + 4 && r.y0 < y + c.label.height + 2) {
            y = r.y1 + 5;
            moved = true;
          }
        }
      }
      obstacles.push({ x0: x, x1: x + w, y0: y, y1: y + c.label.height });
      c.labelX = x;
      c.labelY = y;
      c.leadX = alignRight ? (c.va + c.vb) / 2 : x + 4;
      bottom = Math.max(bottom, y + c.label.height);
    });
    root.bottom = bottom + PAD;
  }

  /* ---------- dessin ---------- */
  const el = (tag, attrs, content) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (content !== undefined) n.textContent = content;
    return n;
  };

  // Éléments de la frise et de la version texte, par identifiant.
  const graphEls = new Map();
  const textEls = new Map();

  function flash(node) {
    node.classList.remove('is-flash');
    node.getBoundingClientRect(); // relance l'animation
    node.classList.add('is-flash');
    setTimeout(() => node.classList.remove('is-flash'), 1700);
  }
  const behavior = () => (FV.REDUCED ? 'auto' : 'smooth');

  // Frise → version texte.
  function showText(id) {
    const target = textEls.get(id);
    if (!target) return;
    target.scrollIntoView({ block: 'center', behavior: behavior() });
    flash(target);
  }

  // Version texte → frise (défilement horizontal compris).
  function showGraph(id) {
    const target = graphEls.get(id);
    const box = FV.$('#timeline');
    if (!target || !box) return;
    box.scrollIntoView({ block: 'start', behavior: behavior() });
    const r = target.getBoundingClientRect();
    const c = box.getBoundingClientRect();
    box.scrollLeft += r.left - c.left - box.clientWidth / 2 + r.width / 2;
    flash(target);
  }

  // Clic sur un élément : ouvre son programme s'il en a un, sinon montre son détail.
  function linkable(g, item, label) {
    const go = item.app ? () => FV.windows.open(item.app) : () => showText(item.id);
    g.classList.add('is-link');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'link');
    g.setAttribute('aria-label', label + (item.app ? ' — ouvrir' : ' — voir le détail'));
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  }

  // Texte multi-lignes (titre en gras, description plus discrète).
  function textBlock(x, yTop, label) {
    const g = el('g', { class: 'tl__label' });
    label.lines.forEach((line, i) => {
      const t = el('text', { x, y: yTop + i * LINE + 11 });
      if (line.title) t.append(el('tspan', { class: 'tl__box-title' }, line.title));
      if (line.sub) t.append(el('tspan', { class: 'tl__box-sub' }, line.sub));
      g.append(t);
    });
    return g;
  }

  function draw(root, data, now) {
    const S = buildScale(data, now);
    graphEls.clear();

    // 1. encadrés
    const kids = new Map();
    const roots = [];
    data.periods.forEach((p) => {
      if (p.parent) {
        if (!kids.has(p.parent)) kids.set(p.parent, []);
        kids.get(p.parent).push(p);
      } else roots.push(p);
    });
    const W = S.width;
    roots.forEach((p) => {
      layoutBox(p, kids, S);
      placeBelow(p, kids);
    });
    // tous les grands encadrés ont la même hauteur : frise plus lisible
    const TOP = Math.max(BASE[0], ...roots.map((p) => p.top));
    const BOT = Math.max(BASE[0], ...roots.map((p) => p.bottom));
    roots.forEach((p) => {
      p.top = TOP;
      p.bottom = BOT;
    });

    // 2. nœuds : légendes en haut, puis en bas quand le haut est plein
    const xn = S.x(now);
    const nodes = [...data.events].sort((a, b) => keyOf(a.date) - keyOf(b.date)).map((e) => {
      const x = S.x(e.date);
      const width = Math.max(measure(e.code, FONT_CODE), measure(e.title, FONT_SUB));
      return { e, x, width, lx: Math.max(4, Math.min(W - 4 - width, x - 4)) };
    });
    const rows = { top: [], bottom: [] };
    const ORDER = [['top', 0], ['top', 1], ['bottom', 0], ['bottom', 1], ['top', 2], ['bottom', 2], ['top', 3], ['bottom', 3]];
    nodes.forEach((n) => {
      const free = ([band, level]) => !(rows[band][level] || []).some((r) => n.lx < r.x1 + 12 && r.x0 < n.lx + n.width + 12);
      const [band, level] = ORDER.find(free) || ORDER[ORDER.length - 1];
      (rows[band][level] = rows[band][level] || []).push({ x0: n.lx, x1: n.lx + n.width });
      n.band = band;
      n.level = level;
    });
    const topLevels = rows.top.length;
    const bottomLevels = rows.bottom.length;
    const Y0 = RULER + 8 + topLevels * NODE_ROW + TOP;
    const H = Math.round(Y0 + BOT + 10 + bottomLevels * NODE_ROW + 26);
    const yOf = (x) => Y0 + Math.sin(x / 55) * 3 + Math.sin(x / 23) * 1.2;

    const svg = el('svg', {
      class: 'tl',
      viewBox: `0 0 ${W} ${H}`,
      width: W,
      height: H,
      role: 'img',
      'aria-label': 'Frise du parcours : périodes d\'études, de stage et de projet en encadrés, projets courts en points sur la ligne, et suite possible.',
    });
    const defs = el('defs');
    svg.append(defs);
    const layerBoxes = el('g');
    const layerLines = el('g');
    const layerText = el('g');

    // repères : années et mois élargis
    for (let m = 0; m < S.n; m++) {
      const abs = S.startM + m;
      const p = { y: Math.floor(abs / 12), m: abs % 12, d: 1 };
      const x = S.x(p);
      if (p.m === 0) {
        svg.append(el('line', { x1: x, x2: x, y1: 4, y2: H - 14, class: 'tl__tick' }));
        svg.append(el('text', { x: x + 5, y: 16, class: 'tl__year' }, String(p.y)));
      } else {
        svg.append(el('line', { x1: x, x2: x, y1: 22, y2: 36, class: 'tl__tick' }));
      }
      svg.append(el('text', { x: x + 4, y: 32, class: 'tl__month' }, MONTHS[p.m].toUpperCase()));
    }
    svg.append(el('line', { x1: 0, x2: W, y1: 36, y2: 36, class: 'tl__bound' }));
    svg.append(el('line', { x1: 0, x2: W, y1: H - 14, y2: H - 14, class: 'tl__bound' }));

    // encadrés et leurs textes
    const drawBox = (p) => {
      const g = el('g', { class: `tl__box tl__box--d${p.depth}` });
      g.append(el('rect', { x: p.xa, y: Y0 - p.top, width: p.xb - p.xa, height: p.top + p.bottom }));
      g.append(el('title', {}, `${p.title} — ${formatRange(p.start, p.end)}${p.desc ? '\n' + p.desc : ''}`));
      linkable(g, p, p.title);
      graphEls.set(p.id, g);
      layerBoxes.append(g);
      let label;
      if (p.labelPos === 'top') label = textBlock(p.va + PAD, Y0 - p.top + 5, p.label);
      else if (p.labelPos === 'inside') label = textBlock(p.va + PAD, Y0 + p.labelY, p.label);
      else {
        label = textBlock(p.labelX, Y0 + p.labelY, p.label);
        layerLines.append(el('line', { x1: p.leadX, x2: p.leadX, y1: Y0 + p.bottom, y2: Y0 + p.labelY + 1, class: 'tl__lead' }));
      }
      linkable(label, p, p.title);
      layerText.append(label);
      (kids.get(p.id) || []).forEach(drawBox);
    };
    roots.forEach(drawBox);

    // la ligne de vie : depuis le hors-champ à gauche jusqu'à aujourd'hui
    let d = '';
    for (let x = -10; x <= xn; x += 6) d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + yOf(x).toFixed(1);
    d += ` L${xn.toFixed(1)} ${yOf(xn).toFixed(1)}`;
    layerLines.append(el('path', { d, class: 'tl__main' }));

    // nœuds et leurs légendes
    nodes.forEach((n) => {
      const y = yOf(n.x);
      const g = el('g', { class: 'tl__node' + (n.e.key ? ' tl__node--key' : '') });
      g.append(el('rect', { x: n.x - 6, y: y - 6, width: 12, height: 12, transform: `rotate(45 ${n.x} ${y})` }));
      g.append(el('title', {}, `${n.e.title} — ${formatRange(n.e.date)}`));
      const ly = n.band === 'top' ? Y0 - TOP - 22 - n.level * NODE_ROW : Y0 + BOT + 24 + n.level * NODE_ROW;
      layerLines.append(el('line', {
        x1: n.x, x2: n.x,
        y1: n.band === 'top' ? y - 8 : y + 8,
        y2: n.band === 'top' ? ly + 17 : ly - 13,
        class: 'tl__lead',
      }));
      const label = el('g', { class: 'tl__node-label' + (n.e.key ? ' tl__node--key' : '') });
      label.append(el('text', { x: n.lx, y: ly, class: 'tl__code' }, n.e.code));
      label.append(el('text', { x: n.lx, y: ly + 14, class: 'tl__sub' }, n.e.title));
      linkable(g, n.e, n.e.title);
      linkable(label, n.e, n.e.title);
      graphEls.set(n.e.id, g);
      layerLines.append(g);
      layerText.append(label);
    });

    // aujourd'hui
    const yn = yOf(xn);
    layerLines.append(el('line', { x1: xn, x2: xn, y1: 40, y2: H - 18, class: 'tl__now' }));
    layerText.append(el('text', { x: xn - 6, y: H - 20, class: 'tl__now-label', 'text-anchor': 'end' }, 'AUJOURD\'HUI'));

    // futur : branches possibles, en pointillés qui s'estompent vers la droite
    data.future.forEach((f, i) => {
      const xd = Math.max(xn + 50, S.x(f.start));
      const yb = yn + f.offset;
      const xEnd = Math.min(W - 5, xd + 150);
      const id = 'tl-fade-' + i;
      const grad = el('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: xn, x2: xEnd, y1: 0, y2: 0 });
      grad.append(el('stop', { offset: '0', 'stop-color': '#6cbf45', 'stop-opacity': '0.95' }));
      grad.append(el('stop', { offset: '1', 'stop-color': '#6cbf45', 'stop-opacity': '0.05' }));
      defs.append(grad);
      const g = el('g', { class: 'tl__future' });
      g.append(el('path', { d: `M${xn} ${yn} C ${xn + 30} ${yn}, ${xn + 25} ${yb}, ${xn + 60} ${yb} L ${xEnd} ${yb}`, stroke: `url(#${id})` }));
      g.append(el('rect', { x: xd - 5, y: yb - 5, width: 10, height: 10 }));
      layerLines.append(g);
      const head = `${f.title.toUpperCase()} · ${MONTHS[f.start.m].toUpperCase()} ${f.start.y}`;
      const width = Math.max(measure(head, FONT_CODE), ...f.lines.map((l) => measure(l, FONT_SUB)));
      const right = xd + 10 + width <= W - 4;
      const tx = right ? xd + 10 : xd - 10;
      const anchor = right ? 'start' : 'end';
      const top = f.offset < 0 ? yb - 12 - f.lines.length * 15 : yb - 10;
      const label = el('g', { class: 'tl__future' });
      label.append(el('text', { x: tx, y: top, class: 'tl__code', 'text-anchor': anchor }, head));
      f.lines.forEach((line, k) => label.append(el('text', { x: tx, y: top + 15 + k * 15, class: 'tl__sub', 'text-anchor': anchor }, line)));
      layerText.append(label);
    });

    svg.append(layerBoxes, layerLines, layerText);
    root.replaceChildren(svg);
    nowX = xn;
    centerOnNow(root);
  }

  /* ---------- défilement horizontal ---------- */
  let nowX = 0;
  // aujourd'hui aux deux tiers de la largeur visible : le passé récent et la suite
  function centerOnNow(box) {
    if (box.clientWidth > 0) box.scrollLeft = Math.max(0, nowX - box.clientWidth * 0.66);
  }

  function setupScroll(box) {
    // à chaque ouverture de la fenêtre (largeur 0 → visible), on se recentre
    let wasHidden = true;
    new ResizeObserver(() => {
      const hidden = box.clientWidth === 0;
      if (wasHidden && !hidden) centerOnNow(box);
      wasHidden = hidden;
    }).observe(box);
    // glisser à la souris pour se déplacer dans la frise (le clic reste possible)
    let drag = null;
    box.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: box.scrollLeft, moved: false };
    });
    box.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return;
      if (!drag.moved) box.setPointerCapture(e.pointerId);
      drag.moved = true;
      box.classList.add('is-dragging');
      box.scrollLeft = drag.left - dx;
    });
    const end = () => {
      if (drag && drag.moved) {
        // le relâchement d'un glisser ne doit pas déclencher de clic
        box.addEventListener('click', (ev) => ev.stopPropagation(), { capture: true, once: true });
      }
      drag = null;
      box.classList.remove('is-dragging');
    };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);
  }

  /* ---------- version texte : encadrés imbriqués, du plus récent au plus ancien ---------- */
  function drawText(root, data) {
    const make = (tag, cls, content) => FV.el(tag, cls, content);
    const inside = (date, p) => keyOf(p.start) <= keyOf(date) && keyOf(date) <= keyOf(p.end);

    // chaque événement va dans la période la plus profonde qui le contient
    const children = new Map(data.periods.map((p) => [p.id, []]));
    const top = [];
    data.periods.forEach((p) => (p.parent ? children.get(p.parent) : top).push({ kind: 'period', p, at: keyOf(p.start) }));
    data.events.forEach((e) => {
      const host = data.periods.filter((p) => inside(e.date, p)).sort((a, b) => b.depth - a.depth)[0];
      (host ? children.get(host.id) : top).push({ kind: 'event', e, at: keyOf(e.date) });
    });

    const linkBtn = (item) => {
      const b = make('button', 'link-btn', item.app ? 'ouvrir' : 'voir sur la frise ↑');
      b.type = 'button';
      if (item.app) b.dataset.open = item.app;
      else b.addEventListener('click', () => showGraph(item.id));
      return b;
    };
    textEls.clear();

    function render(items, parent) {
      items.sort((a, b) => b.at - a.at).forEach((item) => {
        if (item.kind === 'period') {
          const { p } = item;
          const box = make('section', 'frise__box');
          const head = make('div', 'frise__head');
          head.append(make('time', null, formatRange(p.start, p.end)), make('b', null, p.title));
          if (p.sub) head.append(make('span', 'frise__sub', p.sub));
          box.append(head);
          const desc = make('p', 'frise__desc', p.desc ? p.desc + ' ' : '');
          desc.append(linkBtn(p));
          box.append(desc);
          textEls.set(p.id, box);
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
          body.append(linkBtn(e));
          row.append(body);
          textEls.set(e.id, row);
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
      // les mesures de texte ont besoin de la vraie police
      if (document.fonts) await document.fonts.load(FONT_TITLE).catch(() => {});
      const data = validate(raw);
      const today = new Date();
      const now = { y: today.getFullYear(), m: today.getMonth(), d: today.getDate(), exact: true };
      draw(graph, data, now);
      if (!graph.dataset.scroll) {
        graph.dataset.scroll = '1';
        setupScroll(graph);
      }
      if (textRoot) drawText(textRoot, data);
    },
  };
})(window.FV);
