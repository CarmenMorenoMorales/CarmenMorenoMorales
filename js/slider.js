// slider.js
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.slider');

  sliders.forEach(slider => {
    const slides = slider.querySelectorAll('.slide');
    const nextBtn = slider.querySelector('.next');
    const prevBtn = slider.querySelector('.prev');
    let current = 0;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
          slide.classList.add('active');
        }
      });
    };

    nextBtn?.addEventListener('click', () => {
      current = (current + 1) % slides.length;
      showSlide(current);
    });

    prevBtn?.addEventListener('click', () => {
      current = (current - 1 + slides.length) % slides.length;
      showSlide(current);
    });

    // Inicializa
    showSlide(current);
  });
});
