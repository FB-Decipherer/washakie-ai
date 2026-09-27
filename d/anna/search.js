/* search.js — one box, and the page is its own index.

   When the page loads this walks what is actually on it — every answer in column A,
   every card in column B, every section in column C — and builds the index from the
   text it finds. Nothing is maintained by hand, so the index cannot fall out of step
   with the page. Nothing is fetched and nothing is stored; the search runs in the
   browser over text the browser already has. If this file is missing, the box never
   appears and the rest of the page is unaffected. */
(function () {
  var bar = document.getElementById('searchbar');
  var inp = document.getElementById('sitesearch');
  var out = document.getElementById('searchout');
  var stat = document.getElementById('searchstatus');
  if (!bar || !inp || !out) return;

  var items = [];
  function text(el) { return el.textContent.replace(/\s+/g, ' ').trim(); }

  /* the text of a passage as a reader would say it: citation numerals dropped, and a space
     where one block ends and the next begins, so "forty-five" and "13" do not run together. */
  function bodyText(el) {
    var c = el.cloneNode(true), fns = c.querySelectorAll('.fn'), i;
    for (i = 0; i < fns.length; i++) fns[i].parentNode.replaceChild(document.createTextNode(' '), fns[i]);
    c.innerHTML = c.innerHTML.replace(/<\/(div|p|li|h2|h3|summary|span|article|a)>/g, '</$1> ');
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function rx(w) { return new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'); }

  function build() {
    document.querySelectorAll('#cA details').forEach(function (d) {
      var s = d.querySelector('summary');
      items.push({ el: d, col: 'A', head: s ? text(s) : 'Answer', body: bodyText(d) });
    });
    document.querySelectorAll('#cB .bcard').forEach(function (a) {
      items.push({ el: a, col: 'B', head: 'Most recent content change', body: bodyText(a) });
    });
    document.querySelectorAll('#cB .ref').forEach(function (r) {
      var n = r.querySelector('.rnum'), t = r.querySelector('.rtitle');
      items.push({ el: r, col: 'B', head: (n ? text(n) + ' · ' : '') + (t ? text(t) : 'Source'), body: bodyText(r) });
    });
    var c = document.getElementById('cC');
    if (c) {
      var kids = c.children, cur = null;
      for (var i = 0; i < kids.length; i++) {
        var k = kids[i];
        if (k.tagName === 'H2') { cur = { el: k, col: 'C', head: text(k), body: bodyText(k) }; items.push(cur); }
        else if (cur) { cur.body += ' ' + bodyText(k); }
      }
    }
    items.forEach(function (it) { it.low = it.body.toLowerCase(); it.headLow = it.head.toLowerCase(); });
  }

  function snippet(it, words) {
    var at = -1;
    for (var i = 0; i < words.length && at < 0; i++) at = it.low.indexOf(words[i]);
    if (at < 0) at = 0;
    var s = Math.max(0, at - 70), e = Math.min(it.body.length, s + 190);
    var t = esc(it.body.slice(s, e));
    for (var j = 0; j < words.length; j++) t = t.replace(rx(words[j]), '<mark>$&</mark>');
    return (s > 0 ? '…' : '') + t + (e < it.body.length ? '…' : '');
  }

  function reveal(it) {
    var col = it.el.closest('.col');
    if (col) {
      var tab = document.querySelector('[aria-controls="' + col.id + '"]');
      if (tab) tab.click();
    }
    var d = it.el.tagName === 'DETAILS' ? it.el : it.el.closest('details');
    if (d) d.open = true;
    it.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    it.el.classList.add('flash');
    setTimeout(function () { it.el.classList.remove('flash'); }, 1600);
  }

  function run() {
    var q = inp.value.trim().toLowerCase();
    out.innerHTML = ''; out.hidden = true;
    if (stat) stat.textContent = '';
    if (q.length < 2) return;
    var words = q.split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1; });
    if (!words.length) return;
    var hits = [];
    items.forEach(function (it) {
      var score = 0, all = true;
      words.forEach(function (w) {
        var n = it.low.split(w).length - 1;
        if (!n) all = false; else score += n + (it.headLow.indexOf(w) >= 0 ? 5 : 0);
      });
      if (all) hits.push({ it: it, s: score });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    if (!hits.length) {
      out.innerHTML = '<p class="sr-none">Nothing on this page matches that.</p>';
      out.hidden = false;
      if (stat) stat.textContent = 'No matches.';
      return;
    }
    var h = '';
    hits.slice(0, 8).forEach(function (x) {
      h += '<a href="#" data-i="' + items.indexOf(x.it) + '">'
         + '<span class="sr-k">' + x.it.col + '</span>'
         + '<span class="sr-t">' + esc(x.it.head) + '</span>'
         + '<span class="sr-x">' + snippet(x.it, words) + '</span></a>';
    });
    out.innerHTML = h; out.hidden = false;
    if (stat) stat.textContent = hits.length + (hits.length === 1 ? ' match' : ' matches') + ' on this page.';
  }

  out.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-i]');
    if (!a) return;
    e.preventDefault();
    out.hidden = true;
    reveal(items[+a.getAttribute('data-i')]);
  });
  inp.addEventListener('input', run);
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { inp.value = ''; run(); inp.blur(); }
    else if (e.key === 'Enter') {
      var a = out.querySelector('a[data-i]');
      if (a) { e.preventDefault(); a.click(); }
    }
  });
  document.addEventListener('click', function (e) { if (!bar.contains(e.target)) out.hidden = true; });

  build();
  bar.hidden = false;
})();
