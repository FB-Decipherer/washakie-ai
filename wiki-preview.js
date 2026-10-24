/* wiki-preview.js - a GYR-O class feature, 14 October 2026.

   A term in the running text carries a short Wikipedia preview: hover it, tap it, or focus it
   and press Enter, and a small card opens under it with the article's opening lines, the date
   that text was taken, and the link last. It is the same bargain column B makes - read the
   preview and decide whether you need the round trip at all - brought inline for a term that
   does not deserve a source card of its own.

   The text is BAKED, not fetched. The page carries the extracts it needs inside itself, put
   there by "BAKE WIKI PREVIEWS.command" when the author runs it. Nothing is requested from
   Wikipedia, or from anywhere else, while a reader is reading. That keeps every claim this
   format makes: no dependencies, nothing to hack, works with the network off, and an archived
   copy still shows its previews in ten years. The cost is that the text is a snapshot, so the
   card always says the date it was taken. (Walter, 14 Oct 2026.)

   - Markup: a span of class wk carrying data-wk="Page_title", and one JSON block in the page,
     a script of type application/json with id="wk-data", holding an entry per title.
   - A term with no entry stays completely plain - not underlined, not focusable - so the
     marker only ever appears where a preview actually exists. That marker is the same hairline
     every other interactive word on the page already carries, so previews add no new vocabulary.
   - Wikipedia text is CC BY-SA; the card carries that and the link, which is what the licence
     asks for.
   - Hidden in print; the term prints as ordinary text.
   - Same file in every instance. Change it in Three Columns Tools/template first, then copy it
     out to the sites, so the class and the instances never drift apart. */
(function () {
  'use strict';
  var doc = document, data = null, pop = null, host = null, timer = null;

  var src = doc.getElementById('wk-data');
  if (!src) return;
  try { data = JSON.parse(src.textContent || '{}'); } catch (e) { return; }

  var css =
    /* A Wikipedia preview is marked with a faint DOTTED underline, so it never looks like an
       ordinary link (solid underline) to some other site. */
    '.wk,a.wk{text-decoration:none!important;border-bottom:1.5px dotted rgba(110,104,94,.55)!important;cursor:pointer}' +
    '.wk:hover,a.wk:hover{border-bottom-color:var(--accentb,#B4372C)!important}' +
    '.wk:focus-visible{outline:2px solid var(--gold,#C8992F);outline-offset:2px}' +
    '.wk-pop{position:absolute;z-index:60;max-width:22rem;min-width:15rem;' +
      'background:var(--card,#F5F1E8);color:var(--ink,#1E1B16);' +
      'border:1px solid var(--rule,#DCD5C6);border-radius:9px;padding:13px 14px;' +
      'box-shadow:0 6px 22px rgba(0,0,0,.14);font-size:15px;line-height:1.5}' +
    '.wk-pop .wk-kind{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:10.5px;' +
      'letter-spacing:.13em;text-transform:uppercase;color:var(--ink-mid,#4A443A)}' +
    '.wk-pop .wk-ttl{font-weight:600;margin-top:3px}' +
    '.wk-pop .wk-ex{margin-top:7px}' +
    '.wk-pop .wk-as{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:10.5px;' +
      'color:var(--ink-mid,#4A443A);margin-top:9px}' +
    '.wk-pop .wk-lnk{display:block;margin-top:4px;font-size:13px;word-break:break-word;' +
      'color:inherit;border-bottom:1px solid var(--rule,#DCD5C6);text-decoration:none}' +
    '.wk-pop .wk-lnk:hover{border-bottom-color:var(--accentb,#B4372C)}' +
    '@media print{.wk{border-bottom:0}.wk-pop{display:none!important}}';
  var style = doc.createElement('style');
  style.id = 'wk-style';
  style.textContent = css;
  (doc.head || doc.documentElement).appendChild(style);

  function close() {
    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    pop = null; host = null;
  }

  function open(term) {
    var key = term.getAttribute('data-wk'), d = data[key];
    if (!d) return;
    if (host === term) return;
    close();
    host = term;

    pop = doc.createElement('div');
    pop.className = 'wk-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Wikipedia preview: ' + (d.title || key));

    function add(cls, text) {
      if (!text) return;
      var e = doc.createElement('div');
      e.className = cls; e.textContent = text; pop.appendChild(e);
    }
    add('wk-kind', 'Wikipedia' + (d.description ? ' · ' + d.description : ''));
    add('wk-ttl', d.title || key.replace(/_/g, ' '));
    add('wk-ex', d.extract);
    add('wk-as', 'Text taken ' + (d.taken || 'undated') + ' · CC BY-SA · may have changed since');

    if (d.url) {
      var a = doc.createElement('a');
      a.className = 'wk-lnk';
      a.href = d.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = d.url.replace(/^https?:\/\//, '');
      pop.appendChild(a);
    }
    doc.body.appendChild(pop);

    var r = term.getBoundingClientRect(), pr = pop.getBoundingClientRect();
    var left = r.left + window.scrollX;
    var maxL = window.scrollX + doc.documentElement.clientWidth - pr.width - 12;
    if (left > maxL) left = maxL;
    if (left < window.scrollX + 12) left = window.scrollX + 12;
    var top = r.bottom + window.scrollY + 7;
    if (r.bottom + pr.height + 16 > doc.documentElement.clientHeight)
      top = r.top + window.scrollY - pr.height - 7;
    pop.style.left = Math.round(left) + 'px';
    pop.style.top = Math.round(top) + 'px';
  }

  [].forEach.call(doc.querySelectorAll('.wk[data-wk]'), function (t) {
    if (!data[t.getAttribute('data-wk')]) {       // nothing baked: leave it plain
      t.classList.remove('wk');
      return;
    }
    t.setAttribute('tabindex', '0');
    t.setAttribute('role', 'button');
    t.setAttribute('aria-label', 'Wikipedia preview: ' + t.textContent.trim());

    t.addEventListener('click', function (e) {
      e.stopPropagation();
      // A marked LINK still goes where it points. On a touch screen, where there is no hover,
      // the first tap shows the preview and the second follows the link.
      if (t.tagName === 'A') {
        var touch = !(window.matchMedia && window.matchMedia('(hover: hover)').matches);
        if (touch && host !== t) { e.preventDefault(); open(t); }
        return;
      }
      (host === t) ? close() : open(t);
    });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); open(t); }
      if (e.key === 'Escape') { close(); t.focus(); }
    });
    if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
      t.addEventListener('mouseenter', function () {
        clearTimeout(timer); timer = setTimeout(function () { open(t); }, 350);
      });
      t.addEventListener('mouseleave', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { if (pop && !pop.matches(':hover')) close(); }, 260);
      });
    }
  });

  doc.addEventListener('click', function (e) { if (pop && !pop.contains(e.target)) close(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', close);
  window.addEventListener('scroll', function () { if (pop) close(); }, { passive: true });
})();
