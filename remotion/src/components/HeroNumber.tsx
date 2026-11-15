import React from 'react';
import { useCurrentFrame } from 'remotion';
import { MOTION, PALETTE, SAFE_RECT, TYPE } from '../brand';
import { ramp, riseY, startOf } from './anim';

// HERO NUMBER (brand §3) — big serif number that counts up, gold italic unit, subject line under it,
// small label above. The number already holds its FINAL width while counting (layout never jumps, §8).
export type HeroNumberProps = {
  value: number;
  decimals?: number; // digits after the point (default: as many as `value` has, max 2)
  grouping?: boolean; // 300,000 instead of 300000
  unit?: string; // gold italic, glued to the number: "million", "km/s"
  subject?: string; // what it counts: "Earths"
  label?: string; // small uppercase context above: "BY VOLUME"
  countFrom?: number; // default 0
  count?: boolean; // false = no count-up, just arrive (default true)
  y?: number; // top of the block (default 230 = just inside the safe top)
  x?: number; // horizontal center (default 540)
  scale?: number; // 1 = hero size; ~0.5 for a secondary number (auto-reduced if the line won't fit)
  at?: number;
  warm?: boolean;
};

// Warn (once per value) when the auto-fit shrinks a number: it means the script's value + unit is
// too long for the hero slot (PROJECT_CONTEXT §5: ~10 characters). Collected by scripts/qa-log.mjs.
const warned = new Set<string>();
const warnShrink = (text: string, chars: number, factor: number) => {
  const key = `${text}|${factor.toFixed(2)}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[QA] HeroNumber shrunk to fit: "${text}" (${chars} characters) scaled ×${factor.toFixed(2)} — keep value + unit ≤ ~10 characters`);
};

const decimalsOf = (v: number) => Math.min(2, (String(v).split('.')[1] || '').length);

export const HeroNumber: React.FC<HeroNumberProps> = ({
  value, decimals, grouping = false, unit, subject, label, countFrom = 0, count = true,
  y = 230, x = 540, scale = 1, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const d = decimals ?? decimalsOf(value);
  const fmt = (n: number) =>
    grouping ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : n.toFixed(d);
  // number + unit always stay on ONE line; if that line (estimated from glyph widths) would be wider
  // than the safe rectangle, the whole block shrinks to fit (§9)
  const estW = fmt(value).length * 0.56 * TYPE.number.fontSize + (unit ? 22 + unit.length * 0.5 * TYPE.numberUnit.fontSize : 0);
  const k = Math.min(scale, (SAFE_RECT.w - 20) / estW);
  if (k < scale - 1e-3) {
    const text = `${fmt(value)}${unit ? ' ' + unit : ''}`;
    warnShrink(text, text.length, k / scale);
  }
  const s = startOf(at, warm);
  const numIn = ramp(f, s, MOTION.rise);
  const n = count ? ramp(f, s + 4, MOTION.countUp, countFrom, value) : value;
  const unitAt = s + 4 + (count ? MOTION.countUp - MOTION.overlap : 6);
  const unitIn = ramp(f, unitAt, MOTION.rise);
  const subjIn = ramp(f, unitAt + MOTION.overlap, MOTION.rise);

  return (
    <div style={{ position: 'absolute', top: y, left: x - 540, width: 1080, textAlign: 'center' }}>
      <div style={{ transform: `scale(${k})`, transformOrigin: '50% 0' }}>
        {label && <div style={{ ...TYPE.label, color: PALETTE.sciText, opacity: numIn }}>{label}</div>}
        <div style={{ ...TYPE.number, color: PALETTE.ivory, marginTop: label ? 14 : 0, opacity: numIn, transform: riseY(numIn, MOTION.risePx), fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {/* final value reserves the width; the counting value is overlaid on it */}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ visibility: 'hidden' }}>{fmt(value)}</span>
            <span style={{ position: 'absolute', right: 0, top: 0 }}>{fmt(n)}</span>
          </span>
          {unit && (
            <span style={{ ...TYPE.numberUnit, color: PALETTE.gold, marginLeft: 22, display: 'inline-block', opacity: unitIn, transform: riseY(unitIn, MOTION.risePx) }}>
              {unit}
            </span>
          )}
        </div>
        {subject && (
          <div style={{ ...TYPE.subject, color: PALETTE.ivory, marginTop: 4, opacity: subjIn, transform: riseY(subjIn, MOTION.risePx) }}>{subject}</div>
        )}
      </div>
    </div>
  );
};
