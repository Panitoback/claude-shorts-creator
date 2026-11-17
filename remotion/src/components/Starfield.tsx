import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION } from '../brand';
import { clearZones, makeStars, starTint } from '../lib/sky';
import { ramp, startOf } from './anim';

// STARFIELD (brand §5) — the background sky. Mostly faint stars in real temperature colors, a few
// bright ones with a tiny soft halo, slow out-of-sync twinkle. Never behind text: pass the text
// blocks as `clear`. Never crowding a planet: pass hero bodies as `avoid`.
//
// Built to survive H.264 encoding and platform re-encodes (YouTube/TikTok/Reels), tested by
// re-encoding the ComponentGallery at low bitrate:
//  - every star is at least STAR_MIN_R px in radius and STAR_MIN_A bright;
//  - FAINT STARS ARE STATIC. Tiny per-frame changes (twinkle, slow fades) on 2–3 px dots are
//    below what the encoder bothers to code, so they freeze or vanish. Only the bright stars
//    (big enough to survive) twinkle.
//  - prefer `warm` skies: a sky that fades in after a keyframe can stay invisible for seconds
//    in the encoded file. Fade the sky only at the start of the video, never mid-shot.
export const STAR_MIN_R = 1.4; // px radius → ≥ 2.8 px across on the 1080-wide canvas
export const STAR_MIN_A = 0.6;

export type StarfieldProps = {
  count?: number; // number of stars (default 300)
  bright?: number; // how many of the largest stars get a tiny soft halo (default 12)
  seed?: number; // same seed → same sky
  clear?: [number, number, number, number][]; // [x, y, w, h] rectangles kept free of stars
  avoid?: [number, number, number][]; // [x, y, r] bodies: no stars on them, no bright stars near them
  twinkle?: boolean; // bright stars only (see above)
  opacity?: number; // overall sky brightness (a very luminous object can dim it)
  // bright stars switching off ONE BY ONE: the frame each goes out, brightest first (one clear
  // ~0.5 s fade each; never dim the whole sky instead: compression smears global fades)
  offs?: number[];
  offLen?: number; // frames each star takes to go out (default 15)
  at?: number;
  warm?: boolean;
};

export const Starfield: React.FC<StarfieldProps> = ({
  count = 300, bright = 12, seed = 7, clear = [], avoid = [], twinkle = true, opacity = 1, offs = [], offLen = 15, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const stars = useMemo(() => {
    const kept = clearZones(makeStars(count, seed, CANVAS.W, CANVAS.H), clear);
    return kept.filter((s) => !avoid.some(([x, y, r]) => Math.hypot(s.x - x, s.y - y) < r + 10));
  }, [count, seed, clear, avoid]);
  const brightSet = useMemo(() => {
    const ok = (i: number) => !avoid.some(([x, y, r]) => Math.hypot(stars[i].x - x, stars[i].y - y) < r * 1.8 + 40);
    const idx = stars.map((s, i) => [s.r, i] as const).filter(([, i]) => ok(i)).sort((a, b) => b[0] - a[0]).slice(0, bright).map(([, i]) => i);
    return idx;
  }, [stars, bright, avoid]);
  const brightRank = useMemo(() => new Map(brightSet.map((i, k) => [i, k])), [brightSet]);
  const sky = ramp(f, startOf(at, warm), MOTION.skyFade) * opacity;

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        {/* halo as a radial gradient, not a blur filter — far cheaper to render */}
        <radialGradient id="starHalo">
          <stop offset="0%" stopColor="#fff6ea" stopOpacity={0.5} />
          <stop offset="45%" stopColor="#fff6ea" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#fff6ea" stopOpacity={0} />
        </radialGradient>
      </defs>
      {stars.map((s, i) => {
        const rank = brightRank.get(i);
        const isBright = rank !== undefined;
        const off = rank !== undefined && rank < offs.length ? 1 - ramp(f, offs[rank], offLen) : 1;
        if (off <= 0) return null;
        const tw = twinkle && isBright ? 1 - MOTION.twinkle + MOTION.twinkle * Math.sin(f / 18 + i * 1.7) : 1;
        const r = isBright ? Math.max(1.8, s.r * 1.1) : Math.max(STAR_MIN_R, s.r * 0.85);
        const a = isBright ? 1 : Math.max(STAR_MIN_A, s.a * 0.9);
        return (
          <g key={i} opacity={sky * tw * off}>
            {isBright && <circle cx={s.x} cy={s.y} r={r * 4} fill="url(#starHalo)" />}
            <circle cx={s.x} cy={s.y} r={r} fill={starTint(s.t)} opacity={a} />
          </g>
        );
      })}
    </svg>
  );
};
