import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, GROUND, SkyPreset } from '../brand';
import { angularDeg, blendedSkyAt, pxPerDeg } from '../lib/groundSky';
import { mulberry32 } from '../lib/sky';
import { kf, Keys } from './anim';
import { mix } from './color';

// HORIZON (brand §11) — flat dark silhouettes along the bottom of a ground view. Never photographic:
// no texture, no lit faces, no outlines. Variants: hills, mountains, treeline, city (generic blocks, a
// few lit windows at most, no landmark), sea (flat; optional soft reflection path of the Sun/Moon).
//
// HONEST OPTICS: every layer is a real height at a real distance, projected with the frame's field of
// view. In a wide frame (~60°) a treeline 120 m away rises ~7°; in a telephoto frame (1.5°) the same
// pixels need a skyline ~20 km away. So a big Moon over a city is drawn by narrowing `fov` and pushing
// the layers far away (horizonLayers(variant, fov) does it), never by enlarging the disc.
// Farther layers take some of the sky's horizon color (aerial perspective). `dolly` (metres sideways)
// gives true parallax: near layers move more than far ones. The horizon is always level.
export type HorizonVariant = 'hills' | 'mountains' | 'treeline' | 'city' | 'sea';
export type HorizonLayer = {
  variant: HorizonVariant; distance: number; height?: number; seed?: number;
  trees?: number; // hills only: scattered trees on the ridge, 0..1 density (0.1 = a few)
  treeHeight?: number; // m (default 9)
  treeX?: number[]; // hills only: explicit tree positions, m from the frame center (composition control)
};
export type HorizonProps = {
  layers?: HorizonLayer[]; // far → near order not required (sorted by distance)
  variant?: HorizonVariant; // shortcut: default layers for this variant at this fov
  fov?: number; // degrees across the frame (default 60)
  tilt?: Keys; // camera pitch, degrees: the whole ground slides down as the camera tilts up
  horizonY: number;
  sky?: SkyPreset; // the sky it sits under (for aerial perspective and sea color)
  to?: SkyPreset;
  mix?: Keys;
  dolly?: Keys; // camera moved sideways, metres (parallax)
  windows?: boolean; // city: a few lit windows (default true at night)
  reflect?: { x: number; r: number; color?: string; strength?: number }; // sea: reflection path under a disc at screen x, radius r px
  opacity?: Keys;
};

const DEFAULT_H: Record<HorizonVariant, number> = { hills: 80, mountains: 1200, treeline: 18, city: 110, sea: 0 };

// default layers for a wide (60°) frame; narrower fov pushes them proportionally farther (same pixels)
export const horizonLayers = (variant: HorizonVariant, fov: number = GROUND.wideFov): HorizonLayer[] => {
  const s = fov > 0 ? GROUND.wideFov / fov : 1;
  const L: Record<HorizonVariant, HorizonLayer[]> = {
    hills: [{ variant: 'hills', distance: 4000, height: 300, seed: 3 }, { variant: 'hills', distance: 1200, height: 90, seed: 7 }, { variant: 'hills', distance: 260, height: 30, seed: 11 }],
    mountains: [{ variant: 'mountains', distance: 24000, height: 3200, seed: 5 }, { variant: 'mountains', distance: 8000, height: 1000, seed: 9 }, { variant: 'hills', distance: 600, height: 40, seed: 13 }],
    treeline: [{ variant: 'hills', distance: 3000, height: 160, seed: 4 }, { variant: 'treeline', distance: 130, seed: 8 }],
    city: [{ variant: 'city', distance: 4200, height: 120, seed: 6 }, { variant: 'city', distance: 1300, seed: 10 }],
    sea: [{ variant: 'sea', distance: 1e9 }],
  };
  return L[variant].map((l) => (l.variant === 'sea' ? l : { ...l, distance: l.distance * s }));
};

type Prof = { pts: [number, number][]; windows: [number, number, number, number][] }; // metres: [x, h]; windows [x, h, w, hh]

const profile = (l: HorizonLayer, half: number): Prof => {
  const rnd = mulberry32(l.seed ?? 1);
  const H = l.height ?? DEFAULT_H[l.variant];
  const pts: [number, number][] = [];
  const windows: Prof['windows'] = [];
  const x0 = -half;
  const x1 = half;
  const N = 420;
  const step = (x1 - x0) / N;
  if (l.variant === 'sea') return { pts: [[x0, 0], [x1, 0]], windows };
  if (l.variant === 'hills') {
    const lam = H * 9;
    const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
    for (let i = 0; i <= N; i++) {
      const x = x0 + i * step;
      const h = H * (0.55 + 0.28 * Math.sin(x / lam + ph[0]) + 0.13 * Math.sin(x / (lam * 0.37) + ph[1]) + 0.04 * Math.sin(x / (lam * 0.11) + ph[2]));
      pts.push([x, Math.max(0, h)]);
    }
    if ((l.trees && l.trees > 0) || l.treeX) {
      // a few trees standing on the ridge at real heights: narrow conifers with a stepped edge.
      // (Broadleaf crowns overhang their trunk; a height profile can't leave sky under a crown, so
      // they read as blocks: conifers only.) `treeX` places them (m from frame center) for
      // composition; otherwise `trees` scatters them by density.
      const TH = l.treeHeight ?? 9;
      type T = { x: number; h: number; w: number };
      const mk = (x: number): T => {
        const h = TH * (0.7 + rnd() * 0.45);
        return { x, h, w: h * (0.26 + rnd() * 0.14) };
      };
      const ts: T[] = [];
      if (l.treeX) l.treeX.forEach((x) => ts.push(mk(x)));
      else {
        let x = x0;
        while (x < x1) {
          x += (TH * (0.6 + rnd() * 1.4)) / Math.max(0.02, l.trees ?? 0.1);
          if (rnd() < 0.5) {
            const n = 1 + Math.floor(rnd() * 3); // small clumps
            for (let j = 0; j < n; j++) ts.push(mk(x + j * TH * 0.45));
          }
        }
      }
      const base = (xx: number) => {
        const i = Math.max(0, Math.min(N, Math.round((xx - x0) / step)));
        return pts[i][1];
      };
      const treeH = (t: T, dx: number) => {
        const u = Math.abs(dx) / (t.w / 2);
        if (u >= 1) return -1;
        const v = 1 - u;
        return t.h * v * (0.88 + 0.12 * ((v * 5) % 1));
      };
      const fine: [number, number][] = [];
      const fstep = Math.min(step, TH / 40);
      for (let xx = x0; xx <= x1; xx += fstep) {
        let h = base(xx);
        for (const t of ts) {
          if (Math.abs(xx - t.x) > t.h) continue;
          const th = treeH(t, xx - t.x);
          if (th >= 0) h = Math.max(h, base(t.x) + th);
        }
        fine.push([xx, h]);
      }
      pts.length = 0;
      pts.push(...fine);
    }
  } else if (l.variant === 'mountains') {
    // midpoint displacement ridge, deterministic
    const n = 128;
    const hs = new Array(n + 1).fill(0);
    hs[0] = H * (0.3 + rnd() * 0.4);
    hs[n] = H * (0.3 + rnd() * 0.4);
    let amp = H * 0.95;
    for (let size = n; size > 1; size /= 2) {
      for (let i = size / 2; i < n; i += size) hs[i] = (hs[i - size / 2] + hs[i + size / 2]) / 2 + (rnd() - 0.5) * amp;
      amp *= 0.56;
    }
    for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, Math.max(H * 0.08, Math.min(H, hs[i]))]);
  } else if (l.variant === 'treeline') {
    // gentle ground + a row of trees (conifers and rounded crowns), sampled as one outline
    type Tree = { x: number; h: number; w: number; kind: 0 | 1 };
    const trees: Tree[] = [];
    let x = x0 - 6;
    while (x < x1 + 6) {
      const h = H * (0.7 + rnd() * 0.35);
      const kind = rnd() < 0.62 ? 0 : 1;
      const w = kind === 0 ? h * (0.42 + rnd() * 0.12) : h * (0.6 + rnd() * 0.2);
      trees.push({ x, h, w, kind });
      x += w * (0.45 + rnd() * 0.55) + (rnd() < 0.12 ? w * 1.4 : 0); // occasional gap
    }
    const ground = (xx: number) => 1.5 + 1.2 * Math.sin(xx / 37);
    const fine = Math.max(step / 3, 0.15);
    for (let xx = x0; xx <= x1; xx += fine) {
      let h = ground(xx);
      for (const t of trees) {
        const u = Math.abs(xx - t.x) / (t.w / 2);
        if (u >= 1) continue;
        // conifer: a tapering spire with a slightly ragged edge; crown: a soft dome on a short trunk
        const th = t.kind === 0 ? t.h * (1 - u) * (0.92 + 0.08 * Math.sin(xx * 3.1 + t.x)) : t.h * (0.35 + 0.65 * Math.sqrt(1 - u * u));
        h = Math.max(h, th);
      }
      pts.push([xx, h]);
    }
  } else if (l.variant === 'city') {
    let x = x0 - 20;
    const fine: [number, number][] = [];
    while (x < x1 + 20) {
      const w = 18 + rnd() * 42;
      const tall = rnd();
      const h = H * (0.18 + Math.pow(tall, 2.2) * 0.82);
      const gap = rnd() < 0.15 ? 6 + rnd() * 14 : 0;
      fine.push([x, h], [x + w, h]);
      if (h > H * 0.6 && rnd() < 0.35) {
        // a thin antenna on a tall block
        const ax = x + w * (0.3 + rnd() * 0.4);
        fine.push([ax - 0.6, h], [ax - 0.6, h + H * 0.12], [ax + 0.6, h + H * 0.12], [ax + 0.6, h]);
        fine.sort((a, b) => a[0] - b[0]);
      }
      if (rnd() < 0.4) {
        const k = 1 + Math.floor(rnd() * 2);
        for (let j = 0; j < k; j++) windows.push([x + 3 + rnd() * (w - 7), h * (0.2 + rnd() * 0.65), 2.2, 1.6]);
      }
      x += w;
      if (gap) {
        fine.push([x, H * 0.06], [x + gap, H * 0.06]);
        x += gap;
      }
    }
    // keep x monotone for a clean outline
    for (const p of fine) pts.push(p);
  }
  return { pts, windows };
};

// screen y of the NEAREST layer's ground at screen x (to stand an Observer on the hill, not in it)
export const groundYAt = (x: number, horizonY: number, opts: { layers?: HorizonLayer[]; variant?: HorizonVariant; fov?: number; tilt?: number } = {}) => {
  const fov = opts.fov ?? GROUND.wideFov;
  const L = [...(opts.layers ?? horizonLayers(opts.variant ?? 'hills', fov))].sort((a, b) => a.distance - b.distance);
  const near = L[0];
  const k = pxPerDeg(fov);
  const hy = horizonY + (opts.tilt ?? 0) * k;
  if (near.variant === 'sea') return hy;
  // a treeline's observer stands on the ground in front of the trees, not on their tops
  if (near.variant === 'treeline') return hy - angularDeg(1.5 - GROUND.eyeM, near.distance) * k;
  const half = Math.tan((fov * 0.8 * Math.PI) / 180) * near.distance + 60;
  const P = profile({ ...near, trees: 0, treeX: undefined }, half).pts.map(([mx, h]) => [CANVAS.W / 2 + angularDeg(mx, near.distance) * k, hy - angularDeg(h - GROUND.eyeM, near.distance) * k] as const);
  let best = Infinity;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i];
    const [x1, y1] = P[i + 1];
    if ((x >= x0 && x <= x1) || (x >= x1 && x <= x0)) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      best = Math.min(best, y0 + (y1 - y0) * t);
    }
  }
  return best === Infinity ? hy : best;
};

let uid = 0;

export const Horizon: React.FC<HorizonProps> = ({
  layers, variant = 'hills', fov = GROUND.wideFov as number, tilt = 0, horizonY, sky = 'night', to, mix: mixK = 0, dolly = 0, windows, reflect, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const id = useMemo(() => `hz${uid++}`, []);
  const L = useMemo(() => [...(layers ?? horizonLayers(variant, fov))].sort((a, b) => b.distance - a.distance), [layers, variant, fov]);
  const k = pxPerDeg(fov);
  const half = useMemo(() => L.map((l) => (l.variant === 'sea' ? 1 : Math.tan(((fov * 0.8) * Math.PI) / 180) * l.distance + 60)), [L, fov]);
  const profs = useMemo(() => L.map((l, i) => profile(l, half[i])), [L, half]);
  const tl = kf(f, tilt, 0);
  const hy = horizonY + tl * k;
  const tmix = kf(f, mixK, 0);
  const skyH = blendedSkyAt(sky, to ?? sky, tmix, 0, 0.5, '#05060a');
  const dl = kf(f, dolly, 0);
  const night = (to ?? sky) === 'night' || sky === 'night';
  const showWin = windows ?? night;
  const n = L.length;

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: kf(f, opacity, 1) }}>
      <defs>
        <linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mix(GROUND.land, skyH, 0.38)} />
          <stop offset="35%" stopColor={mix(GROUND.land, skyH, 0.14)} />
          <stop offset="100%" stopColor={GROUND.land} />
        </linearGradient>
      </defs>
      {L.map((l, i) => {
        // aerial perspective: farthest layer takes GROUND.aerial of the sky color, nearest none
        const depth = n === 1 ? 0 : 1 - i / (n - 1);
        const col = mix(GROUND.land, skyH, GROUND.aerial * depth * depth);
        if (l.variant === 'sea') {
          const top = hy;
          return (
            <g key={i}>
              <rect x={0} y={top} width={CANVAS.W} height={CANVAS.H - top + 40} fill={`url(#${id}sea)`} />
              {reflect && <Reflection y0={top} {...reflect} />}
            </g>
          );
        }
        const pr = profs[i];
        const shift = angularDeg(dl, l.distance) * k; // parallax
        const toS = ([x, h]: [number, number]): [number, number] => [
          CANVAS.W / 2 + angularDeg(x, l.distance) * k - shift,
          hy - angularDeg(h - GROUND.eyeM, l.distance) * k,
        ];
        const P = pr.pts.map(toS);
        const d = `M ${P[0][0].toFixed(1)} ${CANVAS.H + 40} ` + P.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ` L ${P[P.length - 1][0].toFixed(1)} ${CANVAS.H + 40} Z`;
        return (
          <g key={i}>
            <path d={d} fill={col} />
            {l.variant === 'city' && showWin && pr.windows.map(([x, h, w, hh], j) => {
              const [sx, sy] = toS([x, h]);
              const sw = angularDeg(w, l.distance) * k;
              const sh = angularDeg(hh, l.distance) * k;
              if (sw < 2) return null;
              return <rect key={j} x={sx} y={sy} width={sw} height={Math.max(1.5, sh)} fill="#d9b46a" opacity={0.32 + 0.2 * (j % 3) / 2} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

// a soft, broken path of light on the water under a low Sun or Moon
const Reflection: React.FC<{ y0: number; x: number; r: number; color?: string; strength?: number }> = ({ y0, x, r, color = '#e9a868', strength = 1 }) => {
  const f = useCurrentFrame();
  const rows = 26;
  return (
    <g opacity={0.75 * strength}>
      {Array.from({ length: rows }, (_, i) => {
        const u = i / rows;
        const y = y0 + 3 + Math.pow(u, 1.6) * 420;
        const h1 = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
        const h2 = Math.abs(Math.sin(i * 39.346 + 11.135) * 24634.6345) % 1;
        const w = r * (1.0 + u * 4.5) * (0.35 + 0.65 * h1) * (0.8 + 0.2 * Math.sin(f / 37 + i * 2.1));
        const hh = 2 + u * 6;
        const dx = (h2 - 0.5) * r * (0.6 + 2.2 * u) + Math.sin(f / 51 + i * 1.3) * r * 0.25 * u;
        if (h2 < 0.18) return null; // gaps: a broken path, not a ladder
        return <rect key={i} x={x - w / 2 + dx} y={y} width={w} height={hh} rx={hh / 2} fill={color} opacity={(1 - u) * (0.4 + 0.5 * h1)} />;
      })}
    </g>
  );
};
