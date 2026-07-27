# Biuro prasowe ERLI — zlecenia dla sesji agentów

Koordynacja wykonania planu `docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md`.
Każda sesja dostaje jeden prompt z tego dokumentu. Prompty są samodzielne —
agent nie zna kontekstu tej rozmowy.

## Kolejność i równoległość

```
FALA 1   S1  Zadania 1–2    sprzątanie repo
              ↓
FALA 2   S2  Zadania 3–12   generator      ┐ równolegle
         S3  Zadania 13–15  szablony       ┘
              ↓
FALA 3   S4  Zadania 16–17  orkiestracja
              ↓
FALA 4   S5  Zadania 18–19  CSS            ┐ równolegle
         S6  Zadanie 20     grafiki        ┘
              ↓
FALA 5   S7  Zadania 21–23  treść          (czeka na eksport z Joomli)
```

**S1 musi iść sama** — usuwa pliki z całego repozytorium, każda równoległa sesja
miałaby konflikty.

**S2 i S3 nie kolidują**: S2 pisze wyłącznie w `build/` i `package.json`,
S3 wyłącznie w `src/templates/` i `src/partials/`.

**S5 i S6 nie kolidują**: S5 pisze w `assets/css/`, S6 w `tools/` i `assets/img/kv/`.
Obie modyfikują tylko sobie przypisane pliki — jedyny wspólny punkt to `build/css.js`,
który zmienia wyłącznie S5.

## Punkty kontrolne PM-a

| Po sesji | Co sprawdzam |
|---|---|
| S1 | `git log`, czy nie zniknęło nic potrzebnego |
| S2+S3 | `npm test` przechodzi, szablony istnieją |
| S4 | **Strona działa w przeglądarce** — pierwsza ocena wyglądu |
| S5+S6 | Wygląd na 375/768/1280 px, grafiki czytelne |
| S7 | Kompletność treści, mapa przekierowań |

---

## S1 — Sprzątanie repozytorium

```
Pracujesz w repozytorium biura prasowego ERLI. Repo zawiera dziś zaślepkę SEO
rynku niemieckiego (erli.de), która jest przerabiana na polskie biuro prasowe.

Wykonaj Zadania 1 i 2 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

Przeczytaj najpierw cały plan (sekcje "Struktura plików" i "Faza 0"), a dla
kontekstu decyzji także spec:
docs/superpowers/specs/2026-07-27-biuro-prasowe-erli-design.md

Zadanie 1 usuwa strony i assety rynku niemieckiego (~33 MB).
Zadanie 2 tłumaczy niemieckie etykiety aria-label w nav.js i przepisuje
niemieckie przykłady kodu w design-system/design.md.

Wykonuj krok po kroku, odhaczając checkboxy w pliku planu w miarę postępu.
Commituj dokładnie tak, jak plan nakazuje — jeden commit na zadanie.

WAŻNE: Zadanie 1 usuwa pliki bezpowrotnie. Przed pierwszym `git rm` uruchom
`git status` i upewnij się, że drzewo robocze jest czyste. Jeśli są
niezacommitowane zmiany — zatrzymaj się i zapytaj.

Po skończeniu napisz krótkie podsumowanie: co usunięto, ile miejsca zwolniono,
co zostało w assets/. Nie przechodź do kolejnych zadań.
```

---

## S2 — Generator (moduły budujące)

```
Pracujesz w repozytorium biura prasowego ERLI — statyczna strona generowana
z markdowna, bez CMS-a.

Wykonaj Zadania 3–12 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

To cała Faza 1: inicjalizacja projektu Node i dziesięć modułów generatora,
każdy z własnym plikiem testów. Plan zawiera kompletny kod testów
i implementacji dla każdego modułu.

Pracujesz metodą TDD dokładnie tak, jak opisuje plan:
napisz test → uruchom i zobacz, że pada → zaimplementuj → uruchom i zobacz,
że przechodzi → commituj. Nie skracaj tej pętli. Nie pisz implementacji przed
testem.

Jeśli test w planie jest błędny albo implementacja go nie spełnia — zatrzymaj
się i zgłoś to zamiast naginać test do implementacji.

ZAKRES: dotykasz wyłącznie plików build/*, package.json, package-lock.json
i .gitignore. Nie twórz src/, nie twórz build.js w katalogu głównym, nie
ruszaj assets/. Równolegle pracuje druga sesja nad szablonami.

Po skończeniu uruchom `npm test` i podaj łączną liczbę przechodzących testów.
```

---

## S3 — Szablony i partiale

```
Pracujesz w repozytorium biura prasowego ERLI — statyczna strona generowana
z markdowna, bez CMS-a. Strona zastępuje obecne biuro prasowe na Joomli
i ma być w 100% po polsku.

Wykonaj Zadania 13–15 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

To szkielet HTML strony: base.html, header, stopka, karta artykułu, blok
udostępniania, blok kontaktowy oraz cztery szablony stron (home, list, post,
page). Plan zawiera pełną treść każdego pliku — przepisz ją dokładnie.

Kontekst decyzji, jeśli potrzebujesz uzasadnienia:
docs/superpowers/specs/2026-07-27-biuro-prasowe-erli-design.md

Rzeczy, na które zwróć szczególną uwagę:
- lang="pl" i zero niemieckiego — to twarde wymaganie projektu
- aria-current na aktywnej pozycji menu (obecna strona tego nie ma)
- preload fontów wskazuje warianty latin-ext, nie latin — polskie diakrytyki
  leżą w latin-ext
- żadnego GTM, Consent Mode ani skryptów zewnętrznych
- kontakt prasowy: Aleksandra Grądzka, media@erli.pl

Szablony używają składni {{ }}, {{{ }}}, {{> }}, {{#each}}, {{#if}} — silnik
powstaje równolegle w innej sesji. Nie implementuj go, nie twórz build.js.

ZAKRES: dotykasz wyłącznie src/templates/ i src/partials/. Nie twórz build/,
nie ruszaj package.json ani assets/.

Nie będziesz mógł uruchomić buildu — to normalne, składa się go w kolejnej
sesji. Zweryfikuj zamiast tego, że pliki są poprawnym HTML-em i że nie ma
w nich ani jednego niemieckiego słowa.
```

---

## S4 — Orkiestracja i pierwszy działający build

```
Pracujesz w repozytorium biura prasowego ERLI — statyczna strona generowana
z markdowna. Moduły generatora (build/*) i szablony (src/templates/,
src/partials/) są już gotowe z poprzednich sesji.

Wykonaj Zadania 16 i 17 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

Zadanie 16 to build/render.js — pomocniki renderowania (aria-current, ścieżki
grafik, JSON-LD, dobór powiązanych artykułów), z testami.
Zadanie 17 to build.js — orkiestracja całości plus post testowy i szkielety
stron statycznych.

Po Zadaniu 17 strona musi się otwierać w przeglądarce. To pierwszy moment,
w którym całość działa end-to-end.

Jeśli build się wywali — najpierw przeczytaj komunikat. Kontrola językowa
(build/lang-guard.js) przerywa build celowo, gdy znajdzie niemiecki
w wygenerowanym HTML-u. To nie jest błąd generatora, tylko treści: znajdź
niemiecki fragment i usuń go u źródła, w szablonie albo w poście.

Jeśli natrafisz na niezgodność między modułami z poprzednich sesji (inna
nazwa pola, inny kształt obiektu) — napraw ją i wyraźnie odnotuj w podsumowaniu.

Po skończeniu:
1. Uruchom `npm test` — wszystko musi przechodzić
2. Uruchom `node build.js`
3. Uruchom `npx http-server dist -p 8000 -c-1`
4. Zrób zrzuty ekranu strony głównej, listy /aktualnosci/ i artykułu
5. W podsumowaniu podaj: liczbę stron, liczbę przekierowań, wynik kontroli
   językowej i co widać na zrzutach

Strona będzie jeszcze bez docelowych stylów i grafik — to normalne, powstają
w kolejnych sesjach.
```

---

## S5 — CSS: przycięcie i style biura prasowego

```
Pracujesz w repozytorium biura prasowego ERLI. Strona już się buduje
(`node build.js`) i działa, ale korzysta z CSS-a odziedziczonego po zaślepce
rynku niemieckiego — pełnego martwych reguł.

Wykonaj Zadania 18 i 19 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

Zadanie 18 wycina martwe bloki z assets/css/components.css (plan podaje
dokładną listę selektorów do usunięcia i do zachowania), usuwa niemieckie
komentarze i przesuwa próg burgera z 480px na 768px — obecnie w zakresie
481–768px nawigacja się rozjeżdża.

Zadanie 19 tworzy assets/css/press.css ze stylami biura prasowego. Plan
zawiera pełną treść tego pliku.

TWARDA ZASADA: w press.css nie może być ani jednej wartości wpisanej na
sztywno — wszystkie kolory, odstępy, rozmiary i promienie pochodzą ze zmiennych
z assets/css/tokens.css. Jeśli potrzebujesz wartości, dla której nie ma tokena,
zatrzymaj się i zgłoś to zamiast wpisywać liczbę.

Po każdej większej zmianie uruchamiaj `node build.js` — jeśli build przestanie
przechodzić, cofnij ostatnią zmianę zamiast brnąć dalej.

ZAKRES: assets/css/*, assets/js/share.js, build/css.js, build/css.test.js
i jedna linijka w src/templates/post.html. Nie ruszaj innych plików —
równolegle pracuje sesja nad grafikami.

Weryfikacja końcowa:
1. `npm test && node build.js`
2. `npx http-server dist -p 8000 -c-1`
3. Sprawdź przy 375px, 768px i 1280px — przy 375 i 768 ma być burger,
   przy 1280 pełne menu, nic nie może wystawać poza ekran
4. Przejdź stronę samym klawiszem Tab — każdy element interaktywny musi mieć
   widoczny focus, "Przejdź do treści" musi być pierwszy
5. Podaj rozmiar dist/assets/css/main.css przed i po (pierwotnie 96 KB)
6. Zrzuty ekranu z trzech szerokości
```

---

## S6 — Generator grafik wyróżniających

```
Pracujesz w repozytorium biura prasowego ERLI. Artykuły potrzebują grafik
wyróżniających — obecna strona nie ma żadnych, przez co udostępnienie linku
na LinkedInie daje pusty podgląd.

Wykonaj Zadanie 20 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

Budujesz generator SVG 1200×630, który dobiera jeden z trzech wariantów tła
deterministycznie na podstawie sluga artykułu. Ta sama grafika służy
jednocześnie jako obraz karty i jako og:image — stąd format i rozmiar.

Plan zawiera kompletny kod testów i implementacji. Pracujesz metodą TDD:
test → padnięcie → implementacja → przejście → commit.

Kolory wariantów w planie pochodzą z assets/css/tokens.css. Nie zmieniaj ich.

Po wygenerowaniu SVG konwertujesz je do WebP — SVG nie działa jako og:image,
bo Facebook i LinkedIn go nie renderują. Plan podaje dwie ścieżki konwersji
(sharp-cli, ImageMagick). Jeśli obie zawiodą w tym środowisku, zgłoś to
zamiast pomijać krok.

ZAKRES: tools/ i assets/img/kv/. Nie ruszaj build/, src/ ani assets/css/ —
równolegle pracuje sesja nad CSS-em.

Po skończeniu otwórz 3 wygenerowane pliki .webp i sprawdź: tekst mieści się
w kadrze, kontrast jest czytelny, nic nie wychodzi poza krawędź. Dołącz je
do podsumowania.

W repozytorium jest na razie jeden post testowy, więc grafik będzie 2
(post + default). To poprawne — reszta powstanie po migracji treści.
```

---

## S7 — Migracja treści (czeka na eksport z Joomli)

```
Pracujesz w repozytorium biura prasowego ERLI. Strona jest gotowa technicznie —
generator, szablony, style i grafiki działają. Brakuje treści.

Zadanie: przenieść ~35 artykułów oraz strony O nas i Kontakt z eksportu Joomli.

Wykonaj Zadania 21–23 z planu:
docs/superpowers/plans/2026-07-27-biuro-prasowe-erli.md

Eksport z Joomli znajduje się w: <UZUPEŁNIĆ ŚCIEŻKĘ>

NAJWAŻNIEJSZA ZASADA: slug każdego artykułu musi być identyczny jak w Joomli.
Skopiuj go z pola `alias`, nigdy nie generuj z tytułu. Na slugach opiera się
mapa przekierowań 301 — jeśli któryś się rozjedzie, link do tego artykułu
z zewnętrznego serwisu trafi na 404.

Dwie kategorie różnią się kształtem:
- Aktualności (src/posts/aktualnosci/) — własne komunikaty, pełna treść
- Media o ERLI (src/posts/media/) — streszczenie publikacji zewnętrznej.
  Link do źródła jest w Joomli zaszyty w środku akapitu; wyciągnij go do pola
  `zrodlo` we frontmatterze i usuń zdanie odsyłające z treści. Blok źródła
  renderuje się osobno, nad treścią.

Zanim zaczniesz przepisywać:
1. Sprawdź, czy w eksporcie są artykuły niewidoczne z zewnątrz —
   nieopublikowane, zarchiwizowane, w koszu. Wypisz je i ZAPYTAJ, które
   migrować. Nie decyduj sam.
2. Przeszukaj eksport pod kątem analityki (GTM, GA4, Piksel, Hotjar).
   Front strony jej nie miał, ale w plikach konfiguracyjnych może coś siedzieć.
   Jeśli znajdziesz — zgłoś przed migracją.

Treść stron O nas i Kontakt przenosisz 1:1, bez aktualizowania merytorycznego.
Kalendarium na O nas kończy się na 2021 i liczby są nieaktualne — to świadoma
decyzja właściciela projektu (D7 w specyfikacji), nie błąd do naprawienia.
Jedyna zmiana: kontakt prasowy to Aleksandra Grądzka, media@erli.pl.

Po migracji Zadanie 23 to weryfikacja końcowa i paczka dla IT. Wykonaj
wszystkie jego kroki — zwłaszcza sprawdzenie, że w dist/ nie ma niemieckiego
ani śladów erli.de, i że liczba wierszy w mapie przekierowań zgadza się
z liczbą artykułów.

W podsumowaniu podaj: liczbę zmigrowanych artykułów per kategoria, liczbę
przekierowań, rozmiar paczki i listę wszystkiego, co wymagało decyzji.
```

---

## Notatki dla PM-a

**Ryzyko styku S2/S3 → S4.** Dwie sesje pracują nad przeciwległymi końcami tego
samego interfejsu: S2 pisze silnik szablonów, S3 pisze szablony, które go
używają. Plan definiuje składnię jednoznacznie, ale niezgodność wyjdzie dopiero
w S4. Dlatego S4 ma w prompcie jawne pozwolenie na naprawianie takich rozjazdów.

**S4 to punkt kontrolny wyglądu.** Strona działa tam po raz pierwszy, jeszcze
bez docelowych stylów. Warto ją obejrzeć przed S5 — zmiana układu jest wtedy
tania, po napisaniu press.css już nie.

**Eksport z Joomli.** Przed S7 wart sprawdzenia: czy eksport zawiera bazę
danych (tabele `#__content`, `#__categories`), czy tylko pliki. Sam katalog
plików nie wystarczy — treść artykułów siedzi w bazie.

**Przekierowania.** Jedyny element, którego nie kontrolujemy — wdraża je IT.
Bez nich cała praca SEO idzie w las. Warto potwierdzić z IT przed wdrożeniem,
który format przyjmą (Apache / nginx / panel).
