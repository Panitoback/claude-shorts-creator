import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { CL, ramp, riseY, startOf } from './anim';
import { interpolate } from 'remotion';
import { EASE } from '../brand';

// TIMELINE (brand §5 visual variety: show time and age) — a time axis that draws in, then
// markers that appear ON CUE, each with a dot, a label and its date (e.g. Big Bang → the
// farthest quasar's light leaves → Earth forms → today). Positions are honest: linear by default,
// or log scale (`log`, labelled LOG SCALE beside the axis) when the events span many orders of
// magnitude; with log, every `t` must be > 0 (use "years ago" or "years after the Big Bang"
// with a non-zero first event).
// Vertical by default (it fits a phone: labels read left to right beside the axis); horizontal
// for 2–3 events with short labels. The scene's ONE key event is gold (`hero`).
// `rescale` changes the axis mid-scene (e.g. linear → a labelled log scale to reach the far
// future): markers glide to their new honest positions; events that fall outside the new range
// slide off the axis and fade; LOG SCALE fades in (or out) with the move.
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
  rescale?: { at: number; len?: number; range: [number, number]; log?: boolean }; // mid-scene axis change (len default 40)
};

const LABEL_GAP = 120;

export const Timeline: React.FC<TimelineProps> = ({
  events, range, log = false, orientation = 'vertical', x = 260, y = 300, length, at = 0, warm = false, labelSize = 52, rescale,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const vert = orientation === 'vertical';
  const L = length ?? (vert ? 900 : 760);
  const uOf = (t: number, rg: [number, number], lg: boolean) => {
    if (!lg) return (t - rg[0]) / (rg[1] - rg[0]);
    if (t <= 0) return -0.5; // t = 0 has no place on a log axis: it sits off the start
    return Math.log10(t / rg[0]) / Math.log10(rg[1] / rg[0]);
  };
  const rs = rescale ? interpolate(f, [rescale.at, rescale.at + (rescale.len ?? 40)], [0, 1], { ...CL, easing: EASE.inOut }) : 0;
  const uAt = (t: number) => {
    const clampU = (u: number) => Math.max(-0.5, Math.min(1.5, u)); // far-off values: no precision loss
    const a = clampU(uOf(t, range, log));
    if (!rescale || rs <= 0) return a;
    const b = clampU(uOf(t, rescale.range, rescale.log ?? log));
    return rs >= 1 ? b : a + (b - a) * rs;
  };
  // an event outside the axis (after a rescale) fades as it leaves
  const inside = (t: number) => { const u = uAt(t); return Math.max(0, 1 - Math.max(0, -u, u - 1) * 6); };
  const pos = (t: number) => Math.max(-0.08, Math.min(1.08, uAt(t))) * L;
  const logOp = rescale ? (log ? 1 - rs : 0) + ((rescale.log ?? log) ? rs : 0) : (log ? 1 : 0);
  const d = ramp(f, s, MOTION.scaleBarDraw * 1.5);
  // vertical: labels keep ≥ LABEL_GAP px apart; a label pushed off its dot gets a short leader
  // line, so close events stay honest on the axis and readable beside it
  const labelY = React.useMemo(() => {
    const order = events.map((e, i) => [pos(e.t), i] as const).sort((a, b) => a[0] - b[0]);
    const out: number[] = [];
    let last = -Infinity;
    for (const [py, i] of order) { const yy = Math.max(py, last + LABEL_GAP); out[i] = yy; last = yy; }
    return out;
  }, [events, L, log, range[0], range[1], rs]);
  const sw = ANNOTATION.stroke;
  return (
    <>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {vert
          ? <line x1={x} y1={y} x2={x} y2={y + L * d} stroke={PALETTE.sciLine} strokeWidth={sw} />
          : <line x1={x} y1={y} x2={x + L * d} y2={y} stroke={PALETTE.sciLine} strokeWidth={sw} />}
        {events.map((e, i) => {
          const p = ramp(f, e.at, MOTION.markerIn * 2) * inside(e.t);
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
        const p = ramp(f, e.at + MOTION.markerIn, MOTION.labelIn + 4) * inside(e.t);
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
      {logOp > 0.001 && (
        <div style={{
          position: 'absolute', ...(vert ? { left: x - 18, top: y + Math.max(L + 24, Math.max(0, ...labelY.filter((v, i) => inside(events[i].t) > 0.01 && f >= events[i].at)) + 100) } : { left: x + L - 200, top: y + 24, width: 200, textAlign: 'right' }),
          ...TYPE.annotation, color: PALETTE.sciText, opacity: d * 0.85 * logOp,
        }}>LOG SCALE</div>
      )}
    </>
  );
};
