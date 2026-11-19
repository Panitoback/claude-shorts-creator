import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, PALETTE } from '../brand';
import { kf, Keys } from './anim';

// LIGHT FLOW (brand §8 "motion tied to the idea") — pulses of light travelling along a path, over
// and over: light from the Sun reaching an eye down a sight line, a laser pulse going to the Moon
// and back, a signal down a cable. Each pulse is a short bright streak with a soft glow and a
// fading tail (head brightest, in the direction of travel). Deterministic: the pulse train is a
// pure function of the frame, so it can start, stop and loop anywhere.
//   - `period` frames between pulses, `travel` frames for one pulse to run the whole path;
//   - `back`: each pulse returns along the path (a round trip: laser ranging);
//   - pulses only START inside [at, until); the ones already running finish their trip.
export type LightFlowProps = {
  points: [number, number][]; // the path, from the source to the receiver
  at: number; // first pulse leaves (frame)
  until?: number; // no new pulses from this frame (default: never)
  period?: number; // frames between pulses (default 18)
  travel?: number; // frames to cross the whole path (default 30)
  back?: boolean; // round trip: the pulse comes back to the start (default false)
  length?: number; // streak length, px (default 90)
  width?: number; // core width, px (default 4)
  color?: string; // default gold
  opacity?: Keys; // overall (default 1)
};

const along = (pts: [number, number][], cum: number[], d: number): [number, number] => {
  const L = cum[cum.length - 1];
  const t = Math.max(0, Math.min(L, d));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < t) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const u = (t - cum[i - 1]) / seg;
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u];
};

let uid = 0;
export const LightFlow: React.FC<LightFlowProps> = ({
  points, at, until = Infinity, period = 18, travel = 30, back = false, length = 90, width = 4, color = PALETTE.gold, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `lf${uid++}`, []);
  const op = kf(f, opacity, 1);
  if (op <= 0 || f < at || points.length < 2) return null;
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const L = cum[cum.length - 1];
  const trip = back ? 2 * travel : travel;
  const last = Math.min(f, until - 1);
  const first = Math.max(at, f - trip);
  const k0 = Math.ceil((first - at) / period);
  const k1 = Math.floor((last - at) / period);
  const streaks: { a: [number, number]; b: [number, number]; fade: number }[] = [];
  for (let k = k0; k <= k1; k++) {
    const age = f - (at + k * period);
    if (age < 0 || age > trip) continue;
    const goingBack = back && age > travel;
    const p = goingBack ? (age - travel) / travel : age / travel;
    const head = goingBack ? L * (1 - p) : L * p;
    const tail = goingBack ? Math.min(L, head + length) : Math.max(0, head - length);
    const edge = Math.min(1, Math.min(age, trip - age) / 4); // soft in/out at the ends
    streaks.push({ a: along(points, cum, tail), b: along(points, cum, head), fade: edge });
  }
  if (streaks.length === 0) return null;
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      <defs>
        {streaks.map((s, i) => (
          <linearGradient key={i} id={`${id}g${i}`} gradientUnits="userSpaceOnUse" x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]}>
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="80%" stopColor={color} stopOpacity={0.85} />
            <stop offset="100%" stopColor={PALETTE.ivory} stopOpacity={1} />
          </linearGradient>
        ))}
      </defs>
      {streaks.map((s, i) => (
        <g key={i} opacity={s.fade}>
          <line x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={`url(#${id}g${i})`} strokeWidth={width * 4.5} strokeLinecap="round" opacity={0.28} />
          <line x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={`url(#${id}g${i})`} strokeWidth={width} strokeLinecap="round" />
          <circle cx={s.b[0]} cy={s.b[1]} r={width * 1.4} fill={PALETTE.ivory} />
        </g>
      ))}
    </svg>
  );
};
