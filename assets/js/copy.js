// Kopiowanie noty dla redakcji do schowka. Bez zaleznosci zewnetrznych.
// Ta sama mechanika co share.js (etykieta wraca po 2 s w obu przypadkach).
// Gdyby doszlo trzecie miejsce, warto scalic oba pliki w jeden handler.
document.querySelectorAll('[data-kopiuj]').forEach((btn) => {
  const zrodlo = document.getElementById(btn.dataset.kopiuj);
  if (!zrodlo) return;

  btn.addEventListener('click', async () => {
    const oryginal = btn.textContent;
    try {
      await navigator.clipboard.writeText(zrodlo.innerText.trim());
      btn.textContent = 'Skopiowano';
    } catch {
      btn.textContent = 'Nie udało się skopiować';
    }
    setTimeout(() => { btn.textContent = oryginal; }, 2000);
  });
});
