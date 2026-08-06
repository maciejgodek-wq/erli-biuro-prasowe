// build/frontmatter.js

/**
 * Zdejmuje otaczajace cudzyslowy, jesli wystepuja po obu stronach.
 *
 * Wewnatrz cudzyslowow podwojnych odkodowuje tez \" i \\. Bez tego backslash
 * wychodzil na strone: tytul zapisany jako "Allegro.\"Byl taki moment\""
 * renderowal sie z widocznymi ukosnikami. Dotyczylo 2 z 77 artykulow.
 * Apostrofy zostawiamy bez zmian — w YAML nie znaja sekwencji ucieczki.
 */
function unquote(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if (first === '"' && last === '"') {
      return trimmed.slice(1, -1).replace(/\\(["\\])/g, '$1');
    }
    if (first === "'" && last === "'") {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/**
 * Parsuje podzbior YAML: pary `klucz: wartosc` oraz jeden poziom
 * zagniezdzenia przez wciecie dwoma spacjami.
 */
function parseYamlSubset(source) {
  const data = {};
  let currentKey = null;

  for (const rawLine of source.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const indented = /^\s+/.test(rawLine);
    const separator = rawLine.indexOf(':');
    if (separator === -1) continue;

    const key = rawLine.slice(0, separator).trim();
    const value = unquote(rawLine.slice(separator + 1));

    if (indented && currentKey) {
      data[currentKey][key] = value;
      continue;
    }

    if (value === '') {
      data[key] = {};
      currentKey = key;
    } else {
      data[key] = value;
      currentKey = null;
    }
  }

  return data;
}

/**
 * Dzieli zawartosc pliku .md na dane z frontmattera i tresc.
 * Brak frontmattera zwraca pusty obiekt danych i cala tresc.
 */
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };
  return { data: parseYamlSubset(match[1]), body: match[2].trim() };
}
