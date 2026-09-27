/* back-link.js - a Three Columns class feature, 19 September 2026.

   A reference numeral in column A or C opens its source card in column B. This adds a small
   Back button at the foot of that card, pointing the way the reader came: "← Back" when the
   numeral was in column A (to the left), "Back →" when it was in column C (to the right).
   It returns to the very numeral that was clicked, flashes it, and then goes away. Only the
   card last reached from a numeral carries the button. (Walter, 19 Sep 2026.)

   - Works from the page's own markup: numerals are .fn with data-ref, columns are .col, and
     each column has a tab whose aria-controls names it. It does not need the page's script.
   - Hidden in print.
   - Same file in every instance. Change it in Three Columns Tools/template first, then copy it
     out to the sites, so the class and the instances never drift apart. */
(function () {
  'use strict';
  var doc = document;

  var css =
    '.bk-row{display:flex;margin-top:12px}' +
    '.bk-row.bk-right{justify-content:flex-end}' +
    '.bk-row .bk{cursor:pointer;margin:0}' +
    '.fn.bk-flash{outline:2px solid var(--gold,#C8992F);outline-offset:3px;border-radius:999px}' +
    '@media print{.bk-row{display:none!important}}';
  var style = doc.createElement('style');
  style.id = 'bk-style';
  style.textContent = css;
  (doc.head || doc.documentElement).appendChild(style);

  var row = null, from = null;

  function colOf(el) { return el.closest('.col') || el.closest('[role="tabpanel"]'); }
  function tabFor(col) {
    return col && col.id ? doc.querySelector('[role="tab"][aria-controls="' + col.id + '"]') : null;
  }
  function letterOf(col) {
    var t = tabFor(col), k = t && t.querySelector('.key');
    return k ? k.textContent.trim() : '';
  }
  function motion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto' : 'smooth';
  }
  function clear() {
    if (row && row.parentNode) row.parentNode.removeChild(row);
    row = null; from = null;
  }

  function goBack() {
    var mk = from;
    clear();
    if (!mk) return;
    var tab = tabFor(colOf(mk));
    if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    var d = mk.closest('details');
    if (d && !d.open) d.open = true;
    mk.scrollIntoView({ behavior: motion(), block: 'center' });
    mk.classList.add('bk-flash');
    setTimeout(function () { mk.classList.remove('bk-flash'); }, 1800);
  }

  [].forEach.call(doc.querySelectorAll('.fn[data-ref]'), function (f) {
    f.addEventListener('click', function () {
      var card = doc.getElementById(f.getAttribute('data-ref'));
      var home = colOf(f), there = card && colOf(card);
      if (!card || !home || !there || home === there) return;
      clear();
      // The column the reader came from lies to the left if it comes first in the page.
      var left = !!(home.compareDocumentPosition(there) & Node.DOCUMENT_POSITION_FOLLOWING);
      var letter = letterOf(home);
      row = doc.createElement('div');
      row.className = 'bk-row' + (left ? '' : ' bk-right');
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'bk';
      b.textContent = left ? '← Back' : 'Back →';
      b.title = 'Back to where this source is cited' + (letter ? ', in column ' + letter : '');
      b.setAttribute('aria-label', b.title);
      b.addEventListener('click', goBack);
      row.appendChild(b);
      card.appendChild(row);
      from = f;
    });
  });
})();
