// build/render.js
import { DOMENA } from './seo.js';
import { plainText } from './markdown.js';

export const KATEGORIE = {
  aktualnosci: {
    nazwa: 'Aktualności',
    url: '/aktualnosci/',
    naglowek: 'Aktualności',
    wprowadzenie: 'Komunikaty prasowe i informacje o działalności ERLI.',
  },
  'media-o-erli': {
    nazwa: 'Media o ERLI',
    url: '/media-o-erli/',
    naglowek: 'Media o ERLI',
    wprowadzenie: 'Publikacje na temat ERLI w mediach zewnętrznych.',
  },
};

const ATRYBUT_AKTYWNY = ' aria-current="page" class="is-active"';

/** Ustawia aria-current na pozycji menu odpowiadajacej biezacemu adresowi. */
export function navFlags(url) {
  return {
    aktywnaAktualnosci: url.startsWith('/aktualnosci') ? ATRYBUT_AKTYWNY : '',
    aktywnaMedia: url.startsWith('/media-o-erli') ? ATRYBUT_AKTYWNY : '',
    aktywnaONas: url.startsWith('/o-nas') ? ATRYBUT_AKTYWNY : '',
    aktywnaKontakt: url.startsWith('/kontakt') ? ATRYBUT_AKTYWNY : '',
  };
}

/**
 * Sciezka do grafiki karty/og:image. Wartosc `grafika` zaczynajaca sie
 * od `/` to gotowa sciezka (prawdziwe zdjecie artykulu w assets/img/artykuly/)
 * — ma priorytet. W przeciwnym razie to nazwa pliku w assets/img/kv/
 * (generowany key visual), domyslnie rowna slugowi.
 */
export function grafikaUrl(post) {
  if (post.grafika && post.grafika.startsWith('/')) return post.grafika;
  return `/assets/img/kv/${post.grafika ?? post.slug}.webp`;
}

/** JSON-LD NewsArticle dla pojedynczego artykulu. */
export function articleSchema(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.tytul,
    datePublished: post.data,
    dateModified: post.data,
    description: plainText(post.lead),
    image: `${DOMENA}${grafikaUrl(post)}`,
    mainEntityOfPage: `${DOMENA}${post.url}`,
    inLanguage: 'pl-PL',
    publisher: {
      '@type': 'Organization',
      name: 'ERLI',
      logo: { '@type': 'ImageObject', url: `${DOMENA}/assets/img/erli-logo.svg` },
    },
  });
}

/** JSON-LD Organization — na kazdej stronie. */
export function organizationSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ERLI',
    url: 'https://erli.pl',
    logo: `${DOMENA}/assets/img/erli-logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'press',
      email: 'media@erli.pl',
      availableLanguage: 'Polish',
    },
  });
}

/**
 * Trzy powiazane materialy: najpierw z tej samej kategorii,
 * w razie braku uzupelnione pozostalymi. Biezacy zawsze pominiety.
 */
export function powiazaneDo(post, wszystkie, ile = 3) {
  const inne = wszystkie.filter((p) => p.slug !== post.slug);
  const tejSamej = inne.filter((p) => p.kategoria === post.kategoria);
  const reszta = inne.filter((p) => p.kategoria !== post.kategoria);
  return [...tejSamej, ...reszta].slice(0, ile);
}

/**
 * Wariant 600 px tej samej grafiki — do srcset na kartach.
 * Powstaje w tools/optymalizuj-obrazy.mjs obok pliku glownego.
 * Zwraca null, gdy grafika nie jest plikiem .webp (fallback na kv).
 */
export function grafikaUrlMala(post) {
  const duza = grafikaUrl(post);
  return duza.endsWith('.webp') ? duza.replace(/\.webp$/, '-600.webp') : null;
}

/** Wzbogaca post o pola potrzebne w szablonach. */
export function decoratePost(post) {
  return {
    ...post,
    grafikaUrl: grafikaUrl(post),
    grafikaSrcset: grafikaUrlMala(post)
      ? `${grafikaUrlMala(post)} 600w, ${grafikaUrl(post)} 1200w`
      : '',
    kategoriaNazwa: KATEGORIE[post.kategoria].nazwa,
    kategoriaUrl: KATEGORIE[post.kategoria].url,
    urlPelny: `${DOMENA}${post.url}`,
    urlEnc: encodeURIComponent(`${DOMENA}${post.url}`),
    tytulEnc: encodeURIComponent(post.tytul),
  };
}
