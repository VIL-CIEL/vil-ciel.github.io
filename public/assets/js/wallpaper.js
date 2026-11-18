/* =====================================================================
   Fond d'écran ASCII : généré une fois (et au redimensionnement), statique.
   Variantes en test : 1 nébuleuse, 2 circuit, 3 signal + initiales,
   4 bannière (image convertie en ASCII).
   ===================================================================== */
'use strict';

(function (FV) {
  // Niveaux de violet, du plus discret au plus visible (0 = vide).
  const SHADES = [null, '#221932', '#2e2145', '#3f2c60', '#56398a', '#6f4cb5', '#8a63db'];

  // Taille d'une cellule de caractère, selon la police réellement appliquée.
  function measureCell(pre) {
    const probe = FV.el('span', null, 'MMMMMMMMMM');
    pre.append(probe);
    const width = probe.getBoundingClientRect().width / 10 || 7.8;
    probe.remove();
    const height = parseFloat(window.getComputedStyle(pre).lineHeight) || 16;
    return { width, height };
  }

  /* ---------- 4. bannière : conversion d'une image en ASCII ---------- */
  // L'image est réduite par le navigateur à 1 pixel = 1 caractère, puis lue une seule
  // fois. Remplacer le fichier suffit : la zone des logos est détectée automatiquement.
  const BANNER_SRC = 'assets/img/fond-banniere.png';
  const LOGO_HEIGHT = 0.6; // hauteur max du bloc de logos, en part de l'écran
  const LOGO_WIDTH = 0.72; // largeur max du bloc de logos
  const LOGO_LUM = 30; // en dessous : trait sombre des logos (le dégradé ne descend pas sous ~35)
  const SUB = 3; // sous-échantillons par axe et par caractère (3×3)
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  let bannerImg = null;
  let logoBox = null;

  const lumAt = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

  // Cadre englobant les pixels sombres (les logos), avec une petite marge.
  function findLogos(img) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, w, h).data;
    let x0 = w;
    let y0 = h;
    let x1 = 0;
    let y1 = 0;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        if (lumAt(d, (y * w + x) * 4) < LOGO_LUM) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 <= x0) return { x: 0, y: 0, w, h };
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * 0.03);
    x0 = Math.max(0, x0 - m);
    y0 = Math.max(0, y0 - m);
    return { x: x0, y: y0, w: Math.min(w, x1 + m) - x0, h: Math.min(h, y1 + m) - y0 };
  }

  function loadBanner() {
    if (bannerImg) return Promise.resolve(bannerImg);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        logoBox = findLogos(img);
        resolve((bannerImg = img));
      };
      img.onerror = reject;
      img.src = BANNER_SRC;
    });
  }

  // Choix du caractère selon la forme du trait dans la cellule (masque 3×3).
  function glyph(m) {
    const n = m.reduce((a, b) => a + b, 0);
    if (n >= 7) return '#';
    const row = [0, 1, 2].map((r) => m[r * 3] + m[r * 3 + 1] + m[r * 3 + 2]);
    const col = [0, 1, 2].map((c) => m[c] + m[3 + c] + m[6 + c]);
    if (n <= 5 && col.includes(3)) return '|';
    if (n <= 5 && row.includes(3)) return row[2] === 3 && !row[0] ? '_' : '-';
    if (n <= 5 && m[0] && m[4] && m[8]) return '\\';
    if (n <= 5 && m[2] && m[4] && m[6]) return '/';
    if (n <= 2) return '.';
    return n <= 4 ? '+' : '%';
  }

  function banner(cols, rows, rand, cell) {
    if (!bannerImg) return Array.from({ length: cols * rows }, () => [' ', 0]);
    const iw = bannerImg.naturalWidth;
    const box = logoBox;

    // fond : la ligne du haut de l'image (pur dégradé) étirée sur tout l'écran
    const bg = document.createElement('canvas');
    bg.width = cols;
    bg.height = 1;
    const bctx = bg.getContext('2d', { willReadFrequently: true });
    bctx.drawImage(bannerImg, 0, 0, iw, 1, 0, 0, cols, 1);
    const bgd = bctx.getImageData(0, 0, cols, 1).data;

    // bloc de logos, à la bonne proportion (cellules plus hautes que larges)
    let hCells = Math.round(rows * LOGO_HEIGHT);
    let wCells = Math.round((hCells * cell.height * box.w) / box.h / cell.width);
    // sur écran étroit (mobile), le bloc peut occuper presque toute la largeur
    const maxW = cols < 120 ? cols - 4 : cols * LOGO_WIDTH;
    if (wCells > maxW) {
      wCells = Math.round(maxW);
      hCells = Math.round((wCells * cell.width * box.h) / box.w / cell.height);
    }
    const ox = cols - wCells - 2;
    const oy = rows - hCells - 1;
    const lc = document.createElement('canvas');
    lc.width = wCells * SUB;
    lc.height = hCells * SUB;
    const lctx = lc.getContext('2d', { willReadFrequently: true });
    lctx.drawImage(bannerImg, box.x, box.y, box.w, box.h, 0, 0, lc.width, lc.height);
    const ld = lctx.getImageData(0, 0, lc.width, lc.height).data;

    const grid = [];
    const mask = new Array(9);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const lx = x - ox;
        const ly = y - oy;
        if (lx >= 0 && ly >= 0 && lx < wCells && ly < hCells) {
          let n = 0;
          for (let sy = 0; sy < SUB; sy++) {
            for (let sx = 0; sx < SUB; sx++) {
              const i = ((ly * SUB + sy) * lc.width + lx * SUB + sx) * 4;
              const dark = lumAt(ld, i) < LOGO_LUM ? 1 : 0;
              mask[sy * SUB + sx] = dark;
              n += dark;
            }
          }
          if (n) {
            // trait des logos : ressort en violet clair
            grid.push([glyph(mask), n >= 5 ? 6 : 5]);
            continue;
          }
        }
        // dégradé : texture tramée très discrète, densité selon la luminosité
        const t = Math.min(1, Math.max(0, (lumAt(bgd, x * 4) - 34) / 60));
        if (t * 16 <= BAYER[(y % 4) * 4 + (x % 4)] + 3) {
          grid.push([' ', 0]);
          continue;
        }
        grid.push([t > 0.6 ? ':' : '.', t > 0.55 ? 2 : 1]);
      }
    }
    return grid;
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

  const VARIANTS = { 1: nebula, 2: circuit, 3: signal, 4: banner };

  function variant() {
    const fromUrl = new URLSearchParams(window.location.search).get('fond');
    const chosen = fromUrl || FV.store.get('fv-fond') || '1';
    return VARIANTS[chosen] ? chosen : '1';
  }

  let lastSize = '';

  FV.drawWallpaper = (force) => {
    const pre = FV.$('#wallpaper');
    if (!pre) return;
    const current = variant();
    // la bannière demande une police plus fine pour garder le détail des logos
    pre.classList.toggle('wallpaper--fine', current === '4');
    if (current === '4' && !bannerImg) {
      loadBanner()
        .then(() => FV.drawWallpaper(true))
        .catch(() => {
          /* image absente : on retombe sur la première variante */
          FV.store.set('fv-fond', '1');
          FV.drawWallpaper(true);
        });
      return;
    }
    const cell = measureCell(pre);
    const cols = Math.ceil(pre.clientWidth / cell.width) + 1;
    const rows = Math.ceil(pre.clientHeight / cell.height) + 1;
    const size = cols + 'x' + rows + ':' + current;
    if (!force && size === lastSize) return;
    lastSize = size;
    const grid = VARIANTS[current](cols, rows, FV.rng(2026), cell);
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
