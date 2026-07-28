# Blokady przed wdrożeniem

Stan: 2026-07-28. Ustalone przy przeglądzie migracji treści (Zadanie 21).
Decyzja właściciela: **naprawiamy teraz**, potem praca idzie dalej.

**Aktualizacja 2026-07-28 (po naprawie): B1, B2, D1, D2, D3 zamknięte.**
Weryfikacja: `npm test` — 125/125, `node build.js` — 84 strony, 104
przekierowania, kontrola językowa OK, kontrola obrazków OK (nowa — patrz B1).
0 zepsutych odwołań do obrazków, 0 ścieżek >260 znaków w `dist/`, wszystkie
88 slugów z eksportu obecne w mapie przekierowań. D4 i D5 pozostają otwarte —
wymagają decyzji właściciela, nie zostały ruszone.

**Aktualizacja 2026-07-28 (trzecia — wszystko zamknięte): D4 i D5
zweryfikowane przeciw bazie (`tools/weryfikuj-migracje.mjs`) — migracja
niczego nie zgubiła, bez zmian w treści. D6 (waga obrazków) naprawione:
`/aktualnosci/` z 5147 KB na 890 KB. Rejestr nie ma już otwartych punktów.**

**Aktualizacja 2026-07-28 (przegląd wykrył regresję): naprawiona — patrz
„Regresja — 14 przekierowań na 404" niżej. Zadania 22 i 23 zamknięte.**
Weryfikacja końcowa: `npm test` — 133/133, `node build.js` — 84 strony, 104
przekierowania, wszystkie trzy kontrole (językowa, obrazki, przekierowania)
OK. 0 zepsutych odwołań do obrazków, 0 zepsutych celów przekierowań,
0 ścieżek >260 znaków w `dist/`, wszystkie 88 slugów z eksportu w mapie.
Paczka `dist/` (bez `redirects/`) waży ~16,1 MB nieskompresowane, ~14,9 MB
jako `biuro-prasowe-v1.0.0.tar.gz` — powyżej orientacyjnych <10 MB z planu,
bo ten szacunek powstał przed naprawą B1 (prawdziwe zdjęcia jako grafika
karty w 77 artykułach). Lokalny tag `v1.0.0` utworzony, niewypchnięty.

**`dist/` gotowy do przekazania IT. Push na `origin` wstrzymany — decyzja
właściciela.**

---

## Regresja — 14 przekierowań na 404 — ✅ NAPRAWIONE

Wykryta przy przeglądzie po zamknięciu B1/B2/D1/D2/D3. Naprawa B2 (skracanie
slugów >80 znaków w `post.url`, funkcja `skrocSlug` w `build/posts.js`)
objęła 24 z 77 artykułów, ale `src/duplikaty.json` trzymał cele przekierowań
zapisane na sztywno, z pełnym (nieskróconym) slugiem. Trzy cele przestały
istnieć, dając 14 zepsutych wpisów w mapie:

- 8× `/aktualnosci/platforma-e-commerce-erli-z-rekordowymi-wynikami-za-pierwsze-polrocze-2025-2-2-2-2/`
- 4× `/aktualnosci/erli-wprowadzil-pierwsza-w-polskim-e-commerce-usluge-gwarancji-darmowego-zwrotu-2-2/`
- 2× `/aktualnosci/erli-swietuje-ponad-2-miliony-pobran-aplikacji-mobilnej-polski-m-commerce-rosnie-w-sile-2/`

**Naprawa.** Zmieniony format `src/duplikaty.json`: zamiast sztywnego URL-a
docelowego, każdy wpis wskazuje artykuł kanoniczny przez `{kategoria, slug}`
(Joomlowy slug, nietknięty). `buildRedirectMap()` w `build/redirects.js`
szuka tego artykułu w zbiorze postów i czyta jego `post.url` — ten sam,
który wyznaczył `skrocSlug()` w `loadPosts()`. Rzuca czytelnym błędem, gdy
duplikat wskazuje artykuł, którego nie ma, zamiast po cichu wygenerować zły
adres. Dzięki temu kolejna zmiana reguły skracania nie może już rozjechać
mapy przekierowań z rzeczywistymi adresami stron.

Dodatkowo nowa kontrola `build/redirect-guard.js` (na wzór
`build/image-guard.js`) przerywa build, jeśli którykolwiek cel w mapie
przekierowań nie ma odpowiadającego pliku w `dist/` — wpięta w `build.js`
zaraz po zbudowaniu mapy. Ta klasa błędu nie powinna już wrócić niezauważona.
Testy w `build/redirects.test.js` i `build/redirect-guard.test.js`.

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

## D4 — artykuły poniżej 400 znaków treści — ✅ ZWERYFIKOWANE, BEZ ZMIAN

Wzmianki prasowe z 2021–2022 (`erli-rzuca-wyzwanie-allegro`,
`erli-pl-rzuca-wyzwanie-gigantom`). Podejrzenie: czy krótkie w źródle,
czy migracja zgubiła treść.

**Wynik.** `tools/weryfikuj-migracje.mjs` porównał pełną treść pliku
(lead + body) z tekstem w bazie. Osiem artykułów poniżej 500 znaków,
**każdy o proporcji dokładnie 1,00** względem źródła — plik zawiera tyle
samo tekstu, co baza. Zero przypadków poniżej progu 0,8. To autentycznie
krótkie wzmianki prasowe, nie ubytek migracji. Nic do naprawy.

---

## D5 — zmiany autonomiczne sesji migracyjnej — ✅ ZWERYFIKOWANE, BEZ ZMIAN

Wykonane bez osobnego commita, wewnątrz commita `0e56474`:

- 32 artykuły z automatycznie usuniętym zdublowanym leadem
- poprawiona literówka w treści artykułu z 2023 roku

**Wynik.** `tools/weryfikuj-migracje.mjs` sprawdził, czy słownictwo z bazy
jest w całości obecne w plikach — próg 3% unikalnych słów. **Zero artykułów
powyżej progu.** Automatyczne usuwanie leadu niczego nie zgubiło.

Metodyczna uwaga: pierwsza wersja kontroli porównywała zdania i dawała
11 fałszywych alarmów — fragment przechodzący przez granicę struktury
markdowna („…spacerowy.\*\*\* ERLI.pl to…") nie występuje w pliku w tej
postaci, choć wszystkie jego słowa tam są. Porównanie słowo w słowo
usuwa ten artefakt.

---

## D6 — waga obrazków — ✅ NAPRAWIONE

Zdjęcia pobrane z CDN starej Joomli miały do 1440 px szerokości i do 664 KB,
a wyświetlają się w kolumnie 460 px (karta) albo 800 px (artykuł).

**Zmierzone przed naprawą:** `/aktualnosci/` 5147 KB obrazków,
strona główna 1207 KB.

**Naprawa.** `tools/optymalizuj-obrazy.mjs` (zależność deweloperska `sharp`)
przeskalował 89 plików do maks. 1200 px przy jakości 74 i wygenerował
wariant 600 px obok każdego. Szablony podają oba przez `srcset` z `sizes`.
Kontrola `build/image-guard.js` rozszerzona na `srcset` — brakujący wariant
nie ujawniłby się w `src`, obrazek po prostu nie pojawiłby się na części
ekranów.

| | Przed | Po |
|---|---|---|
| Pliki na dysku | 13,3 MB | 3,9 MB (oba warianty) |
| Największy plik | 664 KB | 104 KB |
| `/aktualnosci/` | 5147 KB | **890 KB** |
| Strona główna | 1207 KB | **158 KB** |

---

## Stan pozostałych prac

| Zadanie | Stan |
|---|---|
| 21 — migracja artykułów | zrobione, blokady B1/B2/D1/D2/D3 zamknięte |
| 22 — strony O nas i Kontakt | ✅ zrobione — treść 1:1 z eksportu (D7), kontakt prasowy Aleksandra Grądzka |
| 23 — weryfikacja końcowa i paczka dla IT | ✅ zrobione — README zaktualizowany, `biuro-prasowe-v1.0.0.tar.gz` gotowy, tag lokalny |
| Nowy układ strony głównej | zaprojektowany, podgląd w `dist/podglad-uklad.html`, niewdrożony |

Otwarte pytanie do właściciela: token `--thumb-mobile` (88 px) dla miniatur
w kompaktowym widoku mobilnym — dopisać do `tokens.css`, użyć `--space-4xl`
(96 px) czy zrezygnować z miniatur. Bez odpowiedzi nowy układ nie wchodzi.

## Stan repozytorium

59 commitów na lokalnym `main`, niewypchniętych (było 55, +4 przy naprawie
regresji przekierowań i zamknięciu Zadań 22/23). Tag `v1.0.0` utworzony
lokalnie. Brak PR-a, brak code review. **Push nadal wstrzymany decyzją
właściciela** — zamknięcie blokad nie jest automatycznym zezwoleniem na
push, to osobna decyzja.
