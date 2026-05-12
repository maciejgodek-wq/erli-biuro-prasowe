/**
 * carousel.js — reużywalna karuzela horizontal-scroll (design.md 5.18)
 * Vanilla JS, bez zależności. Inicjalizuje wszystkie .carousel na stronie.
 */

document.querySelectorAll('.carousel').forEach((carousel) => {
  const track = carousel.querySelector('.carousel__track');
  const prevBtn = carousel.querySelector('.carousel__prev');
  const nextBtn = carousel.querySelector('.carousel__next');

  if (!track || !prevBtn || !nextBtn) return;

  const itemWidth = () => {
    const item = track.querySelector('.carousel__item');
    if (!item) return 300;
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    return item.offsetWidth + gap;
  };

  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= max;
  };

  // Scroll o 3 elementy na klik
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -itemWidth() * 3, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: itemWidth() * 3, behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });

  // Reaguj na zmianę szerokości okna (np. resize, orientacja)
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(updateButtons).observe(track);
  } else {
    window.addEventListener('resize', updateButtons);
  }

  updateButtons();
});
