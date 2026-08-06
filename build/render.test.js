// build/render.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadDublujeTresc } from './render.js';

test('lead powtorzony w tresci jest wykrywany', () => {
  const lead = 'Przychody ERLI wzrosly o 62% do 189,7 mln zl w trzecim kwartale.';
  const tresc = 'Platforma podsumowuje kwartal. Przychody ERLI wzrosly o 62% do 189,7 mln zl w trzecim kwartale. Dalszy ciag tekstu.';
  assert.equal(leadDublujeTresc(lead, tresc), true);
});

test('porownuje pierwsze zdanie, wiec doklejony tytul nie przeszkadza', () => {
  const lead = 'Przychody ERLI wzrosly o 62% do 189,7 mln zl w trzecim kwartale. ERLI z rekordowym wzrostem po 9 miesiacach.';
  const tresc = 'Przychody ERLI wzrosly o 62% do 189,7 mln zl w trzecim kwartale.';
  assert.equal(leadDublujeTresc(lead, tresc), true);
});

test('lead nieobecny w tresci nie jest wykrywany', () => {
  const lead = 'Zupelnie inne zdanie wprowadzajace, ktore nie pada w tekscie artykulu.';
  assert.equal(leadDublujeTresc(lead, 'Tresc artykulu o czym innym.'), false);
});

test('rozne zawijanie wierszy nie psuje porownania', () => {
  const lead = 'Przychody ERLI wzrosly o 62% do 189,7 mln zl w trzecim kwartale.';
  const tresc = 'Przychody ERLI\n  wzrosly o 62%   do 189,7 mln zl\nw trzecim kwartale.';
  assert.equal(leadDublujeTresc(lead, tresc), true);
});

test('krotkie zdanie nie wystarcza — za duze ryzyko przypadkowego trafienia', () => {
  assert.equal(leadDublujeTresc('Rekordowy rok.', 'Rekordowy rok. I dalszy tekst.'), false);
});

test('brak leadu lub tresci zwraca false', () => {
  assert.equal(leadDublujeTresc('', 'cokolwiek'), false);
  assert.equal(leadDublujeTresc('Dostatecznie dlugie zdanie wprowadzajace do tekstu.', ''), false);
  assert.equal(leadDublujeTresc(null, null), false);
});
import { navFlags, grafikaUrl, KATEGORIE, articleSchema, powiazaneDo } from './render.js';

test('flaga aria-current tylko dla aktywnej pozycji', () => {
  const flagi = navFlags('/aktualnosci/');
  assert.match(flagi.aktywnaAktualnosci, /aria-current="page"/);
  assert.equal(flagi.aktywnaKontakt, '');
});

test('artykul zaznacza swoja kategorie w menu', () => {
  const flagi = navFlags('/media-o-erli/rekordowy-rok/');
  assert.match(flagi.aktywnaMedia, /aria-current="page"/);
  assert.equal(flagi.aktywnaAktualnosci, '');
});

test('strona glowna nie zaznacza zadnej pozycji', () => {
  const flagi = navFlags('/');
  assert.equal(flagi.aktywnaAktualnosci, '');
  assert.equal(flagi.aktywnaMedia, '');
});

test('nazwy kategorii sa po polsku', () => {
  assert.equal(KATEGORIE.aktualnosci.nazwa, 'Aktualności');
  assert.equal(KATEGORIE['media-o-erli'].nazwa, 'Media o ERLI');
});

test('grafika buduje sciezke ze sluga gdy pole puste', () => {
  assert.equal(grafikaUrl({ slug: 'nowa-era', grafika: null }), '/assets/img/kv/nowa-era.webp');
});

test('grafika uzywa jawnie podanej nazwy', () => {
  assert.equal(grafikaUrl({ slug: 'x', grafika: 'ai-sprzedawcy' }), '/assets/img/kv/ai-sprzedawcy.webp');
});

test('grafika uzywa pelnej sciezki gdy zaczyna sie od /', () => {
  assert.equal(
    grafikaUrl({ slug: 'x', grafika: '/assets/img/artykuly/x/hero.webp' }),
    '/assets/img/artykuly/x/hero.webp'
  );
});

test('schema NewsArticle zawiera tytul, date i wydawce', () => {
  const json = JSON.parse(
    articleSchema({
      tytul: 'Rekordowy rok',
      data: '2025-03-05',
      url: '/aktualnosci/rekordowy-rok/',
      lead: 'Wzrost GMV',
      grafika: null,
      slug: 'rekordowy-rok',
    })
  );
  assert.equal(json['@type'], 'NewsArticle');
  assert.equal(json.headline, 'Rekordowy rok');
  assert.equal(json.datePublished, '2025-03-05');
  assert.equal(json.publisher.name, 'ERLI');
});

test('powiazane wybiera z tej samej kategorii i pomija biezacy', () => {
  const wszystkie = [
    { slug: 'a', kategoria: 'aktualnosci' },
    { slug: 'b', kategoria: 'aktualnosci' },
    { slug: 'c', kategoria: 'media-o-erli' },
    { slug: 'd', kategoria: 'aktualnosci' },
    { slug: 'e', kategoria: 'aktualnosci' },
  ];
  const wynik = powiazaneDo({ slug: 'a', kategoria: 'aktualnosci' }, wszystkie);
  assert.equal(wynik.length, 3);
  assert.ok(!wynik.some((p) => p.slug === 'a'));
  assert.ok(!wynik.some((p) => p.slug === 'c'));
});

test('powiazane uzupelnia z innej kategorii gdy brakuje', () => {
  const wszystkie = [
    { slug: 'a', kategoria: 'aktualnosci' },
    { slug: 'c', kategoria: 'media-o-erli' },
    { slug: 'd', kategoria: 'media-o-erli' },
    { slug: 'e', kategoria: 'media-o-erli' },
  ];
  const wynik = powiazaneDo({ slug: 'a', kategoria: 'aktualnosci' }, wszystkie);
  assert.equal(wynik.length, 3);
});
