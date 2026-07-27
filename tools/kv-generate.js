// tools/kv-generate.js
// Generator key visuali 1200x630. Uruchamiany recznie, nie w kazdym buildzie.

/** Warianty tla — wartosci zgodne z tokens.css. */
export const WARIANTY = [
  { nazwa: 'teal',   od: '#0097bc', do: '#00b3bc', tekst: '#ffffff', akcent: '#feda30' },
  { nazwa: 'yellow', od: '#feda30', do: '#ffc70e', tekst: '#1a1a1a', akcent: '#005b71' },
  { nazwa: 'navy',   od: '#005b71', do: '#007996', tekst: '#ffffff', akcent: '#feda30' },
];

/** Deterministyczny wybor na podstawie sluga — ten sam artykul zawsze ten sam wariant. */
export function wybierzWariant(slug) {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return WARIANTY[hash % WARIANTY.length];
}

/** Lamie tytul na linie o zadanej dlugosci, obcinajac do maksymalnej liczby linii. */
export function lamTytul(tytul, maxZnakow = 24, maxLinii = 4) {
  const linie = [];
  let biezaca = '';

  for (const slowo of tytul.split(/\s+/)) {
    const kandydat = biezaca ? `${biezaca} ${slowo}` : slowo;
    if (kandydat.length > maxZnakow && biezaca) {
      linie.push(biezaca);
      biezaca = slowo;
    } else {
      biezaca = kandydat;
    }
  }
  if (biezaca) linie.push(biezaca);

  if (linie.length > maxLinii) {
    const przyciete = linie.slice(0, maxLinii);
    przyciete[maxLinii - 1] = `${przyciete[maxLinii - 1]}…`;
    return przyciete;
  }
  return linie;
}

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Buduje SVG key visuala. */
export function buildSvg({ tytul, kategoria, slug }) {
  const w = wybierzWariant(slug);
  const linie = lamTytul(tytul);
  const startY = 300 - (linie.length - 1) * 32;

  const tspany = linie
    .map((linia, i) => `<tspan x="80" y="${startY + i * 64}">${esc(linia)}</tspan>`)
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="tlo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${w.od}"/>
      <stop offset="100%" stop-color="${w.do}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#tlo)"/>
  <circle cx="1080" cy="90" r="220" fill="${w.akcent}" opacity="0.12"/>
  <text x="80" y="110" font-family="Montserrat, sans-serif" font-size="26" font-weight="700"
        fill="${w.akcent}" letter-spacing="3">${esc(kategoria.toUpperCase())}</text>
  <text font-family="Montserrat, sans-serif" font-size="54" font-weight="700" fill="${w.tekst}">
      ${tspany}
  </text>
  <text x="80" y="560" font-family="Montserrat, sans-serif" font-size="30" font-weight="700"
        fill="${w.tekst}" opacity="0.85">ERLI — Biuro prasowe</text>
</svg>`;
}

// --- CLI ---
// Uruchomienie: node tools/kv-generate.js
// Czyta posty, zapisuje SVG do assets/img/kv/. Konwersja do WebP: osobny krok.
// Porownanie przez pathToFileURL — sciezka repozytorium ma spacje, ktore w URL-u sa kodowane.
if (import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const { loadPosts } = await import('../build/posts.js');
  const { KATEGORIE } = await import('../build/render.js');
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { existsSync } = await import('node:fs');

  await mkdir('assets/img/kv', { recursive: true });

  const zrodla = [
    ['src/posts/aktualnosci', 'aktualnosci'],
    ['src/posts/media', 'media-o-erli'],
  ];

  let ile = 0;
  for (const [dir, kategoria] of zrodla) {
    if (!existsSync(dir)) continue;
    for (const post of await loadPosts(dir, kategoria)) {
      const svg = buildSvg({
        tytul: post.tytul,
        kategoria: KATEGORIE[kategoria].nazwa,
        slug: post.slug,
      });
      await writeFile(`assets/img/kv/${post.grafika ?? post.slug}.svg`, svg, 'utf8');
      ile += 1;
    }
  }

  // Grafika zapasowa dla strony glownej i list.
  await writeFile(
    'assets/img/kv/default.svg',
    buildSvg({ tytul: 'Biuro prasowe', kategoria: 'ERLI', slug: 'default' }),
    'utf8'
  );

  console.log(`Wygenerowano ${ile + 1} key visuali w assets/img/kv/`);
}
