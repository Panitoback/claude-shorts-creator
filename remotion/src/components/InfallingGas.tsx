import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, QUASAR } from '../brand';
import { clamp01 } from './color';

// INFALLING GAS (brand v2.0: constant motion) — thin streaks of gas spiraling into an accretion
// disk from outside it, so a quasar shot is never a still. Each streak starts far out, slightly
// out of the disk plane, and winds inward faster and faster (closer = faster orbit) until it
// merges into the disk's outer edge, where it fades. Same plane conventions as AccretionDisk
// (`angle`, `tilt`; the approaching side is on the left, so streaks wind the same way the disk
// turns).
//
// Layering: like the disk, streaks pass BEHIND the shadow on the far side and IN FRONT on the
// near side, so draw it twice around <Quasar>: layer="back" before, layer="front" after.
// Cool gas far out is dim deep-orange; it warms toward gold as it reaches the disk. Flat strokes,
// no blur, never brighter than the disk. Deterministic: with `loopFrames` every streak completes
// a whole number of trips, so a seamless loop stays seamless.
export type InfallingGasProps = {
  x: number;
  y: number;
  shadowR: number; // same as the Quasar's
  angle?: number; // disk in-plane rotation, degrees (default -8, as Quasar)
  tilt?: number; // disk tilt (default 0.15, as Quasar)
  from?: number; // where streaks start, × shadowR (default 11: beyond the frame at hook size)
  to?: number; // where they merge, × shadowR (default 4.4: just inside the disk's outer edge 4.6)
  count?: number; // streaks (default 16)
  period?: number; // frames for one trip in (default 150 = 5 s)
  turns?: number; // revolutions per trip (default 0.9)
  opacity?: number; // 0..1 overall (default 1); scale it with the scene's exposure if needed
  luminosity?: number; // the quasar's: hotter gas glows a little more (default 1)
  width?: number; // stroke width, × shadowR (default 0.045; never below 2 px on screen)
  layer?: 'back' | 'front' | 'both';
  loopFrames?: number;
  seed?: number;
};

const rand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const SEGMENTS = 7; // each streak = a tapered trail of short segments, brightest at its head
const TRAIL = 0.11; // trail length, as a fraction of the trip

export const InfallingGas: React.FC<InfallingGasProps> = ({
  x, y, shadowR, angle = -8, tilt = 0.15, from = 11, to = 4.4, count = 16, period = 150, turns = 0.9,
  opacity = 1, luminosity = 1, width = 0.045, layer = 'both', loopFrames, seed = 5,
}) => {
  const f = useCurrentFrame();
  const per = loopFrames ? loopFrames / Math.max(1, Math.round(loopFrames / period)) : period;
  const streaks = React.useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: count }, () => ({
      phase: r(), // where in its trip this streak is at frame 0
      th0: r() * Math.PI * 2, // starting angle in the disk plane
      lift: (r() - 0.5) * 0.5, // starts out of the plane (extra tilt), settles into it
      speed: 0.85 + r() * 0.3, // small spread so streaks don't march in step
      bright: 0.55 + r() * 0.45,
    }));
  }, [count, seed]);
  if (opacity <= 0) return null;

  const a = (angle * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const L = clamp01(luminosity);
  const sw = Math.max(2, shadowR * width);
  // position on the trip u (0 = far out, 1 = merged): radius falls faster near the end (infall
  // accelerates), the angle winds faster as it closes in; local y < 0 = the far (back) side
  const pos = (s: (typeof streaks)[number], u: number) => {
    const rr = shadowR * (from + (to - from) * (1 - (1 - u) * (1 - u)));
    const th = s.th0 - turns * 2 * Math.PI * (u * u * 0.7 + u * 0.3);
    const tl = tilt + s.lift * (1 - u);
    const lx = rr * Math.cos(th);
    const ly = rr * Math.sin(th) * tl;
    return { X: x + lx * ca - ly * sa, Y: y + lx * sa + ly * ca, back: Math.sin(th) < 0 };
  };

  const segs: React.ReactNode[] = [];
  streaks.forEach((s, i) => {
    const head = (((f * s.speed) / per + s.phase) % 1 + 1) % 1;
    for (let k = 0; k < SEGMENTS; k++) {
      const u1 = head - (TRAIL * k) / SEGMENTS;
      const u0 = head - (TRAIL * (k + 1)) / SEGMENTS;
      if (u0 < 0) break;
      const p0 = pos(s, u0);
      const p1 = pos(s, u1);
      const back = p0.back && p1.back ? true : !p0.back && !p1.back ? false : p1.back;
      if ((layer === 'back' && !back) || (layer === 'front' && back)) continue;
      // fade in far out, fade out as it merges into the disk; the tail fades toward its end
      const env = clamp01(u1 / 0.18) * clamp01((1 - u1) / 0.12);
      const tail = 1 - k / SEGMENTS;
      const warmth = clamp01(u1 * 1.2); // deep orange far out → gold at the disk
      const color = warmth > 0.6 ? QUASAR.disk[2] : warmth > 0.3 ? QUASAR.disk[3] : QUASAR.disk[4];
      const op = opacity * s.bright * env * tail * (0.35 + 0.4 * L) * (0.5 + 0.5 * warmth);
      if (op < 0.01) continue;
      segs.push(
        <line key={`${i}-${k}`} x1={p0.X} y1={p0.Y} x2={p1.X} y2={p1.Y} stroke={color}
          strokeOpacity={op} strokeWidth={sw * (0.6 + 0.4 * tail)} strokeLinecap="round" />,
      );
    }
  });

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {segs}
    </svg>
  );
};
