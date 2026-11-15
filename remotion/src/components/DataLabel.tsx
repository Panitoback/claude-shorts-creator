import React from 'react';
import { useCurrentFrame } from 'remotion';
import { MOTION, PALETTE, TYPE } from '../brand';
import { ramp, riseY, startOf } from './anim';

// DATA LABEL (brand §6) — a free-standing fact next to an object, no line: small uppercase label +
// a value in the serif (ivory, or gold italic when it is THE number of the scene). Counts as an annotation.
export type DataLabelProps = {
  x: number;
  y: number; // top of the block
  label: string; // "SURFACE TEMPERATURE"
  value: string; // "5,500 °C"
  align?: 'left' | 'center' | 'right'; // x is the left edge / center / right edge (default left)
  accent?: boolean; // value in gold italic instead of ivory
  size?: number; // value font size (default 56)
  at?: number;
  warm?: boolean;
};

export const DataLabel: React.FC<DataLabelProps> = ({
  x, y, label, value, align = 'left', accent = false, size = 56, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const a = ramp(f, s, MOTION.labelIn);
  const b = ramp(f, s + 4, MOTION.rise);
  const tx = align === 'left' ? '0' : align === 'center' ? '-50%' : '-100%';
  const valueStyle = accent
    ? { ...TYPE.keyword, color: PALETTE.gold, fontSize: size }
    : { ...TYPE.title, color: PALETTE.ivory, fontSize: size, letterSpacing: -1 };

  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translateX(${tx})`, textAlign: align, whiteSpace: 'nowrap' }}>
      <div style={{ ...TYPE.annotation, color: PALETTE.sciText, opacity: a }}>{label}</div>
      <div style={{ ...valueStyle, lineHeight: 1.1, marginTop: 8, opacity: b, transform: riseY(b, MOTION.risePx * 0.6) }}>{value}</div>
    </div>
  );
};
