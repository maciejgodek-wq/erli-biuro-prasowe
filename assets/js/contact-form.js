/**
 * contact-form.js — Erli Kontaktformular
 * Opcja D (placeholder): walidacja + symulacja sukcesu bez wysyłki.
 * TODO: przed launchem zastąpić showSuccess() prawdziwym fetch do backendu.
 */

/* =====================================================================
   CZYSTE FUNKCJE WALIDACYJNE (testowalne bez DOM)
   ===================================================================== */

/**
 * Sprawdza czy wartość jest niepustym stringiem.
 * @param {string} value
 * @returns {boolean}
 */
function isValidRequired(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Sprawdza format adresu email.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  // Nie trimujemy — spacje w emailu są niepoprawne (^[^\s@]+ nie pasuje do wiodącej spacji)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

/**
 * Waliduje wszystkie pola formularza na podstawie obiektu danych.
 * @param {{ name: string, email: string, betreff: string, nachricht: string, dsgvo: boolean }} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
function validateFields(data) {
  const errors = {};
  if (!isValidRequired(data.name))
    errors.name = 'Bitte gib deinen Namen ein.';
  if (!isValidEmail(data.email))
    errors.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
  if (!isValidRequired(data.betreff))
    errors.betreff = 'Bitte wähle einen Betreff.';
  if (!isValidRequired(data.nachricht))
    errors.nachricht = 'Bitte gib deine Nachricht ein.';
  if (!data.dsgvo)
    errors.dsgvo = 'Bitte stimme der Datenschutzerklärung zu.';
  return { valid: Object.keys(errors).length === 0, errors };
}

/* =====================================================================
   DOM-FUNKTIONEN (nicht direkt testbar ohne jsdom)
   ===================================================================== */

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + '-error');
  if (input) input.classList.add('is-invalid');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(inputId + '-error');
  if (input) input.classList.remove('is-invalid');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.form-input').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.hidden = true;
  });
  const globalErr = document.getElementById('form-error-global');
  if (globalErr) globalErr.hidden = true;
}

function showSuccess(form) {
  const successEl = document.getElementById('form-success');
  if (successEl) {
    successEl.hidden = false;
    successEl.focus();
  }
  form.hidden = true;
}

/**
 * Liest alle Formulardaten aus dem DOM.
 */
function getFormData(form) {
  return {
    name:      form.querySelector('[name="name"]')?.value ?? '',
    email:     form.querySelector('[name="email"]')?.value ?? '',
    betreff:   form.querySelector('[name="betreff"]')?.value ?? '',
    nachricht: form.querySelector('[name="nachricht"]')?.value ?? '',
    dsgvo:     form.querySelector('[name="dsgvo"]')?.checked ?? false,
  };
}

/**
 * Zeigt Fehler im DOM an und gibt das erste fehlerhafte Feld zurück.
 */
function displayErrors(errors) {
  let firstErrorId = null;
  Object.entries(errors).forEach(([field, message]) => {
    showFieldError(field, message);
    if (!firstErrorId) firstErrorId = field;
  });
  return firstErrorId;
}

/**
 * Submit-Handler: validiert → Erfolg simulieren (Opcja D).
 * TODO: vor Launch durch echten fetch-Aufruf ersetzen.
 */
function handleSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;

  clearAllErrors(form);

  const data = getFormData(form);
  const { valid, errors } = validateFields(data);

  if (!valid) {
    const firstErrorId = displayErrors(errors);
    if (firstErrorId) {
      const el = document.getElementById(firstErrorId);
      if (el) el.focus();
    }
    return;
  }

  // Opcja D placeholder — brak wysyłki, symulacja sukcesu
  // TODO: przed launchem zastąpić prawdziwym fetch do backendu/Formspree
  form.reset();
  showSuccess(form);
}

/* =====================================================================
   INIT
   ===================================================================== */

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    form.addEventListener('submit', handleSubmit);

    // Live-Validierung: Fehler löschen sobald Feld korrigiert wird
    form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('input', () => clearFieldError(input.id));
      input.addEventListener('change', () => clearFieldError(input.id));
    });
  });
}

/* =====================================================================
   EXPORTS (Node.js für Tests, kein Effekt im Browser)
   ===================================================================== */

if (typeof module !== 'undefined') {
  module.exports = { isValidEmail, isValidRequired, validateFields };
}
