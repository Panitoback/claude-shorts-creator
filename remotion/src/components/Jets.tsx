import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, QUASAR } from '../brand';
import { ramp, startOf } from './anim';
import { clamp01 } from './color';

// JETS (design note 3A) — two very narrow tapered beams along the spin axis, cool blue-white,
// fading with distance, with a few brighter "knots" traveling outward to show flow. No flare,
// no rays: thin and calm. They switch on with `luminosity` (off below ~0.25, full by ~0.8),
// and arrive after the disk (light follows the object).
export type JetsProps = {
  x: number;
  y: number;
  length: number; // px from the center to each tip
  width?: number; // half-width at the tip, px (default length × 0.05)
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
  const w1 = width ?? length * 0.05;
  const w0 = Math.max(2, w1 * 0.18);

  // one jet pointing up (local frame); the other is the same rotated 180°
  const beam = (key: string, rot: number) => (
    <g key={key} transform={`rotate(${rot})`}>
      <path d={`M${-w0} ${-start} L${-w1} ${-length} L${w1} ${-length} L${w0} ${-start} Z`} fill={`url(#${id}g)`} />
      {Array.from({ length: knots }, (_, i) => {
        const t = ((f / 30) * speed + i / knots + (rot ? 0.5 / knots : 0)) % 1; // 0..1 along the jet
        const d = start + (length - start) * t;
        const wk = w0 + (w1 - w0) * t;
        const fade = Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.6);
        return <ellipse key={i} cx={0} cy={-d} rx={wk * 0.9} ry={wk * 2.6} fill={`url(#${id}k)`} opacity={0.75 * fade} />;
      })}
    </g>
  );

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={0} y1={-start} x2={0} y2={-length}>
          <stop offset="0%" stopColor={QUASAR.jet} stopOpacity={0.5} />
          <stop offset="40%" stopColor={QUASAR.jet} stopOpacity={0.2} />
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
