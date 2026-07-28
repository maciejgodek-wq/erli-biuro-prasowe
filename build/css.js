// build/css.js
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Kolejnosc ma znaczenie: tokeny zanim ktokolwiek ich uzyje. */
export const CSS_ORDER = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'press.css'];

const NAGLOWEK = `/* Plik generowany przez build.js — nie edytuj recznie.
   Zrodla: assets/css/{${CSS_ORDER.join(', ')}} */\n\n`;

/** Skleja arkusze w jeden, z komentarzami oznaczajacymi granice. */
export function concatCss(sources) {
  return (
    NAGLOWEK +
    sources
      .map(({ name, content }) => `/* === ${name} === */\n${content.trim()}\n`)
      .join('\n')
  );
}

/** Wczytuje arkusze zrodlowe w ustalonej kolejnosci i skleja. */
export async function buildCss(cssDir) {
  const sources = await Promise.all(
    CSS_ORDER.map(async (name) => ({
      name,
      content: await readFile(join(cssDir, name), 'utf8'),
    }))
  );
  return concatCss(sources);
}
