// Rota Tambasa — funciona offline. Versão 49f107dfec
const CACHE = 'rota-49f107dfec';
const BASICO = ['./', 'index.html', 'manifest.webmanifest', 'firebase-config.js', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // dados do Firebase/Google: nunca pelo cache (o próprio Firebase guarda offline)
  if (/firestore|googleapis\.com\/(identitytoolkit|securetoken)|accounts\.google/.test(u.href)) return;
  const bibliotecas = /gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.href);
  if (bibliotecas) { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return res; }))); return; }
  if (u.origin === location.origin) { // app: tenta a versão nova, sem internet usa a guardada
    e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
  }
});
