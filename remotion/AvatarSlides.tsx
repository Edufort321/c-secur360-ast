import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// Composition : SLIDES en arrière-plan (fondu enchaîné entre elles) + AVATAR incrusté qui se « tasse »
// dans un coin + SOUS-TITRES incrustés en bas. L'avatar (vidéo D-ID) porte l'AUDIO -> toujours monté.
// avatar par slide : 'center' (gros, intro), 'corner' (petit, coin), 'hidden' (hors champ, voix continue).

export type Slide = { url: string; seconds: number; avatar: 'center' | 'corner' | 'hidden'; caption?: string };
export type CompProps = { avatarUrl: string; slides: Slide[]; corner: 'br' | 'bl' | 'tr' | 'tl' };

export const AvatarSlides: React.FC<CompProps> = ({ avatarUrl, slides, corner }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Découpe temporelle (frames), timeline cumulée simple (l'audio de l'avatar suit).
  let acc = 0;
  const segs = slides.map((s) => { const from = acc; const dur = Math.max(1, Math.round((Number(s.seconds) || 0) * fps)); acc += dur; return { ...s, from, dur, end: from + dur }; });
  const active = segs.find((s) => frame >= s.from && frame < s.end) || segs[segs.length - 1];
  const pos = active?.avatar || 'corner';
  const t = active ? interpolate(frame - active.from, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Géométrie avatar ──
  const margin = Math.round(width * 0.03);
  const center = { w: Math.round(width * 0.42), x: Math.round(width * 0.29), y: Math.round(height * 0.16) };
  let aw: number, ax: number, ay: number, radius: number, opacity = 1;
  if (pos === 'center') { aw = center.w; ax = center.x; ay = center.y; radius = 24; }
  else {
    aw = Math.round(width * 0.22); const ah0 = Math.round(aw * 9 / 16); radius = 18;
    const right = corner === 'br' || corner === 'tr'; const bottom = corner === 'br' || corner === 'bl';
    ax = right ? width - aw - margin : margin; ay = bottom ? height - ah0 - margin : margin;
    if (pos === 'hidden') { opacity = 0; ay = height + 50; }
    // « se tasse » : interpole depuis la position centrale.
    aw = Math.round(interpolate(t, [0, 1], [center.w, aw]));
    ax = Math.round(interpolate(t, [0, 1], [center.x, ax]));
    ay = Math.round(interpolate(t, [0, 1], [center.y, ay]));
    opacity = interpolate(t, [0, 1], [1, opacity]);
  }
  const ah = Math.round(aw * 9 / 16);

  // ── Sous-titre actif (fondu rapide au changement) ──
  const caption = active?.caption || '';
  const capOpacity = active ? interpolate(frame - active.from, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e14' }}>
      {/* SLIDES avec FONDU ENCHAÎNÉ */}
      {segs.map((s, i) => {
        const fadeF = Math.min(12, Math.max(3, Math.floor(s.dur / 3)));
        const tailEnd = i < segs.length - 1 ? s.end + fadeF : s.end; // prolonge pour croiser avec la suivante
        if (!s.url || frame < s.from || frame >= tailEnd) return null;
        const op = interpolate(frame, [s.from, s.from + fadeF], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <AbsoluteFill key={i} style={{ opacity: op, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e14' }}>
            <Img src={s.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </AbsoluteFill>
        );
      })}

      {/* AVATAR (vidéo + audio) toujours monté, position animée */}
      {avatarUrl ? (
        <div style={{ position: 'absolute', left: ax, top: ay, width: aw, height: ah, borderRadius: radius, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,.45)', opacity }}>
          <OffthreadVideo src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}

      {/* SOUS-TITRES incrustés en bas */}
      {caption ? (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: Math.round(height * 0.06), display: 'flex', justifyContent: 'center', opacity: capOpacity }}>
          <div style={{
            maxWidth: '78%', background: 'rgba(8,12,18,.78)', color: '#fff', padding: '14px 26px', borderRadius: 12,
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: Math.round(width * 0.022), lineHeight: 1.35, textAlign: 'center',
            fontWeight: 600, textShadow: '0 2px 6px rgba(0,0,0,.5)',
          }}>{caption}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
