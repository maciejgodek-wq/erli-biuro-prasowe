// build/lang-guard.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findGerman } from './lang-guard.js';

test('czysto polski HTML nie daje trafien', () => {
  const html = '<p>Zapraszamy do kontaktu z biurem prasowym ERLI.</p>';
  assert.deepEqual(findGerman(html, 'index.html'), []);
});

test('wykrywa niemieckie znaki diakrytyczne w tresci', () => {
  const hits = findGerman('<p>Günstig einkaufen</p>', 'x.html');
  assert.equal(hits.length, 1);
  assert.match(hits[0].fragment, /Günstig/);
});

test('wykrywa niemiecki aria-label z diakrytykami', () => {
  const hits = findGerman('<button aria-label="Menü öffnen">x</button>', 'x.html');
  assert.ok(hits.some((h) => h.kontekst === 'aria-label'));
});

test('wykrywa niemiecki aria-label bez diakrytykow po slowie kluczowym', () => {
  const hits = findGerman('<button aria-label="Menu schliessen">x</button>', 'x.html');
  assert.ok(hits.some((h) => h.kontekst === 'aria-label' && h.trafienie === 'schliessen'));
});

test('wykrywa niemieckie slowo kluczowe w atrybucie alt', () => {
  const hits = findGerman('<img alt="Der neue Marktplatz">', 'x.html');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].kontekst, 'alt');
});

test('wykrywa niemieckie slowo w tresci strony', () => {
  const hits = findGerman('<p>Das ist ein Test</p>', 'x.html');
  assert.ok(hits.length >= 1);
});

test('pomija zawartosc script i style', () => {
  const html = '<style>.a{content:"über"}</style><script>var x="für";</script><p>Polski tekst.</p>';
  assert.deepEqual(findGerman(html, 'x.html'), []);
});

test('polskie slowa podobne do niemieckich nie sa trafieniami', () => {
  const html = '<p>Kontakt dla mediow. Nie ma tu nic obcego.</p>';
  assert.deepEqual(findGerman(html, 'x.html'), []);
});

test('trafienie zawiera nazwe pliku', () => {
  const hits = findGerman('<p>Marktplatz</p>', 'aktualnosci/index.html');
  assert.equal(hits[0].plik, 'aktualnosci/index.html');
});
