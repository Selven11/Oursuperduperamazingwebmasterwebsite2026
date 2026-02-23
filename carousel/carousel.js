
const CAROUSEL_INTERVAL_MS = 5000;

export function initCarousel() {
  const slides  = document.querySelectorAll('.slide');
  const prevBtn  = document.getElementById('prevSlide');
  const nextBtn  = document.getElementById('nextSlide');

  if (!slides.length) return;

  let idx = 0;
  let timer;

  function go(n) {
    slides[idx].classList.remove('active');
    idx = (n + slides.length) % slides.length;
    slides[idx].classList.add('active');
  }

  function reset() {
    clearInterval(timer);
    timer = setInterval(() => go(idx + 1), CAROUSEL_INTERVAL_MS);
  }

  prevBtn?.addEventListener('click', () => { go(idx - 1); reset(); });
  nextBtn?.addEventListener('click', () => { go(idx + 1); reset(); });

  reset();
}
