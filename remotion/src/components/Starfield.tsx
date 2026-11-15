import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION } from '../brand';
import { clearZones, makeStars, starTint } from '../lib/sky';
import { ramp, startOf } from './anim';

// STARFIELD (brand §5) — the background sky. Faint stars in real temperature colors, a few bright
// ones with a soft halo, slow out-of-sync twinkle. Never behind text: pass the text blocks as `clear`.
export type StarfieldProps = {
  count?: number; // number of stars (default 320)
  bright?: number; // how many of the largest stars get a soft halo (default 6)
  seed?: number; // same seed → same sky
  clear?: [number, number, number, number][]; // [x, y, w, h] rectangles kept free of stars
  twinkle?: boolean;
  opacity?: number;
  at?: number;
  warm?: boolean;
};

export const Starfield: React.FC<StarfieldProps> = ({
  count = 320, bright = 6, seed = 7, clear = [], twinkle = true, opacity = 1, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const stars = useMemo(() => clearZones(makeStars(count, seed, CANVAS.W, CANVAS.H), clear), [count, seed, clear]);
  const brightSet = useMemo(() => {
    const idx = stars.map((s, i) => [s.r, i] as const).sort((a, b) => b[0] - a[0]).slice(0, bright).map(([, i]) => i);
    return new Set(idx);
  }, [stars, bright]);
  const sky = ramp(f, startOf(at, warm), MOTION.skyFade) * opacity;

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        {/* halo as a radial gradient, not a blur filter — far cheaper to render */}
        <radialGradient id="starHalo">
          <stop offset="0%" stopColor="#fff6ea" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#fff6ea" stopOpacity={0} />
        </radialGradient>
      </defs>
      {stars.map((s, i) => {
        const tw = twinkle ? 1 - MOTION.twinkle + MOTION.twinkle * Math.sin(f / 18 + i * 1.7) : 1;
        const isBright = brightSet.has(i);
        return (
          <g key={i} opacity={sky * tw}>
            {isBright && <circle cx={s.x} cy={s.y} r={s.r * 5} fill="url(#starHalo)" />}
            <circle cx={s.x} cy={s.y} r={isBright ? s.r * 1.1 : s.r * 0.8} fill={starTint(s.t)} opacity={isBright ? 1 : s.a * 0.85} />
          </g>
        );
      })}
    </svg>
  );
};
