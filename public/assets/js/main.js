// ==========================================================================
// Portfolio — logique partagée (vanilla ES6+).
// Site multi-pages : la coquille (header + footer) est injectée depuis cette
// source unique pour éviter toute duplication entre les pages.
// Seule dépendance : Lucide (icônes), chargé globalement via CDN.
// ==========================================================================

const STORAGE_KEY = 'portfolio-theme';

// Base relative de la page courante ('' à la racine, '../' dans pages/).
const BASE = document.documentElement.dataset.base ?? '';
// Clé de la page active (alimente l'état actif de la navigation).
const ACTIVE = document.documentElement.dataset.page ?? '';

// Liens de navigation (source unique).
const NAV = [
  { key: 'accueil', href: 'index.html', label: 'Accueil' },
  { key: 'projets', href: 'projets.html', label: 'Projets' },
  { key: 'a-propos', href: 'a-propos.html', label: 'À propos' },
  { key: 'contact', href: 'contact.html', label: 'Contact' },
];

// Coordonnées / réseaux (source unique).
const LINKS = {
  github: 'https://github.com/VIL-CIEL',
  linkedin: 'https://linkedin.com/in/fabien-villedieu/',
  email: 'fabien.villedieu.pro@gmail.com',
};

// Icônes de marque en SVG inline (Lucide ne fournit plus github/linkedin).
const BRAND_ICONS = {
  github: `<svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.08.79 2.18v3.23c0 .31.21.68.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/></svg>`,
  linkedin: `<svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>`,
};

/** Builds the shared social links list (GitHub, LinkedIn, email). */
function socialsMarkup() {
  return `
    <li><a class="icon-link" href="${LINKS.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${BRAND_ICONS.github}</a></li>
    <li><a class="icon-link" href="${LINKS.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${BRAND_ICONS.linkedin}</a></li>
    <li><a class="icon-link" href="mailto:${LINKS.email}" aria-label="Envoyer un email"><i data-lucide="mail" aria-hidden="true"></i></a></li>
  `;
}

/** Injects the shared header (brand, navigation, theme toggle) into the page. */
function injectHeader() {
  const host = document.querySelector('[data-shell="header"]');
  if (!host) return;

  const links = NAV.map((item) => {
    const active = item.key === ACTIVE;
    return `<li><a class="nav__link${active ? ' is-active' : ''}" href="${BASE}${item.href}"${
      active ? ' aria-current="page"' : ''
    }>${item.label}</a></li>`;
  }).join('');

  host.innerHTML = `
    <nav class="nav" aria-label="Navigation principale">
      <a class="nav__brand" href="${BASE}index.html" aria-label="Accueil">
        <span class="nav__moon" aria-hidden="true">🌙</span>
        <span class="nav__brand-text">Fabien Villedieu</span>
      </a>
      <button class="nav__toggle" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-menu">
        <i data-lucide="menu" aria-hidden="true"></i>
      </button>
      <ul class="nav__menu" id="nav-menu">
        ${links}
        <li>
          <button class="theme-toggle" type="button" aria-label="Basculer entre le thème clair et sombre">
            <i data-lucide="sun" class="theme-toggle__sun" aria-hidden="true"></i>
            <i data-lucide="moon" class="theme-toggle__moon" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </nav>
  `;
}

/** Injects the shared footer (copyright, socials, version) into the page. */
function injectFooter() {
  const host = document.querySelector('[data-shell="footer"]');
  if (!host) return;

  const year = String(new Date().getFullYear());
  host.innerHTML = `
    <div class="site-footer__inner">
      <p class="site-footer__copy">© ${year} Fabien Villedieu</p>
      <ul class="site-footer__socials" aria-label="Réseaux et contact">${socialsMarkup()}</ul>
      <p class="site-footer__version" data-version>v1.0.0</p>
    </div>
  `;
}

/**
 * Theme management: respects the user's stored choice, falls back to the system
 * preference. The data-theme attribute is already set by an inline <head> script
 * to avoid a flash; here we simply wire the toggle and persist the choice.
 */
function setupTheme() {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');

  toggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  });
}

/** Mobile navigation: toggles the slide-down menu and closes it after a click. */
function setupMobileMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.nav__menu');
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('.nav__link').forEach((link) => link.addEventListener('click', close));
}

/**
 * Reveal-on-scroll animation. Content is never permanently hidden: anything
 * already in the viewport is shown immediately, and the IntersectionObserver
 * only animates elements as they scroll into view. If reduced motion is
 * requested or the API is missing, everything is revealed at once.
 */
function setupReveal() {
  const targets = [...document.querySelectorAll('.reveal')];
  if (!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Reveals every target currently visible in the viewport (no scroll needed).
  const revealInView = () => {
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));

  // Filet de sécurité : affiche le contenu déjà à l'écran sans attendre l'observer.
  revealInView();
  window.addEventListener('load', revealInView);
}

/**
 * Image gallery + lightbox: opens any `.gallery__item` in an overlay with
 * previous/next navigation. Keyboard accessible (Esc to close, arrows to browse).
 */
function setupGallery() {
  const items = [...document.querySelectorAll('.gallery__item')];
  if (!items.length) return;

  const sources = items.map((item) => {
    const img = item.querySelector('img');
    return { src: img.currentSrc || img.src, alt: img.alt };
  });

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image agrandie');
  lightbox.innerHTML = `
    <button class="lightbox__btn lightbox__close" type="button" aria-label="Fermer">
      <i data-lucide="x" aria-hidden="true"></i>
    </button>
    <button class="lightbox__btn lightbox__nav lightbox__nav--prev" type="button" aria-label="Image précédente">
      <i data-lucide="chevron-left" aria-hidden="true"></i>
    </button>
    <img class="lightbox__img" alt="" />
    <button class="lightbox__btn lightbox__nav lightbox__nav--next" type="button" aria-label="Image suivante">
      <i data-lucide="chevron-right" aria-hidden="true"></i>
    </button>
    <p class="lightbox__caption"></p>
  `;
  document.body.appendChild(lightbox);

  const imgEl = lightbox.querySelector('.lightbox__img');
  const captionEl = lightbox.querySelector('.lightbox__caption');
  let index = 0;
  let lastFocused = null;

  const show = (i) => {
    index = (i + sources.length) % sources.length;
    imgEl.src = sources[index].src;
    imgEl.alt = sources[index].alt;
    captionEl.textContent = sources[index].alt;
  };

  const open = (i) => {
    lastFocused = document.activeElement;
    show(i);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox__close').focus();
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  lightbox.querySelector('.lightbox__close').addEventListener('click', close);
  lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(index - 1));
  lightbox.querySelector('.lightbox__nav--next').addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
}

/**
 * Toast notification (role=status, aria-live) for success / error feedback (§6.3).
 */
let toastTimer = null;
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form: client-side validation with inline errors, then sends either
 * through Formspree (if an endpoint id is configured) or via a mailto: fallback
 * that works on a purely static host. No backend required.
 */
function setupContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const formspreeId = form.dataset.formspreeId || '';
  const fields = [...form.querySelectorAll('[required]')];

  const messageFor = (field) => {
    if (!field.value.trim()) return 'Ce champ est obligatoire.';
    if (field.type === 'email' && !EMAIL_RE.test(field.value)) return 'Adresse email invalide.';
    return '';
  };

  const setError = (field, msg) => {
    const errEl = form.querySelector(`#${field.id}-error`);
    if (errEl) errEl.textContent = msg;
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  // Validation en temps réel une fois qu'un champ a déjà été signalé en erreur.
  fields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') setError(field, messageFor(field));
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-spam : champ piège (honeypot) rempli => on ignore silencieusement.
    if (form.querySelector('[name="_gotcha"]')?.value) return;

    let valid = true;
    fields.forEach((field) => {
      const msg = messageFor(field);
      setError(field, msg);
      if (msg) valid = false;
    });
    if (!valid) {
      showToast('Veuillez corriger les champs indiqués.', 'error');
      fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    if (formspreeId) {
      try {
        const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (res.ok) {
          form.reset();
          showToast('Message envoyé, merci ! Je vous réponds rapidement.');
        } else {
          showToast("L'envoi a échoué. Réessayez ou écrivez-moi directement par email.", 'error');
        }
      } catch {
        showToast('Erreur réseau. Réessayez plus tard ou écrivez-moi par email.', 'error');
      }
      return;
    }

    // Repli sans dépendance : ouverture du client mail pré-rempli.
    const subject = encodeURIComponent(data.sujet || 'Contact depuis le portfolio');
    const body = encodeURIComponent(
      `Nom : ${data.nom}\nEmail : ${data.email}\n\n${data.message}`
    );
    window.location.href = `mailto:${LINKS.email}?subject=${subject}&body=${body}`;
    showToast('Votre logiciel de messagerie va s’ouvrir pour finaliser l’envoi.');
  });
}

/** Footer version number, read from version.json (§1.1). */
async function loadVersion() {
  const versionEl = document.querySelector('[data-version]');
  if (!versionEl) return;
  try {
    const res = await fetch(`${BASE}version.json`, { cache: 'no-cache' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.version) versionEl.textContent = `v${data.version}`;
  } catch (err) {
    console.warn('Version introuvable :', err);
  }
}

// --- Initialisation -------------------------------------------------------
injectHeader();
injectFooter();
setupTheme();
setupMobileMenu();
setupReveal();
setupGallery();
setupContactForm();
loadVersion();

// Génère les icônes Lucide une fois la coquille et la lightbox injectées.
if (window.lucide) window.lucide.createIcons();
