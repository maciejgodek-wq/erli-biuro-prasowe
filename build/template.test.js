// build/template.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render, escapeHtml } from './template.js';

test('escapuje znaki specjalne HTML', () => {
  assert.equal(escapeHtml('<b>"x" & \'y\'</b>'), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
});

test('podstawia zmienna z escapowaniem', () => {
  assert.equal(render('<h1>{{ tytul }}</h1>', { tytul: 'AI & ERLI' }), '<h1>AI &amp; ERLI</h1>');
});

test('potrojne nawiasy wstawiaja surowy HTML', () => {
  assert.equal(render('<div>{{{ tresc }}}</div>', { tresc: '<p>Akapit</p>' }), '<div><p>Akapit</p></div>');
});

test('brakujaca zmienna daje pusty ciag', () => {
  assert.equal(render('[{{ brak }}]', {}), '[]');
});

test('siega do zagniezdzonych pol przez kropke', () => {
  assert.equal(render('{{ zrodlo.nazwa }}', { zrodlo: { nazwa: 'Bankier.pl' } }), 'Bankier.pl');
});

test('each iteruje po tablicy', () => {
  const out = render('{{#each posty}}<li>{{ tytul }}</li>{{/each}}', {
    posty: [{ tytul: 'A' }, { tytul: 'B' }],
  });
  assert.equal(out, '<li>A</li><li>B</li>');
});

test('each po pustej tablicy nic nie renderuje', () => {
  assert.equal(render('[{{#each posty}}x{{/each}}]', { posty: [] }), '[]');
});

test('each udostepnia zmienne z zakresu nadrzednego', () => {
  const out = render('{{#each posty}}{{ marka }}:{{ tytul }} {{/each}}', {
    marka: 'ERLI',
    posty: [{ tytul: 'A' }],
  });
  assert.equal(out, 'ERLI:A ');
});

test('if renderuje blok gdy wartosc prawdziwa', () => {
  assert.equal(render('{{#if zrodlo}}jest{{/if}}', { zrodlo: { nazwa: 'X' } }), 'jest');
});

test('if pomija blok gdy wartosc falszywa lub pusta tablica', () => {
  assert.equal(render('{{#if zrodlo}}jest{{/if}}', { zrodlo: null }), '');
  assert.equal(render('{{#if lista}}jest{{/if}}', { lista: [] }), '');
});

test('if obsluguje galaz else', () => {
  assert.equal(render('{{#if x}}A{{else}}B{{/if}}', { x: false }), 'B');
});

test('each zagniezdzony w each dobiera wlasne domkniecie', () => {
  const out = render(
    '{{#each grupy}}[{{ rok }}:{{#each posty}}{{ tytul }},{{/each}}]{{/each}}',
    {
      grupy: [
        { rok: '2025', posty: [{ tytul: 'A' }, { tytul: 'B' }] },
        { rok: '2024', posty: [{ tytul: 'C' }] },
      ],
    }
  );
  assert.equal(out, '[2025:A,B,][2024:C,]');
});

test('if zagniezdzony w if nie zjada zewnetrznego domkniecia', () => {
  const szablon = '{{#if maPaginacje}}<nav>{{#if poprzednia}}P{{/if}}|{{ numer }}{{/if}}';
  assert.equal(render(szablon, { maPaginacje: true, poprzednia: null, numer: 1 }), '<nav>|1');
  assert.equal(render(szablon, { maPaginacje: false, poprzednia: '/2/', numer: 1 }), '');
});

test('else dotyczy bloku zewnetrznego, nie zagniezdzonego', () => {
  const szablon = '{{#if a}}{{#if b}}AB{{else}}A{{/if}}{{else}}nic{{/if}}';
  assert.equal(render(szablon, { a: true, b: true }), 'AB');
  assert.equal(render(szablon, { a: true, b: false }), 'A');
  assert.equal(render(szablon, { a: false, b: true }), 'nic');
});

test('niedomkniety blok rzuca czytelny blad', () => {
  assert.throws(() => render('{{#if x}}bez konca', { x: true }), /Niedomkniety blok/);
});

test('partial jest wstawiany i ma dostep do danych', () => {
  const partials = { stopka: '<footer>{{ rok }}</footer>' };
  assert.equal(render('{{> stopka }}', { rok: '2026' }, partials), '<footer>2026</footer>');
});

test('nieznany partial rzuca czytelny blad', () => {
  assert.throws(() => render('{{> brak }}', {}, {}), /Nieznany partial: brak/);
});
