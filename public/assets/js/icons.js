/* =====================================================================
   Icônes 16×16 des programmes, dessinées en code.
   ===================================================================== */
'use strict';

(function (FV) {
  const C = {
    k: '#0c0b0f', w: '#e8e4dc', l: '#bcb7c3', g: '#6c6876', d: '#3a3742', v: '#a571ff', V: '#5a2fb0',
    G: '#58a646', G2: '#2f6b2c', n: '#7a5232', n2: '#523620', y: '#e6c14b', s: '#d9a87e', h: '#4a3324',
    ok: '#63c24d', screen: '#2a2832', dark: '#09080b', desk: '#111015', grass: '#7cc95f', pcb: '#2f6b3a',
  };

  // Cadre « programme » commun aux projets : fenêtre avec barre de titre violette.
  function frame(P) {
    P.r(1, 2, 14, 12, C.k);
    P.r(2, 3, 12, 10, C.d);
    P.r(2, 3, 12, 2, C.V);
    P.p(12, 3, C.w);
    P.p(10, 3, C.l);
  }

  const ICONS = {
    lisezmoi(P) {
      P.r(3, 1, 9, 14, C.k);
      P.r(4, 2, 7, 12, C.w);
      P.r(10, 2, 2, 2, C.l);
      P.r(5, 4, 5, 1, C.v);
      P.r(5, 6, 5, 1, C.g);
      P.r(5, 8, 4, 1, C.g);
      P.r(5, 10, 5, 1, C.g);
      P.r(5, 12, 3, 1, C.g);
    },
    profil(P) {
      P.r(5, 1, 6, 1, C.k);
      P.r(4, 2, 8, 3, C.h);
      P.r(4, 5, 8, 4, C.s);
      P.r(5, 6, 2, 1, C.k);
      P.r(9, 6, 2, 1, C.k);
      P.r(7, 6, 2, 1, C.g);
      P.r(5, 9, 6, 1, C.s);
      P.r(2, 10, 12, 5, C.v);
      P.r(2, 10, 12, 1, C.V);
      P.r(7, 10, 2, 3, C.w);
    },
    parcours(P) {
      P.r(1, 2, 14, 12, C.k);
      P.r(2, 3, 12, 10, C.screen);
      P.r(3, 8, 10, 1, C.l);
      P.r(6, 6, 1, 2, C.v);
      P.r(7, 5, 4, 1, C.v);
      P.r(9, 9, 1, 2, C.g);
      P.r(10, 11, 3, 1, C.g);
      P.r(3, 7, 2, 3, C.w);
      P.r(11, 4, 2, 3, C.ok);
    },
    cv(P) {
      P.r(3, 1, 9, 14, C.k);
      P.r(4, 2, 7, 12, C.w);
      P.r(10, 2, 2, 2, C.l);
      P.r(5, 4, 4, 1, C.v);
      P.r(5, 6, 5, 1, C.g);
      P.r(5, 8, 5, 1, C.g);
      P.r(5, 10, 4, 1, C.g);
      P.r(5, 12, 5, 1, C.g);
    },
    contact(P) {
      P.r(1, 3, 14, 10, C.k);
      P.r(2, 4, 12, 8, C.w);
      for (let i = 0; i < 5; i++) {
        P.p(2 + i, 4 + i, C.g);
        P.p(13 - i, 4 + i, C.g);
      }
      P.r(7, 9, 2, 1, C.v);
      P.r(11, 1, 4, 4, C.v);
      P.p(12, 2, C.w);
      P.p(13, 2, C.w);
    },
    terminal(P) {
      P.r(1, 2, 14, 11, C.k);
      P.r(2, 3, 12, 9, C.dark);
      P.p(4, 5, C.v);
      P.p(5, 6, C.v);
      P.p(4, 7, C.v);
      P.r(7, 8, 4, 1, C.w);
      P.r(6, 13, 4, 1, C.g);
      P.r(4, 14, 8, 1, C.k);
    },
    dap(P) {
      frame(P);
      P.r(5, 6, 6, 6, C.pcb);
      P.r(6, 7, 4, 4, C.k);
      P.p(7, 8, C.v);
      for (let i = 0; i < 3; i++) {
        P.p(4, 7 + i * 2, C.y);
        P.p(11, 7 + i * 2, C.y);
      }
    },
    ihm(P) {
      frame(P);
      P.r(4, 6, 8, 5, C.screen);
      P.r(5, 9, 1, 1, C.v);
      P.r(6, 8, 1, 1, C.v);
      P.r(7, 9, 1, 1, C.v);
      P.r(8, 7, 1, 1, C.v);
      P.r(9, 8, 2, 1, C.v);
      P.r(7, 11, 2, 1, C.l);
    },
    tva(P) {
      frame(P);
      P.r(3, 6, 4, 2, C.screen);
      P.r(3, 8, 10, 4, C.screen);
      P.p(4, 9, C.v);
      P.r(5, 10, 3, 1, C.w);
      P.r(9, 10, 1, 1, C.v);
    },
    devis(P) {
      frame(P);
      // accolades d'un objet JSON
      P.r(4, 6, 1, 6, C.v);
      P.p(5, 6, C.v);
      P.p(5, 11, C.v);
      P.p(3, 9, C.v);
      P.r(11, 6, 1, 6, C.v);
      P.p(10, 6, C.v);
      P.p(10, 11, C.v);
      P.p(12, 9, C.v);
      P.r(7, 7, 2, 1, C.w);
      P.r(7, 9, 2, 1, C.l);
      P.r(7, 11, 1, 1, C.l);
    },
    rsmp(P) {
      frame(P);
      P.r(4, 6, 5, 6, C.g);
      P.r(5, 7, 3, 4, C.k);
      P.r(6, 8, 1, 2, C.l);
      P.r(10, 6, 1, 5, C.v);
      P.r(10, 6, 3, 1, C.v);
      P.r(9, 10, 2, 2, C.v);
    },
    unity(P) {
      frame(P);
      P.r(10, 5, 2, 2, C.l);
      P.r(9, 6, 2, 2, C.l);
      P.r(8, 7, 2, 2, C.l);
      P.r(7, 8, 2, 2, C.l);
      P.r(5, 9, 4, 1, C.n);
      P.r(5, 10, 2, 2, C.n);
      P.r(4, 11, 2, 2, C.y);
    },
    pygame(P) {
      frame(P);
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 2; y++) P.r(3 + x * 4, 6 + y * 3, 3, 2, (x + y) % 2 ? C.G : C.G2);
      }
      P.r(7, 7, 2, 3, C.y);
      P.p(7, 7, C.k);
    },
    recherche(P) {
      frame(P);
      P.r(3, 6, 7, 1, C.g);
      P.r(3, 8, 5, 1, C.g);
      P.r(3, 10, 6, 1, C.g);
      P.r(8, 6, 4, 4, C.l);
      P.r(9, 7, 2, 2, C.v);
      P.r(11, 10, 2, 2, C.n);
    },
    folio(P) {
      frame(P);
      P.r(4, 6, 8, 6, C.desk);
      P.r(5, 7, 2, 2, C.v);
      P.r(5, 10, 2, 1, C.l);
      P.r(8, 7, 3, 3, C.d);
      P.r(8, 7, 3, 1, C.V);
    },
    arcadia(P) {
      P.r(2, 3, 12, 11, C.k);
      P.r(3, 4, 10, 3, C.G);
      P.r(3, 7, 10, 6, C.n);
      P.p(4, 7, C.G);
      P.p(7, 8, C.G);
      P.p(11, 7, C.G);
      P.p(5, 10, C.n2);
      P.p(9, 11, C.n2);
      P.p(11, 9, C.n2);
      P.p(6, 5, C.grass);
      P.p(10, 4, C.grass);
    },
  };

  FV.drawIcon = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 16, 16);
    (ICONS[canvas.dataset.icon] || ICONS.folio)(FV.painter(ctx));
  };

  FV.iconCanvas = (name) => {
    const canvas = FV.el('canvas', 'px');
    canvas.width = 16;
    canvas.height = 16;
    canvas.dataset.icon = name;
    canvas.setAttribute('aria-hidden', 'true');
    FV.drawIcon(canvas);
    return canvas;
  };
})(window.FV);
