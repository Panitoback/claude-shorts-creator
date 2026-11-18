import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CANVAS, GROUND, SKY, SkyPreset } from '../brand';
import { kf, Keys } from './anim';
import { groundYAt, Horizon, HorizonLayer, HorizonVariant } from './Horizon';
import { Marker } from './Marker';
import { Observer, ObserverPose } from './Observer';
import { Planet } from './Planet';
import { SkyView } from './SkyView';

// PULL BACK TO EARTH (brand §11 hand-off, ground → space) — from the observer, the camera rises: the
// ground shrinks around the spot where they stand, the flat horizon starts to curve (Earth's true
// curvature for the zoom: a log-scale zoom from a ~200,000 px radius down to the final globe), the sky
// thins to space above a thin atmosphere limb, and the dark ground becomes Earth seen from space (the
// Planet component), with a marker ring where the observer stood. `progress` 0 → 1 (keys: ease in-out,
// or 'punch' in a hook); add Camera blur over the fast middle (brand §8) and one deep whoosh.
export type PullBackToEarthProps = {
  progress: Keys;
  horizonY: number;
  x0?: number; // observer x at the start (default frame center)
  sky?: SkyPreset; // default 'night'
  variant?: HorizonVariant;
  layers?: HorizonLayer[];
  observer?: { h: number; pose?: ObserverPose } | false; // default { h: 150, pose: 'standing' }
  end: { x: number; y: number; r: number }; // the final globe
  lon0?: number; // which longitude of Earth faces us at the end
  marker?: { label: string; value?: string; at: number }; // marker ring on the observer's spot (frame)
};

const R0 = 2e5;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const PullBackToEarth: React.FC<PullBackToEarthProps> = ({
  progress, horizonY, x0 = CANVAS.W / 2, sky = 'night', variant = 'hills', layers, observer = { h: 150, pose: 'standing' }, end, lon0, marker,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `pb${Math.floor(x0)}${Math.floor(end.r)}`, [x0, end.r]);
  const p = kf(f, progress, 0);
  const R = Math.exp(Math.log(R0) + (Math.log(end.r) - Math.log(R0)) * p);
  const m = smooth(0, 1, p);
  const gx = x0 + (end.x - x0) * m;
  const gy = horizonY + (end.y - end.r - horizonY) * m;
  const s = R / R0; // scale of everything standing on the ground
  const cx = gx;
  const cy = gy + R;
  const toSpace = smooth(0.08, 0.5, p);
  // the globe is drawn once R < 4 × the final radius; it fades in from that moment
  const p4 = Math.log((4 * end.r) / R0) / Math.log(end.r / R0);
  const planetOn = smooth(p4, Math.min(1, p4 + 0.15), p);
  const groundOp = 1 - smooth(0.05, 0.3, p);
  const revealK: Keys = Array.from({ length: 16 }, (_, j) => {
    const fr = f - 15 + j;
    return [fr, Math.max(SKY[sky].stars, smooth(0.08, 0.5, kf(fr, progress, 0)))] as const;
  });
  const atm = R * 1.03;

  return (
    <>
      <SkyView sky={sky} horizonY={horizonY} toSpace={toSpace} reveal={revealK} />
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <radialGradient id={`${id}a`} cx={cx} cy={cy} r={atm} gradientUnits="userSpaceOnUse">
            <stop offset={`${(R / atm) * 100 - 0.01}%`} stopColor="#9cc7ff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#9cc7ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* the thin atmosphere limb (true thickness ~1.6 % of the radius, drawn a little soft) */}
        <circle cx={cx} cy={cy} r={atm} fill={`url(#${id}a)`} opacity={smooth(0.12, 0.45, p) * (1 - planetOn * 0.6)} />
        {/* the ground as one dark disc until the globe takes over */}
        <circle cx={cx} cy={cy} r={R} fill={GROUND.land} opacity={1 - planetOn} />
      </svg>
      {R < end.r * 4 && (
        <AbsoluteFill style={{ opacity: planetOn }}>
          <Planet x={cx} y={cy} r={R} kind="earth" light={225} phase={0.8} lon0={lon0} warm />
        </AbsoluteFill>
      )}
      {groundOp > 0 && (
        <AbsoluteFill style={{ opacity: groundOp, transformOrigin: `${x0}px ${horizonY}px`, transform: `translate(${gx - x0}px, ${gy - horizonY}px) scale(${s})` }}>
          <Horizon layers={layers} variant={variant} horizonY={horizonY} sky={sky} />
          {observer && <Observer x={x0} y={groundYAt(x0, horizonY, { layers, variant }) + 3} h={observer.h} pose={observer.pose ?? 'standing'} />}
        </AbsoluteFill>
      )}
      {marker && <Marker x={gx} y={gy} label={marker.label} value={marker.value} side="above" length={70} ringR={16} at={marker.at} />}
    </>
  );
};
