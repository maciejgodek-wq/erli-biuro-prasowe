// tools/kv-generate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wybierzWariant, buildSvg, WARIANTY, lamTytul } from './kv-generate.js';

test('sa trzy warianty', () => {
  assert.equal(WARIANTY.length, 3);
});

test('wybor wariantu jest deterministyczny', () => {
  assert.equal(wybierzWariant('nowa-era-handlu'), wybierzWariant('nowa-era-handlu'));
});

test('rozne slugi trafiaja na rozne warianty', () => {
  const uzyte = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(wybierzWariant).map((w) => w.nazwa));
  assert.ok(uzyte.size > 1, 'wszystkie slugi trafily na jeden wariant');
});

test('lamTytul dzieli na linie po slowach', () => {
  const linie = lamTytul('Nowa era handlu online AI od ERLI dla sprzedawcow', 22);
  assert.ok(linie.length > 1);
  assert.ok(linie.every((l) => l.length <= 22 || !l.includes(' ')));
});

test('lamTytul ogranicza liczbe linii', () => {
  const linie = lamTytul('a b c d e f g h i j k l m n o p q r s t u v w x y z', 10, 3);
  assert.ok(linie.length <= 3);
});

test('SVG ma wymiary 1200x630', () => {
  const svg = buildSvg({ tytul: 'Test', kategoria: 'Aktualności', slug: 'test' });
  assert.match(svg, /viewBox="0 0 1200 630"/);
});

test('SVG escapuje znaki specjalne w tytule', () => {
  const svg = buildSvg({ tytul: 'AI & ERLI', kategoria: 'Aktualności', slug: 'x' });
  assert.match(svg, /AI &amp; ERLI/);
  assert.doesNotMatch(svg, /AI & ERLI/);
});
