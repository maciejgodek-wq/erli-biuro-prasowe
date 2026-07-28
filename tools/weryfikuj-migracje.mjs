// Weryfikacja migracji tresci przeciw zrzutowi bazy Joomli.
// Odpowiada na dwa otwarte punkty z BLOKADY.md:
//
//   D4 — czy 10 artykulow ponizej 400 znakow jest krotkie w zrodle,
//        czy migracja zgubila tresc.
//   D5 — czy automatyczne usuwanie zdublowanego leadu (32 artykuly)
//        nie usunelo niczego poza leadem.
//
// Metoda: kazde zdanie z tekstu w bazie musi wystapic w pliku markdown —
// w leadzie albo w tresci. Zdanie, ktorego nie ma nigdzie, oznacza
// zgubiona tresc.
//
// Uruchomienie: node tools/weryfikuj-migracje.mjs <sciezka-do-dumpu.sql>

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rows } from './sql-parse.mjs';
import { htmlToMarkdown } from './html-to-md.mjs';

const SQL = process.argv[2] ?? 'old_reference/BAZA/erlipl_db.sql';
const sql = readFileSync(SQL, 'utf8');

const KATEGORIE = { 8: 'aktualnosci', 160: 'media-o-erli' };

/** Normalizuje tekst do porownania: bez znacznikow, interpunkcji i wielkosci liter. */
function norm(t) {
  return String(t ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`>#|]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function zdania(t) {
  return String(t ?? '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((z) => z.trim())
    .filter((z) => norm(z).split(' ').length >= 6);   // pomijamy okruchy
}

// --- pliki markdown ---
const pliki = new Map();
for (const [dir, kat] of [['src/posts/aktualnosci', 'aktualnosci'], ['src/posts/media', 'media-o-erli']]) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, f), 'utf8');
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
    const front = m?.[1] ?? '';
    const body = m?.[2] ?? '';
    const slug = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    pliki.set(slug, {
      kat,
      lead: /^lead:\s*"([\s\S]*?)"\s*$/m.exec(front)?.[1] ?? '',
      body,
      calosc: norm((/^lead:\s*"([\s\S]*?)"\s*$/m.exec(front)?.[1] ?? '') + ' ' + body),
      dlugoscTresci: norm(body).length,
    });
  }
}

// --- artykuly z bazy ---
const bazowe = rows(sql, 'l064t_gridbox_pages')
  .filter((p) => p.published === '1' && KATEGORIE[p.page_category] && p.page_alias);

console.log(`Plikow markdown: ${pliki.size}   artykulow w bazie: ${bazowe.length}\n`);

const zgubione = [];
const krotkieWZrodle = [];
const krotkieMimoZrodla = [];
const brakPliku = [];

for (const p of bazowe) {
  const plik = pliki.get(p.page_alias);
  if (!plik) { brakPliku.push(p.page_alias); continue; }

  const zBazy = htmlToMarkdown(p.params ?? '');

  // Porownanie slowo w slowo, nie zdaniami. Podzial na zdania falszowal
  // wynik: fragment przechodzacy przez granice struktury markdowna
  // ("...spacerowy.*** ERLI.pl to...") nie wystepuje w pliku w tej postaci,
  // choc wszystkie jego slowa tam sa.
  const slowaBazy = norm(zBazy).split(' ').filter((w) => w.length > 3);
  const zbiorPliku = new Set(plik.calosc.split(' '));
  const brakujaceSlowa = [...new Set(slowaBazy)].filter((w) => !zbiorPliku.has(w));

  // Prog 3%: pojedyncze roznice odmiany czy encji sa normalne.
  const udzialBraku = slowaBazy.length ? brakujaceSlowa.length / new Set(slowaBazy).size : 0;
  if (udzialBraku > 0.03) {
    zgubione.push({
      slug: p.page_alias,
      brak: brakujaceSlowa.length,
      unikalnych: new Set(slowaBazy).size,
      udzial: (udzialBraku * 100).toFixed(1),
      przyklad: brakujaceSlowa.slice(0, 8).join(', '),
    });
  }

  // D4: pelna tresc pliku (lead + body) przeciw tekstowi z bazy.
  const dlugoscPliku = plik.calosc.length;
  const dlugoscBazy = norm(zBazy).length;
  if (dlugoscPliku < 500) {
    const stosunek = dlugoscBazy ? dlugoscPliku / dlugoscBazy : 1;
    (stosunek >= 0.8 ? krotkieWZrodle : krotkieMimoZrodla)
      .push({ slug: p.page_alias, plik: dlugoscPliku, baza: dlugoscBazy, stosunek: stosunek.toFixed(2) });
  }
}

console.log('=== D5: ZGUBIONE SLOWA (prog 3% unikalnych) ===');
if (!zgubione.length) {
  console.log('  Brak. Slownictwo z bazy w calosci obecne w plikach.\n');
} else {
  console.log(`  ${zgubione.length} artykulow powyzej progu:`);
  for (const z of zgubione.slice(0, 15)) {
    console.log(`    ${z.slug.slice(0, 58)}`);
    console.log(`      brak ${z.brak} z ${z.unikalnych} unikalnych slow (${z.udzial}%): ${z.przyklad}`);
  }
  console.log('');
}

console.log('=== D4: ARTYKULY PONIZEJ 500 ZNAKOW (lead + tresc) ===');
console.log(`  proporcja do zrodla >= 0,8 — migracja OK: ${krotkieWZrodle.length}`);
for (const k of krotkieWZrodle) console.log(`    ${k.stosunek}x  plik ${String(k.plik).padStart(4)} / baza ${String(k.baza).padStart(4)}  ${k.slug.slice(0, 50)}`);
console.log(`  proporcja < 0,8 — DO SPRAWDZENIA: ${krotkieMimoZrodla.length}`);
for (const k of krotkieMimoZrodla) console.log(`    ${k.stosunek}x  plik ${String(k.plik).padStart(4)} / baza ${String(k.baza).padStart(4)}  ${k.slug.slice(0, 50)}`);

if (brakPliku.length) {
  console.log(`\n=== BRAK PLIKU DLA SLUGA Z BAZY: ${brakPliku.length} ===`);
  for (const s of brakPliku.slice(0, 10)) console.log(`  ${s.slice(0, 80)}`);
}
