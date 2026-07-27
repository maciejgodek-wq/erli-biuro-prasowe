// build/frontmatter.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from './frontmatter.js';

test('parsuje proste pary klucz-wartosc', () => {
  const { data, body } = parseFrontmatter(
    '---\ntytul: Nowa era handlu\ndata: 2025-11-03\n---\nTresc artykulu.'
  );
  assert.equal(data.tytul, 'Nowa era handlu');
  assert.equal(data.data, '2025-11-03');
  assert.equal(body, 'Tresc artykulu.');
});

test('zachowuje dwukropki wewnatrz wartosci', () => {
  const { data } = parseFrontmatter('---\ntytul: AI od ERLI: nowa era\n---\n');
  assert.equal(data.tytul, 'AI od ERLI: nowa era');
});

test('parsuje jeden poziom zagniezdzenia', () => {
  const { data } = parseFrontmatter(
    '---\ntytul: Rekordowy rok\nzrodlo:\n  nazwa: Bankier.pl\n  url: https://bankier.pl/a\n---\n'
  );
  assert.deepEqual(data.zrodlo, { nazwa: 'Bankier.pl', url: 'https://bankier.pl/a' });
});

test('zdejmuje cudzyslowy z wartosci', () => {
  const { data } = parseFrontmatter('---\ntytul: "ERLI idzie na rekord"\n---\n');
  assert.equal(data.tytul, 'ERLI idzie na rekord');
});

test('pomija puste linie i komentarze', () => {
  const { data } = parseFrontmatter('---\n# komentarz\n\ntytul: X\n---\n');
  assert.deepEqual(data, { tytul: 'X' });
});

test('radzi sobie z zakonczeniami linii CRLF', () => {
  const { data, body } = parseFrontmatter('---\r\ntytul: X\r\n---\r\nTresc.');
  assert.equal(data.tytul, 'X');
  assert.equal(body, 'Tresc.');
});

test('zwraca pusty obiekt gdy brak frontmattera', () => {
  const { data, body } = parseFrontmatter('Sama tresc.');
  assert.deepEqual(data, {});
  assert.equal(body, 'Sama tresc.');
});
