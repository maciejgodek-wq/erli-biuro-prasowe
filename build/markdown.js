// build/markdown.js
import { Marked } from 'marked';

const marked = new Marked({ gfm: true, breaks: false });

// Linki wychodzace poza serwis otwieramy w nowej karcie z zabezpieczeniem rel.
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${title}"` : '';
      const external = /^https?:\/\//.test(href);
      const extraAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${titleAttr}${extraAttrs}>${text}</a>`;
    },
  },
});

/** Markdown -> HTML. */
export function renderMarkdown(source) {
  return marked.parse(source ?? '');
}

/** HTML -> czysty tekst; do meta description i podgladow. */
/**
 * Podnosi <h3> z tresci artykulu do <h2>.
 *
 * Na stronie artykulu <h1> to tytul, wiec pierwszy poziom w tekscie powinien
 * byc <h2>. Migracja z Joomli wyprodukowala same <h3> — sprawdzone: 31 plikow
 * uzywa wylacznie ###, zaden nie uzywa ## ani ####. Przy takim jednorodnym
 * zbiorze podniesienie o jeden poziom nie moze niczego splaszczyc, a usuwa
 * przeskok h1 → h3, ktory gubi czytnikow ekranu nawigujacych po naglowkach.
 */
export function podniesNaglowki(html) {
  return String(html ?? '')
    .replace(/<h3(\s[^>]*)?>/g, '<h2$1>')
    .replace(/<\/h3>/g, '</h2>');
}

export function plainText(html) {
  return String(html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
