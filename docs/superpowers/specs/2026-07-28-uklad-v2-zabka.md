# Układ v2 — przebudowa kompozycji wzorowana na biurze prasowym Żabki

Data: 2026-07-28
Status: zaakceptowany, gotowy do wdrożenia
Poprzedza: `2026-07-27-biuro-prasowe-erli-design.md` (architektura bez zmian)
Podgląd: `docs/podglad/uklad-v2.html` → `dist/podglad-v2.html`

## Powód zmiany

Pierwsza kompozycja (hero + siatka kafli 3×3) została odrzucona przez
właściciela: „nie skaluje się dobrze", „zdjęcia nie są w równych liniach",
„nagłówek biuro prasowe nie siedzi", „za wąska szpalta tekstu".

Referencja wybrana przez właściciela: <https://www.zabka.pl/biuro-prasowe/>
— z zastrzeżeniem „trochę za duża jak dla nas", więc skala w dół.

## Pomiary referencji (Żabka, viewport 1400 px)

| Element | Wartość |
|---|---|
| Kontener treści | 1032 px |
| Zdjęcie w liście | 516 px (dokładnie połowa kontenera) |
| Zdjęcie wyróżnionego | 561 × 386 px, po **prawej** stronie |
| Zdjęcia w liście | po **lewej** stronie (x = 177) |
| Tytuł wyróżnionego | 40 px, waga 700 |
| Tytuł w liście | 22 px, waga 700 |
| Tekst artykułu | **800 px szerokości, 20 px, interlinia 26 px** |
| Karta kontaktowa | 400 × 202 px, promień 20 px |
| Notka pod kartą | 600 px, wyśrodkowana |

### Mechanizm wysokości zdjęć

Wysokość zdjęcia **idzie za długością tekstu**, nie za proporcją obrazu.
Zmierzone na Żabce:

| Znaki tekstu | Wysokość zdjęcia |
|---|---|
| 191 | 300 px |
| 314 | 449 px |
| 353 | 471 px |
| 378 | 519 px |

Realizacja: `width: 100%` (z kolumny siatki), `height: 100%` (z wiersza,
który wyznacza kolumna tekstu), `object-fit: cover` docina nadmiar.

⚠️ **Żadnego `aspect-ratio` na desktopie.** Element siatki ma już oba wymiary
narzucone; `aspect-ratio` jest trzecim ograniczeniem, wygrywa i rozpycha
element poza tor. Zmierzone przy dwóch nieudanych próbach: tor 778 px /
grafika 851 px, potem tor 767 px / grafika 795 px — w obu przypadkach tekst
w sąsiedniej kolumnie był ucięty. `aspect-ratio` wolno stosować wyłącznie
w wariancie jednokolumnowym (mobile), gdzie nie ma wiersza do wypełnienia.

## Decyzje

| # | Decyzja | Uzasadnienie |
|---|---|---|
| U1 | Turkusowy pas hero **usunięty** | Żabka nie ma hero; dziennikarz widzi najnowszy komunikat od pierwszej sekundy |
| U2 | Wyróżniony: tekst lewo, zdjęcie prawo | 1:1 z Żabką |
| U3 | Lista: jeden wpis na wiersz, zdjęcie lewo 50% | Zamiast siatki 3×3. Znosi problem nierównych wysokości — przy jednym wpisie na wiersz nie ma z czym równać |
| U4 | Zdjęcia kadrowane, wysokość z tekstu | Mechanizm Żabki, patrz wyżej |
| U5 | Jedna karta kontaktowa + notka pod nią | Kontakt prasowy wyeksponowany; adres dla kupujących w notce. Dwie równorzędne karty zestawiałyby kontakt prasowy z obsługą klienta — nierówne rangi |
| U6 | Stopka: + social media ERLI, + link do erli.pl | Social media były na obecnym biurze prasowym i wypadły przy przebudowie; biuro prasowe jest dziś odcięte od erli.pl |
| U7 | Leady wydłużone do 250–350 znaków | Patrz „Problem długości leadów" |
| U8 | Nowy token 20 px na tekst artykułu | Patrz „Ograniczenie skali typograficznej" |

## Ograniczenie skali typograficznej

`tokens.css` **nie ma tokena tekstu czytelniczego powyżej 16 px**:

| Token | Maksimum |
|---|---|
| `--text-body-lg` | 1rem = 16 px |
| `--text-body-md` | 0,875rem = 14 px |
| `--text-caption-1` | 0,8125rem = 13 px |

Powyżej 16 px istnieją wyłącznie tokeny nagłówkowe: `--text-lg` i `--text-h6`
(18 px, identyczne definicje), `--text-xl` (22 px).

Zmierzony efekt na naszym artykule przed poprawką: czcionka **15,35 px**,
a akapity **602 px** zamiast 720 px kontenera — bo `base.css` ustawia
`p { max-width: 70ch }`, co przy tej czcionce daje 602 px. Stąd zarzut
o wąską szpaltę: mały tekst w kolumnie węższej niż zaplanowana.

Decyzja U8: nowy token `--text-article` ≈ 20 px. To rozszerzenie skali
typograficznej ERLI o stopień, którego nie miała — zaakceptowane świadomie
przez właściciela.

## Problem długości leadów

Nasze leady (kolumna `intro_text` z Joomli) mają **50–183 znaki**;
Żabkowe 191–381. Skutek: mechanizm wysokości nie ma czym rozciągnąć wiersza
i zdjęcia wychodzą paskami. Zmierzone warianty:

| Wariant | Proporcje zdjęć w liście |
|---|---|
| Tekst 15,35 px, bez podłogi | 1,88 – 2,49 |
| Tekst 18 px, bez podłogi | 1,88 – 2,49 |
| Podłoga `min-height: 288px` | 1,60 we wszystkich — zmienność zniknęła |
| Żabka | 1,10 – 1,72, zmienne |

Podłoga naprawia paski, ale kasuje zmienność, która była powodem wyboru tej
referencji — żaden nasz lead nie jest dość długi, żeby ją przekroczyć.

**Decyzja U7:** zamiast podłogi wydłużamy leady. Skrypt uzupełnia zbyt krótkie
`lead` pierwszym akapitem treści do ~250–350 znaków, ucinając na granicy
zdania. Wynik wymaga przeglądu — automat skleja zdania.

`min-height` na zdjęciu **nie wchodzi** do wdrożenia.

## Nowe tokeny (zatwierdzone)

| Token | Wartość | Przeznaczenie |
|---|---|---|
| `--max-press` | 1032px | kontener biura prasowego (zamiast `--max-content-width` 1344px) |
| `--measure-article` | 800px | szpalta artykułu (było `--max-narrow` 720px) |
| `--text-article` | ~20px | tekst czytelniczy artykułu i leadów |
| `--card-contact` | 400px | karta kontaktowa |
| `--measure-note` | 600px | notka pod kartą kontaktową |

Każdy z komentarzem w `tokens.css` mówiącym, skąd wzięła się wartość.

## Kompozycja strony głównej

```
header (bez zmian, kontener 1032)
─────────────────────────────────
wyróżniony: tekst lewo | zdjęcie prawo, tytuł h1 32–40 px
─────────────────────────────────
„Wcześniejsze"            „Wszystkie aktualności" →
wpis: zdjęcie lewo | tekst prawo, tytuł h3 22–24 px
wpis: zdjęcie lewo | tekst prawo
…
─────────────────────────────────
„Kontakt dla mediów"  (wyśrodkowany)
     karta 400 px, promień 20 px
     notka 600 px, wyśrodkowana
─────────────────────────────────
stopka: marka + social | biuro prasowe | ERLI
```

Mobile (<768 px): jedna kolumna, zdjęcie nad tekstem, `aspect-ratio`
dopuszczone (brak wiersza do wypełnienia). Wyróżniony traci `order: 2`
na zdjęciu, żeby zdjęcie nie wyprzedzało tytułu.

## Elementy usuwane

- `.press-hero` i `.press-hero--slim` wraz z turkusowym gradientem (U1)
- `.post-grid--three`, `.post-card--featured` i kompaktowe wiersze mobilne
  z układu v1 — zastąpione przez `.press-item`
- token `--thumb-mobile` z propozycji v1 — bezprzedmiotowy, bo w układzie
  pionowym nie ma miniatur

## Do rozstrzygnięcia poza tym dokumentem

- waga obrazków: `/aktualnosci/` ciągnie 5,1 MB; w tym układzie zdjęcia są
  większe i bardziej widoczne, więc problem rośnie. Potrzebne warianty
  rozmiarowe i `srcset`
- D4 i D5 z `BLOKADY.md`
- decyzja o pushu na `origin` (47 commitów, brak przeglądu)
