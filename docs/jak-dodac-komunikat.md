# Jak dodać komunikat do biura prasowego

Instrukcja dla osoby nietechnicznej. Nie musisz nic instalować ani znać się na
programowaniu — wystarczy przeglądarka i konto w GitHubie z dostępem do
repozytorium `erli-biuro-prasowe`.

Cały komunikat to **jeden plik tekstowy** plus **jedna grafika**. Tyle.

---

## Zanim zaczniesz — przygotuj trzy rzeczy

1. **Tytuł** komunikatu.
2. **Lead** — jedno lub dwa zdania streszczenia. Pokazuje się na kafelku
   i w wynikach Google.
3. **Grafikę** — zdjęcie lub plansza, najlepiej **1200 × 630 pikseli**.
   Format: `.jpg`, `.png` albo `.webp`.

> **Grafika jest obowiązkowa.** Bez niej strona się nie zbuduje i komunikat
> się nie opublikuje. To celowe zabezpieczenie — pusty kafelek na liście
> wygląda jak błąd strony.

---

## Krok 1. Wgraj grafikę

1. Wejdź na `https://github.com/maciejgodek-wq/erli-biuro-prasowe`
2. Przejdź do katalogu `assets` → `img` → `artykuly`
3. Kliknij **Add file** → **Upload files**
4. Przeciągnij plik z grafiką i kliknij **Commit changes**

Zapamiętaj nazwę pliku — za chwilę ją wpiszesz. Jeśli nazwałaś plik
`konferencja-2026.jpg`, jego adres w systemie to:

```
/assets/img/artykuly/konferencja-2026.jpg
```

Nazwa pliku: **bez polskich znaków, bez spacji**. Zamiast „Konferencja
prasowa.jpg" → `konferencja-prasowa.jpg`.

---

## Krok 2. Utwórz plik komunikatu

1. Przejdź do katalogu `src` → `posts` → `aktualnosci`
   *(komunikaty własne ERLI)*

   albo `src` → `posts` → `media`
   *(publikacje o ERLI w mediach zewnętrznych)*

2. Kliknij **Add file** → **Create new file**

3. W polu nazwy wpisz nazwę w formacie **`RRRR-MM-DD-tytul-po-myslnikach.md`**:

   ```
   2026-08-20-erli-otwiera-nowe-centrum-logistyczne.md
   ```

   Zasady nazwy:
   - zaczyna się od daty: rok-miesiąc-dzień
   - dalej tytuł małymi literami, słowa rozdzielone myślnikami
   - **bez polskich znaków** (`ł` → `l`, `ę` → `e`, `ó` → `o`)
   - kończy się na `.md`

   Nazwa pliku staje się adresem strony, więc warto, żeby była sensowna:
   `biuroprasowe.erli.pl/aktualnosci/erli-otwiera-nowe-centrum-logistyczne/`

---

## Krok 3. Wklej szablon i uzupełnij

Skopiuj to w całości do pola tekstowego i podmień wartości:

```markdown
---
tytul: "ERLI otwiera nowe centrum logistyczne"
data: 2026-08-20
lead: "Nowy obiekt pod Poznaniem zwiększy zdolność przerobową o 40 procent."
grafika: /assets/img/artykuly/konferencja-2026.jpg
---

Pierwszy akapit komunikatu. Piszesz zwykłym tekstem, tak jak w mailu.

Pusta linia oddziela akapity.

## Śródtytuł

Kolejny akapit.

> Cytat wypowiedzi. Tak wyróżnia się słowa prezesa czy dyrektora.
```

### Co znaczy każde pole

| Pole | Obowiązkowe | Uwagi |
| --- | --- | --- |
| `tytul` | tak | W cudzysłowie. Polskie znaki jak najbardziej. |
| `data` | tak | Dokładnie `RRRR-MM-DD`, np. `2026-08-20`. Ta data decyduje o kolejności na liście. |
| `lead` | tak | Jedno–dwa zdania, **w jednej linii**, w cudzysłowie. |
| `grafika` | tak | Adres wgranego pliku, zaczyna się od `/assets/`. |

**Trzy myślniki `---` na górze i na dole tej sekcji są konieczne.** To one
oddzielają dane komunikatu od jego treści.

---

## Krok 4. Zapisz

Zjedź na dół strony, w polu opisu wpisz np. „nowy komunikat: centrum
logistyczne" i kliknij **Commit changes**.

Gotowe. Strona przebudowuje się sama i po kilku minutach komunikat jest online.

> Jeśli biuro prasowe zostanie kiedyś przeniesione na serwer firmowy, ten krok
> może wyglądać inaczej — publikację uruchamia wtedy IT. Sposób dodawania
> komunikatu (kroki 1–3) nie zmienia się.

---

## Publikacje w mediach — jedno pole więcej

Komunikaty w katalogu `src/posts/media` to teksty, które o ERLI napisał ktoś
inny. Dodaj do nich informację o źródle — **wcięcie dwiema spacjami jest
konieczne**:

```markdown
---
tytul: "ERLI rośnie szybciej niż rynek"
data: 2026-08-20
lead: "Serwis podsumowuje wyniki platformy za pierwsze półrocze."
grafika: /assets/img/artykuly/wyniki-2026.jpg
zrodlo:
  nazwa: Bankier.pl
  url: https://www.bankier.pl/wiadomosc/...
---
```

---

## Jak formatować treść

Treść pisze się w Markdownie. W praktyce wystarczy pięć rzeczy:

| Chcesz | Zapisujesz |
| --- | --- |
| Nowy akapit | zostaw pustą linię |
| Śródtytuł | `## Śródtytuł` |
| **Pogrubienie** | `**tekst**` |
| Cytat | `> Treść cytatu` |
| Link | `[widoczny tekst](https://adres.pl)` |

Lista wypunktowana — każdy punkt od myślnika:

```markdown
- pierwszy punkt
- drugi punkt
```

---

## Najczęstsze błędy

Po zapisaniu GitHub pokazuje przy commicie **zielony znaczek** (wszystko gra)
albo **czerwony krzyżyk** (coś nie zadziałało). Czerwony krzyżyk oznacza, że
komunikat **nie** trafił na stronę — i że stara wersja strony nadal działa
bez zmian. Nic nie zepsułaś, trzeba tylko poprawić plik.

**Nie ma grafiki pod podanym adresem**
Literówka w nazwie pliku albo grafika nie została wgrana. Sprawdź, czy nazwa
w polu `grafika` zgadza się co do znaku z nazwą wgranego pliku — wielkość
liter też ma znaczenie.

**Zła data**
`data: 20.08.2026` nie zadziała. Musi być `data: 2026-08-20`.

**Puste pole**
Nie zostawiaj pola bez wartości. Zamiast `lead:` napisz `lead: "..."` albo
usuń całą linię.

**Lead w kilku liniach**
Lead musi zmieścić się w jednej linii, choćby była długa. Wciśnięty Enter
w środku leadu urywa go w tym miejscu.

**Lead powtarzający tytuł**
Nie zaczynaj i nie kończ leadu tytułem komunikatu — na kafelku tytuł stoi tuż
nad leadem i czyta się dwa razy pod rząd. Lead ma **dopowiadać**, nie
powtarzać.

**Tekst po niemiecku**
Strona powstała na bazie repozytorium innego serwisu i ma zabezpieczenie,
które przerywa publikację, jeśli wykryje niemieckie słowa. Jeśli cytujesz
niemiecką wypowiedź, daj znać osobie technicznej.

---

## Kiedy poprosić o pomoc technika

- czerwony krzyżyk nie znika po poprawieniu pliku
- chcesz zmienić układ strony, menu albo dane kontaktowe
- chcesz usunąć albo przenieść opublikowany komunikat
  *(usunięcie zmienia adresy — trzeba zadbać o przekierowanie, żeby linki
  z mediów nie prowadziły na pustą stronę)*
