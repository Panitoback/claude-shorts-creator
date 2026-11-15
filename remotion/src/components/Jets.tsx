import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, QUASAR } from '../brand';
import { ramp, startOf } from './anim';
import { clamp01 } from './color';

// JETS (design note 3A) — two very narrow beams along the spin axis, cool blue-white (a true-color
// depiction, brand §2), widest at the core and TAPERING to nothing at the tip, fading with
// distance, with soft edges and a few brighter "knots" traveling outward to show flow. No flare,
// no rays, never a solid bar: thin and calm. Soft edges come from three nested tapered layers
// (wide faint halo → bright thin core), not a blur. They switch on with `luminosity` (off below
// ~0.25, full by ~0.8), and arrive after the disk (light follows the object).
export type JetsProps = {
  x: number;
  y: number;
  length: number; // px from the center to each tip
  width?: number; // half-width at the base (widest point, soft halo included), px (default length × 0.016)
  angle?: number; // axis direction, degrees from vertical (default 0 = straight up/down)
  luminosity?: number; // 0..1 (default 1)
  knots?: number; // traveling knots per jet (default 3)
  speed?: number; // knot speed, fraction of the jet length per second (default 0.18)
  start?: number; // where the beams start, px from the center (default 0, hidden by the disk/shadow)
  at?: number;
  warm?: boolean;
};

let uid = 0;

export const Jets: React.FC<JetsProps> = ({
  x, y, length, width, angle = 0, luminosity = 1, knots = 3, speed = 0.18, start = 0, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `jt${uid++}`, []);
  const s = startOf(at, warm);
  const inP = ramp(f, s + MOTION.overlap, MOTION.glowIn);
  const on = clamp01((luminosity - 0.25) / 0.55) * inP;
  if (on <= 0) return null;
  const wB = width ?? length * 0.016;
  // half-width along the jet, t = 0 (base) … 1 (tip): a slow taper that closes to a point
  const wAt = (t: number) => wB * Math.pow(1 - t, 0.8);
  // a tapered spindle of relative width `k`, as a smooth outline (left side up, right side down)
  const spindle = (k: number) => {
    const n = 16;
    const left: string[] = [];
    const right: string[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const yy = -(start + (length - start) * t);
      const w = Math.max(0, wAt(t) * k);
      left.push(`${(-w).toFixed(2)} ${yy.toFixed(1)}`);
      right.unshift(`${w.toFixed(2)} ${yy.toFixed(1)}`);
    }
    return `M${left.join('L')}L${right.join('L')}Z`;
  };
  // soft cross-section: faint wide halo, mid layer, bright thin core
  const LAYERS = [
    { k: 1, op: 0.22 },
    { k: 0.55, op: 0.4 },
    { k: 0.22, op: 0.85 },
  ];

  // one jet pointing up (local frame); the other is the same rotated 180°
  const beam = (key: string, rot: number) => (
    <g key={key} transform={`rotate(${rot})`}>
      {LAYERS.map((ly, i) => (
        <path key={i} d={spindle(ly.k)} fill={`url(#${id}g)`} opacity={ly.op} />
      ))}
      {Array.from({ length: knots }, (_, i) => {
        const t = ((f / 30) * speed + i / knots + (rot ? 0.5 / knots : 0)) % 1; // 0..1 along the jet
        const d = start + (length - start) * t;
        const wk = Math.max(0.5, wAt(t));
        const fade = Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.7);
        return <ellipse key={i} cx={0} cy={-d} rx={wk * 0.9} ry={wk * 3.2} fill={`url(#${id}k)`} opacity={0.6 * fade} />;
      })}
    </g>
  );

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={0} y1={-start} x2={0} y2={-length}>
          {/* fades with distance: strong near the core, mostly gone by three quarters out */}
          <stop offset="0%" stopColor={QUASAR.jet} stopOpacity={0.75} />
          <stop offset="30%" stopColor={QUASAR.jet} stopOpacity={0.35} />
          <stop offset="70%" stopColor={QUASAR.jet} stopOpacity={0.1} />
          <stop offset="100%" stopColor={QUASAR.jet} stopOpacity={0} />
        </linearGradient>
        {/* soft knots: a gradient, not a flat blob */}
        <radialGradient id={`${id}k`}>
          <stop offset="0%" stopColor={QUASAR.jet} stopOpacity={0.9} />
          <stop offset="100%" stopColor={QUASAR.jet} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={on}>
        {beam('up', 0)}
        {beam('down', 180)}
      </g>
    </svg>
  );
};
