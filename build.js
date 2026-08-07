// build.js
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

import { loadPosts } from './build/posts.js';
import { parseFrontmatter } from './build/frontmatter.js';
import { render } from './build/template.js';
import { renderMarkdown, plainText, podniesNaglowki } from './build/markdown.js';
import { buildCss } from './build/css.js';
import { assertNoGerman } from './build/lang-guard.js';
import { assertNoMissingImages } from './build/image-guard.js';
import { assertNoMissingRedirectTargets } from './build/redirect-guard.js';
import { buildSitemap, buildRobots, DOMENA } from './build/seo.js';
import { buildRedirectMap, toHtaccess, toNginx, toCsv, toCloudflare } from './build/redirects.js';
import { paginate } from './build/paginate.js';
import {
  KATEGORIE, navFlags, decoratePost, powiazaneDo, leadDublujeTresc,
  articleSchema, organizationSchema,
} from './build/render.js';

const ROK = '2026';
const DIST = 'dist';

/** Wczytuje wszystkie szablony i partiale z dysku. */
async function loadTemplates() {
  const czytaj = async (dir) => {
    const wpisy = {};
    for (const plik of await readdir(dir)) {
      if (plik.endsWith('.html')) {
        wpisy[plik.replace('.html', '')] = await readFile(join(dir, plik), 'utf8');
      }
    }
    return wpisy;
  };
  return {
    templates: await czytaj('src/templates'),
    partials: await czytaj('src/partials'),
  };
}

/** Sklada strone: tresc w szablonie wewnetrznym, calosc w base. */
function skladaj({ templates, partials }, nazwaSzablonu, kontekst) {
  const wspolne = { rok: ROK, ...navFlags(kontekst.url), ...kontekst };
  const tresc = render(templates[nazwaSzablonu], wspolne, partials);
  return render(templates.base, { ...wspolne, tresc }, partials);
}

/** Zapisuje plik, tworzac po drodze brakujace katalogi. */
async function zapisz(sciezka, zawartosc) {
  await mkdir(dirname(sciezka), { recursive: true });
  await writeFile(sciezka, zawartosc, 'utf8');
}

async function build() {
  console.log('Budowanie...');

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // --- treść ---
  const aktualnosci = existsSync('src/posts/aktualnosci')
    ? await loadPosts('src/posts/aktualnosci', 'aktualnosci')
    : [];
  const media = existsSync('src/posts/media')
    ? await loadPosts('src/posts/media', 'media-o-erli')
    : [];

  const wszystkie = [...aktualnosci, ...media]
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .map(decoratePost);

  console.log(`  ${aktualnosci.length} aktualnosci, ${media.length} media o ERLI`);

  const tpl = await loadTemplates();
  const strony = [];
  const doSitemap = [];

  const dodaj = (sciezkaUrl, html, lastmod, priority) => {
    const plik = sciezkaUrl === '/' ? 'index.html' : `${sciezkaUrl.slice(1, -1)}/index.html`;
    strony.push({ sciezka: plik, html });
    doSitemap.push({ url: sciezkaUrl, lastmod, priority });
  };

  // --- strona główna ---
  // Najnowszy artykul jest wyrozniony (szeroka karta na szarym pasie),
  // pozostale ida jeden pod drugim. Stad podzial zamiast jednolitej listy.
  const [wyrozniony, ...reszta] = wszystkie;
  dodaj('/', skladaj(tpl, 'home', {
    url: '/',
    tytulStrony: 'Biuro prasowe ERLI',
    opis: 'Komunikaty prasowe, wyniki i materiały dla dziennikarzy piszących o ERLI.',
    kanoniczny: `${DOMENA}/`,
    ogTyp: 'website',
    ogObraz: wyrozniony ? `${DOMENA}${wyrozniony.grafikaUrl}` : `${DOMENA}/assets/img/kv/default.webp`,
    schemaJsonLd: `<script type="application/ld+json">${organizationSchema()}</script>`,
    wyrozniony: wyrozniony ?? null,
    pozostale: reszta.slice(0, 6),
  }), '2026-07-27', '1.0');

  // --- listy kategorii ---
  for (const [klucz, meta] of Object.entries(KATEGORIE)) {
    const posty = wszystkie.filter((p) => p.kategoria === klucz);
    const strony = paginate(posty, meta.url);

    for (const strona of strony) {
      dodaj(strona.url, skladaj(tpl, 'list', {
        url: strona.url,
        tytulStrony: `${meta.naglowek} — Biuro prasowe ERLI`,
        opis: meta.wprowadzenie,
        kanoniczny: `${DOMENA}${strona.url}`,
        ogTyp: 'website',
        ogObraz: `${DOMENA}/assets/img/kv/default.webp`,
        schemaJsonLd: `<script type="application/ld+json">${organizationSchema()}</script>`,
        naglowek: meta.naglowek,
        wprowadzenie: meta.wprowadzenie,
        posty: strona.elementy,
        maPaginacje: strona.lacznie > 1,
        numer: strona.numer,
        lacznie: strona.lacznie,
        poprzednia: strona.poprzednia,
        nastepna: strona.nastepna,
        // Numerowana paginacja: przy 9 wpisach na strone stron jest kilka,
        // wiec skok wprost jest szybszy niz klikanie "Nastepna".
        numery: strony.map((s) => ({
          numer: s.numer,
          url: s.url,
          aktualna: s.numer === strona.numer,
        })),
      }), '2026-07-27', '0.8');
    }
  }

  // --- artykuły ---
  for (const post of wszystkie) {
    // H1 na stronie artykulu to tytul, wiec naglowki w tresci zaczynaja sie
    // od H2. Zrodla po migracji maja same ###.
    const trescHtml = podniesNaglowki(renderMarkdown(post.tresc));
    dodaj(post.url, skladaj(tpl, 'post', {
      ...post,
      tytulStrony: `${post.tytul} — Biuro prasowe ERLI`,
      opis: plainText(post.lead) || plainText(trescHtml).slice(0, 155),
      kanoniczny: post.urlPelny,
      ogTyp: 'article',
      ogObraz: `${DOMENA}${post.grafikaUrl}`,
      schemaJsonLd:
        `<script type="application/ld+json">${articleSchema(post)}</script>\n` +
        `  <script type="application/ld+json">${organizationSchema()}</script>`,
      trescHtml,
      // Lead pokazujemy tylko, gdy nie powtarza sie w tekscie. Pole `lead`
      // zostaje w danych i dalej zasila opis w <head> oraz zajawki na listach.
      pokazLead: Boolean(post.lead) && !leadDublujeTresc(post.lead, plainText(trescHtml)),
      powiazane: powiazaneDo(post, wszystkie).map((p) => ({ ...p, podrzedny: true })),
    }), post.data, '0.7');
  }

  // --- strony statyczne ---
  for (const plik of await readdir('src/pages')) {
    if (!plik.endsWith('.md')) continue;
    const { data, body } = parseFrontmatter(await readFile(join('src/pages', plik), 'utf8'));
    const slug = plik.replace('.md', '');
    const url = `/${slug}/`;

    // Strona moze wskazac wlasny szablon przez frontmatter `szablon`. Domyslny
    // `page` dokleja pasmo kontaktowe; strona Kontakt ma wlasny uklad, zeby ta
    // sama tresc nie pojawila sie na niej dwa razy.
    const szablon = tpl.templates[data.szablon] ? data.szablon : 'page';

    // Dane strukturalne z src/<slug>.json, jesli istnieja. Frontmatter zna
    // tylko plaskie pary klucz-wartosc, wiec listy sekcji (kafle, kategorie,
    // os czasu) nie zmieszcza sie w naglowku pliku .md.
    const plikDanych = join('src', `${slug}.json`);
    const daneSekcji = existsSync(plikDanych)
      ? JSON.parse(await readFile(plikDanych, 'utf8'))
      : {};

    dodaj(url, skladaj(tpl, szablon, {
      ...daneSekcji,
      ...data,
      url,
      tytul: data.tytul,
      // Numer do atrybutu tel: bez spacji i lacznikow.
      telefonHref: data.telefon ? data.telefon.replace(/[^\d+]/g, '') : '',
      tytulStrony: `${data.tytul} — Biuro prasowe ERLI`,
      opis: data.lead ?? '',
      kanoniczny: `${DOMENA}${url}`,
      ogTyp: 'website',
      ogObraz: `${DOMENA}/assets/img/kv/default.webp`,
      schemaJsonLd: `<script type="application/ld+json">${organizationSchema()}</script>`,
      trescHtml: renderMarkdown(body),
    }), '2026-07-27', '0.5');
  }

  // --- strona błędu 404 ---
  // Z pominieciem dodaj(): musi wyladowac jako 404.html w korzeniu (serwery
  // szukaja jej tam, nie pod /404/) i nie moze trafic do sitemapy. Trafia za to
  // do `strony`, wiec obejmuje ja kontrola jezykowa i kontrola obrazkow.
  // Bez kanonicznego i z noindex — to nie jest adres, pod ktory ktos ma wracac.
  strony.push({
    sciezka: '404.html',
    html: skladaj(tpl, '404', {
      url: '/404',
      tytulStrony: 'Nie ma takiej strony — Biuro prasowe ERLI',
      opis: 'Adres jest nieaktualny albo zawiera literówkę.',
      kanoniczny: '',
      noindex: true,
      ogTyp: 'website',
      ogObraz: `${DOMENA}/assets/img/kv/default.webp`,
      schemaJsonLd: '',
    }),
  });

  // --- kontrola językowa: przerywa build ---
  assertNoGerman(strony);
  console.log('  kontrola jezykowa: OK');

  // --- zapis ---
  for (const { sciezka, html } of strony) {
    await zapisz(join(DIST, sciezka), html);
  }

  await zapisz(join(DIST, 'assets/css/main.css'), await buildCss('assets/css'));
  await cp('assets/fonts', join(DIST, 'assets/fonts'), { recursive: true });
  await cp('assets/img', join(DIST, 'assets/img'), { recursive: true });
  await cp('assets/js', join(DIST, 'assets/js'), { recursive: true });

  // --- kontrola obrazkow: przerywa build (wymaga skopiowanych assetow) ---
  assertNoMissingImages(strony, DIST);
  console.log('  kontrola obrazkow: OK');

  await zapisz(join(DIST, 'sitemap.xml'), buildSitemap(doSitemap));
  await zapisz(join(DIST, 'robots.txt'), buildRobots());

  const duplikaty = existsSync('src/duplikaty.json')
    ? JSON.parse(await readFile('src/duplikaty.json', 'utf8'))
    : [];
  const mapa = buildRedirectMap(wszystkie, duplikaty);

  // --- kontrola przekierowan: przerywa build ---
  assertNoMissingRedirectTargets(mapa, DIST);
  console.log('  kontrola przekierowan: OK');

  await zapisz(join(DIST, 'redirects/.htaccess'), toHtaccess(mapa));
  await zapisz(join(DIST, 'redirects/nginx.conf'), toNginx(mapa));
  await zapisz(join(DIST, 'redirects/mapa.csv'), toCsv(mapa));

  // --- pliki konfiguracyjne Cloudflare Pages ---
  // Oba musza lezec w katalogu glownym wyniku budowania, nie w redirects/.
  // Cloudflare czyta je sam przy wdrozeniu — stad przekierowania 301 dzialaja
  // na tym hostingu bez osobnego wdrozenia po stronie IT.
  await zapisz(join(DIST, '_redirects'), toCloudflare(mapa));
  await cp('_headers', join(DIST, '_headers'));

  console.log(`  ${strony.length} stron, ${mapa.length} przekierowan`);
  console.log('Gotowe: dist/');
}

build().catch((err) => {
  console.error('\nBUILD PRZERWANY\n');
  console.error(err.message);
  process.exit(1);
});
