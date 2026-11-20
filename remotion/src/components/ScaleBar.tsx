import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { ramp, startOf } from './anim';

// SCALE BAR (brand §6) — a measured span: thin blue line with end ticks that draws from its center
// outward, then its label/value. Honest scale: the bar's length IS the thing measured.
export type ScaleBarProps = {
  x1: number;
  x2: number;
  y: number;
  label?: string; // "1.39 MILLION KM"
  value?: string; // optional second line
  side?: 'below' | 'above'; // label position (default below)
  vertical?: boolean; // a vertical span (a thickness, a height): x1/x2 are then the top/bottom y, y is the x; label on the right
  at?: number;
  warm?: boolean;
};

export const ScaleBar: React.FC<ScaleBarProps> = ({ x1, x2, y, label, value, side = 'below', vertical = false, at = 0, warm = false }) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const d = ramp(f, s, MOTION.scaleBarDraw);
  const lb = ramp(f, s + MOTION.scaleBarDraw - MOTION.overlap, MOTION.labelIn);
  const cx = (x1 + x2) / 2;
  const a = interpolate(d, [0, 1], [cx, x1]);
  const b = interpolate(d, [0, 1], [cx, x2]);
  const tk = ANNOTATION.tick;
  const tickOn = d > 0.98 ? 1 : 0;
  const top = side === 'below' ? y + tk + 10 : y - tk - 10;

  if (vertical) {
    return (
      <>
        <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          {d > 0 && <line x1={y} y1={a} x2={y} y2={b} stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} />}
          {[a, b].map((yy, i) => (
            <line key={i} x1={y - tk} y1={yy} x2={y + tk} y2={yy} stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} opacity={d > 0 ? 0.35 + 0.65 * tickOn : 0} />
          ))}
        </svg>
        {(label || value) && (
          <div style={{ position: 'absolute', left: y + tk + 14, top: cx, transform: 'translateY(-50%)', opacity: lb, whiteSpace: 'nowrap' }}>
            {label && <div style={{ ...TYPE.annotation, color: PALETTE.sciText }}>{label}</div>}
            {value && <div style={{ ...TYPE.annotation, color: PALETTE.sci, marginTop: 6, letterSpacing: 1 }}>{value}</div>}
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {d > 0 && <line x1={a} y1={y} x2={b} y2={y} stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} />}
        {[a, b].map((x, i) => (
          <line key={i} x1={x} y1={y - tk} x2={x} y2={y + tk} stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} opacity={d > 0 ? 0.35 + 0.65 * tickOn : 0} />
        ))}
      </svg>
      {(label || value) && (
        <div style={{ position: 'absolute', left: cx - 400, width: 800, top, textAlign: 'center', opacity: lb, transform: side === 'above' ? 'translateY(-100%)' : undefined }}>
          {label && <div style={{ ...TYPE.annotation, color: PALETTE.sciText }}>{label}</div>}
          {value && <div style={{ ...TYPE.annotation, color: PALETTE.sci, marginTop: 6, letterSpacing: 1 }}>{value}</div>}
        </div>
      )}
    </>
  );
};
