/* =========================================================
   main.js — NOCTURNE v2
   Cursor · Preloader · Entrance · Flourishes
   ========================================================= */

const supportsHover = window.matchMedia('(hover: hover)').matches;

/* ===== Custom Cursor ===== */
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
const cursorLabel = document.getElementById('cursor-label');
let cursorVisible = false;

if (supportsHover) {
  window.addEventListener('mousemove', function (e) {
    const cx = e.clientX - 3;
    const cy = e.clientY - 3;

    if (!cursorVisible) {
      cursorVisible = true;
      cursor.style.opacity = '1';
      cursorRing.style.opacity = '1';
      gsap.set(cursor, { x: cx, y: cy });
      gsap.set(cursorRing, { x: e.clientX, y: e.clientY });
    } else {
      gsap.set(cursor, { x: cx, y: cy });
      gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.22, ease: 'power2.out' });
    }
  });

  /* Hover-zones with labels */
  function bindCursorZones() {
    const hotSel = '.round-btn, .nav-menu, .nav-sound, .text-cta, a, button, .ticker-dot, .menu-close, .detail-close, input, .menu-item, .footer-col a, .footer-form-row button';
    document.querySelectorAll(hotSel).forEach(function (el) {
      const label = el.getAttribute('data-cursor') || (el.dataset.nav ? el.dataset.nav.toUpperCase() : '');
      el.addEventListener('mouseenter', function () {
        cursorRing.classList.add('hot');
        cursorLabel.textContent = label || '';
      });
      el.addEventListener('mouseleave', function () {
        cursorRing.classList.remove('hot');
        cursorLabel.textContent = '';
      });
    });
  }
  bindCursorZones();

  /* Re-bind after a short delay to catch any dynamically added nodes */
  setTimeout(bindCursorZones, 600);
}

/* ===== Preloader ===== */
const preloaderEl = document.getElementById('preloader');
const preloaderFill = document.querySelector('.preloader-line-fill');
const preloaderNum = document.querySelector('.preloader-count-num');

function updatePreloader() {
  const progress = window.loadProgress || 0;
  preloaderFill.style.width = progress + '%';
  preloaderNum.textContent = Math.round(progress);
  if (progress < 100) requestAnimationFrame(updatePreloader);
}
updatePreloader();

window.hidePreloader = function () {
  preloaderFill.style.width = '100%';
  preloaderNum.textContent = '100';

  const tl = gsap.timeline({
    onComplete: function () {
      preloaderEl.style.display = 'none';
      window.startEntrance && window.startEntrance();
    }
  });

  tl.to('.preloader-whisper', { opacity: 0, y: 8, duration: 0.4, ease: 'power2.inOut' }, 0.1)
    .to('.preloader-count-num', { opacity: 0, y: -20, duration: 0.55, ease: 'power3.inOut' }, 0.2)
    .to('.preloader-count-unit', { opacity: 0, duration: 0.3 }, 0.25)
    .to('.preloader-line', { opacity: 0, duration: 0.3 }, 0.25)
    .to('.preloader-meta', { opacity: 0, duration: 0.3 }, 0.25)
    .to('.preloader-brand', { opacity: 0, y: -12, duration: 0.5, ease: 'power3.inOut' }, 0.35)
    .to(preloaderEl, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0.5);
};

/* ===== Mouse parallax on main text ===== */
const mainText = document.getElementById('main-text');
let parallaxActive = false;

window.addEventListener('mousemove', function (e) {
  if (!parallaxActive) return;
  const nx = (e.clientX / window.innerWidth - 0.5) * 2;
  const ny = (e.clientY / window.innerHeight - 0.5) * 2;
  gsap.to(mainText, { x: nx * -6, y: ny * -4, duration: 1.3, ease: 'power2.out' });
});

/* ===== Sound toggle (visual only) ===== */
const soundBtn = document.querySelector('.nav-sound');
if (soundBtn) {
  soundBtn.addEventListener('click', function () {
    const pressed = soundBtn.getAttribute('aria-pressed') === 'true';
    soundBtn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
  });
}

/* ===== Entrance animation ===== */
window.startEntrance = function () {
  gsap.set('#nav',               { opacity: 0, y: -24 });
  gsap.set('#main-text',         { opacity: 0 });
  gsap.set('#nav-buttons',       { opacity: 0, y: 24 });
  gsap.set('#indicator',         { opacity: 0, x: 16 });
  gsap.set('#side-label',        { opacity: 0 });
  gsap.set('#marquee',           { opacity: 0 });
  gsap.set('.text-eyebrow',      { opacity: 0, y: 20 });
  gsap.set('.text-title-mask > *', { y: 150, opacity: 1 });
  gsap.set('.text-sub-inner',    { y: 40, opacity: 1 });
  gsap.set('.text-details > *',  { opacity: 0, y: 20 });
  gsap.set('.text-cta',          { opacity: 0, y: 20 });
  gsap.set('.text-divider',      { width: 0 });
  gsap.set('.text-line-deco',    { scaleY: 0, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl
    .to('#nav', { opacity: 1, y: 0, duration: 0.9 }, 0.15)
    .to('#side-label', { opacity: 0.25, duration: 0.8 }, 0.35)
    .to('#main-text', { opacity: 1, duration: 0 }, 0.5)
    .to('.text-line-deco', { scaleY: 1, opacity: 1, duration: 0.85, ease: 'power2.inOut' }, 0.45)
    .to('.text-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.55)
    .to('.text-title-mask > *', { y: 0, duration: 1.0, ease: 'power4.out' }, 0.65)
    .to('.text-sub-inner', { y: 0, duration: 0.9, ease: 'power3.out' }, 0.85)
    .to('.text-details > *', { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 1.0)
    .to('.text-cta', { opacity: 1, y: 0, duration: 0.6 }, 1.2)
    .to('.text-divider', { width: 72, duration: 0.7, ease: 'power2.inOut' }, 1.3)
    .to('#nav-buttons', { opacity: 1, y: 0, duration: 0.75 }, 1.05)
    .to('#indicator', { opacity: 1, x: 0, duration: 0.7 }, 1.15)
    .to('#marquee', { opacity: 1, duration: 0.9 }, 1.5)
    .call(function () { parallaxActive = true; }, null, 1.7);
};

/* ===== Flourish: subtle breathing on main text ===== */
gsap.to('.eyebrow-dot', {
  scale: 1.35,
  opacity: 0.7,
  duration: 1.6,
  yoyo: true,
  repeat: -1,
  ease: 'sine.inOut'
});

/* ===== Prevent native right-click selection from breaking the cursor ===== */
document.addEventListener('contextmenu', function (e) {
  /* allow on inputs */
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
});

/* ===== Handle cursor visibility when leaving window ===== */
document.addEventListener('mouseleave', function () {
  if (cursor) cursor.style.opacity = '0';
  if (cursorRing) cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', function () {
  if (cursorVisible) {
    if (cursor) cursor.style.opacity = '1';
    if (cursorRing) cursorRing.style.opacity = '1';
  }
});

console.log('✅ main.js loaded');
