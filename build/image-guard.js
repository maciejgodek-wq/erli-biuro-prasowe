// build/image-guard.js
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DOMENA } from './seo.js';

const ROZSZERZENIA_OBRAZKOW = /\.(webp|png|jpe?g|gif|svg)$/i;

/**
 * Wyciaga wszystkie odwolania do obrazkow z HTML: src="..." (img, script
 * ladujace obrazy) oraz content="..." przy og:image/twitter:image.
 * Filtruje po rozszerzeniu — pomija JS, CSS, fonty.
 */
export function findImageRefs(html) {
  const refs = [];
  for (const m of html.matchAll(/\ssrc="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/(?:property="og:image"|name="twitter:image")\s+content="([^"]+)"/g)) {
    refs.push(m[1]);
  }
  return refs.filter((ref) => ROZSZERZENIA_OBRAZKOW.test(ref));
}

/**
 * Sprawdza, ktore odwolania do obrazkow w HTML nie maja odpowiadajacego
 * pliku pod `distDir`. Adresy zaczynajace sie od DOMENA (og:image) sa
 * sprowadzane do sciezki wzglednej przed sprawdzeniem.
 */
export function findMissingImages(html, plik, distDir) {
  const brakujace = [];
  for (const ref of findImageRefs(html)) {
    let sciezka = ref.startsWith(DOMENA) ? ref.slice(DOMENA.length) : ref;
    if (!sciezka.startsWith('/')) continue; // zewnetrzny adres — poza zakresem kontroli
    if (!existsSync(join(distDir, sciezka))) brakujace.push({ plik, ref });
  }
  return brakujace;
}

/** Rzuca wyjatkiem z czytelnym raportem, jesli cokolwiek brakuje. */
export function assertNoMissingImages(pliki, distDir) {
  const wszystkie = pliki.flatMap(({ sciezka, html }) => findMissingImages(html, sciezka, distDir));
  if (wszystkie.length === 0) return;

  const raport = wszystkie.map((m) => `  ${m.plik}: brak pliku dla ${m.ref}`).join('\n');
  throw new Error(
    `Kontrola obrazkow: ${wszystkie.length} zepsutych odwolan.\n${raport}`
  );
}
