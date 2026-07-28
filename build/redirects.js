// build/redirects.js

/** Adresy stale, ktore Joomla serwowala pod /index.php/. */
const STALE = [
  { stary: '/index.php/aktualnosci', nowy: '/aktualnosci/' },
  { stary: '/index.php/media-o-erli', nowy: '/media-o-erli/' },
  { stary: '/index.php/o-nas', nowy: '/o-nas/' },
  { stary: '/index.php/kontakt', nowy: '/kontakt/' },
  { stary: '/index.php', nowy: '/' },
];

/**
 * Buduje mape 301 ze starych adresow Joomli na nowe.
 * Slugi zostaly zachowane, wiec mapowanie jest mechaniczne.
 *
 * `duplikaty` to sieroty bez kategorii (funkcja "duplikuj strone" w panelu
 * Joomli) — istnialy pod wlasnym adresem /index.php/<kategoria>/<slug>
 * w obu kategoriach, wiec kierujemy oba warianty. Dopisywane po artykulach,
 * zeby nigdy nie nadpisaly wersji kanonicznej.
 *
 * Kazdy wpis w `duplikaty` wskazuje artykul kanoniczny przez {kategoria, slug}
 * (Joomlowy slug, nietkniety), a adres wyjsciowy jest zawsze czytany z
 * post.url znalezionego artykulu — nigdy sztywno zapisany. Dzieki temu
 * zmiana reguly skracania adresow (skrocSlug w build/posts.js) nie moze
 * rozjechac mapy przekierowan: nowy adres podaza za tym, co faktycznie
 * wygenerowal loadPosts().
 */
export function buildRedirectMap(posty, duplikaty = []) {
  const mapa = new Map();

  for (const post of posty) {
    mapa.set(`/index.php/${post.kategoria}/${post.slug}`, post.url);
  }
  for (const { stary, kategoria, slug } of duplikaty) {
    const kanoniczny = posty.find((p) => p.kategoria === kategoria && p.slug === slug);
    if (!kanoniczny) {
      throw new Error(
        `duplikaty.json: brak artykulu kanonicznego ${kategoria}/${slug} dla wpisu "${stary}"`
      );
    }
    for (const kat of ['aktualnosci', 'media-o-erli']) {
      const klucz = `/index.php/${kat}/${stary}`;
      if (!mapa.has(klucz)) mapa.set(klucz, kanoniczny.url);
    }
  }
  for (const { stary, nowy } of STALE) {
    if (!mapa.has(stary)) mapa.set(stary, nowy);
  }

  return [...mapa].map(([stary, nowy]) => ({ stary, nowy }));
}

/** Format dla Apache — plik .htaccess. */
export function toHtaccess(mapa) {
  return (
    '# Przekierowania 301 ze starych adresow Joomli.\n' +
    '# Wygenerowane przez build.js — nie edytuj recznie.\n\n' +
    mapa.map(({ stary, nowy }) => `Redirect 301 ${stary} ${nowy}`).join('\n') +
    '\n'
  );
}

/** Format dla nginx — do wklejenia w blok server. */
export function toNginx(mapa) {
  const escape = (s) => s.replace(/\./g, '\\.');
  return (
    '# Przekierowania 301 ze starych adresow Joomli.\n' +
    '# Wygenerowane przez build.js — nie edytuj recznie.\n\n' +
    mapa
      .map(({ stary, nowy }) => `rewrite ^${escape(stary)}$ ${nowy} permanent;`)
      .join('\n') +
    '\n'
  );
}

/** Format uniwersalny — do wklejenia w panel hostingu lub arkusz. */
export function toCsv(mapa) {
  return (
    'stary_adres,nowy_adres\n' +
    mapa.map(({ stary, nowy }) => `${stary},${nowy}`).join('\n') +
    '\n'
  );
}
