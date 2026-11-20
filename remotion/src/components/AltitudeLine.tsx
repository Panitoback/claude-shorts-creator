import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { ramp, startOf } from './anim';

// ALTITUDE LINE (an annotation, brand §6) — a thin dashed cool-blue line at a given altitude, drawn
// as an arc CONCENTRIC with the planet (so it follows the curve of the atmosphere limb when the
// planet is small enough to look round, and is simply horizontal when it isn't), with a label. It
// draws outward from `fromX` (e.g. where a column pierces it). Counts toward the 2-annotation max.
export type AltitudeLineProps = {
  cx: number; // planet center, screen px (may be far below the frame)
  cy: number;
  r: number; // planet radius + altitude, px
  label: string; // "EDGE OF SPACE"
  value?: string; // "62 MI"
  fromX?: number; // where the line starts drawing (default cx)
  span?: number; // half-width in px of the drawn line (default 440)
  labelX?: number; // label left edge (default the right end − 300)
  side?: 'above' | 'below';
  at?: number;
  out?: number; // frame it fades out (optional)
  warm?: boolean;
};

export const AltitudeLine: React.FC<AltitudeLineProps> = ({ cx, cy, r, label, value, fromX, span = 440, labelX, side = 'above', at = 0, out, warm = false }) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const d = ramp(f, s, MOTION.scaleBarDraw);
  const lb = ramp(f, s + MOTION.scaleBarDraw - MOTION.overlap, MOTION.labelIn);
  const fade = out === undefined ? 1 : 1 - ramp(f, out, 12);
  if (d <= 0 || fade <= 0) return null;
  const x0 = fromX ?? cx;
  const a = x0 - span * d;
  const b = x0 + span * d;
  const yAt = (x: number) => {
    const dx = x - cx;
    return r > Math.abs(dx) ? cy - Math.sqrt(r * r - dx * dx) : cy;
  };
  const N = 48;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const xx = a + ((b - a) * i) / N;
    return `${xx},${yAt(xx)}`;
  }).join(' ');
  const lx = labelX ?? x0 + span - 300;
  const ly = yAt(lx + 150);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <polyline points={pts} fill="none" stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} strokeDasharray="10 9" />
      </svg>
      <div style={{ position: 'absolute', left: lx, width: 300, top: side === 'above' ? ly - 14 : ly + 14, transform: side === 'above' ? 'translateY(-100%)' : undefined, textAlign: 'left', opacity: lb, whiteSpace: 'nowrap' }}>
        <div style={{ ...TYPE.annotation, color: PALETTE.sciText }}>{label}</div>
        {value && <div style={{ ...TYPE.annotation, color: PALETTE.sci, marginTop: 6, letterSpacing: 1 }}>{value}</div>}
      </div>
    </div>
  );
};
