// build/markdown.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { podniesNaglowki } from './markdown.js';

test('podnosi h3 do h2', () => {
  assert.equal(podniesNaglowki('<h3>Tytul sekcji</h3>'), '<h2>Tytul sekcji</h2>');
});

test('zachowuje atrybuty naglowka', () => {
  assert.equal(podniesNaglowki('<h3 id="abc">X</h3>'), '<h2 id="abc">X</h2>');
});

test('nie rusza pozostalych poziomow ani tresci', () => {
  const wejscie = '<h2>Dwa</h2><p>h3 w tekscie</p><h4>Cztery</h4>';
  assert.equal(podniesNaglowki(wejscie), wejscie);
});

test('obsluguje wiele naglowkow w jednym dokumencie', () => {
  assert.equal(
    podniesNaglowki('<h3>A</h3><p>x</p><h3>B</h3>'),
    '<h2>A</h2><p>x</p><h2>B</h2>'
  );
});

test('pusty wejsciowy html nie wywraca funkcji', () => {
  assert.equal(podniesNaglowki(''), '');
  assert.equal(podniesNaglowki(null), '');
});
import { renderMarkdown, plainText } from './markdown.js';

test('renderuje akapity', () => {
  assert.match(renderMarkdown('Pierwszy akapit.'), /<p>Pierwszy akapit\.<\/p>/);
});

test('srodtytuly zaczynaja sie od h2', () => {
  assert.match(renderMarkdown('## Technologia w odpowiedzi'), /<h2[^>]*>Technologia w odpowiedzi<\/h2>/);
});

test('cytaty blokowe', () => {
  assert.match(renderMarkdown('> Cytat prezesa'), /<blockquote>/);
});

test('linki zewnetrzne dostaja target i rel', () => {
  const html = renderMarkdown('[Bankier](https://bankier.pl/a)');
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('linki wewnetrzne nie dostaja target', () => {
  const html = renderMarkdown('[Kontakt](/kontakt/)');
  assert.doesNotMatch(html, /target="_blank"/);
});

test('plainText zdejmuje znaczniki i skraca', () => {
  assert.equal(plainText('<p>Ala ma <strong>kota</strong>.</p>'), 'Ala ma kota.');
});

test('plainText dekoduje encje', () => {
  assert.equal(plainText('<p>AI &amp; ERLI</p>'), 'AI & ERLI');
});
