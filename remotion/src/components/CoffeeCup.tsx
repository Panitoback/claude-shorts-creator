import React, { useId, useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION, PALETTE } from '../brand';
import type { Pt } from './FlowPaths';
import { kf, Keys, ramp, startOf } from './anim';

// COFFEE CUP (everyday object, stylized) — a cup on its saucer seen from straight above, with a
// spiral of milk on the coffee. Soft shading, no outlines. Dials (numbers or keyframes, see `kf`):
// `spiral` = how much of the milk spiral has been poured (0..1, from the center out); `mix` = 0 a
// crisp spiral → 1 fully blended into a latte color. An unmix that stalls is mix keys going
// down and back up ([[a,1],[b,0.5],[c,1]]). cupSpiralPts() is the spiral's exact path, so a
// GoldMorphLine can curl into it.
export type CoffeeCupProps = {
  x: number;
  y: number;
  r: number; // radius of the coffee surface (the saucer is ~1.6 r)
  spiral?: Keys; // 0..1 milk poured (default 1)
  mix?: Keys; // 0 crisp spiral → 1 blended (default 0)
  swirl?: number; // slow rotation of the milk, degrees per second (default 6; 0 = still)
  handle?: number; // handle direction, degrees (default 0 = right)
  wash?: boolean;
  opacity?: Keys;
  at?: number;
  warm?: boolean;
};

export const cupSpiralPts = (x: number, y: number, r: number, turns = 2.6, rot = 0, n = 240): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const a = (rot * Math.PI) / 180 + u * turns * 2 * Math.PI;
    const rr = r * (0.06 + 0.74 * u);
    return [x + rr * Math.cos(a), y + rr * Math.sin(a)] as Pt;
  });

const MILK = '#f0dfc6';
const LATTE = '#9a6f4c';

export const CoffeeCup: React.FC<CoffeeCupProps> = ({
  x, y, r, spiral = 1, mix = 0, swirl = 6, handle = 0, wash = false, opacity = 1, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const s0 = startOf(at, warm);
  const inP = ramp(f, s0, MOTION.discIn);
  const op = inP * kf(f, opacity, 1);
  const sc = interpolate(inP, [0, 1], [0.96, 1]);
  const sp = Math.min(1, Math.max(0, kf(f, spiral, 1)));
  const mx = Math.min(1, Math.max(0, kf(f, mix, 0)));
  const pts = useMemo(() => cupSpiralPts(x, y, r), [x, y, r]);
  if (op <= 0.001) return null;

  const n = Math.max(2, Math.round(sp * pts.length));
  const d = pts.slice(0, n).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const rot = (swirl * f) / fps + mx * 50; // mixing also turns the milk a little
  const ha = (handle * Math.PI) / 180;
  const hx = x + Math.cos(ha) * r * 1.32;
  const hy = y + Math.sin(ha) * r * 1.32;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op }}>
      <defs>
        <radialGradient id={`${id}sau`} cx="40%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fbf6ec" />
          <stop offset="70%" stopColor="#e2d6c2" />
          <stop offset="100%" stopColor="#a5967f" />
        </radialGradient>
        <radialGradient id={`${id}rim`} cx="38%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#fffaf2" />
          <stop offset="80%" stopColor="#eadfcc" />
          <stop offset="100%" stopColor="#b9a98f" />
        </radialGradient>
        <radialGradient id={`${id}cof`} cx="58%" cy="60%" r="65%">
          <stop offset="0%" stopColor="#3b2414" />
          <stop offset="85%" stopColor="#2a180c" />
          <stop offset="100%" stopColor="#1a0e06" />
        </radialGradient>
        <radialGradient id={`${id}lat`}>
          <stop offset="0%" stopColor={LATTE} stopOpacity={0.95} />
          <stop offset="100%" stopColor={LATTE} stopOpacity={0.7} />
        </radialGradient>
        <radialGradient id={`${id}w`}>
          <stop offset="0%" stopColor={PALETTE.spaceWarm} />
          <stop offset="100%" stopColor="rgba(255,170,90,0)" />
        </radialGradient>
        <filter id={`${id}blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={1.2 + mx * r * 0.12} />
        </filter>
        <clipPath id={`${id}clip`}><circle cx={x} cy={y} r={r} /></clipPath>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
        {wash && <circle cx={x} cy={y} r={r * 3} fill={`url(#${id}w)`} />}
        <circle cx={x + r * 0.06} cy={y + r * 0.08} r={r * 1.62} fill="#000" opacity={0.25} />
        <circle cx={x} cy={y} r={r * 1.6} fill={`url(#${id}sau)`} />
        <circle cx={x} cy={y} r={r * 1.2} fill="#000" opacity={0.12} />
        <rect x={hx - r * 0.24} y={hy - r * 0.13} width={r * 0.48} height={r * 0.26} rx={r * 0.13}
          transform={`rotate(${handle} ${hx} ${hy})`} fill={`url(#${id}rim)`} />
        <circle cx={x} cy={y} r={r * 1.13} fill={`url(#${id}rim)`} />
        <circle cx={x} cy={y} r={r} fill={`url(#${id}cof)`} />
        <g clipPath={`url(#${id}clip)`}>
          <circle cx={x} cy={y} r={r} fill={`url(#${id}lat)`} opacity={mx * 0.9} />
          <g transform={`rotate(${rot} ${x} ${y})`} filter={`url(#${id}blur)`} opacity={1 - mx * 0.75}>
            <path d={d} fill="none" stroke={MILK} strokeWidth={r * (0.075 + mx * 0.22)} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* a soft highlight on the liquid, from the upper left */}
          <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.35} ry={r * 0.16} fill="#fff6ea" opacity={0.06} transform={`rotate(-35 ${x - r * 0.35} ${y - r * 0.4})`} />
        </g>
      </g>
    </svg>
  );
};
