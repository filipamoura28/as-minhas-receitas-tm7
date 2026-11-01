const CACHE = 'tm7-shell-v1';
const SHELL = ['./', './index.html', './src/app.js', './src/data.js', './src/style.css', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tm7-shell-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).catch(error => { if (event.request.mode === 'navigate') return caches.match('./index.html'); throw error; })));
});
