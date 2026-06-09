import { ImageResponse } from 'next/og';

// Icône PWA générée dynamiquement : le logo C-Secur360 centré sur une PASTILLE BLEU NAVY (#111827),
// la couleur du header principal (bg-gray-900). Plein cadre -> compatible « maskable » (l'OS recadre
// en cercle/squircle, on garde donc du navy partout). Utilisée par les manifests (192 et 512).
export const runtime = 'nodejs';

const NAVY = '#111827';

export async function GET(req: Request) {
  const { origin, searchParams } = new URL(req.url);
  const size = Math.min(1024, Math.max(64, Number(searchParams.get('size')) || 512));
  const logo = Math.round(size * 0.62); // zone de sécurité « maskable » (~62 % du cadre)
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
