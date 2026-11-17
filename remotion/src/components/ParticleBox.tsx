import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, PALETTE } from '../brand';
import type { Pt } from './FlowPaths';
import { hash01, kf, Keys, ramp, startOf } from './anim';

// PARTICLE BOX — the statistical-mechanics picture, drawn exactly (closed-form motion, so every
// frame is deterministic and loop-safe):
//  mode 'gas': N gold particles packed in one half of a box behind a divider; at `releaseAt` the
//    divider lifts and they spread through the whole box and keep moving (walls reflect, no
//    force pulls them anywhere: they mix because mixed arrangements vastly outnumber sorted ones).
//    `gather` grows them out of one point first (e.g. "two particles multiply into a hundred").
//  mode 'collide': two particles meet and rebound (an elastic glancing collision); `clock` runs
//    it (0 → 1 forward, 1 → 0 the same clip reversed: both look equally natural).
export type ParticleBoxProps = {
  x: number; // box center
  y: number;
  w?: number; // box size (default 720 × 560)
  h?: number;
  mode?: 'gas' | 'collide';
  count?: number; // gas: particles (default 100)
  side?: 'left' | 'right'; // gas: the half they start in (default left)
  releaseAt?: number; // gas: frame the divider lifts (default: never)
  speed?: number; // gas: px per frame (default 5)
  gather?: { from: Pt; at: number; len?: number }; // gas: particles grow out of one point
  clock?: Keys; // collide: 0..1 time through the collision, impact at 0.5 (default 0.5)
  trail?: boolean; // collide: a short fading trail behind each particle (default true)
  box?: Keys; // box + divider opacity (default 1; 0 = particles only)
  opacity?: Keys; // everything (e.g. 0.3 = faintly mixing behind a title)
  dot?: number; // particle radius (default 7)
  seed?: number;
  at?: number; // fade-in / motion start
  warm?: boolean;
};

// position in [a, b] of a point bouncing between walls, from its unfolded coordinate u
const fold = (u: number, a: number, b: number) => {
  const L = b - a;
  if (L <= 0) return a;
  let m = (u - a) % (2 * L);
  if (m < 0) m += 2 * L;
  return m <= L ? a + m : a + 2 * L - m;
};
const foldDir = (u: number, a: number, b: number) => {
  const L = b - a;
  let m = (u - a) % (2 * L);
  if (m < 0) m += 2 * L;
  return m <= L ? 1 : -1;
};

export const ParticleBox: React.FC<ParticleBoxProps> = ({
  x, y, w = 720, h = 560, mode = 'gas', count = 100, side = 'left', releaseAt, speed = 5, gather,
  clock = 0.5, trail = true, box = 1, opacity = 1, dot = 7, seed = 4, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const s0 = startOf(at, warm);
  const op = ramp(f, s0, 14) * kf(f, opacity, 1);
  const bx = kf(f, box, 1);
  const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2;
  const mid = x;
  const init = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = hash01(seed * 131 + i) * Math.PI * 2;
      const v = speed * (0.6 + 0.8 * hash01(seed * 71 + i * 3));
      return { u: hash01(seed * 17 + i * 5), v: hash01(seed * 29 + i * 7), vx: Math.cos(a) * v, vy: Math.sin(a) * v, b: hash01(seed + i * 13) };
    }),
    [count, seed, speed],
  );
  if (op <= 0.001) return null;

  const pad = dot + 2;
  const els: React.ReactNode[] = [];
  if (mode === 'gas') {
    const [hx0, hx1] = side === 'left' ? [x0 + pad, mid - pad] : [mid + pad, x1 - pad];
    const T = releaseAt ?? Infinity;
    const t = Math.max(0, f - s0);
    const tr = Math.max(0, T - s0);
    const g = gather ? EASE.out(Math.min(1, Math.max(0, (f - gather.at) / (gather.len ?? 30)))) : 1;
    init.forEach((p, i) => {
      const ux = hx0 + p.u * (hx1 - hx0);
      const uy = y0 + pad + p.v * (h - 2 * pad);
      let px: number, py: number;
      if (t <= tr) {
        px = fold(ux + p.vx * t, hx0, hx1);
      } else {
        // continue from the state at release, now inside the whole box
        const xr = fold(ux + p.vx * tr, hx0, hx1);
        const dir = foldDir(ux + p.vx * tr, hx0, hx1);
        px = fold(xr + dir * p.vx * (t - tr), x0 + pad, x1 - pad);
      }
      py = fold(uy + p.vy * t, y0 + pad, y1 - pad);
      if (gather) { px = gather.from[0] + (px - gather.from[0]) * g; py = gather.from[1] + (py - gather.from[1]) * g; }
      els.push(<circle key={i} cx={px} cy={py} r={dot * (0.85 + 0.3 * p.b)} fill={p.b > 0.9 ? '#fffaf0' : PALETTE.gold} opacity={gather ? Math.min(1, g * 3) : 1} />);
    });
    // the divider lifts out of the box (ease in: an exit), 14 frames
    const lift = releaseAt === undefined ? 0 : EASE.in(Math.min(1, Math.max(0, (f - releaseAt) / 14)));
    if (lift < 1) {
      els.unshift(<line key="div" x1={mid} x2={mid} y1={y0 - h * lift} y2={y1 - h * lift} stroke={PALETTE.ivory} strokeWidth={3} opacity={0.55 * bx * (1 - lift)} />);
    }
  } else {
    // elastic glancing collision of two equal particles; contact at clock 0.5
    const R = dot * 2;
    const b = R * 1.1; // impact parameter
    const nx = Math.sqrt(4 * R * R - b * b) / (2 * R), ny = b / (2 * R);
    const travel = w * 0.42;
    const v1: Pt = [1, 0];
    const dot1 = 2 * nx; // (v1 - v2)·n with v2 = -v1
    const v1o: Pt = [v1[0] - dot1 * nx, v1[1] - dot1 * ny];
    const c1: Pt = [x - nx * R, y - ny * R], c2: Pt = [x + nx * R, y + ny * R];
    const at1 = (c: number): [Pt, Pt] => {
      const s = (c - 0.5) * 2 * travel;
      if (c <= 0.5) return [[c1[0] + v1[0] * s, c1[1] + v1[1] * s], [c2[0] - v1[0] * s, c2[1] - v1[1] * s]];
      return [[c1[0] + v1o[0] * s, c1[1] + v1o[1] * s], [c2[0] - v1o[0] * s, c2[1] - v1o[1] * s]];
    };
    const c = Math.min(1, Math.max(0, kf(f, clock, 0.5)));
    const cPrev = Math.min(1, Math.max(0, kf(f - 1, clock, 0.5)));
    const dir = Math.sign(c - cPrev) || 1; // the trail follows the way time is running
    if (trail) {
      for (let k = 6; k >= 1; k--) {
        const ck = Math.min(1, Math.max(0, c - dir * k * 0.025));
        const [a, bb] = at1(ck);
        els.push(<circle key={`t${k}a`} cx={a[0]} cy={a[1]} r={R * 0.5 * (1 - k / 8)} fill={PALETTE.gold} opacity={0.22 * (1 - k / 7)} />);
        els.push(<circle key={`t${k}b`} cx={bb[0]} cy={bb[1]} r={R * 0.5 * (1 - k / 8)} fill={PALETTE.gold} opacity={0.22 * (1 - k / 7)} />);
      }
    }
    const [p1, p2] = at1(c);
    els.push(<circle key="p1" cx={p1[0]} cy={p1[1]} r={R} fill={PALETTE.gold} />);
    els.push(<circle key="p2" cx={p2[0]} cy={p2[1]} r={R} fill={PALETTE.gold} />);
  }
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op }}>
      {mode === 'gas' && bx > 0.001 && (
        <rect x={x0} y={y0} width={w} height={h} rx={8} fill="none" stroke={PALETTE.ivory} strokeOpacity={0.4 * bx} strokeWidth={3} />
      )}
      {els}
    </svg>
  );
};
