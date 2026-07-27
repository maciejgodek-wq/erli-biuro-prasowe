// build/lang-guard.js

const ZNAKI_DE = /[äöüßÄÖÜ]/;

/**
 * Slowa jednoznacznie niemieckie. Celowo pominiete te, ktore istnieja
 * takze po polsku (Kontakt, Start, Test) lub angielsku.
 */
const SLOWA_DE = new RegExp(
  '\\b(' +
    [
      'der', 'die', 'das', 'und', 'oder', 'nicht', 'auch', 'wird', 'sind',
      'eine', 'einen', 'einem', 'eines', 'ist', 'sich', 'mit', 'von', 'zum',
      'zur', 'bei', 'kann', 'mehr', 'alle', 'wir', 'Sie', 'ich', 'du',
      'Marktplatz', 'Deutschland', 'deutsch', 'Verkäufer', 'Verkaeufer',
      'Startseite', 'Datenschutz', 'Impressum', 'Anmelden', 'Einkauf',
      'einkaufen', 'Produkte', 'Zahlung', 'Versand', 'Bestellung',
      'schliessen', 'oeffnen', 'Abspielen', 'Pausieren', 'Werktage',
    ].join('|') +
    ')\\b'
);

/** Atrybuty, w ktorych tekst jest niewidoczny wizualnie. */
const ATRYBUTY = ['aria-label', 'alt', 'title', 'placeholder'];

function sprawdz(tekst) {
  if (ZNAKI_DE.test(tekst)) return ZNAKI_DE.exec(tekst)[0];
  if (SLOWA_DE.test(tekst)) return SLOWA_DE.exec(tekst)[0];
  return null;
}

/**
 * Szuka niemieckiego w wygenerowanym HTML. Zwraca liste trafien:
 * { plik, kontekst, trafienie, fragment }.
 * Zawartosc <script> i <style> jest pomijana — tam tekst nie trafia do uzytkownika.
 */
export function findGerman(html, plik) {
  const hits = [];

  const oczyszczony = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  for (const attr of ATRYBUTY) {
    const re = new RegExp(`${attr}\\s*=\\s*"([^"]*)"`, 'gi');
    let m;
    while ((m = re.exec(oczyszczony)) !== null) {
      const trafienie = sprawdz(m[1]);
      if (trafienie) hits.push({ plik, kontekst: attr, trafienie, fragment: m[1] });
    }
  }

  const tekst = oczyszczony.replace(/<[^>]+>/g, ' ');
  for (const zdanie of tekst.split(/[.!?\n]+/)) {
    const okrojone = zdanie.trim();
    if (!okrojone) continue;
    const trafienie = sprawdz(okrojone);
    if (trafienie) {
      hits.push({ plik, kontekst: 'tresc', trafienie, fragment: okrojone.slice(0, 120) });
    }
  }

  return hits;
}

/** Rzuca wyjatkiem z czytelnym raportem, jesli cokolwiek znaleziono. */
export function assertNoGerman(pliki) {
  const wszystkie = pliki.flatMap(({ sciezka, html }) => findGerman(html, sciezka));
  if (wszystkie.length === 0) return;

  const raport = wszystkie
    .map((h) => `  ${h.plik} [${h.kontekst}] "${h.trafienie}" — ${h.fragment}`)
    .join('\n');

  throw new Error(
    `Kontrola jezykowa: znaleziono ${wszystkie.length} niemieckich fragmentow.\n` +
      `Strona ma byc w 100% polska.\n${raport}`
  );
}
