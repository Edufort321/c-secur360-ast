// Service worker minimal — sa présence rend la plateforme installable (PWA).
// Pas de mise en cache agressive : on laisse le navigateur gérer les requêtes.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* pass-through */ });
