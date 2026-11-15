import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { ramp, startOf } from './anim';

// MARKER + LEADER LINE (brand §6) — points at something: optional dot, a ring that settles onto it,
// a thin cool-blue line that draws out, then a label (+ optional value). Max 2 annotations on screen.
export type MarkerProps = {
  x: number; // the marked point
  y: number;
  label: string; // "EARTH"
  value?: string; // "12,742 km" — second line, blue
  side?: 'below' | 'above' | 'left' | 'right'; // where the label goes (default below)
  length?: number; // leader line length (default 56)
  dot?: boolean; // draw a small dot at the point (for objects too small to see)
  ring?: boolean; // ring around the point (default true)
  ringR?: number; // ring radius (default ANNOTATION.markerRing)
  at?: number;
  warm?: boolean;
};

export const Marker: React.FC<MarkerProps> = ({
  x, y, label, value, side = 'below', length = 56, dot = false, ring = true, ringR = ANNOTATION.markerRing, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const mk = ramp(f, s, MOTION.markerIn);
  const ln = ramp(f, s + MOTION.markerIn - 2, MOTION.lineDraw);
  const lb = ramp(f, s + MOTION.markerIn + MOTION.lineDraw - 6, MOTION.labelIn);

  const dir = { below: [0, 1], above: [0, -1], left: [-1, 0], right: [1, 0] }[side];
  const gap = ring ? ringR + 4 : dot ? 10 : 6;
  const x0 = x + dir[0] * gap;
  const y0 = y + dir[1] * gap;
  const x1 = x0 + dir[0] * length * ln;
  const y1 = y0 + dir[1] * length * ln;
  const ex = x0 + dir[0] * (length + 12);
  const ey = y0 + dir[1] * (length + 12);

  // label box anchored to the line end
  const box: React.CSSProperties =
    side === 'below' ? { left: ex - 300, top: ey, width: 600, textAlign: 'center' }
    : side === 'above' ? { left: ex - 300, top: ey, width: 600, textAlign: 'center', transform: 'translateY(-100%)' }
    : side === 'right' ? { left: ex, top: ey, transform: 'translateY(-50%)', textAlign: 'left' }
    : { left: ex, top: ey, transform: 'translate(-100%, -50%)', textAlign: 'right' };

  return (
    <>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {dot && <circle cx={x} cy={y} r={4} fill={PALETTE.ivory} opacity={mk} />}
        {ring && (
          <circle cx={x} cy={y} r={ringR * (1.6 - 0.6 * mk)} fill="none" stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} opacity={mk} />
        )}
        {ln > 0 && <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} strokeLinecap="round" />}
      </svg>
      <div style={{ position: 'absolute', whiteSpace: 'nowrap', opacity: lb, ...box }}>
        <div style={{ ...TYPE.annotation, color: PALETTE.sciText }}>{label}</div>
        {value && <div style={{ ...TYPE.annotation, color: PALETTE.sci, marginTop: 6, letterSpacing: 1 }}>{value}</div>}
      </div>
    </>
  );
};
