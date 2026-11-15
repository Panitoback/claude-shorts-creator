import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, GLOW_PRESETS, GlowKind, MOTION, PALETTE } from '../brand';
import { ramp, startOf } from './anim';

// GLOWING BODY (brand §5) — a sun or star: limb-darkened disc + soft radial corona (~1.5× radius).
// The glow blooms in slower than the disc (light follows the object) and breathes gently.
export type GlowingBodyProps = {
  x: number;
  y: number;
  r: number; // disc radius in px
  kind?: GlowKind; // 'sun' (default) | 'red' | 'white' | 'blue' — color by temperature
  glow?: number; // corona strength 0..1.5 (default 1)
  corona?: number; // corona radius as a multiple of r (default 1.5)
  wash?: boolean; // the one soft warm wash behind the hero object (default true for 'sun')
  breathe?: boolean;
  at?: number;
  warm?: boolean;
};

let uid = 0;

export const GlowingBody: React.FC<GlowingBodyProps> = ({
  x, y, r, kind = 'sun', glow = 1, corona = 1.5, wash, breathe = true, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `gb${uid++}`, []);
  const p = GLOW_PRESETS[kind];
  const s = startOf(at, warm);
  const disc = ramp(f, s, MOTION.discIn);
  const bloom = ramp(f, s + 4, MOTION.glowIn);
  const br = breathe ? 1 + MOTION.breathe * Math.sin((f / 150) * Math.PI * 2) : 1;
  const showWash = wash ?? kind === 'sun';

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}d`} cx="46%" cy="44%" r="56%">
          <stop offset="0%" stopColor={p.disc[0]} />
          <stop offset="50%" stopColor={p.disc[1]} />
          <stop offset="82%" stopColor={p.disc[2]} />
          <stop offset="100%" stopColor={p.disc[3]} />
        </radialGradient>
        <radialGradient id={`${id}c`} cx="50%" cy="50%" r="50%">
          <stop offset={`${Math.round((1 / corona) * 87)}%`} stopColor={p.corona} />
          <stop offset="100%" stopColor={p.corona} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}w`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={PALETTE.spaceWarm} />
          <stop offset="100%" stopColor={PALETTE.spaceWarm} stopOpacity={0} />
        </radialGradient>
      </defs>
      {showWash && <ellipse cx={x} cy={y} rx={r * 3.4} ry={r * 3} fill={`url(#${id}w)`} opacity={bloom} />}
      <circle cx={x} cy={y} r={r * corona * br} fill={`url(#${id}c)`} opacity={bloom * Math.min(1.5, glow)} />
      <circle cx={x} cy={y} r={r * interpolate(disc, [0, 1], [0.96, 1])} fill={`url(#${id}d)`} opacity={disc} />
    </svg>
  );
};
