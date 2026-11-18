/* =====================================================================
   Scènes pixel art (192×64) des fenêtres de projet.
   Une seule boucle requestAnimationFrame pour tout le site : elle ne dessine
   que les scènes visibles et s'arrête complètement quand il n'y en a aucune.
   Les décors fixes sont pré-rendus une fois sur des calques.
   ===================================================================== */
'use strict';

(function (FV) {
  const W = 192;
  const H = 64;
  const SCENES = {};

  // Calque statique : dessiné une seule fois, recopié à chaque image.
  function layer(draw) {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    draw(FV.painter(ctx), ctx);
    return c;
  }

  // Petit calque transparent qui défile d'un pixel par image (courbes).
  function scroller(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    return {
      canvas: c,
      step(drawColumn) {
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(c, -1, 0);
        ctx.globalCompositeOperation = 'source-over';
        drawColumn(ctx, w - 1);
      },
    };
  }

  // Position le long d'un trajet en angles droits.
  function along(path, dist) {
    let d = dist;
    for (let i = 1; i < path.length; i++) {
      const [ax, ay] = path[i - 1];
      const [bx, by] = path[i];
      const len = Math.abs(bx - ax) + Math.abs(by - ay);
      if (d <= len) {
        const k = len ? d / len : 0;
        return [ax + (bx - ax) * k, ay + (by - ay) * k];
      }
      d -= len;
    }
    return path[path.length - 1];
  }
  const pathLength = (path) =>
    path.slice(1).reduce((sum, p, i) => sum + Math.abs(p[0] - path[i][0]) + Math.abs(p[1] - path[i][1]), 0);

  function drawPath(P, path, color) {
    for (let i = 1; i < path.length; i++) {
      const [ax, ay] = path[i - 1];
      const [bx, by] = path[i];
      P.r(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax) + 1, Math.abs(by - ay) + 1, color);
    }
  }

  /* =====================================================================
     DAP : capteurs → Raspberry Pi → un seul lien ZeroMQ → PC (PyMoDAQ)
     ===================================================================== */
  SCENES.dap = () => {
    const R = FV.rng(3);
    const SENSORS = [
      { name: 'thermocouple', color: '#e6b84a', path: [[24, 15], [40, 15], [40, 27], [61, 27]] },
      { name: 'lumiere', color: '#63c24d', path: [[24, 31], [44, 31], [44, 33], [61, 33]] },
      { name: 'humidite', color: '#a571ff', path: [[24, 43], [48, 43], [48, 39], [61, 39]] },
    ];
    SENSORS.forEach((s) => {
      s.len = pathLength(s.path);
      s.value = 0.5;
    });
    const LINK = [[105, 37], [129, 37]];
    const LINK_LEN = pathLength(LINK);
    const readings = [];
    const frames = [];
    const plot = scroller(54, 24);
    const latest = [0.5, 0.5, 0.5];
    const prevY = [null, null, null];
    let piFlash = 0;

    // valeurs simulées des trois capteurs à l'image f
    const sample = (f) => [
      0.5 + Math.sin(f * 0.07) * 0.35 + (R() - 0.5) * 0.12,
      (f % 37 < 30 ? 0.85 : 0.2) + (R() - 0.5) * 0.08,
      0.5 + Math.sin(f * 0.031 + 1) * 0.3 + Math.sin(f * 0.11) * 0.08,
    ];
    // une voie par capteur, tracée en trait continu
    const plotColumn = (values) =>
      plot.step((pc, x) => {
        values.forEach((v, i) => {
          const y = i * 8 + 7 - Math.round(Math.max(0, Math.min(1, v)) * 6);
          const from = prevY[i] === null ? y : prevY[i];
          pc.fillStyle = SENSORS[i].color;
          pc.fillRect(x, Math.min(from, y), 1, Math.abs(y - from) + 1);
          prevY[i] = y;
        });
      });
    // l'écran PyMoDAQ démarre déjà rempli
    for (let f = -54; f < 0; f++) plotColumn(sample(f));
    sample(0).forEach((v, i) => (SENSORS[i].value = v));

    const bg = layer((P) => {
      P.r(0, 0, W, H, '#131217');
      for (let x = 0; x < W; x += 12) for (let y = 4; y < 50; y += 12) P.p(x, y, '#1e1c24');
      P.r(0, 50, W, 14, '#25222b');
      P.r(0, 50, W, 1, '#3a3642');
      // capteur 1 : thermocouple plongé dans un godet chauffé
      P.r(8, 6, 2, 11, '#9aa0aa');
      P.r(4, 16, 12, 6, '#3a3642');
      P.r(5, 17, 10, 4, '#5a2a1a');
      P.r(16, 13, 8, 4, '#2c2934');
      // capteur 2 : photorésistance + lampe
      P.r(3, 24, 6, 5, '#3a3642');
      P.r(16, 28, 7, 6, '#2c2934');
      P.r(17, 29, 5, 4, '#c9a43a');
      P.p(18, 30, '#7a5232');
      P.p(19, 31, '#7a5232');
      P.p(20, 30, '#7a5232');
      // capteur 3 : sonde température / humidité
      P.r(14, 38, 10, 10, '#2a6f9a');
      for (let y = 39; y < 47; y += 2) for (let x = 15; x < 23; x += 2) P.p(x, y, '#174a6a');
      // fils vers le Raspberry
      SENSORS.forEach((s) => drawPath(P, s.path, '#3d3a46'));
      // Raspberry Pi 3B
      P.r(60, 20, 46, 28, '#2f6b3a');
      P.r(60, 20, 46, 1, '#3f8a4a');
      for (let y = 24; y < 44; y += 2) {
        P.p(62, y, '#e6c14b');
        P.p(64, y, '#c9a43a');
      }
      P.r(74, 27, 11, 11, '#16151a');
      P.r(88, 29, 6, 5, '#16151a');
      P.r(98, 24, 8, 8, '#9aa0aa');
      P.r(98, 34, 8, 8, '#9aa0aa');
      P.r(99, 35, 6, 1, '#6c707a');
      P.p(67, 45, '#e44b3f');
      // lien ZeroMQ unique
      drawPath(P, LINK, '#4a4655');
      P.t('ZMQ', 111, 31, '#6c6876');
      // PC : moniteur PyMoDAQ
      P.r(130, 6, 58, 38, '#2c2934');
      P.r(132, 8, 54, 34, '#0b0a0e');
      P.r(132, 8, 54, 7, '#1c1a22');
      P.t('PYMODAQ', 134, 9, '#a571ff');
      for (let x = 134; x < 186; x += 8) P.r(x, 16, 1, 25, '#17161c');
      P.r(132, 24, 54, 1, '#17161c');
      P.r(132, 32, 54, 1, '#17161c');
      P.r(155, 44, 8, 4, '#2c2934');
      P.r(149, 48, 20, 2, '#3a3642');
    });

    return {
      fps: 10,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        ctx.drawImage(bg, 0, 0);
        const values = sample(f);
        const heat = values[0];
        const lamp = values[1];
        // godet chauffé, lampe, voyant
        P.r(6, 18, 8, 2, heat > 0.6 ? '#e44b3f' : '#a83a2a');
        P.r(4, 23, 6, 1, lamp > 0.5 ? '#f3d77a' : '#4a4232');
        if (lamp > 0.5) P.r(10, 25, 2, 3, '#7a6a3a');
        // une mesure part de chaque capteur à intervalle régulier
        SENSORS.forEach((s, i) => {
          if ((f + i * 3) % 6 === 0) readings.push({ s, i, d: 0, v: values[i] });
        });
        for (let k = readings.length - 1; k >= 0; k--) {
          const r = readings[k];
          r.d += 3;
          if (r.d >= r.s.len) {
            latest[r.i] = Math.max(0, Math.min(1, r.v));
            piFlash = 2;
            readings.splice(k, 1);
            continue;
          }
          const [x, y] = along(r.s.path, r.d);
          P.r(x, y, 1, 1, r.s.color);
        }
        // le Raspberry regroupe et envoie une trame sur le lien unique
        if (f % 5 === 0) frames.push({ d: 0, v: latest.slice() });
        P.p(70, 45, piFlash-- > 0 ? '#63c24d' : '#1d3a1a');
        for (let k = frames.length - 1; k >= 0; k--) {
          const fr = frames[k];
          fr.d += 2;
          if (fr.d >= LINK_LEN) {
            fr.v.forEach((v, i) => (SENSORS[i].value = v));
            frames.splice(k, 1);
            continue;
          }
          const [x, y] = along(LINK, fr.d);
          SENSORS.forEach((s, i) => P.p(x + i - 1, y - 1 + (i % 2) * 2, s.color));
        }
        // trois voies dans PyMoDAQ, une par capteur, mises à jour par les trames reçues
        plotColumn(SENSORS.map((s) => s.value));
        ctx.drawImage(plot.canvas, 132, 17);
        P.p(182, 10, f % 10 < 5 ? '#63c24d' : '#1d3a1a');
      },
    };
  };

  /* =====================================================================
     Stage : banc de test (vapeur, bain thermostaté, ventilateur)
     relié au PC par un module d'acquisition NI-DAQmx
     ===================================================================== */
  SCENES.lab = () => {
    const R = FV.rng(7);
    const curve = scroller(42, 22);
    const puffs = [];
    const bubbles = [];
    const dots = [];
    let temp = 45.2;
    let prevT = null;

    // température du bain (régulée autour de 45 °C) + tracé sur le PC :
    // courbe de température (violet) et vitesse du ventilateur (vert)
    function tick(f) {
      const t = temp + (45 + Math.sin(f * 0.06) * 0.9 - temp) * 0.15 + (R() - 0.5) * 0.08;
      curve.step((c, x) => {
        const y = Math.max(0, Math.min(12, Math.round(12 - (t - 43.9) * 5.5)));
        const from = prevT === null ? y : prevT;
        c.fillStyle = '#a571ff';
        c.fillRect(x, Math.min(from, y), 1, Math.abs(y - from) + 1);
        prevT = y;
        c.fillStyle = '#3f8a4a';
        c.fillRect(x, 21 - (2 + (((f * 7) % 9) >> 1)), 1, 1);
      });
      return t;
    }
    for (let f = -42; f < 0; f++) temp = tick(f); // écran déjà rempli

    const bg = layer((P) => {
      P.r(0, 0, W, H, '#141318');
      for (let x = 0; x < W; x += 24) P.r(x, 0, 1, 46, '#19181e');
      P.r(0, 9, W, 1, '#1b1a21');
      // paillasse
      P.r(0, 46, W, 3, '#4b4556');
      P.r(0, 49, W, 15, '#29262f');
      for (let x = 30; x < W; x += 52) P.r(x, 52, 18, 1, '#3a3642');
      // PC d'acquisition
      P.r(4, 10, 48, 32, '#2c2934');
      P.r(6, 12, 44, 28, '#0b0a0e');
      P.t('ACQ', 8, 13, '#5d5868');
      for (let x = 8; x < 50; x += 6) for (let y = 19; y < 40; y += 5) P.p(x, y, '#1d1b24');
      P.r(25, 42, 6, 4, '#2c2934');
      P.r(20, 45, 16, 1, '#3a3642');
      // module NI-DAQmx
      P.r(58, 33, 26, 13, '#b8bcc4');
      P.r(58, 33, 26, 3, '#2a5aa6');
      P.t('NI', 60, 37, '#2a5aa6');
      P.r(60, 31, 22, 2, '#2f6b3a');
      for (let x = 61; x < 82; x += 3) P.p(x, 31, '#9aa0aa');
      P.r(52, 43, 6, 1, '#5d5868');
      // fils des sondes : vers le bain et vers le banc
      P.r(66, 22, 1, 9, '#5d5868');
      P.r(66, 22, 30, 1, '#5d5868');
      P.r(76, 14, 1, 17, '#5d5868');
      P.r(76, 14, 64, 1, '#5d5868');
      P.r(140, 14, 1, 8, '#5d5868');
      // bain thermostaté
      P.r(90, 28, 36, 18, '#3a3642');
      P.r(92, 31, 32, 14, '#1d4a6a');
      P.r(96, 20, 22, 8, '#25222b');
      P.r(97, 21, 20, 6, '#0b0a0e');
      // tuyau bain → banc
      P.r(126, 33, 8, 2, '#6c6876');
      P.r(132, 26, 2, 9, '#6c6876');
      // banc d'essai (veine) avec hublot
      P.r(132, 22, 36, 16, '#4b4556');
      P.r(136, 25, 26, 9, '#16151a');
      P.r(134, 38, 2, 8, '#3a3642');
      P.r(164, 38, 2, 8, '#3a3642');
      // cheminée de sortie de la vapeur
      P.r(146, 16, 6, 6, '#4b4556');
      // ventilateur
      P.r(172, 22, 18, 18, '#3a3642');
      P.r(174, 24, 14, 14, '#16151a');
      P.r(179, 40, 4, 6, '#3a3642');
      P.r(175, 45, 12, 1, '#4b4556');
    });

    return {
      fps: 10,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        ctx.drawImage(bg, 0, 0);
        temp = tick(f);
        ctx.drawImage(curve.canvas, 7, 18);
        // NI-DAQmx : voyant + données vers le PC
        P.p(80, 41, f % 6 < 3 ? '#63c24d' : '#1f3a1a');
        if (f % 4 === 0) dots.push(0);
        for (let k = dots.length - 1; k >= 0; k--) {
          dots[k] += 1;
          if (dots[k] > 6) {
            dots.splice(k, 1);
            continue;
          }
          P.p(57 - dots[k], 43, '#a571ff');
        }
        // bain : surface ondulée, résistance, bulles, afficheur
        for (let x = 92; x < 124; x++) P.p(x, 31 + ((x + (f >> 1)) % 6 === 0 ? 1 : 0), '#3f86b9');
        for (let x = 95; x < 121; x += 2) P.p(x, 43 - (x % 4 === 1 ? 1 : 0), f % 8 < 4 ? '#e6b84a' : '#a8742a');
        if (f % 3 === 0) bubbles.push({ x: 95 + ((R() * 26) | 0), y: 42 });
        for (let k = bubbles.length - 1; k >= 0; k--) {
          const b = bubbles[k];
          b.y -= 1;
          if (b.y < 33) {
            bubbles.splice(k, 1);
            continue;
          }
          P.p(b.x, b.y, '#7fb0d9');
        }
        P.t(temp.toFixed(1), 99, 22, '#63c24d');
        // banc : écoulement visible dans le hublot
        for (let x = 0; x < 26; x++) {
          if ((x + f) % 7 < 2) P.p(136 + x, 27 + ((x >> 2) % 3) * 2, '#5d5868');
        }
        // vapeur : bouffées qui montent et se dissipent, poussées par le ventilateur
        if (f % 2 === 0) puffs.push({ x: 147 + R() * 3, y: 15, age: 0, drift: 0.25 + R() * 0.3, wob: R() * 6 });
        for (let k = puffs.length - 1; k >= 0; k--) {
          const p = puffs[k];
          p.age += 1;
          p.y -= 0.6;
          p.x -= p.drift + p.age * 0.015;
          if (p.y < 0 || p.age > 24) {
            puffs.splice(k, 1);
            continue;
          }
          // la bouffée grossit et pâlit en montant
          const size = p.age < 5 ? 2 : p.age < 12 ? 3 : 4;
          const color = p.age < 8 ? '#e8e4dc' : p.age < 16 ? '#a9a4b0' : '#5d5868';
          const x = p.x + Math.sin((p.age + p.wob) * 0.6);
          P.r(x, p.y, size, size - 1, color);
          if (size > 2) P.r(x + 1, p.y - 1, size - 2, 1, color);
        }
        // ventilateur : pales en rotation (deux positions alternées)
        const cx = 181;
        const cy = 31;
        const diag = f % 2 === 0;
        for (let i = -5; i <= 5; i++) {
          if (diag) {
            P.p(cx + i, cy + i, '#bcb7c3');
            P.p(cx + i, cy - i, '#bcb7c3');
          } else {
            P.p(cx + i, cy, '#bcb7c3');
            P.p(cx, cy + i, '#bcb7c3');
          }
        }
        P.r(cx - 1, cy - 1, 3, 3, '#e8e4dc');
      },
    };
  };

  /* =====================================================================
     Bénévolat : plaine Minecraft, cycle jour/nuit (~80 s)
     ===================================================================== */
  SCENES.plain = () => {
    const R = FV.rng(42);
    const stars = Array.from({ length: 34 }, () => [(R() * W) | 0, (R() * 30) | 0, R()]);
    const hills = Array.from({ length: W }, (_, x) => 34 + Math.round(Math.sin(x / 19) * 3 + Math.sin(x / 7) * 1.4));
    const dirt = Array.from({ length: W * 16 }, () => R());
    const clouds = [[10, 8, 22], [80, 13, 16], [140, 6, 26], [200, 11, 18]];
    const tufts = [22, 58, 71, 97, 120, 133, 168, 184];
    const SKY = [
      ['#0b0a1a', '#1a1636'], ['#2b1f4d', '#7a4a6a'], ['#3b6fb3', '#7fb0e0'], ['#3b6fb3', '#7fb0e0'],
      ['#3b6fb3', '#8ab8e6'], ['#5a3f7a', '#d0805a'], ['#151330', '#2b2350'], ['#0b0a1a', '#1a1636'],
    ];
    const MOOD = {
      day: { hill: '#4f7f52', tuft: ['#7cc95f', '#5aa23c'], shade: null },
      dusk: { hill: '#3c4a3a', tuft: ['#6a9a52', '#4d7a36'], shade: 'rgb(40 10 40 / 18%)' },
      night: { hill: '#1c2a26', tuft: ['#3d5a3a', '#2e4a2c'], shade: 'rgb(8 6 28 / 50%)' },
    };
    const skies = SKY.map(([top, bottom]) =>
      layer((P) => {
        P.r(0, 0, W, H, top);
        P.r(0, 22, W, 20, bottom);
        for (let x = 0; x < W; x += 2) {
          P.p(x + ((x >> 1) % 2), 21, bottom);
          P.p(x + 1 - ((x >> 1) % 2), 20, bottom);
        }
      })
    );
    const lands = {};
    Object.keys(MOOD).forEach((k) => {
      lands[k] = layer((P, ctx) => {
        for (let x = 0; x < W; x++) P.r(x, hills[x], 1, 46 - hills[x], MOOD[k].hill);
        P.r(0, 46, W, 3, '#5aa23c');
        for (let x = 0; x < W; x += 3) P.p(x, 46, '#7cc95f');
        for (let x = 0; x < W; x += 2) if (dirt[x] > 0.5) P.p(x, 49, '#5aa23c');
        P.r(0, 49, W, 15, '#7a5232');
        for (let i = 0; i < W * 15; i += 7) {
          const x = i % W;
          const y = 49 + ((i / W) | 0);
          if (dirt[i] > 0.72) P.p(x, y, '#5a3a22');
          else if (dirt[i] < 0.08) P.p(x, y, '#8e6440');
        }
        for (let x = 0; x < W; x += 16) P.r(x, 49, 1, 15, '#6b4729');
        const tree = (x, h) => {
          P.r(x + 4, 46 - h, 3, h, '#6a4a2a');
          P.r(x, 46 - h - 9, 11, 10, '#2f6b2c');
          P.r(x - 2, 46 - h - 6, 15, 5, '#2f6b2c');
          P.p(x + 2, 46 - h - 7, '#3f8a3a');
          P.p(x + 7, 46 - h - 4, '#3f8a3a');
          P.p(x + 9, 46 - h - 8, '#3f8a3a');
        };
        tree(34, 9);
        tree(150, 11);
        P.r(104, 38, 2, 8, '#6a4a2a');
        // assombrit seulement ce qui est dessiné (collines, sol, arbres), pas le ciel
        if (MOOD[k].shade) {
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = MOOD[k].shade;
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'source-over';
        }
      });
    });
    // halo de torche en cercle « pixel »
    const halo = layer((P, ctx) => {
      [[10, 'rgb(230 184 74 / 7%)'], [6, 'rgb(230 184 74 / 9%)']].forEach(([r, c]) => {
        ctx.fillStyle = c;
        for (let dy = -r; dy <= r; dy++) {
          const hw = Math.round(Math.sqrt(r * r - dy * dy));
          ctx.fillRect(105 - hw, 37 + dy, hw * 2, 1);
        }
      });
    });
    const N = 640; // cycle complet ≈ 80 s à 8 images/s

    return {
      fps: 8,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        const ph = (f % N) / N;
        const step = Math.floor(ph * 8);
        const night = step === 0 || step === 6 || step === 7;
        const dusk = step === 1 || step === 5;
        const mood = night ? 'night' : dusk ? 'dusk' : 'day';
        ctx.drawImage(skies[step], 0, 0);
        if (night) {
          ctx.fillStyle = '#8a8592';
          stars.forEach(([x, y, k]) => {
            if (((f + k * 40) | 0) % 40 > 3) ctx.fillRect(x, y, 1, 1);
          });
        }
        const day = ph >= 0.125 && ph < 0.75;
        const a = day ? (ph - 0.125) / 0.625 : Math.min(((ph + 0.25) % 1) / 0.375, 1);
        const sx = 8 + a * 170;
        const sy = 28 - Math.sin(a * Math.PI) * 22;
        if (day) {
          P.r(sx - 1, sy - 1, 9, 9, '#f3d77a');
          P.r(sx, sy, 7, 7, '#fff1b0');
        } else {
          P.r(sx, sy, 6, 6, '#d8d6e8');
          P.p(sx + 1, sy + 2, '#a9a6c0');
          P.p(sx + 4, sy + 3, '#a9a6c0');
        }
        ctx.fillStyle = night ? '#3a3654' : dusk ? '#e0b8c0' : '#f2f0f4';
        clouds.forEach(([cx, cy, cw]) => {
          const x = ((((cx - f * 0.25) % 230) + 230) % 230) - 30;
          ctx.fillRect(x | 0, cy, cw, 4);
          ctx.fillRect((x | 0) + 4, cy - 2, cw - 8, 2);
        });
        ctx.drawImage(lands[mood], 0, 0);
        const [t1, t2] = MOOD[mood].tuft;
        tufts.forEach((x, i) => {
          const s = ((f >> 2) + i) % 4 === 0 ? 1 : 0;
          P.p(x + s, 44, t1);
          P.p(x, 45, t2);
          P.p(x + 2, 45, t2);
        });
        if (night) ctx.drawImage(halo, 0, 0);
        P.r(104, 36 - (f % 2), 2, 2, night ? '#f3c04a' : '#c08a3a');
        if (night) P.p(104 + (f % 2), 35 - (f % 2), '#e44b3f');
      },
    };
  };

  /* =====================================================================
     Moteur
     ===================================================================== */
  const live = [];
  let raf = 0;
  let statStart = 0;
  let statMs = 0;
  let statDraws = 0;
  const stats = { msPerSecond: 0, drawsPerSecond: 0 };

  function running(s) {
    return s.visible && s.win.classList.contains('is-open') && !s.win.classList.contains('is-min');
  }

  function loop(now) {
    raf = 0;
    if (document.hidden) return;
    let any = false;
    let nextDue = Infinity;
    const t0 = performance.now();
    for (const s of live) {
      if (!running(s)) continue;
      any = true;
      const period = 1000 / s.scene.fps;
      nextDue = Math.min(nextDue, (now - s.last >= period - 2 ? now : s.last) + period);
      if (now - s.last >= period - 2) {
        s.last = now;
        s.frame++;
        s.count++;
        s.scene.draw(s.ctx, s.frame);
        statDraws++;
      }
    }
    statMs += performance.now() - t0;
    if (now - statStart >= 1000) {
      // statistiques sur la dernière seconde (affichées dans la barre d'état)
      live.forEach((s) => {
        if (s.fpsEl) s.fpsEl.textContent = (running(s) ? s.count : 0) + ' I/S';
        s.count = 0;
      });
      stats.msPerSecond = statMs;
      stats.drawsPerSecond = statDraws;
      statMs = 0;
      statDraws = 0;
      statStart = now;
    }
    // on dort jusqu'à la prochaine image utile (≈10 réveils/s au lieu de 60)
    if (any) {
      raf = -1;
      sleeper = setTimeout(() => {
        sleeper = 0;
        raf = requestAnimationFrame(loop);
      }, Math.max(0, nextDue - performance.now() - 4));
    }
  }

  let sleeper = 0;

  function wake() {
    if (FV.REDUCED || document.hidden || !live.some(running)) return;
    if (sleeper) {
      // une fenêtre vient de s'ouvrir : on n'attend pas la fin du sommeil
      clearTimeout(sleeper);
      sleeper = 0;
      raf = 0;
    }
    if (raf) return;
    statStart = performance.now();
    raf = requestAnimationFrame(loop);
  }

  FV.scenes = {
    stats,
    init() {
      FV.$$('canvas[data-scene]').forEach((canvas) => {
        const make = SCENES[canvas.dataset.scene];
        if (!make) return;
        const ctx = canvas.getContext('2d');
        const scene = make();
        const win = canvas.closest('.win');
        const s = { canvas, ctx, scene, win, frame: 0, last: 0, count: 0, visible: false, fpsEl: win.querySelector('[data-fps]') };
        scene.draw(ctx, 0); // image fixe immédiate (sert aussi si les animations sont réduites)
        live.push(s);
        new IntersectionObserver((entries) => {
          s.visible = entries[entries.length - 1].isIntersecting;
          wake();
        }).observe(canvas);
      });
      document.addEventListener('visibilitychange', wake);
      // appelé par le gestionnaire de fenêtres à chaque ouverture / réduction / fermeture
      FV.onWindowChange = wake;
    },
  };
})(window.FV);
