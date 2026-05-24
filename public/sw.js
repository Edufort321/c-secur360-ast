// Service worker — installe immédiatement et prend le contrôle de tous les clients.
// Notifie l'app quand une nouvelle version est prête (reload transparent).
const VERSION = 'v1'; // bumped at each deploy by the build

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim().then(() => {
      // Notifie tous les onglets ouverts qu'une nouvelle version est active
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      });
    })
  );
});

self.addEventListener('fetch', () => { /* pass-through — pas de cache agressif */ });
