import { NextResponse } from 'next/server';

// Manifest PWA tenant-aware : un PWA installe depuis l'espace d'un tenant s'ouvre
// directement sur SON auth (/{tenant}/login) et reste cantonne a son scope.
// Sert /{tenant}/manifest.webmanifest (lie par app/[tenant]/layout.tsx).
export const dynamic = 'force-dynamic';

export function GET(_req: Request, { params }: { params: { tenant: string } }) {
  const tenant = params.tenant;
  const manifest = {
    id: `/${tenant}`,
    name: `C-Secur360 — ${tenant}`,
    short_name: 'C-Secur360',
    description: 'Plateforme SST C-Secur360 (AST, planificateur, inventaire, comptabilite…)',
    start_url: `/${tenant}/login`,
    scope: `/${tenant}/`,
    display: 'standalone',
    orientation: 'any',
    background_color: '#0f172a',
    theme_color: '#10b981',
    icons: [
      { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/csecur360-logo-v2025.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/csecur360-logo-v2025.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
