// build/posts.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugFromFilename, sortByDateDesc, groupByYear, formatDatePl } from './posts.js';

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
