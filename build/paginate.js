// build/paginate.js

/**
 * Ponizej tej liczby wpisow lista pozostaje jednostronicowa.
 *
 * 9, nie 30: strona ma sie miescic w kilku ruchach scrolla i wygladac na
 * biezaca, a nie na zwal archiwum. Tyle pokazuja biura prasowe Allegro i Zabki.
 */
export const PROG_PAGINACJI = 9;

/**
 * Dzieli liste na strony. Pierwsza strona zachowuje adres bazowy,
 * kolejne dostaja sufiks /2/, /3/ itd.
 */
export function paginate(elementy, urlBazowy, rozmiar = PROG_PAGINACJI) {
  if (elementy.length <= rozmiar) {
    return [{
      numer: 1,
      lacznie: 1,
      url: urlBazowy,
      elementy,
      poprzednia: null,
      nastepna: null,
    }];
  }

  const lacznie = Math.ceil(elementy.length / rozmiar);
  const adres = (n) => (n === 1 ? urlBazowy : `${urlBazowy}${n}/`);

  return Array.from({ length: lacznie }, (_, i) => {
    const numer = i + 1;
    return {
      numer,
      lacznie,
      url: adres(numer),
      elementy: elementy.slice(i * rozmiar, (i + 1) * rozmiar),
      poprzednia: numer > 1 ? adres(numer - 1) : null,
      nastepna: numer < lacznie ? adres(numer + 1) : null,
    };
  });
}
