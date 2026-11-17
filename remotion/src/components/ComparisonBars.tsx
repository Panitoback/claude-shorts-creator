import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, EASE, MOTION, PALETTE, TYPE } from '../brand';
import { CL, ramp, riseY, startOf } from './anim';

// COMPARISON BARS + METER (brand §5 visual variety: every number is shown) — 2–4 horizontal bars
// that fill on the beat, each with a label above and its value at the bar's end, counting up as
// the bar fills (e.g. disk temperature vs the Sun's surface; fusion vs accretion efficiency).
// The scene's ONE hero bar is gold (`hero`), the rest ivory and quieter. Honest: bar lengths are
// proportional to the values (or to their log with `log`, which then says LOG SCALE under the
// bars, because a log axis must never pass for a linear one).
// Bars fill one after another (`stagger`), each with the brand's count-up time; no overshoot.
//
// METER: the same idea as a gauge, for ONE value against a full scale (e.g. "~10% of the mass
// turned into light"): a thin arc track, a gold arc filling to the value, the value big inside.
export type Bar = {
  label: string; // "SUN'S SURFACE"
  value: number; // 5800
  display?: string; // what the value reads as once full ("5,800 K"); default: the number + unit
  unit?: string; // " K" (appended while counting)
  hero?: boolean; // the gold bar: the point of the scene
};
export type ComparisonBarsProps = {
  bars: Bar[];
  x?: number; // left edge (default the safe left 60 + 20)
  y?: number; // top of the first bar's label
  width?: number; // full bar length (default 760)
  max?: number; // value of a full bar (default the largest)
  log?: boolean; // log-scale lengths (labelled LOG SCALE)
  gap?: number; // px between bars (default 210)
  stagger?: number; // frames between bars starting (default 20)
  at?: number;
  warm?: boolean;
};

const fmt = (n: number, decimals: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const decOf = (v: number) => Math.min(2, (String(v).split('.')[1] || '').length);

export const ComparisonBars: React.FC<ComparisonBarsProps> = ({
  bars, x = 80, y = 300, width = 760, max, log = false, gap = 210, stagger = 20, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const top = max ?? Math.max(...bars.map((b) => b.value));
  const lo = log ? Math.min(...bars.map((b) => b.value)) / 10 : 0;
  const frac = (v: number) => (log ? Math.log10(v / lo) / Math.log10(top / lo) : v / top);
  const thick = 26;
  return (
    <>
      {bars.map((b, i) => {
        const b0 = s + i * stagger;
        const appear = ramp(f, b0, MOTION.rise);
        const fill = interpolate(f, [b0 + 6, b0 + 6 + MOTION.countUp], [0, 1], { ...CL, easing: EASE.inOut });
        const len = Math.max(thick, width * frac(b.value));
        const yy = y + i * gap;
        const color = b.hero ? PALETTE.gold : PALETTE.ivory;
        const shown = fill >= 1 && b.display ? b.display : `${fmt(b.value * fill, decOf(b.value))}${b.unit ?? ''}`;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: yy, width: width + 40, opacity: appear, transform: riseY(appear, MOTION.risePx) }}>
            <div style={{ ...TYPE.annotation, color: PALETTE.sciText }}>{b.label}</div>
            <div style={{ position: 'relative', height: thick, marginTop: 12 }}>
              {/* track: where the full scale is */}
              <div style={{ position: 'absolute', left: 0, top: 0, width, height: thick, borderRadius: thick / 2, background: 'rgba(244,241,234,0.07)' }} />
              <div style={{
                position: 'absolute', left: 0, top: 0, width: len * fill, height: thick, borderRadius: thick / 2,
                background: b.hero ? `linear-gradient(90deg, ${PALETTE.goldDeep}, ${PALETTE.gold})` : 'rgba(244,241,234,0.55)',
              }} />
            </div>
            {/* the value sits under its bar, left-aligned: never collides with a long label */}
            <div style={{ ...(b.hero ? TYPE.keyword : TYPE.subject), fontSize: 64, lineHeight: 1.1, marginTop: 10, whiteSpace: 'nowrap', color, opacity: fill > 0 ? 1 : 0 }}>{shown}</div>
          </div>
        );
      })}
      {log && (
        <div style={{ position: 'absolute', left: x, top: y + bars.length * gap - 20, ...TYPE.annotation, fontSize: ANNOTATION.minLabelPx, color: PALETTE.sciText, opacity: ramp(f, s + bars.length * stagger, MOTION.labelIn) * 0.85 }}>
          LOG SCALE
        </div>
      )}
    </>
  );
};

export type MeterProps = {
  value: number; // 10
  max?: number; // 100
  display?: string; // "~10%"
  label: string; // "MASS TURNED INTO LIGHT"
  compare?: { value: number; label: string }; // a thin tick on the arc for a reference ("FUSION ~0.7%")
  x?: number; // center (default 480, the safe-rect center)
  y?: number; // arc center
  r?: number; // arc radius (default 300)
  at?: number;
  warm?: boolean;
};

export const Meter: React.FC<MeterProps> = ({ value, max = 100, display, label, compare, x = 480, y = 760, r = 300, at = 0, warm = false }) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const appear = ramp(f, s, MOTION.rise);
  const fill = interpolate(f, [s + 8, s + 8 + MOTION.countUp], [0, 1], { ...CL, easing: EASE.inOut });
  const sw = 22;
  // a 240° arc opening downward: from 150° to 390° (screen angles, y down)
  const A0 = (150 * Math.PI) / 180;
  const SPAN = (240 * Math.PI) / 180;
  const pt = (u: number, rr = r) => [x + rr * Math.cos(A0 + SPAN * u), y + rr * Math.sin(A0 + SPAN * u)];
  const arc = (u: number) => {
    const [x0, y0] = pt(0);
    const [x1, y1] = pt(u);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${SPAN * u > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const u = Math.min(1, value / max) * fill;
  const shown = fill >= 1 && display ? display : `${fmt(value * fill, decOf(value))}`;
  const cu = compare ? Math.min(1, compare.value / max) : 0;
  const [cx0, cy0] = pt(cu, r - sw);
  const [cx1, cy1] = pt(cu, r + sw);
  const [clx, cly] = pt(cu, r + sw + 26);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CANVAS.W, height: CANVAS.H, opacity: appear }}>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={arc(1)} fill="none" stroke="rgba(244,241,234,0.08)" strokeWidth={sw} strokeLinecap="round" />
        {u > 0.002 && <path d={arc(u)} fill="none" stroke={PALETTE.gold} strokeWidth={sw} strokeLinecap="round" />}
        {compare && <line x1={cx0} y1={cy0} x2={cx1} y2={cy1} stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke * 1.5} opacity={ramp(f, s + 8 + MOTION.countUp, MOTION.labelIn)} />}
      </svg>
      {compare && (
        <div style={{ position: 'absolute', left: clx - 200, width: 400, top: cly + 6, textAlign: 'center', ...TYPE.annotation, color: PALETTE.sciText, opacity: ramp(f, s + 8 + MOTION.countUp + 6, MOTION.labelIn) }}>
          {compare.label}
        </div>
      )}
      <div style={{ position: 'absolute', left: x - 400, width: 800, top: y - 120, textAlign: 'center' }}>
        <div style={{ ...TYPE.number, fontSize: 170, color: PALETTE.ivory }}>{shown}</div>
        <div style={{ ...TYPE.annotation, color: PALETTE.sciText, marginTop: 18 }}>{label}</div>
      </div>
    </div>
  );
};
