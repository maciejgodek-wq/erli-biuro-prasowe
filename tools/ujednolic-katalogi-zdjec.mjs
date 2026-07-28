// Jednorazowy skrypt (D3): ujednolica nazwy katalogow assets/img/artykuly/<dir>/
// wedlug deterministycznej reguly skrocSlug(slug, 80) z build/posts.js.
//
// Katalogi dla najdluzszych slugow byly ucinane doraznie przy pobieraniu
// zdjec (limit sciezki Windows), nazwy nie byly spojne z zadna udokumentowana
// regula. Ten skrypt liczy oczekiwana nazwe = skrocSlug(oryginalny slug, 80)
// i przy niezgodnosci zmienia nazwe katalogu oraz podmienia odwolania
// w odpowiadajacym pliku .md. Idempotentny — bezpieczny do ponownego
// uruchomienia (jesli katalog juz jest zgodny, pomija go).
//
// Uruchomienie: node tools/ujednolic-katalogi-zdjec.mjs

import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { slugFromFilename, skrocSlug } from '../build/posts.js';

const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];
const IMG_ROOT = 'assets/img/artykuly';

let zmienione = 0;

for (const dir of KATALOGI) {
  for (const plik of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const slug = slugFromFilename(plik);
    const oczekiwanyDir = skrocSlug(slug, 80);
    const sciezkaMd = join(dir, plik);
    const raw = readFileSync(sciezkaMd, 'utf8');

    const m = /\/assets\/img\/artykuly\/([^/]+)\//.exec(raw);
    if (!m) {
      console.error(`POMINIETO: ${slug} nie ma odwolania do assets/img/artykuly/`);
      continue;
    }
    const aktualnyDir = m[1];

    if (aktualnyDir === oczekiwanyDir) continue;

    const staraSciezka = join(IMG_ROOT, aktualnyDir);
    const nowaSciezka = join(IMG_ROOT, oczekiwanyDir);

    if (!existsSync(staraSciezka)) {
      console.error(`BLAD: katalog ${staraSciezka} nie istnieje (slug: ${slug})`);
      continue;
    }
    if (existsSync(nowaSciezka)) {
      console.error(`BLAD: katalog docelowy ${nowaSciezka} juz istnieje — kolizja (slug: ${slug})`);
      continue;
    }

    renameSync(staraSciezka, nowaSciezka);

    const nowyRaw = raw.split(`/assets/img/artykuly/${aktualnyDir}/`).join(`/assets/img/artykuly/${oczekiwanyDir}/`);
    writeFileSync(sciezkaMd, nowyRaw, 'utf8');

    console.log(`${slug}:\n  ${aktualnyDir}\n  -> ${oczekiwanyDir}`);
    zmienione++;
  }
}

console.log(`\nZmieniono katalogow: ${zmienione}`);
