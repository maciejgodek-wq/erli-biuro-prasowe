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

const OTWARCIE = /\{\{#(each|if)\s+([\w.]+)\s*\}\}/g;
const ZNACZNIK = /\{\{#(?:each|if)\s+[\w.]+\s*\}\}|\{\{\/(?:each|if)\}\}|\{\{else\}\}/g;

/**
 * Od pozycji `od` szuka domkniecia biezacego bloku, liczac zagniezdzenia.
 * Zwraca granice tresci, pozycje za znacznikiem zamykajacym oraz pozycje
 * {{else}} na poziomie tego bloku (-1 gdy brak).
 */
function znajdzDomkniecie(tekst, od) {
  const re = new RegExp(ZNACZNIK.source, 'g');
  re.lastIndex = od;
  let glebokosc = 0;
  let pozycjaElse = -1;
  let m;

  while ((m = re.exec(tekst)) !== null) {
    if (m[0].startsWith('{{#')) {
      glebokosc++;
    } else if (m[0] === '{{else}}') {
      if (glebokosc === 0 && pozycjaElse === -1) pozycjaElse = m.index;
    } else if (glebokosc === 0) {
      return { koniecTresci: m.index, po: re.lastIndex, pozycjaElse };
    } else {
      glebokosc--;
    }
  }

  throw new Error('Niedomkniety blok w szablonie');
}

/** Podstawia wartosci zmiennych; potrojne nawiasy wstawiaja surowy HTML. */
function interpoluj(tekst, context) {
  return tekst
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, path) => lookup(context, path) ?? '')
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => escapeHtml(lookup(context, path)));
}

/**
 * Rozwija bloki each/if i podstawia zmienne. Kazdy fragment tekstu jest
 * interpolowany dokladnie raz, w kontekscie bloku, w ktorym lezy — dzieki
 * temu zmienne elementu petli nie mieszaja sie z zakresem nadrzednym.
 */
function renderuj(template, context, partials) {
  const otwarcie = new RegExp(OTWARCIE.source, 'g');
  let out = '';
  let pos = 0;
  let m;

  while ((m = otwarcie.exec(template)) !== null) {
    const [pelny, typ, sciezka] = m;
    out += interpoluj(template.slice(pos, m.index), context);

    const startTresci = m.index + pelny.length;
    const { koniecTresci, po, pozycjaElse } = znajdzDomkniecie(template, startTresci);
    const granica = pozycjaElse === -1 ? koniecTresci : pozycjaElse;
    const tresc = template.slice(startTresci, granica);
    const alternatywa =
      pozycjaElse === -1 ? '' : template.slice(pozycjaElse + '{{else}}'.length, koniecTresci);

    const wartosc = lookup(context, sciezka);
    if (typ === 'each') {
      out += isTruthy(wartosc) && Array.isArray(wartosc)
        ? wartosc.map((item) => renderuj(tresc, { ...context, ...item }, partials)).join('')
        : renderuj(alternatywa, context, partials);
    } else {
      out += isTruthy(wartosc)
        ? renderuj(tresc, context, partials)
        : renderuj(alternatywa, context, partials);
    }

    pos = po;
    otwarcie.lastIndex = po;
  }

  return out + interpoluj(template.slice(pos), context);
}

/**
 * Renderuje szablon. Obsluguje:
 *   {{ x }}        wartosc escapowana
 *   {{{ x }}}      surowy HTML
 *   {{> nazwa }}   partial
 *   {{#each x}}…{{else}}…{{/each}}
 *   {{#if x}}…{{else}}…{{/if}}
 * Bloki moga byc zagniezdzane dowolnie, takze w tym samym typie —
 * domkniecia dobierane sa przez liczenie glebokosci, nie regexem.
 */
export function render(template, context = {}, partials = {}) {
  // Partiale najpierw, zeby ich zawartosc przeszla przez pozostale reguly.
  const zPartialami = template.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`Nieznany partial: ${name}`);
    return partials[name];
  });

  return renderuj(zPartialami, context, partials);
}
