// Jednorazowy skrypt (D3, uzupelnienie): niektore oryginalne nazwy plikow
// zdjec hero (pobrane z intro_image w Joomli) sa bardzo dlugie — jeden
// przypadek to ~110-znakowy ciag przypominajacy base64. W polaczeniu ze
// sciezka katalogu przekracza to limit 260 znakow Windows, nawet gdy sam
// slug jest juz skrocony (D3/skrocSlug).
//
// Kazdy plik hero ma prefiks "hero-" (nadany przy pobieraniu zdjec) i jest
// jedynym plikiem z tym prefiksem w swoim katalogu — bezpiecznie zmieniamy
// nazwe na staly "hero.webp", bez ryzyka kolizji z obrazkami tresci (ktore
// nigdy nie maja tego prefiksu). Idempotentny.
//
// Uruchomienie: node tools/ujednolic-nazwy-hero.mjs

import { readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const IMG_ROOT = 'assets/img/artykuly';
const POST_DIRS = ['src/posts/aktualnosci', 'src/posts/media'];

let zmienione = 0;

for (const katalog of readdirSync(IMG_ROOT, { withFileTypes: true })) {
  if (!katalog.isDirectory()) continue;
  const dirPath = join(IMG_ROOT, katalog.name);
  const heroPlik = readdirSync(dirPath).find((f) => f.startsWith('hero-'));
  if (!heroPlik || heroPlik === 'hero.webp') continue;

  const stara = join(dirPath, heroPlik);
  const nowa = join(dirPath, 'hero.webp');
  renameSync(stara, nowa);

  const staraRef = `/assets/img/artykuly/${katalog.name}/${heroPlik}`;
  const nowaRef = `/assets/img/artykuly/${katalog.name}/hero.webp`;

  for (const postDir of POST_DIRS) {
    for (const plik of readdirSync(postDir).filter((f) => f.endsWith('.md'))) {
      const sciezkaMd = join(postDir, plik);
      const raw = readFileSync(sciezkaMd, 'utf8');
      if (!raw.includes(staraRef)) continue;
      writeFileSync(sciezkaMd, raw.split(staraRef).join(nowaRef), 'utf8');
    }
  }

  console.log(`${katalog.name}: ${heroPlik} -> hero.webp`);
  zmienione++;
}

console.log(`\nZmieniono plikow: ${zmienione}`);
