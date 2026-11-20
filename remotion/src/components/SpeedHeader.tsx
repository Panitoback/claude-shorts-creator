import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EASE, PALETTE, TYPE } from '../brand';
import { FONT_NUMBER, FONT_NUMBER_ITALIC } from '../fonts';
import { CL, kf, Keys } from './anim';

// SPEED HEADER (PROJECT_CONTEXT §4 Race) — what is racing and how fast: a small caps label over a big
// serif value ("A CAR ON CRUISE CONTROL" / "60 mph"). It can change mid-video: each state fades
// into the next (out, then in: ~1.5 × `fade` frames) while the block glides to its new `y` (e.g. when the title above it goes
// from two lines to one). A second small line can join under it ("USAIN BOLT'S TOP SPEED · 27.8 MPH"),
// so two movers are named top-to-bottom in the same order as their values on the board.
// Value: first word = the number (ivory), the rest = the unit (ivory italic, softer). No gold here:
// the gold budget belongs to the title's keyword and the payoff value.
export type SpeedState = { at: number; label: string; value: string };
export type SpeedHeaderProps = {
  states: SpeedState[]; // the first is shown from frame 0
  y: Keys; // top of the block over time
  sub?: { text: string; in: number; out?: number; len?: number }; // a second small line under the value
  x?: number; // center (default 540)
  width?: number; // default 720
  valueSize?: number; // default 64
  fade?: number; // default 10
};

export const SpeedHeader: React.FC<SpeedHeaderProps> = ({ states, y, sub, x = 540, width = 720, valueSize = 64, fade = 10 }) => {
  const f = useCurrentFrame();
  const top = kf(f, y, 0);
  const subOp = sub ? interpolate(f, [sub.in, sub.in + (sub.len ?? 14)], [0, 1], { ...CL, easing: EASE.out }) * (sub.out != null ? 1 - interpolate(f, [sub.out, sub.out + 8], [0, 1], { ...CL, easing: EASE.in }) : 1) : 0;
  return (
    <div style={{ position: 'absolute', left: x - width / 2, width, top, textAlign: 'center' }}>
      <div style={{ position: 'relative', height: 36 + 8 + valueSize }}>
        {states.map((st, i) => {
          const next = states[i + 1];
          // sequential, never two labels on top of each other: out in ~0.6 × fade, the new one after it
          const inOp = i === 0 ? 1 : interpolate(f, [st.at + fade * 0.5, st.at + fade * 1.5], [0, 1], { ...CL, easing: EASE.out });
          const outOp = next ? 1 - interpolate(f, [next.at, next.at + fade * 0.6], [0, 1], { ...CL, easing: EASE.in }) : 1;
          const op = inOp * outOp;
          if (op <= 0.001) return null;
          const [num, ...unit] = st.value.split(' ');
          return (
            <div key={i} style={{ position: 'absolute', inset: 0, opacity: op }}>
              <div style={{ ...TYPE.label, color: PALETTE.sciText, letterSpacing: 5, whiteSpace: 'nowrap' }}>{st.label}</div>
              <div style={{ marginTop: 8, color: PALETTE.ivory, whiteSpace: 'nowrap', lineHeight: 1 }}>
                <span style={{ fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: valueSize, letterSpacing: -1.5 }}>{num}</span>
                {unit.length > 0 && (
                  <span style={{ fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 600, fontSize: valueSize * 0.7, marginLeft: 12, opacity: 0.8 }}>{unit.join(' ')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {sub && subOp > 0.001 && (
        <div style={{ ...TYPE.label, fontSize: 26, letterSpacing: 4, color: PALETTE.sciText, marginTop: 12, opacity: subOp, whiteSpace: 'nowrap',
          transform: `translateY(${(1 - subOp) * 10}px)` }}>{sub.text}</div>
      )}
    </div>
  );
};
