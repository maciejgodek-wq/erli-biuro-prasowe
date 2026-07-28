// Jednorazowy skrypt (B1): dopisuje pole `grafika:` do frontmattera artykulow,
// wskazujac prawdziwe zdjecie artykulu (pierwszy obraz w tresci, zwykle hero
// z assets/img/artykuly/<slug>/) zamiast pustego pola, ktore grafikaUrl()
// zastepowala nieistniejacym key visualem (B1 — 314 zepsutych odwolan).
//
// Artykuly bez zadnego obrazu w tresci sa pomijane — grafikaUrl() sciezka
// zapasowa (assets/img/kv/<slug>.webp) zadziala dla nich po wygenerowaniu
// key visuali (tools/kv-generate.js).
//
// Idempotentny: pomija pliki, ktore juz maja pole `grafika:`.
// Uruchomienie: node tools/dopisz-grafike-karty.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];

let dopisane = 0;
let pominiete = [];

for (const dir of KATALOGI) {
  for (const plik of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const sciezka = join(dir, plik);
    const raw = readFileSync(sciezka, 'utf8');

    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(raw);
    if (!match) { pominiete.push(`${plik}: brak frontmattera`); continue; }
    const front = match[1];
    const reszta = raw.slice(match[0].length);

    if (/^grafika:/m.test(front)) continue; // juz ustawione — idempotencja

    const obraz = /!\[\]\((\/assets\/img\/artykuly\/[^)]+)\)/.exec(reszta);
    if (!obraz) { pominiete.push(`${plik}: brak obrazu w tresci`); continue; }

    const nowyFront = `${front}\ngrafika: ${obraz[1]}`;
    writeFileSync(sciezka, `---\n${nowyFront}\n---\n${reszta}`, 'utf8');
    dopisane++;
  }
}

console.log(`Dopisano grafike: ${dopisane}`);
if (pominiete.length) {
  console.log(`\nPominiete (${pominiete.length}):`);
  for (const p of pominiete) console.log(`  ${p}`);
}
