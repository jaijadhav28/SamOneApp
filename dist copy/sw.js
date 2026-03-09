// sw.js - Basic Service Worker for PWA
self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('mockmentor-store').then((cache) => cache.addAll([
        '/',
        '/home.html',
        '/dashboard.html',
        '/interview.html',
        '/report.html',
        '/firebase-config.js'
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });
