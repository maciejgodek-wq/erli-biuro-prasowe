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

// Przypadek z produkcji: 2 artykuly mialy cytat w tytule i backslash
// wychodzil na strone razem z cudzyslowem.
test('odkodowuje cudzyslowy w srodku wartosci', () => {
  const { data } = parseFrontmatter(
    '---\ntytul: "Allegro.\\"Byl taki moment\\""\n---\n'
  );
  assert.equal(data.tytul, 'Allegro."Byl taki moment"');
});

test('odkodowuje podwojny backslash', () => {
  const { data } = parseFrontmatter('---\ntytul: "sciezka C:\\\\dane"\n---\n');
  assert.equal(data.tytul, 'sciezka C:\\dane');
});

test('nie rusza backslasha w apostrofach — YAML nie zna tam ucieczki', () => {
  const { data } = parseFrontmatter("---\ntytul: 'bez \\\" ucieczki'\n---\n");
  assert.equal(data.tytul, 'bez \\" ucieczki');
});

test('nie rusza backslasha w wartosci bez cudzyslowow', () => {
  const { data } = parseFrontmatter('---\ntytul: bez \\" cudzyslowow\n---\n');
  assert.equal(data.tytul, 'bez \\" cudzyslowow');
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
