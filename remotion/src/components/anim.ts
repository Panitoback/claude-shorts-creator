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
