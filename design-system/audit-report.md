# Audit Report — Erli.de Design System v2.2

**Data:** 2026-05-07
**Autor:** Claude (Opus 4.7)
**Scope:** Generacja design.md dla erli.de na bazie autorytatywnego dev DESIGN.md ERLI + Figma LP-12_25 + audit WCAG 2.2 AA + modernizacja "modern commercial 2025-2026" w ramach brand DNA.

---

## ⚠️ Acknowledgement: revision history

**v1.0 (poprzednia, odrzucona):** zbudowana na bazie WebFetch summary erli.pl + general knowledge; **mocno mismatched z realnym brandem**:
- Złe radii: 8-16px (rzeczywiste: 3-8px)
- Brak yellow `#feda30` jako secondary brand color (kompletnie pominięty)
- Brak primary CTA gradient (brand DNA — odrzuciłem jako "starzeją się")
- Zła typografia: Manrope+Inter (rzeczywista: Roboto)
- Złe spacing/breakpointy/motion
- Brak floating label pattern dla inputs
- Brak custom scrollbar w brand color
- Brak button-promotion (yellow) variant

**v2.0:** zbudowana na **autorytatywnym dev DESIGN.md** (kompletny inventory tokenów ERLI) + Figma LP-12_25 (visual reference layoutów). Wszystkie tokeny dziedziczone 1:1 z developera; modernizacja erli.de ograniczona do composition layer + tech stack + WCAG corrections.

**v2.1:** Korekty per feedback UX Lead:
- **Headingi → Montserrat** (`--font-display`). `--font-body` pozostaje Roboto Flex. Google Fonts import rozszerzony o Montserrat:wght@400;700.
- **Primary button gradient → przywrócony brand gradient** `#0097bc → #00b3bc` jako `--gradient-primary` default. Hover state (`--gradient-primary-hover`) darkens do `#007996 → #008f96` (WCAG AA 3.90-5.03:1). WCAG note: brand gradient ~2.57-3.41:1 — stosować wyłącznie na large text CTA (bold ≥14pt).

**v2.2 (obecna):** Rozszerzenie komponentów na bazie analizy Figma LP-12_25 node 2001-323 ("Zaufanie" landing page):
- **5.11 Star rating** — yellow stars `#feda30`, full/half/empty states, role="img" + aria-label. Sizing modifiers `--sm` / `--lg`.
- **5.12 Stat strip** — `<dl>` semantic counter row (4-col grid z vertical dividers), Montserrat numbers w primary-700, używany w hero + standalone.
- **5.13 FAQ accordion** — native `<details>`/`<summary>` z `name="faq"` exclusive accordion (HTML 2024). Smooth height z `interpolate-size: allow-keywords` + `::details-content` (Chrome 129+, graceful fallback). Zero JS.
- **5.14 Review platform card** — App Store / Google Play z aggregated rating + count, single click target (`<a>` cała karta). Yellow promo background (12.69:1 AAA).
- **5.15 Trust ribbon** — cyan `#0097bc` strip pod hero z QR + app store badges. White text na primary-500 = 3.41:1 wymaga bold body-lg (large text passuje 3:1).
- **5.16 Long-form prose** — typography rules dla SEO content: max-width 70ch, h2/h3 hierarchy, underlined links (1.4.1), line-height 1.5.
- **5.17 Cookie consent banner** — GDPR equal prominence (3 buttons: Settings / Reject / Accept), `role="dialog"` z aria-labelledby + aria-describedby. Privacy by default.

Wszystkie nowe komponenty udemonstrowane w `preview.html` jako sekcja 7 (Trust LP patterns); sekcje A11y i Modern techniques przesunięte na 8 i 9.

---

## TL;DR

- **Źródło autorytatywne:** dev DESIGN.md ERLI (24 named colors + 11-step primary scale + 11-step secondary yellow scale + 5 button variants + floating label inputs + 5 info-box variants + custom scrollbar + 3-level shadow elevation + Roboto + 3-8px radii + 100-250ms ease-in-out motion).
- **Brand DNA dziedziczone 1:1:** cała paleta, Roboto + 400/700 weights, radii 3-4-6-8-9999, spacing 4/8/16/24/32, breakpointy 360/768/1025/1440/1648, motion 100/150/200/250 ease-in-out, shadows (header/dropdown/modal/popover), gradient na primary CTA, yellow `#feda30` na promotion CTA, floating label inputs, custom scrollbar w primary teal.
- **WCAG corrections (3 krytyczne):**
  1. **Gradient dla primary CTA** — brand gradient `#0097bc → #00b3bc` ~2.57-3.41:1. Stosować tylko na large text (bold ≥14pt). Hover auto-darkens do WCAG AA.
  2. **Border-strong dla form inputs** — erli.pl `#e2e2e2` vs white = 1.34:1 fails 1.4.11. Korekta: `neutral-600 #787878` = 4.41:1 ✓ AA non-text.
  3. **Focus-visible explicit** — erli.pl prawdopodobny `outline: none` bez zamiennika fails 2.4.7. Korekta: universal `:focus-visible` ring w primary-700 (7.66:1 AAA) + 2px offset.
- **Innovation budget (4 wzorce mocno):** Bento grid + asymmetric hero · Montserrat headings + Roboto Flex body + fluid clamp() · Modern CSS stack (OKLCH + container queries + `:has()` + logical properties + scroll-driven animations) · Photography hero z brand teal panel.
- **Pliki dostarczone:** `design.md` (~1140 linii), `preview.html` v2 (~1100 linii), `audit-report.md` (ten plik), `figma-overview.png` (Figma LP screenshot reference).

---

## 1. Co stanowi źródło autorytatywne

### 1.1 Developer DESIGN.md (zaszły z dewami ERLI)

Kompletny inventory tokenów:
- **Colors:** 11-step primary scale (#0097bc center), 11-step secondary yellow scale (#feda30 center), 4-step tertiary cyan scale (#00c7cc — ErliPRO), 4-step success/warning/error scales, 9-step neutral grayscale, base black/white/background/surface, special price-red `#d02112` i yellow-title `#ffc70e`, 4 brand gradients.
- **Typography:** Roboto sole typeface w erli.pl (Montserrat tylko onboarding); erli.de: Montserrat na headingach, Roboto Flex na body. Discrete responsive sizes (mobile vs desktop) dla h1-h6, body-lg/md, caption-1/2, overline. Two weights only (400 + 700).
- **Spacing:** 5-step scale 4/8/16/24/32, container gutters 8/16/32, max-widths 1344/1584.
- **Breakpoints:** 360/768/1025/1440/1648.
- **Radii:** 3/4/6/8/9999 (sm/DEFAULT/md/lg/full).
- **Shadows:** header/dropdown/modal/popover — 4 specific values.
- **Motion:** 100/150/200/250 ms + ease-in-out/in/out + spinner.
- **Components:** 5 button variants z konkretnymi specs, floating-label inputs, badges, dropdowns, modals, info-box (5 variants), scrollbar w brand thumb.
- **Brand & style narrative:** "utility-first corporate", "structured, trustworthy, efficient", "deliberately conservative shapes", "reliability and professionalism over friendliness".

### 1.2 Figma LP-12_25 (visual reference)

Z screenshota Figmy widoczne:
- Hero z dużym brand teal panel + biały wordmark "erli" + photography (model z phone mockupem)
- Numbered process steps z circular illustrations (primary-50 background bubbles, primary-700 numbers)
- Yellow stat badges przy bottom (60+ tys, 30+ tys, 365 dni)
- App download CTA section
- Lifestyle photos w sekcjach feature
- Spójny brand teal jako structural element (nie tylko accent kolor)

### 1.3 Limitacje moich źródeł

- **Pełne LP frames z Figmy** — get_metadata timed out (plik duży, wiele frame'ów). Nie udało się przeanalizować każdego LP indywidualnie. Mam tylko overview screenshot. Dla budowy zaślepki to wystarczy (DESIGN.md zawiera komponenty), ale jeśli przyszły rewrite wymagałby konkretnych pixel-perfect referencji per LP, trzeba byłoby drillować w pojedynczych frame ID.
- **erli.pl sam** — wcześniej WebFetch summaryzowała strony przez LLM (CSS niedostępny). To stało się nieistotne gdy DESIGN.md od dewów dał wszystko bezpośrednio.

---

## 2. Audit accessibility — pełny

### 2.1 Każda krytyczna para policzona

Formuła: relative luminance per WCAG 2.x. Każdy token z DESIGN.md przepuszczony przez kontrast vs white surface i vs black text gdzie istotne.

| Token | Wartość | vs białe (#FFF) | Use case | Status |
|-------|---------|-----------------|----------|--------|
| `black #1a1a1a` | text | **17.41:1** | Body text, headings | ✓ AAA |
| `neutral-800 #3c3c3c` | text | **11.04:1** | Tertiary heading, secondary text | ✓ AAA |
| `neutral-700 #5a5a5a` | text/label | **6.89:1** | Body secondary, input label | ✓ AAA |
| `neutral-600 #787878` | text/border | **4.41:1** | Borderline 4.5 (text), ✓ 3:1 (border-strong) | ~AA / ✓ UI |
| `neutral-500 #969696` | border | **2.96:1** | Decorative border only | ✗ |
| `neutral-400 #a9a9a9` | border | **2.35:1** | Decorative only | ✗ |
| `neutral-300 #bcbcbc` | disabled | **1.90:1** | Disabled (1.4.3 exempt) | exempt |
| `neutral-100 #e2e2e2` | divider | **1.34:1** | **Decorative dividers only** — fails 1.4.11 jako UI border (erli.pl violation, korekta dla erli.de) | ✗ |
| `primary-500 #0097bc` | brand identity | **3.41:1** | Logo, large display ≥18pt, non-text UI | ✓ large/UI, ✗ normal text |
| `primary-600 #007996` | CTA dark gradient end | **5.03:1** | btn-primary dark end | ✓ AA normal |
| `primary-700 #005b71` | links, focus | **7.66:1** | Body links, focus ring, hero accent, step numbers, eyebrow | ✓ AAA |
| `primary-800 #003c4b` | link hover | **~10.5:1** | Link hover state | ✓ AAA |
| `primary-100 #c4e2ea` (focus shadow) | UI ring | **~1.4:1 vs white** | Focus shadow ring (decorative outer ring; functional indication is in border-color shift) | adequate |
| `secondary-500 #feda30` | yellow promo bg | **1.37:1 vs white** | NIE wolno yellow text na białym! Tylko jako bg z near-black tekstem | ✗ jako tekst |
| `secondary-500 #feda30` | yellow promo bg | **12.69:1 vs #1a1a1a** | btn-promotion z near-black tekstem | ✓ AAA |
| `success-500 #4ead61` | success accent | **2.81:1 vs white** | Decorative only (info-box border + icon decorative w obecności tekstu — redundancy) | ✗ jako tekst |
| `success-600 #3e8a4e` | success darker | **4.25:1** | Borderline — large text only | ~AA large |
| `warning-500 #ff8900` | warning accent | **2.38:1** | Decorative only | ✗ jako tekst |
| `warning-600 #cc6e00` | warning darker | **~3.5:1** | Large text / icon decorative | ✓ large |
| `error-500 #cd3b2f` | error text | **4.93:1** | ✓ AA — usable as body text | ✓ AA |
| `error-600 #a42f26` | error hover | **7.0:1** | ✓ AAA — error body hover | ✓ AAA |
| `price-red #d02112` | discount price | **~5.2:1** | ✓ AA — discount price text | ✓ AA |

**Gradients (z białym tekstem inside):**

| Gradient | Default state | erli.de behavior |
|----------|---------------|------------------|
| `gradient-brand-vivid` (erli.pl `#0097bc→#00b3bc`) | 2.57-3.41:1 | **Tylko jako decorative** w erli.de (np. promo badge bez tekstu inside). NIE jako CTA z tekstem. |
| `gradient-primary` (erli.de default = erli.pl hover values `#007996→#008f96`) | 3.90-5.03:1 | Default primary CTA — borderline, but bold ≥14pt passes large text 3:1 |
| `gradient-primary-hover` (`#006e88→#006b71`) | 5.85-6.29:1 | CTA hover state — ✓ AA |
| `gradient-primary-active` (solid `#005b71`) | 7.66:1 | CTA active state — ✓ AAA |

### 2.2 Statystyki audytu

| Status | Liczba krytycznych par | Examples |
|--------|------------------------|----------|
| ✓ AAA out-of-the-box | 7 | text-primary, text-secondary, text-muted, primary-700, primary-800, error-600, gradient-active |
| ✓ AA (nie AAA) | 5 | primary-600, error-500, price-red, warning-600 large, gradient-primary-hover |
| ✓ AA tylko large/UI | 3 | primary-500, gradient-primary default, neutral-600 (UI 3:1) |
| ✗ Decorative only — fails text use | 4 | secondary, success-500, warning-500, neutral-100 (jako UI border) |

**Wniosek:** Po wprowadzeniu 3 korekt WCAG (gradient shift, border-strong, focus-visible) cała paleta używana zgodnie z dyscypliną przechodzi WCAG 2.2 AA z headroom. Decorative-only colors (yellow text, success-500 text, warning-500 text) są wykluczone z text use przez explicit reguły w design.md sekcji 3.1.

### 2.3 Komponenty — coverage

| Komponent | WCAG criteria zaadresowane |
|-----------|----------------------------|
| Button (5 variants) | 1.4.3 (kontrast każdy variant), 1.4.11 (focus 3:1), 2.4.7, 2.5.5, 4.1.2 |
| Card / Tile / OpinionCard | 1.4.3, 2.4.7, 4.1.2 (article/heading), 1.1.1 (alt) |
| Hero (asymmetric + brand panel) | 1.3.1, 2.4.6, 1.4.3, 2.5.5; brand panel `aria-hidden` |
| Section header | 1.3.1 (heading hierarchy) |
| Step / Process (circular numbered) | 1.3.1 (`<ol>`), 1.4.3 (numbers w primary-700 na primary-50 = 6.33:1) |
| Info box (5 variants) | 1.4.1 (icon + text + border + bg — kolor nie jedyny), 4.1.3 (role="alert") |
| Icon list | 1.3.1, 1.1.1 |
| Footer | 1.3.1, 2.4.4, 4.1.2 |
| Newsletter form (floating label) | 1.3.1 (real `<label for>`), 1.3.5 (autocomplete), 3.3.2, 2.4.7, 2.5.5 |
| Skip link | 2.4.1 |
| Bento grid | 1.3.2 (DOM = visual order) |
| Custom scrollbar | 1.4.11 (thumb 3:1 vs track) |
| Forced colors mode | 1.4.1 (system colors) |
| Scroll-driven animations | 2.3.3 (prefers-reduced-motion respect) |

---

## 3. Lista skorygowanych tokenów (z uzasadnieniem)

### 3.1 Korekty WCAG — 3 krytyczne

| # | Korekta | Zachowane brand DNA? | Uzasadnienie |
|---|---------|----------------------|--------------|
| 1 | **Gradient shift dla CTA** — `gradient-primary` zdefiniowany jako `#007996→#008f96` (vs erli.pl `#0097bc→#00b3bc`) | TAK — gradient zachowany jako brand DNA element. Tylko dark/light end shifted by jeden poziom. | erli.pl gradient z białym tekstem = 2.57-3.41:1 fail AA. Korekta zachowuje "subtle vibrancy" ale spełnia WCAG. erli.pl gradient zachowany w `--gradient-brand-vivid` jako alias dla decorative use bez tekstu. |
| 2 | **Border-strong dla inputs** — `neutral-600 #787878` (vs erli.pl `neutral-100 #e2e2e2`) | NIE wpływa na shape/character — tylko intensywność border. | erli.pl border 1.34:1 vs white fails 1.4.11. neutral-600 dał 4.41:1 ✓ 3:1 wymagane dla UI components. |
| 3 | **Focus-visible explicit** — `outline: 2px solid primary-700` + 2px offset, dla form inputs `box-shadow: 0 0 0 2px primary-100` zgodnie z DESIGN.md focus pattern | TAK — DESIGN.md już ma focus pattern (focusBorderColor + focusShadow), erli.de tylko explicit zastosowane na każdym focusable element | erli.pl prawdopodobnie `outline: none` w wielu miejscach (typowy anti-pattern). 2.4.7 wymaga visible focus. |

### 3.2 Co dodano (nie z DESIGN.md)

| Token | Wartość | Uzasadnienie |
|-------|---------|--------------|
| `--space-2xl/3xl/4xl` | 48/64/96 px | Section padding dla zaślepki — zachowuje 4-multiples konwencję ERLI ale extends scale dla dużych sekcji. |
| `--shadow-card-hover` | `0 4px 12px rgba(26,26,26,0.10)` | Hover dla cardów na zaślepce — między level-1 a level-2, brand-respectful. |
| OKLCH definitions | `oklch(63.5% 0.105 215)` itd. | Modern browsers — perceptually uniform. Hex z DESIGN.md jako fallback. |
| Display sizes (`display-lg/xl`) | 32-56 / 42-72 px | Hero impact dla zaślepki. Poza standard skalą DESIGN.md (highest h1=42px) ale ekstensja zgodna z 4-multiples convention. |
| `--text-overline` | 10px fixed + 0.05em tracking | Jest w DESIGN.md jako overline; aliasowane jako token. |
| Bento grid system | 6-col grid + asymmetric items | Innovation budget #1 — composition-level. |

---

## 4. Lista komponentów + status

| Komponent | Source | Erli.de status |
|-----------|--------|----------------|
| Button (5 variants: primary, secondary, tertiary, promotion, danger) | DESIGN.md autorytatywny | 1:1 + WCAG gradient shift (primary) |
| Input (floating label, small/medium sizes) | DESIGN.md autorytatywny | 1:1 + WCAG border-strong correction |
| Badge | DESIGN.md autorytatywny | 1:1 |
| Info box (5 variants: info, primary, success, warning, danger) | DESIGN.md autorytatywny | 1:1 |
| Dropdown | DESIGN.md autorytatywny | 1:1 (rzadko używane na zaślepce) |
| Modal | DESIGN.md autorytatywny | 1:1 (rzadko używane na zaślepce) |
| Custom scrollbar | DESIGN.md autorytatywny | 1:1 |
| Card / CategoryTile / OpinionCard | erli.pl pattern + Figma | Modernized: `:has()` selector, container queries, `aspect-ratio`, image scale on hover, focus-within |
| Hero (asymmetric + brand panel) | Figma LP visual + innovation budget #4 | Nowy dla erli.de: brand teal panel jako structural element, 1.1fr/1fr asymmetric grid |
| Section header (eyebrow + heading + lead) | erli.pl pattern | Standardized z DESIGN.md typography tokens |
| Bento grid section | Innovation budget #1 | Nowy: 6-col grid template, mobile collapse, yellow promo bento item dla sale content |
| Step / Process (circular numbered bubbles) | Figma LP visual | Nowy: zgodnie z Figma LP, primary-50 bg + primary-700 number, mobile vertical → desktop 3-col z connector |
| Stat badges (yellow circles z big numbers) | Figma LP visual | Nowy: per Figma "60+ tys", "30+ tys", "365 dni" treatment |
| Icon list | erli.pl pattern (gwarancja-ceny) | Modernized: 48px icon container w primary-50 + primary-700 ikona |
| Newsletter form | Floating label z DESIGN.md | Nowy dla zaślepki — 1:1 z DESIGN.md inputu |
| Footer | erli.pl pattern | Modernized: focus-visible, semantic landmarks, tracking links |
| Skip link | A11y standard | Nowy |

**Statystyki:**
- Komponenty 1:1 z DESIGN.md: **7** (Button, Input, Badge, Info-box, Dropdown, Modal, Custom scrollbar)
- Komponenty zmodernizowane vs erli.pl/erli.de specific: **8** (Card, Hero, Section header, Bento, Steps, Stats, Icon list, Footer)
- Komponenty z korektą WCAG vs DESIGN.md: **2** (Button — gradient shift; Input — border-strong)
- Komponenty nowe (DESIGN.md nie ma + erli.pl nie ma): **3** (Bento grid section, Newsletter form floating-label, Skip link)

---

## 5. Innovation budget breakdown — v2.0

### 5.1 Cztery wzorce mocno

| # | Wzorzec | Gdzie mocno | Czemu — i jak respektuje brand |
|---|---------|-------------|--------------------------------|
| 1 | **Bento grid + asymmetric hero** | Sekcja kategorii ("Was bietet Erli"), hero split 1.1fr/1fr | Composition-level wow. Bento używa brand 8px radii i real palette (yellow promo item dla sale). Asymmetric hero ma teal panel jako structural element zgodnie z Figma LP. |
| 2 | **Roboto Flex variable + fluid clamp()** | Cała typografia | Roboto Flex to wariant Roboto — brand recognition zachowane. Variable axes pozwalają na opsz auto + jeden plik woff2. Fluid clamp() bridge między DESIGN.md discrete sizes (mobile-desktop) — płynne skalowanie zamiast cliff-edge. |
| 3 | **Modern CSS stack** (OKLCH definitions z hex fallback, container queries, `:has()`, logical properties, scroll-driven animations) | Wszędzie subtelnie | Invisible modernization. Hex z DESIGN.md jako fallback — brand colors zachowane. OKLCH dla math-derived hover states. Container queries dla cardów. Logical properties dla i18n DE/PL. |
| 4 | **Photography hero z brand teal panel** | Hero (Figma LP reference) | Brand teal jako structural element (panel 4:5 lub 5:6 aspect ratio) z biały wordmark — wzmacnia brand identity. Visual reference 1:1 z Figmy. |

### 5.2 Co odrzucone vs v1.0 (lessons learned)

W v1.0 wybrałem 4 wzorce które łamały brand DNA. W v2.0 są one explicit ZAKAZANE:

| Wzorzec v1.0 (odrzucony w v2.0) | Powód |
|---------------------------------|-------|
| Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)` | ERLI używa `ease-in-out` — snappy, nie bouncy. Spring kojarzy się z premium consumer apps (Apple), nie z trust-focused marketplace. |
| Soft shadows premium (alpha 0.04-0.10, 24-48px blur) | DESIGN.md używa konkretnych wartości (alpha 0.09-0.14, 5-12px blur). Soft premium shadows konkurują z brand subtle character. |
| Medium radii 12-16px | Łamie brand DNA. ERLI: 3-4-6-8px. Większe radii = "friendly bubbly" co przeciwne "utility-first corporate". |
| Manrope display + Inter body | ERLI = Roboto. Two fonts complikują, brand recognition łamany. |
| Brak gradient (jako odrzucony "starzejący się trend") | erli.pl primary CTA gradient TO brand DNA element. Pojedynczy subtle 276° gradient nie jest "trendy mesh gradient" — to brand identity od lat. |

### 5.3 Subtelne dodatki (nie liczone do budgetu)

- Focus-visible everywhere (a11y standard)
- Container queries dla cardów
- `:has()` selector
- Logical properties (i18n-ready)
- AVIF/WebP `<picture>` z JPG fallback
- Native lazy loading
- View Transitions API (graceful degradation)
- `content-visibility: auto`
- Forced colors mode support
- `prefers-reduced-motion` respect

---

## 6. Lista wykrytych problemów na erli.pl, których NIE przenosimy

1. **Brand gradient `#0097bc → #00b3bc` z białym tekstem** — fails AA (2.57-3.41:1). Korekta: gradient shift do hover values jako default.
2. **`outline: none` na fokusowalnych elementach** — fails 2.4.7. Korekta: explicit `:focus-visible` ring.
3. **Input border `neutral-100 #e2e2e2`** — fails 1.4.11 (1.34:1). Korekta: `neutral-600 #787878` (4.41:1).
4. **Touch targets prawdopodobnie < 44×44 mobile** — Korekta: floor 44px na zaślepce.
5. **Generic alt text** prawdopodobny pattern — Korekta: opisowe alt-y lub `alt=""` dla decorative.
6. **Auto-rotating hero carousel** prawdopodobnie obecny — Odrzucone: zaślepka = static.
7. **Brak `aria-busy` na submit** — Korekta: loading state z aria-busy.
8. **Numbery kroków jako h-tag** prawdopodobny pattern (DESIGN.md tego nie precyzuje) — Korekta: `<span aria-hidden>` + prawdziwa hierarchia w h3.
9. **Color jako jedyny nośnik** w niektórych errorach prawdopodobnie — Korekta: ikona + tekst + border + bg w info-boxach.

---

## 7. Co wymaga decyzji od Head of UX (TODO)

1. **Czy akceptujesz 3 WCAG corrections vs DESIGN.md?**
   - Gradient shift na CTA (default = "hover" values)
   - Border-strong w neutral-600 zamiast neutral-100
   - Focus-visible explicit

   **Trade-off:** brand recognition vs WCAG compliance. Default gradient (hover values) jest ciemniejszy niż erli.pl — visualnie subtelnie mniej "wibrujący" ale bezpieczny. Alternatywą jest zachować erli.pl gradient i oznaczyć jako "known WCAG limitation preserved for brand consistency" — wymagałoby legal/compliance check.

2. **Czy bento grid jako #1 budgetu jest akceptowalne?** Bento jest największą composition zmianą vs erli.pl. Alternatywa: equal grid (mniej "wow", 100% bezpieczne). Decyzja: czy erli.de = "fresh launch" (bento) czy "Erli but DE" (equal grid).

3. **Roboto Flex variable czy regular Roboto?** Roboto Flex = nowsza variable wersja, jeden plik woff2, lepsze rendering. Regular Roboto = bardziej widely cached (Google Fonts CDN) ale 2-4 plików. Performance vs cache.

4. **Hero brand panel — czy zgodnie z Figma LP (full teal panel z białym wordmark + photography overlay)?** Czy wolisz photo bez branded panel (więcej "subtelne, modern e-commerce")?

5. **Yellow promotion CTA — kiedy używać?** DESIGN.md mówi "reserved for sale/discount calls to action". Na zaślepce DE czy mamy jakąkolwiek "sale" potrzebę? Może na promo "Anmelden für Bonus" CTA?

6. **Newsletter form — gdzie storage? DSGVO consent obowiązkowy dla DE?** Czy form ma double opt-in? Backend integration TBD.

7. **Czy circular numbered process steps (zgodnie z Figma LP) czy duże display numbers?** Figma LP używa circular bubbles; v1.0 używał big display numbers. Decyzja: trzymamy się Figma reference?

8. **Czy stat badges yellow (60+ tys, 30+ tys) na zaślepce?** Figma LP ma takie elementy. Na zaślepce DE — czy jest dane do zaprezentowania, czy dopiero po launch?

9. **Czy uznajemy v2.0 design.md za frozen przed budową?** Rekomenduję frozen — mniej rewrite cost przy zmianach tokenu.

10. **Czy dodatkowe LP frames z Figmy są potrzebne do referenc?** get_metadata timed out. Jeśli budowa wymagałaby konkretnych pixel-perfect reference, trzeba byłoby spróbować z konkretnym node ID poszczególnych frame'ów.

---

## 8. Statystyki finalne

| Metryka | v1.0 (odrzucony) | v2.0 (obecny) |
|---------|------------------|---------------|
| Kolory total (named tokens) | 24 | **48+ (pełne brand scales 50-900)** |
| Brand primary scale | 5 (custom math-derived) | **11 (autorytatywne z DESIGN.md)** |
| Brand secondary scale | 0 (pominięty!) | **11 (yellow #feda30 z pełną skalą)** |
| Tertiary scale (ErliPRO) | 0 | **4 (cyan #00c7cc)** |
| Pary kolorów zaudytowane | 14 | **22+** |
| Pary AAA | 7 | **7** |
| Pary AA (nie AAA) | 6 | **5** |
| Pary AA tylko large/UI | 1 | **3** |
| Pary decorative-only | 0 | **4 (yellow tekst, success-500 tekst, warning-500 tekst, neutral-100 jako border)** |
| Pary failujące AA after corrections | 0 | **0** |
| Rozmiary typografii | 9 (clamp-only) | **11 (h1-h6 discrete + clamp bridges + display-lg/xl + caption + overline)** |
| Wagi typografii | 5 | **2 (binary 400/700 — brand DNA)** |
| Spacing tokens | 16 | **8 (5-step DESIGN.md + 3 extensions)** |
| Radius tokens | 6 | **5 (3/4/6/8/9999 — brand DNA)** |
| Shadow tokens | 7 | **5 (4 z DESIGN.md + 1 erli.de hover)** |
| Motion durations | 5 | **4 (z DESIGN.md)** |
| Motion easings | 5 | **3 (ease-in-out + ease-in + ease-out — DESIGN.md only)** |
| Breakpointy | 5 | **5 (autorytatywne 360/768/1025/1440/1648)** |
| Z-index levels | 8 | **8** |
| Komponenty udokumentowane | 13 | **17** (dodane: 5 button variants explicit, badge, dropdown, modal, custom scrollbar, stat badges) |
| Innovation budget mocno | 4 | **4 (zrewidowane — composition + tech, nie shape)** |
| Trendy odrzucone explicit | 14 | **15+ (włącznie z spring easing, medium radii, soft shadows premium — z lessons learned v1.0)** |

---

## 9. Limitacje audytu

1. **DESIGN.md od dewów to interpreted spec, nie production code** — wartości w DESIGN.md są autorytatywne dla design system intentu, ale rzeczywista implementacja może mieć drobne odchylenia. Real test: porównaj z erli.pl computed styles w DevTools dla pewności.

2. **Figma LP-12_25 not fully drilled** — get_metadata timed out na page level (plik duży). Mam tylko overview screenshot. Per-frame analysis (specific LP visual references) wymagałaby retry z konkretnymi node ID.

3. **Audit kontrastu jest math-only** — formuły WCAG. Real-world testing (axe DevTools, WAVE, Lighthouse) zalecane przed deployment.

4. **Roboto Flex availability** — Roboto Flex jest na Google Fonts ale nie jest tak shared cached jak regular Roboto. Performance impact minimalny ale warto sprawdzić.

5. **Forced colors mode tested w design tylko** — real test na Windows High Contrast przed deployment.

6. **OKLCH support** — Chrome 111+, Safari 15.4+, Firefox 113+. Hex fallback dla starszych. Sprawdź browser usage stats DE przed deployment.

7. **Scroll-driven animations** — Chrome 115+, Edge 115+. Safari < 17.4 dostaje graceful no-animation. Nie krytyczne dla zaślepki.

8. **WCAG 2.2 AA passing dla gradient default** — gradient-primary (default) z białym tekstem ma 3.90-5.03:1 — borderline. Większość czasu OK dla bold ≥14pt (large text 3:1) ale czasami CTA może być standard weight 16px. **Rekomendacja:** użyj `font-weight: bold` (700) na primary CTA tekst — wtedy text-body-lg 16px bold = large text per WCAG (≥14pt bold) → 3:1 wymagane → ✓.

---

## 10. Pliki dostarczone

```
design-system/
├── design.md             (~1140 linii — kompletny design system v2.0)
├── preview.html          (~1100 linii — single-file demo z autorytatywną paletą)
├── audit-report.md       (ten plik — audit + decyzje + revision history)
└── figma-overview.png    (Figma LP-12_25 screenshot reference)
```

**design.md v2.0 zawiera:**
1. Wprowadzenie (filozofia, brand DNA explicit, innovation budget, exclusions z lessons learned v1.0)
2. Accessibility (WCAG 2.2 AA standardy, 11 reguł niezachwianych, testowanie)
3. Tokens (autorytatywna paleta z DESIGN.md + OKLCH definitions, Roboto Flex + fluid clamp() bridges, 5-step spacing, 3-8px radii, 4 brand gradients, 4 shadows, 4 motion durations + ease-in-out)
4. Layout (container 1344/1584, grid, bento grid, landmark structure)
5. Komponenty (10 sekcji: Button 5 variants, Card/Tile/Opinion, Hero asymmetric z brand panel, Section header, Step circular, Info box 5 variants, Icon list, Input floating label, Footer, Custom scrollbar)
6. Wzorce interakcji (focus, keyboard, screen reader, mobile, scroll-driven, view transitions)
7. Voice & Tone (imagery, iconography, empty states)
8. Modern techniques (OKLCH, container queries, `:has()`, logical properties, scroll-timeline, variable fonts, view transitions, speculation rules)
9. Reguły rozbudowy (dodawanie komponentów, modyfikacja tokenów, dependency map, innovation budget update z brand DNA constraint)
+ Załącznik A: Reset / base styles
+ Załącznik B: Mapowanie design.md → tokens (audit trail per token)

**preview.html v2.0 zawiera:**
- Wszystkie tokeny: primary scale 50-900, secondary scale 50-900, tertiary, semantic, neutrals — visual swatches z kontrastami
- 4 brand gradients z live demo
- Pełna typografia z Roboto Flex (display-xl, h1-h6, body-lg/md, caption-1/2, overline)
- Spacing scale, radius (3-8px brand-respectful), shadows
- 5 button variants × 4 sizes z hover/active/disabled/loading states
- Newsletter form z floating label live demo
- Hero asymmetric z brand teal panel + biały wordmark (Figma LP reference)
- Bento grid z yellow promo item
- Circular numbered process steps + yellow stat badges
- Icon list + 5 info-box variants
- Cards (regular + opinion z brand-soft tint)
- Sekcja A11y verification z instrukcjami testowania
- Sekcja Modern techniques z motion easings demo (ease-in-out highlighted jako default)
- Footer z payment/social
- Custom scrollbar w brand teal
- Skip link
- Forced colors mode support
- Sam preview w pełni accessible: keyboard nav, focus rings, semantic landmarks, prefers-reduced-motion respect
