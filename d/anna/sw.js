/* sw.js — offline for the field. Washakie County has places with no signal, and a call
   sheet that needs a connection is no use in a shop with thick walls.
   Cache-first for the shell, but every fetch also refreshes the cache in the background,
   so a republished page is picked up on the next visit rather than being stuck forever. */
const CACHE = 'demo-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './portrait.png', './links.json', './phone-view.js', './top-button.js', './back-link.js', './search.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => {
    const live = fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit);
    return hit || live;
  }));
});
