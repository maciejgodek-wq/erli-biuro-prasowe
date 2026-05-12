# erli.de – Preview

Zaślepka SEO erli.de dla rynku niemieckiego.
Wersja preview do review przez interesariuszy.

## Status

Proof of concept – treści i assets do uzupełnienia przed launchem.
Lista TODO: patrz `TODO.md`.

## Jak uruchomić lokalnie

```bash
cd erli-de/
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

### Pierwszy raz (jednorazowo)

```bash
cd "zaslepka ERLI de/erli-de-test"
git init
git remote add origin https://github.com/maciejgodek-wq/erli-de-preview.git
git add erli-de/
git commit -m "initial commit"
git push -u origin main
```

### Każda kolejna zmiana

```bash
git add erli-de/
git commit -m "opis zmiany"
git push
```

Po pushu Cloudflare Pages automatycznie pobiera zmiany i deployuje (ok. 1–2 min).

## Kontakt

Head of UX: [uzupełnić]
