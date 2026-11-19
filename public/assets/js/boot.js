/* =====================================================================
   Démarrage : séquence de boot, horloge, statut, puis ouverture du bureau.
   Chargé en dernier (dépend de core, icons, wallpaper, windows).
   ===================================================================== */
'use strict';

(function (FV) {
  const { $, el } = FV;
  const BOOTED_KEY = 'fv-booted';

  function clock() {
    const now = new Date();
    $('#clock').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
    // une mise à jour par minute suffit
    setTimeout(clock, 60000 - now.getSeconds() * 1000 - now.getMilliseconds() + 20);
  }

  function desktopReady(firstVisit) {
    FV.store.set(BOOTED_KEY, '1');
    FV.toast('Statut', `${FV.profile.statut} — ${FV.profile.domaine}, ${FV.profile.zone}.`);
    const app = window.location.hash.slice(1);
    if (app && document.getElementById('w-' + app)) FV.windows.open(app, { fromHash: true });
    else if (firstVisit) FV.windows.open('lisezmoi');
  }

  function boot() {
    const root = document.documentElement;
    const screen = $('#boot');
    const log = $('#boot-log');
    const bar = $('#boot-bar');
    const name = $('#boot-name');
    root.classList.add('is-booting');
    log.replaceChildren();
    bar.style.width = '0';
    name.classList.remove('is-on');

    const LINES = [
      ['FV-BIOS v2.0 · Fabien Villedieu', ''],
      ['MÉMOIRE ...... 8 programmes, 1 bénévolat', 'OK'],
      ['RÉSEAU ....... github.com/VIL-CIEL', 'OK'],
      ['PROFIL ....... ' + FV.profile.diplome, 'OK'],
      ['STATUT ....... ' + FV.profile.statut.toLowerCase(), 'OUVERT'],
      ['Chargement du bureau', ''],
    ];
    let index = 0;
    let stopped = false;

    const finish = () => {
      root.classList.remove('is-booting');
      screen.classList.remove('is-out');
      desktopReady(true);
    };
    const stop = () => {
      if (stopped) return;
      stopped = true;
      window.removeEventListener('keydown', onKey);
      if (FV.REDUCED) finish();
      else {
        screen.classList.add('is-out');
        setTimeout(finish, 360);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener('keydown', onKey);
    $('#boot-skip').onclick = stop;
    $('#boot-skip').focus();

    (function next() {
      if (stopped) return;
      if (index < LINES.length) {
        const [text, tag] = LINES[index++];
        const row = el('div', null, text + (tag ? ' ' : ''));
        if (tag) row.append(el('span', tag === 'OUVERT' ? 'boot__open' : 'boot__ok', '[' + tag + ']'));
        log.append(row);
        bar.style.width = (index / LINES.length) * 100 + '%';
        setTimeout(next, 190);
      } else {
        name.classList.add('is-on');
        setTimeout(stop, 900);
      }
    })();
  }

  async function init() {
    await FV.loadProfile();
    FV.renderProfile();
    FV.$$('canvas[data-icon]').forEach(FV.drawIcon);
    FV.drawWallpaper(true);
    FV.windows.init();
    FV.scenes?.init();
    FV.parcours?.init();
    FV.contact?.init();
    clock();

    $('#replay-boot').addEventListener('click', () => {
      FV.$('#start').hidden = true;
      boot();
    });
    FV.$$('[data-fond]').forEach((btn) =>
      btn.addEventListener('click', () => FV.setWallpaper(btn.dataset.fond))
    );

    // la classe is-booting est posée dès le <head> pour une première visite
    if (document.documentElement.classList.contains('is-booting')) boot();
    else desktopReady(FV.store.get(BOOTED_KEY) !== '1');
  }

  init();
})(window.FV);
