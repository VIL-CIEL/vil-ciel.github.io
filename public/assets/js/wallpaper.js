/* =====================================================================
   Fond d'écran ASCII : la bannière convertie en caractères, calculée une
   fois (et au redimensionnement), dessinée sur un canvas, statique.
   ===================================================================== */
'use strict';

(function (FV) {
  // Niveaux de violet, du plus discret au plus visible (0 = vide).
  const SHADES = [null, '#221932', '#2e2145', '#3f2c60', '#56398a', '#6f4cb5', '#8a63db'];
  const FONT_FAMILY = '"IBM Plex Mono", consolas, monospace';
  // police fine pour garder le détail des logos
  const FONT_SIZE = 8;

  /* =====================================================================
     Conversion image → ASCII par correspondance de forme
     Chaque caractère est décrit par 6 valeurs (son « encre » dans 6 zones
     circulaires en quinconce) ; chaque case de l'image est mesurée dans les
     mêmes zones, puis on choisit le caractère le plus proche. Méthode décrite
     par Alex Harri, « ASCII characters are not pixels ».
     ===================================================================== */
  const CIRCLES = [
    [0.28, 0.14], [0.72, 0.22],
    [0.28, 0.46], [0.72, 0.54],
    [0.28, 0.78], [0.72, 0.86],
  ];
  const RADIUS = 0.3; // rayon des zones, relatif à la largeur d'une case
  const CONTRAST = 2.2; // exposant du renforcement de contraste
  const CHARSET = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i));

  // Pour une grille de gw×gh échantillons couvrant une case de cw×ch pixels,
  // liste des échantillons qui tombent dans chacune des 6 zones.
  function zoneSamples(gw, gh, cw, ch) {
    return CIRCLES.map(([cx, cy]) => {
      const list = [];
      const r2 = (RADIUS * cw) ** 2;
      for (let sy = 0; sy < gh; sy++) {
        for (let sx = 0; sx < gw; sx++) {
          const dx = ((sx + 0.5) / gw) * cw - cx * cw;
          const dy = ((sy + 0.5) / gh) * ch - cy * ch;
          if (dx * dx + dy * dy <= r2) list.push(sy * gw + sx);
        }
      }
      return list;
    });
  }

  let glyphs = null; // { key, vecs: Float32Array(95 × 6) }

  // Mesure la forme des 95 caractères dans la police réelle (une seule fois).
  function buildGlyphs(cell, size) {
    const key = cell.width.toFixed(2) + 'x' + cell.height + '@' + size;
    if (glyphs && glyphs.key === key) return glyphs;
    const K = 4; // sur-échantillonnage
    const w = Math.round(cell.width * K);
    const h = Math.round(cell.height * K);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.font = `${size * K}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'middle';
    const zones = zoneSamples(w, h, w, h);
    const vecs = new Float32Array(CHARSET.length * 6);
    CHARSET.forEach((ch, i) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.fillText(ch, 0, h / 2);
      const d = ctx.getImageData(0, 0, w, h).data;
      zones.forEach((list, z) => {
        let sum = 0;
        for (const p of list) sum += d[p * 4];
        vecs[i * 6 + z] = list.length ? sum / list.length / 255 : 0;
      });
    });
    // normalisation par composante : répartit mieux les caractères
    for (let z = 0; z < 6; z++) {
      let max = 0;
      for (let i = 0; i < CHARSET.length; i++) max = Math.max(max, vecs[i * 6 + z]);
      if (max > 0) for (let i = 0; i < CHARSET.length; i++) vecs[i * 6 + z] /= max;
    }
    glyphs = { key, vecs };
    return glyphs;
  }

  /* ---------- bannière ---------- */
  // Remplacer le fichier suffit : la zone des logos est détectée automatiquement.
  const BANNER_SRC = 'assets/img/fond-banniere.webp';
  const LOGO_HEIGHT = 0.62; // hauteur max du bloc de logos, en part de l'écran
  const LOGO_WIDTH = 0.8; // largeur max du bloc de logos
  const LOGO_LUM = 30; // en dessous : trait sombre des logos (le dégradé ne descend pas sous ~35)
  const SUB = 6; // échantillons par axe et par case
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
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
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

  function banner(cols, rows, cell, size) {
    const iw = bannerImg.naturalWidth;
    const box = logoBox;
    const { vecs } = buildGlyphs(cell, size);

    // fond : la ligne du haut de l'image (pur dégradé) étirée sur tout l'écran
    const bg = document.createElement('canvas');
    bg.width = cols;
    bg.height = 1;
    const bctx = bg.getContext('2d', { willReadFrequently: true });
    bctx.drawImage(bannerImg, 0, 0, iw, 1, 0, 0, cols, 1);
    const bgd = bctx.getImageData(0, 0, cols, 1).data;

    // bloc de logos, à la bonne proportion (cases plus hautes que larges)
    let hCells = Math.round(rows * LOGO_HEIGHT);
    let wCells = Math.round((hCells * cell.height * box.w) / box.h / cell.width);
    const maxW = cols < 120 ? cols - 4 : cols * LOGO_WIDTH; // mobile : toute la largeur
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
    lctx.imageSmoothingQuality = 'high';
    lctx.drawImage(bannerImg, box.x, box.y, box.w, box.h, 0, 0, lc.width, lc.height);
    const ld = lctx.getImageData(0, 0, lc.width, lc.height).data;
    // « encre » de chaque échantillon : trait sombre sur fond bleu
    const ink = new Float32Array(lc.width * lc.height);
    for (let i = 0; i < ink.length; i++) ink[i] = Math.min(1, Math.max(0, (55 - lumAt(ld, i * 4)) / 45));

    const zones = zoneSamples(SUB, SUB, cell.width, cell.height);
    const cache = new Map();
    const v = new Float32Array(6);
    const grid = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const lx = x - ox;
        const ly = y - oy;
        if (lx >= 0 && ly >= 0 && lx < wCells && ly < hCells) {
          let max = 0;
          zones.forEach((list, z) => {
            let sum = 0;
            for (const p of list) sum += ink[(ly * SUB + ((p / SUB) | 0)) * lc.width + lx * SUB + (p % SUB)];
            v[z] = list.length ? sum / list.length : 0;
            if (v[z] > max) max = v[z];
          });
          if (max >= 0.06) {
            // contraste : les zones faibles s'effacent devant les fortes
            let key = 0;
            for (let z = 0; z < 6; z++) {
              v[z] = (v[z] / max) ** CONTRAST * max;
              key = key * 16 + Math.min(15, (v[z] * 16) | 0);
            }
            let best = cache.get(key);
            if (best === undefined) {
              let bestD = Infinity;
              for (let i = 0; i < CHARSET.length; i++) {
                let dist = 0;
                for (let z = 0; z < 6; z++) dist += (vecs[i * 6 + z] - v[z]) ** 2;
                if (dist < bestD) {
                  bestD = dist;
                  best = i;
                }
              }
              cache.set(key, best);
            }
            if (best > 0) {
              grid.push([CHARSET[best], max > 0.55 ? 6 : 5]);
              continue;
            }
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

  /* ---------- dessin sur canvas (une passe par teinte) ---------- */
  function paint(canvas, grid, cols, rows, cell, size, cssW, cssH) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = `${size}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'middle';
    const byShade = SHADES.map(() => []);
    for (let i = 0; i < grid.length; i++) {
      const [ch, lvl] = grid[i];
      if (ch !== ' ' && lvl) byShade[lvl].push(i);
    }
    byShade.forEach((cells, lvl) => {
      if (!cells.length) return;
      ctx.fillStyle = SHADES[lvl];
      for (const i of cells) {
        const x = i % cols;
        const y = (i / cols) | 0;
        ctx.fillText(grid[i][0], x * cell.width, y * cell.height + cell.height / 2);
      }
    });
  }

  let lastSize = '';
  let drawing = false;
  let pending = false; // taille changée pendant un dessin : à refaire ensuite

  FV.drawWallpaper = async (force) => {
    const canvas = FV.$('#wallpaper');
    if (!canvas) return;
    if (drawing) {
      pending = true;
      return;
    }
    const size = FONT_SIZE;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    // canvas pas encore affiché : il sera dessiné quand il aura une taille
    if (!cssW || !cssH) return;
    const key = cssW + 'x' + cssH;
    if (!force && key === lastSize) return;
    drawing = true;
    try {
      // la police doit être chargée avant de mesurer les caractères
      if (document.fonts) await document.fonts.load(`${size}px "IBM Plex Mono"`).catch(() => {});
      await loadBanner();
      const ctx = canvas.getContext('2d');
      ctx.font = `${size}px ${FONT_FAMILY}`;
      const cell = { width: ctx.measureText('M').width || size * 0.6, height: Math.ceil(size * 1.15) };
      const cols = Math.ceil(cssW / cell.width) + 1;
      const rows = Math.ceil(cssH / cell.height) + 1;
      const grid = banner(cols, rows, cell, size);
      paint(canvas, grid, cols, rows, cell, size, cssW, cssH);
      lastSize = key;
    } catch (err) {
      // image absente : le bureau reste sur sa couleur de fond
      console.warn('Fond d\'écran :', err);
    } finally {
      drawing = false;
    }
    if (pending) {
      pending = false;
      FV.drawWallpaper(false);
    }
  };

  let timer = 0;
  const redraw = () => {
    clearTimeout(timer);
    timer = setTimeout(() => FV.drawWallpaper(false), 200);
  };
  const canvas = FV.$('#wallpaper');
  if (canvas && 'ResizeObserver' in window) new ResizeObserver(redraw).observe(canvas);
  else window.addEventListener('resize', redraw);
})(window.FV);
