import { NextResponse } from 'next/server';

// Version unique par déploiement — le navigateur détecte le changement octet-par-octet
// et déclenche install → activate → rechargement transparent.
// Vercel injecte VERCEL_DEPLOYMENT_ID automatiquement ; en local on tombe sur le timestamp.
const BUILD_VERSION =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  Date.now().toString();

const SW_CONTENT = `// C-Secur360 — Service Worker v${BUILD_VERSION}
const VERSION = '${BUILD_VERSION}';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    // Purge TOUS les anciens caches (laissés par d'anciennes versions agressives du SW) -> fini le contenu périmé.
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .catch(() => {})
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' })))
  );
});

self.addEventListener('fetch', () => { /* pass-through — pas de cache agressif */ });
`;

export function GET() {
  return new NextResponse(SW_CONTENT, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      // Jamais mis en cache HTTP — le navigateur doit toujours vérifier le fichier
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
