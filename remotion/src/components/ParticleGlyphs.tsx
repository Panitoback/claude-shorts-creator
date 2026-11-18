import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, PALETTE } from '../brand';
import type { Pt } from './FlowPaths';
import { hash01, kf, Keys, ramp, startOf } from './anim';

// PARTICLE GLYPHS: a gas of particles drifting in a box (like ParticleBox) that rearranges into a
// number or short word — the count itself condenses into the figure. The figure is drawn on a 5×7
// dot grid (deterministic, no font measuring), so ~60 particles already read as "10³⁰". Particles
// left over keep drifting, faint; if the figure needs more dots than there are particles, the extra
// dots fade in on their own. `^` starts a superscript ("10^30").
const FONT: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '×': ['00000', '10001', '01010', '00100', '01010', '10001', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
const SUP = 0.6;

type Glyph = { pts: Pt[]; scale: number[]; centers: { ch: string; x: number; y: number; cell: number }[]; width: number };
// dot targets of `text` centered at (cx, cy) (the base line's vertical center), dot spacing `cell`
export const glyphLayout = (text: string, cx: number, cy: number, cell: number): Glyph => {
  const items: { ch: string; sup: boolean }[] = [];
  let sup = false;
  for (const ch of text) { if (ch === '^') { sup = true; continue; } items.push({ ch, sup }); }
  const adv = (s: boolean) => 6 * cell * (s ? SUP : 1);
  const width = items.reduce((a, it) => a + adv(it.sup), 0) - cell * (items[items.length - 1]?.sup ? SUP : 1);
  let x = cx - width / 2;
  const top = cy - 3 * cell;
  const pts: Pt[] = [], scale: number[] = [], centers: Glyph['centers'] = [];
  items.forEach((it) => {
    const c = cell * (it.sup ? SUP : 1);
    const rows = FONT[it.ch] ?? FONT[' '];
    rows.forEach((row, r) => [...row].forEach((b, k) => { if (b === '1') { pts.push([x + k * c, top + r * c]); scale.push(it.sup ? SUP : 1); } }));
    centers.push({ ch: it.ch, x: x + 2 * c, y: top + 3 * c, cell: c });
    x += adv(it.sup);
  });
  return { pts, scale, centers, width };
};

const fold = (u: number, a: number, b: number) => {
  const L = b - a;
  let m = (u - a) % (2 * L);
  if (m < 0) m += 2 * L;
  return m <= L ? a + m : a + 2 * L - m;
};

export type ParticleGlyphsProps = {
  box: { x: number; y: number; w: number; h: number }; // where the gas drifts (center + size)
  text: string; // digits, %, ×, space; ^ = superscript
  cx: number; // the figure's center
  cy: number;
  cell?: number; // dot spacing in px (default 24)
  count?: number; // particles (default 100)
  speed?: number; // px per frame (default 3)
  dot?: number; // particle radius (default 7)
  at: number; // frame the particles start flying to the figure
  len?: number; // frames each particle takes (default 36)
  stagger?: number; // spread of the departures, frames (default 16)
  rest?: number; // opacity of the left-over particles once the figure has formed (default 0.18)
  boxLine?: Keys; // box outline opacity (default 0)
  opacity?: Keys;
  seed?: number;
  start?: number; // fade-in / motion start
  warm?: boolean;
};

export const ParticleGlyphs: React.FC<ParticleGlyphsProps> = ({
  box, text, cx, cy, cell = 24, count = 100, speed = 3, dot = 7, at, len = 36, stagger = 16, rest = 0.18, boxLine = 0, opacity = 1,
  seed = 7, start = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const s0 = startOf(start, warm);
  const op = ramp(f, s0, 14) * kf(f, opacity, 1);
  const x0 = box.x - box.w / 2 + dot, x1 = box.x + box.w / 2 - dot, y0 = box.y - box.h / 2 + dot, y1 = box.y + box.h / 2 - dot;
  const ps = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = hash01(seed * 131 + i) * Math.PI * 2;
    const v = speed * (0.6 + 0.8 * hash01(seed * 71 + i * 3));
    return { u: x0 + hash01(seed * 17 + i * 5) * (x1 - x0), v: y0 + hash01(seed * 29 + i * 7) * (y1 - y0), vx: Math.cos(a) * v, vy: Math.sin(a) * v, b: hash01(seed + i * 13), d: hash01(seed * 5 + i * 19) };
  }), [count, seed, speed, x0, x1, y0, y1]);
  const g = useMemo(() => glyphLayout(text, cx, cy, cell), [text, cx, cy, cell]);
  const gas = (p: (typeof ps)[number], fr: number): Pt => {
    const t = fr - s0;
    return [fold(p.u + p.vx * t, x0, x1), fold(p.v + p.vy * t, y0, y1)];
  };
  // assignment: particles and dots both sorted left → right at departure time (few crossings)
  const assign = useMemo(() => {
    const n = Math.min(count, g.pts.length);
    const byX = ps.map((p, i) => ({ i, x: gas(p, at)[0] })).sort((a, b) => a.x - b.x);
    // spread the chosen particles evenly over the sorted list
    const chosen = Array.from({ length: n }, (_, k) => byX[Math.floor(((k + 0.5) * byX.length) / n)].i);
    const dots = g.pts.map((p, j) => ({ j, x: p[0], y: p[1] })).sort((a, b) => a.x - b.x || a.y - b.y).slice(0, n);
    const m = new Map<number, number>();
    chosen.forEach((pi, k) => m.set(pi, dots[k].j));
    const extra = g.pts.map((_, j) => j).filter((j) => !dots.some((d) => d.j === j));
    return { m, extra };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ps, g, at, count]);
  if (op <= 0.001) return null;

  const els: React.ReactNode[] = [];
  const formed = Math.min(1, Math.max(0, (f - at) / (len + stagger)));
  ps.forEach((p, i) => {
    const j = assign.m.get(i);
    const q = gas(p, f);
    const color = p.b > 0.9 ? '#fffaf0' : PALETTE.gold;
    if (j === undefined) {
      els.push(<circle key={i} cx={q[0]} cy={q[1]} r={dot * (0.85 + 0.3 * p.b)} fill={color} opacity={1 - (1 - rest) * EASE.inOut(formed)} />);
      return;
    }
    const k = EASE.inOut(Math.min(1, Math.max(0, (f - at - p.d * stagger) / len)));
    const tg = g.pts[j];
    const r = dot * (0.85 + 0.3 * p.b) * (1 + (g.scale[j] - 1) * k);
    els.push(<circle key={i} cx={q[0] + (tg[0] - q[0]) * k} cy={q[1] + (tg[1] - q[1]) * k} r={r} fill={color} />);
  });
  assign.extra.forEach((j) => {
    const k = EASE.out(Math.min(1, Math.max(0, (f - at - stagger) / len)));
    if (k > 0) els.push(<circle key={`x${j}`} cx={g.pts[j][0]} cy={g.pts[j][1]} r={dot * g.scale[j]} fill={PALETTE.gold} opacity={k} />);
  });
  const bl = kf(f, boxLine, 0);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      {bl > 0.001 && <rect x={box.x - box.w / 2} y={box.y - box.h / 2} width={box.w} height={box.h} fill="none" stroke={PALETTE.ivory} strokeWidth={3} opacity={0.55 * bl} />}
      {els}
    </svg>
  );
};
