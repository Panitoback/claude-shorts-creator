import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PALETTE, TYPE } from '../brand';
import { FONT_NUMBER } from '../fonts';
import { kf, Keys } from './anim';

// ELAPSED COUNTER (Race, §4) — a small "how much time has passed" clock that drives a compressed race:
// it lands EXACTLY on each row's value as that mover arrives, so the viewer reads the race as a
// time-lapse. Between two marks it interpolates geometrically (log scale), so it keeps accelerating
// smoothly from tens to thousands instead of lurching. A step back to 0 (a new race) is just a pair of
// marks one frame apart; hide the jump with `opacity`. Label left of center, number right of center
// (tabular figures), so the layout never jumps as digits are added.
export type ElapsedCounterProps = {
  marks: [number, number][]; // [frame, value], frames ascending
  label: string; // e.g. "YEARS PASSED"
  y: number; // top
  x?: number; // the split point between label and number (default 540)
  size?: number; // number font size (default 44)
  opacity?: Keys;
};

const valueAt = (f: number, m: [number, number][]) => {
  if (!m.length) return 0;
  if (f <= m[0][0]) return m[0][1];
  for (let i = 1; i < m.length; i++) {
    const [f0, v0] = m[i - 1];
    const [f1, v1] = m[i];
    if (f <= f1) {
      if (f1 === f0) return v1;
      const t = (f - f0) / (f1 - f0);
      if (v1 < v0) return t < 1 ? v0 : v1; // a reset: hold, then jump at the mark
      return Math.exp(Math.log(v0 + 1) + (Math.log(v1 + 1) - Math.log(v0 + 1)) * t) - 1;
    }
  }
  return m[m.length - 1][1];
};

export const ElapsedCounter: React.FC<ElapsedCounterProps> = ({ marks, label, y, x = 540, size = 44, opacity = 1 }) => {
  const f = useCurrentFrame();
  const op = kf(f, opacity, 1);
  if (op <= 0.001) return null;
  const v = Math.round(valueAt(f, marks));
  return (
    <div style={{ position: 'absolute', top: y, left: 0, width: 1080, height: size }}>
      <div style={{ position: 'absolute', right: 1080 - x + 14, top: 0, height: size, display: 'flex', alignItems: 'center',
        ...TYPE.label, fontSize: Math.round(size * 0.55), letterSpacing: 4, color: PALETTE.sciText, whiteSpace: 'nowrap', opacity: op }}>{label}</div>
      <div style={{ position: 'absolute', left: x + 6, top: 0, height: size, lineHeight: `${size}px`, fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: size,
        color: PALETTE.ivory, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', opacity: op }}>{v.toLocaleString('en-US')}</div>
    </div>
  );
};
