# TODO – Erli.de Zaślepka v0.1.0

> Status: **Proof of concept ukończony.** Zaślepka SEO gotowa do deployu po uzupełnieniu poniższych pozycji.

---

## SEO / Analytics

- [ ] Stwórz kontener GTM dla erli.de (osobny od erli.pl)
      → zastąp `GTM-XXXXXXX` we wszystkich 7 plikach HTML + assets/js/analytics-config.js
- [ ] Stwórz usługę GA4 dla erli.de (osobna propertyność od erli.pl)
      → w GTM skonfiguruj tag GA4 z Measurement ID `G-XXXXXXXXXX`
      → Trigger: Consent Initialized — analytics_storage = granted
- [ ] Skonfiguruj Consent Mode v2 w GTM (docelowo zamiast hardkodowanego w HTML)
- [ ] Zweryfikuj domenę w Google Search Console: https://search.google.com/search-console
- [ ] Zweryfikuj domenę w Bing Webmaster Tools: https://www.bing.com/webmasters
- [ ] Submit sitemap.xml do GSC i Bing: https://erli.de/sitemap.xml
- [ ] Sprawdź schema.org validator: https://validator.schema.org/
      → strony: /, /faq (FAQPage), /ueber-uns (AboutPage), /kontakt (ContactPage)

---

## Marketing / Brand

- [x] OG image meta tagi — dodane na 4 indexowalnych stronach (index, faq, ueber-uns, kontakt)
      → plik `/assets/img/og-image.jpg` (1200×630 px, max 5 MB) do dostarczenia przez Marketing
      → placeholder: `assets/img/og-image-PLACEHOLDER.txt`
- [ ] Hero photo — finalna sesja fotograficzna DE
      → zastąpić: `assets/img/hero-person.webp` + `hero-person-mobile.webp` (TEMP: z erli.pl)
- [ ] Zdjęcia kategorii — 13 szt. (Unsplash CC0 zastąpić brandowymi)
      → `assets/img/cat-*.webp` (12 kategorii + moebel)
- [ ] `ueber-uns.html` – sekcja „Was ist Erli?": zastąpić placeholder `cat-elektronik.webp` docelowym zdjęciem od Marketingu
- [ ] `index.html` + `ueber-uns.html` – CTA-card (dolna sekcja): zastąpić `hero-pani.png` docelowym zdjęciem od Marketingu
- [x] Favicon — `favicon.svg` + `apple-touch-icon.png` (180×180) + link tagi dla ico/16/32 dodane we wszystkich stronach
      → `apple-touch-icon.png` = placeholder #0097BC; zastąpić rasterem z `favicon.svg` gdy będzie Inkscape/ImageMagick
- [ ] Favicon pliki do wygenerowania: `favicon.ico` + `favicon-16x16.png` + `favicon-32x32.png`
      → wygenerować z `design-system/erli_logo.svg` przed deploymentem
      → narzędzia: ImageMagick (`convert`) lub rsvg-convert; link tagi już w HTML
- [ ] Logo SVG erli.de — potwierdzenie finalnej wersji (aktualnie: erli_logo.svg z design-system)
- [x] Email DE finalny — `kontakt@erli.de` wdrożony w `/kontakt` (podmieniony z `info@erli.de`)
- [ ] Decyzja: język w stopce (de/pl selector) — brief UX/MKT pkt 9

---

## Legal

- [ ] Treść Impressum od prawnika DE → podmienić placeholder w `/impressum`
      → draft podobno gotowy u Legalu (dane rejestrowe ERLI Deutschland GmbH)
      → generator backup: eRecht24 lub IT-Recht Kanzlei (TMG §5)
      → ⚠️ platforma ODR UE zamknięta VII 2025 — link do ec.europa.eu/consumers/odr/ usunięty z kodu
      → zostaje: sekcja Verbraucherstreitbeilegung (obowiązek informacyjny bez linku ODR)
- [ ] Treść Datenschutzerklärung od prawnika DE → podmienić placeholder w `/datenschutz`
      → uwzględnić: hosting, CDN, GA4 (po aktywacji), self-hosted fonts, Search Console
      → decyzja blokerująca: lista technologii TAK/NIE (brief Legal sekcja 4 — tabela do odesłania)
- [ ] Walidacja cookie bannera + Consent Mode v2 przez prawnika DE (DSGVO)
      → cookie-consent.js zostanie zaimplementowany w Etap 4 po akceptacji Legal
- [ ] Akceptacja checkboxa DSGVO w formularzu `/kontakt` (weryfikacja prawna UWG) — na razie N/A (brak formularza)
- [ ] Backend lub Formspree endpoint dla formularza kontaktowego
      → aktualnie: mailto placeholder (Opcja D zastąpiona — `contact-form.js` nieużywany)
      → TODO: zaimplementować formularz po launchu i podłączyć endpoint
- [ ] IOD/DPO dane kontaktowe — do Impressum (DSGVO Art. 37)
      → wymaga potwierdzenia Legal czy Erli ma wyznaczonego IOD
- [ ] Email DE dedykowany (lub decyzja o użyciu PL)
      → kontakt@erli.de wdrożony w /kontakt — potwierdzić czy ten sam do Impressum
- [ ] ⚠️ UWG ryzyko — sekcja opinii klientów (index.html, ueber-uns.html) — brak realnych opinii DE
      → decyzja Marketing/Legal: usunąć / zachować z disclaimerem / zastąpić opiniami z erli.pl
- [ ] ⚠️ UWG ryzyko — sekcja "Zuverlässige Lieferung" — brak infrastruktury logistycznej DE
      → decyzja Marketing/Legal przed deployem
- [ ] Review treści AI-generated (FAQ, USP) przez Legal przed publikacją
      → brief Legal: "rekomendowany przynajmniej pobieżny przegląd"

---

## Copywriting DE (native speaker)

Wszystkie teksty oznaczone `<!-- DRAFT: do walidacji native DE speaker -->` wymagają review:

- [ ] Treści hero (H1, subtitle) — `index.html`
- [ ] Opinie klientów (3 × `index.html`, 2 × `ueber-uns.html`) — UWG ryzyko!
- [ ] Odpowiedzi FAQ (20 pytań) — `faq.html`
- [ ] Treści /ueber-uns (Was ist Erli, Trust tiles, Wer steckt hinter Erli)
- [ ] Treści /kontakt (page hero lead)
- [ ] Sekcja "Zuverlässige Lieferung" — UWG ryzyko (decyzja Marketing/Legal)

---

## DevOps

- [ ] DNS: erli.de → Cloudflare Pages / Vercel (EU routing dla DSGVO)
- [ ] Hosting deployment pipeline (GitHub → auto deploy on push to main)
- [ ] SSL: automatyczny przez hosting (Let's Encrypt / Cloudflare)
- [ ] Clean URL routing: `/faq` → `faq.html` (Cloudflare Pages: domyślnie OK)
- [ ] Custom 404 page routing: konfiguracja w `_redirects` (Cloudflare Pages)
      → dodaj plik `_redirects` w root repo: `/* /404.html 404`
- [ ] EU region potwierdzić w ustawieniach projektu (DSGVO)

---

## Etap 4 (do zaimplementowania)

- [ ] Cookie banner UI (DSGVO compliant: Ablehnen / Akzeptieren / Einstellungen)
      → `cookie-consent.js` logika gotowa, HTML do implementacji
- [ ] GA4 implementacja po aktywacji Consent Mode (po cookie banneru)
- [ ] Performance CWV finalna optymalizacja
- [ ] View Transitions API (smooth page transitions)
- [ ] Aktualizacja sitemap lastmod po każdej zmianie

---

## Wersja

- v0.1.0-proof-of-concept — 2026-05-08
- Etapy 1–4 SEO ukończone
- Brakuje: treści finalne DE, zdjęcia brandowe, Legal content, GTM/GA4 IDs, deployment
