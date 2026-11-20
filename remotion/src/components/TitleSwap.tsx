import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, PALETTE, TYPE } from '../brand';
import { CL } from './anim';

// TITLE SWAP (brand §8) — a short on-screen title that changes to another one in place, for shorts
// without a voice (the title IS the question). Each state is shown from its `at` frame: the old words
// fade and fall slightly (8 frames, EASE.in: exits are faster than entrances), the new words rise in
// (14 frames, EASE.out, ~2 frames apart). One gold word per state (the keyword style). The first state
// is already in place on frame 0 (warm). No bounce, no scale pop.
export type TitleWord = { w: string; gold?: boolean };
export type TitleState = { at: number; lines: TitleWord[][] };
export type TitleSwapProps = {
  states: TitleState[]; // in time order; the first is shown from frame 0
  top: number; // y of the first line's top
  x?: number; // center (default canvas center)
  width?: number; // default 840
  size?: number; // default TYPE.title.fontSize (110)
  outLen?: number; // default 8
  inLen?: number; // default 14
  inDelay?: number; // frames after `at` the new words start rising (default 6: the old words are nearly gone, never overlapping)
  stagger?: number; // frames between words (default 2)
};

export const TitleSwap: React.FC<TitleSwapProps> = ({
  states, top, x = CANVAS.W / 2, width = 840, size = TYPE.title.fontSize, outLen = 8, inLen = 14, inDelay = 6, stagger = 2,
}) => {
  const f = useCurrentFrame();
  return (
    <>
      {states.map((st, si) => {
        const next = states[si + 1];
        const first = si === 0;
        if (!first && f < st.at + inDelay) return null;
        if (next && f > next.at + outLen) return null;
        let k = 0;
        return (
          <div key={si} style={{ position: 'absolute', top, left: x - width / 2, width, textAlign: 'center' }}>
            {st.lines.map((line, li) => (
              <div key={li} style={{ ...TYPE.title, fontSize: size, color: PALETTE.ivory, whiteSpace: 'nowrap' }}>
                {line.map((wd, j) => {
                  const idx = k++;
                  const s = st.at + inDelay + idx * stagger;
                  const pin = first ? 1 : interpolate(f, [s, s + inLen], [0, 1], { ...CL, easing: EASE.out });
                  const pout = next ? interpolate(f, [next.at, next.at + outLen], [0, 1], { ...CL, easing: EASE.in }) : 0;
                  const style: React.CSSProperties = wd.gold ? { ...TYPE.keyword, fontSize: size * 1.02, color: PALETTE.gold } : {};
                  return (
                    <React.Fragment key={j}>
                      {j > 0 && ' '}
                      <span style={{ ...style, display: 'inline-block', opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 26 + pout * 14}px)` }}>{wd.w}</span>
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};
