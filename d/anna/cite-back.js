/* cite-back.js - a Three Columns class feature, 14 October 2026.

   Every source card in column B opens with a small numbered circle. This makes that circle a
   standing way back: click it and the page goes to the numeral in column A or C that cites the
   card, and flashes it, exactly as the Back button does. Where a card is cited in more than one
   place, successive clicks visit each in turn. A card that nothing cites is left alone and its
   circle stays plain, so the circle is only ever live when it leads somewhere.

   This is the permanent counterpart to back-link.js, which puts a Back button only on the card
   the reader has just arrived at, and takes it away again. This one is always there, whether
   the reader arrived by numeral, by scrolling, or by a link from outside. (Walter, 14 Oct 2026.)

   - Works from the page's own markup: cards are .ref with an id and a .rnum circle, numerals are
     .fn with data-ref naming that id, columns are .col with a tab whose aria-controls names them.
     It needs nothing from the page's own script, but will use window.threeColReveal to open a
     collapsed passage where the page provides it.
   - The circle keeps the same affordance .fn already has: pointer, and the accent border on hover.
   - Keyboard reachable; honors prefers-reduced-motion; inert in print.
   - Same file in every instance. Change it in Three Columns Tools/template first, then copy it
     out to the sites, so the class and the instances never drift apart. */
(function () {
  'use strict';
  var doc = document;

  var css =
    '.rnum.cb{cursor:pointer}' +
    '.rnum.cb:hover{border-color:var(--accentb,#B4372C)}' +
    '.rnum.cb:focus-visible{outline:2px solid var(--gold,#C8992F);outline-offset:2px}' +
    '.fn.cb-flash{outline:2px solid var(--gold,#C8992F);outline-offset:3px;border-radius:999px}' +
    '@media print{.rnum.cb{cursor:auto}}';
  var style = doc.createElement('style');
  style.id = 'cb-style';
  style.textContent = css;
  (doc.head || doc.documentElement).appendChild(style);

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

  function goTo(mk) {
    var tab = tabFor(colOf(mk));
    if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    if (window.threeColReveal) { try { window.threeColReveal(mk); } catch (e) {} }
    var d = mk.closest('details');
    while (d) { if (!d.open) d.open = true; d = d.parentNode && d.parentNode.closest ? d.parentNode.closest('details') : null; }
    mk.scrollIntoView({ behavior: motion(), block: 'center' });
    mk.classList.add('cb-flash');
    setTimeout(function () { mk.classList.remove('cb-flash'); }, 1800);
  }

  [].forEach.call(doc.querySelectorAll('.ref[id]'), function (card) {
    var dot = card.querySelector('.rnum');
    if (!dot) return;
    var marks = [].slice.call(doc.querySelectorAll('.fn[data-ref="' + card.id + '"]'));
    if (!marks.length) return;

    var where = [], seen = {};
    marks.forEach(function (m) {
      var L = letterOf(colOf(m));
      if (L && !seen[L]) { seen[L] = 1; where.push(L); }
    });
    var label = marks.length === 1
      ? 'Back to where this is cited' + (where[0] ? ', in column ' + where[0] : '')
      : 'Cited in ' + marks.length + ' places' +
        (where.length ? ', in column ' + where.join(' and ') : '') +
        '. Click for each in turn.';

    dot.classList.add('cb');
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('aria-label', label);
    dot.setAttribute('title', label);

    var i = 0;
    function hop() { goTo(marks[i % marks.length]); i += 1; }
    dot.addEventListener('click', hop);
    dot.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); hop(); }
    });
  });
})();
