/* =====================================================================
   Formulaire de contact : envoi à Formspree, qui transmet le message par
   e-mail. Sans JavaScript, le formulaire s'envoie normalement (action/POST) ;
   avec, l'envoi se fait sans quitter la page et le résultat s'affiche.
   ===================================================================== */
'use strict';

(function (FV) {
  const MAX = { name: 80, email: 120, subject: 120, message: 4000 };

  function setStatus(form, text, kind) {
    const status = form.querySelector('[data-form-status]');
    status.textContent = text;
    status.dataset.kind = kind || '';
  }

  function fieldError(form, name, text) {
    const field = form.elements[name];
    const slot = form.querySelector(`[data-error-for="${name}"]`);
    if (field) field.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (slot) slot.textContent = text || '';
  }

  // Validation côté navigateur, avec des messages en français.
  function validate(form) {
    let ok = true;
    const value = (name) => form.elements[name].value.trim();
    const check = (name, test, message) => {
      const error = test ? '' : message;
      fieldError(form, name, error);
      if (error) ok = false;
    };
    check('name', value('name').length >= 2, 'Indiquez votre nom.');
    check('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')), 'Adresse e-mail invalide.');
    check('message', value('message').length >= 10, 'Votre message est un peu court (10 caractères minimum).');
    Object.entries(MAX).forEach(([name, max]) => {
      if (value(name).length > max) {
        fieldError(form, name, `${max} caractères maximum.`);
        ok = false;
      }
    });
    return ok;
  }

  async function send(form) {
    const button = form.querySelector('[type="submit"]');
    const data = new FormData(form);
    // objet de l'e-mail reçu : on reconnaît tout de suite d'où vient le message
    const subject = String(data.get('subject') || '').trim();
    data.set('_subject', 'Portfolio — ' + (subject || 'nouveau message'));
    button.disabled = true;
    setStatus(form, 'Envoi en cours…', 'pending');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        setStatus(form, 'Message envoyé. Je vous réponds au plus vite.', 'ok');
        FV.toast('Message envoyé', 'Merci ! Votre message m\'a bien été transmis.');
        return;
      }
      const body = await res.json().catch(() => ({}));
      const errors = Array.isArray(body.errors) ? body.errors : [];
      errors.forEach((err) => err.field && fieldError(form, err.field, err.message));
      const first = errors.find((err) => !err.field) || errors[0];
      const detail = first ? ' (' + String(first.message).replace(/\.$/, '') + ').' : '.';
      setStatus(form, 'L\'envoi a échoué' + detail + ' Vous pouvez aussi m\'écrire directement par e-mail.', 'error');
    } catch {
      setStatus(form, 'Pas de connexion au service d\'envoi. Réessayez, ou écrivez-moi directement par e-mail.', 'error');
    } finally {
      button.disabled = false;
    }
  }

  FV.contact = {
    init() {
      const form = FV.$('#contact-form');
      if (!form) return;
      form.noValidate = true; // nos messages remplacent ceux du navigateur
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(form)) {
          setStatus(form, 'Vérifiez les champs signalés.', 'error');
          form.querySelector('[aria-invalid="true"]')?.focus();
          return;
        }
        send(form);
      });
      // l'erreur d'un champ disparaît dès qu'on le corrige
      form.addEventListener('input', (e) => {
        if (e.target.name && e.target.getAttribute('aria-invalid') === 'true') fieldError(form, e.target.name, '');
      });
    },
  };
})(window.FV);
