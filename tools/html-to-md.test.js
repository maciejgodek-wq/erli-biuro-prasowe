import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripEditorChrome, htmlToMarkdown, CHROME_SLOWNIK } from './html-to-md.mjs';

test('usuwa poddrzewo ba-edit-item razem z zawartoscia', () => {
  const html = `<div class="ba-wrapper">
    <div class="ba-edit-item"><span class="ba-tooltip">Add New Row</span></div>
    <p>Prawdziwa tresc.</p>
  </div>`;
  const out = stripEditorChrome(html);
  assert.doesNotMatch(out, /Add New Row/);
  assert.match(out, /Prawdziwa tresc/);
});

test('usuwa zagniezdzone poddrzewa interfejsu', () => {
  const html = `<div class="ba-buttons-wrapper">
    <span class="ba-edit-wrapper"><span class="ba-tooltip">Delete Item</span></span>
  </div><p>Tekst.</p>`;
  const out = stripEditorChrome(html);
  assert.doesNotMatch(out, /Delete Item/);
  assert.match(out, /Tekst/);
});

test('zaden termin ze slownika interfejsu nie przezywa', () => {
  const html =
    '<div class="ba-edit-item">' +
    CHROME_SLOWNIK.map((t) => `<span class="ba-tooltip">${t}</span>`).join('') +
    '</div><p>Komunikat prasowy.</p>';
  const out = stripEditorChrome(html);
  for (const t of CHROME_SLOWNIK) {
    assert.doesNotMatch(out, new RegExp(t), `przeciekl termin: ${t}`);
  }
});

test('naglowki zaczynaja sie od h2, nigdy h1', () => {
  assert.equal(htmlToMarkdown('<h1>Tytul</h1>').trim(), '## Tytul');
  assert.equal(htmlToMarkdown('<h2>Srodtytul</h2>').trim(), '## Srodtytul');
  assert.equal(htmlToMarkdown('<h3>Nizej</h3>').trim(), '### Nizej');
});

test('akapity rozdzielone pusta linia', () => {
  assert.equal(htmlToMarkdown('<p>Raz</p><p>Dwa</p>').trim(), 'Raz\n\nDwa');
});

test('pogrubienie i kursywa', () => {
  assert.equal(htmlToMarkdown('<p><strong>A</strong> i <em>B</em></p>').trim(), '**A** i *B*');
});

test('cytat blokowy', () => {
  assert.equal(htmlToMarkdown('<blockquote><p>Cytat</p></blockquote>').trim(), '> Cytat');
});

test('link zachowuje adres', () => {
  assert.equal(
    htmlToMarkdown('<p><a href="https://bankier.pl/a">Bankier</a></p>').trim(),
    '[Bankier](https://bankier.pl/a)'
  );
});

test('lista punktowana', () => {
  assert.equal(htmlToMarkdown('<ul><li>Jeden</li><li>Dwa</li></ul>').trim(), '- Jeden\n- Dwa');
});

test('dekoduje encje na prawdziwe znaki', () => {
  assert.equal(htmlToMarkdown('<p>zakup&oacute;w&nbsp;online</p>').trim(), 'zakupów online');
  assert.equal(htmlToMarkdown('<p>AI &amp; ERLI</p>').trim(), 'AI & ERLI');
});

test('usuwa atrybuty style i class', () => {
  const out = htmlToMarkdown('<p style="color:red" class="x">Tekst</p>');
  assert.doesNotMatch(out, /style|class|color/);
});

test('pomija puste akapity i nadmiarowe puste linie', () => {
  const out = htmlToMarkdown('<p>A</p><p></p><p>&nbsp;</p><p>B</p>').trim();
  assert.equal(out, 'A\n\nB');
});

test('nie zostawia zadnych znacznikow HTML', () => {
  const out = htmlToMarkdown('<div><p>Tekst <span>w spanie</span></p></div>');
  assert.doesNotMatch(out, /<[a-z]/i);
});
