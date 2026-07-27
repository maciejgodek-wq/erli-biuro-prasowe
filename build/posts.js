// build/posts.js
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseFrontmatter } from './frontmatter.js';

const MIESIACE_DOPELNIACZ = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

/** Zdejmuje rozszerzenie i opcjonalny prefiks daty RRRR-MM-DD. */
export function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Sortuje malejaco po dacie; przy remisie alfabetycznie po slugu. Nie mutuje wejscia. */
export function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? 1 : -1;
    return a.slug.localeCompare(b.slug, 'pl');
  });
}

/** Grupuje posty w bloki roczne, od najnowszego roku. Zaklada wejscie posortowane. */
export function groupByYear(posts) {
  const groups = [];
  for (const post of sortByDateDesc(posts)) {
    const rok = post.data.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.rok === rok) last.posty.push(post);
    else groups.push({ rok, posty: [post] });
  }
  return groups;
}

/** '2025-11-03' -> '3 listopada 2025' */
export function formatDatePl(iso) {
  const [rok, miesiac, dzien] = iso.split('-');
  return `${Number(dzien)} ${MIESIACE_DOPELNIACZ[Number(miesiac) - 1]} ${rok}`;
}

/**
 * Wczytuje wszystkie pliki .md z katalogu i zwraca posty posortowane
 * od najnowszego. Kazdy post ma: slug, kategoria, data, dataPl, tytul,
 * lead, grafika, zrodlo, tresc (surowy markdown), url.
 */
export async function loadPosts(dir, kategoria) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));

  const posts = await Promise.all(
    files.map(async (filename) => {
      const raw = await readFile(join(dir, filename), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      const slug = slugFromFilename(filename);

      if (!data.tytul) throw new Error(`${filename}: brak pola "tytul" we frontmatterze`);
      if (!data.data) throw new Error(`${filename}: brak pola "data" we frontmatterze`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.data)) {
        throw new Error(`${filename}: pole "data" musi miec format RRRR-MM-DD, jest "${data.data}"`);
      }

      return {
        slug,
        kategoria,
        data: data.data,
        dataPl: formatDatePl(data.data),
        tytul: data.tytul,
        lead: data.lead ?? '',
        grafika: data.grafika ?? null,
        zrodlo: data.zrodlo ?? null,
        tresc: body,
        url: `/${kategoria}/${slug}/`,
      };
    })
  );

  return sortByDateDesc(posts);
}
