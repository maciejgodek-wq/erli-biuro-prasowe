// Zdejmuje pogrubienie z akapitow, ktore sa pogrubione w calosci.
//
// Po migracji z Joomli 217 akapitow to samodzielne bloki **...**. Czesc mialaby
// sens jako naglowki, czesc to wstepy do wyliczen, ale wszystkie renderuja sie
// tak samo — jako grubszy tekst wrzucony w srodek artykulu bez zadnej funkcji.
// Zamiast zgadywac, ktore sa czym, wyrownujemy je do zwyklego akapitu.
//
// Ruszamy tylko blok, ktory JEST pogrubieniem od pierwszego do ostatniego
// znaku i nie ma w srodku innych **. Akapit z pogrubionym fragmentem w tekscie
// zostaje nietkniety — tam wytluszczenie niesie znaczenie.
//
// Uruchomienie:  node tools/zdejmij-pogrubienia.mjs [--zapisz]

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];
const ZAPISZ = process.argv.includes('--zapisz');

let zdjete = 0;
let plikow = 0;
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
    const bloki = body.split(/\n\s*\n/).map((blok) => {
      const t = blok.trim();
      const dopasowanie = /^\*\*([\s\S]+)\*\*$/.exec(t);
      if (!dopasowanie) return blok;
      const wnetrze = dopasowanie[1];
      // Wewnetrzne ** oznacza, ze to nie jest jedno ciagle pogrubienie.
      if (wnetrze.includes('**')) return blok;
      wPliku++;
      if (probki.length < 5) probki.push(`${nazwa.slice(0, 42)} :: ${wnetrze.slice(0, 58)}`);
      return wnetrze;
    });

    if (!wPliku) continue;
    zdjete += wPliku;
    plikow++;
    if (ZAPISZ) writeFileSync(sciezka, `---\n${front}\n---\n\n${bloki.join('\n\n').replace(/^\n+/, '')}`, 'utf8');
  }
}

console.log(ZAPISZ ? 'ZAPIS' : 'SUCHA PROBA (dodaj --zapisz, zeby zapisac)');
console.log(`  zdjete pogrubienia: ${zdjete}`);
console.log(`  w plikach:          ${plikow}`);
if (probki.length) {
  console.log('\nPRZYKLADY:');
  for (const p of probki) console.log(`  - ${p}`);
}
