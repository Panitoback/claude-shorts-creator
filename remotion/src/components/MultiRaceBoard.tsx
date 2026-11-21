import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EASE, MOTION, PALETTE, PlanetKind, SAFE_RECT, TYPE } from '../brand';
import { FONT_NUMBER, FONT_NUMBER_ITALIC } from '../fonts';
import { kf, Keys, ramp } from './anim';
import { Car } from './Car';
import { mix } from './color';
import { Planet } from './Planet';
import { Runner } from './Runner';
import { Spacecraft } from './Spacecraft';

// MULTI RACE BOARD (PROJECT_CONTEXT §4 Race, §3.6) — the Race board, extended: SEVERAL races on the same
// lanes, one after another, each with its own mover kind (spacecraft | car | runner), its own values
// (above or below the lane) and its own timing. Earlier movers stay parked just short of their planet;
// a later race's movers park right behind them. Also:
// - single-lane mode: `fold` 1 = only the LAST lane (at its final row position), 0 = the full board; the
//   other lanes slide up out of it (a shape match) and fold back into it for the loop;
// - gold moving from one value to another (`goldOff` eases a race's gold value back to ivory);
// - a per-race lane glow (the traveled part brightens behind the movers; `glow` dims it for the next race);
// - a rewind that brings chosen movers back to the start, optionally growing them (`grow`) to a hero size.
// The plain one-race board (`RaceBoard`) stays as it is. Every vertical position comes from props.
export type MoverKind = 'spacecraft' | 'car' | 'runner';
export type BoardRow = { label: string; dest: PlanetKind };
export type RaceDef = {
  mover: MoverKind;
  size: number; // car / spacecraft length or runner height, px
  depart: number; // frame; may be negative (v2.8: the movers are already leaving on frame 0)
  arrive: (number | null)[]; // per row (null = this row doesn't run in this race)
  values?: (string | null)[]; // per row: "45 YEARS" (first word = number, rest = unit)
  valuePos?: 'above' | 'below';
  valueSize?: number; // number font size (unit = 0.7×)
  valueOpacity?: number;
  gold?: number; // row whose value is gold (the payoff)
  goldOff?: number; // frame that gold eases back to ivory (12 frames)
  appear?: { at: number; len: number }; // movers fade in (default: always there)
  out?: { at: number; len: number; keep?: number[] }; // movers fade out (except `keep` rows)
  park?: number; // px between the mover's front and the planet's edge (default 12)
  parkBehind?: number; // index of an earlier race: park right behind its (parked) movers
  glow?: Keys; // multiplier on this race's lane glow over time (default 1)
  lift?: number; // runner only: 0 = centered on the lane, 1 = feet on the lane (hero size)
  rewind?: { at: number; len: number; rows?: number[]; grow?: { size: number; lift: number } };
  flash?: boolean; // arrival flash + halo on the planet (default true)
  hideAt?: number; // the movers vanish from this frame on (a hand-off to an identical mover of another
  // race, e.g. a clone that replays the hook's departure in the last frames so the loop seam keeps moving)
};

export type MultiRaceBoardProps = {
  rows: BoardRow[];
  races: RaceDef[];
  origin?: PlanetKind;
  top: number; // first lane's y
  gap: number;
  startX?: number;
  destX?: number;
  destR?: number;
  originR?: number;
  fold?: Keys; // 1 = single-lane mode (only the last lane), 0 = full board
  rowsIn?: { at: number; len: number; stagger?: number }; // labels + planets of the other rows fade in (top first)
  rowsOut?: { at: number; len: number }; // ...and out (for the fold back)
  soloLabelLift?: number; // px the last row's label rises in single-lane mode (clear of a hero-size mover)
  // where the values sit: 'left' = left of the planet, above/below the lane (room needed over the movers);
  // 'right' = a column right of the planet, stacked around the lane line (two races per row fit in ~100 px)
  valueSide?: 'left' | 'right';
  valueRight?: number; // right edge of the value column (default: planet edge − 16 on the left, safe right edge on the right)
  valuesOut?: number; // all values fade (bottom row first, 1 frame apart, 8 frames)
  rule?: string; // newline = line break, " · " = segment separator
  ruleY?: number;
  ruleWidth?: number; // default 720, centered on the screen
  ruleSize?: number; // default TYPE.annotation (28)
  labelSize?: number; // row label size (default TYPE.annotation, 28); the label sits ~2.2× its size above the lane
  ruleOpacity?: Keys;
};

// position 0..1 along the lane τ frames after departure, total T frames, eased over E frames at both ends
const travel = (tau: number, T: number, E: number) => {
  if (tau <= 0) return 0;
  if (tau >= T) return 1;
  const e = Math.min(E, T / 2);
  const total = T - e;
  if (tau < e) return (tau * tau) / (2 * e) / total;
  if (tau <= T - e) return (tau - e / 2) / total;
  const r = T - tau;
  return 1 - (r * r) / (2 * e) / total;
};

const runnerReach = (h: number) => h * 0.3; // hip → the front of a standing/running figure
const runnerBack = (h: number) => h * 0.2;

export const MultiRaceBoard: React.FC<MultiRaceBoardProps> = ({
  rows, races, origin = 'earth', top, gap, startX = SAFE_RECT.x + 50, destX = SAFE_RECT.x + SAFE_RECT.w - 70, destR = 24,
  originR = 13, fold = 0, rowsIn, rowsOut, soloLabelLift = 0, valueSide = 'left', valueRight: valueRightProp, valuesOut, rule, ruleY, ruleOpacity = 1,
  ruleWidth = 720, ruleSize = TYPE.annotation.fontSize, labelSize = TYPE.annotation.fontSize,
}) => {
  const f = useCurrentFrame();
  const n = rows.length;
  const last = n - 1;
  const fd = Math.min(1, Math.max(0, kf(f, fold, 0)));
  const laneY = (i: number) => top + i * gap;
  const yOf = (i: number) => interpolate(fd, [0, 1], [laneY(i), laneY(last)]);
  const laneEnd = destX - destR - 8;
  const valueRight = valueRightProp ?? (valueSide === 'right' ? SAFE_RECT.x + SAFE_RECT.w - 4 : destX - destR - 16);
  const rowShow = (i: number) => {
    // the last row's label stays, except mid-fold, while the other lanes slide through it
    if (i === last) return Math.pow(Math.abs(2 * fd - 1), 1.5);
    let v = 1;
    if (rowsIn) v = ramp(f, rowsIn.at + (rowsIn.stagger ?? 1) * i, rowsIn.len);
    if (rowsOut && f >= rowsOut.at) v *= 1 - ramp(f, rowsOut.at + (last - 1 - i), rowsOut.len);
    return v;
  };
  const laneShow = (i: number) => (i === last ? 1 : Math.min(1, (1 - fd) * 4));

  // where each race's movers start and park, per row
  const startPos = (r: RaceDef) => (r.mover === 'runner' ? startX + originR + 4 + r.size * 0.25 : startX + originR + 6 + r.size * 0.5);
  const parkPos = (ri: number): number => {
    const r = races[ri];
    if (r.parkBehind != null) {
      const b = races[r.parkBehind];
      const bBack = b.mover === 'runner' ? parkPos(r.parkBehind) - runnerBack(b.size) : parkPos(r.parkBehind) - b.size * 0.5;
      return r.mover === 'runner' ? bBack - 8 - runnerReach(r.size) : bBack - 8 - r.size * 0.5;
    }
    const front = destX - destR - (r.park ?? 12);
    return r.mover === 'runner' ? front - runnerReach(r.size) : front - r.size * 0.5;
  };

  const ruleLines = rule ? rule.split('\n').map((l) => l.split(' · ')) : [];
  const ruleOp = kf(f, ruleOpacity, 1);

  // per race / row state
  const state = races.map((r, ri) => {
    const s0 = startPos(r);
    const s1 = parkPos(ri);
    return rows.map((_, i) => {
      const a = r.arrive[i];
      if (a == null) return null;
      const T = Math.max(1, a - r.depart);
      const p = travel(f - r.depart, T, 6);
      const rw = r.rewind && (!r.rewind.rows || r.rewind.rows.includes(i)) ? r.rewind : null;
      const back = rw ? EASE.inOut(Math.min(1, Math.max(0, (f - rw.at) / rw.len))) : 0;
      const grow = rw?.grow ? back : 0;
      const size = rw?.grow ? interpolate(grow, [0, 1], [r.size, rw.grow.size]) : r.size;
      const lift = rw?.grow ? interpolate(grow, [0, 1], [r.lift ?? 0, rw.grow.lift]) : r.lift ?? 0;
      const startNow = r.mover === 'runner' ? startX + originR + 4 + size * 0.25 : s0;
      const x = (s0 + (s1 - s0) * p) * (1 - back) + startNow * back;
      let op = r.appear ? ramp(f, r.appear.at, r.appear.len) : 1;
      if (r.hideAt != null && f >= r.hideAt) op = 0;
      if (r.out && !(r.out.keep ?? []).includes(i)) op *= 1 - interpolate(f, [r.out.at, r.out.at + r.out.len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.in });
      return { a, T, p, back, size, lift, x, op, rw };
    });
  });

  // the front edge of a mover, for the lane glow
  const rearOf = (r: RaceDef, x: number, size: number) => (r.mover === 'runner' ? x - runnerBack(size) : x - size * 0.5);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {/* START line: spans the visible lanes */}
        <line x1={startX} x2={startX} y1={yOf(0) - gap * 0.32} y2={laneY(last) + gap * 0.32} stroke={PALETTE.ivory} strokeOpacity={0.35} strokeWidth={2} />
        {rows.map((_, i) => {
          const y = yOf(i);
          const lo = laneShow(i);
          return (
            <g key={i} opacity={lo}>
              <line x1={startX} x2={laneEnd} y1={y} y2={y} stroke={PALETTE.ivory} strokeOpacity={0.2} strokeWidth={3} />
              {races.map((r, ri) => {
                const st = state[ri][i];
                if (!st || st.p <= 0 || st.op <= 0) return null;
                const g = kf(f, r.glow, 1) * Math.min(1, st.op * 1.5);
                const x2 = Math.max(startX, rearOf(r, st.x, st.size) - 2);
                if (g <= 0.001 || x2 <= startX + 1) return null;
                return <line key={ri} x1={startX} x2={x2} y1={y} y2={y} stroke={PALETTE.ivory} strokeOpacity={0.4 * g} strokeWidth={3} />;
              })}
            </g>
          );
        })}
      </svg>
      {rows.map((row, i) => {
        const y = yOf(i);
        const show = rowShow(i);
        const lo = laneShow(i);
        const labelY = y - Math.round(labelSize * 2.2) - (i === last ? soloLabelLift * fd : 0);
        // arrivals (any race) light the planet
        const flashes = races.map((r, ri) => {
          const st = state[ri][i];
          if (!st || r.flash === false) return null;
          const k = f - st.a;
          const isGold = r.gold === i;
          const len = isGold ? 18 : 12;
          return { k, len, isGold, halo: k >= 0 ? (isGold ? 0.35 : 0.22) * (1 - 0.6 * ramp(f, st.a, 30)) * (1 - st.back) * st.op : 0 };
        });
        const halo = Math.max(0, ...flashes.map((h) => h?.halo ?? 0));
        return (
          <React.Fragment key={i}>
            <div style={{ ...TYPE.annotation, fontSize: labelSize, position: 'absolute', left: startX - 10, top: labelY, color: PALETTE.ivory, opacity: 0.7 * show, whiteSpace: 'nowrap' }}>
              {row.label}
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: lo }}>
              <Planet x={startX} y={y} r={originR} kind={origin} light={180} warm />
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: i === last ? 1 : show }}>
              {halo > 0 && (
                <div style={{ position: 'absolute', left: destX - destR * 2, top: y - destR * 2, width: destR * 4, height: destR * 4, borderRadius: '50%',
                  background: `radial-gradient(circle, ${PALETTE.gold} 0%, rgba(255,213,138,0.35) 30%, rgba(255,213,138,0) 65%)`, opacity: halo }} />
              )}
              <Planet x={destX} y={y} r={destR} kind={row.dest} light={180} phase={0.8} warm />
              {flashes.map((fl, ri) => {
                if (!fl || fl.k < 0 || fl.k > fl.len) return null;
                const fp = fl.k / fl.len;
                const d = 2 * destR * interpolate(EASE.out(fp), [0, 1], [1, fl.isGold ? 2.0 : 1.6]);
                return (
                  <div key={ri} style={{ position: 'absolute', left: destX, top: y, width: 0, height: 0 }}>
                    <div style={{ position: 'absolute', transform: 'translate(-50%,-50%)', borderRadius: '50%', width: d, height: d,
                      border: `${fl.isGold ? 4 : 3}px solid ${PALETTE.gold}`, opacity: 0.85 * (1 - fp), boxShadow: `0 0 18px ${PALETTE.goldDeep}` }} />
                  </div>
                );
              })}
            </div>
            {/* movers */}
            {races.map((r, ri) => {
              const st = state[ri][i];
              if (!st || st.op <= 0.001) return null;
              const moving = f >= r.depart && f < st.a && st.back === 0;
              if (r.mover === 'runner') {
                const h = st.size;
                // cadence: faster for faster runners, capped well under the 3 Hz flicker limit
                const speed = Math.abs(parkPos(ri) - startPos(r)) / st.T; // px / frame
                const strides = Math.min(2.6, Math.max(1.6, 1.2 + 0.12 * speed)); // strides / s
                const runT = Math.max(0, Math.min(f, st.a) - r.depart);
                const phase = (runT / 30) * strides * Math.PI * 2;
                const go = ramp(f, r.depart, 5);
                const stop = f >= st.a ? 1 - ramp(f, st.a, 8) : 1;
                const run = go * stop * (1 - st.back);
                const set = f <= r.depart ? 1 - go : st.rw ? interpolate(f, [st.rw.at + st.rw.len - 12, st.rw.at + st.rw.len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0; // linear: still settling on the last frame, so a launch right after never follows a hold
                const breath = f >= st.a + 8 && !moving ? 0.5 + 0.5 * Math.sin((f - st.a) / 14) : 0;
                const ground = y + h * 0.48 * (1 - st.lift);
                return <Runner key={ri} x={st.x} y={ground} h={h} run={run} set={Math.max(set, f < r.depart ? 1 : 0)} phase={phase} breath={breath} opacity={st.op * lo} />;
              }
              const idle = 0.22 + 0.06 * Math.sin(f / 9 + i * 1.3);
              const flare = ramp(f, r.depart, 6) * (1 - 0.35 * ramp(f, r.depart + 6, 14));
              const settle = 1 - ramp(f, st.a, 12);
              const glow = Math.max(idle, f >= r.depart ? flare * settle : 0);
              const trail = moving ? ramp(f, r.depart, 6) : f >= st.a ? 1 - ramp(f, st.a, 8) : 0;
              if (r.mover === 'car') {
                // wheels: turn with the speed, capped so the spokes never strobe
                const wr = r.size * 0.12;
                const rate = Math.min(0.45, Math.abs(parkPos(ri) - startPos(r)) / st.T / wr); // rad / frame
                const turn = rate * Math.max(0, Math.min(f, st.a) - r.depart) * (1 - st.back);
                return <Car key={ri} x={st.x} y={y} length={r.size} turn={turn} light={glow} trail={trail} opacity={st.op * lo} />;
              }
              return (
                <div key={ri} style={{ position: 'absolute', inset: 0, opacity: st.op * lo }}>
                  <Spacecraft x={st.x} y={y} length={r.size} engine={glow} trail={trail} />
                </div>
              );
            })}
            {/* values */}
            {races.map((r, ri) => {
              const st = state[ri][i];
              const v = r.values?.[i];
              if (!st || !v) return null;
              const vIn = ramp(f, st.a, MOTION.rise);
              const vOut = valuesOut != null ? 1 - ramp(f, valuesOut + (last - i), 8) : 1;
              if (vIn * vOut <= 0.001) return null;
              const isGold = r.gold === i;
              const goldAmt = isGold ? (r.goldOff != null ? 1 - ramp(f, r.goldOff, 12) : 1) : 0;
              const col = mix(PALETTE.ivory, PALETTE.gold, goldAmt);
              const fs = r.valueSize ?? 40;
              const baseOp = interpolate(goldAmt, [0, 1], [r.valueOpacity ?? 1, 1]);
              const [num, ...unit] = v.split(' ');
              const below = r.valuePos === 'below';
              const off = valueSide === 'right' ? 3 : 22;
              const topPx = below ? y + off : y - off - fs;
              return (
                <div key={`v${ri}`} style={{ position: 'absolute', right: 1080 - valueRight, top: topPx, height: fs, lineHeight: `${fs}px`, whiteSpace: 'nowrap',
                  opacity: vIn * vOut * baseOp, transform: `translateY(${(1 - vIn) * MOTION.risePx * (below ? 1 : 1)}px)`, color: col }}>
                  <span style={{ fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: fs, letterSpacing: -0.5 }}>{num}</span>
                  {unit.length > 0 && (
                    <span style={{ fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 600, fontSize: fs * 0.66, marginLeft: fs * 0.22, letterSpacing: 1, opacity: interpolate(goldAmt, [0, 1], [0.72, 1]) }}>{unit.join(' ')}</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
      {rule && (
        <div style={{ position: 'absolute', left: 540 - ruleWidth / 2, width: ruleWidth, top: ruleY ?? laneY(last) + 70, opacity: ruleOp,
          ...TYPE.annotation, fontSize: ruleSize, letterSpacing: 2, color: PALETTE.sciText, lineHeight: 1.45, textAlign: 'center' }}>
          {ruleLines.map((segs, li) => (
            <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {segs.map((sg, k) => (
                <span key={k} style={{ whiteSpace: 'nowrap' }}>{sg}{k < segs.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
