import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, QUASAR, STAR_TINTS } from '../brand';
import { mulberry32 } from '../lib/sky';
import { ramp, startOf } from './anim';
import { STAR_MIN_A, STAR_MIN_R } from './Starfield';

// HOST GALAXY (design note 4A) — a calm, distant elliptical galaxy: stacked soft radial-gradient
// hazes in warm ivory plus a few hundred tiny static stars, denser toward the center.
// `dim` (0..1) is its brightness: a quasar switching on drives it down (quasarExposure), which is
// what makes "brighter than its whole galaxy" visible. Stars are static and above the
// compression minimums (see Starfield) so they survive platform re-encodes.
export type HostGalaxyProps = {
  x: number;
  y: number;
  rx: number; // half-width of the visible galaxy, px
  ry?: number; // half-height (default rx × 0.62)
  angle?: number; // degrees (default -18)
  stars?: number; // default 260
  seed?: number;
  dim?: number; // brightness 0..1 (default 1)
  at?: number;
  warm?: boolean;
};

let uid = 0;

export const HostGalaxy: React.FC<HostGalaxyProps> = ({
  x, y, rx, ry, angle = -18, stars = 260, seed = 5, dim = 1, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `hg${uid++}`, []);
  const s = startOf(at, warm);
  const inP = ramp(f, s, MOTION.glowIn);
  const RY = ry ?? rx * 0.62;
  const pts = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: stars }, () => {
      const u = Math.min(1, -0.32 * Math.log(1 - rnd() * 0.97)); // exponential falloff from the core
      const th = rnd() * Math.PI * 2;
      return {
        px: Math.cos(th) * u * rx,
        py: Math.sin(th) * u * RY,
        r: STAR_MIN_R * (0.9 + rnd() * 0.5),
        a: Math.max(STAR_MIN_A, 0.95 - u * 0.5) * (0.85 + rnd() * 0.15),
        c: STAR_TINTS[1 + Math.floor(rnd() * 3)],
      };
    });
  }, [seed, stars, rx, RY]);
  const layers = [
    [1, 0.05], [0.68, 0.07], [0.42, 0.1], [0.2, 0.16], [0.08, 0.22],
  ];

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}h`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={QUASAR.galaxy} stopOpacity={1} />
          <stop offset="55%" stopColor={QUASAR.galaxy} stopOpacity={0.4} />
          <stop offset="100%" stopColor={QUASAR.galaxy} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={inP * dim}>
        {layers.map(([k, op], i) => (
          <ellipse key={i} cx={0} cy={0} rx={rx * k * 1.15} ry={RY * k * 1.15} fill={`url(#${id}h)`} opacity={op * 2.2} />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r={p.r} fill={p.c} opacity={p.a} />
        ))}
      </g>
    </svg>
  );
};
