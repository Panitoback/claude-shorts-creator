// Starfield helpers (brand/brand.md §5): deterministic sky, real stellar tints, text-clear zones.
import { STAR_TINTS } from '../brand';
export type Star = { x: number; y: number; r: number; a: number; t: number };

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Deterministic starfield: same seed → same sky on every render.
// r skews small (most stars are faint), t = 0..1 "temperature" for tinting.
export const makeStars = (n: number, seed: number, W = 1080, H = 1920): Star[] => {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const m = rnd();
    return {
      x: rnd() * W,
      y: rnd() * H,
      r: 0.6 + Math.pow(m, 4) * 2.6,
      a: 0.25 + Math.pow(rnd(), 2) * 0.75,
      t: rnd(),
    };
  });
};

// Real stellar colors by temperature: cool red-orange → yellow → white → hot blue-white.
export const starTint = (t: number): string =>
  t < 0.12 ? STAR_TINTS[0] : t < 0.3 ? STAR_TINTS[1] : t < 0.7 ? STAR_TINTS[2] : t < 0.9 ? STAR_TINTS[3] : STAR_TINTS[4];

// Keep text readable: drop stars that fall inside any [x, y, w, h] rectangle.
export const clearZones = (stars: Star[], zones: [number, number, number, number][]): Star[] =>
  stars.filter((s) => !zones.some(([x, y, w, h]) => s.x > x - 6 && s.x < x + w + 6 && s.y > y - 6 && s.y < y + h + 6));
