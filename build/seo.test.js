// build/seo.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSitemap, buildRobots, DOMENA } from './seo.js';

test('domena jest ustawiona na biuroprasowe.erli.pl', () => {
  assert.equal(DOMENA, 'https://biuroprasowe.erli.pl');
});

test('sitemap zawiera deklaracje XML i namespace', () => {
  const xml = buildSitemap([{ url: '/', lastmod: '2026-07-27' }]);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
});

test('sitemap buduje pelne adresy z domeny i sciezki', () => {
  const xml = buildSitemap([{ url: '/aktualnosci/nowa-era/', lastmod: '2025-11-03' }]);
  assert.match(xml, /<loc>https:\/\/biuroprasowe\.erli\.pl\/aktualnosci\/nowa-era\/<\/loc>/);
  assert.match(xml, /<lastmod>2025-11-03<\/lastmod>/);
});

test('sitemap ma jeden wpis url na strone', () => {
  const xml = buildSitemap([
    { url: '/', lastmod: '2026-07-27' },
    { url: '/kontakt/', lastmod: '2026-07-27' },
  ]);
  assert.equal(xml.match(/<url>/g).length, 2);
});

test('robots wskazuje sitemap i dopuszcza indeksowanie', () => {
  const txt = buildRobots();
  assert.match(txt, /User-agent: \*/);
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Sitemap: https:\/\/biuroprasowe\.erli\.pl\/sitemap\.xml/);
});
