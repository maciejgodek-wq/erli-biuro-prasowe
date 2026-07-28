// Kopiowanie adresu artykulu. Bez zaleznosci zewnetrznych.
document.querySelectorAll('.share__copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const oryginal = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.url);
      btn.textContent = 'Skopiowano';
    } catch {
      btn.textContent = 'Nie udało się skopiować';
    }
    // Etykieta wraca w obu przypadkach — inaczej komunikat bledu zostaje na stale.
    setTimeout(() => { btn.textContent = oryginal; }, 2000);
  });
});
