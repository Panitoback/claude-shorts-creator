import React, { useId } from 'react';
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, ENERGY } from '../brand';
import { startOf } from './anim';

// WHIP TRANSITION (brand §8, approved hand-off) — the outgoing picture sweeps off fast in one
// direction while the next sweeps in from the opposite side, like a whip pan across a strip of
// two frames. The seam crosses the middle at PEAK speed (the swap), with directional motion blur
// proportional to the speed. Speed profile: EASE.in up to the swap, then EASE.punch's soft
// landing, velocity-matched at the swap so there is no jerk and no bounce. Bulk of the move in
// ~6–10 frames (ENERGY.whipMove).
//
// Mostly for the hook (a fast montage of related pictures, ~0.6–1 s each) and the peaks; in the
// calm body prefer camera moves, morphs and carried objects. Sound: ONE whoosh per whip, its PEAK
// on whipTiming(...).swap; vary clip or pitch across consecutive whips.
//
// Layout comes from the composition size (useVideoConfig), so it works unchanged at 16:9.

export type WhipDirection = 'left' | 'right' | 'up' | 'down';

// EASE.in ends with slope 1/(1-0.67) ≈ 3.03; EASE.punch starts with slope 1/0.16 = 6.25.
// Matching speeds at the swap → the landing half lasts 6.25/3.03 ≈ 2.06× the departing half.
const LANDING_RATIO = 6.25 / 3.03;

// Frames of one whip starting at `at` with bulk `dur`. `swap` = peak speed = where the whoosh peaks.
export const whipTiming = (at: number, dur = 8) => {
  const outLen = Math.max(2, Math.round(dur * 0.45));
  const inLen = Math.round(outLen * LANDING_RATIO);
  return { at, swap: at + outLen, end: at + outLen + inLen, outLen, inLen };
};

const DIR: Record<WhipDirection, [number, number]> = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };

// Progress of the strip, 0 → 1 (1 = the incoming picture fully in place).
const stripAt = (f: number, t: ReturnType<typeof whipTiming>) => {
  if (f <= t.at) return 0;
  if (f >= t.end) return 1;
  if (f < t.swap) return 0.5 * Easing.bezier(0.32, 0, 0.67, 0)((f - t.at) / t.outLen); // = EASE.in
  return 0.5 + 0.5 * EASE.punch((f - t.swap) / t.inLen);
};

const warned = new Set<string>();
const qa = (msg: string) => {
  if (warned.has(msg)) return;
  warned.add(msg);
  console.warn(`[QA] ${msg}`);
};

export type WhipTransitionProps = {
  from: React.ReactNode; // the outgoing picture (full frame)
  to: React.ReactNode; // the incoming picture (full frame)
  at?: number; // frame the whip starts (local to its Sequence)
  direction?: WhipDirection; // the way the pictures travel (default 'left': the next one comes from the right)
  dur?: number; // frames for the bulk of the move (default 8; brand range ENERGY.whipMove 6–10)
  blur?: number; // max motion blur, px of Gaussian deviation along the motion (default 60; 0 = none)
  warm?: boolean; // already done at frame 0: only `to` is shown
};

export const WhipTransition: React.FC<WhipTransitionProps> = ({
  from, to, at = 0, direction = 'left', dur = 8, blur = 60, warm = false,
}) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const [lo, hi] = ENERGY.whipMove;
  if (dur < lo || dur > hi) qa(`WhipTransition dur=${dur} is outside the brand range ${lo}–${hi} frames (ENERGY.whipMove)`);

  const t = whipTiming(startOf(at, warm), dur);
  const s = stripAt(f, t);
  if (s <= 0) return <AbsoluteFill>{from}</AbsoluteFill>;
  if (s >= 1) return <AbsoluteFill>{to}</AbsoluteFill>;

  const [dx, dy] = DIR[direction];
  const span = dx !== 0 ? width : height;
  // speed in px/frame (central difference) → blur; ~0.12 px of deviation per px/frame, capped
  const speed = (Math.abs(stripAt(f + 0.5, t) - stripAt(f - 0.5, t))) * span;
  const sd = Math.min(blur, speed * 0.12);
  const off = s * span;
  const layer = (shift: number): React.CSSProperties => ({
    transform: `translate(${dx * shift}px, ${dy * shift}px)`,
    filter: sd > 0.5 ? `url(#${id})` : undefined,
  });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={dx !== 0 ? `${sd} 0` : `0 ${sd}`} />
        </filter>
      </svg>
      <AbsoluteFill style={layer(off)}>{from}</AbsoluteFill>
      <AbsoluteFill style={layer(off - span)}>{to}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export type WhipMontageProps = {
  items: React.ReactNode[]; // the pictures, in order (full frame each)
  at: number[]; // start frame of each whip (items.length − 1 of them)
  direction?: WhipDirection | WhipDirection[]; // one for all, or one per whip
  dur?: number;
  blur?: number;
};

// A chain of whips: the hook montage (~0.6–1 s per picture). Warns if pictures change faster
// than ~0.5 s (that reads as flicker, brand §8).
export const WhipMontage: React.FC<WhipMontageProps> = ({ items, at, direction = 'left', dur = 8, blur = 60 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  for (let k = 1; k < at.length; k++) {
    if (at[k] - at[k - 1] < fps * 0.5) qa(`WhipMontage: whips ${k} and ${k + 1} are ${at[k] - at[k - 1]} frames apart (< 0.5 s reads as flicker)`);
  }
  let k = -1;
  for (let i = 0; i < at.length; i++) if (f >= at[i]) k = i;
  if (k < 0) return <AbsoluteFill>{items[0]}</AbsoluteFill>;
  if (f >= whipTiming(at[k], dur).end) return <AbsoluteFill>{items[k + 1]}</AbsoluteFill>;
  const d = Array.isArray(direction) ? direction[k] ?? 'left' : direction;
  return <WhipTransition from={items[k]} to={items[k + 1]} at={at[k]} direction={d} dur={dur} blur={blur} />;
};
