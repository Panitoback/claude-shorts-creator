import React from 'react';
import { PALETTE } from '../brand';

// SPACECRAFT (PROJECT_CONTEXT §3.6, the Race mover) — a small generic probe in profile, facing right:
// a boxy body, a round dish seen almost edge-on at the front, a thin boom with a small end mass at the
// back, one tiny gold engine point. Soft shading, no outlines, no agency logos or mission markings: it
// is NOT a replica of any real craft. Ivory, lit from above.
// Pure drawing: the caller animates it (position, engine, trail), so it can sit inside a RaceBoard or
// any other scene. `engine` 0..1 = engine glow (≈0.25 idling, 1 at departure); `trail` 0..1 = the
// short fading trail behind it while it moves (0 when still).
export type SpacecraftProps = {
  x: number; // center, px
  y: number;
  length?: number; // nose-to-boom length, px (default 56; stays crisp from ~40 up)
  engine?: number;
  trail?: number;
  trailLength?: number; // px at trail = 1 (default 1.1 × length)
  opacity?: number;
};

let uid = 0;

export const Spacecraft: React.FC<SpacecraftProps> = ({ x, y, length = 56, engine = 0.25, trail = 0, trailLength, opacity = 1 }) => {
  const id = React.useMemo(() => `sc${uid++}`, []);
  const L = length;
  const H = L * 0.7; // drawing box height (the dish is the tallest part)
  const TL = (trailLength ?? L * 1.1) * Math.max(0, Math.min(1, trail));
  const pad = L * 0.5 + TL;
  const W = L + pad + L * 0.2;
  // local coords: origin at the craft's center, +x = forward
  const ex = -L * 0.2; // engine point (rear of the body)
  const g = Math.max(0, Math.min(1.2, engine));
  return (
    <svg
      width={W}
      height={H + L * 0.6}
      viewBox={`${-L * 0.5 - pad} ${-(H + L * 0.6) / 2} ${W} ${H + L * 0.6}`}
      style={{ position: 'absolute', left: x - L * 0.5 - pad, top: y - (H + L * 0.6) / 2, overflow: 'visible', opacity }}
    >
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PALETTE.ivory} />
          <stop offset="0.6" stopColor="#cfc9bd" />
          <stop offset="1" stopColor="#7d786f" />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f8a80" />
          <stop offset="0.55" stopColor={PALETTE.ivory} />
          <stop offset="1" stopColor="#d9d3c6" />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={PALETTE.gold} stopOpacity={0.75} />
          <stop offset="1" stopColor={PALETTE.goldDeep} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#fff6e0" />
          <stop offset="0.35" stopColor={PALETTE.gold} stopOpacity={0.9} />
          <stop offset="1" stopColor={PALETTE.goldDeep} stopOpacity={0} />
        </radialGradient>
      </defs>
      {TL > 0.5 && <rect x={ex - TL} y={-L * 0.035} width={TL} height={L * 0.07} rx={L * 0.035} fill={`url(#${id}t)`} />}
      {/* boom + end mass (behind the body) */}
      <rect x={-L * 0.5} y={L * 0.07} width={L * 0.36} height={L * 0.035} fill="#a39d92" />
      <circle cx={-L * 0.47} cy={L * 0.087} r={L * 0.055} fill="#b8b2a6" />
      {/* body */}
      <rect x={-L * 0.2} y={-L * 0.13} width={L * 0.42} height={L * 0.26} rx={L * 0.04} fill={`url(#${id}b)`} />
      {/* dish mount + dish, nearly edge-on, at the front */}
      <rect x={L * 0.2} y={-L * 0.025} width={L * 0.1} height={L * 0.05} fill="#bdb7ab" />
      <ellipse cx={L * 0.36} cy={0} rx={L * 0.09} ry={L * 0.31} fill={`url(#${id}d)`} />
      {/* engine point */}
      <circle cx={ex} cy={0} r={L * (0.07 + 0.16 * g)} fill={`url(#${id}g)`} opacity={0.35 + 0.65 * Math.min(1, g)} />
      <circle cx={ex} cy={0} r={L * 0.03} fill="#fff6e0" opacity={0.5 + 0.5 * Math.min(1, g)} />
    </svg>
  );
};
