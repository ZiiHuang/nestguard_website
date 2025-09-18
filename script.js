document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.property_card');
  
    cards.forEach(card => {
      const imgEl = card.querySelector('.carousel_img');
      const prevBtn = card.querySelector('.prev');
      const nextBtn = card.querySelector('.next');
  
      // Parse the images array from the data attribute
      let images;
      try {
        images = JSON.parse(card.getAttribute('data-images')) || [];
      } catch (e) {
        images = [];
      }
  
      let index = 0;
  
      function show(i) {
        if (!images.length) return;
        index = (i + images.length) % images.length; // wrap around
        imgEl.src = images[index];
      }
  
      prevBtn.addEventListener('click', () => show(index - 1));
      nextBtn.addEventListener('click', () => show(index + 1));
      // Open link when clicking anywhere on the card (except buttons)
        const link = card.getAttribute('data-link');

        card.addEventListener('click', (e) => {
        // If the click target is one of the nav buttons, do nothing
        if (e.target.classList.contains('nav')) return;
        
        // Otherwise, open the link in a new tab
        if (link) window.open(link, '_blank');
        });

    });
  });
  