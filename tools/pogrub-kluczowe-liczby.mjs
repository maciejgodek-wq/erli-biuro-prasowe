// Pogrubia kluczowe dane liczbowe w tresci artykulow: kwoty, procenty,
// wielkosci i krotnosci. Dziennikarz skanujacy komunikat szuka wlasnie ich.
//
// LIMIT 8 NA ARTYKUL. Wyroznienie dziala przez rzadkosc — w tekstach o wynikach
// finansowych liczb jest po 26 i wytluszczenie wszystkich zamienia akapit
// w plame. W komunikacie prasowym najwazniejsze dane padaja na poczatku,
// dalsze wystapienia to powtorzenia, wiec limit bierze pierwsze trafienia.
//
// CZEGO NIE RUSZA:
//   - punktow listy — dane sa tam juz wyodrebnione wizualnie
//   - naglowkow, linkow, obrazkow i fragmentow juz pogrubionych
//   - dat ("3 maja", "2025") — to nie sa dane, tylko metryka tekstu
//
// Uruchomienie:  node tools/pogrub-kluczowe-liczby.mjs [--zapisz]

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];
const ZAPISZ = process.argv.includes('--zapisz');
const LIMIT = 8;

// Liczba z jednostka. Jednostka jest obowiazkowa — sama cyfra bez niej to
// najczesciej rok, numer stoiska albo liczebnik w zdaniu.
const LICZBA = /\b\d[\d  ]*(?:[.,]\d+)?\s*(?:%|proc\.|mln|mld|tys\.|zł|pkt\.?|razy)\b/g;
const DATA = /^\d{1,2}\s*(stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|wrze\S*|pa\S*dziernika|listopada|grudnia)/i;

// Fragmenty nietykalne: obrazek, link, istniejace pogrubienie, kod.
const NIETYKALNE = /(!?\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*|`[^`]+`)/;

const licznik = { trafien: 0, plikow: 0, zLimitem: [] };
const probki = [];

for (const katalog of KATALOGI) {
  for (const nazwa of readdirSync(katalog)) {
    if (!nazwa.endsWith('.md')) continue;

    const sciezka = join(katalog, nazwa);
    const raw = readFileSync(sciezka, 'utf8');
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
    if (!m) continue;
    const [, front, body] = m;

    let wPliku = 0;
    let obciete = 0;

    const linie = body.split('\n').map((linia) => {
      if (/^\s*#/.test(linia)) return linia;        // naglowek
      if (/^\s*[-*]\s/.test(linia)) return linia;   // punkt listy
      if (/^\s*>/.test(linia)) return linia;        // cytat blokowy

      // Tnij linie na fragmenty nietykalne i reszte; podmieniaj tylko w reszcie.
      return linia.split(NIETYKALNE).map((kawalek) => {
        if (NIETYKALNE.test(kawalek)) return kawalek;
        return kawalek.replace(LICZBA, (trafienie) => {
          if (DATA.test(trafienie)) return trafienie;
          if (wPliku >= LIMIT) { obciete++; return trafienie; }
          wPliku++;
          if (probki.length < 8) probki.push(`${nazwa.slice(0, 34)} :: ${trafienie}`);
          return `**${trafienie}**`;
        });
      }).join('');
    });

    if (!wPliku) continue;
    licznik.trafien += wPliku;
    licznik.plikow++;
    if (obciete) licznik.zLimitem.push({ plik: nazwa.slice(0, 52), obciete });

    if (ZAPISZ) writeFileSync(sciezka, `---\n${front}\n---\n${linie.join('\n')}`, 'utf8');
  }
}

console.log(ZAPISZ ? 'ZAPIS' : 'SUCHA PROBA (dodaj --zapisz, zeby zapisac)');
console.log(`  pogrubione liczby: ${licznik.trafien}`);
console.log(`  w plikach:         ${licznik.plikow}`);
console.log(`  limit ${LIMIT}/artykul osiagniety w ${licznik.zLimitem.length} plikach`);
for (const z of licznik.zLimitem) console.log(`    - ${z.plik}  (pominieto dalszych: ${z.obciete})`);
console.log('\n  PRZYKLADY:');
for (const p of probki) console.log(`    ${p}`);
