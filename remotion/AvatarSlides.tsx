import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// Composition : SLIDES en arrière-plan (plein écran, qui défilent) + AVATAR incrusté qui se « tasse »
// dans un coin pour présenter la slide. L'avatar (vidéo D-ID) porte aussi l'AUDIO -> toujours monté.
// Position de l'avatar par slide : 'center' (gros, intro), 'corner' (petit, coin), 'hidden' (hors champ).

export type Slide = { url: string; seconds: number; avatar: 'center' | 'corner' | 'hidden' };
export type CompProps = { avatarUrl: string; slides: Slide[]; corner: 'br' | 'bl' | 'tr' | 'tl' };

export const AvatarSlides: React.FC<CompProps> = ({ avatarUrl, slides, corner }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Découpe temporelle des slides (en frames).
  let acc = 0;
  const segs = slides.map((s) => { const from = acc; const dur = Math.max(1, Math.round((Number(s.seconds) || 0) * fps)); acc += dur; return { ...s, from, dur }; });
  const active = segs.find((s) => frame >= s.from && frame < s.from + s.dur) || segs[segs.length - 1];
  const pos = active?.avatar || 'corner';

  // Transition douce de la position/taille de l'avatar (sur ~12 frames après chaque changement de slide).
  const t = active ? interpolate(frame - active.from, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // Géométrie de l'avatar selon la position.
  const margin = Math.round(width * 0.03);
  const layouts = {
    center: { w: Math.round(width * 0.42), x: Math.round(width * 0.29), y: Math.round(height * 0.16), radius: 24 },
    corner: { w: Math.round(width * 0.22), radius: 18 },
    hidden: { w: Math.round(width * 0.22), radius: 18 },
  } as const;

  const cornerXY = (w: number, h: number) => {
    const right = corner === 'br' || corner === 'tr';
    const bottom = corner === 'br' || corner === 'bl';
    return { x: right ? width - w - margin : margin, y: bottom ? height - h - margin : margin };
  };

  let aw: number, ax: number, ay: number, radius: number, opacity = 1;
  if (pos === 'center') {
    const L = layouts.center; aw = L.w; ax = L.x; ay = L.y; radius = L.radius;
  } else {
    const L = layouts.corner; aw = L.w; const ah = Math.round(aw * 9 / 16); const c = cornerXY(aw, ah); ax = c.x; ay = c.y; radius = L.radius;
    if (pos === 'hidden') { opacity = 0; ay = height + 50; } // hors champ mais TOUJOURS monté (audio continue)
  }
  // Lissage depuis la géométrie « center » de départ (effet « se tasse dans le coin »).
  const startCenter = layouts.center;
  if (pos !== 'center') {
    aw = Math.round(interpolate(t, [0, 1], [startCenter.w, aw]));
    ax = Math.round(interpolate(t, [0, 1], [startCenter.x, ax]));
    ay = Math.round(interpolate(t, [0, 1], [startCenter.y, ay]));
    opacity = interpolate(t, [0, 1], [1, opacity]);
  }
  const ah = Math.round(aw * 9 / 16);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0e14' }}>
      {/* SLIDES en arrière-plan */}
      {segs.map((s, i) => (
        s.url ? (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <AbsoluteFill style={{ backgroundColor: '#0a0e14', alignItems: 'center', justifyContent: 'center' }}>
              <Img src={s.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </AbsoluteFill>
          </Sequence>
        ) : null
      ))}

      {/* AVATAR (vidéo + audio) toujours monté, position animée */}
      {avatarUrl ? (
        <div style={{ position: 'absolute', left: ax, top: ay, width: aw, height: ah, borderRadius: radius, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,.45)', opacity }}>
          <OffthreadVideo src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
