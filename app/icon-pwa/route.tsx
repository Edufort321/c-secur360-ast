import { ImageResponse } from 'next/og';

// Icône PWA générée dynamiquement : le logo C-Secur360 sur une PASTILLE RONDE bleu navy (#111827),
// le logo occupant ~90 % de la pastille. Cercle plein (borderRadius 50 %). Sur Android « maskable »
// l'OS recadre en cercle (la pastille est déjà ronde -> parfait) ; sur iOS le coin transparent se
// fond dans le navy. Utilisée par les manifests + apple-touch-icon (192 / 512 / 180).
export const runtime = 'nodejs';

const NAVY = '#111827';

export async function GET(req: Request) {
  const { origin, searchParams } = new URL(req.url);
  const size = Math.min(1024, Math.max(64, Number(searchParams.get('size')) || 512));
  const logo = Math.round(size * 0.9); // logo = 90 % de la pastille (bien gros)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: NAVY,
          borderRadius: '50%', // PASTILLE RONDE (cercle plein)
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${origin}/logo.png`} width={logo} height={logo} style={{ objectFit: 'contain' }} />
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { 'Cache-Control': 'public, max-age=86400, immutable' },
    },
  );
}
