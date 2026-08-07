// Usuwa z leadu fragmenty powtarzajace tytul artykulu.
//
// Skad problem: w eksporcie Gridbox tytul czesto wystepowal takze jako
// pierwszy wiersz tresci. Skrypt tools/wydluz-leady.mjs, uzupelniajac
// zbyt krotkie leady zdaniami z pierwszego akapitu, wciagnal ten wiersz
// do leadu. Efekt: na karcie tytul czyta sie dwa razy pod rzad.
//
// Tytul siedzi w leadzie na trzy sposoby i kazdy wymaga innego ciecia:
//
//   KONIEC  (22 art.) — doklejony na koncu, czesto bez kropki rozdzielajacej.
//                       Tniemy dokladnie tytul i domykamy interpunkcje.
//                       Ciecie calym zdaniem zabieraloby tu tresc: w artykule
//                       z 2024-11-09 tytul wisi na koncu zdania z atrybucja
//                       cytatu, wiec razem z nim znikalby "- mowi Adam
//                       Ciesielczyk, prezes i zalozyciel platformy ERLI"
//                       i cudzyslow zostawalby niedomkniety.
//   SRODEK  (1 art.)  — tniemy tytul i sklejamy szew, podnoszac wielka litera
//                       zdanie, ktore po nim zostaje.
//   POCZATEK (2 art.) — tytul jest pierwszym czlonem zdania leadu, wiec samo
//                       wyciecie zostawiloby urwane "nowego marketplace'u na
//                       polskim rynku e-handlu". Tu odpada cale zdanie.
//
// Dla leadow, w ktorych tytul wystepuje w wersji nieznacznie przeredagowanej
// (a nie znak w znak), zostaje stare dopasowanie na poziomie zdan.
//
// Wynik jest sprawdzany: skrypt nie zapisze leadu, ktory zrobil sie krotszy
// niz 40 znakow, ma niedomkniety cudzyslow albo zaczyna sie mala litera —
// takie przypadki laduja w raporcie do recznego przejrzenia.
//
// Uruchomienie:  node tools/usun-tytul-z-leadu.mjs [--zapisz]

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ZAPISZ = process.argv.includes('--zapisz');
const KATALOGI = ['src/posts/aktualnosci', 'src/posts/media'];

const MIN_DLUGOSC = 40;

/**
 * Normalizuje tekst do porownan (bez interpunkcji, malymi literami)
 * i zapamietuje, pod ktorym indeksem w oryginale siedzi kazdy znak wyniku.
 * Dzieki mapie trafienie znalezione na tekscie znormalizowanym da sie wyciac
 * z oryginalu razem z jego wlasna interpunkcja.
 */
function normalizuj(tekst) {
  const znaki = [];
  const mapa = [];
  let spacja = true;
  for (let i = 0; i < tekst.length; i++) {
    const znak = tekst[i];
    if (/[\p{L}\p{N}]/u.test(znak)) {
      znaki.push(znak.toLowerCase());
      mapa.push(i);
      spacja = false;
    } else if (!spacja) {
      znaki.push(' ');
      mapa.push(i);
      spacja = true;
    }
  }
  while (znaki.at(-1) === ' ') { znaki.pop(); mapa.pop(); }
  return { tekst: znaki.join(''), mapa };
}

/** Dzieli na zdania, zachowujac znak konczacy. */
function zdania(t) {
  return String(t ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

/** Domyka zdanie kropka, jesli urwalo sie na literze lub cyfrze. */
function domknij(t) {
  const czysty = t.replace(/\s+/g, ' ').replace(/[\s–—,;:-]+$/, '').trim();
  return /[\p{L}\p{N}%]$/u.test(czysty) ? `${czysty}.` : czysty;
}

/** Wycina z leadu dokladne wystapienie tytulu i skleja szew. */
function wytnij(lead, od, do_) {
  // Normalizacja konczy dopasowanie na ostatniej literze lub cyfrze tytulu,
  // wiec jego wlasny ogon interpunkcyjny zostaje w leadzie: po tytule
  // "...o raty 5x0%" zostawalby osierocony znak "%", po tytule zamknietym
  // cudzyslowem — sam cudzyslow. Zabieramy go razem z tytulem.
  let koniec = do_;
  while (koniec < lead.length && !/[\p{L}\p{N}]/u.test(lead[koniec])) koniec++;

  // Symetrycznie z przodu: cudzyslow lub nawias otwierajacy tytul nalezy
  // do niego, nie do zdania, ktore zostaje.
  const przed = lead.slice(0, od).replace(/[„"«‹(\[\s]+$/, '');
  const po = lead.slice(koniec).replace(/^[\s–—,;:-]+/, '');
  if (!po) return domknij(przed);
  if (!przed) return po.trim();
  // Po zdaniu zakonczonym kropka reszta musi ruszyc wielka litera.
  const koniecZdania = /[.!?]["”„]?$/.test(przed);
  const reszta = koniecZdania ? po[0].toUpperCase() + po.slice(1) : po;
  return domknij(`${przed} ${reszta}`);
}

/** Stare dopasowanie: odrzuca cale zdania pokrywajace sie z tytulem. */
function utnijZdaniami(lead, tytul) {
  const nt = normalizuj(tytul).tekst;
  const zachowane = zdania(lead).filter((z) => {
    const nz = normalizuj(z).tekst;
    if (nz.length < 15) return true;
    const probka = nz.slice(0, Math.min(45, nz.length));
    if (nt.includes(probka)) return false;
    const probkaTytulu = nt.slice(0, Math.min(45, nt.length));
    if (probkaTytulu.length >= 25 && nz.includes(probkaTytulu)) return false;
    return true;
  });
  return zachowane.join(' ').replace(/\s+/g, ' ').trim();
}

/** Czy wynik nadaje sie do zapisu bez ludzkiego oka. */
function zastrzezenia(lead) {
  const uwagi = [];
  if (lead.length < MIN_DLUGOSC) uwagi.push(`za krotki (${lead.length} zn.)`);
  const otwarcia = (lead.match(/„/g) ?? []).length;
  const zamkniecia = (lead.match(/”/g) ?? []).length;
  if (otwarcia !== zamkniecia) uwagi.push('niedomkniety cudzyslow');
  if (/^\p{Ll}/u.test(lead)) uwagi.push('zaczyna sie mala litera');
  return uwagi;
}

const raport = { poprawione: [], bezZmian: 0, doPrzejrzenia: [] };

for (const dir of KATALOGI) {
  for (const plik of readdirSync(dir)) {
    if (!plik.endsWith('.md')) continue;
    const sciezka = join(dir, plik);
    const raw = readFileSync(sciezka, 'utf8');

    const m = /^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)([\s\S]*)$/.exec(raw);
    if (!m) continue;
    const [, otw, front, zam, body] = m;

    // Frontmatter trzyma wartosci w cudzyslowach, wiec cudzyslow w tresci jest
    // w pliku zapisany jako \". Bez odescapowania przy odczycie zapis zrobilby
    // z niego \\" — tak sie psul lead artykulu z 2024-11-09.
    const odescapuj = (s) => s.replace(/\\(.)/g, '$1');
    const tytul = odescapuj(/^tytul:\s*"([\s\S]*?)"\s*$/m.exec(front)?.[1] ?? '');
    const lead = odescapuj(/^lead:\s*"([\s\S]*?)"\s*$/m.exec(front)?.[1] ?? '');
    if (!tytul || !lead) continue;

    const nl = normalizuj(lead);
    const nt = normalizuj(tytul).tekst;
    const idx = nl.tekst.indexOf(nt);

    let nowy;
    let tryb;
    if (idx === -1) {
      nowy = utnijZdaniami(lead, tytul);
      tryb = 'zdania';
    } else if (idx === 0) {
      nowy = utnijZdaniami(lead, tytul);
      tryb = 'poczatek';
    } else {
      const od = nl.mapa[idx];
      const do_ = nl.mapa[idx + nt.length - 1] + 1;
      nowy = wytnij(lead, od, do_);
      tryb = idx + nt.length >= nl.tekst.length ? 'koniec' : 'srodek';
    }

    if (!nowy || nowy === lead.trim()) { raport.bezZmian++; continue; }

    const uwagi = zastrzezenia(nowy);
    if (uwagi.length) {
      raport.doPrzejrzenia.push({ plik, tryb, uwagi, przed: lead, po: nowy });
      continue;
    }

    raport.poprawione.push({ plik, tryb, przed: lead.length, po: nowy.length });

    if (ZAPISZ) {
      const escaped = nowy.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const nowyFront = front.replace(/^lead:\s*"[\s\S]*?"\s*$/m, `lead: "${escaped}"`);
      writeFileSync(sciezka, otw + nowyFront + zam + body, 'utf8');
    }
  }
}

console.log(`POPRAWIONE: ${raport.poprawione.length}`);
for (const p of raport.poprawione) {
  console.log(`  [${p.tryb.padEnd(8)}] ${String(p.przed).padStart(3)} -> ${String(p.po).padStart(3)}  ${p.plik.slice(0, 60)}`);
}
console.log(`\nBEZ ZMIAN: ${raport.bezZmian}`);
if (raport.doPrzejrzenia.length) {
  console.log(`\nDO RECZNEGO PRZEJRZENIA: ${raport.doPrzejrzenia.length}`);
  for (const p of raport.doPrzejrzenia) {
    console.log(`\n  ${p.plik}\n    tryb: ${p.tryb}, uwagi: ${p.uwagi.join(', ')}`);
    console.log(`    PRZED: ${p.przed}`);
    console.log(`    PO   : ${p.po}`);
  }
}
console.log(ZAPISZ ? '\nZapisano.' : '\nPodglad — nic nie zapisano. Uruchom z --zapisz.');
