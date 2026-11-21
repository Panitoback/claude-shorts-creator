import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EASE, PALETTE, TYPE } from '../brand';
import { FONT_NUMBER, FONT_NUMBER_ITALIC } from '../fonts';
import { CL, kf, Keys } from './anim';

// SPEED LINE (PROJECT_CONTEXT §4 Race, brand §8) — what is racing and how fast. Since PROJECT_CONTEXT
// v0.21.0 / brand v2.8 (the first-second rule) the default `mode: 'line'` is ONE SMALL secondary line,
// "A CAR ON CRUISE CONTROL · 60 MPH" (Inter 600 caps, sciText, the rule line's size), set under the
// question title: it is never the big top element, the question is. `mode: 'header'` keeps the v0.19
// look (small caps label over a big serif value) for re-renders of older shorts only.
// It can change mid-video: each state fades into the next (out, then in: ~1.5 × `fade` frames) while
// the block glides to its new `y` (e.g. when the title above it goes from two lines to one). A second
// small line can join under it ("USAIN BOLT'S TOP SPEED · 27.8 MPH"), so two movers are named
// top-to-bottom in the same order as their values on the board. No gold here: the gold budget belongs
// to the title's keyword and the payoff value.
export type SpeedState = { at: number; label: string; value: string };
export type SpeedHeaderProps = {
  states: SpeedState[]; // the first is shown from frame 0
  y: Keys; // top of the block over time
  sub?: { text: string; in: number; out?: number; len?: number }; // a second small line under it
  mode?: 'line' | 'header'; // default 'line' (v2.8)
  size?: number; // line mode: font size (default TYPE.annotation, 28; match the rule line)
  x?: number; // center (default 540)
  width?: number; // default 720
  valueSize?: number; // header mode only: default 64
  fade?: number; // default 10
};

/** Height of the main block (without the sub line), for laying out what sits under it. */
export const speedLineHeight = (size: number = TYPE.annotation.fontSize) => Math.round(size * 1.35);

export const SpeedHeader: React.FC<SpeedHeaderProps> = ({
  states, y, sub, mode = 'line', size = TYPE.annotation.fontSize, x = 540, width = 720, valueSize = 64, fade = 10,
}) => {
  const f = useCurrentFrame();
  const top = kf(f, y, 0);
  const subOp = sub ? interpolate(f, [sub.in, sub.in + (sub.len ?? 14)], [0, 1], { ...CL, easing: EASE.out }) * (sub.out != null ? 1 - interpolate(f, [sub.out, sub.out + 8], [0, 1], { ...CL, easing: EASE.in }) : 1) : 0;
  const line = mode === 'line';
  const lineStyle: React.CSSProperties = { ...TYPE.annotation, fontSize: size, letterSpacing: 3, color: PALETTE.sciText, whiteSpace: 'nowrap', lineHeight: 1.35 };
  return (
    <div style={{ position: 'absolute', left: x - width / 2, width, top, textAlign: 'center' }}>
      <div style={{ position: 'relative', height: line ? speedLineHeight(size) : 36 + 8 + valueSize }}>
        {states.map((st, i) => {
          const next = states[i + 1];
          // sequential, never two labels on top of each other: out in ~0.6 × fade, the new one after it
          const inOp = i === 0 ? 1 : interpolate(f, [st.at + fade * 0.5, st.at + fade * 1.5], [0, 1], { ...CL, easing: EASE.out });
          const outOp = next ? 1 - interpolate(f, [next.at, next.at + fade * 0.6], [0, 1], { ...CL, easing: EASE.in }) : 1;
          const op = inOp * outOp;
          if (op <= 0.001) return null;
          if (line) {
            return (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: op, ...lineStyle }}>
                {st.label} · {st.value.toUpperCase()}
              </div>
            );
          }
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
        <div style={{ ...(line ? lineStyle : { ...TYPE.label, fontSize: 26, letterSpacing: 4, color: PALETTE.sciText, whiteSpace: 'nowrap' as const }),
          marginTop: line ? Math.round(size * 0.3) : 12, opacity: subOp, transform: `translateY(${(1 - subOp) * 10}px)` }}>{sub.text}</div>
      )}
    </div>
  );
};
