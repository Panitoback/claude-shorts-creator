import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PALETTE, TYPE } from '../brand';
import { kf, Keys } from './anim';

// ODOMETER NUMBER: digits on rolling wheels. The units wheel turns continuously; each higher wheel
// turns only while the one below it rolls over from 9 to 0 (a real odometer's carry), so a count
// reads as motion, not as flickering digits. Leading zeros stay hidden. Tabular figures: the layout
// never jumps (brand §8 "layout doesn't jump").
export type OdometerNumberProps = {
  value: Keys; // the number over time, e.g. [[a, 0], [b, 90, 'out']]
  digits: number; // number of wheels (fixed width)
  x: number; // left edge (align 'left') or center (align 'center')
  y: number; // top
  size?: number; // font size (default 150)
  prefix?: string; // e.g. "−"
  suffix?: string; // e.g. "%"
  color?: 'gold' | 'ivory';
  align?: 'left' | 'center';
  opacity?: Keys;
};

export const OdometerNumber: React.FC<OdometerNumberProps> = ({
  value, digits, x, y, size = 150, prefix = '', suffix = '', color = 'gold', align = 'left', opacity = 1,
}) => {
  const f = useCurrentFrame();
  const op = kf(f, opacity, 1);
  if (op <= 0.001) return null;
  const v = Math.max(0, kf(f, value, 0));
  const lineH = size * 1.05;
  const digitW = size * 0.62;
  const col = color === 'gold' ? PALETTE.gold : PALETTE.ivory;
  const font: React.CSSProperties = { ...TYPE.number, fontSize: size, lineHeight: `${lineH}px`, letterSpacing: 0, color: col, fontVariantNumeric: 'tabular-nums' };
  const wheels = Array.from({ length: digits }, (_, i) => {
    const p = digits - 1 - i; // place value of this wheel
    const P = 10 ** p;
    let pos: number;
    if (p === 0) pos = v % 10;
    else {
      const base = Math.floor(v / P) % 10;
      const carry = Math.min(1, Math.max(0, (v % P) - (P - 1)));
      pos = base + carry;
    }
    const visible = p === 0 ? 1 : Math.min(1, Math.max(0, v - (P - 1))); // hide leading zeros, roll the new wheel in
    return { pos, visible };
  });
  const totalW = digitW * digits;
  const left = align === 'center' ? x - totalW / 2 : x;
  return (
    <div style={{ position: 'absolute', left, top: y, display: 'flex', alignItems: 'flex-start', opacity: op, whiteSpace: 'nowrap' }}>
      {prefix && <div style={{ ...font, position: 'absolute', right: '100%', paddingRight: size * 0.05 }}>{prefix}</div>}
      {wheels.map((w, i) => (
        <div key={i} style={{ width: digitW, height: lineH, overflow: 'hidden', opacity: w.visible, textAlign: 'center' }}>
          <div style={{ transform: `translateY(${-w.pos * lineH}px)` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => <div key={k} style={font}>{d}</div>)}
          </div>
        </div>
      ))}
      {suffix && <div style={{ ...font, marginLeft: size * 0.04 }}>{suffix}</div>}
    </div>
  );
};
