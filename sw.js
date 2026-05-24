const CACHE = 'czm-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-96.png'];

/* ── Instalação: pré-cache ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

/* ── Ativação: limpa caches antigos ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first para assets, network-first para API ── */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Deixa requisições da Twitch API passarem sempre pela rede
  if (url.hostname.includes('twitch.tv') || url.hostname.includes('googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

/* ── Notificação: clique abre o canal ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url;
  if (!url) return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url === url && 'focus' in c);
      return existing ? existing.focus() : clients.openWindow(url);
    })
  );
});
