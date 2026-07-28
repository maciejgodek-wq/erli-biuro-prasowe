// Jednorazowy skrypt (D1): naprawia 2 artykuly, w ktorych automatyczny dedup
// leadu (tools/joomla-extract.mjs, Zadanie 21) slusznie NIE usunal calego
// pierwszego akapitu — bo akapit mial dodatkowe zdanie spoza leadu, a funkcja
// prawieRowne() odrzucila usuniecie z tolerancja, zeby nie zgubic tego zdania
// (patrz przypadek "DPD" z tej samej sesji).
//
// W obu pozostalych przypadkach pierwszy akapit zaczyna sie DOKLADNIE od
// tekstu leadu, po czym nastepuje dodatkowe, unikalne zdanie. Naprawa usuwa
// z akapitu tylko czesc pokrywajaca sie z leadem, zachowujac reszte —
// zamiast pokazywac caly lead dwa razy nad trescia.
//
// Uruchomienie: node tools/napraw-czesciowo-zdublowany-lead.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const PLIKI = [
  'src/posts/aktualnosci/2025-01-23-swiateczne-rekordy-erli-dynamiczny-wzrost-sprzedazy-i-popularnosc-aplikacji-mobilnej.md',
  'src/posts/aktualnosci/2025-06-26-erli-jako-pierwsze-w-regionie-emea-przeprowadzilo-innowacyjne-badanie-meta-conversion-lift-wzbogacone-o-metodologie-channel-lift-do-celow-sprzedazowych-celem-jeszcze-skuteczniejsza-ocena-potencjalu-wykorzystywanych-kanalow-reklamowych.md',
];

let naprawione = 0;

for (const sciezka of PLIKI) {
  const raw = readFileSync(sciezka, 'utf8');

  const leadMatch = /^lead: "((?:[^"\\]|\\.)*)"/m.exec(raw);
  if (!leadMatch) { console.error(`BLAD: brak leadu w ${sciezka}`); continue; }
  const lead = leadMatch[1].replace(/\\"/g, '"');

  const idxKoniecFrontu = raw.indexOf('---', 3) + 3; // pozycja zaraz po zamykajacym --- frontmattera
  const body = raw.slice(idxKoniecFrontu).replace(/^\n+/, '');

  const bloki = body.split('\n\n');
  const idx = bloki.findIndex((b) => {
    const t = b.trim();
    return t && !t.startsWith('#') && !/^!\[.*\]\(.*\)$/.test(t);
  });
  if (idx === -1) { console.error(`BLAD: brak akapitu tekstowego w ${sciezka}`); continue; }

  const blok = bloki[idx].trim();
  const gwiazdki = blok.match(/^\*+/)?.[0] ?? '';
  const bezGwiazdek = blok.slice(gwiazdki.length);

  if (!bezGwiazdek.startsWith(lead)) {
    console.error(`POMINIETO: pierwszy akapit w ${sciezka} nie zaczyna sie od leadu — sprawdz recznie`);
    continue;
  }

  const dalszaTresc = bezGwiazdek.slice(lead.length).trim();
  if (!dalszaTresc.replace(/\*+$/, '').trim()) {
    console.error(`POMINIETO: po usunieciu leadu nic nie zostaje w ${sciezka} — powinien to obsluzyc dedup z Zadania 21`);
    continue;
  }

  bloki[idx] = `${gwiazdki}${dalszaTresc}`;
  const nowyRaw = raw.slice(0, idxKoniecFrontu) + '\n\n' + bloki.join('\n\n');
  writeFileSync(sciezka, nowyRaw, 'utf8');
  console.log(`Naprawiono: ${sciezka}`);
  naprawione++;
}

console.log(`\nRazem naprawionych: ${naprawione}`);
