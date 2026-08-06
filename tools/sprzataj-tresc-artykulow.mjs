// Usuwa z tresci artykulow dwa powtorzenia po migracji z Joomli:
//
//   A1. Zdjecie hero na poczatku tresci. Szablon post.html renderuje je juz
//       osobno z pola `grafika`, wiec czytelnik widzial ten sam kadr dwa razy
//       pod rzad. Dotyczy 77 z 77 artykulow.
//
//   A2. Tytul powtorzony jako pogrubiony akapit tuz pod naglowkiem H1.
//       Dotyczy 46 artykulow.
//
// Obie naprawy sa mechaniczne: usuwaja blok tylko wtedy, gdy dokladnie
// odpowiada polu z frontmattera (`grafika` / `tytul`). Przy jakiejkolwiek
// roznicy plik zostaje nietkniety i trafia do raportu — lepiej zostawic
// powtorzenie do recznej oceny niz skasowac tresc, ktora nia nie jest.
//
// Uruchomienie:  node tools/sprzataj-tresc-artykulow.mjs [--zapisz]

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];
const ZAPISZ = process.argv.includes('--zapisz');

/** Zbija biale znaki, zeby porownanie nie wywracalo sie na zawijaniu wierszy. */
const znormalizuj = (s) => s.replace(/\s+/g, ' ').trim();

/** Jak unquote() w build/frontmatter.js — razem z odkodowaniem \" i \\. */
function odcudzyslow(v) {
  const t = v.trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).replace(/\\(["\\])/g, '$1');
  }
  if (t.length >= 2 && t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1);
  return t;
}

const licznik = { hero: 0, tytul: 0, pominietoHero: 0, pominietoTytul: 0, plikow: 0 };
const doPrzejrzenia = [];

for (const katalog of KATALOGI) {
  for (const nazwa of readdirSync(katalog)) {
    if (!nazwa.endsWith('.md')) continue;

    const sciezka = join(katalog, nazwa);
    const raw = readFileSync(sciezka, 'utf8');

    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
    if (!m) continue;
    const [, front, bodyRaw] = m;

    const pole = (klucz) => {
      const r = new RegExp(`^${klucz}:(.*)$`, 'm').exec(front);
      return r ? odcudzyslow(r[1]) : null;
    };
    const grafika = pole('grafika');
    const tytul = pole('tytul');

    // Bloki rozdzielone pusta linia — tak samo widzi to parser markdowna.
    let bloki = bodyRaw.split(/\n\s*\n/);
    const przedZmiana = bloki.length;
    let zmieniono = false;

    // --- A1: zdjecie hero jako pierwszy blok ---
    const iPierwszy = bloki.findIndex((b) => b.trim() !== '');
    if (iPierwszy !== -1) {
      const blok = bloki[iPierwszy].trim();
      const obraz = /^!\[[^\]]*\]\(([^)]+)\)$/.exec(blok);
      if (obraz) {
        if (grafika && obraz[1].trim() === grafika) {
          bloki.splice(iPierwszy, 1);
          licznik.hero++;
          zmieniono = true;
        } else {
          licznik.pominietoHero++;
          doPrzejrzenia.push(`${nazwa}\n    obraz w tresci: ${obraz[1]}\n    pole grafika:   ${grafika}`);
        }
      }
    }

    // --- A2: tytul powtorzony pogrubieniem (po ewentualnym usunieciu obrazu) ---
    const iDrugi = bloki.findIndex((b) => b.trim() !== '');
    if (iDrugi !== -1 && tytul) {
      const blok = bloki[iDrugi].trim();
      const pogrubiony = /^\*\*([\s\S]+)\*\*$/.exec(blok);
      if (pogrubiony && !pogrubiony[1].includes('**')) {
        if (znormalizuj(pogrubiony[1]) === znormalizuj(tytul)) {
          bloki.splice(iDrugi, 1);
          licznik.tytul++;
          zmieniono = true;
        } else if (znormalizuj(pogrubiony[1]).slice(0, 40) === znormalizuj(tytul).slice(0, 40)) {
          // Ten sam poczatek, inna calosc — prawie na pewno powtorzenie
          // z drobna roznica, ale nie kasuje bez ludzkiego oka.
          licznik.pominietoTytul++;
          doPrzejrzenia.push(`${nazwa}\n    pogrubienie: ${znormalizuj(pogrubiony[1]).slice(0, 80)}\n    tytul:       ${znormalizuj(tytul).slice(0, 80)}`);
        }
      }
    }

    if (!zmieniono) continue;
    licznik.plikow++;

    if (ZAPISZ) {
      const body = bloki.join('\n\n').replace(/^\n+/, '');
      writeFileSync(sciezka, `---\n${front}\n---\n\n${body}`, 'utf8');
    }
    void przedZmiana;
  }
}

console.log(ZAPISZ ? 'ZAPIS' : 'SUCHA PROBA (dodaj --zapisz, zeby zapisac)');
console.log(`  usuniete zdjecia hero z tresci:   ${licznik.hero}`);
console.log(`  usuniete powtorzenia tytulu:      ${licznik.tytul}`);
console.log(`  zmienionych plikow:               ${licznik.plikow}`);
console.log(`  pominiete (obraz != grafika):     ${licznik.pominietoHero}`);
console.log(`  pominiete (tytul sie nie zgadza): ${licznik.pominietoTytul}`);

if (doPrzejrzenia.length) {
  console.log('\nDO RECZNEGO PRZEJRZENIA:');
  for (const w of doPrzejrzenia) console.log(`  ${w}`);
}
