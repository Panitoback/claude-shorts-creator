import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, PALETTE } from '../brand';
import { kf, Keys } from './anim';

// SPACE STATION — a small generic orbital station seen face-on: a long truss, four pairs of dark
// solar wings with a warm glint, a short stack of ivory modules in the middle. No agency markings,
// no flags, not a model of any real station (the brand restyle of the inherited Satellite, §3.3).
// At honest scale a station is far below a pixel next to a planet: like every too-small object it
// is then drawn at a findable SYMBOL size (`size`, px across) — pair it with a Marker.
export type SpaceStationProps = {
  x: number;
  y: number;
  size?: number; // px across the truss (default 48)
  angle?: number; // degrees (default 0 = truss horizontal)
  glint?: Keys; // 0..1 sunlight glint on the panels (default 0.5)
  opacity?: Keys;
};

export const SpaceStation: React.FC<SpaceStationProps> = ({ x, y, size = 48, angle = 0, glint = 0.5, opacity = 1 }) => {
  const f = useCurrentFrame();
  const op = kf(f, opacity, 1);
  if (op <= 0.001) return null;
  const g = kf(f, glint, 0.5);
  const s = size / 100; // drawn in a 100-unit box
  const panel = (cx: number, up: boolean, i: number) => (
    <g key={`${cx}${up}`}>
      <rect x={cx - 7} y={up ? -30 : 4} width={14} height={26} fill="#2a2b3a" />
      <rect x={cx - 7} y={up ? -30 : 4} width={14} height={26} fill={PALETTE.goldDeep} opacity={0.14 + 0.35 * g * (0.6 + 0.4 * Math.sin(i * 1.7 + f / 40))} />
      <line x1={cx} x2={cx} y1={up ? -30 : 4} y2={up ? -4 : 30} stroke="#05060a" strokeWidth={0.8} opacity={0.6} />
    </g>
  );
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: op, overflow: 'visible' }}>
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
        <rect x={-50} y={-2} width={100} height={4} fill="#b9b3a6" />
        {[-40, -26, 26, 40].map((cx, i) => [panel(cx, true, i), panel(cx, false, i + 4)])}
        <rect x={-6} y={-12} width={12} height={24} rx={3} fill={PALETTE.ivory} />
        <rect x={-14} y={-5} width={28} height={10} rx={3} fill="#e6dfd0" />
        <rect x={-3} y={12} width={6} height={9} fill="#cfc8ba" />
      </g>
    </svg>
  );
};
