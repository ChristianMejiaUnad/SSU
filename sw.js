self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('reciclaje-store').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.js',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== 'reciclaje-store').map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('push', function(event) {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icono.png'
  });
});