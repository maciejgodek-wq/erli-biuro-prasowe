# Biuro prasowe ERLI — wymagania hostingowe

Dokument dla działu IT. Opisuje **czego serwis wymaga**, a nie jaką technologię
wybrać. Wybór rozwiązania należy do IT — spełnić trzeba poniższe warunki.

Adres docelowy: `biuroprasowe.erli.pl`

---

## 1. Czym jest ten serwis

Statyczna strona WWW. Zbiór gotowych plików `.html`, `.css`, `.js`, obrazów
i fontów. Serwer ma je **wyłącznie oddawać** — nic nie wykonuje, nic nie liczy,
nic nie zapisuje.

| Parametr | Wartość |
| --- | --- |
| Rozmiar całości | 6,9 MB |
| Liczba plików | 295 |
| Stron HTML | 90 |
| Największy pojedynczy plik | 319 KB (font) |
| Ruch | marginalny — serwis prasowy, nie sklep |
| Przyrost | kilka–kilkanaście komunikatów rocznie, ~100 KB każdy |

### Czego serwis NIE potrzebuje

Warto wykluczyć od razu, bo zmienia to klasę wymaganego hostingu:

- **bez bazy danych**
- **bez PHP i bez jakiegokolwiek środowiska uruchomieniowego po stronie serwera**
- **bez zapisu na dysk w czasie działania** — katalog może być tylko do odczytu
- **bez sesji, logowania i panelu administracyjnego**
- **bez formularzy** — serwis nie przyjmuje żadnych danych od użytkownika
- **bez cookies** i bez skryptów zewnętrznych; fonty serwowane z własnego serwera

Konsekwencja: nie ma tu powierzchni ataku typowej dla CMS-a. Nie ma czego
łatać, bo nie ma warstwy dynamicznej.

---

## 2. Wymagania wobec serwera

### 2.1. Serwowanie katalogów — **krytyczne**

Wszystkie adresy kończą się ukośnikiem i wskazują katalog:

```
/aktualnosci/
/media-o-erli/
/aktualnosci/erli-otwiera-nowe-centrum-logistyczne/
```

Serwer musi dla takiego adresu oddać plik `index.html` z tego katalogu.

**Jeśli nie zadziała:** cała strona zwraca 404 albo listing katalogu. Nie da
się tego obejść po stronie treści.

### 2.2. Przekierowania 301 — **krytyczne**

Serwis zastępuje stronę na Joomli. Stare adresy miały postać
`/index.php/<kategoria>/<slug>` i przestają istnieć. Trzeba obsłużyć
**104 przekierowania trwałe (301)**.

Build generuje tę mapę automatycznie przy każdej publikacji, w czterech
formatach — IT wybiera pasujący:

| Plik w paczce | Dla czego |
| --- | --- |
| `redirects/.htaccess` | Apache |
| `redirects/nginx.conf` | nginx (blok `server`) |
| `redirects/mapa.csv` | panel hostingu, load balancer, cokolwiek innego |
| `_redirects` | Cloudflare Pages, Netlify (czytane automatycznie) |

**Jeśli nie zadziała:** każdy link do biura prasowego z artykułów w Bankier.pl,
Wyborcza.biz i pozostałych publikacjach prowadzi na 404, a serwis traci
wypracowaną pozycję w wyszukiwarce. To jest najdroższy w skutkach punkt
całej listy.

> **Katalog `redirects/` nie jest częścią strony.** Nie wgrywa się go na
> serwer — to materiał konfiguracyjny dla IT.

### 2.3. HTTPS

- ważny certyfikat dla `biuroprasowe.erli.pl`, odnawiany automatycznie
- stałe przekierowanie `http://` → `https://`
- jedna wersja kanoniczna adresu (z `www` albo bez), druga przekierowana na nią

**Jeśli nie zadziała:** przeglądarki oznaczą serwis prasowy jako niezaufany.

### 2.4. Typy MIME

Serwer musi poprawnie deklarować:

| Rozszerzenie | Content-Type |
| --- | --- |
| `.webp` | `image/webp` |
| `.woff2` | `font/woff2` |
| `.svg` | `image/svg+xml` |
| `.css` | `text/css` |
| `.xml` | `application/xml` |

**Jeśli nie zadziała:** starsze konfiguracje Apache/IIS potrafią nie znać
`.webp` i `.woff2` — wtedy nie ładują się zdjęcia (185 plików) i typografia
strony.

### 2.5. Kompresja

gzip lub brotli dla `.html`, `.css`, `.js`, `.svg`, `.xml`.
Dla `.webp` i `.woff2` **nie** — są już skompresowane, ponowna kompresja tylko
obciąża procesor.

Największy zysk: CSS 75 KB → ok. 15 KB.

### 2.6. Nagłówki cache

Dwie różne reguły, bo to dwie różne sytuacje:

| Ścieżka | Nagłówek |
| --- | --- |
| `/assets/fonts/*`, `/assets/img/*` | `public, max-age=31536000, immutable` |
| `/assets/css/*`, `/assets/js/*` | `public, max-age=0, must-revalidate` |
| `*.html` | `public, max-age=0, must-revalidate` |

**Dlaczego CSS i JS inaczej niż reszta zasobów:** build nie dokleja do ich nazw
odcisku treści — plik nazywa się `main.css` niezależnie od zawartości. Przy
rocznym `immutable` każdy, kto raz otworzył stronę, zostałby na starym
wyglądzie do wygaśnięcia cache i żadne wdrożenie by go nie ruszyło.
Fonty i zdjęcia mogą zostać na roku, bo pod daną nazwą ich treść się nie
zmienia — nowe zdjęcie dostaje nową nazwę.

*(Docelowo warto dodać do buildu odcisk treści w nazwie pliku CSS — wtedy i on
może wrócić na rok. Do tego czasu obowiązuje powyższy podział.)*

Komplet reguł jest w pliku `_headers` w katalogu głównym paczki — do
przepisania na składnię danego serwera.

### 2.7. Nagłówki bezpieczeństwa

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Serwis nie ładuje niczego z zewnątrz, więc można na nim domknąć również
restrykcyjne `Content-Security-Policy` — jeśli IT to standaryzuje.

### 2.8. Strona 404

Paczka zawiera gotowy plik `404.html` w katalogu głównym — w szacie graficznej
serwisu, z menu i odesłaniem do obu list.

Wymaganie: serwer ma go oddawać dla nieistniejących adresów, **z kodem
odpowiedzi 404** (nie 200 i nie przekierowaniem na stronę główną). Hostingi
typu Cloudflare Pages robią to automatycznie; Apache i nginx wymagają
wskazania (`ErrorDocument 404 /404.html` / `error_page 404 /404.html;`).

Strona ma `noindex` i nie występuje w `sitemap.xml`.

---

## 3. Wymagania wobec publikacji

Strona powstaje z plików źródłowych przez **build** — krok, który zamienia
teksty w markdownie na gotowy HTML. Dwa modele do wyboru.

### Model A — IT dostaje gotową paczkę *(wybrany)*

Paczkę składa osoba opiekująca się repozytorium jedną komendą
(`npm run paczka`). Powstaje archiwum `biuro-prasowe-RRRR-MM-DD.zip`
o stałej strukturze:

```
strona/          zawartość katalogu głównego serwera
konfiguracja/    mapa 301 dla Apache / nginx / panelu — NIE wgrywać na serwer
WYMAGANIA-HOSTINGOWE.md
PRZECZYTAJ-NAJPIERW.txt
```

Wymagania po stronie serwera: **żadne poza punktem 2**. Bez Node'a, bez
narzędzi budujących, bez dostępu do repozytorium.

Paczki nie da się złożyć bez przebudowania strony — data w nazwie zawsze
odpowiada zawartości. To zabezpieczenie przed wgraniem nieaktualnej wersji.

### Model B — build po stronie IT lub CI

Serwer albo pipeline pobiera repozytorium i sam buduje stronę.

Wymagania:

- **Node.js 22** (wersja przypięta w pliku `.node-version`)
- dostęp do rejestru npm przy budowaniu (3 zależności)
- komendy: `npm ci`, następnie `npm run build`
- wynik: katalog `dist/`

Build **przerywa się błędem**, jeśli wykryje niespójność — brakujący obrazek,
przekierowanie prowadzące donikąd albo pozostałość obcojęzyczną po poprzednim
przeznaczeniu repozytorium. Niekompletna strona nie ma prawa wyjść na
produkcję.

---

## 4. Domena i DNS

- `erli.pl` jest obsługiwane przez nameservery Cloudflare
  (`alan.ns.cloudflare.com`, `lana.ns.cloudflare.com`)
- `biuroprasowe.erli.pl` wskazuje obecnie rekordem **A** na `185.221.108.136`
  (stary hosting Joomli)
- **Przełączenie tego rekordu jest momentem uruchomienia.** Do tej chwili
  wszystko działa równolegle i nic nie ryzykujemy.

Zalecana kolejność: nowy serwer stawiamy pod adresem tymczasowym, IT
weryfikuje go listą z punktu 6, dopiero potem zmieniamy rekord.

---

## 5. Stan obecny

Serwis jest opublikowany na **Cloudflare Pages** jako środowisko testowe.
Traktujemy to jako wersję do obejrzenia, nie jako rekomendację docelową —
dlatego ten dokument mówi o wymaganiach, nie o rozwiązaniu.

Cloudflare spełnia wszystkie powyższe punkty bez konfiguracji (czyta
`_redirects` i `_headers` z paczki). Jeśli IT wybierze hosting firmowy,
przekierowania i nagłówki trzeba przenieść ręcznie — pliki z punktów 2.2 i 2.6
są po to gotowe.

---

## 6. Lista kontrolna do odbioru

Do sprawdzenia na nowym serwerze, zanim przełączymy DNS:

- [ ] `/` zwraca stronę główną
- [ ] `/aktualnosci/` i `/media-o-erli/` zwracają listy
- [ ] dowolny komunikat otwiera się pod adresem z ukośnikiem na końcu
- [ ] `/index.php/aktualnosci` odpowiada **301** i prowadzi na `/aktualnosci/`
- [ ] wyrywkowo 3 przekierowania z `redirects/mapa.csv` zwracają 301, nie 302 i nie 404
- [ ] zdjęcia się wyświetlają (kontrola typu MIME dla `.webp`)
- [ ] tekst ma właściwy krój pisma (kontrola MIME dla `.woff2`)
- [ ] `https://` działa, `http://` przekierowuje na `https://`
- [ ] nagłówki odpowiedzi zawierają cztery pozycje z punktu 2.7
- [ ] `/assets/css/main.css` **nie** ma nagłówka `immutable`
- [ ] `/sitemap.xml` i `/robots.txt` są dostępne
- [ ] nieistniejący adres oddaje `404.html` **z kodem 404** — nie stronę
      główną, nie kod 200, nie błąd 500

Po przełączeniu DNS: zgłosić `sitemap.xml` w Google Search Console.

---

## 7. Kontakt

Pytania techniczne o samą paczkę i build — do osoby opiekującej się
repozytorium `erli-biuro-prasowe`.
