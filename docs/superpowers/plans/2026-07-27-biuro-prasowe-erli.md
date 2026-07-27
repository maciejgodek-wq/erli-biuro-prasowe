# Biuro prasowe ERLI — plan wdrożenia

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zastąpić biuro prasowe ERLI na Joomli statyczną stroną generowaną z markdowna, opartą na design systemie ERLI, w 100% po polsku.

**Architecture:** Własny generator w Node 24 (`build.js` + moduły w `build/`) czyta pliki `.md` z `src/posts/` i `src/pages/`, renderuje je przez prosty silnik szablonów do `dist/`. Każdy moduł ma jedną odpowiedzialność i własny plik testów. Build skleja też CSS ze źródeł, generuje `sitemap.xml`, mapę przekierowań 301 i przerywa się błędem, jeśli w wyniku znajdzie język niemiecki.

**Tech Stack:** Node 24 (ESM), wbudowany `node:test` + `node:assert/strict`, jedna zależność produkcyjna: `marked`. Bez frameworka, bez bundlera.

**Spec:** `docs/superpowers/specs/2026-07-27-biuro-prasowe-erli-design.md`

---

## Struktura plików

Moduły budujące — każdy jedna odpowiedzialność, testy obok:

| Plik | Odpowiedzialność |
|---|---|
| `build/frontmatter.js` | Wydzielenie i sparsowanie bloku `---` z pliku `.md` |
| `build/posts.js` | Wczytanie postów, slug, sortowanie, grupowanie po latach |
| `build/template.js` | Silnik szablonów: `{{ }}`, `{{{ }}}`, `{{> }}`, `{{#each}}`, `{{#if}}` |
| `build/markdown.js` | Konfiguracja `marked` |
| `build/css.js` | Sklejenie `tokens + base + layout + components` |
| `build/lang-guard.js` | Wykrywanie języka niemieckiego w wyniku |
| `build/seo.js` | `sitemap.xml`, `robots.txt` |
| `build/redirects.js` | Mapa 301 w trzech formatach |
| `build/paginate.js` | Podział listy na strony (próg 30) |
| `build/render.js` | Złożenie strony: szablon + partiale + dane |
| `build.js` | Wejście CLI, orkiestracja, zapis `dist/` |

Szablony i treść:

```
src/templates/   base.html home.html list.html post.html page.html
src/partials/    header.html footer.html post-card.html contact-block.html share.html
src/posts/       aktualnosci/*.md  media/*.md
src/pages/       o-nas.md kontakt.md
```

---

## Faza 0 — sprzątanie

### Task 1: Usunięcie stron i assetów rynku niemieckiego

**Files:**
- Delete: `index.html`, `faq.html`, `ueber-uns.html`, `kontakt.html`, `impressum.html`, `datenschutz.html`, `404.html`
- Delete: `_worker.js`, `TODO.md`, `sitemap.xml`, `robots.txt`
- Delete: `assets/js/carousel.js`, `assets/js/marquee.js`
- Delete: `design-system/audit-report.md`, `design-system/preview.html`
- Delete: `assets/img/*.png` z wyjątkiem `apple-touch-icon.png`
- Delete: `assets/css/main.css` (od teraz generowany)

- [x] **Step 1: Sprawdź stan roboczy**

```bash
git status --short
```

Expected: czysto (albo tylko `docs/`). Jeśli są inne zmiany — zatrzymaj się i zapytaj.

- [x] **Step 2: Usuń strony HTML i pliki infrastruktury DE**

```bash
git rm index.html faq.html ueber-uns.html kontakt.html impressum.html datenschutz.html 404.html _worker.js TODO.md sitemap.xml robots.txt
```

- [x] **Step 3: Usuń martwy JavaScript**

`carousel.js` nie jest ładowany przez żadną stronę. `marquee.js` obsługuje sekcję opinii, której biuro prasowe nie ma, i zawiera niemieckie etykiety.

```bash
git rm assets/js/carousel.js assets/js/marquee.js
```

- [x] **Step 4: Usuń nieskompresowane PNG-i**

Każdy `cat-*.png` waży 2–3,5 MB, `hero-person.png` 4 MB. Wszystkie mają odpowiedniki WebP.

```bash
git rm assets/img/cat-auto.png assets/img/cat-beauty.png assets/img/cat-business.png assets/img/cat-elektronik.png assets/img/cat-gesundheit.png assets/img/cat-haus.png assets/img/cat-kind.png assets/img/cat-kultur.png assets/img/cat-mode.png assets/img/cat-moebel.png assets/img/cat-sammeln.png assets/img/cat-sport.png assets/img/cat-supermarkt.png assets/img/cta-person.png assets/img/hero-person.png assets/img/og-image.png assets/img/og-image.webp
```

- [x] **Step 5: Usuń dokumenty design systemu dotyczące wyłącznie erli.de**

```bash
git rm design-system/audit-report.md design-system/preview.html
```

- [x] **Step 6: Usuń wygenerowany CSS**

```bash
git rm assets/css/main.css
```

- [x] **Step 7: Sprawdź co zostało**

```bash
git status --short; ls assets/img assets/js assets/css design-system
```

Expected w `assets/img`: `apple-touch-icon.png`, `circle.svg`, `erli-logo.svg`, `favicon.svg`, `was-ist-erli.webp`, `hero-person.webp`, `hero-person-ueber.webp`, `cta-person.webp`, 13× `cat-*.webp`.
Expected w `assets/js`: `nav.js`, `header-scroll.js`.
Expected w `assets/css`: `tokens.css`, `base.css`, `layout.css`, `components.css`, `critical.css`.
Expected w `design-system`: `design.md`, `erli_logo.svg`.

- [x] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: usuniecie stron i assetow rynku niemieckiego

Zostaje design system (tokens/base/layout/components), fonty, logo
i material zrodlowy do key visuali. Usuniete: 7 stron DE, _worker.js
z haslem w plaintekscie, 33 MB nieskompresowanych PNG, martwy
carousel.js i marquee.js, dokumenty design systemu dot. erli.de.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Tłumaczenie etykiet dostępności w nav.js

`nav.js` ustawia `aria-label` po niemiecku. To tekst niewidoczny na ekranie — przeżyłby przegląd wizualny, a czytnik ekranu odczytałby polskiemu użytkownikowi niemieckie polecenie.

**Files:**
- Modify: `assets/js/nav.js`

- [x] **Step 1: Przeczytaj plik**

```bash
cat assets/js/nav.js
```

- [x] **Step 2: Podmień trzy wystąpienia**

Zamień `'Menü schließen'` na `'Zamknij menu'` oraz oba wystąpienia `'Menü öffnen'` na `'Otwórz menu'`.

- [x] **Step 3: Zweryfikuj, że nie został żaden niemiecki**

```bash
grep -nE "[äöüßÄÖÜ]|Menü|schließen|öffnen" assets/js/nav.js
```

Expected: brak wyników (exit code 1).

- [x] **Step 4: Przepisz niemieckie przykłady w `design-system/design.md`**

`design.md` zostaje jako referencja tokenów, ale wszystkie przykłady kodu są po
niemiecku. To droga powrotna dla języka, który właśnie usuwamy — kopiując z tego
dokumentu fragment markupu, wprowadzasz niemiecki z powrotem.

```bash
grep -nE "[äöüßÄÖÜ]|Marktplatz|Deutschland|ueber-uns" design-system/design.md
```

Podmień w znalezionych miejscach:

- `<a href="/ueber-uns">Über uns</a>` → `<a href="/o-nas">O nas</a>`
- `Erli – Der neue Online-Marktplatz` → `Biuro prasowe ERLI`
- `Bald in Deutschland` → `Komunikaty prasowe`
- `Online-Marktplatz` (w `trust-card__title` i stopce) → `Biuro prasowe`
- `Erli ist ein Online-Marktplatz...` → `ERLI to druga co do wielkości platforma marketplace w Polsce.`
- linia 5: `All components are live on https://erli.de and subpages (ueber-uns, kontakt, faq).` → `Komponenty w użyciu na biuroprasowe.erli.pl.`

Zweryfikuj:

```bash
grep -nE "[äöüßÄÖÜ]|Marktplatz|Deutschland|ueber-uns" design-system/design.md
```

Expected: brak wyników.

- [x] **Step 5: Commit**

```bash
git add assets/js/nav.js design-system/design.md && git commit -m "fix: polskie etykiety aria-label w nav.js

Czytnik ekranu odczytywal polskiemu uzytkownikowi niemieckie polecenia.
Przyklady kodu w design.md przepisane na polskie.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Faza 1 — generator

### Task 3: Inicjalizacja projektu Node

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Utwórz `package.json`**

```json
{
  "name": "erli-biuro-prasowe",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "build": "node build.js",
    "test": "node --test build/"
  },
  "dependencies": {
    "marked": "^15.0.0"
  }
}
```

- [ ] **Step 2: Zainstaluj zależność**

```bash
npm install
```

Expected: `marked` zainstalowany, zero ostrzeżeń o podatnościach. `marked` nie ma własnych zależności.

- [ ] **Step 3: Dopisz `dist/` do `.gitignore`**

Dodaj na końcu pliku:

```
# Wynik budowania
dist/
```

- [ ] **Step 4: Sprawdź, że test runner działa**

```bash
mkdir -p build && printf "import {test} from 'node:test';\nimport assert from 'node:assert/strict';\ntest('sanity', () => assert.equal(1, 1));\n" > build/sanity.test.js && npm test
```

Expected: `# pass 1`

- [ ] **Step 5: Usuń plik testowy i commituj**

```bash
rm build/sanity.test.js
git add package.json package-lock.json .gitignore && git commit -m "chore: inicjalizacja projektu Node (ESM, node:test, marked)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Parser frontmattera

Frontmatter to blok między `---` na początku pliku. Potrzebujemy podzbioru YAML: pary `klucz: wartość` i jeden poziom zagnieżdżenia (pole `zrodlo`). Pełny parser YAML byłby zależnością, której nie potrzebujemy.

**Files:**
- Create: `build/frontmatter.js`
- Test: `build/frontmatter.test.js`

- [ ] **Step 1: Napisz testy**

```js
// build/frontmatter.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from './frontmatter.js';

test('parsuje proste pary klucz-wartosc', () => {
  const { data, body } = parseFrontmatter(
    '---\ntytul: Nowa era handlu\ndata: 2025-11-03\n---\nTresc artykulu.'
  );
  assert.equal(data.tytul, 'Nowa era handlu');
  assert.equal(data.data, '2025-11-03');
  assert.equal(body, 'Tresc artykulu.');
});

test('zachowuje dwukropki wewnatrz wartosci', () => {
  const { data } = parseFrontmatter('---\ntytul: AI od ERLI: nowa era\n---\n');
  assert.equal(data.tytul, 'AI od ERLI: nowa era');
});

test('parsuje jeden poziom zagniezdzenia', () => {
  const { data } = parseFrontmatter(
    '---\ntytul: Rekordowy rok\nzrodlo:\n  nazwa: Bankier.pl\n  url: https://bankier.pl/a\n---\n'
  );
  assert.deepEqual(data.zrodlo, { nazwa: 'Bankier.pl', url: 'https://bankier.pl/a' });
});

test('zdejmuje cudzyslowy z wartosci', () => {
  const { data } = parseFrontmatter('---\ntytul: "ERLI idzie na rekord"\n---\n');
  assert.equal(data.tytul, 'ERLI idzie na rekord');
});

test('pomija puste linie i komentarze', () => {
  const { data } = parseFrontmatter('---\n# komentarz\n\ntytul: X\n---\n');
  assert.deepEqual(data, { tytul: 'X' });
});

test('radzi sobie z zakonczeniami linii CRLF', () => {
  const { data, body } = parseFrontmatter('---\r\ntytul: X\r\n---\r\nTresc.');
  assert.equal(data.tytul, 'X');
  assert.equal(body, 'Tresc.');
});

test('zwraca pusty obiekt gdy brak frontmattera', () => {
  const { data, body } = parseFrontmatter('Sama tresc.');
  assert.deepEqual(data, {});
  assert.equal(body, 'Sama tresc.');
});
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/frontmatter.test.js
```

Expected: FAIL — `Cannot find module './frontmatter.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/frontmatter.js

/** Zdejmuje otaczajace cudzyslowy, jesli wystepuja po obu stronach. */
function unquote(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/**
 * Parsuje podzbior YAML: pary `klucz: wartosc` oraz jeden poziom
 * zagniezdzenia przez wciecie dwoma spacjami.
 */
function parseYamlSubset(source) {
  const data = {};
  let currentKey = null;

  for (const rawLine of source.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    const indented = /^\s+/.test(rawLine);
    const separator = rawLine.indexOf(':');
    if (separator === -1) continue;

    const key = rawLine.slice(0, separator).trim();
    const value = unquote(rawLine.slice(separator + 1));

    if (indented && currentKey) {
      data[currentKey][key] = value;
      continue;
    }

    if (value === '') {
      data[key] = {};
      currentKey = key;
    } else {
      data[key] = value;
      currentKey = null;
    }
  }

  return data;
}

/**
 * Dzieli zawartosc pliku .md na dane z frontmattera i tresc.
 * Brak frontmattera zwraca pusty obiekt danych i cala tresc.
 */
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };
  return { data: parseYamlSubset(match[1]), body: match[2].trim() };
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/frontmatter.test.js
```

Expected: `# pass 7`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/frontmatter.js build/frontmatter.test.js && git commit -m "feat: parser frontmattera

Podzbior YAML wystarczajacy dla postow: pary klucz-wartosc
i jeden poziom zagniezdzenia (pole zrodlo).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Wczytywanie i porządkowanie postów

**Files:**
- Create: `build/posts.js`
- Test: `build/posts.test.js`

- [ ] **Step 1: Napisz testy**

```js
// build/posts.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugFromFilename, sortByDateDesc, groupByYear, formatDatePl } from './posts.js';

test('slug pomija prefiks daty w nazwie pliku', () => {
  assert.equal(slugFromFilename('2025-11-03-nowa-era-handlu.md'), 'nowa-era-handlu');
});

test('slug dziala bez prefiksu daty', () => {
  assert.equal(slugFromFilename('o-nas.md'), 'o-nas');
});

test('sortuje malejaco po dacie', () => {
  const sorted = sortByDateDesc([
    { data: '2024-05-22', slug: 'b' },
    { data: '2025-11-03', slug: 'a' },
    { data: '2023-10-24', slug: 'c' },
  ]);
  assert.deepEqual(sorted.map((p) => p.slug), ['a', 'b', 'c']);
});

test('sortowanie nie modyfikuje tablicy wejsciowej', () => {
  const input = [{ data: '2024-01-01', slug: 'x' }, { data: '2025-01-01', slug: 'y' }];
  sortByDateDesc(input);
  assert.equal(input[0].slug, 'x');
});

test('przy tej samej dacie sortuje alfabetycznie po slugu', () => {
  const sorted = sortByDateDesc([
    { data: '2025-03-05', slug: 'zebra' },
    { data: '2025-03-05', slug: 'alfa' },
  ]);
  assert.deepEqual(sorted.map((p) => p.slug), ['alfa', 'zebra']);
});

test('grupuje po latach, najnowszy rok pierwszy', () => {
  const groups = groupByYear([
    { data: '2025-11-03', slug: 'a' },
    { data: '2025-03-05', slug: 'b' },
    { data: '2024-10-28', slug: 'c' },
  ]);
  assert.deepEqual(groups.map((g) => g.rok), ['2025', '2024']);
  assert.equal(groups[0].posty.length, 2);
  assert.equal(groups[1].posty.length, 1);
});

test('formatuje date po polsku', () => {
  assert.equal(formatDatePl('2025-11-03'), '3 listopada 2025');
  assert.equal(formatDatePl('2024-05-22'), '22 maja 2024');
  assert.equal(formatDatePl('2023-01-09'), '9 stycznia 2023');
});
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/posts.test.js
```

Expected: FAIL — `Cannot find module './posts.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/posts.js
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseFrontmatter } from './frontmatter.js';

const MIESIACE_DOPELNIACZ = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

/** Zdejmuje rozszerzenie i opcjonalny prefiks daty RRRR-MM-DD. */
export function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Sortuje malejaco po dacie; przy remisie alfabetycznie po slugu. Nie mutuje wejscia. */
export function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? 1 : -1;
    return a.slug.localeCompare(b.slug, 'pl');
  });
}

/** Grupuje posty w bloki roczne, od najnowszego roku. Zaklada wejscie posortowane. */
export function groupByYear(posts) {
  const groups = [];
  for (const post of sortByDateDesc(posts)) {
    const rok = post.data.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.rok === rok) last.posty.push(post);
    else groups.push({ rok, posty: [post] });
  }
  return groups;
}

/** '2025-11-03' -> '3 listopada 2025' */
export function formatDatePl(iso) {
  const [rok, miesiac, dzien] = iso.split('-');
  return `${Number(dzien)} ${MIESIACE_DOPELNIACZ[Number(miesiac) - 1]} ${rok}`;
}

/**
 * Wczytuje wszystkie pliki .md z katalogu i zwraca posty posortowane
 * od najnowszego. Kazdy post ma: slug, kategoria, data, dataPl, tytul,
 * lead, grafika, zrodlo, tresc (surowy markdown), url.
 */
export async function loadPosts(dir, kategoria) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));

  const posts = await Promise.all(
    files.map(async (filename) => {
      const raw = await readFile(join(dir, filename), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const slug = slugFromFilename(filename);

      if (!data.tytul) throw new Error(`${filename}: brak pola "tytul" we frontmatterze`);
      if (!data.data) throw new Error(`${filename}: brak pola "data" we frontmatterze`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data)) {
        throw new Error(`${filename}: pole "data" musi miec format RRRR-MM-DD, jest "${data.data}"`);
      }

      return {
        slug,
        kategoria,
        data: data.data,
        dataPl: formatDatePl(data.data),
        tytul: data.tytul,
        lead: data.lead ?? '',
        grafika: data.grafika ?? null,
        zrodlo: data.zrodlo ?? null,
        tresc: body,
        url: `/${kategoria}/${slug}/`,
      };
    })
  );

  return sortByDateDesc(posts);
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/posts.test.js
```

Expected: `# pass 7`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/posts.js build/posts.test.js && git commit -m "feat: wczytywanie i porzadkowanie postow

Slug z nazwy pliku, sortowanie malejaco, grupowanie po latach,
polskie formatowanie daty. Walidacja wymaganych pol frontmattera.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Silnik szablonów

Minimalny podzbiór składni Handlebars, wystarczający dla tej strony. Około 80 linii zamiast zależności.

**Files:**
- Create: `build/template.js`
- Test: `build/template.test.js`

- [ ] **Step 1: Napisz testy**

```js
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

test('partial jest wstawiany i ma dostep do danych', () => {
  const partials = { stopka: '<footer>{{ rok }}</footer>' };
  assert.equal(render('{{> stopka }}', { rok: '2026' }, partials), '<footer>2026</footer>');
});

test('nieznany partial rzuca czytelny blad', () => {
  assert.throws(() => render('{{> brak }}', {}, {}), /Nieznany partial: brak/);
});
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/template.test.js
```

Expected: FAIL — `Cannot find module './template.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/template.js

const ENCJE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapuje znaki majace znaczenie w HTML. */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ENCJE[ch]);
}

/** Odczytuje wartosc sciezki 'a.b.c' z kontekstu; undefined gdy brak. */
function lookup(context, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

/** Pusta tablica traktowana jest jak wartosc falszywa. */
function isTruthy(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

/**
 * Renderuje szablon. Obsluguje:
 *   {{ x }}        wartosc escapowana
 *   {{{ x }}}      surowy HTML
 *   {{> nazwa }}   partial
 *   {{#each x}}…{{/each}}
 *   {{#if x}}…{{else}}…{{/if}}
 * Bloki sa przetwarzane od najbardziej zagniezdzonych (regex bez zagniezdzen
 * tego samego typu), w petli az do stabilizacji.
 */
export function render(template, context = {}, partials = {}) {
  let out = template;

  // Partiale najpierw, zeby ich zawartosc przeszla przez pozostale reguly.
  out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`Nieznany partial: ${name}`);
    return partials[name];
  });

  // Bloki each i if — powtarzamy, bo zagniezdzenia rozwijaja sie warstwami.
  let previous;
  do {
    previous = out;

    out = out.replace(
      /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_, path, body) => {
        const items = lookup(context, path);
        if (!Array.isArray(items)) return '';
        return items
          .map((item) => render(body, { ...context, ...item }, partials))
          .join('');
      }
    );

    out = out.replace(
      /\{\{#if\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_, path, body) => {
        const [whenTrue, whenFalse = ''] = body.split(/\{\{else\}\}/);
        return isTruthy(lookup(context, path)) ? whenTrue : whenFalse;
      }
    );
  } while (out !== previous);

  out = out.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, path) => lookup(context, path) ?? '');
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => escapeHtml(lookup(context, path)));

  return out;
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/template.test.js
```

Expected: `# pass 13`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/template.js build/template.test.js && git commit -m "feat: silnik szablonow

Podzbior skladni Handlebars: zmienne, surowy HTML, partiale,
each, if/else. Escapowanie domyslne.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Renderowanie markdowna

**Files:**
- Create: `build/markdown.js`
- Test: `build/markdown.test.js`

- [ ] **Step 1: Napisz testy**

```js
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
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/markdown.test.js
```

Expected: FAIL — `Cannot find module './markdown.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/markdown.js
import { Marked } from 'marked';

const marked = new Marked({ gfm: true, breaks: false });

// Linki wychodzace poza serwis otwieramy w nowej karcie z zabezpieczeniem rel.
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : '';
      const external = /^https?:\/\//.test(href);
      const extraAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${titleAttr}${extraAttrs}>${text}</a>`;
    },
  },
});

/** Markdown -> HTML. */
export function renderMarkdown(source) {
  return marked.parse(source ?? '');
}

/** HTML -> czysty tekst; do meta description i podgladow. */
export function plainText(html) {
  return String(html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/markdown.test.js
```

Expected: `# pass 7`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/markdown.js build/markdown.test.js && git commit -m "feat: renderowanie markdowna

Linki zewnetrzne z target=_blank i rel=noopener. Pomocnik plainText
do meta description.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Sklejanie CSS

`main.css` był dotąd sklejany ręcznie i rozjechał się ze źródłami (93 958 bajtów w źródłach vs 96 256 w sklejce). Od teraz generuje go build.

**Files:**
- Create: `build/css.js`
- Test: `build/css.test.js`

- [ ] **Step 1: Napisz testy**

```js
// build/css.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concatCss, CSS_ORDER } from './css.js';

test('kolejnosc zrodel jest ustalona', () => {
  assert.deepEqual(CSS_ORDER, ['tokens.css', 'base.css', 'layout.css', 'components.css']);
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
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/css.test.js
```

Expected: FAIL — `Cannot find module './css.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/css.js
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Kolejnosc ma znaczenie: tokeny zanim ktokolwiek ich uzyje. */
export const CSS_ORDER = ['tokens.css', 'base.css', 'layout.css', 'components.css'];

const NAGLOWEK = `/* Plik generowany przez build.js — nie edytuj recznie.
   Zrodla: assets/css/{${CSS_ORDER.join(', ')}} */\n\n`;

/** Skleja arkusze w jeden, z komentarzami oznaczajacymi granice. */
export function concatCss(sources) {
  return (
    NAGLOWEK +
    sources
      .map(({ name, content }) => `/* === ${name} === */\n${content.trim()}\n`)
      .join('\n')
  );
}

/** Wczytuje arkusze zrodlowe w ustalonej kolejnosci i skleja. */
export async function buildCss(cssDir) {
  const sources = await Promise.all(
    CSS_ORDER.map(async (name) => ({
      name,
      content: await readFile(join(cssDir, name), 'utf8'),
    }))
  );
  return concatCss(sources);
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/css.test.js
```

Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/css.js build/css.test.js && git commit -m "feat: sklejanie CSS ze zrodel

Koniec recznego konkatenatu, ktory rozjechal sie ze zrodlami.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Kontrola języka niemieckiego (D9)

Strona ma być w 100% polska. Niemieckie ciągi w `aria-label`, `alt` i `title` są niewidoczne wizualnie i przeżyłyby ręczny przegląd. Build ma się w takiej sytuacji wywalić.

**Files:**
- Create: `build/lang-guard.js`
- Test: `build/lang-guard.test.js`

- [ ] **Step 1: Napisz testy**

```js
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
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/lang-guard.test.js
```

Expected: FAIL — `Cannot find module './lang-guard.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/lang-guard.js

const ZNAKI_DE = /[äöüßÄÖÜ]/;

/**
 * Slowa jednoznacznie niemieckie. Celowo pominiete te, ktore istnieja
 * takze po polsku (Kontakt, Start, Test) lub angielsku.
 */
const SLOWA_DE = new RegExp(
  '\\b(' +
    [
      'der', 'die', 'das', 'und', 'oder', 'nicht', 'auch', 'wird', 'sind',
      'eine', 'einen', 'einem', 'eines', 'ist', 'sich', 'mit', 'von', 'zum',
      'zur', 'bei', 'kann', 'mehr', 'alle', 'wir', 'Sie', 'ich', 'du',
      'Marktplatz', 'Deutschland', 'deutsch', 'Verkäufer', 'Verkaeufer',
      'Startseite', 'Datenschutz', 'Impressum', 'Anmelden', 'Einkauf',
      'einkaufen', 'Produkte', 'Zahlung', 'Versand', 'Bestellung',
      'schliessen', 'oeffnen', 'Abspielen', 'Pausieren', 'Werktage',
    ].join('|') +
    ')\\b'
);

/** Atrybuty, w ktorych tekst jest niewidoczny wizualnie. */
const ATRYBUTY = ['aria-label', 'alt', 'title', 'placeholder'];

function sprawdz(tekst) {
  if (ZNAKI_DE.test(tekst)) return ZNAKI_DE.exec(tekst)[0];
  if (SLOWA_DE.test(tekst)) return SLOWA_DE.exec(tekst)[0];
  return null;
}

/**
 * Szuka niemieckiego w wygenerowanym HTML. Zwraca liste trafien:
 * { plik, kontekst, trafienie, fragment }.
 * Zawartosc <script> i <style> jest pomijana — tam tekst nie trafia do uzytkownika.
 */
export function findGerman(html, plik) {
  const hits = [];

  const oczyszczony = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  for (const attr of ATRYBUTY) {
    const re = new RegExp(`${attr}\\s*=\\s*"([^"]*)"`, 'gi');
    let m;
    while ((m = re.exec(oczyszczony)) !== null) {
      const trafienie = sprawdz(m[1]);
      if (trafienie) hits.push({ plik, kontekst: attr, trafienie, fragment: m[1] });
    }
  }

  const tekst = oczyszczony.replace(/<[^>]+>/g, ' ');
  for (const zdanie of tekst.split(/[.!?\n]+/)) {
    const okrojone = zdanie.trim();
    if (!okrojone) continue;
    const trafienie = sprawdz(okrojone);
    if (trafienie) {
      hits.push({ plik, kontekst: 'tresc', trafienie, fragment: okrojone.slice(0, 120) });
    }
  }

  return hits;
}

/** Rzuca wyjatkiem z czytelnym raportem, jesli cokolwiek znaleziono. */
export function assertNoGerman(pliki) {
  const wszystkie = pliki.flatMap(({ sciezka, html }) => findGerman(html, sciezka));
  if (wszystkie.length === 0) return;

  const raport = wszystkie
    .map((h) => `  ${h.plik} [${h.kontekst}] "${h.trafienie}" — ${h.fragment}`)
    .join('\n');

  throw new Error(
    `Kontrola jezykowa: znaleziono ${wszystkie.length} niemieckich fragmentow.\n` +
      `Strona ma byc w 100% polska.\n${raport}`
  );
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/lang-guard.test.js
```

Expected: `# pass 9`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/lang-guard.js build/lang-guard.test.js && git commit -m "feat: kontrola jezykowa przerywajaca build (D9)

Skanuje wygenerowany HTML: tresc oraz aria-label, alt, title,
placeholder. Zawartosc script i style pomijana.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Paginacja z progiem

Nieaktywna przy obecnych ~20 pozycjach, ale wbudowana od początku. Po przekroczeniu 30 wpisów włącza się sama.

**Files:**
- Create: `build/paginate.js`
- Test: `build/paginate.test.js`

- [ ] **Step 1: Napisz testy**

```js
// build/paginate.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate, PROG_PAGINACJI } from './paginate.js';

test('prog wynosi 30', () => {
  assert.equal(PROG_PAGINACJI, 30);
});

test('ponizej progu zwraca jedna strone bez nawigacji', () => {
  const strony = paginate(Array.from({ length: 20 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony.length, 1);
  assert.equal(strony[0].url, '/aktualnosci/');
  assert.equal(strony[0].poprzednia, null);
  assert.equal(strony[0].nastepna, null);
  assert.equal(strony[0].elementy.length, 20);
});

test('dokladnie na progu nadal jedna strona', () => {
  const strony = paginate(Array.from({ length: 30 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony.length, 1);
});

test('powyzej progu dzieli na strony po 30', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony.length, 3);
  assert.equal(strony[0].elementy.length, 30);
  assert.equal(strony[2].elementy.length, 5);
});

test('pierwsza strona zachowuje czysty adres', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony[0].url, '/aktualnosci/');
  assert.equal(strony[1].url, '/aktualnosci/2/');
  assert.equal(strony[2].url, '/aktualnosci/3/');
});

test('linki poprzednia i nastepna sa spojne', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony[0].poprzednia, null);
  assert.equal(strony[0].nastepna, '/aktualnosci/2/');
  assert.equal(strony[1].poprzednia, '/aktualnosci/');
  assert.equal(strony[1].nastepna, '/aktualnosci/3/');
  assert.equal(strony[2].nastepna, null);
});

test('kazda strona zna swoj numer i laczna liczbe', () => {
  const strony = paginate(Array.from({ length: 65 }, (_, i) => i), '/aktualnosci/');
  assert.equal(strony[1].numer, 2);
  assert.equal(strony[1].lacznie, 3);
});

test('pusta lista daje jedna pusta strone', () => {
  const strony = paginate([], '/aktualnosci/');
  assert.equal(strony.length, 1);
  assert.equal(strony[0].elementy.length, 0);
});
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/paginate.test.js
```

Expected: FAIL — `Cannot find module './paginate.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/paginate.js

/**
 * Ponizej tej liczby wpisow lista pozostaje jednostronicowa.
 * Przy ~20 komunikatach na kategorie dzielenie listy tylko utrudnia szukanie.
 */
export const PROG_PAGINACJI = 30;

/**
 * Dzieli liste na strony. Pierwsza strona zachowuje adres bazowy,
 * kolejne dostaja sufiks /2/, /3/ itd.
 */
export function paginate(elementy, urlBazowy, rozmiar = PROG_PAGINACJI) {
  if (elementy.length <= rozmiar) {
    return [{
      numer: 1,
      lacznie: 1,
      url: urlBazowy,
      elementy,
      poprzednia: null,
      nastepna: null,
    }];
  }

  const lacznie = Math.ceil(elementy.length / rozmiar);
  const adres = (n) => (n === 1 ? urlBazowy : `${urlBazowy}${n}/`);

  return Array.from({ length: lacznie }, (_, i) => {
    const numer = i + 1;
    return {
      numer,
      lacznie,
      url: adres(numer),
      elementy: elementy.slice(i * rozmiar, (i + 1) * rozmiar),
      poprzednia: numer > 1 ? adres(numer - 1) : null,
      nastepna: numer < lacznie ? adres(numer + 1) : null,
    };
  });
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/paginate.test.js
```

Expected: `# pass 8`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/paginate.js build/paginate.test.js && git commit -m "feat: paginacja z progiem 30

Nieaktywna przy obecnej liczbie wpisow, wlacza sie automatycznie
po przekroczeniu progu.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Mapa przekierowań 301

Bez tego tracimy pozycje w wyszukiwarce i wszystkie linki do biura prasowego z artykułów w mediach.

**Files:**
- Create: `build/redirects.js`
- Test: `build/redirects.test.js`

- [ ] **Step 1: Napisz testy**

```js
// build/redirects.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRedirectMap, toHtaccess, toNginx, toCsv } from './redirects.js';

const POSTY = [
  { kategoria: 'aktualnosci', slug: 'nowa-era-handlu', url: '/aktualnosci/nowa-era-handlu/' },
  { kategoria: 'media-o-erli', slug: 'rekordowy-rok', url: '/media-o-erli/rekordowy-rok/' },
];

test('mapuje stare adresy Joomli na nowe', () => {
  const mapa = buildRedirectMap(POSTY);
  assert.deepEqual(mapa[0], {
    stary: '/index.php/aktualnosci/nowa-era-handlu',
    nowy: '/aktualnosci/nowa-era-handlu/',
  });
});

test('mapuje takze adresy list i stron statycznych', () => {
  const mapa = buildRedirectMap(POSTY);
  const stare = mapa.map((r) => r.stary);
  assert.ok(stare.includes('/index.php/aktualnosci'));
  assert.ok(stare.includes('/index.php/media-o-erli'));
  assert.ok(stare.includes('/index.php/o-nas'));
  assert.ok(stare.includes('/index.php/kontakt'));
});

test('format htaccess uzywa Redirect 301', () => {
  const out = toHtaccess(buildRedirectMap(POSTY));
  assert.match(out, /Redirect 301 \/index\.php\/aktualnosci\/nowa-era-handlu \/aktualnosci\/nowa-era-handlu\//);
});

test('format nginx uzywa rewrite permanent', () => {
  const out = toNginx(buildRedirectMap(POSTY));
  assert.match(out, /rewrite \^\/index\\\.php\/aktualnosci\/nowa-era-handlu\$ \/aktualnosci\/nowa-era-handlu\/ permanent;/);
});

test('CSV ma naglowek i jeden wiersz na przekierowanie', () => {
  const out = toCsv(buildRedirectMap(POSTY));
  const linie = out.trim().split('\n');
  assert.equal(linie[0], 'stary_adres,nowy_adres');
  assert.equal(linie.length, buildRedirectMap(POSTY).length + 1);
});

test('brak duplikatow w mapie', () => {
  const mapa = buildRedirectMap([...POSTY, ...POSTY]);
  const stare = mapa.map((r) => r.stary);
  assert.equal(new Set(stare).size, stare.length);
});
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/redirects.test.js
```

Expected: FAIL — `Cannot find module './redirects.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/redirects.js

/** Adresy stale, ktore Joomla serwowala pod /index.php/. */
const STALE = [
  { stary: '/index.php/aktualnosci', nowy: '/aktualnosci/' },
  { stary: '/index.php/media-o-erli', nowy: '/media-o-erli/' },
  { stary: '/index.php/o-nas', nowy: '/o-nas/' },
  { stary: '/index.php/kontakt', nowy: '/kontakt/' },
  { stary: '/index.php', nowy: '/' },
];

/**
 * Buduje mape 301 ze starych adresow Joomli na nowe.
 * Slugi zostaly zachowane, wiec mapowanie jest mechaniczne.
 */
export function buildRedirectMap(posty) {
  const mapa = new Map();

  for (const post of posty) {
    mapa.set(`/index.php/${post.kategoria}/${post.slug}`, post.url);
  }
  for (const { stary, nowy } of STALE) {
    if (!mapa.has(stary)) mapa.set(stary, nowy);
  }

  return [...mapa].map(([stary, nowy]) => ({ stary, nowy }));
}

/** Format dla Apache — plik .htaccess. */
export function toHtaccess(mapa) {
  return (
    '# Przekierowania 301 ze starych adresow Joomli.\n' +
    '# Wygenerowane przez build.js — nie edytuj recznie.\n\n' +
    mapa.map(({ stary, nowy }) => `Redirect 301 ${stary} ${nowy}`).join('\n') +
    '\n'
  );
}

/** Format dla nginx — do wklejenia w blok server. */
export function toNginx(mapa) {
  const escape = (s) => s.replace(/\./g, '\\.');
  return (
    '# Przekierowania 301 ze starych adresow Joomli.\n' +
    '# Wygenerowane przez build.js — nie edytuj recznie.\n\n' +
    mapa
      .map(({ stary, nowy }) => `rewrite ^${escape(stary)}$ ${nowy} permanent;`)
      .join('\n') +
    '\n'
  );
}

/** Format uniwersalny — do wklejenia w panel hostingu lub arkusz. */
export function toCsv(mapa) {
  return (
    'stary_adres,nowy_adres\n' +
    mapa.map(({ stary, nowy }) => `${stary},${nowy}`).join('\n') +
    '\n'
  );
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/redirects.test.js
```

Expected: `# pass 6`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/redirects.js build/redirects.test.js && git commit -m "feat: mapa przekierowan 301 w trzech formatach

Apache, nginx i CSV. Slugi zachowane z Joomli, wiec mapowanie
jest mechaniczne.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 12: Sitemap i robots.txt

**Files:**
- Create: `build/seo.js`
- Test: `build/seo.test.js`

- [ ] **Step 1: Napisz testy**

```js
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
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/seo.test.js
```

Expected: FAIL — `Cannot find module './seo.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/seo.js

export const DOMENA = 'https://biuroprasowe.erli.pl';

/** Generuje sitemap.xml z listy { url, lastmod, priority? }. */
export function buildSitemap(strony) {
  const wpisy = strony
    .map(({ url, lastmod, priority = '0.7' }) =>
      [
        '  <url>',
        `    <loc>${DOMENA}${url}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    wpisy +
    '\n</urlset>\n'
  );
}

/** Generuje robots.txt. Biuro prasowe ma byc w calosci indeksowalne. */
export function buildRobots() {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${DOMENA}/sitemap.xml`, ''].join('\n');
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/seo.test.js
```

Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/seo.js build/seo.test.js && git commit -m "feat: sitemap.xml i robots.txt

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Faza 2 — szablony i style

### Task 13: Szkielet strony — base.html, header, footer

**Files:**
- Create: `src/templates/base.html`
- Create: `src/partials/header.html`
- Create: `src/partials/footer.html`

- [ ] **Step 1: Utwórz katalogi**

```bash
mkdir -p src/templates src/partials src/posts/aktualnosci src/posts/media src/pages
```

- [ ] **Step 2: Utwórz `src/partials/header.html`**

Klasa `is-active` i `aria-current` sterowane zmienną `aktywna` z kontekstu strony — obecna strona nie oznaczała aktywnej pozycji w ogóle.

```html
<header role="banner" class="site-header">
  <div class="container site-header__inner">
    <a href="/" class="site-header__logo" aria-label="Biuro prasowe ERLI — strona główna">
      <img src="/assets/img/erli-logo.svg" alt="ERLI" width="82" height="31" loading="eager">
    </a>
    <button class="nav-toggle" type="button" aria-label="Otwórz menu" aria-expanded="false" aria-controls="nav-menu">
      <span class="nav-toggle__bar"></span>
      <span class="nav-toggle__bar"></span>
      <span class="nav-toggle__bar"></span>
    </button>
    <nav aria-label="Nawigacja główna">
      <ul class="site-header__nav" id="nav-menu" role="list">
        <li><a href="/aktualnosci/"{{{ aktywnaAktualnosci }}}>Aktualności</a></li>
        <li><a href="/media-o-erli/"{{{ aktywnaMedia }}}>Media o ERLI</a></li>
        <li><a href="/o-nas/"{{{ aktywnaONas }}}>O nas</a></li>
        <li><a href="/kontakt/"{{{ aktywnaKontakt }}}>Kontakt</a></li>
      </ul>
    </nav>
  </div>
</header>
```

- [ ] **Step 3: Utwórz `src/partials/footer.html`**

```html
<footer role="contentinfo" class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <a href="/" class="site-footer__logo">
          <img src="/assets/img/erli-logo.svg" alt="ERLI" width="82" height="31" loading="lazy">
        </a>
        <p class="site-footer__tagline">Biuro prasowe</p>
      </div>
      <nav class="site-footer__nav" aria-label="Nawigacja w stopce">
        <h2 class="site-footer__nav-heading">Nawigacja</h2>
        <ul role="list">
          <li><a href="/aktualnosci/">Aktualności</a></li>
          <li><a href="/media-o-erli/">Media o ERLI</a></li>
          <li><a href="/o-nas/">O nas</a></li>
          <li><a href="/kontakt/">Kontakt</a></li>
        </ul>
      </nav>
      <div class="site-footer__contact">
        <h2 class="site-footer__nav-heading">Kontakt dla mediów</h2>
        <p>Aleksandra Grądzka<br><a href="mailto:media@erli.pl">media@erli.pl</a></p>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p>&copy; {{ rok }} ERLI</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Utwórz `src/templates/base.html`**

Bez GTM, bez Consent Mode, bez linków do nieistniejących faviconów. `main.css` ładowany zwykłym `<link>` — przy tej wielkości strony asynchroniczne ładowanie z `critical.css` to komplikacja bez zysku.

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ tytulStrony }}</title>
  <meta name="description" content="{{ opis }}">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
  <link rel="canonical" href="{{ kanoniczny }}">

  <meta property="og:type" content="{{ ogTyp }}">
  <meta property="og:title" content="{{ tytulStrony }}">
  <meta property="og:description" content="{{ opis }}">
  <meta property="og:url" content="{{ kanoniczny }}">
  <meta property="og:locale" content="pl_PL">
  <meta property="og:site_name" content="Biuro prasowe ERLI">
  <meta property="og:image" content="{{ ogObraz }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{ tytulStrony }}">
  <meta name="twitter:description" content="{{ opis }}">
  <meta name="twitter:image" content="{{ ogObraz }}">

  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">

  <link rel="preload" href="/assets/fonts/montserrat-latin-ext.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/roboto-flex-latin-ext.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="/assets/js/header-scroll.js" defer></script>
  {{{ schemaJsonLd }}}
</head>
<body>
  <a href="#main" class="skip-link">Przejdź do treści</a>
  {{> header }}
  <main id="main">
{{{ tresc }}}
  </main>
  {{> footer }}
  <script src="/assets/js/nav.js" defer></script>
</body>
</html>
```

Uwaga: preload wskazuje warianty `latin-ext`, bo polskie znaki diakrytyczne (ą, ć, ę, ł, ń, ó, ś, ź, ż) leżą właśnie w tym zakresie. Strona DE preładowywała `latin` — dla polskiego byłoby to preładowanie pliku, z którego prawie nie korzystamy, przy jednoczesnym opóźnieniu tego właściwego.

- [ ] **Step 5: Commit**

```bash
git add src/templates/base.html src/partials/header.html src/partials/footer.html && git commit -m "feat: szkielet strony, header i stopka

lang=pl, aria-current na aktywnej pozycji menu, preload fontow
latin-ext (polskie diakrytyki). Bez GTM i Consent Mode.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 14: Partiale karty artykułu, udostępniania i kontaktu

**Files:**
- Create: `src/partials/post-card.html`
- Create: `src/partials/share.html`
- Create: `src/partials/contact-block.html`

- [ ] **Step 1: Utwórz `src/partials/post-card.html`**

`loading="lazy"` plus jawne wymiary — przeglądarka pobiera tylko widoczne karty, a układ nie skacze przy doczytywaniu.

```html
<article class="post-card">
  <a class="post-card__link" href="{{ url }}">
    <div class="post-card__media">
      <img src="{{ grafikaUrl }}" alt="" width="1200" height="630" loading="lazy" decoding="async" class="post-card__img">
    </div>
    <div class="post-card__body">
      <p class="post-card__meta">
        <span class="post-card__kategoria">{{ kategoriaNazwa }}</span>
        <time datetime="{{ data }}">{{ dataPl }}</time>
      </p>
      <h3 class="post-card__title">{{ tytul }}</h3>
      <p class="post-card__lead">{{ lead }}</p>
      <span class="post-card__more" aria-hidden="true">Czytaj więcej</span>
    </div>
  </a>
</article>
```

- [ ] **Step 2: Utwórz `src/partials/share.html`**

Zwykłe linki, bez skryptów zewnętrznych i bez liczników. Stara strona pokazywała liczniki LinkedIn, które od 2021 zawsze zwracały zero, a przy każdym wejściu wysyłały adres artykułu do LinkedIna.

```html
<div class="share">
  <h2 class="share__heading">Udostępnij</h2>
  <ul class="share__list" role="list">
    <li><a class="share__link" href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlEnc }}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
    <li><a class="share__link" href="https://x.com/intent/tweet?url={{ urlEnc }}&text={{ tytulEnc }}" target="_blank" rel="noopener noreferrer">X</a></li>
    <li><a class="share__link" href="https://www.facebook.com/sharer/sharer.php?u={{ urlEnc }}" target="_blank" rel="noopener noreferrer">Facebook</a></li>
    <li><button class="share__link share__copy" type="button" data-url="{{ urlPelny }}">Kopiuj link</button></li>
  </ul>
</div>
```

- [ ] **Step 3: Utwórz `src/partials/contact-block.html`**

Adresy jako zwykłe `mailto:`, bez obfuskacji JavaScriptem. Na starej stronie dziennikarz z wyłączonym JS nie widział adresu w ogóle.

```html
<section class="contact-block" aria-labelledby="kontakt-prasowy">
  <div class="container contact-block__inner">
    <h2 id="kontakt-prasowy" class="contact-block__heading">Kontakt dla mediów</h2>
    <p class="contact-block__person">Aleksandra Grądzka</p>
    <p class="contact-block__email"><a href="mailto:media@erli.pl">media@erli.pl</a></p>
    <p class="contact-block__note">Kontakt dla kupujących: <a href="mailto:pomoc@erli.pl">pomoc@erli.pl</a></p>
  </div>
</section>
```

- [ ] **Step 4: Commit**

```bash
git add src/partials/ && git commit -m "feat: partiale karty artykulu, udostepniania i kontaktu

Karty z lazy loading i jawnymi wymiarami. Udostepnianie bez
skryptow zewnetrznych i licznikow. Mailto bez obfuskacji JS.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 15: Szablony stron

**Files:**
- Create: `src/templates/home.html`
- Create: `src/templates/list.html`
- Create: `src/templates/post.html`
- Create: `src/templates/page.html`

- [ ] **Step 1: Utwórz `src/templates/home.html`**

```html
<section class="press-hero">
  <div class="container press-hero__inner">
    <p class="section-eyebrow">ERLI</p>
    <h1 class="press-hero__title">Biuro <em class="text-highlight text-highlight--box">prasowe</em></h1>
    <p class="press-hero__lead">Komunikaty prasowe, wyniki i materiały dla dziennikarzy piszących o ERLI.</p>
  </div>
</section>

<section class="section" aria-labelledby="najnowsze">
  <div class="container">
    <header class="section-header">
      <h2 id="najnowsze" class="section-header__heading">Najnowsze</h2>
      <a class="section-header__link" href="/aktualnosci/">Wszystkie aktualności</a>
    </header>
    <div class="post-grid">
      {{#each najnowsze}}{{> post-card }}{{/each}}
    </div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="w-skrocie">
  <div class="container">
    <header class="section-header">
      <h2 id="w-skrocie" class="section-header__heading">ERLI w skrócie</h2>
    </header>
    <ul class="trust-grid" role="list">
      {{#each skrot}}
      <li class="trust-card">
        <h3 class="trust-card__title">{{ tytul }}</h3>
        <p class="trust-card__text">{{ tekst }}</p>
      </li>
      {{/each}}
    </ul>
  </div>
</section>

{{> contact-block }}
```

- [ ] **Step 2: Utwórz `src/templates/list.html`**

Grupowanie po latach pełni funkcję nawigacyjną — dziennikarz szukający wyników za konkretny rok od razu widzi, gdzie patrzeć.

```html
<section class="section section--page-top">
  <div class="container">
    <p class="section-eyebrow">Biuro prasowe ERLI</p>
    <h1 class="page-title">{{ naglowek }}</h1>
    <p class="page-lead">{{ wprowadzenie }}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    {{#each grupy}}
    <div class="year-group">
      <h2 class="year-group__heading">{{ rok }}</h2>
      <div class="post-grid">
        {{#each posty}}{{> post-card }}{{/each}}
      </div>
    </div>
    {{/each}}

    {{#if maPaginacje}}
    <nav class="pagination" aria-label="Paginacja">
      {{#if poprzednia}}<a class="pagination__link" href="{{ poprzednia }}" rel="prev">Poprzednia</a>{{/if}}
      <span class="pagination__status">Strona {{ numer }} z {{ lacznie }}</span>
      {{#if nastepna}}<a class="pagination__link" href="{{ nastepna }}" rel="next">Następna</a>{{/if}}
    </nav>
    {{/if}}
  </div>
</section>

{{> contact-block }}
```

- [ ] **Step 3: Utwórz `src/templates/post.html`**

Blok źródła nad treścią rozwiązuje problem starej strony, gdzie link do publikacji zewnętrznej był zaszyty w środku akapitu i łatwo go było przeoczyć.

```html
<article class="post">
  <div class="container post__container">
    <p class="post__meta">
      <a class="post__kategoria" href="{{ kategoriaUrl }}">{{ kategoriaNazwa }}</a>
      <time datetime="{{ data }}">{{ dataPl }}</time>
    </p>
    <h1 class="post__title">{{ tytul }}</h1>
    {{#if lead}}<p class="post__lead">{{ lead }}</p>{{/if}}

    <figure class="post__media">
      <img src="{{ grafikaUrl }}" alt="" width="1200" height="630" loading="eager" fetchpriority="high">
    </figure>

    {{#if zrodlo}}
    <aside class="source-note">
      <p>Materiał opublikowany w <strong>{{ zrodlo.nazwa }}</strong>.
        <a href="{{ zrodlo.url }}" target="_blank" rel="noopener noreferrer">Przejdź do oryginału</a>
      </p>
    </aside>
    {{/if}}

    <div class="prose">
{{{ trescHtml }}}
    </div>

    {{> share }}
  </div>
</article>

{{#if powiazane}}
<section class="section section--soft" aria-labelledby="powiazane">
  <div class="container">
    <header class="section-header">
      <h2 id="powiazane" class="section-header__heading">Powiązane materiały</h2>
    </header>
    <div class="post-grid">
      {{#each powiazane}}{{> post-card }}{{/each}}
    </div>
  </div>
</section>
{{/if}}

{{> contact-block }}
```

- [ ] **Step 4: Utwórz `src/templates/page.html`**

```html
<section class="section section--page-top">
  <div class="container container--narrow">
    <p class="section-eyebrow">Biuro prasowe ERLI</p>
    <h1 class="page-title">{{ tytul }}</h1>
    <div class="prose">
{{{ trescHtml }}}
    </div>
  </div>
</section>

{{> contact-block }}
```

- [ ] **Step 5: Commit**

```bash
git add src/templates/ && git commit -m "feat: szablony stron

Strona glowna, listy z grupowaniem po latach, artykul z blokiem
zrodla dla kategorii media, strona statyczna.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 16: Renderowanie strony — złożenie szablonu z danymi

**Files:**
- Create: `build/render.js`
- Test: `build/render.test.js`

- [ ] **Step 1: Napisz testy**

```js
// build/render.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
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
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test build/render.test.js
```

Expected: FAIL — `Cannot find module './render.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// build/render.js
import { DOMENA } from './seo.js';
import { plainText } from './markdown.js';

export const KATEGORIE = {
  aktualnosci: {
    nazwa: 'Aktualności',
    url: '/aktualnosci/',
    naglowek: 'Aktualności',
    wprowadzenie: 'Komunikaty prasowe i informacje o działalności ERLI.',
  },
  'media-o-erli': {
    nazwa: 'Media o ERLI',
    url: '/media-o-erli/',
    naglowek: 'Media o ERLI',
    wprowadzenie: 'Publikacje na temat ERLI w mediach zewnętrznych.',
  },
};

const ATRYBUT_AKTYWNY = ' aria-current="page" class="is-active"';

/** Ustawia aria-current na pozycji menu odpowiadajacej biezacemu adresowi. */
export function navFlags(url) {
  return {
    aktywnaAktualnosci: url.startsWith('/aktualnosci') ? ATRYBUT_AKTYWNY : '',
    aktywnaMedia: url.startsWith('/media-o-erli') ? ATRYBUT_AKTYWNY : '',
    aktywnaONas: url.startsWith('/o-nas') ? ATRYBUT_AKTYWNY : '',
    aktywnaKontakt: url.startsWith('/kontakt') ? ATRYBUT_AKTYWNY : '',
  };
}

/** Sciezka do key visuala; domyslnie nazwa pliku rowna slugowi. */
export function grafikaUrl(post) {
  return `/assets/img/kv/${post.grafika ?? post.slug}.webp`;
}

/** JSON-LD NewsArticle dla pojedynczego artykulu. */
export function articleSchema(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.tytul,
    datePublished: post.data,
    dateModified: post.data,
    description: plainText(post.lead),
    image: `${DOMENA}${grafikaUrl(post)}`,
    mainEntityOfPage: `${DOMENA}${post.url}`,
    inLanguage: 'pl-PL',
    publisher: {
      '@type': 'Organization',
      name: 'ERLI',
      logo: { '@type': 'ImageObject', url: `${DOMENA}/assets/img/erli-logo.svg` },
    },
  });
}

/** JSON-LD Organization — na kazdej stronie. */
export function organizationSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ERLI',
    url: 'https://erli.pl',
    logo: `${DOMENA}/assets/img/erli-logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'press',
      email: 'media@erli.pl',
      availableLanguage: 'Polish',
    },
  });
}

/**
 * Trzy powiazane materialy: najpierw z tej samej kategorii,
 * w razie braku uzupelnione pozostalymi. Biezacy zawsze pominiety.
 */
export function powiazaneDo(post, wszystkie, ile = 3) {
  const inne = wszystkie.filter((p) => p.slug !== post.slug);
  const tejSamej = inne.filter((p) => p.kategoria === post.kategoria);
  const reszta = inne.filter((p) => p.kategoria !== post.kategoria);
  return [...tejSamej, ...reszta].slice(0, ile);
}

/** Wzbogaca post o pola potrzebne w szablonach. */
export function decoratePost(post) {
  return {
    ...post,
    grafikaUrl: grafikaUrl(post),
    kategoriaNazwa: KATEGORIE[post.kategoria].nazwa,
    kategoriaUrl: KATEGORIE[post.kategoria].url,
    urlPelny: `${DOMENA}${post.url}`,
    urlEnc: encodeURIComponent(`${DOMENA}${post.url}`),
    tytulEnc: encodeURIComponent(post.tytul),
  };
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test build/render.test.js
```

Expected: `# pass 9`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add build/render.js build/render.test.js && git commit -m "feat: pomocniki renderowania stron

aria-current, sciezki key visuali, JSON-LD NewsArticle
i Organization, dobor powiazanych materialow.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 17: Orkiestracja — build.js

**Files:**
- Create: `build.js`
- Create: `src/pages/o-nas.md` (szkielet)
- Create: `src/pages/kontakt.md` (szkielet)
- Create: `src/posts/aktualnosci/2025-11-03-nowa-era-handlu-online-ai-od-erli.md` (post testowy)

- [ ] **Step 1: Utwórz post testowy**

Treść pobrana z obecnej strony — posłuży do weryfikacji całego łańcucha, zanim przyjdzie eksport z Joomli.

Plik `src/posts/aktualnosci/2025-11-03-nowa-era-handlu-online-ai-od-erli.md`:

```markdown
---
tytul: "Nowa era handlu online: AI od ERLI dla sprzedawców"
data: 2025-11-03
lead: Platforma e-commerce ERLI wdraża rozwiązania oparte na sztucznej inteligencji, które automatyzują kategoryzację produktów, poprawiają grafiki i personalizują oferty.
---

Platforma e-commerce ERLI stale pracuje nad innowacyjnymi rozwiązaniami, które wspierają rozwój sprzedawców i ułatwiają zakupy użytkownikom. Wdrażając technologie oparte na sztucznej inteligencji, ERLI automatycznie kategoryzuje produkty, poprawia grafiki i personalizuje oferty.

## Technologia w odpowiedzi na rosnące oczekiwania

Prowadzenie sprzedaży online nigdy nie było tak wymagające. Kupujący oczekują szerokiej oferty, konkurencyjnych cen, szybkiej dostawy i przejrzystego procesu zakupowego.

> Rozwiązania technologiczne, w tym te oparte na sztucznej inteligencji, służą nam przede wszystkim do lepszego rozumienia klienta i jego intencji — mówi Adam Ciesielczyk, Prezes i Założyciel ERLI.

## Automatyzacja kampanii

W odpowiedzi na potrzebę skutecznego promowania produktów powstały ERLI Campaigns — system automatycznych kampanii reklamowych oparty na AI. Platforma zarządza ponad 40 milionami produktów i prowadzi 60 tysięcy kampanii reklamowych.
```

- [ ] **Step 2: Utwórz szkielety stron statycznych**

`src/pages/o-nas.md`:

```markdown
---
tytul: O nas
lead: ERLI — druga co do wielkości platforma marketplace w Polsce.
---

Treść do uzupełnienia z eksportu Joomli (Task 21).
```

`src/pages/kontakt.md`:

```markdown
---
tytul: Kontakt
lead: Zapraszamy do kontaktu.
---

Treść do uzupełnienia z eksportu Joomli (Task 21).
```

- [ ] **Step 3: Napisz `build.js`**

```js
// build.js
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

import { loadPosts, groupByYear } from './build/posts.js';
import { parseFrontmatter } from './build/frontmatter.js';
import { render } from './build/template.js';
import { renderMarkdown, plainText } from './build/markdown.js';
import { buildCss } from './build/css.js';
import { assertNoGerman } from './build/lang-guard.js';
import { buildSitemap, buildRobots, DOMENA } from './build/seo.js';
import { buildRedirectMap, toHtaccess, toNginx, toCsv } from './build/redirects.js';
import { paginate } from './build/paginate.js';
import {
  KATEGORIE, navFlags, decoratePost, powiazaneDo,
  articleSchema, organizationSchema,
} from './build/render.js';

const ROK = '2026';
const DIST = 'dist';

const SKROT = [
  { tytul: 'Polski marketplace', tekst: 'Największa polska platforma marketplace tego typu.' },
  { tytul: 'Ponad 30 tys. sprzedawców', tekst: 'Wyłącznie polscy sprzedawcy.' },
  { tytul: 'Miliony produktów', tekst: 'Szeroka oferta w kilkunastu kategoriach.' },
  { tytul: 'Aplikacja mobilna', tekst: 'Ponad 2 miliony pobrań.' },
];

/** Wczytuje wszystkie szablony i partiale z dysku. */
async function loadTemplates() {
  const czytaj = async (dir) => {
    const wpisy = {};
    for (const plik of await readdir(dir)) {
      if (plik.endsWith('.html')) {
        wpisy[plik.replace('.html', '')] = await readFile(join(dir, plik), 'utf8');
      }
    }
    return wpisy;
  };
  return {
    templates: await czytaj('src/templates'),
    partials: await czytaj('src/partials'),
  };
}

/** Sklada strone: tresc w szablonie wewnetrznym, calosc w base. */
function skladaj({ templates, partials }, nazwaSzablonu, kontekst) {
  const wspolne = { rok: ROK, ...navFlags(kontekst.url), ...kontekst };
  const tresc = render(templates[nazwaSzablonu], wspolne, partials);
  return render(templates.base, { ...wspolne, tresc }, partials);
}

/** Zapisuje plik, tworzac po drodze brakujace katalogi. */
async function zapisz(sciezka, zawartosc) {
  await mkdir(dirname(sciezka), { recursive: true });
  await writeFile(sciezka, zawartosc, 'utf8');
}

async function build() {
  console.log('Budowanie...');

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // --- treść ---
  const aktualnosci = existsSync('src/posts/aktualnosci')
    ? await loadPosts('src/posts/aktualnosci', 'aktualnosci')
    : [];
  const media = existsSync('src/posts/media')
    ? await loadPosts('src/posts/media', 'media-o-erli')
    : [];

  const wszystkie = [...aktualnosci, ...media]
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .map(decoratePost);

  console.log(`  ${aktualnosci.length} aktualnosci, ${media.length} media o ERLI`);

  const tpl = await loadTemplates();
  const strony = [];
  const doSitemap = [];

  const dodaj = (sciezkaUrl, html, lastmod, priority) => {
    const plik = sciezkaUrl === '/' ? 'index.html' : `${sciezkaUrl.slice(1, -1)}/index.html`;
    strony.push({ sciezka: plik, html });
    doSitemap.push({ url: sciezkaUrl, lastmod, priority });
  };

  // --- strona główna ---
  dodaj('/', skladaj(tpl, 'home', {
    url: '/',
    tytulStrony: 'Biuro prasowe ERLI',
    opis: 'Komunikaty prasowe, wyniki i materiały dla dziennikarzy piszących o ERLI.',
    kanoniczny: `${DOMENA}/`,
    ogTyp: 'website',
    ogObraz: `${DOMENA}/assets/img/kv/default.webp`,
    schemaJsonLd: `<script type="application/ld+json">${organizationSchema()}</script>`,
    najnowsze: wszystkie.slice(0, 6),
    skrot: SKROT,
  }), '2026-07-27', '1.0');

  // --- listy kategorii ---
  for (const [klucz, meta] of Object.entries(KATEGORIE)) {
    const posty = wszystkie.filter((p) => p.kategoria === klucz);
    for (const strona of paginate(posty, meta.url)) {
      dodaj(strona.url, skladaj(tpl, 'list', {
        url: strona.url,
        tytulStrony: `${meta.naglowek} — Biuro prasowe ERLI`,
        opis: meta.wprowadzenie,
        kanoniczny: `${DOMENA}${strona.url}`,
        ogTyp: 'website',
        ogObraz: `${DOMENA}/assets/img/kv/default.webp`,
        schemaJsonLd: `<script type="application/ld+json">${organizationSchema()}</script>`,
        naglowek: meta.naglowek,
        wprowadzenie: meta.wprowadzenie,
        grupy: groupByYear(strona.elementy),
        maPaginacje: strona.lacznie > 1,
        numer: strona.numer,
        lacznie: strona.lacznie,
        poprzednia: strona.poprzednia,
        nastepna: strona.nastepna,
      }), '2026-07-27', '0.8');
    }
  }

  // --- artykuły ---
  for (const post of wszystkie) {
    const trescHtml = renderMarkdown(post.tresc);
    dodaj(post.url, skladaj(tpl, 'post', {
      ...post,
      tytulStrony: `${post.tytul} — Biuro prasowe ERLI`,
      opis: plainText(post.lead) || plainText(trescHtml).slice(0, 155),
      kanoniczny: post.urlPelny,
      ogTyp: 'article',
      ogObraz: `${DOMENA}${post.grafikaUrl}`,
      schemaJsonLd:
        `<script type="application/ld+json">${articleSchema(post)}</script>\n` +
        `  <script type="application/ld+json">${organizationSchema()}</script>`,
      trescHtml,
      powiazane: powiazaneDo(post, wszystkie),
    }), post.data, '0.7');
  }

  // --- strony statyczne ---
  for (const plik of await readdir('src/pages')) {
    if (!plik.endsWith('.md')) continue;
    const { data, body } = parseFrontmatter(await readFile(join('src/pages', plik), 'utf8'));
    const slug = plik.replace('.md', '');
    const url = `/${slug}/`;
    dodaj(url, skladaj(tpl, 'page', {
      url,
      tytul: data.tytul,
      tytulStrony: `${data.tytul} — Biuro prasowe ERLI`,
      opis: data.lead ?? '',
      kanoniczny: `${DOMENA}${url}`,
      ogTyp: 'website',
      ogObraz: `${DOMENA}/assets/img/kv/default.webp`,
      schemaJsonLd: `<script type="application/ld+json">${organizationSchema()}</script>`,
      trescHtml: renderMarkdown(body),
    }), '2026-07-27', '0.5');
  }

  // --- kontrola językowa: przerywa build ---
  assertNoGerman(strony);
  console.log('  kontrola jezykowa: OK');

  // --- zapis ---
  for (const { sciezka, html } of strony) {
    await zapisz(join(DIST, sciezka), html);
  }

  await zapisz(join(DIST, 'assets/css/main.css'), await buildCss('assets/css'));
  await cp('assets/fonts', join(DIST, 'assets/fonts'), { recursive: true });
  await cp('assets/img', join(DIST, 'assets/img'), { recursive: true });
  await cp('assets/js', join(DIST, 'assets/js'), { recursive: true });

  await zapisz(join(DIST, 'sitemap.xml'), buildSitemap(doSitemap));
  await zapisz(join(DIST, 'robots.txt'), buildRobots());

  const mapa = buildRedirectMap(wszystkie);
  await zapisz(join(DIST, 'redirects/.htaccess'), toHtaccess(mapa));
  await zapisz(join(DIST, 'redirects/nginx.conf'), toNginx(mapa));
  await zapisz(join(DIST, 'redirects/mapa.csv'), toCsv(mapa));

  console.log(`  ${strony.length} stron, ${mapa.length} przekierowan`);
  console.log('Gotowe: dist/');
}

build().catch((err) => {
  console.error('\nBUILD PRZERWANY\n');
  console.error(err.message);
  process.exit(1);
});
```

- [ ] **Step 4: Uruchom build**

```bash
node build.js
```

Expected:
```
Budowanie...
  1 aktualnosci, 0 media o ERLI
  kontrola jezykowa: OK
  N stron, M przekierowan
Gotowe: dist/
```

Jeśli kontrola językowa przerwie build — przeczytaj raport, znajdź niemiecki fragment i usuń go u źródła.

- [ ] **Step 5: Obejrzyj wynik w przeglądarce**

```bash
npx http-server dist -p 8000 -c-1
```

Otwórz `http://localhost:8000`. Sprawdź: strona główna, `/aktualnosci/`, artykuł, `/o-nas/`, `/kontakt/`. Menu ma zaznaczać aktywną pozycję.

- [ ] **Step 6: Uruchom cały zestaw testów**

```bash
npm test
```

Expected: wszystkie testy przechodzą.

- [ ] **Step 7: Commit**

```bash
git add build.js src/pages src/posts && git commit -m "feat: orkiestracja builda

Generuje strone glowna, listy kategorii, artykuly i strony
statyczne. Sklada CSS, sitemap, robots i mape przekierowan.
Kontrola jezykowa przerywa build przed zapisem.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 18: Przycięcie CSS i naprawa progu nawigacji

**Files:**
- Modify: `assets/css/components.css`
- Modify: `assets/css/layout.css`
- Delete: `assets/css/critical.css`

- [ ] **Step 1: Usuń `critical.css`**

Był potrzebny przy asynchronicznym ładowaniu `main.css`. `base.html` ładuje arkusz zwykłym `<link>`, więc plik jest martwy.

```bash
git rm assets/css/critical.css
```

- [ ] **Step 2: Usuń martwe bloki z `components.css`**

Usuń reguły dla następujących selektorów wraz z ich media queries. Żaden nie występuje w nowych szablonach:

- karuzela: `.carousel`, `.carousel__track`, `.carousel__item`, `.carousel__prev`, `.carousel__next`
- marquee: `.reviews-marquee*`, `.review-card`, `.reviews-figure*`, `.reviews-stats*`, `.reviews-link-wrap`, `.reviews-section`
- formularze: `.form-field`, `.form-input`, `.form-label`, `.form-textarea`, `.form-checkbox`, `.form-error`, `.form-message--success`, `.form-message--error`, `.form-submit`
- kategorie: `.cat-bento*`, `.cat-card*`, `.cat-tile*`, `.cat-grid-a`, `.cat-grid-b`, `.categories-grid`, `.categories-section`
- pozostałości erli.de: `.was-ist-*`, `.team-split*`, `.about-stat*`, `.b2b-split*`, `.b2b-box`, `.company-box`, `.kontakt-layout`, `.kontakt-info-col`, `.kontakt-detail`, `.contact-form-*`, `.contact-detail*`, `.faq-*`, `.hero__stat*`, `.hero__float-card*`, `.hero__badge*`, `.hero__photo*`, `.hero--subpage`, `.hero--no-photo`, `.cta-card*`, `.cta-section`, `.trust-section`, `.page-hero*`, `.section--inverse`, `.section--yellow`, `.section--brand`, `.legal-placeholder`, `.prose--legal`

Zostaw: `.btn*`, `.trust-grid`, `.trust-card*`, `.section*`, `.container`, `.prose`, `.check-list`, `.text-highlight*`, `.site-header*`, `.nav-toggle*`, `.site-footer*`, `.skip-link`, `.animate-reveal`, `.visually-hidden`.

- [ ] **Step 3: Usuń niemieckie komentarze**

W `components.css` usuń lub przetłumacz dwa komentarze sekcyjne zawierające `"Erfahrungen mit ERLI"` i `"Für Unternehmen & Verkäufer"` (wraz z blokami, które opisują — te sekcje i tak lecą w kroku 2).

- [ ] **Step 4: Napraw próg nawigacji mobilnej**

Znajdź w `layout.css` (lub `components.css`) media query z progiem `480px` sterujący `.site-header__nav` i `.nav-toggle`. Zmień `480px` na `768px` w obu miejscach.

Obecnie burger pojawia się dopiero poniżej 480 px, więc w zakresie 481–768 px widoczna jest pełna nawigacja, która się nie mieści.

- [ ] **Step 5: Zweryfikuj brak niemieckiego w CSS**

```bash
grep -nE "[äöüßÄÖÜ]" assets/css/*.css
```

Expected: brak wyników.

- [ ] **Step 6: Przebuduj i sprawdź rozmiar**

```bash
node build.js && ls -la dist/assets/css/main.css
```

Expected: build przechodzi, `main.css` wyraźnie mniejszy niż pierwotne 96 KB.

- [ ] **Step 7: Sprawdź w przeglądarce trzy szerokości**

```bash
npx http-server dist -p 8000 -c-1
```

Sprawdź przy 375 px, 600 px i 1280 px. Przy 375 i 600 ma być burger; przy 1280 pełne menu. Nic nie może wystawać poza ekran.

- [ ] **Step 8: Commit**

```bash
git add -A assets/css && git commit -m "refactor: przyciecie CSS i naprawa progu nawigacji

Usuniety martwy kod (karuzela, marquee, formularze, kategorie,
pozostalosci erli.de) i niemieckie komentarze. Prog burgera
przesuniety z 480px na 768px — naprawia rozjazd na tabletach.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 19: Style biura prasowego

**Files:**
- Create: `assets/css/press.css`
- Modify: `build/css.js`
- Modify: `build/css.test.js`

- [ ] **Step 1: Dopisz test kolejności**

W `build/css.test.js` podmień pierwszy test:

```js
test('kolejnosc zrodel jest ustalona', () => {
  assert.deepEqual(CSS_ORDER, ['tokens.css', 'base.css', 'layout.css', 'components.css', 'press.css']);
});
```

- [ ] **Step 2: Uruchom test — musi się wywalić**

```bash
node --test build/css.test.js
```

Expected: FAIL — brak `press.css` w `CSS_ORDER`.

- [ ] **Step 3: Dopisz `press.css` do kolejności**

W `build/css.js`:

```js
export const CSS_ORDER = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'press.css'];
```

- [ ] **Step 4: Utwórz `assets/css/press.css`**

Wyłącznie tokeny z `tokens.css` — żadnych wartości wpisanych na sztywno.

```css
/* Komponenty biura prasowego. Wszystkie wartosci z tokens.css. */

/* --- hero --- */
.press-hero {
  background: var(--gradient-brand-vivid);
  color: var(--color-text-on-brand);
  padding-block: var(--space-3xl);
}
.press-hero__title {
  font-family: var(--font-display);
  font-size: var(--text-display-lg);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  margin-block: var(--space-md) var(--space-lg);
}
.press-hero__lead {
  font-size: var(--text-body-lg);
  max-width: 52ch;
}

/* --- naglowki stron --- */
.page-title {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: var(--weight-bold);
  line-height: var(--leading-heading);
  margin-block: var(--space-sm) var(--space-md);
}
.page-lead {
  font-size: var(--text-body-lg);
  color: var(--color-text-secondary);
  max-width: 60ch;
}

/* --- siatka kart --- */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

/* --- karta artykulu --- */
.post-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--duration-default) var(--ease-default),
              transform var(--duration-default) var(--ease-default);
}
.post-card:hover,
.post-card:focus-within {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}
.post-card__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: inherit;
  text-decoration: none;
}
.post-card__link:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
.post-card__media { aspect-ratio: 1200 / 630; background: var(--color-neutral-75); }
.post-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.post-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--padding-card-default);
  flex: 1;
}
.post-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-caption-1);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-overline);
}
.post-card__kategoria { color: var(--color-primary-700); font-weight: var(--weight-bold); }
.post-card__title {
  font-family: var(--font-display);
  font-size: var(--text-h5);
  font-weight: var(--weight-bold);
  line-height: var(--leading-heading);
}
.post-card__lead {
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-card__more { margin-top: auto; color: var(--color-link); font-weight: var(--weight-bold); }

/* --- grupy roczne --- */
.year-group + .year-group { margin-top: var(--space-3xl); }
.year-group__heading {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  color: var(--color-text-muted);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--space-sm);
  margin-bottom: var(--space-lg);
}

/* --- artykul --- */
.post__container { max-width: 720px; }
.post__meta {
  display: flex;
  gap: var(--space-md);
  font-size: var(--text-caption-1);
  text-transform: uppercase;
  letter-spacing: var(--tracking-overline);
  color: var(--color-text-muted);
}
.post__title {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: var(--weight-bold);
  line-height: var(--leading-heading);
  margin-block: var(--space-sm) var(--space-md);
}
.post__lead {
  font-size: var(--text-body-lg);
  font-weight: var(--weight-bold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}
.post__media { margin-block: var(--space-lg); }
.post__media img { width: 100%; height: auto; border-radius: var(--radius-lg); display: block; }

/* --- blok zrodla dla kategorii media --- */
.source-note {
  background: var(--color-surface-soft);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--padding-card-cozy);
  margin-block: var(--space-lg);
}

/* --- udostepnianie --- */
.share { margin-top: var(--space-2xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-border); }
.share__heading {
  font-size: var(--text-caption-1);
  text-transform: uppercase;
  letter-spacing: var(--tracking-overline);
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}
.share__list { display: flex; flex-wrap: wrap; gap: var(--space-sm); list-style: none; padding: 0; }
.share__link {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background: none;
  font: inherit;
  color: var(--color-text-primary);
  text-decoration: none;
  cursor: pointer;
}
.share__link:hover { border-color: var(--color-primary); color: var(--color-primary-700); }
.share__link:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }

/* --- blok kontaktowy --- */
.contact-block { background: var(--color-surface-soft); padding-block: var(--space-2xl); }
.contact-block__inner { text-align: center; }
.contact-block__heading { font-family: var(--font-display); font-size: var(--text-h3); margin-bottom: var(--space-md); }
.contact-block__person { font-weight: var(--weight-bold); }
.contact-block__email a { font-size: var(--text-body-lg); color: var(--color-link); }
.contact-block__note { margin-top: var(--space-md); color: var(--color-text-secondary); font-size: var(--text-caption-1); }

/* --- paginacja (nieaktywna przy obecnej liczbie wpisow) --- */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-top: var(--space-2xl);
}
.pagination__status { color: var(--color-text-muted); font-size: var(--text-caption-1); }

/* --- naglowek sekcji z linkiem --- */
.section-header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-md); flex-wrap: wrap; margin-bottom: var(--space-lg); }
.section-header__link { color: var(--color-link); font-weight: var(--weight-bold); }

.container--narrow { max-width: 720px; }

@media (max-width: 768px) {
  .post-grid { grid-template-columns: 1fr; }
  .press-hero { padding-block: var(--space-2xl); }
}
```

- [ ] **Step 5: Dodaj obsługę „Kopiuj link"**

Utwórz `assets/js/share.js`:

```js
// Kopiowanie adresu artykulu. Bez zaleznosci zewnetrznych.
document.querySelectorAll('.share__copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.url);
      const oryginal = btn.textContent;
      btn.textContent = 'Skopiowano';
      setTimeout(() => { btn.textContent = oryginal; }, 2000);
    } catch {
      btn.textContent = 'Nie udało się skopiować';
    }
  });
});
```

Dopisz w `src/templates/post.html` na końcu pliku:

```html
<script src="/assets/js/share.js" defer></script>
```

- [ ] **Step 6: Uruchom testy i build**

```bash
npm test && node build.js
```

Expected: testy przechodzą, build się kończy.

- [ ] **Step 7: Sprawdź w przeglądarce**

```bash
npx http-server dist -p 8000 -c-1
```

Sprawdź strona główna, lista, artykuł. Przetestuj „Kopiuj link". Przejdź stronę samą klawiaturą (Tab) — każdy element interaktywny musi mieć widoczny focus.

- [ ] **Step 8: Commit**

```bash
git add assets/css/press.css assets/js/share.js build/css.js build/css.test.js src/templates/post.html && git commit -m "feat: style biura prasowego

Hero, karty artykulow, grupy roczne, blok zrodla, udostepnianie,
blok kontaktowy, paginacja. Wszystkie wartosci z tokens.css.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Faza 3 — grafiki

### Task 20: Generator key visuali

Jedna grafika 1200×630 służy jako obraz karty i jako `og:image`. Obecna strona nie ma żadnego podglądu przy udostępnianiu.

**Files:**
- Create: `tools/kv-generate.js`
- Test: `tools/kv-generate.test.js`
- Create: `assets/img/kv/*.webp`

- [ ] **Step 1: Napisz testy**

```js
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
```

- [ ] **Step 2: Uruchom testy — muszą się wywalić**

```bash
node --test tools/kv-generate.test.js
```

Expected: FAIL — `Cannot find module './kv-generate.js'`

- [ ] **Step 3: Zaimplementuj**

```js
// tools/kv-generate.js
// Generator key visuali 1200x630. Uruchamiany recznie, nie w kazdym buildzie.

/** Warianty tla — wartosci zgodne z tokens.css. */
export const WARIANTY = [
  { nazwa: 'teal',   od: '#0097bc', do: '#00b3bc', tekst: '#ffffff', akcent: '#feda30' },
  { nazwa: 'yellow', od: '#feda30', do: '#ffc70e', tekst: '#1a1a1a', akcent: '#005b71' },
  { nazwa: 'navy',   od: '#005b71', do: '#007996', tekst: '#ffffff', akcent: '#feda30' },
];

/** Deterministyczny wybor na podstawie sluga — ten sam artykul zawsze ten sam wariant. */
export function wybierzWariant(slug) {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return WARIANTY[hash % WARIANTY.length];
}

/** Lamie tytul na linie o zadanej dlugosci, obcinajac do maksymalnej liczby linii. */
export function lamTytul(tytul, maxZnakow = 24, maxLinii = 4) {
  const linie = [];
  let biezaca = '';

  for (const slowo of tytul.split(/\s+/)) {
    const kandydat = biezaca ? `${biezaca} ${slowo}` : slowo;
    if (kandydat.length > maxZnakow && biezaca) {
      linie.push(biezaca);
      biezaca = slowo;
    } else {
      biezaca = kandydat;
    }
  }
  if (biezaca) linie.push(biezaca);

  if (linie.length > maxLinii) {
    const przyciete = linie.slice(0, maxLinii);
    przyciete[maxLinii - 1] = `${przyciete[maxLinii - 1]}…`;
    return przyciete;
  }
  return linie;
}

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Buduje SVG key visuala. */
export function buildSvg({ tytul, kategoria, slug }) {
  const w = wybierzWariant(slug);
  const linie = lamTytul(tytul);
  const startY = 300 - (linie.length - 1) * 32;

  const tspany = linie
    .map((linia, i) => `<tspan x="80" y="${startY + i * 64}">${esc(linia)}</tspan>`)
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="tlo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${w.od}"/>
      <stop offset="100%" stop-color="${w.do}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#tlo)"/>
  <circle cx="1080" cy="90" r="220" fill="${w.akcent}" opacity="0.12"/>
  <text x="80" y="110" font-family="Montserrat, sans-serif" font-size="26" font-weight="700"
        fill="${w.akcent}" letter-spacing="3">${esc(kategoria.toUpperCase())}</text>
  <text font-family="Montserrat, sans-serif" font-size="54" font-weight="700" fill="${w.tekst}">
      ${tspany}
  </text>
  <text x="80" y="560" font-family="Montserrat, sans-serif" font-size="30" font-weight="700"
        fill="${w.tekst}" opacity="0.85">ERLI — Biuro prasowe</text>
</svg>`;
}
```

- [ ] **Step 4: Uruchom testy — muszą przejść**

```bash
node --test tools/kv-generate.test.js
```

Expected: `# pass 7`, `# fail 0`

- [ ] **Step 5: Dopisz uruchamianie z linii poleceń**

Na końcu `tools/kv-generate.js`:

```js
// --- CLI ---
// Uruchomienie: node tools/kv-generate.js
// Czyta posty, zapisuje SVG do assets/img/kv/. Konwersja do WebP: osobny krok.
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const { loadPosts } = await import('../build/posts.js');
  const { KATEGORIE } = await import('../build/render.js');
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { existsSync } = await import('node:fs');

  await mkdir('assets/img/kv', { recursive: true });

  const zrodla = [
    ['src/posts/aktualnosci', 'aktualnosci'],
    ['src/posts/media', 'media-o-erli'],
  ];

  let ile = 0;
  for (const [dir, kategoria] of zrodla) {
    if (!existsSync(dir)) continue;
    for (const post of await loadPosts(dir, kategoria)) {
      const svg = buildSvg({
        tytul: post.tytul,
        kategoria: KATEGORIE[kategoria].nazwa,
        slug: post.slug,
      });
      await writeFile(`assets/img/kv/${post.grafika ?? post.slug}.svg`, svg, 'utf8');
      ile += 1;
    }
  }

  // Grafika zapasowa dla strony glownej i list.
  await writeFile(
    'assets/img/kv/default.svg',
    buildSvg({ tytul: 'Biuro prasowe', kategoria: 'ERLI', slug: 'default' }),
    'utf8'
  );

  console.log(`Wygenerowano ${ile + 1} key visuali w assets/img/kv/`);
}
```

- [ ] **Step 6: Wygeneruj grafiki**

```bash
node tools/kv-generate.js && ls assets/img/kv/
```

Expected: pliki `.svg` dla każdego posta + `default.svg`.

- [ ] **Step 7: Przekonwertuj do WebP**

SVG nie działa jako `og:image` — Facebook i LinkedIn nie renderują go. Konwersja jednorazowa, wynik trafia do repozytorium.

```bash
npx --yes sharp-cli --input "assets/img/kv/*.svg" --output assets/img/kv --format webp --quality 82
```

Jeśli `sharp-cli` zawiedzie, alternatywa przez ImageMagick:

```bash
for f in assets/img/kv/*.svg; do magick "$f" -quality 82 "${f%.svg}.webp"; done
```

Sprawdź wynik:

```bash
ls -la assets/img/kv/*.webp
```

Expected: po jednym `.webp` na każdy `.svg`, każdy poniżej 100 KB.

- [ ] **Step 8: Obejrzyj kilka grafik**

Otwórz 3 pliki `.webp` i sprawdź: tekst mieści się w kadrze, kontrast czytelny, nic nie wychodzi poza krawędź.

- [ ] **Step 9: Commit**

```bash
git add tools/ assets/img/kv/ && git commit -m "feat: generator key visuali

Deterministyczny wybor jednego z trzech wariantow tla na podstawie
sluga. Format 1200x630 sluzy jednoczesnie jako obraz karty i og:image.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Faza 4 — treść (wymaga eksportu z Joomli)

> Zadania 21–23 są zablokowane do momentu dostarczenia plików z Joomli. Wszystko wcześniejsze da się wykonać od razu.

### Task 21: Migracja artykułów

**Files:**
- Create: `src/posts/aktualnosci/*.md` (~20 plików)
- Create: `src/posts/media/*.md` (~20 plików)

- [ ] **Step 1: Przejrzyj eksport**

Zlokalizuj w eksporcie tabele artykułów (Joomla: `#__content`) oraz przypisania kategorii (`#__categories`). Sprawdź, czy są artykuły niewidoczne z zewnątrz: nieopublikowane, zarchiwizowane, w koszu. Zgłoś ich listę użytkownikowi i zapytaj, które migrować.

- [ ] **Step 2: Sprawdź konfigurację pod kątem analityki**

```bash
grep -rniE "gtag|GTM-|UA-[0-9]|G-[A-Z0-9]{8}|analytics|facebook|pixel|hotjar|clarity" <katalog-eksportu> | head -50
```

Front strony nie pokazywał żadnej analityki. Jeśli w plikach coś jest — zgłoś użytkownikowi przed migracją.

- [ ] **Step 3: Utwórz pliki markdown**

Dla każdego artykułu jeden plik `src/posts/<kategoria>/RRRR-MM-DD-<slug>.md`.

**Slug musi być identyczny jak w Joomli** — na tym opiera się mapa przekierowań. Skopiuj go z pola `alias`, nie generuj z tytułu.

Szablon dla Aktualności:

```markdown
---
tytul: "<tytul z pola title>"
data: <RRRR-MM-DD z pola created>
lead: <pierwsze zdanie lub dwa, bez znacznikow>
---

<tresc: HTML zamieniony na markdown>
```

Szablon dla Media o ERLI — link do publikacji zewnętrznej wychodzi z treści do pola `zrodlo`:

```markdown
---
tytul: "<tytul>"
data: <RRRR-MM-DD>
lead: <streszczenie>
zrodlo:
  nazwa: <nazwa serwisu, np. Bankier.pl>
  url: <pelny adres artykulu>
---

<tresc bez zdania odsylajacego do zrodla — blok zrodla renderuje sie osobno>
```

Zasady konwersji HTML → markdown:
- `<h2>`, `<h3>` → `##`, `###` (nigdy `#` — h1 to tytuł strony)
- `<p>` → akapit oddzielony pustą linią
- `<strong>` → `**tekst**`, `<em>` → `*tekst*`
- `<blockquote>` i cytaty wypowiedzi → `>`
- `<a href>` → `[tekst](adres)`
- `&nbsp;`, `&oacute;`, `&#243;` i inne encje → prawdziwe znaki UTF-8
- usuń wszystkie atrybuty `style`, `class` i puste `<p></p>`

- [ ] **Step 4: Zbuduj i sprawdź liczby**

```bash
node build.js
```

Expected: liczby w logu zgadzają się z liczbą plików. Build nie może się wywalić na kontroli językowej ani na walidacji frontmattera.

- [ ] **Step 5: Wygeneruj key visuale dla nowych artykułów**

```bash
node tools/kv-generate.js
npx --yes sharp-cli --input "assets/img/kv/*.svg" --output assets/img/kv --format webp --quality 82
node build.js
```

- [ ] **Step 6: Sprawdź kompletność mapy przekierowań**

```bash
wc -l dist/redirects/mapa.csv
```

Expected: liczba wierszy = liczba artykułów + 5 adresów stałych + 1 nagłówek.

- [ ] **Step 7: Przejrzyj losowe artykuły w przeglądarce**

```bash
npx http-server dist -p 8000 -c-1
```

Otwórz 5 losowych artykułów. Sprawdź: polskie znaki, śródtytuły, cytaty, linki zewnętrzne otwierają się w nowej karcie, artykuły z kategorii Media mają blok źródła nad treścią.

- [ ] **Step 8: Commit**

```bash
git add src/posts assets/img/kv && git commit -m "content: migracja artykulow z Joomli

Slugi zachowane 1:1 — mapa przekierowan opiera sie na nich.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 22: Migracja stron O nas i Kontakt

Treść przenoszona 1:1 (decyzja D7). Kalendarium kończy się na 2021 i liczby są nieaktualne — to świadoma decyzja, aktualizacja w kolejnym etapie.

**Files:**
- Modify: `src/pages/o-nas.md`
- Modify: `src/pages/kontakt.md`

- [ ] **Step 1: Przepisz `o-nas.md`**

Zachowaj strukturę oryginału: opis platformy, korzyści dla kupujących, usługi dla sprzedawców, kategorie, kalendarium. Listy jako `-`, sekcje jako `##`.

- [ ] **Step 2: Przepisz `kontakt.md`**

```markdown
---
tytul: Kontakt
lead: Zapraszamy do kontaktu.
---

## Kontakt dla mediów

Aleksandra Grądzka
[media@erli.pl](mailto:media@erli.pl)

## Kontakt dla kupujących

[pomoc@erli.pl](mailto:pomoc@erli.pl)
```

Adresy jako zwykłe `mailto:`. Stara strona obfuskowała je JavaScriptem, więc dziennikarz z wyłączonym JS nie widział ich wcale.

- [ ] **Step 3: Zbuduj i sprawdź**

```bash
node build.js && npx http-server dist -p 8000 -c-1
```

Otwórz `/o-nas/` i `/kontakt/`. Sprawdź polskie znaki i czy adresy e-mail da się kliknąć i skopiować.

- [ ] **Step 4: Commit**

```bash
git add src/pages && git commit -m "content: strony O nas i Kontakt

Tresc 1:1 z obecnej strony (D7). Kontakt prasowy: Aleksandra Gradzka.
Adresy mailto bez obfuskacji JS.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 23: Weryfikacja końcowa i paczka dla IT

**Files:**
- Create: `README.md` (zastąpienie treści dotyczącej erli.de)
- Create: `dist/` (paczka wynikowa)

- [ ] **Step 1: Czysty build od zera**

```bash
rm -rf dist node_modules && npm install && npm test && node build.js
```

Expected: wszystkie testy przechodzą, build się kończy, kontrola językowa zgłasza OK.

- [ ] **Step 2: Sprawdź, że w wyniku nie ma niemieckiego ani śladów erli.de**

```bash
grep -rniE "[äöüßÄÖÜ]|erli\.de|Marktplatz|Deutschland|ueber-uns|impressum|datenschutz" dist/ --include="*.html" --include="*.xml" --include="*.txt"
```

Expected: brak wyników.

- [ ] **Step 3: Sprawdź, że nie ma odwołań do usuniętych plików**

```bash
grep -rnoE 'src="[^"]+"|href="/assets[^"]+"' dist/*.html dist/*/index.html | grep -oE '/assets/[^"]+' | sort -u | while read p; do [ -f "dist$p" ] || echo "BRAK: $p"; done
```

Expected: brak wyników.

- [ ] **Step 4: Sprawdź `lang` i tytuły**

```bash
grep -L 'lang="pl"' $(find dist -name "*.html")
```

Expected: brak wyników — każda strona ma `lang="pl"`.

- [ ] **Step 5: Sprawdź rozmiar paczki**

```bash
du -sh dist && du -sh dist/assets/*
```

Expected: całość wyraźnie poniżej 10 MB.

- [ ] **Step 6: Napisz nowy `README.md`**

Zastąp w całości treść dotyczącą erli.de:

````markdown
# Biuro prasowe ERLI

Statyczna strona biura prasowego ERLI — `biuroprasowe.erli.pl`.
Bez CMS-a. Posty to pliki markdown, stronę generuje `build.js`.

## Wymagania

Node 22 lub nowszy.

```bash
npm install
```

## Dodanie nowego komunikatu

1. Utwórz plik w `src/posts/aktualnosci/` (albo `src/posts/media/` dla
   publikacji w mediach zewnętrznych). Nazwa: `RRRR-MM-DD-slug-artykulu.md`.

```markdown
---
tytul: "Tytuł komunikatu"
data: 2026-08-15
lead: Jedno–dwa zdania streszczenia. Widoczne na karcie i w wynikach wyszukiwania.
---

Treść w markdownie. Śródtytuły przez `##`, cytaty przez `>`.
```

   Dla kategorii Media o ERLI dodaj pole `zrodlo`:

```markdown
zrodlo:
  nazwa: Bankier.pl
  url: https://www.bankier.pl/wiadomosc/...
```

2. Wygeneruj grafikę wyróżniającą:

```bash
node tools/kv-generate.js
npx --yes sharp-cli --input "assets/img/kv/*.svg" --output assets/img/kv --format webp --quality 82
```

   Aby użyć własnej grafiki zamiast wygenerowanej: wgraj plik
   `assets/img/kv/<nazwa>.webp` (1200×630) i dopisz `grafika: <nazwa>`
   do frontmattera.

3. Zbuduj:

```bash
node build.js
```

Wynik ląduje w `dist/`. To zawartość tego katalogu wgrywa się na serwer.

## Budowanie i testy

```bash
npm run build   # generuje dist/
npm test        # testy modułów budujących
```

Build przerywa się błędem, jeśli w wygenerowanym HTML-u znajdzie język
niemiecki — pozostałość po poprzednim przeznaczeniu tego repozytorium.
Sprawdzana jest też treść atrybutów `aria-label`, `alt` i `title`.

## Wdrożenie

Zawartość `dist/` (bez katalogu `redirects/`) trafia do katalogu głównego
serwera.

**Katalog `dist/redirects/` to nie pliki strony.** Zawiera mapę przekierowań
301 ze starych adresów Joomli w trzech formatach — `.htaccess` (Apache),
`nginx.conf`, `mapa.csv` (panel hostingu). Muszą zostać wdrożone razem
z podmianą strony. Bez nich każdy link do biura prasowego z artykułów
w mediach prowadzi na 404, a strona traci pozycje w wyszukiwarce.

Po wdrożeniu: zgłosić `sitemap.xml` w Google Search Console.

## Struktura

```
src/posts/       komunikaty (markdown)
src/pages/       O nas, Kontakt
src/templates/   szablony stron
src/partials/    fragmenty wielokrotnego użytku
build/           moduły generatora + testy
tools/           generator grafik wyróżniających
assets/          CSS (źródła), fonty, obrazy
dist/            wynik budowania (nie w repozytorium)
```

`assets/css/main.css` jest generowany przez build ze źródeł
(`tokens`, `base`, `layout`, `components`, `press`). Nie edytuj go —
zmiany wprowadzaj w plikach źródłowych.

## Dokumentacja

- `docs/superpowers/specs/` — projekt techniczny
- `design-system/design.md` — tokeny i komponenty
````

- [ ] **Step 7: Sprawdź stronę na trzech szerokościach**

```bash
npx http-server dist -p 8000 -c-1
```

375 px, 768 px, 1280 px. Przejdź wszystkie typy stron. Nawigacja klawiaturą — Tab przechodzi w logicznej kolejności, focus zawsze widoczny, „Przejdź do treści" działa jako pierwszy element.

- [ ] **Step 8: Commit i tag**

```bash
git add README.md && git commit -m "docs: README biura prasowego

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git tag -a v1.0.0 -m "Biuro prasowe ERLI — wersja do wdrozenia"
```

- [ ] **Step 9: Przygotuj paczkę i przekaż informacje dla IT**

```bash
cd dist && tar -czf ../biuro-prasowe-v1.0.0.tar.gz . && cd ..
ls -lh biuro-prasowe-v1.0.0.tar.gz
```

Przekaż IT trzy informacje:

1. Zawartość paczki (bez katalogu `redirects/`) idzie do katalogu głównego `biuroprasowe.erli.pl`
2. **Przekierowania 301 z `redirects/` muszą zostać wdrożone razem z podmianą.** Bez nich każdy link do biura prasowego z artykułów w mediach prowadzi na 404, a pozycje w wyszukiwarce znikają
3. Po wdrożeniu zgłosić `sitemap.xml` w Google Search Console

---

## Kolejność wykonania

Zadania 1–20 nie zależą od eksportu z Joomli i można je wykonać od razu. Zadania 21–23 wymagają plików.

Po Task 17 strona jest już oglądalna w przeglądarce z jednym artykułem testowym — to dobry moment na pierwszą recenzję wyglądu, zanim powstaną style w Task 19.
