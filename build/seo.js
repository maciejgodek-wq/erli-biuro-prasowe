// build/seo.js

export const DOMENA = 'https://biuroprasowe.erli.pl';

/** Generuje sitemap.xml z listy { url, lastmod, priority? }. */
export function buildSitemap(strony) {
  const wpisy = strony
    .map(({ url, lastmod, priority = '0.7' }) =>
      [
        '  <url>',
        `    <loc>${DOMENA}${url}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    )
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    wpisy +
    '\n</urlset>\n'
  );
}

/** Generuje robots.txt. Biuro prasowe ma byc w calosci indeksowalne. */
export function buildRobots() {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${DOMENA}/sitemap.xml`, ''].join('\n');
}
