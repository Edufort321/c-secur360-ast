import { ImageResponse } from 'next/og';

// Image de partage social (Open Graph / Twitter) générée dynamiquement en 1200×630, à la marque
// C-Secur360. Convention Next.js : les balises og:image / twitter:image sont câblées automatiquement.
export const runtime = 'edge';
export const alt = 'C-Secur360 — plateforme SST tout-en-un';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0B1728 0%, #0D2040 55%, #0B1728 100%)',
          color: '#ffffff',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* En-tête : marque + surtitre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <div
            style={{
              display: 'flex',
              width: 100,
              height: 100,
              borderRadius: 24,
              background: '#F26522',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 58,
              fontWeight: 800,
              color: '#0B1728',
            }}
          >
            C
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: 2, color: '#F7A072' }}>
            SÉCURITÉ INDUSTRIELLE · SST
          </div>
        </div>

        {/* Titre + accroche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 108, fontWeight: 800, lineHeight: 1 }}>C-Secur360</div>
          <div style={{ display: 'flex', fontSize: 46, color: '#cbd5e1' }}>
            Plateforme SST tout-en-un pour l&apos;industrie
          </div>
        </div>

        {/* Puces de valeur */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['17 modules', 'Conforme CNESST', 'FR / EN', 'Fait au Canada'].map((t) => (
            <div
              key={t}
              style={{
                display: 'flex',
                fontSize: 30,
                fontWeight: 600,
                color: '#e2e8f0',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: 999,
                padding: '12px 28px',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
