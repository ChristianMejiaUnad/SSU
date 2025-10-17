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

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(k => k !== 'reciclaje-store').map(k => caches.delete(k)));
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