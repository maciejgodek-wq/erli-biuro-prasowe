// build/redirect-guard.js
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Sciezka pliku wyjsciowego odpowiadajaca adresowi URL — ta sama regula co dodaj() w build.js. */
function plikDlaUrl(url) {
  return url === '/' ? 'index.html' : `${url.slice(1, -1)}/index.html`;
}

/**
 * Sprawdza, ktore cele w mapie przekierowan nie maja odpowiadajacego
 * pliku pod `distDir`. Cele spoza serwisu (nie zaczynajace sie od '/')
 * sa poza zakresem kontroli.
 */
export function findMissingRedirectTargets(mapa, distDir) {
  const brakujace = [];
  for (const wpis of mapa) {
    if (!wpis.nowy.startsWith('/')) continue;
    if (!existsSync(join(distDir, plikDlaUrl(wpis.nowy)))) brakujace.push(wpis);
  }
  return brakujace;
}

/** Rzuca wyjatkiem z czytelnym raportem, jesli ktorykolwiek cel przekierowania nie istnieje. */
export function assertNoMissingRedirectTargets(mapa, distDir) {
  const brakujace = findMissingRedirectTargets(mapa, distDir);
  if (brakujace.length === 0) return;

  const raport = brakujace.map((m) => `  ${m.stary} -> ${m.nowy} (brak pliku)`).join('\n');
  throw new Error(
    `Kontrola przekierowan: ${brakujace.length} zepsutych celow.\n${raport}`
  );
}
