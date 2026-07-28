// Jednorazowy skrypt: wydluza zbyt krotkie leady.
//
// Uklad v2 wyznacza wysokosc zdjecia z wysokosci kolumny tekstu, wiec
// jednozdaniowy lead daje zdjecie o proporcji 2,5:1 — pasek, nie fotografia.
// Leady z eksportu Joomli (intro_text) maja 50-183 znaki; referencja 191-381.
// Skrypt uzupelnia krotkie leady kolejnymi zdaniami z pierwszego akapitu
// tresci, do gornej granicy, ucinajac wylacznie na granicy zdania.
//
// Uruchomienie:  node tools/wydluz-leady.mjs [--zapisz]
// Bez --zapisz wypisuje tylko, co by zmienil.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DOLNA = 250;   // ponizej tej dlugosci lead jest uzupelniany
const GORNA = 360;   // nie przekraczamy tej dlugosci
const ZAPISZ = process.argv.includes('--zapisz');

const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];

/** Dzieli tekst na zdania, zachowujac znaki konczace. */
function zdania(tekst) {
  return tekst
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ„])/)
    .filter(Boolean);
}

/** Zdejmuje znaczniki markdown, zeby porownywac sam tekst. */
function goly(tekst) {
  return tekst
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const raport = { uzupelnione: [], pominiete: [], bezMaterialu: [] };

for (const dir of KATALOGI) {
  for (const plik of readdirSync(dir)) {
    if (!plik.endsWith('.md')) continue;
    const sciezka = join(dir, plik);
    const raw = readFileSync(sciezka, 'utf8');

    const m = /^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)([\s\S]*)$/.exec(raw);
    if (!m) continue;
    const [, otw, front, zam, body] = m;

    const leadM = /^lead:\s*"([\s\S]*?)"\s*$/m.exec(front);
    if (!leadM) continue;
    const lead = leadM[1].trim();

    if (lead.length >= DOLNA) {
      raport.pominiete.push(`${plik} (${lead.length} zn.)`);
      continue;
    }

    // Pierwszy akapit tekstowy: bez obrazkow, naglowkow i cytatow.
    const akapit = body
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .find((b) => b && !b.startsWith('![') && !b.startsWith('#') && !b.startsWith('>') && goly(b).length > 40);

    if (!akapit) {
      raport.bezMaterialu.push(plik);
      continue;
    }

    const leadGoly = goly(lead).toLowerCase();
    let nowy = lead;

    for (const z of zdania(goly(akapit))) {
      if (nowy.length >= DOLNA) break;
      // Nie powtarzaj zdania, ktore juz jest w leadzie.
      if (leadGoly.includes(z.slice(0, 40).toLowerCase())) continue;
      const kandydat = `${nowy} ${z}`.replace(/\s+/g, ' ').trim();
      if (kandydat.length > GORNA) break;
      nowy = kandydat;
    }

    if (nowy === lead) {
      raport.bezMaterialu.push(`${plik} (${lead.length} zn., brak zdan do dolozenia)`);
      continue;
    }

    raport.uzupelnione.push({ plik, przed: lead.length, po: nowy.length });

    if (ZAPISZ) {
      const escaped = nowy.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const nowyFront = front.replace(/^lead:\s*"[\s\S]*?"\s*$/m, `lead: "${escaped}"`);
      writeFileSync(sciezka, otw + nowyFront + zam + body, 'utf8');
    }
  }
}

console.log(`UZUPELNIONE: ${raport.uzupelnione.length}`);
for (const u of raport.uzupelnione) {
  console.log(`  ${String(u.przed).padStart(3)} -> ${String(u.po).padStart(3)}  ${u.plik.slice(0, 70)}`);
}
console.log(`\nJUZ WYSTARCZAJACO DLUGIE: ${raport.pominiete.length}`);
console.log(`BEZ MATERIALU DO UZUPELNIENIA: ${raport.bezMaterialu.length}`);
for (const b of raport.bezMaterialu) console.log(`  ${b.slice(0, 80)}`);

console.log(ZAPISZ ? '\nZapisano zmiany w plikach.' : '\nPodglad — nic nie zapisano. Uruchom z --zapisz.');
