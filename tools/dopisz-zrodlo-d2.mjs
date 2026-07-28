// Jednorazowy skrypt (D2): dopisuje pole `zrodlo:` jedynemu artykulowi Media
// o ERLI, ktoremu go brakuje. znajdzZrodlo() w tools/joomla-extract.mjs szuka
// linku w formacie markdown [tekst](url) — nie znalazla go tutaj, bo w
// oryginalnym HTML redaktor wkleil sam adres jako zwykly tekst, bez znacznika
// <a href>. To literowka w tresci zrodlowej z Joomli, nie blad ekstraktora
// (potwierdzone w old_reference/BAZA/erlipl_db.sql).
//
// Uruchomienie: node tools/dopisz-zrodlo-d2.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const PLIK =
  'src/posts/media/2024-11-09-czlowiek-ktory-chce-zlamac-potege-allegro-byl-taki-moment-ze-kazdego-miesiaca-tracilismy-3-miliony-zlotych.md';
const ZRODLO = {
  nazwa: 'wyborcza.biz',
  url: 'https://wyborcza.biz/biznes/7,147743,31420277,czlowiek-ktory-chce-zlamac-potege-allegro-byl-taki-moment.html',
};

const raw = readFileSync(PLIK, 'utf8');

if (/^zrodlo:/m.test(raw)) {
  console.log('Pole zrodlo juz istnieje — nic do zrobienia.');
  process.exit(0);
}

const idxKoniecFrontu = raw.indexOf('---', 3) + 3;
const front = raw.slice(0, idxKoniecFrontu - 3);
const reszta = raw.slice(idxKoniecFrontu - 3);

const nowyFront = `${front}zrodlo:\n  nazwa: ${ZRODLO.nazwa}\n  url: ${ZRODLO.url}\n`;
writeFileSync(PLIK, nowyFront + reszta, 'utf8');
console.log(`Dopisano zrodlo do: ${PLIK}`);
