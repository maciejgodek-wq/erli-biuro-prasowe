// Parser zrzutu mysqldump. Obsluguje extended inserts (wiele krotek
// na jedna instrukcje), escapowane apostrofy i przecinki w wartosciach.

/** Nazwy kolumn z CREATE TABLE. */
export function columns(sql, table) {
  const m = new RegExp('CREATE TABLE `' + table + '` \\(([\\s\\S]*?)\\n\\)', 'm').exec(sql);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('`'))
    .map((l) => l.slice(1, l.indexOf('`', 1)));
}

/** Krotki wartosci ze wszystkich INSERT INTO dla tabeli. */
function tuples(sql, table) {
  const out = [];
  const marker = 'INSERT INTO `' + table + '`';
  let idx = 0;

  while ((idx = sql.indexOf(marker, idx)) !== -1) {
    let i = sql.indexOf('VALUES', idx) + 6;
    let depth = 0;
    let inStr = false;
    let cur = '';
    let fields = [];

    for (; i < sql.length; i++) {
      const ch = sql[i];

      if (inStr) {
        if (ch === '\\') { cur += ch + sql[++i]; continue; }
        if (ch === "'") { inStr = false; continue; }
        cur += ch;
        continue;
      }
      if (ch === "'") { inStr = true; continue; }
      if (ch === '(') { depth++; if (depth === 1) { fields = []; cur = ''; } continue; }
      if (ch === ',' && depth === 1) { fields.push(cur.trim()); cur = ''; continue; }
      if (ch === ')') {
        depth--;
        if (depth === 0) { fields.push(cur.trim()); out.push(fields); cur = ''; }
        continue;
      }
      if (ch === ';' && depth === 0) break;
      if (depth >= 1) cur += ch;
    }
    idx = i;
  }
  return out;
}

/** Zdejmuje escapowanie mysqldump z wartosci pola. */
function unescape(value) {
  if (value === 'NULL') return '';
  return value
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

/** Wiersze tabeli jako obiekty {kolumna: wartosc}. */
export function rows(sql, table) {
  const cols = columns(sql, table);
  if (!cols.length) return [];
  return tuples(sql, table).map((t) => {
    const o = {};
    cols.forEach((c, i) => { o[c] = unescape(t[i] ?? ''); });
    return o;
  });
}
