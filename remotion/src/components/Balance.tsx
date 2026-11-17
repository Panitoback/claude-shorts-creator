import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, MOTION, PALETTE, STAR_TINTS, TYPE } from '../brand';
import { CL, ramp, riseY, startOf } from './anim';

// BALANCE (brand §5 visual variety: show comparisons of totals) — a two-sided scale weighing one
// total against another (e.g. ALL the stars in a galaxy vs ONE quasar). Both pans arrive level;
// on `tipAt` the beam tips toward the heavier side, slowly and with NO overshoot or bounce (brand
// §8), and each side's total counts up under its pan. The tilt grows with the log of the ratio
// (capped at `maxTilt`), so "1000×" tips further than "2×", but stays readable.
// What sits in each pan: `stars` = a heap of tiny star points (a crowd, a galaxy's worth), `point`
// = one bright gold point (a single object), or nothing. The heavier side's value is gold.
// For a single big count-up with no comparison, use HeroNumber.
export type BalanceSide = {
  label: string; // "EVERY STAR IN THE GALAXY"
  value: number; // in shared units (only the ratio matters for the tilt)
  display: string; // "1×" / "100 billion"
  glyph?: 'stars' | 'point' | 'none';
};
export type BalanceProps = {
  left: BalanceSide;
  right: BalanceSide;
  x?: number; // pivot x (default 480, the safe-rect center)
  y?: number; // pivot y
  span?: number; // beam half-length (default 300)
  maxTilt?: number; // degrees (default 16)
  tipAt?: number; // frame the beam starts tipping (default `at` + 30)
  tipFrames?: number; // how long the tip takes (default 50: slow and calm)
  tipEase?: 'inOut' | 'punch'; // 'punch' = a fast peak move with a long soft landing (energy curve
  // peaks); still no overshoot or bounce (default 'inOut')
  labelsAt?: number; // frame both sides' totals + labels appear (default tipAt + 20), e.g. on the
  // spoken words, so the pans are named before the beam tips
  valueSize?: number; // the totals' font size (default 72; lower it for long values)
  at?: number;
  warm?: boolean;
};

const rand = (seed: number) => {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

export const Balance: React.FC<BalanceProps> = ({
  left, right, x = 480, y = 720, span = 300, maxTilt = 16, tipAt, tipFrames = 50, tipEase = 'inOut', labelsAt, valueSize = 72,
  at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const appear = ramp(f, s, MOTION.discIn);
  const t0 = warm ? -100000 : tipAt ?? s + 30;
  const tip = interpolate(f, [t0, t0 + Math.max(1, tipFrames)], [0, 1], { ...CL, easing: tipEase === 'punch' ? EASE.punch : EASE.inOut });
  const l0 = warm ? -100000 : labelsAt ?? t0 + 20;
  const ratio = right.value / left.value;
  const ang = Math.max(-maxTilt, Math.min(maxTilt, Math.log10(ratio) * (maxTilt / 3))) * tip; // + = right side down
  const a = (ang * Math.PI) / 180;
  const ends = [-1, 1].map((k) => ({ X: x + k * span * Math.cos(a), Y: y + k * span * Math.sin(a) }));
  const heap = useMemo(() => {
    const r = rand(7);
    return Array.from({ length: 70 }, () => {
      const u = r();
      const w = (r() - 0.5) * 2;
      return { dx: w * 110 * (1 - u * 0.55), dy: -u * 70 * (1 - Math.abs(w) * 0.6), rr: 1.6 + r() * 1.8, t: Math.floor(r() * STAR_TINTS.length) };
    });
  }, []);
  const heavier = ratio >= 1 ? 1 : 0;
  const line = 'rgba(244,241,234,0.45)';
  const panW = 130;
  const hang = 90;

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CANVAS.W, height: CANVAS.H, opacity: appear }}>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* stand */}
        <line x1={x} y1={y} x2={x} y2={y + 360} stroke={line} strokeWidth={3} />
        <line x1={x - 90} y1={y + 360} x2={x + 90} y2={y + 360} stroke={line} strokeWidth={3} strokeLinecap="round" />
        {/* beam */}
        <line x1={ends[0].X} y1={ends[0].Y} x2={ends[1].X} y2={ends[1].Y} stroke={PALETTE.ivory} strokeOpacity={0.75} strokeWidth={4} strokeLinecap="round" />
        <circle cx={x} cy={y} r={8} fill={PALETTE.ivory} />
        {/* pans: they hang straight down whatever the beam does */}
        {ends.map((e, k) => {
          const side = k === 0 ? left : right;
          const py = e.Y + hang;
          return (
            <g key={k}>
              <line x1={e.X} y1={e.Y} x2={e.X - panW} y2={py} stroke={line} strokeWidth={2} />
              <line x1={e.X} y1={e.Y} x2={e.X + panW} y2={py} stroke={line} strokeWidth={2} />
              <path d={`M ${e.X - panW - 10} ${py} Q ${e.X} ${py + 34} ${e.X + panW + 10} ${py}`} fill="none" stroke={PALETTE.ivory} strokeOpacity={0.75} strokeWidth={4} strokeLinecap="round" />
              {side.glyph === 'stars' && heap.map((h, i) => (
                <circle key={i} cx={e.X + h.dx} cy={py + 6 + h.dy} r={h.rr} fill={STAR_TINTS[h.t]} opacity={0.9} />
              ))}
              {side.glyph === 'point' && (
                <>
                  <circle cx={e.X} cy={py - 18} r={30} fill={PALETTE.gold} opacity={0.22} />
                  <circle cx={e.X} cy={py - 18} r={9} fill={PALETTE.ivory} />
                </>
              )}
            </g>
          );
        })}
      </svg>
      {ends.map((e, k) => {
        const side = k === 0 ? left : right;
        const p = ramp(f, l0 + k * 6, MOTION.rise);
        const hero = k === heavier;
        return (
          <div key={k} style={{ position: 'absolute', left: e.X - 200, width: 400, top: e.Y + hang + 60, textAlign: 'center', opacity: p, transform: riseY(p, MOTION.risePx) }}>
            <div style={{ ...(hero ? TYPE.keyword : TYPE.subject), fontSize: valueSize, color: hero ? PALETTE.gold : PALETTE.ivory }}>{side.display}</div>
            <div style={{ ...TYPE.annotation, color: PALETTE.sciText, marginTop: 6, lineHeight: 1.3 }}>{side.label}</div>
          </div>
        );
      })}
    </div>
  );
};
