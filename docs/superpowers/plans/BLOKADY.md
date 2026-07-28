# Blokady przed wdrożeniem

Stan: 2026-07-28. Ustalone przy przeglądzie migracji treści (Zadanie 21).
Decyzja właściciela: **naprawiamy teraz**, potem praca idzie dalej.

**Aktualizacja 2026-07-28 (po naprawie): B1, B2, D1, D2, D3 zamknięte.**
Weryfikacja: `npm test` — 125/125, `node build.js` — 84 strony, 104
przekierowania, kontrola językowa OK, kontrola obrazków OK (nowa — patrz B1).
0 zepsutych odwołań do obrazków, 0 ścieżek >260 znaków w `dist/`, wszystkie
88 slugów z eksportu obecne w mapie przekierowań. D4 i D5 pozostają otwarte —
wymagają decyzji właściciela, nie zostały ruszone.

**`dist/` gotowy do przekazania IT pod względem B1/B2. Push na `origin`
wstrzymany — decyzja właściciela.**

---

## B1 — 314 zepsutych odwołań do obrazków — BLOKUJE WDROŻENIE — ✅ NAPRAWIONE

**Naprawa:** `grafikaUrl()` w `build/render.js` rozróżnia teraz pełną ścieżkę
(zaczyna się od `/`) od nazwy pliku w `assets/img/kv/` — prawdziwe zdjęcie ma
priorytet, key visual zostaje jako fallback. Skrypt `tools/dopisz-grafike-karty.mjs`
dopisał pole `grafika:` wskazujące pierwszy obraz z treści (hero) do wszystkich
77 plików. Nowa kontrola `build/image-guard.js` (analogiczna do kontroli
językowej) przerywa build, jeśli jakikolwiek `src=`/`og:image`/`twitter:image`
w `dist/` nie ma pliku na dysku — wpięta w `build.js` po skopiowaniu assetów.
Zweryfikowana ręcznie: chwilowe usunięcie jednego pliku wywołało błąd builda.

Każda karta artykułu, każdy nagłówek artykułu i każdy `og:image` prowadzi na 404.

**Przyczyna.** Pole `grafika:` jest puste we wszystkich 77 plikach markdown.
`grafikaUrl()` w `build/render.js` stosuje wtedy fallback:

```js
return `/assets/img/kv/${post.grafika ?? post.slug}.webp`;
```

W `assets/img/kv/` są 4 pliki (`default` + pozostałość po poście testowym).
Generator key visuali (`tools/kv-generate.js`) nigdy nie został uruchomiony
dla zmigrowanych artykułów.

Zdjęcia są pobrane — 80 katalogów w `assets/img/artykuly/<slug>/` — ale
wpisane wyłącznie do treści markdowna, nie do pola karty.

**Skutek.** W treści artykułu zdjęcia działają. Listy pokazują szare
prostokąty. Udostępnienie na LinkedIn/Facebook daje pusty podgląd — czyli
znika jedna z korzyści, dla których ten projekt powstał.

**Naprawa.** Wskazać pobrane `intro_image` jako grafikę karty:

1. `grafikaUrl()` musi przyjmować pełną ścieżkę, nie tylko nazwę w `kv/`.
   Rozróżnienie: wartość zaczynająca się od `/` to ścieżka, pozostałe to
   nazwa pliku w `assets/img/kv/`.
2. Skryptem (nie ręcznie) dopisać `grafika:` do 77 plików, wskazując pierwszy
   obraz z `assets/img/artykuly/<slug>/`.
3. Dla artykułów bez zdjęcia — wygenerować key visual jako fallback.
4. Kontrola: skrypt sprawdzający, że każde `src=` i `og:image` w `dist/`
   ma plik na dysku. Docelowo dopisać do `build.js` obok kontroli językowej,
   żeby build przerywał się przy brakującym obrazku.

Prawdziwe zdjęcia mają priorytet nad generowanymi — key visuale zostają
wyłącznie jako zabezpieczenie.

---

## B2 — dwie ścieżki przekraczają limit 260 znaków Windows — RYZYKO WDROŻENIA — ✅ NAPRAWIONE

| Znaków | Slug |
|---|---|
| 335 | `erli-jako-pierwsze-w-regionie-emea-przeprowadzilo-innowacyjne-badanie-meta-conversion-lift-wzbogacone-o-metodologie-channel-lift-do-celow-sprzedazowych-celem-jeszcze-skuteczniejsza-ocena-potencjalu-wykorzystywanych-kanalow-reklamowych` |
| 267 | `kolejny-przelomowy-rok-erli-platforma-rozwija-sie-6-razy-szybciej-niz-rynek-i-osiaga-czolowa-pozycje-na-polskim-rynku-wsrod-marketplace-ow-w-zaledwie-3-lata-od-startu` |

Node obsługuje długie ścieżki — obie strony serwują się lokalnie z kodem 200.
Ale `Get-Content` w PowerShellu nie potrafi otworzyć tych plików, a paczkę
`dist/` wdraża IT, prawdopodobnie narzędziami Windows albo przez FTP. Ryzyko
cichej utraty dwóch stron przy wdrożeniu.

**Naprawa.** Nowa funkcja `skrocSlug(slug, maks=80)` w `build/posts.js`
(deterministyczna, testy w `build/posts.test.js`) tnie na granicy wyrazu.
Użyta w `loadPosts()` do budowy `post.url` — **wszystkie** slugi >80 znaków
skrócone w wyjściu (nie tylko te dwa), oryginalny slug z Joomli zostaje bez
zmian jako klucz w mapie przekierowań (`post.slug`, niezależne pole).
Zweryfikowane: 0 ścieżek >260 znaków w `dist/`, obie strony nadal osiągalne
przez 301 ze starego adresu.

---

## D1 — dwa artykuły z leadem dublującym pierwszy akapit — ✅ NAPRAWIONE

Automatyczne usuwanie zdublowanego leadu (32 artykuły) pominęło dwa:

- `swiateczne-rekordy-erli-dynamiczny-wzrost-sprzedazy-i-popularnosc-aplikacji-mobilnej`
- `erli-jako-pierwsze-w-regionie-emea-przeprowadzilo-innowacyjne-badanie-meta-conversion-lift…`

Lead wyświetla się nad treścią, więc czytelnik widzi ten sam akapit dwa razy.

**Naprawa.** Oba przypadki ominęła automatyka celowo — akapit zaczynał się
od tekstu leadu, ale miał dodatkowe, unikalne zdanie na końcu (funkcja
`prawieRowne()` z Zadania 21 słusznie odrzuciła usunięcie całego akapitu,
żeby nie zgubić tego zdania). `tools/napraw-czesciowo-zdublowany-lead.mjs`
usuwa tylko część akapitu pokrywającą się z leadem, zachowując zdanie
dodatkowe. Zweryfikowane ręcznie w obu plikach.

---

## D2 — jeden artykuł „Media o ERLI" bez pola `zrodlo` — ✅ NAPRAWIONE

1 z 37. Bez tego pola nie renderuje się blok „Materiał opublikowany w…",
a link do publikacji zewnętrznej zostaje zagrzebany w akapicie — czyli
wraca problem, który mieliśmy naprawić.

**Przyczyna.** `znajdzZrodlo()` szuka linku w formacie markdown
`[tekst](url)` — w tym jednym artykule redaktor wkleił adres jako zwykły
tekst, bez `<a href>`, potwierdzone w `erlipl_db.sql`. To literówka w
źródle, nie błąd ekstraktora. **Naprawa.** `tools/dopisz-zrodlo-d2.mjs`
dopisał `zrodlo: {nazwa: wyborcza.biz, url: ...}`. Zweryfikowane w
wygenerowanym HTML — blok „Materiał opublikowany w wyborcza.biz" renderuje
się poprawnie.

---

## D3 — pięć katalogów zdjęć z nazwami niezgodnymi ze slugiem — ✅ NAPRAWIONE

Nazwy obcięte, prawdopodobnie obejście limitu ścieżki z B2:

- `czlowiek-ktory-chce-zlamac-potege-allegro-byl-taki-moment-ze-kazdego-miesiaca-tracilis`
- `czlowiek-ktory-sciga-sie-z-allegro-chcemy-by`
- `erli-jako-pierwsze-…-channel-lif`
- `kolejny-przelomowy-rok-erli`
- `premiera-aplikacji-erli-…`

Działa, bo markdown wskazuje obciętą ścieżkę. Ale reguła jest doraźna
i nieudokumentowana — przy B1 trzeba ją ujednolicić, inaczej skrypt
dopisujący `grafika:` nie znajdzie katalogu dla tych pięciu.

**Naprawa.** `tools/ujednolic-katalogi-zdjec.mjs` przemianował katalogi na
`skrocSlug(slug, 80)` — ta sama funkcja co w B2, jedna udokumentowana reguła
zamiast doraźnego ucinania (objęło 25 katalogów, nie tylko te pięć — wiele
slugów przekracza 80 znaków). Dodatkowo `tools/ujednolic-nazwy-hero.mjs`
ujednolicił nazwy samych plików zdjęć hero do stałego `hero.webp` — jeden
oryginalny plik miał ~110-znakową nazwę przypominającą base64, która sama
w sobie przekraczała limit ścieżki niezależnie od długości slugu.

---

## D4 — dziesięć artykułów poniżej 400 znaków treści

Wzmianki prasowe z 2021–2022 (`erli-rzuca-wyzwanie-allegro` — 128 znaków,
`erli-pl-rzuca-wyzwanie-gigantom` — 180). Prawdopodobnie tak wyglądają
w źródle, ale nikt tego nie potwierdził przeciw bazie.

---

## D5 — niezweryfikowane zmiany autonomiczne

Wykonane przez sesję migracyjną bez osobnego commita — wszystko wewnątrz
commita `0e56474`:

- 32 artykuły z automatycznie usuniętym zdublowanym leadem
- poprawiona literówka w treści artykułu z 2023 roku

Przegląd wymaga diffa przeciw `old_reference/BAZA/erlipl_db.sql`. Wykryto
dwa przypadki nieudanego dedupu (D1); pozostałe 30 i zmiana treści nie były
weryfikowane.

---

## Stan pozostałych prac

| Zadanie | Stan |
|---|---|
| 21 — migracja artykułów | zrobione, blokady B1/B2/D1/D2/D3 zamknięte |
| 22 — strony O nas i Kontakt | **w toku** |
| 23 — weryfikacja końcowa i paczka dla IT | odblokowane — B1 i B2 zamknięte, można wznowić |
| Nowy układ strony głównej | zaprojektowany, podgląd w `dist/podglad-uklad.html`, niewdrożony |

Otwarte pytanie do właściciela: token `--thumb-mobile` (88 px) dla miniatur
w kompaktowym widoku mobilnym — dopisać do `tokens.css`, użyć `--space-4xl`
(96 px) czy zrezygnować z miniatur. Bez odpowiedzi nowy układ nie wchodzi.

## Stan repozytorium

55 commitów na lokalnym `main`, niewypchniętych (było 38, +17 przy naprawie
blokad B1/B2/D1/D2/D3). Brak PR-a, brak code review. **Push nadal wstrzymany
decyzją właściciela** — zamknięcie B1/B2 nie jest automatycznym zezwoleniem
na push, to osobna decyzja.
