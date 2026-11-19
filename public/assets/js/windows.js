/* =====================================================================
   Gestionnaire de fenêtres, barre des tâches, menu, notifications, terminal.
   ===================================================================== */
'use strict';

(function (FV) {
  const { $, $$, el } = FV;
  let zTop = 20;
  let cascade = 0;

  const winOf = (app) => document.getElementById('w-' + app);
  const taskOf = (win) => $(`.task[data-app="${win.dataset.app}"]`);
  const isOpen = (win) => win.classList.contains('is-open');
  const visibleWindows = () =>
    $$('.win.is-open:not(.is-min)').sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex));

  /* ---------- construction : barre de titre + barre d'état ---------- */
  function build(win) {
    const app = win.dataset.app;
    const bar = el('div', 'win__bar');
    const back = el('button', 'win__back', '← Bureau');
    back.type = 'button';
    back.dataset.act = 'close';
    const btns = el('div', 'win__btns');
    const minBtn = el('button', null, '_');
    minBtn.type = 'button';
    minBtn.dataset.act = 'min';
    minBtn.setAttribute('aria-label', 'Réduire');
    const closeBtn = el('button', null, 'X');
    closeBtn.type = 'button';
    closeBtn.dataset.act = 'close';
    closeBtn.setAttribute('aria-label', 'Fermer');
    btns.append(minBtn, closeBtn);
    bar.append(back, FV.iconCanvas(app), el('span', 'win__title', win.dataset.title), el('span', 'win__path', win.dataset.path), btns);
    win.prepend(bar);

    const status = el('div', 'win__status');
    status.append(el('span', null, 'PID 0x' + (app.length * 4099 + app.charCodeAt(0) * 17).toString(16).toUpperCase()));
    if (win.querySelector('canvas[data-scene]')) {
      const fps = el('span', null, '— I/S');
      fps.dataset.fps = '';
      status.append(fps);
    }
    status.append(el('span', 'win__run', 'En cours'));
    win.append(status);

    win.setAttribute('role', 'dialog');
    win.addEventListener('pointerdown', () => focus(win));
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      if (btn.dataset.act === 'min') minimize(win);
      else close(win);
    });
    draggable(win, bar);
  }

  function draggable(win, handle) {
    let start = null;
    handle.addEventListener('pointerdown', (e) => {
      if (FV.isMobile() || e.target.closest('button')) return;
      start = { x: e.clientX, y: e.clientY, left: win.offsetLeft, top: win.offsetTop };
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
      if (!start) return;
      const desk = $('#desk');
      const left = Math.max(-win.offsetWidth + 120, Math.min(desk.clientWidth - 120, start.left + e.clientX - start.x));
      const top = Math.max(0, Math.min(desk.clientHeight - 36, start.top + e.clientY - start.y));
      win.style.left = left + 'px';
      win.style.top = top + 'px';
    });
    const stop = () => {
      start = null;
    };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }

  /* ---------- actions ---------- */
  function focus(win) {
    $$('.win.is-active').forEach((w) => w !== win && w.classList.remove('is-active'));
    win.classList.add('is-active');
    win.style.zIndex = String(++zTop);
    $$('.task').forEach((t) => t.classList.toggle('is-active', t.dataset.app === win.dataset.app));
  }

  function setHash(app) {
    const url = window.location.pathname + window.location.search + (app ? '#' + app : '');
    window.history.replaceState(null, '', url);
  }

  function open(app, { fromHash = false } = {}) {
    const win = winOf(app);
    if (!win) return;
    closeStart();
    if (isOpen(win)) {
      restore(win);
      return;
    }
    win.classList.add('is-open');
    // comme un vrai logiciel : chaque ouverture repart du haut
    const body = win.querySelector('.win__body');
    if (body) body.scrollTop = 0;
    if (!FV.isMobile()) place(win);
    if (!FV.REDUCED) {
      win.classList.add('is-glitch-in');
      setTimeout(() => win.classList.remove('is-glitch-in'), 320);
    }
    addTask(win);
    focus(win);
    if (!fromHash && win.dataset.share !== 'no') setHash(app);
    win.querySelector('.win__btns [data-act="close"]').focus({ preventScroll: true });
    FV.onWindowChange?.();
  }

  function place(win) {
    const desk = $('#desk');
    const width = win.offsetWidth;
    const left = Math.max(16, Math.min(desk.clientWidth - width - 16, (desk.clientWidth - width) / 2 - 60 + (cascade % 5) * 34));
    const top = Math.max(14, Math.min(40, 22 + (cascade % 5) * 26));
    win.style.left = left + 'px';
    win.style.top = top + 'px';
    cascade++;
  }

  function close(win) {
    if (!isOpen(win)) return;
    const done = () => {
      win.classList.remove('is-open', 'is-glitch-out', 'is-active', 'is-min');
      FV.onWindowChange?.();
    };
    taskOf(win)?.remove();
    if (window.location.hash === '#' + win.dataset.app) setHash('');
    if (FV.REDUCED || FV.isMobile()) done();
    else {
      win.classList.add('is-glitch-out');
      setTimeout(done, 230);
    }
    // la fenêtre suivante reprend le focus : Échap en rafale ferme tout
    const next = visibleWindows().find((w) => w !== win);
    if (next) {
      focus(next);
      next.querySelector('.win__btns [data-act="close"]').focus({ preventScroll: true });
    }
  }

  function minimize(win) {
    win.classList.add('is-min');
    win.classList.remove('is-active');
    const task = taskOf(win);
    task?.classList.add('is-min');
    task?.classList.remove('is-active');
    FV.onWindowChange?.();
  }

  function restore(win) {
    win.classList.remove('is-min');
    taskOf(win)?.classList.remove('is-min');
    focus(win);
    FV.onWindowChange?.();
  }

  function addTask(win) {
    if (taskOf(win)) return;
    const task = el('button', 'task');
    task.type = 'button';
    task.dataset.app = win.dataset.app;
    task.append(FV.iconCanvas(win.dataset.app), el('span', null, win.dataset.title));
    task.addEventListener('click', () => {
      if (win.classList.contains('is-min')) restore(win);
      else if (win.classList.contains('is-active')) minimize(win);
      else focus(win);
    });
    $('#tasks').append(task);
  }

  /* ---------- menu ---------- */
  function closeStart() {
    const menu = $('#start');
    if (!menu || menu.hidden) return false;
    menu.hidden = true;
    $('#start-btn').setAttribute('aria-expanded', 'false');
    return true;
  }

  function buildStart() {
    const list = $('#start-list');
    const SECTIONS = [
      ['Projets', ['dap', 'ihm', 'tva', 'devis', 'rsmp', 'unity', 'pygame', 'recherche', 'folio']],
      ['Bénévolat', ['arcadia']],
      ['Personnel', ['lisezmoi', 'profil', 'parcours', 'cv', 'contact', 'terminal']],
    ];
    SECTIONS.forEach(([title, apps]) => {
      list.append(el('div', 'start__section', title));
      apps.forEach((app) => {
        const win = winOf(app);
        if (!win) return;
        const btn = el('button');
        btn.type = 'button';
        btn.dataset.open = app;
        btn.append(FV.iconCanvas(app), el('span', null, win.dataset.title));
        list.append(btn);
      });
    });
    $('#start-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = $('#start');
      menu.hidden = !menu.hidden;
      $('#start-btn').setAttribute('aria-expanded', String(!menu.hidden));
    });
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('#start, #start-btn')) closeStart();
    });
  }

  /* ---------- notifications ---------- */
  FV.toast = (title, message) => {
    $$('.toast').forEach((t) => t.remove());
    const toast = el('div', 'toast');
    toast.setAttribute('role', 'status');
    toast.append(el('b', null, title), el('p', null, message));
    document.body.append(toast);
    setTimeout(() => toast.remove(), 5500);
  };

  /* ---------- terminal (clin d'œil) ---------- */
  function buildTerminal() {
    const term = $('#term');
    if (!term) return;
    const out = $('#term-out');
    const input = $('#term-in');
    // un clic n'importe où dans la zone noire place le curseur dans la saisie
    term.addEventListener('click', () => {
      if (!window.getSelection()?.toString()) input.focus();
    });
    const apps = ['dap', 'ihm', 'tva', 'devis', 'rsmp', 'unity', 'pygame', 'recherche', 'folio', 'arcadia', 'profil', 'parcours', 'cv', 'contact'];
    const CMD = {
      help: () => 'help · ls · open <programme> · whoami · status · clear',
      ls: () => apps.map((a) => winOf(a)?.dataset.title).filter(Boolean).join('   '),
      whoami: () => 'Fabien Villedieu — développeur logiciel, Lyon.',
      status: () => `statut : ${FV.profile.statut}\ndébut  : ${FV.profile.debut}\nzone   : ${FV.profile.zone}`,
      clear: () => {
        out.textContent = '';
        return null;
      },
    };
    $('#term-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      const [cmd, arg] = raw.toLowerCase().split(/\s+/);
      let reply;
      if (cmd === 'open' && apps.includes(arg)) {
        open(arg);
        reply = 'ouverture de ' + arg + '…';
      } else if (CMD[cmd]) reply = CMD[cmd]();
      else reply = `commande inconnue : ${cmd} — tapez help`;
      if (reply !== null) out.textContent += `fv> ${raw}\n${reply}\n`;
      term.scrollTop = term.scrollHeight;
    });
  }

  /* ---------- initialisation ---------- */
  FV.windows = {
    open,
    close,
    init() {
      $$('.win').forEach(build);
      buildStart();
      buildTerminal();
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open]');
        if (!trigger) return;
        e.preventDefault();
        open(trigger.dataset.open);
      });
      // Échap : ferme d'abord le menu, sinon la fenêtre du dessus (capture = toujours reçu)
      window.addEventListener(
        'keydown',
        (e) => {
          if (e.key !== 'Escape' || document.documentElement.classList.contains('is-booting')) return;
          if (closeStart()) return;
          const top = visibleWindows()[0];
          if (top) {
            e.preventDefault();
            close(top);
          }
        },
        true
      );
      // bouton précédent / lien collé dans la barre d'adresse
      window.addEventListener('hashchange', () => {
        const app = window.location.hash.slice(1);
        if (winOf(app)) open(app, { fromHash: true });
      });
    },
  };
})(window.FV);
