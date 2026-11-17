import React, { useId, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, PALETTE } from '../brand';
import type { Pt } from './FlowPaths';
import { hash01, kf, Keys } from './anim';

// GOLD MORPH LINE (brand §5 continuity: an object carried into the next scene) — ONE thin gold
// line that changes shape with no cut: a crack → a spiral → handwriting → dust, and back (dust →
// a point → a crack, for a loop). Every shape is resampled to the same number of points and the
// line morphs point by point (EASE.inOut, no bounce). `draw` reveals it along its length (a
// crack racing across), `dust` breaks it into gold particles that drift outward (and back).
//
// Shapes are plain point lists: use the helpers below (morphCrack, morphSpiral, morphScribble,
// morphPoint, morphLine) or any Pt[] (e.g. eggCrackPts / cupSpiralPts from Egg / CoffeeCup, so
// the line lands exactly on the object it becomes).
export const MORPH_N = 180;

// arc-length resampling to n points, so any two shapes morph evenly
export const resample = (pts: Pt[], n = MORPH_N): Pt[] => {
  if (pts.length === 1) return Array.from({ length: n }, () => [pts[0][0], pts[0][1]] as Pt);
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1] || 1;
  const out: Pt[] = [];
  let j = 1;
  for (let i = 0; i < n; i++) {
    const d = (total * i) / (n - 1);
    while (j < acc.length - 1 && acc[j] < d) j++;
    const seg = acc[j] - acc[j - 1] || 1;
    const t = Math.min(1, Math.max(0, (d - acc[j - 1]) / seg));
    out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t]);
  }
  return out;
};

// a jagged crack from (x0,y0) to (x1,y1): `teeth` zigzags of height `amp`
export const morphCrack = (x0: number, y0: number, x1: number, y1: number, amp = 14, teeth = 9, seed = 3): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const u = i / (teeth * 2);
    const jit = (hash01(seed * 31 + i) - 0.5) * amp * 0.8;
    const side = i === 0 || i === teeth * 2 ? 0 : (i % 2 ? 1 : -1);
    pts.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + side * amp + jit * (side ? 1 : 0)]);
  }
  return pts;
};

// an Archimedean spiral around (cx,cy), from r0 out to r1, `turns` turns, starting at angle a0 (deg)
export const morphSpiral = (cx: number, cy: number, r0: number, r1: number, turns = 2.6, a0 = 0, n = 240): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const a = (a0 * Math.PI) / 180 + u * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * u;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });

// cursive-looking handwriting: a looping line (prolate cycloid) across a word's width
export const morphScribble = (x0: number, baseY: number, width: number, height: number, loops = 7, n = 320): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const t = u * loops * 2 * Math.PI;
    const a = width / (loops * 2 * Math.PI);
    return [x0 + a * t - a * 1.6 * Math.sin(t), baseY - height * 0.5 * (1 - Math.cos(t))] as Pt;
  });

export const morphPoint = (x: number, y: number): Pt[] => [[x, y]];
export const morphLine = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y1]];

export type MorphKey = {
  pts: Pt[];
  at: number; // frame the morph INTO this shape starts (the first key's `at` is ignored: it is the start shape)
  len?: number; // frames the morph takes (default 12)
};
export type GoldMorphLineProps = {
  keys: MorphKey[];
  draw?: Keys; // 0..1 how much of the line is drawn, from its start (default 1)
  dust?: Keys; // 0 = a line, 1 = fully broken into drifting gold dust (default 0)
  opacity?: Keys; // overall (default 1)
  width?: number; // stroke px (default 4; never below 3 on a phone)
  spread?: number; // how far the dust drifts at dust = 1, px (default 240)
  dustSize?: number; // dust particle radius, px (default 3.4)
  glow?: boolean; // a soft wider stroke under the line (default true)
  seed?: number;
};

export const GoldMorphLine: React.FC<GoldMorphLineProps> = ({
  keys, draw = 1, dust = 0, opacity = 1, width = 4, spread = 240, dustSize = 3.4, glow = true, seed = 1,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const shapes = useMemo(() => keys.map((k) => resample(k.pts)), [keys]);
  const dirs = useMemo(
    () => Array.from({ length: MORPH_N }, (_, i) => {
      const a = hash01(seed * 977 + i) * Math.PI * 2;
      const s = 0.35 + 0.65 * hash01(seed * 613 + i * 7);
      return [Math.cos(a) * s, Math.sin(a) * s] as Pt;
    }),
    [seed],
  );

  // sequential morph: start shape, then blend into each next key as its window passes
  let cur = shapes[0];
  for (let k = 1; k < keys.length; k++) {
    const len = keys[k].len ?? 12;
    const t = Math.min(1, Math.max(0, (f - keys[k].at) / len));
    if (t <= 0) break;
    const e = EASE.inOut(t);
    const nxt = shapes[k];
    cur = cur.map((p, i) => [p[0] + (nxt[i][0] - p[0]) * e, p[1] + (nxt[i][1] - p[1]) * e] as Pt);
  }
  const op = kf(f, opacity, 1);
  const dv = Math.min(1, Math.max(0, kf(f, dust, 0)));
  const dr = Math.min(1, Math.max(0, kf(f, draw, 1)));
  if (op <= 0.001 || dr <= 0) return null;

  const lineOp = op * (1 - Math.min(1, dv / 0.35));
  const nDrawn = Math.max(2, Math.round(dr * MORPH_N));
  const pts = cur.slice(0, nDrawn);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const tip = pts[pts.length - 1];
  const dustOp = op * Math.min(1, dv / 0.12);

  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}h`}>
          <stop offset="0%" stopColor="#fffaf0" stopOpacity={0.9} />
          <stop offset="40%" stopColor={PALETTE.gold} stopOpacity={0.35} />
          <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {lineOp > 0.002 && (
        <g opacity={lineOp} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {glow && <path d={d} stroke={PALETTE.goldDeep} strokeOpacity={0.22} strokeWidth={width * 3.2} />}
          <path d={d} stroke={PALETTE.gold} strokeWidth={width} />
          {dr < 0.999 && <circle cx={tip[0]} cy={tip[1]} r={width * 4} fill={`url(#${id}h)`} />}
        </g>
      )}
      {dustOp > 0.002 && (
        <g opacity={dustOp}>
          {cur.slice(0, nDrawn).map((p, i) => {
            if (i % 2) return null; // half the points as dust: plenty, and cheaper
            const e = EASE.out(dv);
            const tw = 0.75 + 0.25 * Math.sin(f / 7 + i * 1.3);
            return (
              <circle key={i} cx={p[0] + dirs[i][0] * spread * e} cy={p[1] + dirs[i][1] * spread * e}
                r={dustSize * (0.7 + 0.6 * hash01(seed + i * 3))} fill={i % 6 ? PALETTE.gold : '#fffaf0'} opacity={tw} />
            );
          })}
        </g>
      )}
    </svg>
  );
};
