import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, MOTION, PALETTE, SAFE_RECT, TYPE } from '../../brand';
import { Camera, CameraLayer, ElapsedCounter, Grain, MultiRaceBoard, SpeedHeader, Starfield, TitleSwap } from '../../components';
import type { BoardRow, RaceDef, TitleWord } from '../../components';
import { speedLineHeight } from '../../components/SpeedHeader';
import { CL, kf, Keys } from '../../components/anim';

// "How Long to Run or Drive to Every Planet?" — shorts/car-and-runner-to-every-planet/guion.md.
// FORMAT: Race, no voice (PROJECT_CONTEXT §4 + the departures listed in the guion's NOTES): a single-lane
// hook (the runner sprints to Neptune, "11,000 years" lands big), a morph into the full board, the car
// race (values above the lanes), a title swap, the runner race on the same lanes (values below), and a
// loop that folds the board back into the hook frame. Production change agreed with the user: a
// YEARS PASSED clock in both races (so the faster-running compression reads as a time-lapse, not a
// faster runner). All cues in frames (30 fps), from the guion.
// First-second pass (2026-11-20, PROJECT_CONTEXT v0.21.0 / brand v2.8): the speed is ONE small line
// under the question title; the runner is already sprinting on frame 0 (it left LEAD frames before, in
// the loop's last frames: a clone replays that start right after the rewind, so the seam never holds
// still); the hook frames the single lane HOOK_S× bigger in the middle of the frame (lane, runner,
// planets, label), easing back to the board on the morph and forward again on the fold back.
// Layout derived from SAFE_RECT (16:9-ready).

const TOTAL = 888;
// durationInSeconds = TOTAL / 30 (literal: gen-registry reads numbers only).
export const compositionConfig = { id: 'CarAndRunnerToEveryPlanet', durationInSeconds: 29.6, fps: 30, width: 1080, height: 1920 };

// ---- timeline (guion) ----
const SEAM = 882; // the rewind lands here and the hook runner's clone leaves at once
const LEAD = TOTAL - SEAM; // frame 0 is LEAD frames into the sprint
const HOOK = { depart: -LEAD, arrive: 66, numIn: 66, out: 108 };
const MORPH = { title: 110, fold: [112, 130] as const, rowsIn: 124, carsIn: 130 };
const CAR = { depart: 144, arrive: [186, 228, 270, 318, 369, 423, 483] };
const SWAP2 = { title: 519, runnersIn: 524 };
const RUN = { depart: 540, arrive: [570, 600, 630, 663, 696, 732, 774] };
const LOOP = { out: 840, fold: [846, 864] as const, rewind: 848, rewindLen: SEAM - 848 };

const CAR_VALUES = ['45 YEARS', '65 YEARS', '91 YEARS', '700 YEARS', '1,400 YEARS', '3,000 YEARS', '5,100 YEARS'];
const RUN_VALUES = ['97 YEARS', '140 YEARS', '200 YEARS', '1,500 YEARS', '3,100 YEARS', '6,600 YEARS', '11,000 YEARS'];
const CAR_YEARS = [45, 65, 91, 700, 1400, 3000, 5100];
const RUN_YEARS = [97, 140, 200, 1500, 3100, 6600, 11000];

const ROWS: BoardRow[] = [
  { label: 'EARTH → VENUS', dest: 'venus' },
  { label: 'EARTH → MARS', dest: 'mars' },
  { label: 'EARTH → MERCURY', dest: 'mercury' },
  { label: 'EARTH → JUPITER', dest: 'jupiter' },
  { label: 'EARTH → SATURN', dest: 'saturn' },
  { label: 'EARTH → URANUS', dest: 'uranus' },
  { label: 'EARTH → NEPTUNE', dest: 'neptune' },
];
const N = ROWS.length;

// ---- layout (from the safe rect; brand v2.7: centered, 960 × 1390) ----
const TITLE_SIZE = 120;
const TITLE_TOP = SAFE_RECT.y + 26;
const TITLE_LINE = Math.round(TITLE_SIZE * TYPE.title.lineHeight);
const RULE_SIZE = 32;
const SPEED_SIZE = RULE_SIZE; // brand v2.8: the speed line is set at the rule line's size
const SPEED_H = speedLineHeight(SPEED_SIZE);
const HEADER_Y_HOOK = TITLE_TOP + 2 * TITLE_LINE + 14;
const HEADER_Y_RACE = TITLE_TOP + TITLE_LINE + 14;
const CLOCK_SIZE = 50;
const CLOCK_Y = HEADER_Y_RACE + SPEED_H + 10 + SPEED_H + 22; // under the speed line + its second line
const LABEL = 34; // row labels
const ZOOM = 1.02; // the slow push-in (grows the board downward from its top)
const ZOOM_Y = CLOCK_Y + CLOCK_SIZE + 10;
const TOP = ZOOM_Y + 8 + Math.round(LABEL * 2.2); // first lane
const RULE_H = Math.round(RULE_SIZE * 1.45 * 2);
const SAFE_BOTTOM = SAFE_RECT.y + SAFE_RECT.h;
const LAST_MAX = ZOOM_Y + (SAFE_BOTTOM - 8 - ZOOM_Y) / ZOOM - (45 + 30 + RULE_H); // rule bottom stays safe under the push-in
const GAP = Math.floor((LAST_MAX - TOP) / (N - 1));
const LAST = TOP + GAP * (N - 1); // the Neptune lane (also the hook's single lane)
const RULE_Y = LAST + 45 + 30;
const HOOK_H = 140; // hook-size runner (board units: the hook framing scales it by HOOK_S)
const ROW_H = 56; // board-size runner
const CAR_L = 64;
// symmetric around x 540: the row labels / Earth start ~START_X − 16, the value column ends at the mirror of that
const START_X = SAFE_RECT.x + 70;
const VALUE_RIGHT = CANVAS.W - (START_X - 16);
const VALUE_COL = 262; // the value column right of the planets
const DEST_R = 29;
const DEST_X = VALUE_RIGHT - VALUE_COL - 40 - DEST_R; // 40 px clear of the column: Saturn's ring (2.27 r) stays off "1,400"
const SOLO_LABEL_LIFT = HOOK_H - 14; // the Neptune label clears the hero runner's head in the hook
// hook framing: the single (Neptune) lane, scaled HOOK_S about its own middle and centered in the frame
const LANE_L = START_X - 16 - 10; // Earth's left edge / the row label
const LANE_R = DEST_X + DEST_R + 6;
const LANE_C = (LANE_L + LANE_R) / 2;
const HOOK_S = Math.min(1.6, (SAFE_RECT.w - 40) / (LANE_R - LANE_L));
const HOOK_LABEL_UP = Math.round(LABEL * 2.2) + SOLO_LABEL_LIFT; // board px from the lane up to the solo label's top
const HOOK_LANE_Y = HEADER_Y_HOOK + SPEED_H + 34 + HOOK_S * HOOK_LABEL_UP; // the label clears the speed line
const NUM_SIZE = 220;
const NUM_TOP = HOOK_LANE_Y + HOOK_S * DEST_R + 44; // the hook's big number, under the lane
// 1 = hook framing, 0 = the board: eases out on the morph, back in on the fold
const FRAMING: Keys = [[HOOK.out, 1], [MORPH.fold[1] + 4, 0, 'inOut'], [LOOP.fold[0] + 2, 0], [SEAM, 1, 'inOut']];

const HOOK_TITLE: TitleWord[][] = [[{ w: 'Fastest' }, { w: 'human' }], [{ w: 'to' }, { w: 'Neptune?', gold: true }]];
const TITLES = [
  { at: 0, lines: HOOK_TITLE },
  { at: MORPH.title, lines: [[{ w: 'By' }, { w: 'car?', gold: true }]] },
  { at: SWAP2.title, lines: [[{ w: 'And' }, { w: 'running?', gold: true }]] },
  { at: LOOP.fold[0], lines: HOOK_TITLE },
];
const HEAD_RUNNER = { label: "USAIN BOLT'S TOP SPEED", value: '27.8 MPH' };
const HEAD_CAR = { label: 'A CAR ON CRUISE CONTROL', value: '60 MPH' };

const nullsBut = (i: number, v: number) => ROWS.map((_, k) => (k === i ? v : null));

const RACES: RaceDef[] = [
  // 0 — the hook: one hero-size runner on the Neptune lane, already LEAD frames into its sprint on frame 0
  {
    mover: 'runner', size: HOOK_H, lift: 1, depart: HOOK.depart, arrive: nullsBut(N - 1, HOOK.arrive),
    out: { at: HOOK.out, len: 8 }, glow: [[MORPH.fold[0], 1], [MORPH.fold[0] + 14, 0]], park: 14,
  },
  // 1 — the car race: values above the lanes, Neptune's gold until the runner's takes over
  {
    mover: 'car', size: CAR_L, depart: CAR.depart, arrive: CAR.arrive, values: CAR_VALUES, valuePos: 'above', valueSize: 50,
    gold: N - 1, goldOff: RUN.arrive[N - 1], appear: { at: MORPH.carsIn, len: 8 }, out: { at: LOOP.out, len: 8 },
    glow: [[SWAP2.runnersIn, 1], [SWAP2.runnersIn + 16, 0]], park: 14,
  },
  // 2 — the runner race: parks behind the cars, values below; the Neptune runner rewinds into the hook
  {
    mover: 'runner', size: ROW_H, depart: RUN.depart, arrive: RUN.arrive, values: RUN_VALUES, valuePos: 'below', valueSize: 42,
    valueOpacity: 0.75, gold: N - 1, appear: { at: SWAP2.runnersIn, len: 16 }, parkBehind: 1,
    out: { at: LOOP.out, len: 8, keep: [N - 1] },
    rewind: { at: LOOP.rewind, len: LOOP.rewindLen, rows: [N - 1], grow: { size: HOOK_H, lift: 1 } },
    hideAt: SEAM, // hands over to the clone below: same place, same pose
  },
  // 3 — the hook runner's clone: replays the first LEAD frames of the sprint after the rewind, so the
  // last frame flows into frame 0 (where race 0 is LEAD frames into the same sprint)
  {
    mover: 'runner', size: HOOK_H, lift: 1, depart: SEAM, arrive: nullsBut(N - 1, SEAM + HOOK.arrive - HOOK.depart), park: 14, flash: false,
    appear: { at: SEAM - 1, len: 1 }, // only from the seam on
  },
];

// the clock lands on each value as its mover arrives; reset between the races
const CLOCK_MARKS: [number, number][] = [
  [CAR.depart, 0], ...CAR.arrive.map((a, i) => [a, CAR_YEARS[i]] as [number, number]),
  [SWAP2.title + 10, 5100], [SWAP2.title + 11, 0],
  [RUN.depart, 0], ...RUN.arrive.map((a, i) => [a, RUN_YEARS[i]] as [number, number]),
];
const CLOCK_OP: [number, number][] = [
  [MORPH.carsIn + 4, 0], [CAR.depart, 1], [SWAP2.title, 1], [SWAP2.title + 8, 0], [SWAP2.title + 12, 0], [RUN.depart, 1], [LOOP.out, 1], [LOOP.out + 8, 0],
];

// stars kept off the text: title + speed line, clock, every row's label/value band, the hook label and number, the rule
const CLEAR: [number, number, number, number][] = [
  [80, TITLE_TOP - 20, 920, HEADER_Y_HOOK + SPEED_H + 20 - TITLE_TOP],
  [80, CLOCK_Y - 10, 920, CLOCK_SIZE + 20],
  ...ROWS.map((_, i) => [SAFE_RECT.x - 10, TOP + i * GAP - 84, SAFE_RECT.w + 20, 140] as [number, number, number, number]),
  [80, HOOK_LANE_Y - HOOK_S * HOOK_LABEL_UP - 10, 920, Math.round(LABEL * HOOK_S) + 20],
  [80, NUM_TOP - 20, 920, NUM_SIZE + 190],
  [80, RULE_Y - 10, 920, RULE_H + 20],
];

// the RULE LINE, drawn outside the board so the hook framing doesn't scale it
const RuleLine: React.FC = () => (
  <div style={{ position: 'absolute', left: 90, width: 900, top: RULE_Y, ...TYPE.annotation, fontSize: RULE_SIZE, letterSpacing: 2,
    color: PALETTE.sciText, lineHeight: 1.45, textAlign: 'center' }}>
    <div>STRAIGHT LINE · STEADY SPEED</div>
    <div>NO STOPS · EACH PLANET AT ITS CLOSEST</div>
  </div>
);

// the board inside the hook framing: k = 1 maps the Neptune lane to the middle of the frame at HOOK_S
const Framed: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const k = kf(useCurrentFrame(), FRAMING, 1);
  const s = 1 + (HOOK_S - 1) * k;
  const tx = k * (540 - HOOK_S * LANE_C);
  const ty = k * (HOOK_LANE_Y - HOOK_S * LAST);
  return <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>{children}</AbsoluteFill>;
};

// the hook's number COUNTS the years while the runner runs (steady speed: years ∝ distance covered, so
// the count is honest at every frame), dimmer while counting, landing full on 11,000 at the arrival. It
// fills the middle of the frame from frame 0; on the fold back it returns at 0 so the seam matches.
const HOOK_YEARS = 11000;
const NUM_OP: Keys = [[HOOK.out, 1], [HOOK.out + 8, 0], [LOOP.fold[1], 0], [SEAM, 1]];
const HookNumber: React.FC = () => {
  const f = useCurrentFrame();
  const op = kf(f, NUM_OP, 1);
  if (op <= 0.001) return null;
  const fr = f >= LOOP.fold[1] ? f - TOTAL : f; // the loop's last frames count the clone's sprint (0 until it leaves)
  const p = Math.min(1, Math.max(0, (fr - HOOK.depart) / (HOOK.arrive - HOOK.depart)));
  const landed = f >= HOOK.arrive && f < LOOP.fold[1];
  const years = landed ? HOOK_YEARS : Math.min(HOOK_YEARS - 100, Math.round((HOOK_YEARS * p) / 10) * 10);
  const land = landed ? interpolate(f, [HOOK.arrive, HOOK.arrive + MOTION.rise], [0, 1], { ...CL, easing: EASE.out }) : 0;
  const numStyle: React.CSSProperties = { ...TYPE.number, fontSize: NUM_SIZE, fontVariantNumeric: 'tabular-nums' };
  return (
    <div style={{ position: 'absolute', top: NUM_TOP, left: 0, width: CANVAS.W, textAlign: 'center', opacity: op }}>
      {/* the final value sets the width; the count sits right-aligned in it, so nothing jumps */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ ...numStyle, visibility: 'hidden' }}>11,000</div>
        <div style={{ ...numStyle, position: 'absolute', right: 0, top: 0, color: PALETTE.ivory, opacity: 0.72 + 0.28 * land,
          transform: `scale(${1 + 0.04 * Math.sin(Math.PI * land)})`, transformOrigin: '50% 60%' }}>{years.toLocaleString('en-US')}</div>
      </div>
      <div style={{ ...TYPE.numberUnit, fontSize: Math.round(NUM_SIZE * 0.62), color: PALETTE.gold, marginTop: 4 }}>years</div>
    </div>
  );
};

export const CarAndRunnerToEveryPlanet: React.FC = () => (
  <Grain>
    <AbsoluteFill style={{ backgroundColor: PALETTE.space }}>
      <Starfield count={170} bright={8} seed={31} clear={CLEAR} opacity={0.8} warm />
      <Camera
        drift={6}
        driftAmp={[[0, 0], [45, 1], [LOOP.rewind, 1], [SEAM, 0]]}
        zoom={[[CAR.depart, 1], [RUN.arrive[N - 1], ZOOM, 'inOut'], [LOOP.rewind, ZOOM], [SEAM, 1, 'inOut']]}
        origin={[540, ZOOM_Y]}
        blur={[[LOOP.rewind + 10, LOOP.rewind + 24]]}
        samples={6}
      >
        <CameraLayer depth={1}>
          <Framed>
            <MultiRaceBoard
              rows={ROWS}
              races={RACES}
              top={TOP}
              gap={GAP}
              startX={START_X}
              destX={DEST_X}
              destR={DEST_R}
              originR={16}
              labelSize={LABEL}
              valueSide="right"
              valueRight={VALUE_RIGHT}
              fold={[[MORPH.fold[0], 1], [MORPH.fold[1], 0, 'inOut'], [LOOP.fold[0], 0], [LOOP.fold[1], 1, 'inOut']]}
              rowsIn={{ at: MORPH.rowsIn, len: 8, stagger: 1 }}
              rowsOut={{ at: LOOP.fold[0], len: 10 }}
              soloLabelLift={SOLO_LABEL_LIFT}
              valuesOut={LOOP.out}
            />
          </Framed>
          <RuleLine />
          <HookNumber />
        </CameraLayer>
        {/* the text above the board stays put (depth 0): the push-in grows the board downward, away from it */}
        <CameraLayer depth={0}>
          <ElapsedCounter marks={CLOCK_MARKS} label="YEARS PASSED" y={CLOCK_Y} size={CLOCK_SIZE} opacity={CLOCK_OP} />
          <SpeedHeader
            states={[{ at: 0, ...HEAD_RUNNER }, { at: MORPH.title, ...HEAD_CAR }, { at: LOOP.fold[0], ...HEAD_RUNNER }]}
            y={[[MORPH.title, HEADER_Y_HOOK], [MORPH.title + 16, HEADER_Y_RACE, 'inOut'], [LOOP.fold[0], HEADER_Y_RACE], [LOOP.fold[0] + 16, HEADER_Y_HOOK, 'inOut']]}
            sub={{ text: "USAIN BOLT'S TOP SPEED · 27.8 MPH", in: SWAP2.title, out: LOOP.out }}
            mode="line"
            size={SPEED_SIZE}
            width={900}
          />
          <TitleSwap states={TITLES} top={TITLE_TOP} size={TITLE_SIZE} width={960} />
        </CameraLayer>
      </Camera>
    </AbsoluteFill>
  </Grain>
);

export default CarAndRunnerToEveryPlanet;
