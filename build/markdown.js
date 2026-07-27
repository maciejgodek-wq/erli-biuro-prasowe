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
