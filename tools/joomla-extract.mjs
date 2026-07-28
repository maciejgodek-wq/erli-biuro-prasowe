// Jednorazowa migracja tresci z eksportu Joomla/Gridbox do plikow markdown.
// Uruchomienie: node tools/joomla-extract.mjs old_reference/BAZA/erlipl_db.sql

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { rows } from './sql-parse.mjs';
import { htmlToMarkdown, CHROME_SLOWNIK } from './html-to-md.mjs';

const SQL_PATH = process.argv[2];
if (!SQL_PATH) {
  console.error('Uzycie: node tools/joomla-extract.mjs <sciezka-do-dumpu.sql>');
  process.exit(1);
}

const KATEGORIE = {
  '8':   { katalog: 'src/posts/aktualnosci', nazwa: 'Aktualności' },
  '160': { katalog: 'src/posts/media',       nazwa: 'Media o ERLI' },
};

const sql = readFileSync(SQL_PATH, 'utf8');
const pages = rows(sql, 'l064t_gridbox_pages');

/** Cudzyslowy w wartosci frontmattera wymagaja escapowania. */
function yamlString(text) {
  return `"${String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()}"`;
}

/** Pierwszy link zewnetrzny w tresci — zrodlo dla kategorii Media o ERLI. */
function znajdzZrodlo(markdown) {
  const m = /\[([^\]]*)\]\((https?:\/\/(?!(?:www\.)?erli\.pl)[^)]+)\)/.exec(markdown);
  if (!m) return null;
  const host = new URL(m[2]).hostname.replace(/^www\./, '');
  return { nazwa: host, url: m[2] };
}

/**
 * Do porownania tresci: bez formatowania markdown, wielkosci liter i spacji.
 * Biale znaki usuwane calkowicie (nie tylko scalane) — sklejone znaczniki
 * pogrubienia/kursywy w oryginalnym markupie potrafia pochlonac pojedyncza
 * spacje na styku zdan, przez co inaczej identyczne akapity roznia sie
 * jednym bialym znakiem.
 */
function znormalizuj(text) {
  return String(text)
    .toLowerCase()
    .replace(/[*_`.,!?:;()[\]"'„”«»]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/**
 * Prawie rowne: jeden ciag zawiera drugi, a nadwyzka jest niewielka
 * (dateline typu "Warszawa, 03.02.2021 r. –" doklejony przed leadem,
 * przypis typu "[[1]](#_ftn1)" doklejony po). Bez tego ograniczenia
 * "includes" lapie tez przypadki, gdzie lead jest tylko OSTATNIM zdaniem
 * dluzszego akapitu — usuwajac caly akapit, tracimy zdania poprzedzajace,
 * ktorych w leadzie nie ma.
 */
function prawieRowne(a, b) {
  if (a === b) return true;
  const dlugi = a.length >= b.length ? a : b;
  const krotki = a.length >= b.length ? b : a;
  if (!krotki || !dlugi.includes(krotki)) return false;
  const nadwyzka = dlugi.length - krotki.length;
  return nadwyzka <= 40 || nadwyzka <= dlugi.length * 0.15;
}

/**
 * intro_text (lead) jest w wielu artykulach doslowna kopia pierwszego akapitu
 * tresci — w Joomli redaktor wklejal ten sam tekst w oba pola. Szablon
 * wyswietla lead osobno nad trescia, wiec bez usuniecia czytelnik widzialby
 * ten sam akapit dwa razy. Usuwa tylko pierwszy akapit tekstowy (pomijajac
 * ewentualny naglowek), i tylko gdy pokrywa sie z leadem.
 */
function usunPowielonyLead(tresc, lead) {
  const nLead = znormalizuj(lead);
  if (nLead.length < 30) return tresc;

  const bloki = tresc.split('\n\n');
  const idx = bloki.findIndex((b) => b.trim() && !b.trim().startsWith('#'));
  if (idx === -1) return tresc;

  const nBlok = znormalizuj(bloki[idx]);
  if (!prawieRowne(nBlok, nLead)) return tresc;

  bloki.splice(idx, 1);
  return bloki.join('\n\n').trim() + '\n';
}

const artykuly = pages.filter((p) => p.published === '1' && KATEGORIE[p.page_category]);
const raport = { zapisane: 0, bezTresci: [], krotkie: [], chrome: [], zObrazkami: [], leadPowielony: [] };

for (const kat of Object.values(KATEGORIE)) mkdirSync(kat.katalog, { recursive: true });

for (const p of artykuly) {
  const kat = KATEGORIE[p.page_category];
  const data = String(p.created).slice(0, 10);
  const slug = p.page_alias;

  if (!slug) throw new Error(`Artykul id=${p.id} "${p.title}" nie ma page_alias`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error(`Artykul ${slug}: zla data "${p.created}"`);

  let tresc = htmlToMarkdown(p.params ?? '');

  // Pierwszy naglowek zwykle powtarza tytul strony — usun, h1 daje szablon.
  const pierwszaLinia = tresc.split('\n')[0] ?? '';
  if (pierwszaLinia.startsWith('## ') &&
      pierwszaLinia.slice(3).trim().toLowerCase() === String(p.title).trim().toLowerCase()) {
    tresc = tresc.split('\n').slice(1).join('\n').trim() + '\n';
  }

  const lead = String(p.intro_text ?? '').replace(/\s+/g, ' ').trim();
  const trescPrzedDedup = tresc;
  tresc = usunPowielonyLead(tresc, lead);
  if (tresc !== trescPrzedDedup) raport.leadPowielony.push(slug);

  const zrodlo = p.page_category === '160' ? znajdzZrodlo(tresc) : null;

  const front = [
    '---',
    `tytul: ${yamlString(p.title)}`,
    `data: ${data}`,
    `lead: ${yamlString(lead)}`,
  ];
  if (zrodlo) {
    front.push('zrodlo:', `  nazwa: ${zrodlo.nazwa}`, `  url: ${zrodlo.url}`);
  }
  front.push('---', '');

  writeFileSync(join(kat.katalog, `${data}-${slug}.md`), front.join('\n') + '\n' + tresc, 'utf8');
  raport.zapisane++;

  // Kontrola jakosci
  const czysty = tresc.replace(/[#>*\-\[\]()]/g, '').replace(/\s+/g, ' ').trim();
  if (!czysty) raport.bezTresci.push(slug);
  else if (czysty.length < 400) raport.krotkie.push(`${slug} (${czysty.length} zn.)`);
  for (const t of CHROME_SLOWNIK) {
    if (new RegExp(`\\b${t}\\b`).test(tresc)) { raport.chrome.push(`${slug}: "${t}"`); break; }
  }
  if (/!\[/.test(tresc)) raport.zObrazkami.push(slug);
}

console.log(`Zapisano ${raport.zapisane} artykulow`);
console.log(`  Aktualnosci:  ${artykuly.filter((p) => p.page_category === '8').length}`);
console.log(`  Media o ERLI: ${artykuly.filter((p) => p.page_category === '160').length}`);

const sekcja = (tytul, lista) => {
  if (!lista.length) return;
  console.log(`\n${tytul} (${lista.length}):`);
  for (const x of lista) console.log(`  ${x}`);
};

sekcja('BEZ TRESCI — wymaga recznego uzupelnienia', raport.bezTresci);
sekcja('PODEJRZANIE KROTKIE — sprawdz recznie', raport.krotkie);
sekcja('INTERFEJS EDYTORA PRZECIEKL — napraw CHROME_KLASY', raport.chrome);
sekcja('ZAWIERA OBRAZKI — sprawdz sciezki', raport.zObrazkami);
sekcja('LEAD POWIELONY W TRESCI — usunieto pierwszy akapit automatycznie', raport.leadPowielony);

if (raport.chrome.length) {
  console.error('\nBLAD: interfejs edytora w tresci. Nie commituj przed naprawa.');
  process.exit(1);
}
