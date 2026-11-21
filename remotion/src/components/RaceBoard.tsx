import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EASE, MOTION, PALETTE, PlanetKind, SAFE_RECT, TYPE } from '../brand';
import { FONT_NUMBER, FONT_NUMBER_ITALIC } from '../fonts';
import { ramp, startOf } from './anim';
import { Planet } from './Planet';
import { Spacecraft } from './Spacecraft';

// RACE BOARD (PROJECT_CONTEXT §4 Race, §3.6) — several journeys from one starting line, side by side.
// One row per destination (3–8), all sharing a vertical START line: row label above the lane, a tiny
// origin body on the START line, the mover sitting next to it, the destination body at the right end,
// and a right-aligned value slot. Each mover leaves at `depart` and arrives at its own `arrive` frame
// at CONSTANT speed (only a short ease at departure); the traveled part of its lane brightens behind
// it; on arrival a small soft gold flash on the destination and the row's value fades in and rises.
// `rewind` glides every mover back to the start together (the Race loop), so the last frame can match
// frame 0. The board's names and values are part of it: they are not annotations (§6 limit).
// First-second rule (PROJECT_CONTEXT v0.21.0 / brand v2.8): the speed goes in `speedLine` (one small
// line; the question title above the board is the big element, drawn by the shot), and the movers can
// already be LEAVING on frame 0: give a negative `depart` (e.g. −6) plus `loopTotal`, and the last
// −depart frames of the video replay the start of the departure after the rewind, so the loop seam
// never holds still. `header` (the big v0.18 speed header) is kept only for the published first Race.
// Every vertical position comes from props (defaults derived from SAFE_RECT): 16:9-ready.
export type RaceRow = {
  label: string; // e.g. "EARTH → VENUS" (shown uppercase)
  dest: PlanetKind;
  value: string; // e.g. "27 days": the first word is the number, the rest the unit
  arrive: number; // frame
  depart?: number; // frame (default: the board's `depart`)
  gold?: boolean; // the payoff value (one per board)
};

export type RaceBoardProps = {
  rows: RaceRow[];
  depart: number; // frame all movers leave
  origin?: PlanetKind; // body on the START line (default 'earth')
  top?: number; // first lane's y (default SAFE_RECT.y + 110)
  gap?: number; // px between lanes (default fits rows into ~78 % of the safe height)
  startX?: number; // START line x (default SAFE_RECT.x + 50)
  destX?: number; // destination centers (default SAFE_RECT.x + SAFE_RECT.w - 80)
  valueRight?: number; // right edge of the value slot (default SAFE_RECT.x + SAFE_RECT.w - 20)
  destR?: number; // destination icon radius (default 26, same for all: not to scale)
  originR?: number; // default 13
  moverLength?: number; // default 56
  rule?: string; // the RULE LINE under the board; a newline forces a line break, " · " separates segments (wraps between them)
  ruleY?: number; // top of the rule block (default last lane + 58)
  // SPEED HEADER above the board: names the mover / its speed so the viewer knows what is racing,
  // e.g. { label: "NEW HORIZONS' LAUNCH SPEED", value: "36,000 mph" } (first word = number, rest = unit, gold italic)
  header?: { label: string; value: string };
  speedLine?: string; // v2.8: the speed as ONE small line, e.g. "NEW HORIZONS' LAUNCH SPEED · 36,000 MPH"
  speedLineY?: number; // top of the speed line (default SAFE_RECT.y + 4)
  speedLineSize?: number; // default TYPE.annotation (28): the rule line's size
  loopTotal?: number; // composition length; with depart < 0 the departure straddles the loop seam
  headerY?: number; // top of the header block (default SAFE_RECT.y + 4)
  launchEase?: number; // frames of acceleration at departure (default 6)
  valuesOut?: number; // frame the values start fading (bottom row first, 1 frame apart)
  rewind?: { at: number; len: number }; // movers glide back to START together
  at?: number;
  warm?: boolean;
};

// distance covered τ frames after departure with a linear speed ramp over L frames, then constant speed
const dist = (tau: number, L: number) => (tau <= 0 ? 0 : tau < L ? (tau * tau) / (2 * L) : tau - L / 2);

export const RaceBoard: React.FC<RaceBoardProps> = ({
  rows, depart, origin = 'earth', top = SAFE_RECT.y + 110, gap, startX = SAFE_RECT.x + 50,
  destX = SAFE_RECT.x + SAFE_RECT.w - 80, valueRight = SAFE_RECT.x + SAFE_RECT.w - 20, destR = 26, originR = 13,
  moverLength = 56, rule, ruleY, header, headerY = SAFE_RECT.y + 4, speedLine, speedLineY = SAFE_RECT.y + 4,
  speedLineSize = TYPE.annotation.fontSize, loopTotal, launchEase = 6, valuesOut, rewind, at = 0, warm = false,
}) => {
  const [hNum, ...hUnit] = header ? header.value.split(' ') : [''];
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const boardIn = ramp(f, s, MOTION.discIn);
  const G = gap ?? Math.min(150, (SAFE_RECT.h * 0.78) / Math.max(1, rows.length - 1 || 1));
  const laneY = (i: number) => top + i * G;
  const shipFrom = startX + originR + moverLength * 0.62;
  const shipTo = destX - destR - moverLength * 0.62;
  const laneEnd = destX - destR - 8;
  // the loop's lead-in: the last −depart frames replay the departure (frame 0 continues it)
  const lead = loopTotal != null && depart < 0 && f >= loopTotal + depart;
  const fm = lead ? f - loopTotal! : f; // the frame the movers live on
  const back = lead ? 0 : rewind ? EASE.inOut(Math.min(1, Math.max(0, (f - rewind.at) / rewind.len))) : 0;
  const lastY = laneY(rows.length - 1);
  const ruleLines = rule ? rule.split('\n').map((l) => l.split(' · ')) : [];

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: boardIn }}>
      {header && (
        <div style={{ position: 'absolute', left: 540 - 360, width: 720, top: headerY, textAlign: 'center' }}>
          <div style={{ ...TYPE.label, color: PALETTE.sciText, letterSpacing: 5 }}>{header.label}</div>
          <div style={{ marginTop: 6, color: PALETTE.ivory, whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: 84, letterSpacing: -2 }}>{hNum}</span>
            {hUnit.length > 0 && (
              <span style={{ fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 600, fontSize: 56, marginLeft: 14, color: PALETTE.gold }}>{hUnit.join(' ')}</span>
            )}
          </div>
        </div>
      )}
      {speedLine && (
        <div style={{ position: 'absolute', left: 540 - 450, width: 900, top: speedLineY, textAlign: 'center', ...TYPE.annotation,
          fontSize: speedLineSize, letterSpacing: 3, color: PALETTE.sciText, whiteSpace: 'nowrap', lineHeight: 1.35 }}>{speedLine}</div>
      )}
      {/* lanes, START line, traveled parts */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <line x1={startX} x2={startX} y1={laneY(0) - G * 0.32} y2={lastY + G * 0.32} stroke={PALETTE.ivory} strokeOpacity={0.35} strokeWidth={2} />
        {rows.map((r, i) => {
          const d = r.depart ?? depart;
          const T = Math.max(1, r.arrive - d);
          const p = Math.min(1, dist(fm - d, launchEase) / dist(T, launchEase)) * (1 - back);
          const shipX = shipFrom + (shipTo - shipFrom) * p;
          const y = laneY(i);
          return (
            <g key={i}>
              <line x1={startX} x2={laneEnd} y1={y} y2={y} stroke={PALETTE.ivory} strokeOpacity={0.2} strokeWidth={3} />
              {p > 0 && <line x1={startX} x2={Math.max(startX, shipX - moverLength * 0.5)} y1={y} y2={y} stroke={PALETTE.ivory} strokeOpacity={0.6} strokeWidth={3} />}
            </g>
          );
        })}
      </svg>
      {rows.map((r, i) => {
        const d = r.depart ?? depart;
        const T = Math.max(1, r.arrive - d);
        const raw = Math.min(1, dist(fm - d, launchEase) / dist(T, launchEase));
        const p = raw * (1 - back);
        const y = laneY(i);
        const shipX = shipFrom + (shipTo - shipFrom) * p;
        const moving = fm >= d && fm < r.arrive;
        // engine: idle flicker → flare at departure → cruising → idle after arrival
        const idle = 0.22 + 0.06 * Math.sin(f / 9 + i * 1.3);
        const flare = ramp(fm, d, 6) * (1 - 0.35 * ramp(fm, d + 6, 14));
        const settle = 1 - ramp(fm, r.arrive, 12);
        const engine = Math.max(idle, fm >= d ? flare * settle : 0);
        const trail = moving ? ramp(fm, d, launchEase) : fm >= r.arrive ? 1 - ramp(fm, r.arrive, 8) : 0;
        // arrival
        const k = f - r.arrive;
        const flashLen = r.gold ? 18 : 12;
        const flashP = k >= 0 && k <= flashLen ? k / flashLen : -1;
        const halo = k >= 0 ? (r.gold ? 0.35 : 0.22) * (1 - 0.6 * ramp(f, r.arrive, 30)) * (1 - back) : 0;
        const vIn = ramp(f, r.arrive, MOTION.rise);
        const vOut = valuesOut != null ? 1 - ramp(f, valuesOut + (rows.length - 1 - i), 8) : 1;
        const [num, ...unit] = r.value.split(' ');
        const col = r.gold ? PALETTE.gold : PALETTE.ivory;
        return (
          <React.Fragment key={i}>
            <div style={{ ...TYPE.annotation, position: 'absolute', left: startX - 10, top: y - 58, color: PALETTE.ivory, opacity: 0.7, whiteSpace: 'nowrap' }}>
              {r.label}
            </div>
            <Planet x={startX} y={y} r={originR} kind={origin} light={180} warm />
            {halo > 0 && (
              <div style={{ position: 'absolute', left: destX - destR * 2, top: y - destR * 2, width: destR * 4, height: destR * 4, borderRadius: '50%',
                background: `radial-gradient(circle, ${PALETTE.gold} 0%, rgba(255,213,138,0.35) 30%, rgba(255,213,138,0) 65%)`, opacity: halo }} />
            )}
            <Planet x={destX} y={y} r={destR} kind={r.dest} light={180} phase={0.8} warm />
            {flashP >= 0 && (
              <div style={{ position: 'absolute', left: destX, top: y, width: 0, height: 0 }}>
                <div style={{ position: 'absolute', transform: 'translate(-50%,-50%)', borderRadius: '50%',
                  width: 2 * destR * interpolate(EASE.out(flashP), [0, 1], [1, r.gold ? 2.0 : 1.6]),
                  height: 2 * destR * interpolate(EASE.out(flashP), [0, 1], [1, r.gold ? 2.0 : 1.6]),
                  border: `${r.gold ? 4 : 3}px solid ${PALETTE.gold}`, opacity: 0.85 * (1 - flashP), boxShadow: `0 0 18px ${PALETTE.goldDeep}` }} />
              </div>
            )}
            <Spacecraft x={shipX} y={y} length={moverLength} engine={engine} trail={trail} />
            <div style={{ position: 'absolute', right: 1080 - valueRight, top: y - destR - 58, whiteSpace: 'nowrap', opacity: vIn * vOut,
              transform: `translateY(${(1 - vIn) * MOTION.risePx}px)`, color: col }}>
              <span style={{ fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: 56, letterSpacing: -1 }}>{num}</span>
              {unit.length > 0 && (
                <span style={{ fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 600, fontSize: 40, marginLeft: 10, opacity: r.gold ? 1 : 0.7 }}>{unit.join(' ')}</span>
              )}
            </div>
          </React.Fragment>
        );
      })}
      {rule && (
        <div style={{ position: 'absolute', left: 540 - 360, width: 720, top: ruleY ?? lastY + 58, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          ...TYPE.annotation, letterSpacing: 2, color: PALETTE.sciText, lineHeight: 1.45, columnGap: 0 }}>
          {ruleLines.map((segs, li) => (
            <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {segs.map((sg, i) => (
                <span key={i} style={{ whiteSpace: 'nowrap' }}>{sg}{i < segs.length - 1 ? '\u00a0·\u00a0' : ''}</span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
