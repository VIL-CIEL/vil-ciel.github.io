/* =====================================================================
   Fond d'écran ASCII : généré une fois (et au redimensionnement), statique.
   Trois variantes en test : 1 nébuleuse, 2 circuit, 3 signal + initiales.
   ===================================================================== */
'use strict';

(function (FV) {
  // Niveaux de violet, du plus discret au plus visible (0 = vide).
  const SHADES = [null, '#221932', '#2e2145', '#3f2c60', '#56398a'];
  const LINE_H = 16;

  function measureChar(pre) {
    const probe = FV.el('span', null, 'MMMMMMMMMM');
    pre.append(probe);
    const width = probe.getBoundingClientRect().width / 10 || 7.8;
    probe.remove();
    return width;
  }

  /* ---------- 1. nébuleuse : bruit de valeur sur 2 octaves ---------- */
  function nebula(cols, rows, rand) {
    const lattice = new Map();
    const at = (x, y) => {
      const key = x * 7919 + y;
      if (!lattice.has(key)) lattice.set(key, rand());
      return lattice.get(key);
    };
    const smooth = (t) => t * t * (3 - 2 * t);
    const noise = (x, y) => {
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const fx = smooth(x - x0);
      const fy = smooth(y - y0);
      const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
      const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
      return top * (1 - fy) + bottom * fy;
    };
    const RAMP = '.·:-=+*#';
    const grid = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const d = noise(x / 22, y / 9) * 0.7 + noise(x / 7, y / 3) * 0.3;
        if (d < 0.52 || rand() < 0.35) {
          grid.push([' ', 0]);
          continue;
        }
        const k = Math.min(0.999, (d - 0.52) / 0.4);
        grid.push([RAMP[(k * RAMP.length) | 0], 1 + ((k * 4) | 0)]);
      }
    }
    return grid;
  }

  /* ---------- 2. circuit : pistes en angles droits + nœuds ---------- */
  // Coins indexés par les deux côtés reliés (triés) : B bas, L gauche, R droite, T haut.
  const CORNERS = { BR: '┌', BL: '┐', RT: '└', LT: '┘' };

  function circuit(cols, rows, rand) {
    const grid = Array.from({ length: cols * rows }, () => [' ', 0]);
    const set = (x, y, ch, lvl) => {
      if (x >= 0 && y >= 0 && x < cols && y < rows) grid[y * cols + x] = [ch, lvl];
    };
    const free = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && grid[y * cols + x][0] === ' ';
    const traces = Math.round((cols * rows) / 260);
    for (let n = 0; n < traces; n++) {
      let x = (rand() * cols) | 0;
      let y = (rand() * rows) | 0;
      if (!free(x, y)) continue;
      let horizontal = rand() < 0.65;
      let dir = rand() < 0.5 ? -1 : 1;
      const lvl = rand() < 0.15 ? 3 : 1 + ((rand() * 2) | 0);
      set(x, y, 'o', 4);
      let length = 8 + ((rand() * 30) | 0);
      while (length-- > 0) {
        const nx = horizontal ? x + dir : x;
        const ny = horizontal ? y : y + dir;
        if (!free(nx, ny)) break;
        if (length > 2 && rand() < 0.08) {
          // virage à 90° : le coin relie le côté d'arrivée et le côté de départ
          const newDir = rand() < 0.5 ? -1 : 1;
          const from = horizontal ? (dir > 0 ? 'L' : 'R') : (dir > 0 ? 'T' : 'B');
          const to = horizontal ? (newDir > 0 ? 'B' : 'T') : (newDir > 0 ? 'R' : 'L');
          set(nx, ny, CORNERS[[from, to].sort().join('')], lvl);
          x = nx;
          y = ny;
          horizontal = !horizontal;
          dir = newDir;
          continue;
        }
        set(nx, ny, horizontal ? '─' : '│', lvl);
        x = nx;
        y = ny;
      }
      set(x, y, rand() < 0.5 ? 'o' : '■', 4);
      if (rand() < 0.25) {
        const label = '0x' + ((rand() * 255) | 0).toString(16).toUpperCase().padStart(2, '0');
        for (let i = 0; i < label.length; i++) if (free(x + 2 + i, y)) set(x + 2 + i, y, label[i], 1);
      }
    }
    return grid;
  }

  /* ---------- 3. signal + initiales ---------- */
  const BIG = [
    '#########   ##        ##',
    '##          ##        ##',
    '##           ##      ## ',
    '#######      ##      ## ',
    '##            ##    ##  ',
    '##             ##  ##   ',
    '##              ####    ',
    '##               ##     ',
  ];

  function signal(cols, rows, rand) {
    const grid = [];
    for (let i = 0; i < cols * rows; i++) {
      grid.push(rand() < 0.045 ? [rand() < 0.5 ? '0' : '1', 1] : [' ', 0]);
    }
    const set = (x, y, ch, lvl) => {
      if (x >= 0 && y >= 0 && x < cols && y < rows) grid[y * cols + x] = [ch, lvl];
    };
    // deux traces d'oscilloscope
    [[0.34, 3.2, 26, 3], [0.62, 2.1, 41, 2]].forEach(([pos, amp, period, lvl]) => {
      let prev = null;
      for (let x = 0; x < cols; x++) {
        const y = Math.round(rows * pos + Math.sin(x / period * Math.PI * 2) * amp + Math.sin(x / 9) * 0.6);
        let ch = '-';
        if (prev !== null) ch = y < prev ? '/' : y > prev ? '\\' : '-';
        set(x, y, ch, lvl);
        prev = y;
      }
    });
    // initiales en grand, en bas à droite, écrites avec des 0 et des 1
    const ox = cols - BIG[0].length - 4;
    const oy = rows - BIG.length - 3;
    BIG.forEach((line, dy) => {
      for (let dx = 0; dx < line.length; dx++) {
        if (line[dx] === '#') set(ox + dx, oy + dy, rand() < 0.5 ? '0' : '1', 3);
      }
    });
    return grid;
  }

  const VARIANTS = { 1: nebula, 2: circuit, 3: signal };

  function variant() {
    const fromUrl = new URLSearchParams(window.location.search).get('fond');
    const chosen = fromUrl || FV.store.get('fv-fond') || '1';
    return VARIANTS[chosen] ? chosen : '1';
  }

  let lastSize = '';

  FV.drawWallpaper = (force) => {
    const pre = FV.$('#wallpaper');
    if (!pre) return;
    const charW = measureChar(pre);
    const cols = Math.ceil(pre.clientWidth / charW) + 1;
    const rows = Math.ceil(pre.clientHeight / LINE_H) + 1;
    const size = cols + 'x' + rows + ':' + variant();
    if (!force && size === lastSize) return;
    lastSize = size;
    const grid = VARIANTS[variant()](cols, rows, FV.rng(2026));
    // regroupe les caractères de même teinte : peu de nœuds DOM
    const frag = document.createDocumentFragment();
    let run = '';
    let runLvl = 0;
    const flush = () => {
      if (!run) return;
      if (runLvl) {
        const span = FV.el('span', null, run);
        span.style.color = SHADES[runLvl];
        frag.append(span);
      } else {
        frag.append(run);
      }
      run = '';
    };
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const [ch, lvl] = grid[y * cols + x];
        const l = ch === ' ' ? 0 : lvl;
        if (l !== runLvl) {
          flush();
          runLvl = l;
        }
        run += ch;
      }
      flush();
      runLvl = 0;
      frag.append('\n');
    }
    pre.replaceChildren(frag);
  };

  FV.setWallpaper = (n) => {
    FV.store.set('fv-fond', String(n));
    FV.drawWallpaper(true);
  };

  let timer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => FV.drawWallpaper(false), 200);
  });
})(window.FV);
