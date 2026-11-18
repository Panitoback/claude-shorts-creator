import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { PALETTE } from '../brand';
import { kf } from './anim';

// FLY-THROUGH (brand §8 hand-offs): the camera dives into an opening of the outgoing picture (the "0"
// of a number, a black hole, a ring) and comes out in the next scene, which was waiting inside it.
// - anticipation: a small pull-back during `wind` frames before the dive (no overshoot on arrival);
// - the zoom is eased in log scale (looks even), fastest when the opening fills the screen, then a soft
//   landing: the next scene settles to scale 1 exactly at `at + len`;
// - motion blur (@remotion/motion-blur) only during the fast middle of the dive.
export type FlyThroughProps = {
  from: React.ReactNode; // outgoing picture (full frame)
  to: React.ReactNode; // incoming picture (full frame)
  at: number; // frame the dive starts (after the wind-up)
  len?: number; // frames from the dive's start to the landing (default 26)
  x: number; // the opening's center on screen
  y: number;
  hole: number; // the opening's radius, px
  wind?: number; // anticipation frames (default 8; 0 = none)
  windAmount?: number; // how far back the wind-up pulls, as a fraction of the dive (default 0.04)
  rim?: boolean; // a thin gold rim on the opening's edge while diving (default true)
  blur?: boolean; // motion blur in the fast middle (default true)
  samples?: number; // motion-blur samples (default 8)
};

const COVER = 0.6; // fraction of the dive at which the opening fills the screen

const Inner: React.FC<FlyThroughProps> = ({ from, to, at, len = 26, x, y, hole, wind = 8, windAmount = 0.04, rim = true }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  if (f < at - wind) return <AbsoluteFill>{from}</AbsoluteFill>;
  if (f >= at + len) return <AbsoluteFill>{to}</AbsoluteFill>;
  const u = kf(f, wind > 0 ? [[at - wind, 0], [at, -windAmount, 'inOut'], [at + len, 1, 'inOut']] : [[at, 0], [at + len, 1, 'inOut']], 0);
  const D = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
  const Lend = Math.log(D / hole) / COVER;
  const L = u * Lend;
  const s = Math.exp(L);
  const R = hole * s;
  const sIn = Math.exp((L - Lend) * 0.2); // the next scene grows slower than the dive: depth
  const showFrom = R < D * 1.05;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {showFrom && (
        <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s}) translate(${-x}px, ${-y}px)` }}>{from}</AbsoluteFill>
      )}
      {u > 0 && (
        <AbsoluteFill style={{ clipPath: `circle(${R}px at ${x}px ${y}px)` }}>
          <AbsoluteFill style={{ background: PALETTE.space }} />
          <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${sIn}) translate(${-x}px, ${-y}px)` }}>{to}</AbsoluteFill>
        </AbsoluteFill>
      )}
      {rim && u > 0 && showFrom && (
        <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx={x} cy={y} r={R} fill="none" stroke={PALETTE.gold} strokeWidth={Math.max(2, 3 * Math.min(4, s / 6))} opacity={0.7 * (1 - R / D)} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

export const FlyThrough: React.FC<FlyThroughProps> = (props) => {
  const f = useCurrentFrame();
  const len = props.len ?? 26;
  const fast = f >= props.at + len * 0.2 && f <= props.at + len * 0.85;
  const inner = <Inner {...props} />;
  return props.blur !== false && fast ? <CameraMotionBlur shutterAngle={180} samples={props.samples ?? 8}>{inner}</CameraMotionBlur> : inner;
};
