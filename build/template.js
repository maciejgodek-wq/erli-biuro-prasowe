// build/template.js

const ENCJE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapuje znaki majace znaczenie w HTML. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ENCJE[ch]);
}

/** Odczytuje wartosc sciezki 'a.b.c' z kontekstu; undefined gdy brak. */
function lookup(context, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

/** Pusta tablica traktowana jest jak wartosc falszywa. */
function isTruthy(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

/**
 * Renderuje szablon. Obsluguje:
 *   {{ x }}        wartosc escapowana
 *   {{{ x }}}      surowy HTML
 *   {{> nazwa }}   partial
 *   {{#each x}}…{{/each}}
 *   {{#if x}}…{{else}}…{{/if}}
 * Bloki sa przetwarzane od najbardziej zagniezdzonych (regex bez zagniezdzen
 * tego samego typu), w petli az do stabilizacji.
 */
export function render(template, context = {}, partials = {}) {
  let out = template;

  // Partiale najpierw, zeby ich zawartosc przeszla przez pozostale reguly.
  out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`Nieznany partial: ${name}`);
    return partials[name];
  });

  // Bloki each i if — powtarzamy, bo zagniezdzenia rozwijaja sie warstwami.
  let previous;
  do {
    previous = out;

    out = out.replace(
      /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_, path, body) => {
        const items = lookup(context, path);
        if (!Array.isArray(items)) return '';
        return items
          .map((item) => render(body, { ...context, ...item }, partials))
          .join('');
      }
    );

    out = out.replace(
      /\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, path, body) => {
        const [whenTrue, whenFalse = ''] = body.split(/\{\{else\}\}/);
        return isTruthy(lookup(context, path)) ? whenTrue : whenFalse;
      }
    );
  } while (out !== previous);

  out = out.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, path) => lookup(context, path) ?? '');
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => escapeHtml(lookup(context, path)));

  return out;
}
