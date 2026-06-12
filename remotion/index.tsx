import { registerRoot, Composition } from 'remotion';
import React from 'react';
import { AvatarSlides, type CompProps } from './AvatarSlides';

const DEFAULT: CompProps = {
  avatarUrl: '',
  corner: 'br',
  slides: [{ url: '', seconds: 6, avatar: 'center' }],
};

const FPS = 30;
const totalFrames = (p: CompProps) => Math.max(1, Math.round(p.slides.reduce((s, x) => s + (Number(x.seconds) || 0), 0) * FPS));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AvatarSlides"
    component={AvatarSlides as any}
    durationInFrames={totalFrames(DEFAULT)}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={DEFAULT}
    // Recalcule la durée à partir des props réelles (somme des durées de slides).
    calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props as CompProps) })}
  />
);

registerRoot(RemotionRoot);
