import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CANVAS, MOTION, PALETTE, PLANET_PRESETS, PlanetKind } from '../brand';
import { DEFAULT_VIEW, featuresFor } from '../lib/planetFeatures';
import { ramp, startOf } from './anim';

// PLANET / MOON (brand §5) — a lit sphere in muted true color with each body's one or two
// signature features (continents, maria, polar caps, the Great Red Spot, the Cassini division…),
// stylized and code-drawn. Lit side toward the light, a soft terminator, night side to near-black.
// No outlines and no stroked surface features (soft-edged fills only, so the terminator stays the
// strongest read). No glow of its own: planets don't emit light.
//
// Level of detail follows on-screen size: below ~60 px across it is color + terminator only
// (so small bodies in a Scale comparison stay clean); mid sizes get the main features; hero
// sizes (≥ ~160 px across) get everything. All features are static paths computed once.
export type PlanetProps = {
  x: number;
  y: number;
  r: number;
  kind?: PlanetKind; // preset colors + features (default 'earth')
  light?: number; // direction the light COMES FROM, degrees (0 = right, 90 = below, 225 = upper-left; default 225)
  phase?: number; // 0..1 how much is lit: 1 = nearly full, 0.5 = half (default 0.75)
  bands?: boolean; // override preset (banded planets)
  ring?: boolean; // override preset (Saturn: on; Uranus: off by default, faint when on)
  ringTilt?: number; // ring ellipse height / width (default 0.28)
  tilt?: number; // axial tilt in degrees, rotates bands/ring/features (default: 98 for Uranus, else 0)
  atmosphere?: boolean; // soft glow fading outward from the limb (Earth: on by default)
  features?: boolean; // signature features on/off (default on, still subject to size)
  lon0?: number; // which longitude faces the camera (default: the body's recognizable face)
  rotate?: number; // spin, degrees of longitude per second (e.g. 6 = slow Earth turn). 0 = static
  wash?: boolean; // the brand's soft warm wash behind the HERO object (§2) — one per scene
  at?: number;
  warm?: boolean;
};

let uid = 0;
const LOD_SIMPLE = 60; // px across: below this, color + terminator only
const LOD_FULL = 160; // px across: from here, all details

export const Planet: React.FC<PlanetProps> = ({
  x, y, r, kind = 'earth', light = 225, phase = 0.75, bands, ring, ringTilt = 0.28, tilt, atmosphere,
  features = true, lon0, rotate = 0, wash = false, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = React.useMemo(() => `pl${uid++}`, []);
  const p = PLANET_PRESETS[kind];
  const s = startOf(at, warm);
  const inP = ramp(f, s, MOTION.discIn);
  const R = r * interpolate(inP, [0, 1], [0.96, 1]);
  const dia = 2 * r;
  const level = !features || dia < LOD_SIMPLE ? 0 : dia < LOD_FULL ? 1 : 2;
  const tiltDeg = tilt ?? (kind === 'uranus' ? 98 : 0);

  // which face is shown; a rotating body recomputes its paths (rounded to 0.25° to reuse work)
  const view = DEFAULT_VIEW[kind];
  const lon = Math.round(((lon0 ?? view.lon0) + (rotate * f) / fps) * 4) / 4;
  const feats = useMemo(() => (level === 0 ? [] : featuresFor(kind, { lon0: lon, lat0: view.lat0 })), [kind, lon, view.lat0, level]);

  const softs = useMemo(() => [...new Set(feats.map((ft) => ft.soft).filter((b): b is number => !!b))], [feats]);

  const rad = (light * Math.PI) / 180;
  const lx = Math.cos(rad);
  const ly = Math.sin(rad);
  const litCx = 50 + lx * 32;
  const litCy = 50 + ly * 32;
  const shadowOff = interpolate(phase, [0, 1], [0.15, 1.05]); // larger = less night side
  const shCx = 50 - lx * 50 * shadowOff;
  const shCy = 50 - ly * 50 * shadowOff;
  const showBands = (bands ?? !!p.bands) || feats.length > 0;
  const showRing = ring ?? !!p.ring;
  const faintRing = kind === 'uranus' || kind === 'neptune';
  const rim = (atmosphere ?? !!p.atmosphere) ? p.atmosphere || PALETTE.sci : null;
  const k = R / 100; // feature space (radius 100) → px

  // rings in real proportions (inner/outer edge as multiples of the planet's radius)
  const ringEl = (half: 'back' | 'front') => {
    const ell = (a: number, b: number, col: string, op: number) => (
      <ellipse cx={0} cy={0} rx={R * (a + b) / 2} ry={(R * (a + b) / 2) * ringTilt} fill="none" stroke={col} strokeOpacity={op} strokeWidth={R * (b - a)} />
    );
    return (
      <g clipPath={`url(#${id}${half === 'back' ? 'rb' : 'rf'})`} opacity={inP}>
        <g transform={`translate(${x} ${y}) rotate(${tiltDeg})`}>
          {faintRing ? (
            ell(1.9, 2.0, p.lit, 0.35)
          ) : level === 0 ? (
            ell(1.5, 2.27, p.lit, 0.5)
          ) : (
            <>
              {ell(1.24, 1.52, p.base, 0.22)}{/* C ring, faint */}
              {ell(1.52, 1.95, p.lit, 0.6)}{/* B ring, brightest */}
              {/* Cassini division 1.95–2.03: left empty */}
              {ell(2.03, 2.27, p.lit, 0.45)}{/* A ring */}
              {level === 2 && ell(2.21, 2.225, PALETTE.space, 0.6)}{/* Encke gap */}
            </>
          )}
        </g>
      </g>
    );
  };

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}l`} cx={`${litCx}%`} cy={`${litCy}%`} r="75%">
          <stop offset="0%" stopColor={p.lit} />
          <stop offset="55%" stopColor={p.base} />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
        {/* soft highlight re-applied over the features so they share the sphere's lighting */}
        <radialGradient id={`${id}h`} cx={`${litCx}%`} cy={`${litCy}%`} r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}s`} cx={`${shCx}%`} cy={`${shCy}%`} r="70%">
          <stop offset="0%" stopColor={PALETTE.space} stopOpacity={0.94} />
          <stop offset="55%" stopColor={PALETTE.space} stopOpacity={0.58} />
          <stop offset="100%" stopColor={PALETTE.space} stopOpacity={0} />
        </radialGradient>
        {rim && (
          <radialGradient id={`${id}a`} cx="50%" cy="50%" r="50%">
            <stop offset={`${(100 / 1.14).toFixed(1)}%`} stopColor={rim} stopOpacity={0.42} />
            <stop offset={`${(100 * 1.04 / 1.14).toFixed(1)}%`} stopColor={rim} stopOpacity={0.14} />
            <stop offset="100%" stopColor={rim} stopOpacity={0} />
          </radialGradient>
        )}
        <radialGradient id={`${id}w`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={PALETTE.spaceWarm} />
          <stop offset="100%" stopColor={PALETTE.spaceWarm} stopOpacity={0} />
        </radialGradient>
        {/* soft edges for surface features, one filter per blur radius, in feature units (the
            group's scale makes them track the planet's size). The region spans the whole sphere. */}
        {softs.map((b) => (
          <filter key={b} id={`${id}b${b}`} filterUnits="userSpaceOnUse" x={-130} y={-130} width={260} height={260}>
            <feGaussianBlur stdDeviation={b} />
          </filter>
        ))}
        <clipPath id={`${id}c`}>
          <circle cx={x} cy={y} r={R} />
        </clipPath>
        <clipPath id={`${id}rb`}>
          <rect x={x - R * 3} y={y - R * 3} width={R * 6} height={R * 3} transform={`rotate(${tiltDeg} ${x} ${y})`} />
        </clipPath>
        <clipPath id={`${id}rf`}>
          <rect x={x - R * 3} y={y} width={R * 6} height={R * 3} transform={`rotate(${tiltDeg} ${x} ${y})`} />
        </clipPath>
      </defs>
      {wash && <ellipse cx={x} cy={y} rx={r * 3.2} ry={r * 2.8} fill={`url(#${id}w)`} opacity={inP} />}
      {rim && <circle cx={x} cy={y} r={R * 1.14} fill={`url(#${id}a)`} opacity={inP} />}
      {showRing && ringEl('back')}
      <g opacity={inP}>
        <circle cx={x} cy={y} r={R} fill={`url(#${id}l)`} />
        {showBands && feats.length > 0 && (
          <g clipPath={`url(#${id}c)`}>
            <g transform={`translate(${x} ${y}) rotate(${tiltDeg}) scale(${k})`}>
              {feats.filter((ft) => ft.level <= level).map((ft, i) => (
                <path key={i} d={ft.d} fill={ft.fill} opacity={ft.opacity} filter={ft.soft ? `url(#${id}b${ft.soft})` : undefined} />
              ))}
            </g>
            <circle cx={x} cy={y} r={R} fill={`url(#${id}h)`} />
          </g>
        )}
        <circle cx={x} cy={y} r={R} fill={`url(#${id}s)`} />
      </g>
      {showRing && ringEl('front')}
    </svg>
  );
};
