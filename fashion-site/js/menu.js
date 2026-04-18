/* =========================================================
   menu.js — NOCTURNE v2
   Fullscreen menu overlay
   ========================================================= */

(function () {
  const overlay   = document.getElementById('menu-overlay');
  const openBtn   = document.querySelector('.nav-menu');
  const closeBtn  = document.querySelector('.menu-close');

  if (!overlay || !openBtn) return;

  let isOpen = false;

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    document.body.classList.add('is-menu-open');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');

    /* Fade the main UI a bit so focus is on the menu */
    gsap.to(['#main-text', '#nav-buttons', '#indicator', '#marquee', '#side-label'], {
      opacity: 0.15,
      duration: 0.45,
      ease: 'power2.out'
    });
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove('is-menu-open');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');

    /* Restore UI opacities */
    gsap.to('#main-text', { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to('#nav-buttons', { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to('#indicator', { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to('#marquee', { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to('#side-label', { opacity: 0.25, duration: 0.5, ease: 'power2.out' });
  }

  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  /* Click outside content closes menu (click on backdrop) */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('menu-backdrop')) {
      closeMenu();
    }
  });

  window.NocturneMenu = {
    open: openMenu,
    close: closeMenu,
    isOpen: function () { return isOpen; }
  };
})();

console.log('✅ menu.js loaded');
