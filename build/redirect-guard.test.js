// build/redirect-guard.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findMissingRedirectTargets, assertNoMissingRedirectTargets } from './redirect-guard.js';

test('findMissingRedirectTargets zwraca puste gdy plik celu istnieje', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redirect-guard-'));
  mkdirSync(join(dir, 'aktualnosci/nowa-era-handlu'), { recursive: true });
  writeFileSync(join(dir, 'aktualnosci/nowa-era-handlu/index.html'), '');
  const mapa = [{ stary: '/index.php/aktualnosci/nowa-era-handlu', nowy: '/aktualnosci/nowa-era-handlu/' }];
  assert.deepEqual(findMissingRedirectTargets(mapa, dir), []);
  rmSync(dir, { recursive: true, force: true });
});

test('findMissingRedirectTargets zglasza brakujacy cel', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redirect-guard-'));
  const mapa = [{ stary: '/index.php/aktualnosci/brak', nowy: '/aktualnosci/brak/' }];
  const wynik = findMissingRedirectTargets(mapa, dir);
  assert.equal(wynik.length, 1);
  assert.equal(wynik[0].stary, '/index.php/aktualnosci/brak');
  assert.equal(wynik[0].nowy, '/aktualnosci/brak/');
  rmSync(dir, { recursive: true, force: true });
});

test('findMissingRedirectTargets obsluguje adres glowny "/"', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redirect-guard-'));
  writeFileSync(join(dir, 'index.html'), '');
  const mapa = [{ stary: '/index.php', nowy: '/' }];
  assert.deepEqual(findMissingRedirectTargets(mapa, dir), []);
  rmSync(dir, { recursive: true, force: true });
});

test('findMissingRedirectTargets pomija cele spoza dist (nie zaczynajace sie od /)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redirect-guard-'));
  const mapa = [{ stary: '/index.php/stary', nowy: 'https://inny-serwis.pl/' }];
  assert.deepEqual(findMissingRedirectTargets(mapa, dir), []);
  rmSync(dir, { recursive: true, force: true });
});

test('assertNoMissingRedirectTargets nie rzuca gdy wszystkie cele na miejscu', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redirect-guard-'));
  mkdirSync(join(dir, 'kontakt'), { recursive: true });
  writeFileSync(join(dir, 'kontakt/index.html'), '');
  assert.doesNotThrow(() =>
    assertNoMissingRedirectTargets([{ stary: '/index.php/kontakt', nowy: '/kontakt/' }], dir)
  );
  rmSync(dir, { recursive: true, force: true });
});

test('assertNoMissingRedirectTargets rzuca czytelny blad z lista brakujacych celow', () => {
  const dir = mkdtempSync(join(tmpdir(), 'redirect-guard-'));
  assert.throws(
    () => assertNoMissingRedirectTargets(
      [{ stary: '/index.php/aktualnosci/brak', nowy: '/aktualnosci/brak/' }],
      dir
    ),
    /aktualnosci\/brak/
  );
  rmSync(dir, { recursive: true, force: true });
});
