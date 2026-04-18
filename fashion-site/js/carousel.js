/* =========================================================
   carousel.js — NOCTURNE v2
   5-slot ring carousel with refined motion + UI sync
   ========================================================= */

let currentIndex = 0;
let isAnimating = false;
const TOTAL = 5;

/* 5 slot positions arranged around the camera */
const SLOT_CONFIG = [
  /* slot0: center (active) */
  { pos: [ 0.00,  0.55,  0.20 ], rotY:  0.00, rotX: -0.05, scale: 0.86, gray: 0.00, alpha: 1.00, active: 1.0 },
  /* slot1: left */
  { pos: [-3.45,  0.10, -1.60 ], rotY: -1.04, rotX: -0.05, scale: 0.84, gray: 0.18, alpha: 0.86, active: 0.0 },
  /* slot2: far left */
  { pos: [-3.90, -0.05, -4.70 ], rotY: -1.54, rotX: -0.05, scale: 0.62, gray: 0.48, alpha: 0.48, active: 0.0 },
  /* slot3: far right */
  { pos: [ 3.90, -0.05, -4.70 ], rotY:  1.54, rotX: -0.05, scale: 0.62, gray: 0.48, alpha: 0.48, active: 0.0 },
  /* slot4: right */
  { pos: [ 3.45,  0.10, -1.60 ], rotY:  1.04, rotX: -0.05, scale: 0.84, gray: 0.18, alpha: 0.86, active: 0.0 }
];

function getSlotIndex(meshIndex, activeIndex) {
  return ((meshIndex - activeIndex) + TOTAL) % TOTAL;
}

function applySlot(mesh, slotIdx, animateIt) {
  if (!mesh) return;
  const c = SLOT_CONFIG[slotIdx];
  const mat = mesh.material;
  const dur = animateIt ? 0.95 : 0;
  const ease = 'power3.inOut';

  gsap.to(mesh.position, { x: c.pos[0], y: c.pos[1], z: c.pos[2], duration: dur, ease: ease });
  gsap.to(mesh.rotation, { y: c.rotY, x: c.rotX, duration: dur, ease: ease });
  gsap.to(mesh.scale,    { x: c.scale, y: c.scale, z: 1, duration: dur, ease: ease });
  gsap.to(mat.uniforms.uAlpha,  { value: c.alpha,  duration: dur, ease: ease });
  gsap.to(mat.uniforms.uGray,   { value: c.gray,   duration: dur, ease: ease });
  gsap.to(mat.uniforms.uActive, { value: c.active, duration: dur, ease: ease });

  mesh.renderOrder = slotIdx === 0 ? 10 : (5 - slotIdx);
}

function layoutAll(animateIt) {
  const glMeshes = window.NocturneGL.meshes;
  glMeshes.forEach(function (mesh, i) {
    if (!mesh) return;
    const slot = getSlotIndex(i, currentIndex);
    applySlot(mesh, slot, animateIt);
  });
}

function goTo(index) {
  if (isAnimating) return;
  if (index === currentIndex) return;
  isAnimating = true;
  const prev = currentIndex;
  currentIndex = ((index % TOTAL) + TOTAL) % TOTAL;
  layoutAll(true);
  updateUI(prev);
  setTimeout(function () { isAnimating = false; }, 960);
}

function goNext() { goTo(currentIndex + 1); }
function goPrev() { goTo(currentIndex - 1); }

function updateProgress() {
  const indLineFill = document.querySelector('.ind-line-fill');
  if (indLineFill) {
    indLineFill.style.height = ((currentIndex + 1) / TOTAL * 100) + '%';
  }
  /* Tickers */
  document.querySelectorAll('.ticker-dot').forEach(function (el, i) {
    el.classList.toggle('is-active', i === currentIndex);
    el.classList.toggle('is-visited', i < currentIndex);
  });
}

let uiTimer = null;

function updateUI(prevIndex) {
  const slide = window.NocturneGL.SLIDES[currentIndex];
  const numEl     = document.getElementById('text-number');
  const titleEl   = document.getElementById('text-title');
  const subEl     = document.getElementById('text-sub');
  const chapEl    = document.getElementById('text-chapter');
  const fabricEl  = document.getElementById('text-fabric');
  const looksEl   = document.getElementById('text-looks');
  const indEl     = document.getElementById('ind-current');
  const indLabel  = document.getElementById('ind-label');

  gsap.killTweensOf([numEl, titleEl, subEl, chapEl, fabricEl, looksEl]);
  if (uiTimer) { clearTimeout(uiTimer); uiTimer = null; }

  /* Fade out outgoing */
  const dirForward = prevIndex === undefined ? true : (currentIndex > prevIndex);
  const yOut = dirForward ? -18 : 18;
  const yIn  = dirForward ? 24 : -24;

  gsap.to(numEl,    { opacity: 0, y: yOut, duration: 0.22, ease: 'power2.in' });
  gsap.to(titleEl,  { opacity: 0, y: yOut, duration: 0.22, ease: 'power2.in' });
  gsap.to(subEl,    { opacity: 0, y: yOut, duration: 0.22, ease: 'power2.in' });
  gsap.to(chapEl,   { opacity: 0, y: yOut, duration: 0.22, ease: 'power2.in' });
  gsap.to(fabricEl, { opacity: 0, y: yOut, duration: 0.22, ease: 'power2.in' });
  gsap.to(looksEl,  { opacity: 0, y: yOut, duration: 0.22, ease: 'power2.in' });

  uiTimer = setTimeout(function () {
    numEl.textContent    = slide.roman;
    titleEl.textContent  = slide.title;
    subEl.textContent    = slide.sub;
    chapEl.textContent   = slide.chapter;
    fabricEl.textContent = slide.fabric;
    looksEl.textContent  = slide.looks;
    indEl.textContent    = slide.number;
    indLabel.textContent = slide.label;

    gsap.fromTo(numEl,    { opacity: 0, y: yIn }, { opacity: 1,   y: 0, duration: 0.5,  ease: 'power2.out' });
    gsap.fromTo(chapEl,   { opacity: 0, y: yIn }, { opacity: 0.7, y: 0, duration: 0.5,  ease: 'power2.out' });
    gsap.fromTo(titleEl,  { opacity: 0, y: yIn }, { opacity: 1,   y: 0, duration: 0.55, ease: 'power2.out' });
    gsap.fromTo(subEl,    { opacity: 0, y: yIn }, { opacity: 0.85, y: 0, duration: 0.5,  ease: 'power2.out' });
    gsap.fromTo(fabricEl, { opacity: 0, y: yIn }, { opacity: 0.9, y: 0, duration: 0.5,  ease: 'power2.out' });
    gsap.fromTo(looksEl,  { opacity: 0, y: yIn }, { opacity: 0.9, y: 0, duration: 0.5,  ease: 'power2.out' });
  }, 240);

  updateProgress();

  /* Broadcast slide change so other modules (detail, footer) can react */
  window.dispatchEvent(new CustomEvent('nocturne:slide', {
    detail: { index: currentIndex, slide: slide }
  }));
}

/* Click on non-active slide advances to that slide */
function setupSlideClicks() {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener('click', function (e) {
    /* Ignore clicks on UI overlays */
    if (e.target.closest('#nav, #nav-buttons, #main-text, #menu-overlay, #detail-overlay, #footer, .nav-menu, .nav-sound')) return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, window.NocturneGL.camera);
    const hits = raycaster.intersectObjects(window.NocturneGL.meshes.filter(Boolean));
    if (hits.length) {
      const hit = hits[0].object;
      const idx = hit.userData.index;
      if (idx === currentIndex) {
        /* Clicked the active slide → open detail */
        window.NocturneDetail && window.NocturneDetail.open(currentIndex);
      } else {
        goTo(idx);
      }
    }
  });
}

/* Init when WebGL ready */
window.carouselReady = function () {
  layoutAll(false);

  document.getElementById('btn-next').addEventListener('click', goNext);
  document.getElementById('btn-prev').addEventListener('click', goPrev);

  /* Ticker click */
  document.querySelectorAll('.ticker-dot').forEach(function (el) {
    el.addEventListener('click', function () {
      const idx = parseInt(el.getAttribute('data-index'), 10);
      if (!isNaN(idx)) goTo(idx);
    });
  });

  /* Keyboard */
  window.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('is-menu-open')) return;
    if (document.body.classList.contains('is-detail-open')) return;
    if (document.body.classList.contains('is-footer-open')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'Enter') window.NocturneDetail && window.NocturneDetail.open(currentIndex);
    if (e.key === 'Escape') {
      window.NocturneDetail && window.NocturneDetail.close();
      window.NocturneMenu && window.NocturneMenu.close();
      window.NocturneFooter && window.NocturneFooter.close();
    }
  });

  /* Touch / swipe */
  let touchStartX = 0;
  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  }, { passive: true });

  /* Wheel / horizontal scroll -> advance carousel */
  let wheelLock = false;
  window.addEventListener('wheel', function (e) {
    if (document.body.classList.contains('is-menu-open')) return;
    if (document.body.classList.contains('is-detail-open')) return;
    if (document.body.classList.contains('is-footer-open')) return;
    if (wheelLock) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 12) return;

    wheelLock = true;
    delta > 0 ? goNext() : goPrev();
    setTimeout(function () { wheelLock = false; }, 980);
  }, { passive: true });

  setupSlideClicks();

  /* Click CTA -> open detail */
  const ctaBtn = document.getElementById('open-detail');
  if (ctaBtn) ctaBtn.addEventListener('click', function () {
    window.NocturneDetail && window.NocturneDetail.open(currentIndex);
  });

  updateProgress();

  /* Public API for external navigation */
  window.NocturneCarousel = {
    goTo: goTo,
    goNext: goNext,
    goPrev: goPrev,
    getCurrent: function () { return currentIndex; }
  };

  /* Trigger preloader hide -> entrance */
  window.hidePreloader ? window.hidePreloader() : (window.startEntrance && window.startEntrance());

  /* Fire the first slide event so listeners sync */
  window.dispatchEvent(new CustomEvent('nocturne:slide', {
    detail: { index: currentIndex, slide: window.NocturneGL.SLIDES[currentIndex] }
  }));
};

console.log('✅ carousel.js loaded');
