# TODO - Erli.de Zaślepka v0.1.0

> Status: **Proof of concept ukończony.** Zaślepka SEO gotowa do deployu po uzupełnieniu poniższych pozycji.
> Audyt stanu kodu: 2026-05-12

---

## Techniczne - Dev/UX (przed deploymentem)

- [ ] Wygenerować brakujące pliki favicon: `favicon.ico` + `favicon-16x16.png` + `favicon-32x32.png`
      → źródło: `design-system/erli_logo.svg`; link tagi już w HTML; narzędzia: ImageMagick / rsvg-convert
- [ ] Utworzyć plik `_redirects` w root repo dla Cloudflare Pages
      → zawartość: `/* /404.html 404`
- [ ] GTM-XXXXXXX → zastąpić prawdziwym GTM ID we wszystkich 7 plikach HTML (21 wystąpień)
- [ ] Logo SVG erli.de — potwierdzenie finalnej wersji (aktualnie: `erli-logo.svg` z design-system)
- [ ] Decyzja UX/MKT: język w stopce (de/pl selector) — brief UX/MKT pkt 9
- [ ] Cookie banner UI (DSGVO: Ablehnen / Akzeptieren / Einstellungen) — po akceptacji Legal
      → struktura HTML do implementacji; logika w `cookie-consent.js` do napisania
- [ ] Backend lub Formspree endpoint dla formularza kontaktowego
      → aktualnie: mailto placeholder; scaffolding HTML w `kontakt.html` gotowy
- [ ] Performance CWV — finalna optymalizacja
- [ ] View Transitions API (smooth page transitions)
- [ ] Aktualizacja sitemap `lastmod` po każdej zmianie treści

---

## Marketing (assets i treści)

- [ ] OG image `og-image.jpg` (1200×630 px, max 5 MB) — do dostarczenia przez Marketing
      → meta tagi już wdrożone na 4 stronach; placeholder: `assets/img/og-image-PLACEHOLDER.txt`
- [x] OG image meta tagi — dodane na 4 indexowalnych stronach (index, faq, ueber-uns, kontakt)
- [ ] Hero photo — finalna sesja fotograficzna DE
      → zastąpić: `assets/img/hero-person.webp` + `hero-person-mobile.webp` (TEMP: z erli.pl)
- [ ] CTA-card — zastąpić `hero-pani.png` docelowym zdjęciem (6 wystąpień: index, faq, ueber-uns, kontakt, impressum, datenschutz)
- [ ] Zdjęcia kategorii — 13 szt. (Unsplash CC0 → brandowe)
      → `assets/img/cat-*.webp` (12 kategorii + moebel)
- [ ] `ueber-uns.html` - sekcja „Was ist Erli?": zastąpić `cat-elektronik.webp` docelowym zdjęciem od Marketingu
- [x] Favicon — `favicon.svg` + `apple-touch-icon.png` (180×180) + link tagi we wszystkich stronach
- [x] Email DE — `kontakt@erli.de` wdrożony w `/kontakt` (5 wystąpień)
- [ ] Native DE speaker review — 8 sekcji z `<!-- DRAFT -->` do walidacji:
      - Treści hero (H1, subtitle) — `index.html`
      - Opinie klientów (3× `index.html`, 2× `ueber-uns.html`) — UWG ryzyko!
      - Odpowiedzi FAQ (20 pytań) — `faq.html`
      - Treści /ueber-uns (Was ist Erli, Trust tiles, Wer steckt hinter Erli)
      - Treści /kontakt (page hero lead)
      - Sekcja "Zuverlässige Lieferung" — UWG ryzyko (decyzja Marketing/Legal)

---

## Legal (przed launchem)

- [ ] Treść Impressum od prawnika DE → podmienić placeholder w `/impressum`
      → draft podobno gotowy u Legalu (dane rejestrowe ERLI Deutschland GmbH)
      → ⚠️ ODR UE zamknięta VII 2025 — link usunięty; sekcja Verbraucherstreitbeilegung zostaje
- [ ] Treść Datenschutzerklärung od prawnika DE → podmienić placeholder w `/datenschutz`
      → uwzględnić: hosting, CDN, GA4, self-hosted fonts, Search Console
- [ ] Walidacja cookie bannera + Consent Mode v2 przez prawnika DE (DSGVO)
- [ ] IOD/DPO dane kontaktowe — do Impressum (DSGVO Art. 37)
      → wymaga potwierdzenia Legal czy Erli ma wyznaczonego IOD
- [ ] Email do Impressum — potwierdzić czy `kontakt@erli.de` to właściwy adres
- [ ] ⚠️ UWG ryzyko — sekcja opinii klientów (`index.html`, `ueber-uns.html`) — brak realnych opinii DE
      → decyzja Marketing/Legal: usunąć / zachować z disclaimerem / zastąpić opiniami z erli.pl
- [ ] ⚠️ UWG ryzyko — sekcja "Zuverlässige Lieferung" — brak infrastruktury logistycznej DE
      → decyzja Marketing/Legal przed deployem
- [ ] Review treści AI-generated (FAQ, USP) przez Legal przed publikacją

---

## DevOps (deployment)

- [ ] DNS: erli.de → Cloudflare Pages (EU routing dla DSGVO)
- [ ] Deployment pipeline: GitHub → auto deploy on push to main
- [ ] SSL: automatyczny przez Cloudflare
- [ ] Clean URL routing: `/faq` → `faq.html` (Cloudflare Pages: domyślnie OK — do weryfikacji)
- [ ] Potwierdzić EU region w ustawieniach projektu Cloudflare (DSGVO)
- [ ] GTM kontener dla erli.de (osobny od erli.pl) → zastąp `GTM-XXXXXXX`
- [ ] GA4 Measurement ID dla erli.de → skonfiguruj tag w GTM: Consent Initialized (analytics_storage=granted)
- [ ] Consent Mode v2 w GTM (docelowo zamiast hardkodowanego w HTML)
- [ ] Zweryfikuj domenę w Google Search Console
- [ ] Zweryfikuj domenę w Bing Webmaster Tools
- [ ] Submit `sitemap.xml` do GSC i Bing po aktywacji domeny

---

## Zrobione (reference)

- [x] OG image meta tagi — 4 indexowalne strony
- [x] Favicon SVG + apple-touch-icon.png + link tagi we wszystkich stronach
- [x] Email DE — `kontakt@erli.de` wdrożony w `/kontakt`
- [x] noindex,follow na `/impressum` i `/datenschutz`
- [x] Sitemap — 4 URL-e (tylko indexowalne strony)
- [x] Canonical tagi — wszystkie strony
- [x] Schema.org: Organization, FAQPage, AboutPage, ContactPage
- [x] Hamburger menu JS — `assets/js/nav.js` (ARIA + click-outside)
- [x] Möbel jako 13. kategoria w bento grid (`cat-moebel.webp`)
- [x] H1 FAQ zgodne z briefem: „FAQ zu Erli - hilfreiche Fragen und Antworten"
- [x] robots.txt — Disallow: /impressum, /datenschutz, /404

---

## Wersja

- v0.1.0-proof-of-concept — 2026-05-08
- Audyt TODO: 2026-05-12
- Etapy 1-4 SEO ukończone
- Brakuje: treści finalne DE, zdjęcia brandowe, Legal content, GTM/GA4 IDs, deployment
