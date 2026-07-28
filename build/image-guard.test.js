// build/image-guard.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findImageRefs, findMissingImages, assertNoMissingImages } from './image-guard.js';

test('znajduje odwolania src= do obrazkow', () => {
  const html = '<img src="/assets/img/foo.webp"><img src="/assets/img/bar.png">';
  assert.deepEqual(findImageRefs(html), ['/assets/img/foo.webp', '/assets/img/bar.png']);
});

test('znajduje og:image i twitter:image jako pelny adres', () => {
  const html =
    '<meta property="og:image" content="https://biuroprasowe.erli.pl/assets/img/kv/default.webp">' +
    '<meta name="twitter:image" content="https://biuroprasowe.erli.pl/assets/img/kv/default.webp">';
  assert.deepEqual(findImageRefs(html), [
    'https://biuroprasowe.erli.pl/assets/img/kv/default.webp',
    'https://biuroprasowe.erli.pl/assets/img/kv/default.webp',
  ]);
});

test('pomija odwolania bez rozszerzenia obrazkowego (js, css, font)', () => {
  const html = '<script src="/assets/js/nav.js"></script><link href="/assets/css/main.css">';
  assert.deepEqual(findImageRefs(html), []);
});

test('findMissingImages zwraca puste gdy plik istnieje na dysku', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-guard-'));
  mkdirSync(join(dir, 'assets/img'), { recursive: true });
  writeFileSync(join(dir, 'assets/img/foo.webp'), '');
  const html = '<img src="/assets/img/foo.webp">';
  assert.deepEqual(findMissingImages(html, 'x.html', dir), []);
  rmSync(dir, { recursive: true, force: true });
});

test('findMissingImages zglasza brakujacy plik', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-guard-'));
  const html = '<img src="/assets/img/brak.webp">';
  const wynik = findMissingImages(html, 'x.html', dir);
  assert.equal(wynik.length, 1);
  assert.equal(wynik[0].plik, 'x.html');
  assert.equal(wynik[0].ref, '/assets/img/brak.webp');
  rmSync(dir, { recursive: true, force: true });
});

test('findMissingImages sciaga domene z og:image przed sprawdzeniem dysku', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-guard-'));
  mkdirSync(join(dir, 'assets/img/kv'), { recursive: true });
  writeFileSync(join(dir, 'assets/img/kv/default.webp'), '');
  const html = '<meta property="og:image" content="https://biuroprasowe.erli.pl/assets/img/kv/default.webp">';
  assert.deepEqual(findMissingImages(html, 'x.html', dir), []);
  rmSync(dir, { recursive: true, force: true });
});

test('assertNoMissingImages nie rzuca gdy wszystko na miejscu', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-guard-'));
  mkdirSync(join(dir, 'assets/img'), { recursive: true });
  writeFileSync(join(dir, 'assets/img/foo.webp'), '');
  assert.doesNotThrow(() =>
    assertNoMissingImages([{ sciezka: 'x.html', html: '<img src="/assets/img/foo.webp">' }], dir)
  );
  rmSync(dir, { recursive: true, force: true });
});

test('assertNoMissingImages rzuca czytelny blad z lista brakujacych', () => {
  const dir = mkdtempSync(join(tmpdir(), 'img-guard-'));
  assert.throws(
    () => assertNoMissingImages([{ sciezka: 'x.html', html: '<img src="/assets/img/brak.webp">' }], dir),
    /brak\.webp/
  );
  rmSync(dir, { recursive: true, force: true });
});
