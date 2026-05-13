# erli.de – Preview

Zaślepka SEO erli.de dla rynku niemieckiego.
Wersja preview do review przez interesariuszy.

## Status

Proof of concept – treści i assets do uzupełnienia przed launchem.
Lista TODO: patrz `TODO.md`.

## Jak uruchomić lokalnie

### Opcja 1: Node.js (zalecane dla Windows)

```bash
npx http-server -p 8000
# Otwórz http://localhost:8000
```

### Opcja 2: Python 3

```bash
python3 -m http.server 8000
# Otwórt http://localhost:8000
```

### Opcja 3: Python (Windows)

```bash
python -m http.server 8000
# Otwórz http://localhost:8000
```

**Uwaga:** Serwer działa na porcie 8000. Aby zatrzymać serwer, naciśnij `CTRL-C` w terminalu.

## Stack

- HTML5 + CSS + vanilla JS
- Hosting: Cloudflare Pages (auto-deploy z GitHub)
- Design system: `design-system/design.md`

## Deployment

### Automatyczny deployment (Cloudflare Pages)

Projekt jest skonfigurowany z automatycznym deploymentem na Cloudflare Pages. Każdy push na branch `main` wyzwala automatyczny redeploy.

**Repo:** https://github.com/maciejgodek-wq/erli-de-preview  
**Hosting:** Cloudflare Pages (spięty z powyższym repo, branch `main`)  
**URL produkcyjny:** [uzupełnić po deployu]

### Proces deploymentu

1. **Zatwierdź zmiany lokalnie:**
   ```bash
   git add <pliki>
   git commit -m "opis zmiany"
   ```

2. **Wypchnij na GitHub:**
   ```bash
   git push origin main
   ```

3. **Cloudflare Pages automatycznie:**
   - Pobiera zmiany z GitHub
   - Buduje stronę (static site)
   - Deployuje na produkcję
   - **Czas:** ok. 1–2 minuty

### Pliki do commitowania

```bash
git add index.html assets/ *.html robots.txt sitemap.xml _headers README.md
```

**Ważne:**
- Pliki strony są w **katalogu głównym repo**
- Nie commituj `briefs/`, `design-system/`, `prompts/` — to materiały robocze
- Sprawdź `.gitignore` przed commitowaniem nowych plików

### Monitorowanie deploymentu

- Sprawdź status deploymentu w panelu Cloudflare Pages
- Logi buildu są dostępne w dashboardzie Cloudflare
- Po udanym deployu strona jest dostępna natychmiast na URL produkcyjnym

## Kontakt

Head of UX: [uzupełnić]
