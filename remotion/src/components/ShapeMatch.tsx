import React from 'react';
import { useCurrentFrame } from 'remotion';
import { EASE, PALETTE } from '../brand';
import { EaseName, kf, Keys } from './anim';

// SHAPE MATCH CUT (brand §8 hand-offs): one gold shape survives the cut and changes geometry into
// the next scene's key element — a disc becomes a bar, a bar becomes an axis, a ring becomes a point.
// The outgoing scene fades out around it while it morphs; the incoming scene builds around its final
// geometry, so the eye never loses its place. Geometry morphs with ease in-out by default; the corner
// radius follows, so a circle (r = half its size) turns into a pill and then a sharp line naturally.
export type ShapeGeom = { x: number; y: number; w: number; h: number; r?: number }; // x, y = center
export const circleGeom = (x: number, y: number, r: number): ShapeGeom => ({ x, y, w: 2 * r, h: 2 * r, r });
export const barGeom = (left: number, cy: number, w: number, h: number): ShapeGeom => ({ x: left + w / 2, y: cy, w, h, r: h / 2 });
export const lineGeom = (x0: number, y0: number, x1: number, y1: number, th = 4): ShapeGeom => ({
  x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: Math.max(th, Math.abs(x1 - x0)), h: Math.max(th, Math.abs(y1 - y0)), r: th / 2,
});
export type ShapeKey = { g: ShapeGeom; at: number; len?: number; ease?: EaseName };

const EASES: Record<EaseName, (x: number) => number> = { inOut: EASE.inOut, out: EASE.out, in: EASE.in, punch: EASE.punch, linear: (x) => x };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const geomAt = (f: number, keys: ShapeKey[]): ShapeGeom => {
  let g = keys[0].g;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const len = k.len ?? 14;
    if (f <= k.at) break;
    const p = EASES[k.ease ?? 'inOut'](Math.min(1, (f - k.at) / len));
    const a = g, b = k.g;
    g = { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p), r: lerp(a.r ?? 0, b.r ?? 0, p) };
  }
  return g;
};

export type ShapeMatchProps = {
  keys: ShapeKey[];
  color?: 'gold' | 'ivory';
  glow?: number; // px of soft glow (default 16)
  opacity?: Keys;
};

export const ShapeMatch: React.FC<ShapeMatchProps> = ({ keys, color = 'gold', glow = 16, opacity = 1 }) => {
  const f = useCurrentFrame();
  const op = kf(f, opacity, 1);
  if (op <= 0.001) return null;
  const g = geomAt(f, keys);
  const r = Math.min(g.r ?? 0, g.w / 2, g.h / 2);
  const bg = color === 'gold' ? `linear-gradient(90deg, ${PALETTE.goldDeep}, ${PALETTE.gold})` : PALETTE.ivory;
  const glowC = color === 'gold' ? 'rgba(232,184,108,0.45)' : 'rgba(244,241,234,0.35)';
  return (
    <div style={{
      position: 'absolute', left: g.x - g.w / 2, top: g.y - g.h / 2, width: g.w, height: g.h, borderRadius: r,
      background: bg, boxShadow: glow > 0 ? `0 0 ${glow}px ${glowC}` : undefined, opacity: op,
    }} />
  );
};
