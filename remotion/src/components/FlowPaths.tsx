import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, EASE, MOTION, PALETTE, TYPE } from '../brand';
import { CL, ramp, startOf } from './anim';

// FLOW PATHS (brand §5 visual variety: show how things move) — paths that DRAW IN along their
// direction of travel, with a soft glowing head, e.g. gas spiraling into a disk instead of
// falling straight in, or light travelling from A to B. Each path has its own `at`/`len`, so a
// "wrong" path can draw first as a faint dashed ghost (`ghost`) and fade (`fadeAt`), then the
// real one draws in gold.
// Paths are point lists, smoothed (Catmull-Rom); helpers build the common shapes: `spiralPath`
// (inward spiral in a tilted plane, matching AccretionDisk's angle/tilt) and `linePath`.
// Kinds: `gold` = the thing itself (gas, light), `sci` = an annotation-style path, `ghost` = a
// dashed faint "what doesn't happen". Max ~3 paths at once (brand: busy scenes don't read).
export type Pt = [number, number];
export type FlowPath = {
  points: Pt[];
  kind?: 'gold' | 'sci' | 'ghost';
  at?: number; // frame it starts drawing (local)
  len?: number; // frames to draw (default 45)
  fadeAt?: number; // frame it fades out (optional)
  head?: boolean; // glowing head while drawing (default true, not for ghosts)
  arrow?: boolean; // small arrowhead at the end once drawn
  label?: string; // optional label at the path's start
};
export type FlowPathsProps = { paths: FlowPath[]; warm?: boolean };

// inward spiral: from radius r0 to r1 (px) over `turns`, in a disk plane with `angle` (deg) and `tilt`
export const spiralPath = (cx: number, cy: number, r0: number, r1: number, turns = 1.4, start = 200, angle = -8, tilt = 0.15, n = 120): Pt[] => {
  const a = (angle * Math.PI) / 180;
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const r = r0 + (r1 - r0) * (1 - (1 - u) * (1 - u)); // closes in faster near the end
    const th = (start * Math.PI) / 180 - turns * 2 * Math.PI * u;
    const lx = r * Math.cos(th);
    const ly = r * Math.sin(th) * tilt;
    return [cx + lx * Math.cos(a) - ly * Math.sin(a), cy + lx * Math.sin(a) + ly * Math.cos(a)] as Pt;
  });
};
export const linePath = (x0: number, y0: number, x1: number, y1: number, n = 24): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n] as Pt);

const smooth = (p: Pt[]) => {
  if (p.length < 3) return `M ${p.map((q) => q.join(' ')).join(' L ')}`;
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};
const lengthOf = (p: Pt[]) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
const pointAt = (p: Pt[], u: number): Pt => {
  const total = lengthOf(p) * u;
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const seg = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (acc + seg >= total) {
      const k = seg ? (total - acc) / seg : 0;
      return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k];
    }
    acc += seg;
  }
  return p[p.length - 1];
};

export const FlowPaths: React.FC<FlowPathsProps> = ({ paths, warm = false }) => {
  const f = useCurrentFrame();
  return (
    <>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <radialGradient id="flowHead">
            <stop offset="0%" stopColor={PALETTE.ivory} stopOpacity={1} />
            <stop offset="35%" stopColor={PALETTE.gold} stopOpacity={0.5} />
            <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
          </radialGradient>
        </defs>
        {paths.map((p, i) => {
          const s = startOf(p.at ?? 0, warm);
          const u = interpolate(f, [s, s + (p.len ?? 45)], [0, 1], { ...CL, easing: EASE.inOut });
          const out = p.fadeAt === undefined ? 1 : 1 - ramp(f, p.fadeAt, 18);
          if (u <= 0 || out <= 0) return null;
          const kind = p.kind ?? 'gold';
          const C = lengthOf(p.points);
          const stroke = kind === 'gold' ? PALETTE.gold : kind === 'sci' ? PALETTE.sciLine : 'rgba(244,241,234,0.4)';
          const sw = kind === 'gold' ? 4 : ANNOTATION.stroke;
          const [hx, hy] = pointAt(p.points, u);
          const end = p.points[p.points.length - 1];
          const prev = pointAt(p.points, Math.max(0, 1 - 12 / C));
          const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
          return (
            <g key={i} opacity={out}>
              {kind === 'ghost' ? (
                // dashed ghost: draws by revealing a dashed line under a growing mask stroke
                <>
                  <mask id={`flowMask${i}`}>
                    <path d={smooth(p.points)} fill="none" stroke="#fff" strokeWidth={12} strokeDasharray={`${C * u} ${C}`} />
                  </mask>
                  <path d={smooth(p.points)} fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray="10 12" mask={`url(#flowMask${i})`} />
                </>
              ) : (
                <path d={smooth(p.points)} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${C * u} ${C}`} />
              )}
              {kind !== 'ghost' && (p.head ?? true) && u < 1 && <circle cx={hx} cy={hy} r={18} fill="url(#flowHead)" />}
              {p.arrow && u >= 1 && (
                <path d={`M ${end[0] + 16 * Math.cos(ang)} ${end[1] + 16 * Math.sin(ang)} L ${end[0] + 12 * Math.cos(ang + 2.5)} ${end[1] + 12 * Math.sin(ang + 2.5)} L ${end[0] + 12 * Math.cos(ang - 2.5)} ${end[1] + 12 * Math.sin(ang - 2.5)} Z`}
                  fill={stroke} />
              )}
            </g>
          );
        })}
      </svg>
      {paths.map((p, i) => {
        if (!p.label) return null;
        const s = startOf(p.at ?? 0, warm);
        const out = p.fadeAt === undefined ? 1 : 1 - ramp(f, p.fadeAt, 18);
        const [lx, ly] = p.points[0];
        return (
          <div key={i} style={{ position: 'absolute', left: lx - 200, width: 400, top: ly - 56, textAlign: 'center', ...TYPE.annotation, color: PALETTE.sciText, opacity: ramp(f, s, MOTION.labelIn) * out }}>
            {p.label}
          </div>
        );
      })}
    </>
  );
};
