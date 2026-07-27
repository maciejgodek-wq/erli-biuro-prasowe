# ERLI Design System v3.1 — Production Reference

> **Implementation Guide**  
> Referencja tokenów i komponentów w użyciu na biuroprasowe.erli.pl.

**Source of Truth:** `assets/css/` (tokens.css, base.css, layout.css, components.css, press.css)  
**Status:** ✅ Production Ready

---

## Quick Reference — What's Implemented

| Component | Class | HTML | CSS Lines | Status |
|-----------|-------|------|-----------|--------|
| **Colors** | `--color-*` (100+ vars) | N/A | tokens.css:46–365 | ✅ Complete |
| **Typography** | `--text-h1/h2`, `--font-display/body` | `<h1>`, `<p>` | tokens.css:147–177 | ✅ Complete |
| **Spacing** | `--space-xs` to `--space-4xl` | All elements | tokens.css:179–325 | ✅ Complete |
| **Buttons** | `.btn` + 4 variants, 4 sizes | `<button>`, `<a class="btn">` | components.css:12–58 | ✅ Complete |
| **Header** | `.site-header` (sticky) | `<header>` | components.css:64–134 | ✅ Complete |
| **Hero** | `.hero`, `.text-highlight` | Homepage `<section>` | components.css:180–343 | ✅ Complete |
| **Trust Cards** | `.trust-card`, `.trust-grid` | Homepage section | components.css:1086–1170 | ✅ Complete |
| **Reviews** | `.reviews-marquee`, `.review-card` | Homepage section | components.css:363–581 | ✅ Complete |
| **Categories** | `.cat-bento`, `.cat-grid-a/b` | Homepage section | components.css:584–1217 | ✅ Complete |
| **FAQ** | `.faq-item` (native `<details>`) | `/faq` page | components.css:726–793 | ✅ Complete |
| **CTA Section** | `.cta-card` (gradient panel) | Homepage + subpages | components.css:1243–1337 | ✅ Complete |
| **Forms** | `.form-input`, `.form-field` | `/kontakt` page | components.css:1456–1507 | ✅ Complete |
| **Footer** | `.site-footer` | All pages | components.css:887–991 | ✅ Complete |
| **Animations** | `@keyframes reveal-up`, `marquee-scroll` | Scroll-driven | components.css:997–1010 | ✅ Complete |

---

## 1. File Organization

```
erli-de/assets/css/
├── tokens.css       → All design tokens (colors, spacing, fonts, motion, z-index)
├── base.css         → Global reset, html/body, typography defaults, skip link
├── layout.css       → Container, grid utilities, visually-hidden
└── components.css   → All component classes (buttons, hero, cards, forms, etc.)
```

**Import order in HTML:**
```html
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/layout.css">
<link rel="stylesheet" href="/assets/css/components.css">
```

---

## 2. Design Tokens (tokens.css)

### Color System

**Brand Palette (Immutable from erli.pl)**
```
Primary (Teal-Blue):    #0097bc  (--color-primary-500)
Secondary (Golden):     #feda30  (--color-secondary-500)
Text (Black):           #1a1a1a  (--color-text-primary, 17.41:1 AAA on white)
```

**Surfaces (Semantic, layered)**
- `--color-surface-base`: #ffffff (default white)
- `--color-surface-soft`: #fafafa (subtle, review cards)
- `--color-surface-alt`: #f4f4f4 (secondary background)
- `--color-surface-brand`: #007996 (teal section, white text)
- `--color-surface-yellow`: #feda30 (promo section, black text)
- `--color-surface-inverse`: #1a1a1a (dark section, white text)

**Full Color Scale** → See `tokens.css:46–365` for all 100+ CSS custom properties.

### Typography

**Fonts** (self-hosted variable, DSGVO-safe)
```
--font-display: "Montserrat"   — Headings (weights 100–900)
--font-body:    "Roboto Flex"  — Body text (weights 100–1000)
```

**Fluid Heading Scale** (responsive, scales with viewport size)
```css
--text-h1: clamp(1.5rem,  1rem   + 2.5vw,  2.625rem);  /* 24–42px */
--text-h2: clamp(1.375rem, 1rem  + 1.875vw, 2rem);    /* 22–32px */
--text-h3: clamp(1.375rem, 1.125rem + 1.25vw, 1.75rem); /* 22–28px */
--text-h4: clamp(1.25rem, 1rem + 1.25vw, 1.5rem);     /* 20–24px */
--text-h5: clamp(1.125rem, 1rem + 0.625vw, 1.375rem);  /* 18–22px */
--text-h6: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);    /* 16–18px */
```

**Body Scale**
```css
--text-body-lg: clamp(0.875rem, 0.85rem + 0.125vw, 1rem);       /* 14–16px */
--text-body-md: clamp(0.8125rem, 0.8rem + 0.0625vw, 0.875rem);  /* 13–14px */
--text-caption-1: clamp(0.75rem, 0.74rem + 0.0625vw, 0.8125rem); /* 12–13px */
--text-caption-2: clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem);    /* 10–12px */
```

**Line Height**
- `--leading-heading: 1.35` (headings h1–h6)
- `--leading-body: 1.5` (paragraphs, body copy)
- `--leading-tight: 1.2` (compressed text, labels)

### Spacing Scale (4px grid)

```css
--space-xs: 4px      --space-1:  4px      --space-2:  8px
--space-sm: 8px      --space-3:  12px     --space-4:  16px
--space-md: 16px     --space-5:  20px     --space-6:  24px
--space-lg: 24px     --space-8:  32px     --space-10: 40px
--space-xl: 32px     --space-12: 48px     --space-16: 64px
--space-2xl: 48px    --space-20: 80px     --space-24: 96px
--space-3xl: 64px
--space-4xl: 96px
```

**Usage:** `padding: var(--space-lg);` or `gap: var(--space-4);`

### Radius (Not conservative, friendly modern curves)

```css
--radius-sm:   3px     (buttons, inputs)
--radius-md:   6px     (FAQ, form inputs)
--radius-lg:   8px     (small panels)
--radius-xl:   20px    (trust cards, categories, premium cards)
--radius-2xl:  28px    (CTA panels, large sections)
--radius-3xl:  40px    (hero sections)
--radius-full: 9999px  (pills, avatars, badges)
```

### Shadows (Multi-layer depth)

```css
--shadow-level-1: 0 2px 5px 0 rgba(26, 26, 26, 0.09);        /* Subtle header */
--shadow-level-2: -4px 4px 12px 0 rgba(26, 26, 26, 0.12);    /* Dropdown, hover */
--shadow-level-3: 0 2px 7px 2px rgba(26, 26, 26, 0.14);      /* Modal, floating */
--shadow-card-hover: 0 4px 12px 0 rgba(26, 26, 26, 0.10);    /* Card on hover */
```

### Motion (Snappy, respectful)

```css
--duration-fast:    100ms    (micro-interactions)
--duration-default: 150ms    (standard transitions)
--duration-medium:  200ms    (reveals)
--duration-slow:    250ms    (slower animations)

--ease-default: ease-in-out
--motion-default:  150ms ease-in-out
--motion-medium:   200ms ease-in-out
```

**Respects prefers-reduced-motion:** All animations disabled for users who prefer reduced motion.

### Breakpoints (Use in media queries)

```css
@media (max-width: 480px) { }    /* Mobile nav hidden */
@media (max-width: 640px) { }    /* Mobile grid (2 cols) */
@media (max-width: 768px) { }    /* Tablet layout (flex column) */
@media (min-width: 1025px) { }   /* Desktop layout (multi-col grids) */
```

**Container Widths**
- `--max-content-width`: 1344px (standard max width)
- `--max-wide-content-width`: 1584px (wider sections)

---

## 3. Components (Production)

### Buttons (`.btn`)

**Base:** All buttons use `.btn` class

**Variants** (color schemes)
```html
<button class="btn btn--primary">Primary (gradient teal)</button>
<button class="btn btn--secondary">Secondary (white + teal border)</button>
<button class="btn btn--tertiary">Tertiary (transparent + underline)</button>
<button class="btn btn--promotion">Promotion (yellow + black text)</button>
```

**Sizes** (height + padding)
```html
<button class="btn btn--primary btn--large">Large (52px)</button>
<button class="btn btn--primary btn--medium">Medium (44px)</button>
<button class="btn btn--primary btn--small">Small (36px)</button>
<button class="btn btn--primary btn--extra-small">XS (32px)</button>
```

**States**
- `:hover` → darker color/shadow
- `:active` → even darker
- `:focus-visible` → primary-700 outline
- `:disabled` → gray text + gray background

---

### Header (`.site-header`)

**Features**
- Sticky positioning (stays at top on scroll)
- Backdrop blur (blurred white background on scroll)
- Logo + navigation
- Automatically adds shadow when scrolled

**HTML**
```html
<header role="banner" class="site-header">
  <div class="container site-header__inner">
    <a href="/" class="site-header__logo">
      <img src="/assets/img/erli-logo.svg" alt="Erli">
    </a>
    <nav aria-label="Nawigacja główna">
      <ul class="site-header__nav">
        <li><a href="/o-nas">O nas</a></li>
        <li><a href="/kontakt">Kontakt</a></li>
        <li><a href="/aktualnosci">Aktualności</a></li>
      </ul>
    </nav>
  </div>
</header>
```

**Note:** Navigation hidden on mobile (480px), uses JS for menu toggle.

---

### Text Highlight (`.text-highlight`)

**Base Variant** (yellow underline)
```html
<h1>Biuro prasowe <span class="text-highlight">ERLI</span></h1>
```

**Box Variant** (full yellow background)
```html
<h1>Biuro prasowe<br>
    <em class="text-highlight text-highlight--box">ERLI</em>
</h1>
```

**CSS Variables** (customizable per context)
```css
--highlight-yellow: #feda30      (background color)
--highlight-offset: -0.05em      (vertical position)
--highlight-height: 0.5em        (height of underline)
--highlight-skew: 0deg           (skew angle)
```

---

### Hero Section (`.hero`)

**Components**
- `.hero__panel` — Text column (title, subtitle, CTA, stats)
- `.hero__badge` — Small badge with pulsing dot
- `.hero__title` — Main headline with text-highlight
- `.hero__subtitle` — Subtitle text
- `.hero__stats` — Stats row (values + dividers)
- `.hero__photo` — Person/product image (right side, desktop only)

**HTML**
```html
<section class="hero">
  <div class="hero__inner">
    <div class="hero__panel">
      <span class="hero__badge">
        <span class="hero__badge-dot"></span>
        Komunikaty prasowe
      </span>
      <h1 class="hero__title">
        Biuro prasowe<br>
        <em class="text-highlight text-highlight--box">ERLI</em>
      </h1>
      <p class="hero__subtitle">Informacje dla mediów w jednym miejscu.</p>
      <a href="/o-nas" class="btn btn--promotion btn--medium hero__cta">
        Dowiedz się więcej
      </a>
    </div>
    <div class="hero__photo">
      <img src="/assets/img/hero-pani.png" alt="" class="hero__photo-img">
    </div>
  </div>
</section>
```

**Responsive**
- Desktop: Flex row (text left, photo right)
- Tablet/Mobile: Flex column (text centered, photo smaller or hidden)

---

### Trust Section (`.trust-card`, `.trust-grid`)

**Layout** — Grid of 4 cards (floats 50% over hero)

**Card Structure**
```html
<section class="section trust-section">
  <ul class="trust-grid">
    <li class="trust-card">
      <div class="trust-card__icon">
        <svg>...</svg>
      </div>
      <h3 class="trust-card__title">Biuro prasowe</h3>
      <p class="trust-card__text">Wszystko w jednym miejscu...</p>
    </li>
    <!-- Repeat × 4 -->
  </ul>
</section>
```

**Styling**
- White background, rounded corners (radius-xl: 20px)
- Multi-layer shadow
- Hovers up 4px on mouse over
- Icons are brand-primary color

**Responsive**
- Desktop: 4 columns
- Tablet (1024px): 2 columns
- Mobile (540px): 1 column

---

### Reviews Section (`.reviews-marquee`, `.review-card`)

**Features**
- Horizontal scrolling marquee (320 second loop)
- Pause button (WCAG 2.2.2)
- Star ratings
- 6-color avatar palette (rotated per card)

**HTML**
```html
<section class="reviews-section">
  <div class="container">
    <header class="section-header">...</header>
    
    <div class="reviews-marquee">
      <button class="reviews-marquee__pause">⏸ Pause</button>
      <div class="reviews-marquee__row">
        <div class="reviews-marquee__track">
          <li class="review-card">
            <p class="review-card__text">Great experience...</p>
            <p class="review-card__stars">★★★★★</p>
            <div class="review-card__author">
              <div class="review-card__avatar">JD</div>
              <div>
                <p class="review-card__name">John Doe</p>
                <p class="review-card__role">Verified Buyer</p>
              </div>
            </div>
          </li>
          <!-- Repeat × 20+ -->
        </div>
      </div>
    </div>
    
    <div class="reviews-figures">
      <div class="reviews-figure">
        <span class="reviews-figure__value">4.9</span>
        <span class="reviews-figure__label">Rating</span>
      </div>
      <!-- More figures -->
    </div>
  </div>
</section>
```

**Avatar Colors** (cycling through 6)
- Teal, Yellow, Dark Cyan, Green, Red, Darkest Teal
- All ≥4.5:1 contrast ratio (AA minimum)

**Animation**
- Marquee scrolls infinitely at 320 seconds per loop
- Pauses on hover/focus
- On mobile: 50 second loop
- Respects prefers-reduced-motion (fallback to scroll-snap)

---

### Categories Section (`.cat-bento`, `.cat-grid-a`, `.cat-grid-b`)

**3 Layout Options**

**Option A: Bento Grid (Asymmetric)**
```html
<ul class="cat-bento">
  <li class="cat-bento__item cat-bento__item--tall">
    <article class="cat-bento-card">
      <img src="..." alt="..." class="cat-bento-card__img">
      <div class="cat-bento-card__overlay"></div>
      <div class="cat-bento-card__content">
        <h3 class="cat-bento-card__name">Elektronik</h3>
      </div>
    </article>
  </li>
  <!-- Mix of tall and regular items -->
</ul>
```

**Option B: Icon Tiles (Grid A)**
```html
<ul class="cat-grid-a">
  <li class="cat-tile-a">
    <div class="cat-tile-a__icon-wrap">
      <svg>...</svg>
    </div>
    <h3 class="cat-tile-a__name">Dom i Ogród</h3>
  </li>
  <!-- Repeat × 4+ -->
</ul>
```

**Option C: Photo Overlay (Grid B)**
```html
<ul class="cat-grid-b">
  <li class="cat-tile-b">
    <img src="..." alt="..." class="cat-tile-b__bg">
    <div class="cat-tile-b__overlay"></div>
    <h3 class="cat-tile-b__label">Elektronik</h3>
  </li>
  <!-- Repeat × 4+ -->
</ul>
```

**Responsive**
- Desktop: 4 columns
- Tablet (1024px): 3 columns
- Mobile (640px): 2 columns

---

### FAQ Section (`.faq-item`)

**Native HTML Details/Summary**
```html
<div class="faq-list">
  <details class="faq-item">
    <summary>
      <h2>Czym jest ERLI?</h2>
    </summary>
    <p>ERLI to druga co do wielkości platforma marketplace w Polsce.</p>
  </details>
  <!-- Repeat for each FAQ -->
</div>
```

**Features**
- Native expand/collapse (no JS needed)
- Chevron rotates 180° on open
- Smooth height animation (Chrome 129+, Firefox 137+)
- WCAG accessible
- Fallback to instant expand on older browsers

**Styling**
- Blue border on hover/open
- Heading style overridden to body size inside summary
- Padding: space-6 (24px)

---

### CTA Section (`.cta-card`)

**Full-width gradient panel with floating image**

**HTML**
```html
<section class="cta-section">
  <div class="container">
    <div class="cta-card">
      <div class="cta-card__content">
        <h2 class="cta-card__title">Ready to Shop?</h2>
        <p class="cta-card__text">Discover millions of products at great prices.</p>
        <a href="/o-nas" class="btn btn--promotion cta-card__btn">
          Get Started
        </a>
      </div>
      <div class="cta-card__visual">
        <img src="/assets/img/..." alt="" class="cta-card__photo">
      </div>
    </div>
  </div>
</section>
```

**Styling**
- Gradient background (same as hero)
- Circle.svg overlay (opacity 0.35)
- 2-column grid (text left, image right)
- Animated background position (12 second loop)

**Responsive**
- Desktop: Grid 1.2fr 1fr (text + image side-by-side)
- Mobile (768px): Single column, image hidden

---

### Forms (`.form-input`, `.form-field`)

**Input Field**
```html
<div class="form-field">
  <label for="name" class="form-label">Name</label>
  <input type="text" id="name" class="form-input" required>
</div>
```

**Textarea**
```html
<div class="form-field">
  <label for="message" class="form-label">Message</label>
  <textarea id="message" class="form-textarea" rows="6"></textarea>
</div>
```

**Checkbox**
```html
<div class="form-field form-field--checkbox">
  <input type="checkbox" id="agree" class="form-checkbox">
  <label for="agree" class="form-label form-label--checkbox">
    I agree to terms
  </label>
</div>
```

**States**
- `:focus-visible` → primary-600 border + shadow-focus
- `.is-invalid` → error-500 border + shadow-focus-error
- `:disabled` → neutral-300 text, neutral-75 background

**Styling**
- Min-height: 44px (touch target)
- Radius: radius-sm (3px, conservative on inputs)
- Border: neutral-600 (AA contrast)

---

### Footer (`.site-footer`)

**2-Column Layout** (branding left, links right)

**HTML**
```html
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <a href="/" class="site-footer__logo">
          <img src="..." alt="Erli">
        </a>
        <p class="site-footer__tagline">Biuro prasowe...</p>
      </div>
      <nav class="site-footer__nav">
        <h3 class="site-footer__nav-heading">Nawigacja</h3>
        <a href="/o-nas">O nas</a>
        <a href="/kontakt">Kontakt</a>
        <!-- kolejne pozycje -->
      </nav>
    </div>
    
    <div class="site-footer__bottom">
      <p>&copy; 2026 ERLI</p>
      <div>
        <a href="/kontakt">Kontakt dla mediów</a>
      </div>
    </div>
  </div>
</footer>
```

**Responsive**
- Desktop: 2-column grid (1.5fr 1fr)
- Mobile (768px): 1-column stack

---

## 4. Section Variants (Color Themes)

**Apply to any section** to change background + text colors:

```html
<!-- Default: white background -->
<section class="section">...</section>

<!-- Light gray background -->
<section class="section section--alt">...</section>

<!-- Ultra-soft gray (subtle) -->
<section class="section section--soft">...</section>

<!-- Brand teal (white text) -->
<section class="section section--brand">
  <h2>White text on teal</h2>
  <p style="color: white;">All text becomes white</p>
</section>

<!-- Golden yellow (black text) -->
<section class="section section--yellow">
  <h2>Black text on yellow</h2>
  <button class="btn btn--primary">Black CTA on yellow</button>
</section>

<!-- Dark inverse (white text) -->
<section class="section section--inverse">
  <h2>White text on dark</h2>
</section>
```

---

## 5. Animations

### Scroll-Driven Reveal (`.animate-reveal`)

**HTML**
```html
<section class="section animate-reveal">
  Content fades in as user scrolls down
</section>
```

**Behavior**
- Opacity: 0 → 1
- Transform: translateY(40px) → 0
- Duration: 0.7s
- Triggered: When element enters 35% of viewport height

**Browser Support**
- Chrome 115+, Firefox 115+
- Graceful fallback: Content visible instantly on older browsers

### Marquee Animation (Reviews)

**Duration:** 320 seconds (full loop)  
**Direction:** LTR + RTL (alternate rows)  
**Responsive:** 50 seconds on mobile  
**Controls:** Pause button, hover-pause, focus-pause  
**Reduced Motion:** Fallback to scroll-snap on old browsers

### Other Animations

- **Hero Badge:** Pulsing dot (2 second cycle)
- **Hero Photo:** Slide-right entrance (0.4s)
- **CTA Gradient:** Subtle background shift (12s loop)
- **Card Hover:** Scale + shadow (250ms)
- **FAQ Toggle:** Chevron rotate + height expand (150–200ms)

---

## 6. Accessibility (WCAG 2.2 AA+)

### Color Contrast

| Text | Background | Ratio | Level |
|------|-----------|-------|-------|
| Black (#1a1a1a) | White | 17.41:1 | AAA |
| #3c3c3c | White | ~10:1 | AAA |
| #5a5a5a | White | 6.3:1 | AA |
| White | Teal (#007996) | 5.03:1 | AA |
| Black | Yellow (#feda30) | 12.69:1 | AAA |
| All avatars | (6 colors) | ≥4.5:1 | AA minimum |

### Interactive Elements

- All buttons/links: min-height 44px (touch target)
- Focus visible: 2px outline, 2px offset (primary-700)
- Skip link: Visible on Tab press
- Form labels: Associated via `<label for="id">`
- Validation: Error borders + messages

### Motion

- Respects `prefers-reduced-motion`
- All animations disabled if user preference set
- Marquee falls back to scrollable on reduced motion

### Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- `<button>` for actions, `<a>` for navigation
- `<details>`/`<summary>` for FAQ (native accessibility)
- ARIA labels where needed (marquee pause button, icons)
- Language attributes: `<html lang="de">`

---

## 7. Performance & Modern CSS

### Features Used

- **Variable Fonts** (Montserrat, Roboto Flex) — single file per font
- **OKLCH Colors** (@supports fallback to hex)
- **Fluid Typography** (clamp) — responsive scaling
- **CSS Grid & Flexbox** — Layout
- **Backdrop-filter blur** — Sticky header
- **Scroll-driven animations** (@supports fallback)
- **Details-content smooth height** (@supports fallback)
- **Logical Properties** (inset-inline, padding-block, etc.)

### Browser Support

- **Modern Browsers** (Chrome, Firefox, Safari, Edge latest) — Full support
- **Older Browsers** — Graceful degradation via @supports
- **Reduced Motion** — Respected, animations disabled
- **No JS Required** — CSS-only for most components (except header nav menu)

---

## 8. How to Extend

### Adding a New Color

1. **Define in tokens.css:**
   ```css
   :root {
     --color-my-new: #abc123;
   }
   ```

2. **Use in components.css:**
   ```css
   .my-component {
     background: var(--color-my-new);
   }
   ```

### Adding a New Component

1. **Write CSS in components.css** (follow BEM: `.component__element--modifier`)
2. **Test at breakpoints** (480px, 768px, 1024px+)
3. **Check contrast** (WCAG AA minimum for text)
4. **Use motion variables** (`--motion-default` for transitions)
5. **Update this doc** (add to section 3)

### Modifying Existing Component

1. Find CSS in components.css (search filename or class name)
2. Edit styles directly
3. Test in browser (Chrome DevTools)
4. Verify all breakpoints still work
5. Check focus states (keyboard navigation)

---

## 9. File Size & Performance

| File | Size | Purpose |
|------|------|---------|
| tokens.css | ~25 KB | Colors, spacing, fonts, motion (used by all) |
| base.css | ~8 KB | Reset, skip link, typography defaults |
| layout.css | ~3 KB | Container, grid, utilities |
| components.css | ~45 KB | All components, animations, layouts |
| **Total CSS** | ~81 KB | (minified & gzipped: ~12 KB) |
| Fonts (woff2) | ~150 KB | Montserrat + Roboto Flex (self-hosted) |

All CSS is minified in production. Images are WebP optimized.

---

## 10. Contacts & Questions

**Design System Owner:** Maciej Godek (maciej.godek@erli.pl)  
**Frontend Repo:** `erli-de-test` (this folder)  
**Design Reference:** Figma project (if available)  

Last updated **2026-05-12**. For changes, create a commit in the design-system folder.
