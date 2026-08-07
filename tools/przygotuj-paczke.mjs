// Sklada paczke wdrozeniowa do przekazania dzialowi IT.
//
// Uruchamiane przez `npm run paczka`, ktory najpierw odpala build. To celowe:
// poprzednia paczka w repozytorium byla o tydzien starsza od strony i ktokolwiek
// by ja wgral, opublikowalby nieaktualny wyglad serwisu. Paczka, ktorej nie da
// sie zrobic bez przebudowania, nie moze sie zestarzec.
//
// Wynik: biuro-prasowe-RRRR-MM-DD.zip (albo .tar.gz, gdy tar nie umie zip)
//
//   strona/          <- zawartosc katalogu glownego serwera
//   konfiguracja/    <- przekierowania 301 dla Apache/nginx/panelu
//   WYMAGANIA-HOSTINGOWE.md
//   PRZECZYTAJ-NAJPIERW.txt

import { cp, rm, mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const DIST = 'dist';
const ROBOCZY = '.paczka-tmp';

if (!existsSync(DIST)) {
  console.error('Brak katalogu dist/. Uruchom `npm run paczka`, nie sam ten skrypt.');
  process.exit(1);
}

const dzis = new Date().toISOString().slice(0, 10);
const nazwaBazowa = `biuro-prasowe-${dzis}`;

await rm(ROBOCZY, { recursive: true, force: true });
await mkdir(join(ROBOCZY, 'strona'), { recursive: true });
await mkdir(join(ROBOCZY, 'konfiguracja'), { recursive: true });

// strona/ — wszystko z dist/ poza redirects/, ktore nie jest trescia serwisu
for (const wpis of await readdir(DIST)) {
  if (wpis === 'redirects') continue;
  await cp(join(DIST, wpis), join(ROBOCZY, 'strona', wpis), { recursive: true });
}

// konfiguracja/ — mapa 301 w formatach do przepisania na serwer
for (const plik of ['.htaccess', 'nginx.conf', 'mapa.csv']) {
  await cp(join(DIST, 'redirects', plik), join(ROBOCZY, 'konfiguracja', plik));
}

await cp('docs/wymagania-hostingowe.md', join(ROBOCZY, 'WYMAGANIA-HOSTINGOWE.md'));

const liczba = (await readdir(join(ROBOCZY, 'strona'))).length;

await writeFile(
  join(ROBOCZY, 'PRZECZYTAJ-NAJPIERW.txt'),
  `BIURO PRASOWE ERLI — paczka wdrozeniowa z dnia ${dzis}
================================================================

CO GDZIE TRAFIA

  strona/         Zawartosc katalogu glownego serwera (webroot).
                  Wgrywa sie CALA zawartosc tego katalogu, nie sam katalog.

  konfiguracja/   NIE wgrywac na serwer. Mapa 104 przekierowan 301 ze starych
                  adresow Joomli, w trzech formatach do wyboru:
                    .htaccess    Apache
                    nginx.conf   nginx, do bloku server
                    mapa.csv     panel hostingu lub inne narzedzie

                  Bez tych przekierowan kazdy link do biura prasowego
                  z artykulow w mediach prowadzi na 404.

PLIKI _headers I _redirects W KATALOGU strona/

  Czytaja je hostingi typu Cloudflare Pages i Netlify — tam dzialaja same
  i katalog konfiguracja/ nie jest potrzebny. Na Apache, nginx i IIS sa
  bezczynne: wtedy obowiazuje katalog konfiguracja/, a naglowki z _headers
  trzeba przepisac na skladnie serwera (opisane w wymaganiach, punkt 2.6).

CZEGO SERWIS NIE POTRZEBUJE

  Bez bazy danych. Bez PHP i bez srodowiska uruchomieniowego. Bez zapisu
  na dysk w czasie dzialania. Bez sesji, cookies i formularzy.
  To wylacznie pliki do oddania przez serwer.

WYMAGANIA I LISTA KONTROLNA DO ODBIORU

  WYMAGANIA-HOSTINGOWE.md — punkt 6 to lista do odhaczenia przed
  przelaczeniem DNS.

ZAWARTOSC

  ${liczba} pozycji w katalogu glownego serwera, w tym 91 stron HTML.
`,
  'utf8'
);

// Archiwum. bsdtar (Windows 10+, macOS) tworzy zip przez -a; GNU tar na Linuksie
// tego nie umie, wiec tam schodzimy na .tar.gz.
let archiwum = `${nazwaBazowa}.zip`;
try {
  execFileSync('tar', ['-a', '-c', '-f', archiwum, '-C', ROBOCZY, '.'], { stdio: 'pipe' });
} catch {
  archiwum = `${nazwaBazowa}.tar.gz`;
  execFileSync('tar', ['-c', '-z', '-f', archiwum, '-C', ROBOCZY, '.'], { stdio: 'pipe' });
}

await rm(ROBOCZY, { recursive: true, force: true });

console.log(`Paczka gotowa: ${archiwum}`);
console.log('Zawiera strone, przekierowania, wymagania i instrukcje dla IT.');
