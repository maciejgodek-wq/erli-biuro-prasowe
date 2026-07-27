// build/paginate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate, PROG_PAGINACJI } from './paginate.js';

test('prog wynosi 30', () => {
  assert.equal(PROG_PAGINACJI, 30);
});

test('ponizej progu zwraca jedna strone bez nawigacji', () => {
  const strony = paginate(Array.from({ length: 20 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony.length, 1);
  assert.equal(strony[0].url, '/aktualnosci/');
  assert.equal(strony[0].poprzednia, null);
  assert.equal(strony[0].nastepna, null);
  assert.equal(strony[0].elementy.length, 20);
});

test('dokladnie na progu nadal jedna strona', () => {
  const strony = paginate(Array.from({ length: 30 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony.length, 1);
});

test('powyzej progu dzieli na strony po 30', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony.length, 3);
  assert.equal(strony[0].elementy.length, 30);
  assert.equal(strony[2].elementy.length, 5);
});

test('pierwsza strona zachowuje czysty adres', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony[0].url, '/aktualnosci/');
  assert.equal(strony[1].url, '/aktualnosci/2/');
  assert.equal(strony[2].url, '/aktualnosci/3/');
});

test('linki poprzednia i nastepna sa spojne', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony[0].poprzednia, null);
  assert.equal(strony[0].nastepna, '/aktualnosci/2/');
  assert.equal(strony[1].poprzednia, '/aktualnosci/');
  assert.equal(strony[1].nastepna, '/aktualnosci/3/');
  assert.equal(strony[2].nastepna, null);
});

test('kazda strona zna swoj numer i laczna liczbe', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony[1].numer, 2);
  assert.equal(strony[1].lacznie, 3);
});

test('pusta lista daje jedna pusta strone', () => {
  const strony = paginate([], '/aktualnosci/');
  assert.equal(strony.length, 1);
  assert.equal(strony[0].elementy.length, 0);
});
