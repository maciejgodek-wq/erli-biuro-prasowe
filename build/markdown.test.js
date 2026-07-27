// build/markdown.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
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
