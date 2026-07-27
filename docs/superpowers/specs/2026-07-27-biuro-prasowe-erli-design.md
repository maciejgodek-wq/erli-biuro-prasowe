# Biuro prasowe ERLI — projekt techniczny

Data: 2026-07-27
Status: zaakceptowany, gotowy do planu wdrożenia

## Cel

Zastąpić obecne biuro prasowe ERLI (Joomla 5 + szablon Gridbox, `biuroprasowe.erli.pl`)
statyczną stroną zbudowaną na design systemie ERLI. Bez CMS-a. Posty dodawane ręcznie
jako pliki markdown. Domena bez zmian.

Repozytorium `erli-biuro-prasowe` zawiera dziś zaślepkę SEO rynku niemieckiego
(`erli.de`). Zostaje z niej wyłącznie design system; treść i strony DE są usuwane.

## Zakres

W zakresie:

- migracja wszystkich ~35 artykułów z Joomli (kategorie: Aktualności, Media o ERLI)
- migracja stron O nas i Kontakt — treść 1:1, bez aktualizacji merytorycznej
- nowe kompozycje stron pod czytelnika-dziennikarza
- skrypt budujący markdown → statyczny HTML
- system grafik wyróżniających (key visuale) dla wszystkich artykułów
- mapa przekierowań 301 ze starych URL-i Joomli
- paczka `dist/` do ręcznego wgrania przez IT

Poza zakresem:

- press kit, sekcja „ERLI w liczbach", formularz kontaktowy, wersja angielska
- CMS, panel administracyjny, backend
- analityka i baner cookie (patrz Decyzja D6)
- konfiguracja serwera, DNS, SSL, wdrożenie przekierowań — po stronie IT

## Stan zastany

### Obecna strona

Joomla 5, szablon Gridbox 2.9.0. Cztery pozycje menu: Aktualności, Media o ERLI,
O nas, Kontakt. URL-e w formacie `/index.php/<kategoria>/<slug>`.

Około 35 artykułów z okresu 2023 – listopad 2025, w dwóch kategoriach:

- **Aktualności** (~20) — własne komunikaty prasowe, pełna treść, cytaty zarządu
- **Media o ERLI** (~20) — streszczenie publikacji zewnętrznej z linkiem do źródła
  (Bankier.pl i in.) wplecionym w treść akapitu

Artykuły są czysto tekstowe: zero zdjęć, zero załączników, zero plików do pobrania.

Kontakt: `pomoc@erli.pl` (kupujący), `media@erli.pl` — Maciej Nowicki (media).
Adresy obfuskowane JavaScriptem. Brak adresu, telefonu i danych rejestrowych.

Elementy do usunięcia przy migracji:

- liczniki komentarzy i recenzji Joomli (zawsze puste)
- chmura 15 tagów, nieklikalna i bez funkcji
- przyciski udostępniania z licznikami LinkedIn (`linkedin.com/countserv`) — API
  wyłączone przez LinkedIn w 2021, licznik zawsze pokazuje 0, a każde wejście
  wysyła adres artykułu do LinkedIna (4 wywołania na stronę)
- Cookiebot z pustym identyfikatorem (`00000000-0000-0000-0000-000000000000`) —
  baner nie działa, niczego nie blokuje i niczego nie zapisuje

Analityka: brak. Nie ma GTM, GA4, Piksela Facebooka ani Hotjara. Obiekt `dataLayer`
istnieje, ale jest pusty — to artefakt szablonu.

### Repozytorium

Statyczny HTML + CSS + vanilla JS, bez systemu budowania. 7 stron DE. Dojrzały
design system: `tokens.css` (366 linii), `components.css` (74 KB), fonty
Montserrat i Roboto Flex hostowane lokalnie.

Dług techniczny do usunięcia przy okazji:

- `main.css` (96 KB) to ręcznie sklejony konkatenat czterech plików źródłowych
  i już się rozjechał (93 958 bajtów w źródłach vs 96 256 w sklejce) — ktoś
  edytował wynik zamiast wejścia
- `_worker.js` zawiera hasło w plaintekście, zacommitowane do repozytorium
- `GTM-XXXXXXX` (placeholder) występuje 14 razy i generuje 404 przy każdym wejściu
- trzy pliki favicon są linkowane w każdym `<head>`, ale nie istnieją
- `carousel.js` i ~150 linii CSS-a karuzeli to martwy kod — zero użyć w HTML
- kit formularzy w CSS oraz systemy `.cat-tile*`, `.cat-card*`, `.kontakt-*`,
  `.page-hero*` — martwe
- header, stopka i karta CTA skopiowane 7×; `marquee.js` ma drugą, inline'ową
  kopię w `ueber-uns.html`
- burger menu pojawia się dopiero poniżej 480 px, więc w zakresie 481–768 px
  nawigacja się rozjeżdża
- brak `aria-current` — aktywna pozycja menu nie jest oznaczona

## Decyzje

| # | Decyzja | Uzasadnienie |
|---|---|---|
| D1 | Przebudowa w miejscu, agresywne sprzątanie | Repozytorium ma już docelową nazwę; design system to jedyne, co warto zachować |
| D2 | Markdown + własny skrypt Node.js | Wygodne pisanie, pełna kontrola, jedna zależność zamiast kilkuset |
| D3 | Katalogi z `index.html` | Czyste URL-e bez `.html`, działa na dowolnym hostingu bez konfiguracji |
| D4 | Aktualności i Media o ERLI jako osobne strony | Zachowuje przyzwyczajenia użytkowników obecnej strony |
| D5 | Grafika wyróżniająca dla każdego artykułu | Generowana z key visuali ERLI; jednocześnie służy jako `og:image` |
| D6 | Zero skryptów zewnętrznych na starcie | Brak analityki do migracji; brak ciasteczek = brak obowiązku zgody |
| D7 | Treść stron O nas i Kontakt 1:1 | Świadoma decyzja — kalendarium kończy się na 2021, liczby są nieaktualne |
| D8 | Bez paginacji, z kodem uśpionym | ~20 pozycji na kategorię; próg 30 wbudowany w build od początku |

## Architektura

### Struktura repozytorium

```
src/
  posts/
    aktualnosci/2025-11-18-erli-rekordowy-wzrost-gmv.md
    media/2025-03-05-rekordowy-rok-dla-erli.md
  pages/
    o-nas.md
    kontakt.md
  templates/
    base.html      szkielet: <head>, header, main, footer
    home.html      strona główna
    list.html      lista kategorii
    post.html      artykuł
    page.html      strona statyczna
  partials/
    header.html  footer.html  post-card.html  contact-block.html
assets/
  css/    tokens.css base.css layout.css components.css   (źródła)
  fonts/  4 pliki woff2
  img/    logo, favicon, key visuale, materiał źródłowy
build.js
dist/     wynik budowania — to trafia na serwer
```

### Struktura wyjściowa

```
dist/
  index.html                        → /
  aktualnosci/index.html            → /aktualnosci/
  aktualnosci/<slug>/index.html     → /aktualnosci/<slug>/
  media-o-erli/index.html
  media-o-erli/<slug>/index.html
  o-nas/index.html
  kontakt/index.html
  404.html
  sitemap.xml  robots.txt
  assets/
  redirects/    .htaccess, nginx.conf, mapa.csv  (dla IT, nie do wgrania)
```

### build.js

Node 24, jedna zależność: `marked` (sama bez zależności).

Odpowiedzialności:

1. czyta pliki `.md`, parsuje frontmatter i treść
2. renderuje przez szablony do HTML
3. skleja CSS ze źródeł do `main.css` — koniec ręcznego konkatenatu
4. generuje `sitemap.xml`, `robots.txt` i trzy warianty mapy przekierowań
5. kopiuje assety

Uruchomienie: `node build.js`. Build jest idempotentny — czyści `dist/` przed
generowaniem. Nie generuje grafik (patrz „Grafiki").

### Format posta

```markdown
---
tytul: Nowa era handlu online: AI od ERLI dla sprzedawców
data: 2025-11-03
kategoria: aktualnosci
lead: Platforma e-commerce ERLI stale pracuje nad innowacyjnymi rozwiązaniami…
grafika: ai-dla-sprzedawcow
zrodlo:                       # wyłącznie dla kategorii media
  nazwa: Bankier.pl
  url: https://www.bankier.pl/...
---

Treść w markdownie. Cytaty przez `>`, śródtytuły przez `##`.
```

Slug pochodzi z nazwy pliku, po odcięciu prefiksu daty. Data z nazwy pliku steruje
sortowaniem; pole `data` we frontmatterze jest źródłem prawdy dla wyświetlania.
Pole `grafika` jest opcjonalne. Wszystkie migrowane artykuły dostają grafikę
wygenerowaną (D5); pominięcie pola w nowym poście uruchamia fallback typograficzny,
żeby brak assetu nigdy nie blokował publikacji.

Dodanie nowego posta: jeden plik `.md` + `node build.js`.

## Układ stron

### Strona główna

Hero: nagłówek „Biuro prasowe ERLI" z żółtym podkreśleniem na słowie kluczowym
(komponent `.text-highlight--box`), jedno zdanie wprowadzenia. Bez zdjęcia osoby,
bez przycisku zakupowego.

Dalej: 6 najnowszych artykułów z obu kategorii → blok „ERLI w skrócie"
(4 kafle `.trust-card`, treść zaczerpnięta z O nas) → blok kontaktu prasowego.

### Listy kategorii

Nagłówek sekcji + pełna lista chronologiczna, **grupowana nagłówkami lat**
(`2025`, `2024`, `2023`). Grupowanie pełni funkcję nawigacyjną: dziennikarz
szukający wyników za konkretny rok od razu widzi, gdzie patrzeć.

Paginacja: nieaktywna. `build.js` zawiera próg 30 pozycji — po przekroczeniu
zaczyna generować `/aktualnosci/2/` i kolejne, z `rel="canonical"` i linkami
nawigacyjnymi. Przełączenie następuje automatycznie, bez zmian w kodzie.

### Karta artykułu

Grafika 1200×630 → etykieta kategorii i data → tytuł (h3) → lead ucięty do
dwóch linii → cała karta klikalna.

Grafiki kart mają `loading="lazy"` oraz jawne `width` i `height`. Przeglądarka
pobiera tylko widoczne karty, a układ nie skacze przy doczytywaniu. Dzięki temu
lista 60 pozycji kosztuje tyle samo transferu co lista 6.

### Artykuł

Kolumna czytelnicza ~680 px (`.prose`). Grafika, meta (data + kategoria), h1,
wyróżniony lead, treść.

Pod treścią: przyciski udostępniania (LinkedIn, X, Facebook, kopiuj link) —
**bez liczników**, jako zwykłe linki, bez skryptów zewnętrznych. Następnie
3 powiązane artykuły i blok kontaktu prasowego.

Artykuły z kategorii Media o ERLI dostają nad treścią wyróżniony blok
„Materiał opublikowany w <nazwa>" z linkiem do źródła. Obecnie ten link jest
zaszyty w środku akapitu i łatwo go przeoczyć.

### O nas i Kontakt

O nas — treść 1:1 z obecnej strony, w `.prose` z `.check-list` i kalendarium.

Kontakt — dwa bloki: media (Maciej Nowicki, `media@erli.pl`) i kupujący
(`pomoc@erli.pl`). Bez formularza. Adresy jako zwykłe `mailto:`, bez obfuskacji
JavaScriptem — dziennikarz ma móc skopiować adres, także z wyłączonym JS.

### Nawigacja

Aktualności · Media o ERLI · O nas · Kontakt.

Aktywna pozycja oznaczona `aria-current="page"`. Próg burgera przesunięty z 480 px
na 768 px — naprawia rozjazd nawigacji na tabletach.

## Grafiki

System deterministyczny: hash sluga wybiera jeden z trzech wariantów tła
(turkusowy gradient, żółty, ciemny granat). Na tle logo ERLI, etykieta kategorii
i skrócony tytuł w Montserrat.

Format 1200×630 — ta sama grafika służy jako obraz karty i jako `og:image`, więc
każdy artykuł ma poprawny podgląd przy udostępnianiu. Obecna strona nie ma żadnego.

Grafiki powstają raz, jako SVG konwertowane do WebP, i trafiają do repozytorium.
`build.js` ich nie regeneruje. Podmiana na materiał od Marketingu = podmiana pliku.

## SEO i przekierowania

Slugi zachowane identycznie jak w Joomli, więc mapowanie jest mechaniczne:

```
/index.php/aktualnosci/<slug>   →  /aktualnosci/<slug>/
/index.php/media-o-erli/<slug>  →  /media-o-erli/<slug>/
```

Bez tych przekierowań tracimy pozycje w wyszukiwarce i wszystkie linki
prowadzące do biura prasowego z artykułów w mediach.

Mapa generowana w trzech formatach — `.htaccess`, konfiguracja nginx, CSV —
do wyboru przez IT.

Pozostałe elementy: `sitemap.xml` ze wszystkimi URL-ami, `robots.txt`, `canonical`
na każdej stronie, Open Graph i Twitter Card, JSON-LD `NewsArticle` na artykułach
i `Organization` globalnie. Wszystko po polsku, `lang="pl"`.

## Co zostaje, co jest usuwane

Zostaje (~1,1 MB): `tokens.css`, `base.css`, `layout.css`, `components.css`
(po przycięciu), 4 fonty woff2, `erli-logo.svg`, `favicon.svg`,
`apple-touch-icon.png`, `circle.svg`, `nav.js`, `header-scroll.js`,
`design-system/design.md`, `_headers`.

Zostaje warunkowo: `cat-*.webp` (13 plików), `hero-person.webp`,
`cta-person.webp`, `was-ist-erli.webp` — materiał źródłowy do key visuali
i ewentualnych późniejszych zastosowań.

Usuwane (~33 MB): 7 stron DE, `_worker.js`, `TODO.md`, 13 plików `cat-*.png`
(2–3,5 MB każdy — istnieją wersje WebP), `hero-person.png` (4 MB),
`cta-person.png` (2 MB), `og-image.png`, `carousel.js` wraz z CSS-em,
kit formularzy w CSS, martwe systemy `.cat-tile*` / `.cat-card*` / `.kontakt-*` /
`.page-hero*`, JSON-LD w języku niemieckim, Consent Mode, snippety GTM,
linki do nieistniejących faviconów, `sitemap.xml` i `robots.txt` rynku DE.

## Ryzyka

| Ryzyko | Wpływ | Postępowanie |
|---|---|---|
| Przekierowania nie zostaną wdrożone przez IT | Utrata pozycji SEO i wszystkich linków z mediów | Mapa dostarczona w trzech formatach; wyraźnie zakomunikowana jako warunek uruchomienia |
| Hasło z `_worker.js` pozostaje w historii gita | Ekspozycja poświadczeń | Zgłoszone użytkownikowi; hasło do zmiany, jeśli było używane gdziekolwiek indziej |
| Nieaktualna treść O nas (kalendarium do 2021) | Wizerunek | Decyzja świadoma (D7); do aktualizacji w kolejnym etapie |
| Nieznane środowisko hostingowe | Strona może nie działać po wgraniu | Struktura katalogowa bez zależności od konfiguracji serwera (D3) |
| Pliki z Joomli mogą zawierać treści niewidoczne z zewnątrz | Niepełna migracja | Przegląd eksportu przed migracją treści |

## Zależności zewnętrzne

- eksport plików z Joomli (użytkownik) — potrzebny wyłącznie na etapie migracji treści
- wdrożenie przekierowań 301 i publikacja paczki `dist/` (IT)
