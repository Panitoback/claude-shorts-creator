import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CANVAS, EASE, PALETTE } from '../brand';
import { hash01 } from './anim';

// TIME STREAM: gold particles flowing one way along a line (time's arrow, the timeline's axis): steady
// motion in scenes that would otherwise hold still. Each particle has its own speed and lane; they fade
// in at the start of the line and out at its end, so the flow never "arrives" or reverses.
export type TimeStreamProps = { x0: number; y0: number; x1: number; y1: number; from: number; to: number; n?: number; speed?: number;
  spread?: number; dot?: number; seed?: number };
// from / to in SECONDS (the flow fades in over 0.45 s from `from`, and out over 0.4 s from `to`); speed in px/s; spread = half the lane width
export const TimeStream: React.FC<TimeStreamProps> = ({ x0, y0, x1, y1, from, to, n = 70, speed = 240, spread = 40, dot = 6, seed = 1 }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const c = (x: number) => Math.min(1, Math.max(0, x));
  const op = Math.min(EASE.out(c((t - from) / 0.45)), 1 - EASE.in(c((t - to) / 0.4)));
  if (op <= 0) return null;
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => hash01(seed * 1000 + i * 7 + k);
        const d = (r(1) * L + speed * (0.65 + 0.7 * r(2)) * (t - from)) % L;
        const lane = (r(3) - 0.5) * 2 * spread * (0.3 + 0.7 * r(4));
        const edge = Math.min(1, d / (L * 0.12), (L - d) / (L * 0.12));
        return <circle key={i} cx={x0 + ux * d - uy * lane} cy={y0 + uy * d + ux * lane} r={dot * (0.6 + 0.6 * r(5))}
          fill={r(6) < 0.25 ? PALETTE.ivory : PALETTE.gold} opacity={edge * (0.45 + 0.55 * r(7))} />;
      })}
    </svg>
  );
};
