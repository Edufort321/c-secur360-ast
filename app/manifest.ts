import type { MetadataRoute } from 'next';

// Manifest PWA de la plateforme (installable depuis le portail).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'C-Secur360',
    short_name: 'C-Secur360',
    description: 'Plateforme SST modulaire C-Secur360 (AST, Projets, Inventaire, Planificateur…)',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#111827',
    icons: [
      { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
