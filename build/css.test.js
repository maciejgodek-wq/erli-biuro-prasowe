// build/css.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concatCss, CSS_ORDER } from './css.js';

test('kolejnosc zrodel jest ustalona', () => {
  assert.deepEqual(CSS_ORDER, ['tokens.css', 'base.css', 'layout.css', 'components.css', 'press.css']);
});

test('skleja w podanej kolejnosci', () => {
  const out = concatCss([
    { name: 'tokens.css', content: ':root{--a:1}' },
    { name: 'base.css', content: 'body{margin:0}' },
  ]);
  assert.ok(out.indexOf(':root{--a:1}') < out.indexOf('body{margin:0}'));
});

test('wstawia naglowek ostrzegajacy przed reczna edycja', () => {
  const out = concatCss([{ name: 'tokens.css', content: ':root{}' }]);
  assert.match(out, /Plik generowany/);
  assert.match(out, /nie edytuj/i);
});

test('oznacza granice miedzy plikami zrodlowymi', () => {
  const out = concatCss([
    { name: 'tokens.css', content: 'a{}' },
    { name: 'base.css', content: 'b{}' },
  ]);
  assert.match(out, /tokens\.css/);
  assert.match(out, /base\.css/);
});
