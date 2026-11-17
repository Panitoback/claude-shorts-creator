import React, { useId, useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION, PALETTE } from '../brand';
import type { Pt } from './FlowPaths';
import { hash01, kf, Keys, ramp, startOf } from './anim';

// EGG (everyday object, stylized) — an ivory egg, softly shaded from the light, no outline.
// States are dials (numbers or keyframes, see `kf`): `crack` draws a gold hairline crack across
// the shell; `split` breaks it open (the top cap lifts and tips, a few shards fly); animating
// split back down and up again is a rewind that stalls ([[a,1],[b,0.45],[c,1]]).
// eggCrackPts() is the crack's exact path, so a GoldMorphLine can become (or leave) the crack.
export type EggProps = {
  x: number;
  y: number;
  r: number; // half the egg's height (its half-width is ~0.74 r)
  light?: number; // direction the light comes FROM, degrees (default 225 = upper-left)
  crack?: Keys; // 0..1 how much of the crack is drawn (default 0)
  split?: Keys; // 0 = whole, 1 = broken open (default 0)
  crackY?: number; // where the crack runs, as a fraction of r above the center (default 0.12)
  wash?: boolean; // the brand's warm wash behind the hero object (§2)
  opacity?: Keys;
  seed?: number;
  at?: number;
  warm?: boolean;
};

const HALF_W = 0.74;
const outline = (x: number, y: number, r: number, n = 96): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const w = r * HALF_W * (1 - 0.13 * Math.cos(t)); // narrower at the top (t = 0)
    return [x + w * Math.sin(t), y - r * Math.cos(t)] as Pt;
  });
// half-width of the egg at height yy (by scanning the outline)
const halfWidthAt = (r: number, dy: number) => {
  const c = -dy / r; // cos t
  if (Math.abs(c) >= 1) return 0;
  return r * HALF_W * (1 - 0.13 * c) * Math.sqrt(1 - c * c);
};

// the crack across the shell, edge to edge, a little above the middle
export const eggCrackPts = (x: number, y: number, r: number, crackY = 0.12, seed = 5, teeth = 8): Pt[] => {
  const cy = y - r * crackY;
  const hw = halfWidthAt(r, cy - y) * 1.01;
  const amp = r * 0.065;
  const pts: Pt[] = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const u = i / (teeth * 2);
    const side = i === 0 || i === teeth * 2 ? 0 : i % 2 ? -1 : 1;
    const jit = (hash01(seed * 17 + i) - 0.5) * amp * 0.7;
    pts.push([x - hw + 2 * hw * u, cy + side * amp + (side ? jit : 0)]);
  }
  return pts;
};

const toPath = (p: Pt[], close = true) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('') + (close ? 'Z' : '');

export const Egg: React.FC<EggProps> = ({
  x, y, r, light = 225, crack = 0, split = 0, crackY = 0.12, wash = false, opacity = 1, seed = 5, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const s0 = startOf(at, warm);
  const inP = ramp(f, s0, MOTION.discIn);
  const op = inP * kf(f, opacity, 1);
  const sc = interpolate(inP, [0, 1], [0.96, 1]);
  const cr = Math.min(1, Math.max(0, kf(f, crack, 0)));
  const sp = Math.min(1, Math.max(0, kf(f, split, 0)));
  const shell = useMemo(() => toPath(outline(x, y, r)), [x, y, r]);
  const crackPts = useMemo(() => eggCrackPts(x, y, r, crackY, seed), [x, y, r, crackY, seed]);
  if (op <= 0.001) return null;

  const rad = (light * Math.PI) / 180;
  const hx = 50 + Math.cos(rad) * 28;
  const hy = 50 + Math.sin(rad) * 30;
  // regions above / below the crack (generous boxes closed around the crack line)
  const big = r * 3;
  const topClip = toPath([...crackPts, [x + big, crackPts[crackPts.length - 1][1]], [x + big, y - big], [x - big, y - big], [x - big, crackPts[0][1]]]);
  const botClip = toPath([...crackPts, [x + big, crackPts[crackPts.length - 1][1]], [x + big, y + big], [x - big, y + big], [x - big, crackPts[0][1]]]);
  const pivot = crackPts[0];
  const capT = `translate(${-r * 0.16 * sp} ${-r * 0.42 * sp}) rotate(${-24 * sp} ${pivot[0]} ${pivot[1]})`;
  const baseT = `translate(0 ${r * 0.05 * sp}) rotate(${3 * sp} ${x} ${y + r})`;
  const nCrack = Math.max(2, Math.round(cr * crackPts.length));
  const crackD = toPath(crackPts.slice(0, nCrack), false);
  const shards = [0.28, 0.46, 0.63, 0.8].map((u, i) => {
    const p = crackPts[Math.round(u * (crackPts.length - 1))];
    const a = -Math.PI / 2 + (hash01(seed + i * 11) - 0.5) * 2.2;
    const dist = r * (0.35 + 0.35 * hash01(seed * 3 + i)) * sp;
    const sz = r * (0.05 + 0.03 * hash01(seed * 7 + i));
    return { x: p[0] + Math.cos(a) * dist, y: p[1] + Math.sin(a) * dist + r * 0.25 * sp * sp, rot: 140 * sp * (i % 2 ? 1 : -1), sz };
  });

  const body = (
    <>
      <path d={shell} fill={`url(#${id}g)`} />
      <path d={shell} fill={`url(#${id}rim)`} />
    </>
  );
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op }}>
      <defs>
        <radialGradient id={`${id}g`} cx={`${hx}%`} cy={`${hy}%`} r="78%">
          <stop offset="0%" stopColor="#fffaf1" />
          <stop offset="45%" stopColor="#efe4d1" />
          <stop offset="80%" stopColor="#bfae95" />
          <stop offset="100%" stopColor="#6e604f" />
        </radialGradient>
        {/* faint warm bounce light on the shadow side, so the limb never goes flat */}
        <radialGradient id={`${id}rim`} cx={`${100 - hx}%`} cy={`${100 - hy}%`} r="60%">
          <stop offset="70%" stopColor="#ffd9a8" stopOpacity={0} />
          <stop offset="100%" stopColor="#ffd9a8" stopOpacity={0.16} />
        </radialGradient>
        <radialGradient id={`${id}w`}>
          <stop offset="0%" stopColor={PALETTE.spaceWarm} />
          <stop offset="100%" stopColor="rgba(255,170,90,0)" />
        </radialGradient>
        <clipPath id={`${id}top`}><path d={topClip} /></clipPath>
        <clipPath id={`${id}bot`}><path d={botClip} /></clipPath>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
        {wash && <circle cx={x} cy={y} r={r * 2.4} fill={`url(#${id}w)`} />}
        {sp <= 0.001 ? body : (
          <>
            <g transform={baseT} clipPath={`url(#${id}bot)`}>{body}</g>
            <g transform={capT}>
              <g clipPath={`url(#${id}top)`}>{body}</g>
            </g>
            {shards.map((s, i) => (
              <polygon key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`}
                points={`0,${-s.sz} ${s.sz * 0.9},${s.sz * 0.6} ${-s.sz * 0.8},${s.sz * 0.5}`} fill="#e9dcc6" opacity={Math.min(1, sp * 3)} />
            ))}
          </>
        )}
        {cr > 0 && sp < 0.999 && (
          <path d={crackD} fill="none" stroke={PALETTE.gold} strokeWidth={Math.max(3, r * 0.018)} strokeLinecap="round" strokeLinejoin="round" opacity={1 - sp} />
        )}
      </g>
    </svg>
  );
};
