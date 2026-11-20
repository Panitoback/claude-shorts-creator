import React from 'react';
import { PALETTE } from '../brand';

// CAR (PROJECT_CONTEXT §3.6, a Race mover) — a small generic car in profile, facing right: a low body,
// a soft cabin with dark windows, two wheels whose spokes turn with the distance covered. Warm
// ivory-grey, soft shading, no outlines, no badge, no grille logo, no recognizable model shape. One tiny
// warm headlight point at the front (the car's equivalent of the spacecraft's engine glow): ~0.25
// idling, 1 on departure. A short soft fading trail behind it while it moves.
// Pure drawing: the caller animates it (position, wheel turn, light, trail).
export type CarProps = {
  x: number; // center
  y: number; // center of the body's height (the lane line runs through it)
  length?: number; // bumper to bumper, px (default 46)
  turn?: number; // wheel rotation, radians (= distance / wheel radius)
  light?: number; // headlight 0..1.2
  trail?: number; // 0..1
  opacity?: number;
};

let uid = 0;

export const Car: React.FC<CarProps> = ({ x, y, length = 46, turn = 0, light = 0.25, trail = 0, opacity = 1 }) => {
  const id = React.useMemo(() => `car${uid++}`, []);
  if (opacity <= 0.001) return null;
  const L = length;
  const g = Math.max(0, Math.min(1.2, light));
  const wr = L * 0.12; // wheel radius
  const wy = L * 0.16; // wheel center below the car's center
  const TL = L * 1.0 * Math.max(0, Math.min(1, trail));
  const spokes = [0, 1, 2].map((k) => turn + (k * Math.PI * 2) / 3);
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: x, top: y, overflow: 'visible', opacity }}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PALETTE.ivory} />
          <stop offset="0.55" stopColor="#cfc8bb" />
          <stop offset="1" stopColor="#7f796f" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e3d6" />
          <stop offset="1" stopColor="#b9b2a5" />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={PALETTE.ivory} stopOpacity={0.4} />
          <stop offset="1" stopColor={PALETTE.ivory} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#fff6e0" />
          <stop offset="0.35" stopColor={PALETTE.gold} stopOpacity={0.9} />
          <stop offset="1" stopColor={PALETTE.goldDeep} stopOpacity={0} />
        </radialGradient>
      </defs>
      {TL > 0.5 && <rect x={-L * 0.5 - TL} y={-L * 0.02} width={TL} height={L * 0.1} rx={L * 0.05} fill={`url(#${id}t)`} />}
      {/* cabin: a soft rounded trapezoid set slightly back, dark windows */}
      <path
        d={`M ${-L * 0.3} ${-L * 0.06} L ${-L * 0.2} ${-L * 0.25} Q ${-L * 0.17} ${-L * 0.28} ${-L * 0.12} ${-L * 0.28} L ${L * 0.1} ${-L * 0.28} Q ${L * 0.14} ${-L * 0.28} ${L * 0.17} ${-L * 0.24} L ${L * 0.3} ${-L * 0.06} Z`}
        fill={`url(#${id}c)`}
      />
      <path d={`M ${-L * 0.24} ${-L * 0.08} L ${-L * 0.17} ${-L * 0.23} L ${-L * 0.03} ${-L * 0.23} L ${-L * 0.03} ${-L * 0.08} Z`} fill="#2a2d36" opacity={0.85} />
      <path d={`M ${L * 0.0} ${-L * 0.08} L ${L * 0.0} ${-L * 0.23} L ${L * 0.11} ${-L * 0.23} L ${L * 0.23} ${-L * 0.08} Z`} fill="#2a2d36" opacity={0.85} />
      {/* body */}
      <rect x={-L * 0.5} y={-L * 0.09} width={L} height={L * 0.22} rx={L * 0.08} fill={`url(#${id}b)`} />
      {/* wheels with turning spokes */}
      {[-L * 0.29, L * 0.29].map((cx, i) => (
        <g key={i} transform={`translate(${cx} ${wy})`}>
          <circle r={wr} fill="#1c1e25" />
          <circle r={wr * 0.55} fill="#8f897f" />
          {spokes.map((a, k) => (
            <line key={k} x1={0} y1={0} x2={Math.cos(a) * wr * 0.55} y2={Math.sin(a) * wr * 0.55} stroke="#3a3c44" strokeWidth={Math.max(0.8, wr * 0.22)} strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* headlight */}
      <circle cx={L * 0.47} cy={-L * 0.02} r={L * (0.06 + 0.16 * g)} fill={`url(#${id}g)`} opacity={0.35 + 0.65 * Math.min(1, g)} />
      <circle cx={L * 0.47} cy={-L * 0.02} r={L * 0.03} fill="#fff6e0" opacity={0.55 + 0.45 * Math.min(1, g)} />
    </svg>
  );
};
