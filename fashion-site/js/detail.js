/* =========================================================
   detail.js — NOCTURNE v2
   Act detail overlay with per-slide content
   ========================================================= */

(function () {
  const overlay  = document.getElementById('detail-overlay');
  const closeBtn = document.querySelector('.detail-close');
  const img      = document.getElementById('detail-image');
  const metaAct  = document.getElementById('detail-meta-act');
  const metaTit  = document.getElementById('detail-meta-title');
  const eyebrow  = document.getElementById('detail-eyebrow-text');
  const titleEl  = document.getElementById('detail-title');
  const ledeEl   = document.getElementById('detail-lede');
  const storyEl  = document.getElementById('detail-story');
  const silEl    = document.getElementById('detail-silhouette');
  const looksEl  = document.getElementById('detail-looks-count');
  const fabricList = document.getElementById('detail-fabric-list');
  const thumbs   = document.getElementById('detail-thumbs');

  if (!overlay) return;

  /* Extended narrative per act (not derivable from SLIDES) */
  const ACT_CONTENT = {
    0: {
      story: 'Daylight opens on a city square. A coat the color of the sky, worn without anything to prove. This is fashion as weather — something you step into without thinking, and only later realize was always meant to be there.',
      silhouette: 'A long double-breasted coat, gently oversized, with cuffs that fall past the wrist. Pleated trousers beneath. One hand in the pocket, one reaching.',
      fabric: [
        'Cotton twill, 280 g/m², matte finish.',
        'Silk-lined gabardine, in powder blue.',
        'Hand-rolled silk scarf, unknotted.'
      ]
    },
    1: {
      story: 'A quiet room of garments, each hanging alone on a pale wooden rail. Before the show, before the season — the moment when clothes are still only cloth. A study in patience, and in the beauty of things waiting.',
      silhouette: 'Soft-shouldered knit, cotton overshirt, and straight-leg trousers in natural tones. Everything meant to be layered, un-layered, re-chosen.',
      fabric: [
        'Wool-cotton blend knit, 320 g/m².',
        'Washed cotton poplin, undyed.',
        'European linen, tumbled for hand.'
      ]
    },
    2: {
      story: 'High noon on a painted court. A tracksuit in the color of the sun, worn without apology. Movement as luxury, daylight as texture. Sportswear recast as something you would wear to be seen, and to feel seen.',
      silhouette: 'Zip-up track jacket over matching trousers. A long coat carried, not worn. Sneakers in cream canvas, laced tight.',
      fabric: [
        'Technical jersey, four-way stretch.',
        'Brushed cotton fleece, 380 g/m².',
        'Ripstop nylon, in bright saffron.'
      ]
    },
    3: {
      story: 'An afternoon of small pleasures. Color against color, a daisy held lightly, the sky photographed as a backdrop. The collection pauses here to remember that clothes can also be joy — loud, warm, uncomplicated.',
      silhouette: 'A crimson tee tucked into high-waist trousers. Oversized sunglasses. A silk scarf in mixed print, pocketed and forgotten.',
      fabric: [
        'Cotton poplin, 140 g/m², saturated dye.',
        'Printed silk twill, in mixed florals.',
        'Acetate sunglass frames, hand-polished.'
      ]
    },
    4: {
      story: 'Late afternoon on the avenue. A coat the color of old wine, shopping bags in hand, the last light warming the shoulder. This is the finale as errand — nothing staged, nothing declared. Just a woman, walking home in her favorite coat.',
      silhouette: 'Knee-length boiled-wool coat, belted loosely. Leather gloves. Tote bag in natural canvas, deliberately plain.',
      fabric: [
        'Boiled wool, 540 g/m², deep burgundy.',
        'Lamb leather gloves, unlined.',
        'Cashmere-silk scarf, woven in two tones.'
      ]
    }
  };

  function render(index) {
    const slide = window.NocturneGL.SLIDES[index];
    const content = ACT_CONTENT[index] || ACT_CONTENT[0];

    img.src = slide.url.replace('w=1200', 'w=1600');
    img.alt = slide.title + ' — ' + slide.chapter;
    overlay.setAttribute('data-act', String(index));
    metaAct.textContent = 'ACT ' + slide.roman;
    metaTit.textContent = slide.title;
    eyebrow.textContent = slide.chapter;
    titleEl.textContent = slide.title;
    ledeEl.textContent = slide.sub;
    storyEl.textContent = content.story;
    silEl.textContent = content.silhouette;
    looksEl.textContent = slide.looks;

    fabricList.innerHTML = content.fabric.map(function (line) {
      return '<li>' + line + '</li>';
    }).join('');

    /* Animate content entrance */
    gsap.fromTo('.detail-head > *, .detail-section',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.45 }
    );
    gsap.fromTo('#detail-image',
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out', delay: 0.3 }
    );
  }

  let isOpen = false;

  function openDetail(index) {
    if (isOpen) return;
    if (typeof index !== 'number') index = window.NocturneCarousel.getCurrent();
    isOpen = true;
    document.body.classList.add('is-detail-open');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    render(index);
  }

  function closeDetail() {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove('is-detail-open');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.classList.contains('detail-backdrop')) closeDetail();
  });

  window.NocturneDetail = {
    open: openDetail,
    close: closeDetail,
    isOpen: function () { return isOpen; }
  };
})();

console.log('✅ detail.js loaded');
