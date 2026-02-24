const swiper = new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 5,
  spaceBetween: 20,
  loop: true,
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

swiper.on('click', function(swiper) {
  const clickedTile = swiper.clickedSlide?.querySelector(".event-tile");
  if (clickedTile) {
    const link = clickedTile.dataset.link; // or your own attribute
    if (link) window.location.href = link;
  }
});