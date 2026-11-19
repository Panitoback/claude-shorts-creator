import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, PALETTE, SkyPreset } from '../brand';
import { blendedSkyAt, elevationAt, pxPerDeg, skyToScreen, starsFor } from '../lib/groundSky';
import { mulberry32, starTint } from '../lib/sky';
import { kf, Keys } from './anim';
import { mix } from './color';
import { STAR_MIN_A, STAR_MIN_R } from './Starfield';

// SKY VIEW (brand §11) — the sky seen from the ground: a gradient by ELEVATION (horizon → zenith) in
// muted true-to-life colors, so it stays right when the camera tilts or the field of view narrows
// (a telephoto view sees only the band just above the horizon, as a real lens does).
// Presets: night, twilight, dusk, dayMuted, day (bright), eclipse. `to` + `mix` blend two presets
// (dusk → night, day → eclipse…); `toSpace` blends the whole sky into space black (the hand-offs).
//
// Stars live on the sky (azimuth/elevation), stop at the horizon and COME OUT ONE BY ONE, brightest
// first (planets, then bright stars, then faint ones): each star fades over ~0.5 s from the moment the
// `reveal` dial passes its rank — never a fade of the whole sky (compression smears those, brand §8).
// By default `reveal` follows the presets (night 1, twilight 0.12, dusk planets only, day 0).
// Faint stars are static; only the bright ones twinkle (brand §5).
export type SkyPlanet = { az: number; el: number; r?: number; on?: number; off?: number; star?: boolean }; // on/off: frames it switches on/off (~0.5 s fade each); star = a bright star (smaller, tinted)
export type SkyViewProps = {
  sky?: SkyPreset; // default 'night'
  to?: SkyPreset; // second preset to blend toward
  mix?: Keys; // 0..1 blend sky → to (keys over frames)
  toSpace?: Keys; // 0..1 blend toward space black (tilt-up / pull-back hand-offs)
  fov?: number; // degrees across the frame width (default 60)
  tilt?: Keys; // camera pitch, degrees (default 0)
  horizonY: number; // screen y of the horizon at tilt 0 (from the layout, never a literal)
  stars?: number; // how many stars on the whole dome strip (default 520)
  bright?: number; // how many twinkle with a halo (default 12)
  reveal?: Keys; // override: 0..1 how much of the starfield is out
  planets?: SkyPlanet[]; // bright points that come out first (Venus, Jupiter…)
  colorFov?: number; // spread the sky COLORS as if the frame were this wide (telephoto stylization: keeps blue overhead and the glow low, sizes stay true)
  glow?: { az: number; el: number; color?: string; strength?: number; radiusDeg?: number }; // soft sky glow around the Sun at dusk
  seed?: number;
};

let uid = 0;
const FADE = 15; // frames per star (≈ 0.5 s)
type DomeStar = { az: number; el: number; r: number; a: number; t: number };

export const SkyView: React.FC<SkyViewProps> = ({
  sky = 'night', to, mix: mixK = 0, toSpace = 0, fov = 60, tilt = 0, horizonY, stars = 520, bright = 12, reveal, planets = [], glow, colorFov, seed = 5,
}) => {
  const f = useCurrentFrame();
  const id = useMemo(() => `sky${uid++}`, []);
  const b = to ?? sky;
  const t = kf(f, mixK, 0);
  const sp = kf(f, toSpace, 0);
  const view = { fov, tilt: kf(f, tilt, 0), horizonY };
  const k = pxPerDeg(fov);

  // gradient: sample the elevation-based color down the frame
  const stops = useMemo(() => {
    const n = 28;
    return Array.from({ length: n + 1 }, (_, i) => {
      const y = (i / n) * CANVAS.H;
      return { o: i / n, c: blendedSkyAt(sky, b, t, sp, elevationAt(y, colorFov ? { ...view, fov: colorFov } : view), PALETTE.space) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sky, b, t, sp, view.tilt, fov, horizonY, colorFov]);

  const dome = useMemo<DomeStar[]>(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: stars }, () => {
      const m = rnd();
      return { az: (rnd() - 0.5) * 84, el: 0.6 + rnd() * 130, r: 0.6 + Math.pow(m, 4) * 2.6, a: 0.25 + Math.pow(rnd(), 2) * 0.75, t: rnd() };
    });
  }, [stars, seed]);
  const rank = useMemo(() => {
    const order = dome.map((s, i) => [s.r * (0.6 + s.a), i] as const).sort((p, q) => q[0] - p[0]).map(([, i]) => i);
    const m = new Map<number, number>();
    order.forEach((i, r) => m.set(i, r));
    return m;
  }, [dome]);

  // reveal history over the last FADE frames → each star fades from the frame it crossed its rank
  const revealAt = (fr: number) => (reveal !== undefined ? kf(fr, reveal, 0) : starsFor(sky, b, kf(fr, mixK, 0)));
  const hist = Array.from({ length: FADE }, (_, j) => revealAt(f - j));
  const alphaFor = (thr: number) => {
    let n = 0;
    for (const r of hist) if (r > thr) n++;
    return n / FADE;
  };
  const thrStar = (r: number) => 0.02 + 0.98 * (r / Math.max(1, dome.length));
  const thrPlanet = (i: number) => 0.003 + 0.004 * i;
  const hy = view.horizonY + view.tilt * k;

  let glowEl: React.ReactNode = null;
  if (glow) {
    const [gx, gy] = skyToScreen(glow.az, glow.el, view);
    const R = (glow.radiusDeg ?? 18) * k;
    const c = glow.color ?? '#c98a52';
    glowEl = (
      <>
        <defs>
          <radialGradient id={`${id}g`}>
            <stop offset="0%" stopColor={c} stopOpacity={0.55} />
            <stop offset="45%" stopColor={c} stopOpacity={0.18} />
            <stop offset="100%" stopColor={c} stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={gx} cy={gy} rx={R * 1.5} ry={R} fill={`url(#${id}g)`} opacity={(glow.strength ?? 1) * (1 - sp)} />
      </>
    );
  }

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((s) => <stop key={s.o} offset={s.o} stopColor={s.c} />)}
        </linearGradient>
        <radialGradient id={`${id}h`}>
          <stop offset="0%" stopColor="#fff6ea" stopOpacity={0.5} />
          <stop offset="45%" stopColor="#fff6ea" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#fff6ea" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={CANVAS.W} height={CANVAS.H} fill={`url(#${id}l)`} />
      {glowEl}
      {dome.map((s, i) => {
        const r0 = rank.get(i)!;
        const a = alphaFor(thrStar(r0));
        if (a <= 0) return null;
        const [x, y] = skyToScreen(s.az, s.el, view);
        if (x < -10 || x > CANVAS.W + 10 || y < -10 || y > hy - 4) return null;
        const isBright = r0 < bright;
        const tw = isBright ? 1 - MOTION.twinkle + MOTION.twinkle * Math.sin(f / 18 + i * 1.7) : 1;
        const r = isBright ? Math.max(1.8, s.r * 1.1) : Math.max(STAR_MIN_R, s.r * 0.85);
        const al = isBright ? 1 : Math.max(STAR_MIN_A, s.a * 0.9);
        return (
          <g key={i} opacity={a * tw}>
            {isBright && <circle cx={x} cy={y} r={r * 4} fill={`url(#${id}h)`} />}
            <circle cx={x} cy={y} r={r} fill={starTint(s.t)} opacity={al} />
          </g>
        );
      })}
      {planets.map((p, i) => {
        const a = p.on !== undefined
          ? Math.max(0, Math.min(1, (f - p.on) / FADE) - (p.off !== undefined ? Math.min(1, Math.max(0, (f - p.off) / FADE)) : 0))
          : alphaFor(thrPlanet(i));
        if (a <= 0) return null;
        const [x, y] = skyToScreen(p.az, p.el, view);
        const r = p.r ?? (p.star ? 2.6 : 3.2);
        return (
          <g key={`p${i}`} opacity={a}>
            <circle cx={x} cy={y} r={r * 4.5} fill={`url(#${id}h)`} />
            <circle cx={x} cy={y} r={r} fill={p.star ? starTint(0.75) : mix('#fff6ea', '#ffe9c4', 0.4)} />
          </g>
        );
      })}
    </svg>
  );
};
