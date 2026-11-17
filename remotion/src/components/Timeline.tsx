import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { ramp, riseY, startOf } from './anim';

// TIMELINE (brand §5 visual variety: show time and age) — a time axis that draws in, then
// markers that appear ON CUE, each with a dot, a label and its date (e.g. Big Bang → the
// farthest quasar's light leaves → Earth forms → today). Positions are honest: linear by default,
// or log scale (`log`, labelled LOG SCALE beside the axis) when the events span many orders of
// magnitude; with log, every `t` must be > 0 (use "years ago" or "years after the Big Bang"
// with a non-zero first event).
// Vertical by default (it fits a phone: labels read left to right beside the axis); horizontal
// for 2–3 events with short labels. The scene's ONE key event is gold (`hero`).
export type TimelineEvent = {
  t: number; // position in the axis' units (e.g. billions of years after the Big Bang)
  label: string; // "BIG BANG"
  date?: string; // "13.8 BILLION YEARS AGO"
  at: number; // frame it appears (local to the Sequence)
  hero?: boolean;
};
export type TimelineProps = {
  events: TimelineEvent[];
  range: [number, number]; // axis start/end in the same units (top→bottom or left→right)
  log?: boolean;
  orientation?: 'vertical' | 'horizontal';
  x?: number; // vertical: the axis' x; horizontal: its left end
  y?: number; // vertical: the axis' top; horizontal: its y
  length?: number; // axis length in px (default 900 vertical, 760 horizontal)
  at?: number; // when the axis draws in
  warm?: boolean; // axis already drawn at frame 0 (events still use their own `at`)
  labelSize?: number; // event label font size (default 52; lower it so a long label stays on one line)
};

const LABEL_GAP = 120;

export const Timeline: React.FC<TimelineProps> = ({
  events, range, log = false, orientation = 'vertical', x = 260, y = 300, length, at = 0, warm = false, labelSize = 52,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const vert = orientation === 'vertical';
  const L = length ?? (vert ? 900 : 760);
  const pos = (t: number) => {
    const u = log ? Math.log10(t / range[0]) / Math.log10(range[1] / range[0]) : (t - range[0]) / (range[1] - range[0]);
    return Math.max(0, Math.min(1, u)) * L;
  };
  const d = ramp(f, s, MOTION.scaleBarDraw * 1.5);
  // vertical: labels keep ≥ LABEL_GAP px apart; a label pushed off its dot gets a short leader
  // line, so close events stay honest on the axis and readable beside it
  const labelY = React.useMemo(() => {
    const order = events.map((e, i) => [pos(e.t), i] as const).sort((a, b) => a[0] - b[0]);
    const out: number[] = [];
    let last = -Infinity;
    for (const [py, i] of order) { const yy = Math.max(py, last + LABEL_GAP); out[i] = yy; last = yy; }
    return out;
  }, [events, L, log, range[0], range[1]]);
  const sw = ANNOTATION.stroke;
  return (
    <>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {vert
          ? <line x1={x} y1={y} x2={x} y2={y + L * d} stroke={PALETTE.sciLine} strokeWidth={sw} />
          : <line x1={x} y1={y} x2={x + L * d} y2={y} stroke={PALETTE.sciLine} strokeWidth={sw} />}
        {events.map((e, i) => {
          const p = ramp(f, e.at, MOTION.markerIn * 2);
          if (p <= 0) return null;
          const cx = vert ? x : x + pos(e.t);
          const cy = vert ? y + pos(e.t) : y;
          return (
            <g key={i} opacity={p}>
              {e.hero && <circle cx={cx} cy={cy} r={22} fill={PALETTE.gold} opacity={0.18} />}
              <circle cx={cx} cy={cy} r={(e.hero ? 10 : 7) * (0.6 + 0.4 * p)} fill={e.hero ? PALETTE.gold : PALETTE.ivory} />
              {vert && labelY[i] - pos(e.t) > 4 && (
                <polyline points={`${cx + 12},${cy} ${cx + 24},${cy} ${cx + 30},${y + labelY[i]} ${cx + 36},${y + labelY[i]}`} fill="none" stroke={PALETTE.sciLine} strokeWidth={sw} />
              )}
            </g>
          );
        })}
      </svg>
      {events.map((e, i) => {
        const p = ramp(f, e.at + MOTION.markerIn, MOTION.labelIn + 4);
        if (p <= 0) return null;
        const style: React.CSSProperties = vert
          ? { position: 'absolute', left: x + 44, top: y + labelY[i] - 26, width: 720 - (x - 60) }
          : { position: 'absolute', left: x + pos(e.t) - 160, top: y + (i % 2 ? -150 : 34), width: 320, textAlign: 'center' };
        return (
          <div key={i} style={{ ...style, opacity: p, transform: riseY(p, 10) }}>
            <div style={{ ...(e.hero ? TYPE.keyword : TYPE.subject), fontSize: labelSize, lineHeight: 1.05, color: e.hero ? PALETTE.gold : PALETTE.ivory }}>{e.label}</div>
            {e.date && <div style={{ ...TYPE.annotation, color: PALETTE.sci, marginTop: 8 }}>{e.date}</div>}
          </div>
        );
      })}
      {log && (
        <div style={{
          position: 'absolute', ...(vert ? { left: x - 18, top: y + L + 24 } : { left: x + L - 200, top: y + 24, width: 200, textAlign: 'right' }),
          ...TYPE.annotation, color: PALETTE.sciText, opacity: d * 0.85,
        }}>LOG SCALE</div>
      )}
    </>
  );
};
