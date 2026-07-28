// build/redirects.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRedirectMap, toHtaccess, toNginx, toCsv } from './redirects.js';

const POSTY = [
  { kategoria: 'aktualnosci', slug: 'nowa-era-handlu', url: '/aktualnosci/nowa-era-handlu/' },
  { kategoria: 'media-o-erli', slug: 'rekordowy-rok', url: '/media-o-erli/rekordowy-rok/' },
  { kategoria: 'media-o-erli', slug: 'erli-idzie-na-rekord-2-2-2', url: '/media-o-erli/erli-idzie-na-rekord-2-2-2/' },
];

test('mapuje stare adresy Joomli na nowe', () => {
  const mapa = buildRedirectMap(POSTY);
  assert.deepEqual(mapa[0], {
    stary: '/index.php/aktualnosci/nowa-era-handlu',
    nowy: '/aktualnosci/nowa-era-handlu/',
  });
});

test('mapuje takze adresy list i stron statycznych', () => {
  const mapa = buildRedirectMap(POSTY);
  const stare = mapa.map((r) => r.stary);
  assert.ok(stare.includes('/index.php/aktualnosci'));
  assert.ok(stare.includes('/index.php/media-o-erli'));
  assert.ok(stare.includes('/index.php/o-nas'));
  assert.ok(stare.includes('/index.php/kontakt'));
});

test('format htaccess uzywa Redirect 301', () => {
  const out = toHtaccess(buildRedirectMap(POSTY));
  assert.match(out, /Redirect 301 \/index\.php\/aktualnosci\/nowa-era-handlu \/aktualnosci\/nowa-era-handlu\//);
});

test('format nginx uzywa rewrite permanent', () => {
  const out = toNginx(buildRedirectMap(POSTY));
  assert.match(out, /rewrite \^\/index\\\.php\/aktualnosci\/nowa-era-handlu\$ \/aktualnosci\/nowa-era-handlu\/ permanent;/);
});

test('CSV ma naglowek i jeden wiersz na przekierowanie', () => {
  const out = toCsv(buildRedirectMap(POSTY));
  const linie = out.trim().split('\n');
  assert.equal(linie[0], 'stary_adres,nowy_adres');
  assert.equal(linie.length, buildRedirectMap(POSTY).length + 1);
});

test('brak duplikatow w mapie', () => {
  const mapa = buildRedirectMap([...POSTY, ...POSTY]);
  const stare = mapa.map((r) => r.stary);
  assert.equal(new Set(stare).size, stare.length);
});

test('duplikaty kieruja na wersje kanoniczna', () => {
  const mapa = buildRedirectMap(POSTY, [
    { stary: 'erli-idzie-na-rekord', kategoria: 'media-o-erli', slug: 'erli-idzie-na-rekord-2-2-2' },
  ]);
  const wpis = mapa.find((r) => r.stary === '/index.php/aktualnosci/erli-idzie-na-rekord');
  assert.equal(wpis.nowy, '/media-o-erli/erli-idzie-na-rekord-2-2-2/');
});

test('duplikat nie nadpisuje adresu prawdziwego artykulu', () => {
  const mapa = buildRedirectMap(POSTY, [
    { stary: 'nowa-era-handlu', kategoria: 'media-o-erli', slug: 'rekordowy-rok' },
  ]);
  const wpis = mapa.find((r) => r.stary === '/index.php/aktualnosci/nowa-era-handlu');
  assert.equal(wpis.nowy, '/aktualnosci/nowa-era-handlu/');
});

test('kanoniczny adres duplikatu wynika z post.url artykulu, nie z osobno zapisanego lancucha', () => {
  // Slug > 80 znakow, tak jak skrocSlug() przycina go w loadPosts() (B2).
  // Regresja: duplikaty.json trzymal kiedys sztywny URL z pelnym slugiem,
  // ktory przestal istniec po skroceniu — stad ten test buduje "kanoniczny"
  // post z jego prawdziwym (skroconym) post.url, nie z recznie wpisanego adresu.
  const dlugiSlug = 'platforma-e-commerce-erli-z-rekordowymi-wynikami-za-pierwsze-polrocze-2025-2-2-2-2';
  const posty = [
    ...POSTY,
    { kategoria: 'aktualnosci', slug: dlugiSlug, url: '/aktualnosci/platforma-e-commerce-erli-z-rekordowymi-wynikami-za-pierwsze-polrocze-2025/' },
  ];
  const mapa = buildRedirectMap(posty, [
    { stary: 'platforma-e-commerce-erli-z-rekordowymi-wynikami-za-pierwsze-polrocze-2025-2', kategoria: 'aktualnosci', slug: dlugiSlug },
  ]);
  const wpis = mapa.find((r) => r.stary === '/index.php/aktualnosci/platforma-e-commerce-erli-z-rekordowymi-wynikami-za-pierwsze-polrocze-2025-2');
  assert.equal(wpis.nowy, '/aktualnosci/platforma-e-commerce-erli-z-rekordowymi-wynikami-za-pierwsze-polrocze-2025/');
});

test('duplikat wskazujacy na nieistniejacy artykul kanoniczny rzuca czytelny blad', () => {
  assert.throws(
    () => buildRedirectMap(POSTY, [
      { stary: 'erli-idzie-na-rekord', kategoria: 'media-o-erli', slug: 'nie-istnieje' },
    ]),
    /media-o-erli\/nie-istnieje/
  );
});
