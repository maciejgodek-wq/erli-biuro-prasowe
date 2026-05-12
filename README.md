# erli.de – Preview

Zaślepka SEO erli.de dla rynku niemieckiego.
Wersja preview do review przez interesariuszy.

## Status

Proof of concept – treści i assets do uzupełnienia przed launchem.
Lista TODO: patrz `TODO.md`.

## Jak uruchomić lokalnie

```bash
python3 -m http.server 8000
# Otwórz http://localhost:8000
```

## Stack

- HTML5 + CSS + vanilla JS
- Hosting: Cloudflare Pages (auto-deploy z GitHub)
- Design system: `design-system/design.md`

## Deployment

Automatyczny – każdy push na `main` = redeploy na Cloudflare Pages.

**Repo:** https://github.com/maciejgodek-wq/erli-de-preview  
**Hosting:** Cloudflare Pages (spięty z powyższym repo, branch `main`)

### Każda zmiana

```bash
git add index.html assets/ *.html robots.txt sitemap.xml _headers
git commit -m "opis zmiany"
git push
```

Po pushu Cloudflare Pages automatycznie deployuje (ok. 1–2 min).

> Pliki strony są w **katalogu głównym repo**.  
> Nie commituj `briefs/`, `design-system/`, `prompts/` — to materiały robocze.

## Kontakt

Head of UX: [uzupełnić]
