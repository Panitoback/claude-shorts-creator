import React, { useMemo } from 'react';
import { CANVAS } from '../brand';
import { starTint } from '../lib/sky';
import { clamp01 } from './color';
import { STAR_MIN_A, STAR_MIN_R } from './Starfield';

// PARALLAX STARS (brand v2.0: hook camera moves with depth) — a VOLUME of stars for fast camera
// moves along the view axis (dive-in, pull-back). Starfield is one flat layer: zooming it turns
// stars into blobs. Here every star has a depth, so when the camera travels, near stars stream
// past fast and far stars barely move, while each star stays a small point (brand §5).
//
// The camera model is one number, `dist`: the camera's distance to the hero object's plane, with
// 1 = the rest framing (the hero at its normal size). The hero's apparent scale is 1/dist, so a
// shot that scales its hero by k uses dist = 1/k and the stars move with it exactly.
// Each star sits at depth `z` relative to that plane (z > 0 behind the hero, z < 0 in front of
// it, between hero and camera); its apparent scale is 1 / (dist + z). Stars about to pass the
// camera fade out. `fillAt` = the camera distance at which this layer fills the screen (its
// stars are spread to cover the canvas there): 1 for a sky seen at rest, the starting distance
// for stars the camera will fly through.
//
// Same compression rules as Starfield: every star ≥ STAR_MIN_R px and ≥ STAR_MIN_A bright; no
// twinkle here (moving stars don't need it). Never behind text: pass text blocks as `clear`
// (stars fade out smoothly as they enter, so nothing pops).
export type ParallaxStarsProps = {
  dist: number; // camera distance to the hero plane (1 = rest framing; 1/scale of the hero)
  cx?: number; // vanishing point = the hero's screen position (default canvas center)
  cy?: number;
  count?: number; // default 260
  z?: [number, number]; // depth range of this layer (default [0.15, 3]: behind the hero)
  fillAt?: number; // camera distance at which the layer fills the screen (default 1)
  opacity?: number; // overall sky brightness (pass quasarExposure(..).stars)
  bright?: number; // how many of the largest stars get a tiny soft halo (default 10)
  clear?: [number, number, number, number][]; // [x, y, w, h] screen rects kept free of stars
  seed?: number;
};

const rand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const NEAR = 0.06; // stars closer than this (in dist units) are gone (passed the camera)

export const ParallaxStars: React.FC<ParallaxStarsProps> = ({
  dist, cx = CANVAS.W / 2, cy = CANVAS.H / 2, count = 260, z = [0.15, 3], fillAt = 1, opacity = 1,
  bright = 10, clear = [], seed = 11,
}) => {
  const stars = useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: count }, () => {
      const zz = z[0] + (z[1] - z[0]) * r();
      const spread = fillAt + zz; // world units → screen at the fill distance
      return {
        z: zz,
        px: (r() - 0.5) * CANVAS.W * 1.25 * spread, // lateral position, world px at scale 1
        py: (r() - 0.5) * CANVAS.H * 1.25 * spread,
        r: 1.4 + r() * r() * 1.6, // mostly small
        a: 0.6 + r() * 0.4,
        t: r(),
      };
    });
  }, [count, seed, z[0], z[1], fillAt]);
  const order = useMemo(() => stars.map((s, i) => [s.r, i] as const).sort((a, b) => b[0] - a[0]).slice(0, bright).map(([, i]) => i), [stars, bright]);
  const brightSet = useMemo(() => new Set(order), [order]);
  if (opacity <= 0) return null;

  const edge = 40; // px: soft edge of a clear rect
  const clearFade = (X: number, Y: number) => {
    let m = 1;
    for (const [x, y, w, h] of clear) {
      const dx = Math.max(x - X, 0, X - (x + w));
      const dy = Math.max(y - Y, 0, Y - (y + h));
      m = Math.min(m, clamp01(Math.hypot(dx, dy) / edge));
    }
    return m;
  };

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <radialGradient id="pStarHalo">
          <stop offset="0%" stopColor="#fff6ea" stopOpacity={0.5} />
          <stop offset="45%" stopColor="#fff6ea" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#fff6ea" stopOpacity={0} />
        </radialGradient>
      </defs>
      {stars.map((s, i) => {
        const d = dist + s.z;
        if (d <= NEAR) return null;
        const k = 1 / d;
        const X = cx + s.px * k;
        const Y = cy + s.py * k;
        if (X < -20 || X > CANVAS.W + 20 || Y < -20 || Y > CANVAS.H + 20) return null;
        // nearer than the rest framing → slightly bigger (but still a point); fading as it passes
        const grow = Math.min(2.2, Math.sqrt(Math.max(1, k / (1 / (1 + Math.max(0, s.z))))));
        const pass = clamp01((d - NEAR) / 0.25);
        const isBright = brightSet.has(i);
        const rr = Math.max(STAR_MIN_R, s.r * grow * (isBright ? 1.15 : 0.9));
        const op = opacity * pass * clearFade(X, Y);
        if (op < 0.02) return null;
        return (
          <g key={i} opacity={op}>
            {isBright && <circle cx={X} cy={Y} r={rr * 4} fill="url(#pStarHalo)" />}
            <circle cx={X} cy={Y} r={rr} fill={starTint(s.t)} opacity={isBright ? 1 : Math.max(STAR_MIN_A, s.a)} />
          </g>
        );
      })}
    </svg>
  );
};
