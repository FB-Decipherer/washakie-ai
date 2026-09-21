/* top-button.js - a Three Columns class feature, 19 September 2026.

   A round button with an up arrow that takes the reader back to the top of the page. It appears
   at the bottom right once the reader has scrolled about a screen down, and hides again near the
   top. No text on it (Walter, 19 Sep 2026); screen readers hear "Back to the top of the page".

   - Scrolls smoothly, or at once for readers whose system asks for reduced motion.
   - Takes its colors from the page's own --ink and --paper, so it follows light and dark.
   - Adds a little blank space after the last thing on the page, so the footer's last line can
     scroll clear of the button instead of sitting under it on a phone (21 Sep 2026).
   - Hidden in print.
   - Same file in every instance. Change it in Three Columns Tools/template first, then copy it
     out to the sites, so the class and the instances never drift apart. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  if (doc.getElementById('totop')) return;

  var css =
    'button.tt-float{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom, 0px));' +
      'z-index:900;margin:0;cursor:pointer;width:48px;height:48px;padding:0;' +
      'display:flex;align-items:center;justify-content:center;line-height:0;' +
      'border-radius:50%;border:1px solid var(--ink,#1E1B16);' +
      'background:var(--ink,#1E1B16);color:var(--paper,#FCFAF5);' +
      'box-shadow:0 4px 14px rgba(0,0,0,.22);' +
      'opacity:0;visibility:hidden;transform:translateY(8px);' +
      'transition:opacity .2s,transform .2s,visibility 0s linear .2s}' +
    'button.tt-float.tt-show{opacity:1;visibility:visible;transform:none;' +
      'transition:opacity .2s,transform .2s}' +
    'button.tt-float:hover{background:var(--ink,#1E1B16);color:var(--paper,#FCFAF5);' +
      'border-color:var(--gold,#C8992F)}' +
    'button.tt-float:focus-visible{outline:2px solid var(--gold,#C8992F);outline-offset:2px}' +
    'button.tt-float svg{display:block;width:22px;height:22px}' +
    'h1[data-tt-target]:focus{outline:none}' +
    '@media (prefers-reduced-motion:reduce){button.tt-float,button.tt-float.tt-show{transition:none}}' +
    '.tt-spacer{height:calc(72px + env(safe-area-inset-bottom, 0px))}' +
    '@media print{button.tt-float,.tt-spacer{display:none!important}}';
  var style = doc.createElement('style');
  style.id = 'tt-style';
  style.textContent = css;
  (doc.head || root).appendChild(style);

  var btn = doc.createElement('button');
  btn.type = 'button';
  btn.id = 'totop';
  btn.className = 'tt-float';
  btn.title = 'Back to the top of the page';
  btn.setAttribute('aria-label', 'Back to the top of the page');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  doc.body.appendChild(btn);
  var spacer = doc.createElement('div');
  spacer.className = 'tt-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(spacer);

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var shown = false, ticking = false;

  function update() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop || 0;
    var want = y > Math.max(400, window.innerHeight * 0.9);
    if (want !== shown) {
      shown = want;
      btn.classList.toggle('tt-show', want);
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  btn.addEventListener('click', function () {
    var smooth = !(reduce && reduce.matches);
    try { window.scrollTo({ top: 0, left: 0, behavior: smooth ? 'smooth' : 'auto' }); }
    catch (e) { window.scrollTo(0, 0); }
    // Hand keyboard focus to the page title, so the next Tab starts from the top.
    var h1 = doc.querySelector('h1');
    if (h1) {
      if (!h1.hasAttribute('tabindex')) { h1.setAttribute('tabindex', '-1'); h1.setAttribute('data-tt-target', ''); }
      try { h1.focus({ preventScroll: true }); } catch (e) {}
    }
  });
})();
