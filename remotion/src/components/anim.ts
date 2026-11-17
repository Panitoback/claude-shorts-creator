// Shared animation helpers for the channel components (brand/brand.md §8).
import { interpolate } from 'remotion';
import { EASE } from '../brand';

export const CL = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// 0..1 (or from..to) eased with the brand's arrival easing, starting at frame `at` for `len` frames.
export const ramp = (f: number, at: number, len: number, from = 0, to = 1) =>
  interpolate(f, [at, at + Math.max(1, len)], [from, to], { ...CL, easing: EASE.out });

// Every component takes `at` (start frame, local to its Sequence) and `warm`.
// warm = already fully arrived at frame 0 — the hook / thumbnail rule (brand §10).
export const startOf = (at = 0, warm = false) => (warm ? -100000 : at);

// translateY for the brand's fade + rise entrance.
export const riseY = (p: number, px: number) => `translateY(${(1 - p) * px}px)`;

// KEYFRAMED VALUES — for components whose state is a dial over time (crack 0→1, split, mix, a
// rewind that stalls: [[at, 1], [at + 20, 0.5], [at + 40, 1]]). A plain number = constant.
// Each key may name the easing of the segment that ENDS on it (default inOut, brand §8 morphs).
export type EaseName = 'inOut' | 'out' | 'in' | 'punch' | 'linear';
export type Key = readonly [number, number] | readonly [number, number, EaseName];
export type Keys = number | readonly Key[];
const EASES: Record<EaseName, (t: number) => number> = {
  inOut: EASE.inOut, out: EASE.out, in: EASE.in, punch: EASE.punch, linear: (t) => t,
};
export const kf = (f: number, k: Keys | undefined, fallback = 0): number => {
  if (k === undefined) return fallback;
  if (typeof k === 'number') return k;
  if (k.length === 0) return fallback;
  if (f <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (f <= k[i][0]) {
      const [f0, v0] = k[i - 1];
      const [f1, v1] = k[i];
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * EASES[(k[i][2] as EaseName) ?? 'inOut'](t);
    }
  }
  return k[k.length - 1][1];
};

// Deterministic pseudo-random in [0, 1) from an integer seed (stable across renders).
export const hash01 = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
