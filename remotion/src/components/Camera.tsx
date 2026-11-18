import React, { createContext, useContext } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { EASE, SAFE_RECT } from '../brand';
import { EaseName, kf, Key, Keys } from './anim';

// LIVING CAMERA (brand §8 "a camera that's never static"). One virtual camera for a whole short:
// - a slow constant drift (a few px, ~12 s period, plus a ±0.5 % breathing zoom), so no frame is a still;
// - camera moves as keyframes (x, y in px, zoom as a multiplier), e.g. windupKeys() for anticipation;
// - punch-ins on the big hits: zoom 1 → 1 + punch (default 0.03) in 6 frames (ease-out), then it relaxes
//   back over ~1.2 s (ease in-out). No overshoot, no shake (both banned);
// - optional motion blur (@remotion/motion-blur) ONLY inside the `blur` frame windows (fast moves).
// Scenes put their content in <CameraLayer depth>: depth 1 = the objects (full camera move), < 1 = far
// layers that move less (parallax), 0 = fixed (titles that must not move).
export type CamState = { x: number; y: number; zoom: number; ox: number; oy: number };
const Ctx = createContext<CamState>({ x: 0, y: 0, zoom: 1, ox: SAFE_RECT.x + SAFE_RECT.w / 2, oy: SAFE_RECT.y + SAFE_RECT.h / 2 });
export const useCamera = () => useContext(Ctx);

export type CameraProps = {
  children: React.ReactNode;
  x?: Keys; // camera position, px (default 0)
  y?: Keys;
  zoom?: Keys; // multiplier (default 1)
  drift?: number; // px of slow drift (default 10; 0 = locked)
  driftAmp?: Keys; // drift multiplier over time (default 1), e.g. 0 in a hook/loop so frame 0 = the last frame
  driftPeriod?: number; // seconds (default 12)
  punches?: number[]; // frames of the punch-ins (the big hits, on the beat)
  punch?: number; // punch-in amount (default 0.03)
  origin?: [number, number]; // zoom center (default the safe-rect center)
  blur?: [number, number][]; // [from, to] frame windows that get motion blur (fast moves only)
  shutter?: number; // motion-blur shutter angle (default 180)
  samples?: number; // motion-blur samples (default 8; render cost grows ~linearly with it)
  seed?: number;
};

export const PUNCH_IN = 6;
export const PUNCH_OUT = 36;
export const punchShape = (d: number) =>
  d < 0 ? 0 : d < PUNCH_IN ? EASE.out(d / PUNCH_IN) : d < PUNCH_IN + PUNCH_OUT ? 1 - EASE.inOut((d - PUNCH_IN) / PUNCH_OUT) : 0;

// anticipation: a small move the other way (amount × the move) during `wind` frames, then the move itself
export const windupKeys = (from: number, to: number, at: number, len: number, wind = 8, amount = 0.08, ease: EaseName = 'out'): Key[] => [
  [at - wind, from],
  [at, from - (to - from) * amount, 'inOut'],
  [at + len, to, ease],
];

const CameraInner: React.FC<CameraProps> = ({
  children, x = 0, y = 0, zoom = 1, drift = 10, driftAmp = 1, driftPeriod = 12, punches = [], punch = 0.03, origin, seed = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const P = driftPeriod;
  const ph = seed * 1.7;
  const amp = drift * kf(f, driftAmp, 1);
  const dx = amp * Math.sin((2 * Math.PI * t) / P + ph);
  const dy = amp * 0.7 * Math.sin((2 * Math.PI * t) / (P * 1.31) + ph * 2.1);
  const dz = (drift > 0 ? 0.0005 * amp : 0) * Math.sin((2 * Math.PI * t) / (P * 1.7) + ph * 0.7);
  let z = kf(f, zoom, 1) * (1 + dz);
  for (const p of punches) z *= 1 + punch * punchShape(f - p);
  const [ox, oy] = origin ?? [SAFE_RECT.x + SAFE_RECT.w / 2, SAFE_RECT.y + SAFE_RECT.h / 2];
  return <Ctx.Provider value={{ x: kf(f, x, 0) + dx, y: kf(f, y, 0) + dy, zoom: z, ox, oy }}>{children}</Ctx.Provider>;
};

export const Camera: React.FC<CameraProps> = (props) => {
  const f = useCurrentFrame();
  const on = (props.blur ?? []).some(([a, b]) => f >= a && f <= b);
  const inner = <CameraInner {...props} />;
  return on ? <CameraMotionBlur shutterAngle={props.shutter ?? 180} samples={props.samples ?? 8}>{inner}</CameraMotionBlur> : inner;
};

export const CameraLayer: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ depth = 1, children, style }) => {
  const c = useCamera();
  const z = 1 + (c.zoom - 1) * depth;
  return (
    <AbsoluteFill style={{ transform: `translate(${c.ox}px, ${c.oy}px) scale(${z}) translate(${-c.ox - c.x * depth}px, ${-c.oy - c.y * depth}px)`, ...style }}>
      {children}
    </AbsoluteFill>
  );
};
