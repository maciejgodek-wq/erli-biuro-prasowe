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

Build przerywa się błędem w trzech sytuacjach:

- w wygenerowanym HTML-u znajdzie język niemiecki — pozostałość po
  poprzednim przeznaczeniu tego repozytorium. Sprawdzana jest też treść
  atrybutów `aria-label`, `alt` i `title`;
- jakikolwiek `src=`/`og:image`/`twitter:image` w wyniku nie ma
  odpowiadającego pliku na dysku;
- mapa przekierowań 301 wskazuje adres, pod którym w `dist/` nie ma
  wygenerowanej strony.

## Wdrożenie

### Cloudflare Pages (docelowo)

Projekt jest podpięty pod ten branch `main`. Każdy push uruchamia build:

| Ustawienie | Wartość |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Wersja Node | z pliku `.node-version` |

Build zapisuje do `dist/` dwa pliki, które Cloudflare czyta sam:

- `_redirects` — mapa przekierowań 301 ze starych adresów Joomli,
- `_headers` — nagłówki bezpieczeństwa i reguły cache'owania.

Na tym hostingu przekierowania jadą razem ze stroną, więc **nie wymagają
osobnego wdrożenia po stronie IT**.

### Inny hosting

Zawartość `dist/` (bez katalogu `redirects/`) trafia do katalogu głównego
serwera.

**Katalog `dist/redirects/` to nie pliki strony.** Zawiera tę samą mapę 301
w trzech formatach — `.htaccess` (Apache), `nginx.conf`, `mapa.csv` (panel
hostingu). Muszą zostać wdrożone razem z podmianą strony. Bez nich każdy link
do biura prasowego z artykułów w mediach prowadzi na 404, a strona traci
pozycje w wyszukiwarce.

Po wdrożeniu: zgłosić `sitemap.xml` w Google Search Console.

## Struktura

```
src/posts/       komunikaty (markdown)
src/pages/       O nas, Kontakt
src/templates/   szablony stron
src/partials/    fragmenty wielokrotnego użytku
build/           moduły generatora + testy
tools/           generator grafik wyróżniających, optymalizacja obrazów
assets/          CSS (źródła), fonty, obrazy
dist/            wynik budowania (nie w repozytorium)
```

Skrypty jednorazowe migracji z Joomli zostały usunięte po zakończeniu
przenosin — są w historii repozytorium, gdyby kiedyś trzeba było do nich
wrócić (`git log --diff-filter=D -- tools/`).

`assets/css/main.css` jest generowany przez build ze źródeł
(`tokens`, `base`, `layout`, `components`). Nie edytuj go —
zmiany wprowadzaj w plikach źródłowych.

## Dokumentacja

- [`docs/jak-dodac-komunikat.md`](docs/jak-dodac-komunikat.md) — instrukcja dla
  redakcji, bez wymagań technicznych po stronie czytającego
- [`docs/wymagania-hostingowe.md`](docs/wymagania-hostingowe.md) — wymagania
  dla działu IT wraz z listą kontrolną do odbioru
- `docs/superpowers/specs/` — projekt techniczny i decyzje układu
- `design-system/design.md` — tokeny i komponenty
