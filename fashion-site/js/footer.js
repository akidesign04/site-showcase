/* =========================================================
   footer.js — NOCTURNE v2
   Footer reveal (slides up from bottom after final act)
   ========================================================= */

(function () {
  const footer = document.getElementById('footer');
  if (!footer) return;

  let isOpen = false;

  function openFooter() {
    if (isOpen) return;
    isOpen = true;
    document.body.classList.add('is-footer-open');
    footer.classList.add('is-open');

    /* Animate the key elements inside the footer */
    gsap.fromTo('.footer-headline',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', delay: 0.25 }
    );
    gsap.fromTo('.footer-form',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.45 }
    );
    gsap.fromTo('.footer-col',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, delay: 0.55 }
    );
    gsap.fromTo('.footer-bottom',
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.85 }
    );
    gsap.fromTo('.footer-glyph',
      { opacity: 0, y: 80 },
      { opacity: 0.04, y: 0, duration: 1.4, ease: 'power3.out', delay: 0.7 }
    );
  }

  function closeFooter() {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove('is-footer-open');
    footer.classList.remove('is-open');
  }

  /* Handle wheel-up within footer to close */
  footer.addEventListener('wheel', function (e) {
    if (footer.scrollTop === 0 && e.deltaY < -20) {
      closeFooter();
    }
  }, { passive: true });

  /* ESC handler is in carousel.js; expose API here */
  window.NocturneFooter = {
    open: openFooter,
    close: closeFooter,
    isOpen: function () { return isOpen; }
  };

  /* Small "back to top" gesture — a double tap anywhere in the footer's empty spaces */
  footer.addEventListener('dblclick', closeFooter);
})();

console.log('✅ footer.js loaded');
