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
     Palette commune des scènes du sprint 4
     ===================================================================== */
  const C = {
    bg: '#131217',
    panel: '#2c2934',
    screen: '#0b0a0e',
    line: '#3a3642',
    dim: '#6c6876',
    soft: '#8a8592',
    text: '#e8e4dc',
    violet: '#a571ff',
    green: '#63c24d',
    red: '#e44b3f',
    amber: '#e6b84a',
  };
  const textWidth = (str) => str.length * 4 - 1;

  /* =====================================================================
     Recherche textuelle : Naïf contre Boyer-Moore-Horspool
     ===================================================================== */
  SCENES.recherche = () => {
    const TEXT = 'UN CHAT CHERCHE SON CHEMIN PRES DU CHIEN';
    const PAT = 'CHIEN';
    const n = TEXT.length;
    const m = PAT.length;
    const X0 = 16;
    // suite des comparaisons de chaque algorithme : [décalage, indice dans le motif, égal ?]
    const naive = [];
    for (let s = 0; s <= n - m; s++) {
      let j = 0;
      while (j < m) {
        const ok = TEXT[s + j] === PAT[j];
        naive.push([s, j, ok]);
        if (!ok) break;
        j++;
      }
      if (j === m) break;
    }
    const shift = {};
    for (let j = 0; j < m - 1; j++) shift[PAT[j]] = m - 1 - j;
    const bmh = [];
    for (let s = 0; s <= n - m;) {
      let j = m - 1;
      while (j >= 0) {
        const ok = TEXT[s + j] === PAT[j];
        bmh.push([s, j, ok]);
        if (!ok) break;
        j--;
      }
      if (j < 0) break;
      s += shift[TEXT[s + m - 1]] || m;
    }
    const CYCLE = Math.max(naive.length, bmh.length) + 32;

    const bg = layer((P) => {
      P.r(0, 0, W, H, C.bg);
      P.r(4, 30, W - 8, 1, C.line);
    });

    // libellé à droite, à côté du compteur (le coin haut gauche porte l'étiquette de la scène)
    const row = (P, steps, k, y, name) => {
      const done = k >= steps.length;
      const [s, j, ok] = steps[Math.min(k, steps.length - 1)];
      if (done) {
        P.r(X0 + s * 4 - 1, y + 7, m * 4 + 1, 7, 'rgb(99 194 77 / 22%)');
      } else {
        const cx = X0 + (s + j) * 4 - 1;
        const col = ok ? 'rgb(99 194 77 / 35%)' : 'rgb(228 75 63 / 40%)';
        P.r(cx, y + 7, 5, 7, col);
        P.r(cx, y + 15, 5, 7, col);
      }
      for (let i = 0; i < n; i++) {
        const hit = done && i >= s && i < s + m;
        P.t(TEXT[i], X0 + i * 4, y + 8, hit ? C.green : C.soft);
      }
      for (let i = 0; i < m; i++) P.t(PAT[i], X0 + (s + i) * 4, y + 16, done ? C.green : C.text);
      const count = Math.min(k + 1, steps.length);
      const label = done ? 'TROUVE ' + count : String(count);
      const lx = W - 16 - textWidth(label);
      P.t(label, lx, y, done ? C.green : C.violet);
      P.t(name, lx - 6 - textWidth(name), y, C.dim);
    };

    return {
      fps: 8,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        ctx.drawImage(bg, 0, 0);
        const k = f % CYCLE;
        row(P, naive, k, 2, 'NAIF');
        row(P, bmh, k, 34, 'BOYER MOORE HORSPOOL');
      },
    };
  };

  /* =====================================================================
     devis-api : client → Express → PostgreSQL, cycle de vie du devis
     ===================================================================== */
  SCENES.devis = () => {
    // statut : 0 brouillon, 1 envoyé, 2 signé, 3 refusé
    const STEPS = [
      { req: 'POST /DEVIS', code: '201', status: 0 },
      { req: 'POST /DEVIS/1/LIGNES', code: '201', status: 0, lines: 1 },
      { req: 'POST /DEVIS/1/LIGNES', code: '201', status: 0, lines: 2 },
      { req: 'POST /DEVIS/1/STATUT', code: '200', status: 1 },
      { req: 'POST /DEVIS/1/LIGNES', code: '409', status: 1 },
      { req: 'POST /DEVIS/1/STATUT', code: '200', status: 'end' },
    ];
    const STEP = 40; // images par requête
    const BOXES = [
      { name: 'BROUILLON', x: 4, y: 45, color: C.soft },
      { name: 'ENVOYE', x: 52, y: 45, color: C.amber },
      { name: 'SIGNE', x: 94, y: 39, color: C.green },
      { name: 'REFUSE', x: 94, y: 51, color: C.red },
    ];
    BOXES.forEach((b) => (b.w = textWidth(b.name) + 6));

    const bg = layer((P) => {
      P.r(0, 0, W, H, C.bg);
      // client (portable)
      P.r(6, 8, 20, 13, C.panel);
      P.r(8, 10, 16, 9, C.screen);
      P.r(3, 21, 26, 3, C.line);
      // Express
      P.r(66, 6, 46, 22, C.panel);
      P.r(67, 7, 44, 20, '#1c1a22');
      P.t('EXPRESS', 75, 10, C.text);
      P.t('TS', 85, 18, C.violet);
      // PostgreSQL (cylindre)
      P.r(156, 7, 24, 20, '#2a4a6a');
      P.r(158, 5, 20, 2, '#3a6a9a');
      P.r(156, 27, 24, 1, '#1d3550');
      for (let y = 13; y < 27; y += 6) P.r(156, y, 24, 1, '#1d3550');
      P.t('PG', 164, 15, C.text);
      // liaisons
      P.r(30, 17, 35, 1, C.line);
      P.r(113, 17, 42, 1, C.line);
      // flèches du cycle de vie
      P.r(48, 47, 3, 1, C.line);
      P.r(87, 47, 4, 1, C.line);
      P.r(90, 41, 1, 13, C.line);
      P.r(90, 41, 3, 1, C.line);
      P.r(90, 53, 3, 1, C.line);
      // le devis
      P.r(146, 34, 40, 28, '#1c1a22');
      P.r(146, 34, 40, 1, C.line);
      P.t('DEVIS 1', 150, 37, C.soft);
    });

    let cycle = 0;
    let lastLoop = -1;
    return {
      fps: 10,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        ctx.drawImage(bg, 0, 0);
        const total = STEPS.length * STEP;
        const loop = Math.floor(f / total);
        if (loop !== lastLoop) {
          lastLoop = loop;
          cycle++;
        }
        const t = f % total;
        const i = Math.floor(t / STEP);
        const st = STEPS[i];
        const u = t % STEP;
        const finalStatus = cycle % 2 ? 2 : 3;
        const resolve = (s) => (s === 'end' ? finalStatus : s);
        // la requête part à u = 0, arrive à la base vers u = 12, la réponse revient vers u = 24
        const answered = u >= 24;
        let status = 0;
        let lines = 0;
        STEPS.forEach((s, k) => {
          if (k < i || (k === i && answered)) {
            if (s.code !== '409') status = resolve(s.status);
            if (s.lines) lines = s.lines;
          }
        });
        // paquet en transit (aller violet, retour vert ou rouge)
        const ok = st.code !== '409';
        if (u < 24) {
          const back = u >= 12;
          const d = back ? (24 - u) / 12 : u / 12;
          const x = 30 + d * 125;
          if (x < 66 || x > 112) P.r(x - 1, 16, 3, 3, back ? (ok ? C.green : C.red) : C.violet);
          else P.r(66, 6, 46, 1, C.violet);
          if (back && x > 112) P.r(156, 5, 24, 1, C.violet);
        }
        // requête affichée sous le client, réponse ensuite
        P.t('>', 4, 31, C.violet);
        P.t(st.req, 10, 31, C.text);
        if (answered) P.t(st.code, 10 + textWidth(st.req) + 5, 31, ok ? C.green : C.red);
        // écran du client
        P.r(10, 12, 12, 1, answered ? (ok ? C.green : C.red) : C.dim);
        P.r(10, 15, 8, 1, C.dim);
        // cycle de vie
        BOXES.forEach((b, k) => {
          const on = k === status;
          P.r(b.x, b.y - 2, b.w, 9, on ? b.color : C.line);
          P.r(b.x + 1, b.y - 1, b.w - 2, 7, on ? '#1c1a22' : C.bg);
          P.t(b.name, b.x + 3, b.y, on ? b.color : C.dim);
        });
        // lignes du devis et total
        for (let l = 0; l < lines; l++) {
          P.r(150, 44 + l * 4, 18 - l * 4, 1, C.soft);
          P.r(176, 44 + l * 4, 6, 1, C.soft);
        }
        if (lines) {
          P.r(150, 54, 32, 1, C.line);
          P.r(170, 57, 12, 1, C.text);
        }
        if (status >= 2) {
          // tampon signé / refusé
          const col = status === 2 ? C.green : C.red;
          P.r(150, 56, 12, 4, col);
          P.r(151, 57, 10, 2, '#1c1a22');
        }
      },
    };
  };

  /* =====================================================================
     TVA Dashboard : ligne de commande → timeline
     ===================================================================== */
  SCENES.tva = () => {
    const AMBER = '#f5972d';
    const GOLD = '#ffd966';
    const TL = '#397c1b';
    const CMDS = ['TODO RENDU @VENDREDI', 'LINK ADD AMO', 'ANOMALY NOW', 'DONE 1'];
    const AFTER = 34; // images d'effet après chaque commande
    const plan = [];
    let t0 = 8;
    CMDS.forEach((c) => {
      plan.push({ c, start: t0, exec: t0 + c.length + 6 });
      t0 += c.length + 6 + AFTER;
    });
    const CYCLE = t0 + 24;
    const LINKS = ['GH', 'YT', 'MDN', 'DOC'];

    const bg = layer((P) => {
      P.r(0, 0, W, H, '#17171a');
      P.r(0, 0, W, 9, '#1f1e22');
      // en-tête à droite : le coin haut gauche porte l'étiquette de la scène
      P.t('TVA', 146, 2, AMBER);
      // panneaux
      P.r(2, 11, 54, 39, '#1c1b1f');
      P.r(60, 11, 130, 39, '#1c1b1f');
      P.t('LINKS', 5, 13, C.dim);
      P.t('MONITOR', 63, 13, C.dim);
      // ligne de commande
      P.r(2, 52, 188, 11, '#0f0f11');
      P.t('>', 5, 55, AMBER);
      // timeline : ligne principale
      P.r(62, 32, 126, 1, TL);
      for (let x = 62; x < 188; x += 6) P.p(x, 33, '#24480f');
    });

    const branch = (P, x, dir, len, color, end) => {
      for (let k = 1; k <= 5; k++) P.p(x + k, 32 + dir * k, color);
      if (len > 0) P.r(x + 6, 32 + dir * 6, len, 1, color);
      if (end) P.r(x + 6 + len, 32 + dir * 6 - 1, 3, 3, end);
    };

    return {
      fps: 10,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        ctx.drawImage(bg, 0, 0);
        const t = f % CYCLE;
        const [todo, link, anomaly, done] = plan;
        // horloge réelle
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        P.t(hh + (f % 10 < 5 ? ':' : ' ') + mm, 168, 2, GOLD);
        // anomalie en cours ?
        const a = t - anomaly.exec;
        const alert = a >= 0 && a < AFTER;
        if (alert && (f >> 1) % 2) {
          P.r(60, 11, 130, 1, C.red);
          P.r(60, 49, 130, 1, C.red);
        }
        const status = alert ? 'VARIANCE' : 'SECURE';
        P.t(status, 140 - textWidth(status), 2, alert ? C.red : '#5aa23c');
        // Netlinks
        const links = t >= link.exec ? [...LINKS, 'AMO'] : LINKS;
        links.forEach((code, k) => {
          const y = 20 + k * 6;
          const fresh = code === 'AMO' && t - link.exec < 12;
          if (fresh) P.r(3, y - 1, 52, 7, '#3a2a14');
          P.t(code, 5, y, AMBER);
          P.r(20, y + 2, 28 - k * 3, 1, C.line);
        });
        // index lumineux qui parcourt la ligne
        const ix = 62 + ((f * 2) % 124);
        P.r(ix, 31, 3, 3, '#7fd05a');
        // branche « mission » (tâche avec échéance), puis tâche terminée
        if (t >= todo.exec) {
          const grow = Math.min(36, (t - todo.exec) * 3);
          if (t >= done.exec) {
            for (let x = 0; x < 36; x += 2) P.p(102 + x, 26, GOLD);
            P.t('X', 140, 24, GOLD);
          } else branch(P, 96, -1, grow, AMBER, grow >= 36 ? AMBER : null);
        }
        // anomalie : branche rouge qui pousse, puis élaguée
        if (alert) {
          const grow = Math.min(30, a * 3);
          if (a < 22 || f % 2) branch(P, 136, 1, grow, C.red, null);
        }
        // saisie en cours
        const cur = plan.find((p) => t >= p.start && t < p.exec);
        let typed = '';
        if (cur) typed = cur.c.slice(0, Math.min(cur.c.length, t - cur.start));
        P.t(typed, 11, 55, C.text);
        if (f % 8 < 4) P.r(11 + typed.length * 4, 59, 3, 1, AMBER);
      },
    };
  };

  /* =====================================================================
     CC Radio : diffuseur → ondes rednet → clients et haut-parleurs
     ===================================================================== */
  SCENES.rsmp = () => {
    const R = FV.rng(7);
    const OX = 13;
    const OY = 30;
    const CLIENTS = [112, 142, 172];
    const NOTE_COLORS = [C.green, C.violet, C.amber];
    const waves = [];
    const notes = [];
    const flash = [0, 0, 0];

    const block = (P, x, y, w, h, frame, inner) => {
      P.r(x, y, w, h, frame);
      P.r(x + 2, y + 2, w - 4, h - 4, inner);
    };
    const bg = layer((P) => {
      // mur de pierre
      P.r(0, 0, W, H, '#1a1920');
      for (let y = 0; y < 52; y += 8) {
        for (let x = (y / 8) % 2 ? -4 : 0; x < W; x += 8) {
          P.r(x, y, 8, 8, R() > 0.5 ? '#1e1d25' : '#1b1a21');
          P.r(x, y, 8, 1, '#16151b');
          P.r(x, y, 1, 8, '#16151b');
        }
      }
      // plancher
      P.r(0, 52, W, 12, '#5a3e24');
      for (let x = 0; x < W; x += 16) P.r(x, 52, 1, 12, '#46301c');
      P.r(0, 52, W, 1, '#7a5634');
      P.r(0, 58, W, 1, '#46301c');
      // diffuseur : ordinateur avancé + modem + écran
      block(P, 4, 36, 16, 16, '#c9a43a', C.screen);
      P.r(10, 30, 6, 6, '#9aa0aa');
      P.r(12, 28, 2, 2, '#6c707a');
      block(P, 24, 22, 40, 30, '#c9a43a', C.screen);
      P.t('RSMP', 28, 26, C.violet);
      // clients : haut-parleur posé sur un ordinateur
      CLIENTS.forEach((x) => {
        block(P, x, 40, 12, 12, '#c9a43a', C.screen);
        block(P, x, 28, 12, 12, '#4a3220', '#2a1c12');
        for (let k = 0; k < 3; k++) P.r(x + 3, 31 + k * 3, 6, 1, '#140d08');
      });
    });

    return {
      fps: 8,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        ctx.drawImage(bg, 0, 0);
        // écran du diffuseur : liste de lecture et progression
        const track = Math.floor(f / 64) % 3;
        for (let k = 0; k < 3; k++) {
          const y = 33 + k * 4;
          if (k === track) P.r(28, y - 1, 32, 3, '#2a2140');
          P.r(30, y, 18 - k * 3, 1, k === track ? C.text : C.dim);
        }
        P.r(28, 47, 32, 1, C.line);
        P.r(28, 47, Math.round(((f % 64) / 63) * 32), 1, C.violet);
        P.t('ON', 50, 26, f % 8 < 4 ? C.red : '#5a2a24');
        P.r(8, 40, 8, 1, C.green);
        P.r(8, 43, 5, 1, C.dim);
        // le modem émet une onde à intervalle régulier
        if (f % 10 === 0) waves.push({ r: 4, hit: [false, false, false] });
        P.p(12, 28, f % 10 < 2 ? C.violet : '#4a3a6a');
        for (let k = waves.length - 1; k >= 0; k--) {
          const w = waves[k];
          w.r += 6;
          if (w.r > 175) {
            waves.splice(k, 1);
            continue;
          }
          ctx.fillStyle = w.r < 90 ? '#6a4fa0' : '#43345e';
          const step = 1.6 / w.r;
          for (let ang = -0.75; ang <= 0.3; ang += step) {
            const x = OX + Math.cos(ang) * w.r;
            const y = OY + Math.sin(ang) * w.r;
            // pas sur l'écran du diffuseur
            if (y > 2 && y < 51 && !(x >= 22 && x < 66 && y >= 20)) ctx.fillRect(x | 0, y | 0, 1, 1);
          }
          CLIENTS.forEach((cx, i) => {
            if (!w.hit[i] && w.r >= cx - OX) {
              w.hit[i] = true;
              flash[i] = 2;
              if (R() > 0.35) notes.push({ x: cx + 3 + ((R() * 6) | 0), y: 26, c: NOTE_COLORS[(R() * 3) | 0], age: 0 });
            }
          });
        }
        // clients : écran qui reçoit, notes qui montent
        CLIENTS.forEach((cx, i) => {
          P.r(cx + 3, 45, 6, 1, flash[i]-- > 0 ? C.green : '#1d3a1a');
        });
        for (let k = notes.length - 1; k >= 0; k--) {
          const n = notes[k];
          n.age++;
          n.y -= 1;
          if (n.age > 18) {
            notes.splice(k, 1);
            continue;
          }
          const x = n.x + Math.round(Math.sin(n.age / 3));
          P.r(x, n.y, 2, 2, n.c);
          P.r(x + 1, n.y - 4, 1, 4, n.c);
          P.p(x + 2, n.y - 4, n.c);
        }
      },
    };
  };

  /* =====================================================================
     UnderCore (Unity) : zone → porte → combat au tour par tour
     ===================================================================== */
  // personnage original 7×10 : cheveux, visage, écharpe violette
  function hero(P, x, y, step, scale = 1) {
    const s = scale;
    const px = (dx, dy, w, h, c) => P.r(x + dx * s, y + dy * s, w * s, h * s, c);
    px(1, 0, 5, 2, '#3a2a4a');
    px(1, 2, 5, 3, '#e0c3a0');
    px(2, 3, 1, 1, '#16151a');
    px(4, 3, 1, 1, '#16151a');
    px(1, 5, 5, 1, C.violet);
    px(1, 6, 5, 2, '#4a6a9a');
    px(0, 6, 1, 2, '#e0c3a0');
    px(6, 6, 1, 2, '#e0c3a0');
    px(step ? 1 : 2, 8, 2, 2, '#2c2934');
    px(step ? 4 : 3, 8, 2, 2, '#2c2934');
  }

  SCENES.unity = () => {
    const EXPLORE = 72;
    const WIPE = 6;
    const FIGHT = 80;
    const CYCLE = EXPLORE + WIPE + FIGHT + WIPE;
    const room = layer((P) => {
      P.r(0, 0, W, H, '#1d1b24');
      for (let y = 12; y < H; y += 8) for (let x = (y / 4) % 2 ? 4 : 0; x < W; x += 8) P.r(x, y, 7, 7, '#221f2b');
      P.r(0, 0, W, 12, '#2c2836');
      for (let x = 0; x < W; x += 12) P.r(x, 4, 1, 4, '#221f2b');
      P.r(0, 8, W, 1, '#221f2b');
      P.r(0, 11, W, 1, '#3a3546');
      // porte à droite
      P.r(178, 18, 12, 24, '#5a3e24');
      P.r(180, 20, 8, 22, '#3a2716');
      P.p(186, 31, C.amber);
      // personnage non joueur
      P.r(98, 16, 7, 2, '#7a4a3a');
      P.r(98, 18, 7, 3, '#d0b090');
      P.r(98, 21, 7, 4, '#3f7a4a');
      P.r(99, 25, 2, 2, '#2c2934');
      P.r(102, 25, 2, 2, '#2c2934');
    });
    const arena = layer((P) => {
      P.r(0, 0, W, H, '#0b0a0e');
      P.r(54, 18, 84, 28, '#e8e4dc');
      P.r(55, 19, 82, 26, '#0b0a0e');
      P.t('ATTAQUE', 22, 55, C.text);
      P.t('OBJET', 82, 55, C.dim);
      P.t('FUIR', 132, 55, C.dim);
    });
    const bar = (P, x, y, v, color) => {
      P.r(x, y, 30, 3, '#3a1a1a');
      P.r(x, y, Math.max(0, Math.round(v * 30)), 3, color);
    };

    return {
      fps: 8,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        const t = f % CYCLE;
        if (t < EXPLORE) {
          ctx.drawImage(room, 0, 0);
          // marche jusqu'au PNJ, courte discussion, puis jusqu'à la porte
          let x;
          let talking = false;
          if (t < 26) x = 6 + t * 3;
          else if (t < 46) {
            x = 84;
            talking = true;
          } else x = Math.min(170, 84 + (t - 46) * 4);
          hero(P, x, 30, !talking && (t >> 1) % 2);
          if (talking) {
            P.p(101, 12, C.amber);
            P.r(101, 9, 1, 2, C.amber);
            P.r(20, 46, 150, 15, '#e8e4dc');
            P.r(21, 47, 148, 13, '#0b0a0e');
            const msg = 'LA PORTE MENE AU COEUR';
            P.t(msg.slice(0, Math.min(msg.length, (t - 26) * 2)), 26, 51, C.text);
          }
          return;
        }
        const w = t - EXPLORE;
        if (w < WIPE || t >= CYCLE - WIPE) {
          // transition : bandes qui recouvrent l'écran
          const k = w < WIPE ? w : t - (CYCLE - WIPE);
          ctx.fillStyle = '#0b0a0e';
          for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, k + 1);
          return;
        }
        // combat : 3 manches (attaque du joueur, riposte de l'ennemi)
        ctx.drawImage(arena, 0, 0);
        const c = w - WIPE;
        const round = Math.min(2, Math.floor(c / 24));
        const r = c - round * 24;
        const playerTurn = r < 12;
        const enemyHp = Math.max(0, 1 - (round + (r >= 8 ? 1 : 0)) * 0.34);
        const heroHp = 1 - (round + (round < 2 && r >= 20 ? 1 : 0)) * 0.18;
        const dead = enemyHp <= 0;
        // en-tête à droite et barres au-dessus de l'arène (le coin haut gauche porte l'étiquette)
        const label = dead ? 'VICTOIRE' : playerTurn ? 'TOUR JOUEUR' : 'TOUR ENNEMI';
        P.t(label, 188 - textWidth(label), 4, dead ? C.green : playerTurn ? C.violet : C.red);
        bar(P, 58, 12, heroHp, C.green);
        bar(P, 104, 12, enemyHp, C.red);
        if (playerTurn && !dead && r < 8) P.t('>', 16, 55, f % 4 < 2 ? C.amber : C.bg);
        // ennemi original : un noyau de cristal flottant
        if (!dead || f % 2) {
          const ey = 22 + Math.round(Math.sin(f / 3) * 2);
          const shake = playerTurn && r >= 8 && r < 11 ? ((f % 2) * 2 - 1) * 2 : 0;
          const ex = 110 + shake;
          for (let k = 0; k < 6; k++) P.r(ex - k, ey + k, 2 * k + 1, 1, '#6a4fa0');
          for (let k = 0; k < 6; k++) P.r(ex - 5 + k, ey + 6 + k, 11 - 2 * k, 1, '#4a3870');
          P.r(ex - 1, ey + 5, 3, 3, f % 6 < 3 ? C.violet : '#e0d0ff');
        }
        // attaque du joueur : entailles sur l'ennemi
        if (playerTurn && r >= 6 && r < 9) {
          for (let k = 0; k < 10; k++) P.p(104 + k, 22 + k, '#ffffff');
          for (let k = 0; k < 8; k++) P.p(116 - k, 24 + k, '#ffffff');
        }
        // héros dans la zone de combat
        const hurt = !playerTurn && !dead && r >= 20 && r < 22;
        if (!hurt || f % 2) hero(P, 70, 26, 0, 1);
        // riposte : projectiles vers le héros
        if (!playerTurn && !dead && r < 20) {
          for (let k = 0; k < 3; k++) {
            const d = (r - 12) * 5 - k * 8;
            if (d > 0 && d < 40) P.r(108 - d, 26 + k * 5, 3, 3, C.red);
          }
        }
      },
    };
  };

  /* =====================================================================
     TaleUnder (Pygame) : exploration + architecture MVC
     ===================================================================== */
  SCENES.pygame = () => {
    const R = FV.rng(11);
    const WW = 288; // largeur du monde (répété en boucle)
    const VIEW = 136;
    const POIS = [70, 190]; // points d'intérêt
    const MSGS = ['PANNEAU : VILLAGE AU NORD', 'PANNEAU : FORET PROFONDE'];
    const world = (() => {
      const c = document.createElement('canvas');
      c.width = WW;
      c.height = H;
      const P = FV.painter(c.getContext('2d'));
      P.r(0, 0, WW, H, '#2f5530');
      for (let i = 0; i < 260; i++) P.p((R() * WW) | 0, (R() * H) | 0, R() > 0.5 ? '#3a6638' : '#284a2a');
      P.r(0, 34, WW, 10, '#8e7a52');
      for (let x = 0; x < WW; x += 3) P.p(x, 34 + ((x * 7) % 10), '#7a6844');
      const tree = (x, y) => {
        P.r(x, y, 12, 10, '#1f4a24');
        P.r(x + 2, y - 2, 8, 2, '#1f4a24');
        P.p(x + 3, y + 2, '#2f6a32');
        P.p(x + 7, y + 4, '#2f6a32');
        P.r(x + 5, y + 10, 2, 3, '#5a3e24');
      };
      [[10, 8], [40, 14], [110, 6], [150, 12], [226, 8], [262, 14], [30, 50], [130, 50], [210, 52]].forEach(([x, y]) => tree(x, y));
      // panneaux / points d'intérêt
      POIS.forEach((x) => {
        P.r(x, 24, 8, 6, '#7a5634');
        P.r(x + 1, 25, 6, 1, '#5a3e24');
        P.r(x + 3, 30, 2, 4, '#5a3e24');
      });
      return c;
    })();
    const panel = layer((P) => {
      P.r(136, 0, 56, H, C.bg);
      P.r(136, 0, 1, H, C.line);
      [[4, 'CTRL'], [25, 'MODELE'], [46, 'VUE']].forEach(([y, name]) => {
        P.r(141, y, 48, 15, C.line);
        P.r(142, y + 1, 46, 13, '#1c1a22');
        P.t(name, 144, y + 2, C.soft);
      });
      P.r(164, 19, 1, 6, C.line);
      P.r(164, 40, 1, 6, C.line);
    });
    let cam = 0;
    let talk = 0;
    let talkMsg = '';
    let pulse = 0;
    let event = ['', '', ''];

    return {
      fps: 8,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        // contrôleur → modèle → vue à chaque action
        if (talk > 0) {
          talk--;
          if (talk === 30 || talk === 1) {
            pulse = 3;
            event = ['TOUCHE Z', talk === 1 ? 'FIN' : 'DIALOGUE', 'BOITE'];
          }
        } else {
          cam = (cam + 1) % WW;
          const heroX = (cam + 60) % WW;
          const poi = POIS.findIndex((x) => Math.abs(x + 2 - heroX) < 1);
          if (poi >= 0) {
            talk = 34;
            talkMsg = MSGS[poi];
          } else if (f % 4 === 0) {
            pulse = 3;
            event = ['TOUCHE >', 'POS X ' + heroX, 'DESSIN'];
          }
        }
        ctx.drawImage(world, -cam, 0);
        ctx.drawImage(world, WW - cam, 0);
        hero(P, 60, 31, talk === 0 && (f >> 1) % 2);
        if (talk > 0) {
          if (f % 4 < 3) P.t('!', 63, 23, C.amber);
          P.r(4, 46, 128, 15, '#e8e4dc');
          P.r(5, 47, 126, 13, '#0b0a0e');
          P.t(talkMsg.slice(0, Math.min(talkMsg.length, (34 - talk) * 2)), 9, 51, C.text);
        }
        ctx.drawImage(panel, 0, 0);
        // l'impulsion descend d'une case par image
        const lit = 3 - pulse;
        [4, 25, 46].forEach((y, k) => {
          const on = pulse > 0 && k === lit;
          if (on) {
            P.r(141, y, 48, 1, k === 2 ? C.green : C.violet);
            P.r(141, y + 14, 48, 1, k === 2 ? C.green : C.violet);
          }
          P.t(event[k], 144, y + 8, on ? C.text : C.dim);
        });
        if (pulse > 0) pulse--;
      },
    };
  };

  /* =====================================================================
     Ce portfolio : le bureau, dans une fenêtre du bureau (mise en abyme)
     ===================================================================== */
  SCENES.folio = () => {
    const R = FV.rng(5);
    const WIN = { x: 58, y: 6, w: 102, h: 43 };
    const BODY = { x: 59, y: 13, w: 99, h: 33 };
    const ICONS = [[6, 6, C.violet], [6, 20, C.green], [6, 34, C.amber]];
    const prev = document.createElement('canvas');
    prev.width = W;
    prev.height = H;
    const pctx = prev.getContext('2d');
    const desk = layer((P) => {
      P.r(0, 0, W, H, '#0e0d11');
      for (let i = 0; i < 180; i++) {
        const x = (R() * W) | 0;
        const y = (R() * 56) | 0;
        P.p(x, y, R() > 0.7 ? '#3a2d52' : '#221c30');
      }
      ICONS.forEach(([x, y, c]) => {
        P.r(x, y, 9, 9, C.panel);
        P.r(x + 2, y + 2, 5, 5, c);
        P.r(x - 1, y + 11, 11, 1, C.dim);
      });
      P.r(0, 56, W, 8, '#16151a');
      P.r(0, 56, W, 1, C.line);
      P.r(3, 59, 3, 3, C.violet);
      P.r(176, 59, 13, 2, C.dim);
    });
    // trajet du curseur : vers l'icône, double clic, attente, vers la croix, clic
    const KEYS = [
      [0, 140, 44], [16, 11, 25], [20, 11, 25], [70, 120, 30], [84, 155, 9], [88, 155, 9], [104, 140, 44],
    ];
    const CYCLE = 104;
    const cursorAt = (t) => {
      for (let i = 1; i < KEYS.length; i++) {
        const [t1, x1, y1] = KEYS[i];
        const [t0, x0, y0] = KEYS[i - 1];
        if (t <= t1) {
          const k = (t - t0) / (t1 - t0 || 1);
          return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
        }
      }
      return [KEYS[0][1], KEYS[0][2]];
    };

    return {
      fps: 8,
      draw(ctx, f) {
        const P = FV.painter(ctx);
        // image précédente, réutilisée en miniature dans la fenêtre
        pctx.globalCompositeOperation = 'copy';
        pctx.drawImage(ctx.canvas, 0, 0);
        pctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(desk, 0, 0);
        const t = f % CYCLE;
        const open = t >= 20 && t < 88;
        const glitch = (t >= 20 && t < 23) || (t >= 85 && t < 88);
        if (t >= 16 && t < 22) P.r(5, 19, 11, 11, 'rgb(165 113 255 / 30%)');
        if (open) {
          P.r(18, 58, 22, 5, '#2c2934');
          P.r(20, 60, 18, 1, C.violet);
          const dx = glitch ? (R() > 0.5 ? 3 : -3) : 0;
          P.r(WIN.x + dx, WIN.y, WIN.w, WIN.h, C.line);
          P.r(WIN.x + 1 + dx, WIN.y + 1, WIN.w - 2, 5, '#1c1a22');
          P.r(WIN.x + 3 + dx, WIN.y + 2, 3, 3, C.violet);
          P.r(WIN.x + 8 + dx, WIN.y + 3, 26, 1, C.soft);
          P.t('X', WIN.x + WIN.w - 6 + dx, WIN.y + 1, t >= 84 ? C.red : C.dim);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(prev, BODY.x + dx, BODY.y, BODY.w, BODY.h);
          if (glitch) {
            ctx.fillStyle = 'rgb(165 113 255 / 35%)';
            for (let y = WIN.y; y < WIN.y + WIN.h; y += 4) if (R() > 0.5) ctx.fillRect(WIN.x - 4, y, WIN.w + 8, 2);
          }
        }
        // horloge qui clignote, curseur
        P.p(181, 58, f % 8 < 4 ? C.text : C.dim);
        const [cx, cy] = cursorAt(t);
        const x = cx | 0;
        const y = cy | 0;
        for (let k = 0; k < 7; k++) P.r(x, y + k, Math.min(k + 1, 5), 1, '#0e0d11');
        for (let k = 0; k < 6; k++) P.r(x, y + k, Math.min(k, 4), 1, C.text);
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
