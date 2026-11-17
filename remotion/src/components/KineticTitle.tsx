import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, PALETTE, TYPE } from '../brand';
import { CL } from './anim';

// KINETIC TITLE (brand v2.0 §8, the hook) — a big title that arrives WORD BY WORD on the voice:
// each word lands on its real spoken start time with a fast rise (EASE.punch), so the title is
// read and heard at once. Gold words use the keyword style. No bounce, no overshoot, no scale pop:
// fast ease-out only. The whole title leaves with a quick fade at `outAt` (seconds).
// Words come from the voice's word times (vo.gen.ts), never estimates.
export type KineticWord = { w: string; start: number; gold?: boolean };
export type KineticTitleProps = {
  lines: KineticWord[][]; // up to 3 lines; each word with its spoken start (seconds)
  top?: number; // y of the first line's top (default 250, inside the safe top)
  x?: number; // center x (default canvas center; the quasar shot uses its safe-rect center 480)
  width?: number; // default 840 (the safe width)
  size?: number; // default TYPE.title.fontSize (110); lower it if a line is wide
  lead?: number; // seconds a word starts arriving before it is spoken (default 0.05)
  outAt?: number; // seconds: the whole title fades out (default: never)
  rise?: number; // px a word rises as it arrives (default 34)
};

export const KineticTitle: React.FC<KineticTitleProps> = ({
  lines, top = 250, x = CANVAS.W / 2, width = 840, size = TYPE.title.fontSize, lead = 0.05, outAt, rise = 34,
}) => {
  const f = useCurrentFrame();
  const t = f / CANVAS.FPS;
  const out = outAt === undefined ? 1 : 1 - interpolate(t, [outAt, outAt + 0.35], [0, 1], { ...CL, easing: EASE.in });
  if (out <= 0) return null;
  return (
    <div style={{ position: 'absolute', top, left: x - width / 2, width, textAlign: 'center', opacity: out }}>
      {lines.map((line, i) => (
        <div key={i} style={{ ...TYPE.title, fontSize: size, color: PALETTE.ivory, whiteSpace: 'nowrap' }}>
          {line.map((wd, j) => {
            const s = (wd.start - lead) * CANVAS.FPS;
            const op = interpolate(f, [s, s + 5], [0, 1], CL);
            const p = interpolate(f, [s, s + 10], [0, 1], { ...CL, easing: EASE.punch });
            const style: React.CSSProperties = wd.gold ? { ...TYPE.keyword, fontSize: size * 1.02, color: PALETTE.gold } : {};
            return (
              <React.Fragment key={j}>
                {j > 0 && ' '}
                <span style={{ ...style, display: 'inline-block', opacity: op, transform: `translateY(${(1 - p) * rise}px)` }}>{wd.w}</span>
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};
