import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GROUND, SKY, SkyPreset } from '../brand';
import { pxPerDeg } from '../lib/groundSky';
import { kf, Keys } from './anim';
import { Horizon, HorizonLayer, HorizonVariant } from './Horizon';
import { SkyView } from './SkyView';

// TILT UP (brand §11 hand-off, ground → space) — the camera pitches up from the horizon: the ground
// (and anything standing on it, `ground` children) slides out of the bottom together — a pure rotation,
// so no parallax between layers — while the sky deepens from its preset to space black and the stars
// come out one by one until it is the space-view starfield. Cut to (or keep) a Starfield after it.
// `progress` 0 → 1 (keys; ease in-out in the body, 'punch' in a hook). Pair with Camera blur for a fast one.
export type TiltUpProps = {
  progress: Keys;
  horizonY: number;
  sky?: SkyPreset; // starting sky (default 'night')
  fov?: number; // default 60
  maxTilt?: number; // degrees of pitch at progress 1 (default 90: looking straight up)
  variant?: HorizonVariant;
  layers?: HorizonLayer[];
  ground?: React.ReactNode; // things on the ground (an Observer): slide out with the horizon
  sky2?: React.ReactNode; // things in the sky (a SkyBody with the same tilt) — pass tilt={tiltKeys} yourself
};

export const tiltFor = (progress: number, maxTilt = 90) => progress * maxTilt;

export const TiltUp: React.FC<TiltUpProps> = ({ progress, horizonY, sky = 'night', fov = GROUND.wideFov as number, maxTilt = 90, variant = 'hills', layers, ground, sky2 }) => {
  const f = useCurrentFrame();
  const p = kf(f, progress, 0);
  const tilt = tiltFor(p, maxTilt);
  const sp = Math.min(1, Math.max(0, (p - 0.35) / 0.6));
  const toSpace = sp * sp * (3 - 2 * sp);
  // stars thicken toward the full space sky as the camera leaves the bright horizon band behind
  const revealK: Keys = Array.from({ length: 16 }, (_, j) => {
    const fr = f - 15 + j;
    const pp = kf(fr, progress, 0);
    const s = Math.min(1, Math.max(0, (pp - 0.35) / 0.6));
    return [fr, Math.max(SKY[sky].stars, s)] as const;
  });
  const dy = tilt * pxPerDeg(fov);
  return (
    <>
      <SkyView sky={sky} fov={fov} tilt={tilt} horizonY={horizonY} toSpace={toSpace} reveal={revealK} />
      {sky2}
      <Horizon layers={layers} variant={variant} fov={fov} tilt={tilt} horizonY={horizonY} sky={sky} />
      {ground && <AbsoluteFill style={{ transform: `translateY(${dy}px)` }}>{ground}</AbsoluteFill>}
    </>
  );
};
