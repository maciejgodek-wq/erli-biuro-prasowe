// Zmniejsza wage zdjec artykulow.
//
// Zdjecia pobrane z CDN starej Joomli maja do 1440 px szerokosci i do 664 KB,
// a wyswietlaja sie w kolumnie 460 px (karta) albo 800 px (artykul). Lista
// /aktualnosci/ ciagnela ~5 MB.
//
// Dla kazdego pliku powstaja dwa warianty:
//   <nazwa>.webp      — do 1200 px, uzywany w artykule i jako 2x na karcie
//   <nazwa>-600.webp  — do 600 px, uzywany jako 1x na karcie
// Szablon podaje oba przez srcset, przegladarka wybiera po `sizes`.
//
// Uruchomienie:  node tools/optymalizuj-obrazy.mjs [--zapisz]

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import sharp from 'sharp';

const KORZEN = 'assets/img/artykuly';
const DUZY = 1200;
const MALY = 600;
const JAKOSC = 74;
const ZAPISZ = process.argv.includes('--zapisz');

/** Zbiera wszystkie .webp z podkatalogow, pomijajac juz wygenerowane warianty. */
function zbierz(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) zbierz(p, out);
    else if (extname(e.name) === '.webp' && !/-\d+\.webp$/.test(e.name)) out.push(p);
  }
  return out;
}

const pliki = zbierz(KORZEN);
let przed = 0;
let po = 0;
const raport = [];

for (const plik of pliki) {
  const rozmiarPrzed = statSync(plik).size;
  przed += rozmiarPrzed;

  const zrodlo = readFileSync(plik);
  const meta = await sharp(zrodlo).metadata();

  const duzy = await sharp(zrodlo)
    .resize({ width: Math.min(DUZY, meta.width ?? DUZY), withoutEnlargement: true })
    .webp({ quality: JAKOSC })
    .toBuffer();

  const maly = await sharp(zrodlo)
    .resize({ width: Math.min(MALY, meta.width ?? MALY), withoutEnlargement: true })
    .webp({ quality: JAKOSC })
    .toBuffer();

  const sciezkaMala = join(dirname(plik), `${basename(plik, '.webp')}-${MALY}.webp`);

  po += duzy.length + maly.length;
  raport.push({
    plik: plik.replace(/\\/g, '/').slice(KORZEN.length + 1),
    wymiary: `${meta.width}x${meta.height}`,
    przed: Math.round(rozmiarPrzed / 1024),
    duzy: Math.round(duzy.length / 1024),
    maly: Math.round(maly.length / 1024),
  });

  if (ZAPISZ) {
    writeFileSync(plik, duzy);
    writeFileSync(sciezkaMala, maly);
  }
}

raport.sort((a, b) => b.przed - a.przed);
console.log('najwieksze pliki (KB):');
console.log('  przed  ->  1200px  +  600px   wymiary        plik');
for (const r of raport.slice(0, 12)) {
  console.log(
    `  ${String(r.przed).padStart(5)}  ->  ${String(r.duzy).padStart(6)}  +  ${String(r.maly).padStart(5)}   ${r.wymiary.padEnd(12)}  ${r.plik.slice(0, 55)}`
  );
}

console.log(`\nplikow: ${pliki.length}`);
console.log(`przed:  ${(przed / 1024 / 1024).toFixed(1)} MB`);
console.log(`po:     ${(po / 1024 / 1024).toFixed(1)} MB  (oba warianty razem)`);
console.log(`zysk:   ${(100 - (po / przed) * 100).toFixed(0)}%`);
console.log(ZAPISZ ? '\nZapisano.' : '\nPodglad — nic nie zapisano. Uruchom z --zapisz.');
