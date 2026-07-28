// build/posts.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugFromFilename, sortByDateDesc, groupByYear, formatDatePl, skrocSlug } from './posts.js';

test('slug pomija prefiks daty w nazwie pliku', () => {
  assert.equal(slugFromFilename('2025-11-03-nowa-era-handlu.md'), 'nowa-era-handlu');
});

test('slug dziala bez prefiksu daty', () => {
  assert.equal(slugFromFilename('o-nas.md'), 'o-nas');
});

test('sortuje malejaco po dacie', () => {
  const sorted = sortByDateDesc([
    { data: '2024-05-22', slug: 'b' },
    { data: '2025-11-03', slug: 'a' },
    { data: '2023-10-24', slug: 'c' },
  ]);
  assert.deepEqual(sorted.map((p) => p.slug), ['a', 'b', 'c']);
});

test('sortowanie nie modyfikuje tablicy wejsciowej', () => {
  const input = [{ data: '2024-01-01', slug: 'x' }, { data: '2025-01-01', slug: 'y' }];
  sortByDateDesc(input);
  assert.equal(input[0].slug, 'x');
});

test('przy tej samej dacie sortuje alfabetycznie po slugu', () => {
  const sorted = sortByDateDesc([
    { data: '2025-03-05', slug: 'zebra' },
    { data: '2025-03-05', slug: 'alfa' },
  ]);
  assert.deepEqual(sorted.map((p) => p.slug), ['alfa', 'zebra']);
});

test('grupuje po latach, najnowszy rok pierwszy', () => {
  const groups = groupByYear([
    { data: '2025-11-03', slug: 'a' },
    { data: '2025-03-05', slug: 'b' },
    { data: '2024-10-28', slug: 'c' },
  ]);
  assert.deepEqual(groups.map((g) => g.rok), ['2025', '2024']);
  assert.equal(groups[0].posty.length, 2);
  assert.equal(groups[1].posty.length, 1);
});

test('formatuje date po polsku', () => {
  assert.equal(formatDatePl('2025-11-03'), '3 listopada 2025');
  assert.equal(formatDatePl('2024-05-22'), '22 maja 2024');
  assert.equal(formatDatePl('2023-01-09'), '9 stycznia 2023');
});

test('skrocSlug nie rusza sluga krotszego niz limit', () => {
  assert.equal(skrocSlug('nowa-era-handlu', 80), 'nowa-era-handlu');
});

test('skrocSlug nie rusza sluga dokladnie na limicie', () => {
  const slug = 'a'.repeat(80);
  assert.equal(skrocSlug(slug, 80), slug);
});

test('skrocSlug tnie na granicy wyrazu (dywiz), nie w srodku slowa', () => {
  const slug = 'kolejny-przelomowy-rok-erli-platforma-rozwija-sie-6-razy-szybciej-niz-rynek-i-osiaga-czolowa-pozycje-na-polskim-rynku-wsrod-marketplace-ow-w-zaledwie-3-lata-od-startu';
  const wynik = skrocSlug(slug, 80);
  assert.ok(wynik.length <= 80);
  assert.ok(!wynik.endsWith('-'));
  assert.ok(slug.startsWith(wynik));
  // nastepny znak po wyniku w oryginale to dywiz albo koniec slowa - nie przeciete w srodku
  assert.equal(slug[wynik.length], '-');
});

test('skrocSlug jest deterministyczny (ten sam wsad, ten sam wynik)', () => {
  const slug = 'erli-jako-pierwsze-w-regionie-emea-przeprowadzilo-innowacyjne-badanie-meta-conversion-lift-wzbogacone-o-metodologie-channel-lift-do-celow-sprzedazowych';
  assert.equal(skrocSlug(slug, 80), skrocSlug(slug, 80));
});

test('skrocSlug domyslny limit to 80 znakow', () => {
  const dlugi = 'a-' + 'b'.repeat(90);
  assert.ok(skrocSlug(dlugi).length <= 80);
});
