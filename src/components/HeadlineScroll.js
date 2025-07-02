// src/components/HeadlineScroll.js

const initHeadlineScroll = () => {
  const headlineContainer = document.querySelector('.headline-articles');
  if (!headlineContainer) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Mouse events for desktop
  headlineContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    headlineContainer.style.cursor = 'grabbing';
    startX = e.pageX - headlineContainer.offsetLeft;
    scrollLeft = headlineContainer.scrollLeft;
  });

  headlineContainer.addEventListener('mouseleave', () => {
    isDown = false;
    headlineContainer.style.cursor = 'grab';
  });

  headlineContainer.addEventListener('mouseup', () => {
    isDown = false;
    headlineContainer.style.cursor = 'grab';
  });

  headlineContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - headlineContainer.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    headlineContainer.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile
  headlineContainer.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - headlineContainer.offsetLeft;
    scrollLeft = headlineContainer.scrollLeft;
  });

  headlineContainer.addEventListener('touchend', () => {
    isDown = false;
  });

  headlineContainer.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - headlineContainer.offsetLeft;
    const walk = (x - startX) * 2;
    headlineContainer.scrollLeft = scrollLeft - walk;
  });
};

export default initHeadlineScroll;