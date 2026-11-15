import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, PALETTE, QUASAR } from '../brand';
import { ramp, startOf } from './anim';

// BLACK HOLE (design note 1A) — the shadow: a perfectly black disc (PALETTE.hole, the channel's
// single pure-black exception) hugged by a thin warm photon ring whose light falls off outward
// through a gradient (never a blur). One side of the ring can be brighter (the side where the
// disk comes toward us). Use alone, or inside <Quasar>, which layers the disk around it.
export type BlackHoleProps = {
  x: number;
  y: number;
  r: number; // shadow radius in px
  ring?: number; // photon ring strength 0..1 (default 1)
  brightSide?: number | null; // direction of the brighter side of the ring, degrees (180 = left; default 180). null = even
  at?: number;
  warm?: boolean;
};

let uid = 0;

export const BlackHole: React.FC<BlackHoleProps> = ({ x, y, r, ring = 1, brightSide = 180, at = 0, warm = false }) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `bh${uid++}`, []);
  const s = startOf(at, warm);
  const shadowIn = ramp(f, s, MOTION.discIn);
  const ringIn = ramp(f, s + MOTION.overlap, MOTION.glowIn) * ring; // light follows the object
  const rad = ((brightSide ?? 0) * Math.PI) / 180;
  const gx = Math.cos(rad);
  const gy = Math.sin(rad);
  const G = 1.18; // glow extent, × r

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <stop offset={`${(100 / G).toFixed(1)}%`} stopColor={QUASAR.photonRing} stopOpacity={0.9} />
          <stop offset={`${((100 * 1.04) / G).toFixed(1)}%`} stopColor={PALETTE.gold} stopOpacity={0.35} />
          <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
        </radialGradient>
        {/* brighter on one side: a linear gradient across the ring's opacity */}
        <linearGradient id={`${id}s`} x1={0.5 + gx / 2} y1={0.5 + gy / 2} x2={0.5 - gx / 2} y2={0.5 - gy / 2}>
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={brightSide === null ? 1 : 0.4} />
        </linearGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x - r * 2} y={y - r * 2} width={r * 4} height={r * 4}>
          <rect x={x - r * G} y={y - r * G} width={r * G * 2} height={r * G * 2} fill={`url(#${id}s)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}m)`} opacity={ringIn}>
        <circle cx={x} cy={y} r={r * G} fill={`url(#${id}g)`} />
        <circle cx={x} cy={y} r={r * 1.012} fill="none" stroke={QUASAR.photonRing} strokeWidth={Math.max(2, r * 0.035)} opacity={0.95} />
      </g>
      <circle cx={x} cy={y} r={r} fill={PALETTE.hole} opacity={shadowIn} />
    </svg>
  );
};
