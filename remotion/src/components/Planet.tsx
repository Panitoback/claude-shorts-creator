import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, PALETTE, PLANET_PRESETS, PlanetKind } from '../brand';
import { ramp, startOf } from './anim';

// PLANET / MOON (brand §5) — a lit sphere in muted true color: lit side toward the light, a soft
// terminator, night side falling to near-black. Optional cloud bands, ring, thin atmosphere rim.
// No outlines, no glow — planets don't emit light.
export type PlanetProps = {
  x: number;
  y: number;
  r: number;
  kind?: PlanetKind; // preset colors (default 'earth')
  light?: number; // direction the light COMES FROM, degrees (0 = right, 90 = below, 225 = upper-left; default 225)
  phase?: number; // 0..1 how much is lit: 1 = nearly full (soft), 0.5 = half (default 0.75)
  bands?: boolean; // override preset
  ring?: boolean; // override preset
  ringTilt?: number; // ring ellipse height / width (default 0.28)
  atmosphere?: boolean; // override preset (rim color from preset, or sci blue)
  at?: number;
  warm?: boolean;
};

let uid = 0;

export const Planet: React.FC<PlanetProps> = ({
  x, y, r, kind = 'earth', light = 225, phase = 0.75, bands, ring, ringTilt = 0.28, atmosphere, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `pl${uid++}`, []);
  const p = PLANET_PRESETS[kind];
  const s = startOf(at, warm);
  const inP = ramp(f, s, MOTION.discIn);
  const scale = interpolate(inP, [0, 1], [0.96, 1]);
  const R = r * scale;

  const rad = (light * Math.PI) / 180;
  const lx = Math.cos(rad);
  const ly = Math.sin(rad);
  // lit gradient centered toward the light; shadow gradient centered away from it
  const litCx = 50 + lx * 32;
  const litCy = 50 + ly * 32;
  const shadowOff = interpolate(phase, [0, 1], [0.15, 1.05]); // larger = less night side
  const shCx = 50 - lx * 50 * shadowOff;
  const shCy = 50 - ly * 50 * shadowOff;
  const showBands = bands ?? !!p.bands;
  const showRing = ring ?? !!p.ring;
  const rim = (atmosphere ?? !!p.atmosphere) ? p.atmosphere || PALETTE.sci : null;

  const ringEl = (half: 'back' | 'front') => (
    <g clipPath={`url(#${id}${half === 'back' ? 'rb' : 'rf'})`} opacity={inP}>
      <ellipse cx={x} cy={y} rx={R * 2.15} ry={R * 2.15 * ringTilt} fill="none" stroke={p.lit} strokeOpacity={0.55} strokeWidth={R * 0.34} />
      <ellipse cx={x} cy={y} rx={R * 1.72} ry={R * 1.72 * ringTilt} fill="none" stroke={p.base} strokeOpacity={0.5} strokeWidth={R * 0.18} />
    </g>
  );

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}l`} cx={`${litCx}%`} cy={`${litCy}%`} r="75%">
          <stop offset="0%" stopColor={p.lit} />
          <stop offset="55%" stopColor={p.base} />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
        <radialGradient id={`${id}s`} cx={`${shCx}%`} cy={`${shCy}%`} r="70%">
          <stop offset="0%" stopColor={PALETTE.space} stopOpacity={0.92} />
          <stop offset="55%" stopColor={PALETTE.space} stopOpacity={0.55} />
          <stop offset="100%" stopColor={PALETTE.space} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle cx={x} cy={y} r={R} />
        </clipPath>
        <clipPath id={`${id}rb`}>
          <rect x={x - R * 3} y={y - R * 3} width={R * 6} height={R * 3} />
        </clipPath>
        <clipPath id={`${id}rf`}>
          <rect x={x - R * 3} y={y} width={R * 6} height={R * 3} />
        </clipPath>
      </defs>
      {showRing && ringEl('back')}
      <g opacity={inP}>
        <circle cx={x} cy={y} r={R} fill={`url(#${id}l)`} />
        {showBands && (
          <g clipPath={`url(#${id}c)`}>
            {[-0.62, -0.34, -0.08, 0.2, 0.46, 0.7].map((b, i) => (
              <rect key={i} x={x - R} y={y + b * R} width={R * 2} height={R * (i % 2 ? 0.09 : 0.14)} fill={i % 2 ? p.lit : p.dark} opacity={0.16} />
            ))}
          </g>
        )}
        <circle cx={x} cy={y} r={R} fill={`url(#${id}s)`} />
        {rim && <circle cx={x} cy={y} r={R + 1.5} fill="none" stroke={rim} strokeOpacity={0.35} strokeWidth={Math.max(2, R * 0.03)} />}
      </g>
      {showRing && ringEl('front')}
    </svg>
  );
};
