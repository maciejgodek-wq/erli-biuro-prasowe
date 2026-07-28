import { parse } from 'node-html-parser';

/**
 * Klasy poddrzew interfejsu edytora Gridbox. Usuwane w calosci,
 * razem z zawartoscia — nie tylko sam znacznik.
 */
const CHROME_KLASY = [
  'ba-edit-item', 'ba-edit-wrapper', 'ba-tooltip',
  'ba-buttons-wrapper', 'ba-overlay', 'ba-add-item',
];

/**
 * Napisy z panelu administracyjnego. Sluza jako kontrola koncowa —
 * jesli ktorykolwiek przezyl usuwanie poddrzew, znaczy ze Gridbox
 * uzyl klasy, ktorej nie ma na liscie powyzej.
 */
export const CHROME_SLOWNIK = [
  'Add New Row', 'Add to Library', 'Copy Item', 'Delete Item',
  'Edit Item', 'Section', 'Row', 'Column', 'Settings',
];

/** Usuwa poddrzewa interfejsu edytora. */
export function stripEditorChrome(html) {
  const root = parse(html);
  for (const klasa of CHROME_KLASY) {
    for (const el of root.querySelectorAll('.' + klasa)) el.remove();
  }
  return root.toString();
}

const ENCJE = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&apos;': "'", '&oacute;': 'ó', '&Oacute;': 'Ó', '&aogon;': 'ą',
  '&eogon;': 'ę', '&lstrok;': 'ł', '&Lstrok;': 'Ł', '&nacute;': 'ń',
  '&sacute;': 'ś', '&zacute;': 'ź', '&zdot;': 'ż', '&cacute;': 'ć',
  '&ndash;': '–', '&mdash;': '—', '&hellip;': '…',
  '&laquo;': '„', '&raquo;': '”', '&bdquo;': '„', '&rdquo;': '”',
  '&rsquo;': '’', '&lsquo;': '‘', '&shy;': '', '&zwnj;': '',
};

/** Zamienia encje na znaki UTF-8, w tym numeryczne. */
function decode(text) {
  let out = text;
  for (const [enc, ch] of Object.entries(ENCJE)) out = out.split(enc).join(ch);
  return out
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

/** Rekurencyjnie zamienia drzewo HTML na markdown. */
function walk(node) {
  if (node.nodeType === 3) return decode(node.rawText);
  if (node.nodeType !== 1) return '';

  const tag = node.rawTagName?.toLowerCase();
  const dzieci = () => node.childNodes.map(walk).join('');

  switch (tag) {
    case 'br': return '\n';
    case 'h1': case 'h2': return `\n\n## ${dzieci().trim()}\n\n`;
    case 'h3': return `\n\n### ${dzieci().trim()}\n\n`;
    case 'h4': case 'h5': case 'h6': return `\n\n#### ${dzieci().trim()}\n\n`;
    case 'p': case 'div': case 'section': return `\n\n${dzieci().trim()}\n\n`;
    case 'strong': case 'b': {
      const t = dzieci().trim();
      return t ? `**${t}**` : '';
    }
    case 'em': case 'i': {
      const t = dzieci().trim();
      return t ? `*${t}*` : '';
    }
    case 'blockquote':
      return `\n\n${dzieci().trim().split('\n').filter(Boolean).map((l) => `> ${l.trim()}`).join('\n')}\n\n`;
    case 'a': {
      const href = node.getAttribute('href') ?? '';
      const t = dzieci().trim();
      if (!t) return '';
      return href ? `[${t}](${href})` : t;
    }
    case 'ul': case 'ol': return `\n\n${dzieci().trim()}\n\n`;
    case 'li': return `\n- ${dzieci().trim()}`;
    case 'img': {
      const alt = node.getAttribute('alt') ?? '';
      const src = node.getAttribute('src') ?? '';
      return src ? `\n\n![${alt}](${src})\n\n` : '';
    }
    case 'script': case 'style': case 'noscript': return '';
    default: return dzieci();
  }
}

/** HTML page-buildera -> czysty markdown. */
export function htmlToMarkdown(html) {
  const root = parse(stripEditorChrome(html));
  return walk(root)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n\n')
    .map((blok) => blok.trim())
    .filter((blok) => blok && blok !== '-')
    .join('\n\n')
    .trim() + '\n';
}
