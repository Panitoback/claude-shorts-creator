import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, MOTION, PALETTE, SAFE_RECT, TYPE } from '../../brand';
import { Camera, CameraLayer, ElapsedCounter, Grain, MultiRaceBoard, SpeedHeader, Starfield, TitleSwap } from '../../components';
import type { BoardRow, RaceDef, TitleWord } from '../../components';
import { CL } from '../../components/anim';

// "How Long to Run or Drive to Every Planet?" — shorts/car-and-runner-to-every-planet/guion.md.
// FORMAT: Race, no voice (PROJECT_CONTEXT §4 + the departures listed in the guion's NOTES): a single-lane
// hook (the runner sprints to Neptune, "11,000 years" lands big), a morph into the full board, the car
// race (values above the lanes), a title swap, the runner race on the same lanes (values below), and a
// loop that folds the board back into the hook frame. Production changes agreed with the user: a
// YEARS PASSED clock in both races (so the faster-running compression reads as a time-lapse, not a
// faster runner) and a 6-frame still at the loop seam. All cues in frames (30 fps), from the guion.
// Layout derived from SAFE_RECT (16:9-ready).

const TOTAL = 888;
// durationInSeconds = TOTAL / 30 (literal: gen-registry reads numbers only).
export const compositionConfig = { id: 'CarAndRunnerToEveryPlanet', durationInSeconds: 29.6, fps: 30, width: 1080, height: 1920 };

// ---- timeline (guion) ----
const HOOK = { depart: 9, arrive: 66, numIn: 66, out: 108 };
const MORPH = { title: 110, fold: [112, 130] as const, rowsIn: 124, carsIn: 130 };
const CAR = { depart: 144, arrive: [186, 228, 270, 318, 369, 423, 483] };
const SWAP2 = { title: 519, runnersIn: 524 };
const RUN = { depart: 540, arrive: [570, 600, 630, 663, 696, 732, 774] };
const LOOP = { out: 840, fold: [846, 864] as const, rewind: 848, rewindLen: 34 };
const SEAM = LOOP.rewind + LOOP.rewindLen; // 882: still from here to TOTAL (6 frames) = frame 0

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
const HEADER_VALUE = 72;
const HEADER_Y_HOOK = TITLE_TOP + 2 * TITLE_LINE + 12;
const HEADER_Y_RACE = TITLE_TOP + TITLE_LINE + 12;
const CLOCK_SIZE = 50;
const CLOCK_Y = HEADER_Y_RACE + 36 + 8 + HEADER_VALUE + 56; // under the header + its second line
const LABEL = 34; // row labels
const ZOOM = 1.02; // the slow push-in (grows the board downward from its top)
const ZOOM_Y = CLOCK_Y + CLOCK_SIZE + 10;
const TOP = ZOOM_Y + 8 + Math.round(LABEL * 2.2); // first lane
const RULE_SIZE = 32;
const RULE_H = Math.round(RULE_SIZE * 1.45 * 2);
const SAFE_BOTTOM = SAFE_RECT.y + SAFE_RECT.h;
const LAST_MAX = ZOOM_Y + (SAFE_BOTTOM - 8 - ZOOM_Y) / ZOOM - (45 + 30 + RULE_H); // rule bottom stays safe under the push-in
const GAP = Math.floor((LAST_MAX - TOP) / (N - 1));
const LAST = TOP + GAP * (N - 1); // the Neptune lane (also the hook's single lane)
const RULE_Y = LAST + 45 + 30;
const HOOK_H = 140; // hook-size runner
const ROW_H = 50; // board-size runner
const CAR_L = 58;
// symmetric around x 540: the row labels / Earth start ~START_X − 16, the value column ends at the mirror of that
const START_X = SAFE_RECT.x + 70;
const VALUE_RIGHT = CANVAS.W - (START_X - 16);
const VALUE_COL = 262; // the value column right of the planets
const DEST_R = 27;
const DEST_X = VALUE_RIGHT - VALUE_COL - 40 - DEST_R; // 40 px clear of the column: Saturn's ring (2.27 r) stays off "1,400"
const NUM_SIZE = 220;
const NUM_TOP = HEADER_Y_HOOK + 36 + 8 + HEADER_VALUE + 70; // the hook's big number block
const SOLO_LABEL_LIFT = HOOK_H - 14; // the Neptune label clears the hero runner's head in the hook

const HOOK_TITLE: TitleWord[][] = [[{ w: 'Fastest' }, { w: 'human' }], [{ w: 'to' }, { w: 'Neptune?', gold: true }]];
const TITLES = [
  { at: 0, lines: HOOK_TITLE },
  { at: MORPH.title, lines: [[{ w: 'By' }, { w: 'car?', gold: true }]] },
  { at: SWAP2.title, lines: [[{ w: 'And' }, { w: 'running?', gold: true }]] },
  { at: LOOP.fold[0], lines: HOOK_TITLE },
];
const HEAD_RUNNER = { label: "USAIN BOLT'S TOP SPEED", value: '27.8 mph' };
const HEAD_CAR = { label: 'A CAR ON CRUISE CONTROL', value: '60 mph' };

const nullsBut = (i: number, v: number) => ROWS.map((_, k) => (k === i ? v : null));

const RACES: RaceDef[] = [
  // 0 — the hook: one hero-size runner on the Neptune lane (its value is the big number, drawn below)
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

// stars kept off the text: title + header, clock, every row's label/value band, the hook number, the rule
const CLEAR: [number, number, number, number][] = [
  [80, TITLE_TOP - 20, 920, HEADER_Y_HOOK + 140 - TITLE_TOP],
  [80, CLOCK_Y - 10, 920, CLOCK_SIZE + 20],
  ...ROWS.map((_, i) => [SAFE_RECT.x - 10, TOP + i * GAP - 84, SAFE_RECT.w + 20, 140] as [number, number, number, number]),
  [80, NUM_TOP - 20, 920, NUM_SIZE + 190],
  [80, RULE_Y - 10, 920, RULE_H + 20],
];

const HookNumber: React.FC = () => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [HOOK.numIn, HOOK.numIn + MOTION.rise], [0, 1], { ...CL, easing: EASE.out });
  const unitP = interpolate(f, [HOOK.numIn + 4, HOOK.numIn + 4 + MOTION.rise], [0, 1], { ...CL, easing: EASE.out });
  const out = 1 - interpolate(f, [HOOK.out, HOOK.out + 8], [0, 1], { ...CL, easing: EASE.in });
  if (inP * out <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', top: NUM_TOP, left: 0, width: CANVAS.W, textAlign: 'center', opacity: out }}>
      <div style={{ ...TYPE.number, fontSize: NUM_SIZE, color: PALETTE.ivory, opacity: inP, transform: `translateY(${(1 - inP) * MOTION.risePx}px)` }}>11,000</div>
      <div style={{ ...TYPE.numberUnit, fontSize: Math.round(NUM_SIZE * 0.62), color: PALETTE.gold, marginTop: 4, opacity: unitP, transform: `translateY(${(1 - unitP) * MOTION.risePx}px)` }}>years</div>
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
            ruleWidth={900}
            ruleSize={RULE_SIZE}
            fold={[[MORPH.fold[0], 1], [MORPH.fold[1], 0, 'inOut'], [LOOP.fold[0], 0], [LOOP.fold[1], 1, 'inOut']]}
            rowsIn={{ at: MORPH.rowsIn, len: 8, stagger: 1 }}
            rowsOut={{ at: LOOP.fold[0], len: 10 }}
            soloLabelLift={SOLO_LABEL_LIFT}
            valuesOut={LOOP.out}
            rule={'STRAIGHT LINE · STEADY SPEED\nNO STOPS · EACH PLANET AT ITS CLOSEST'}
            ruleY={RULE_Y}
          />
          <HookNumber />
        </CameraLayer>
        {/* the text above the board stays put (depth 0): the push-in grows the board downward, away from it */}
        <CameraLayer depth={0}>
          <ElapsedCounter marks={CLOCK_MARKS} label="YEARS PASSED" y={CLOCK_Y} size={CLOCK_SIZE} opacity={CLOCK_OP} />
          <SpeedHeader
            states={[{ at: 0, ...HEAD_RUNNER }, { at: MORPH.title, ...HEAD_CAR }, { at: LOOP.fold[0], ...HEAD_RUNNER }]}
            y={[[MORPH.title, HEADER_Y_HOOK], [MORPH.title + 16, HEADER_Y_RACE, 'inOut'], [LOOP.fold[0], HEADER_Y_RACE], [LOOP.fold[0] + 16, HEADER_Y_HOOK, 'inOut']]}
            sub={{ text: "USAIN BOLT'S TOP SPEED · 27.8 MPH", in: SWAP2.title, out: LOOP.out }}
            valueSize={HEADER_VALUE}
            width={900}
          />
          <TitleSwap states={TITLES} top={TITLE_TOP} size={TITLE_SIZE} width={960} />
        </CameraLayer>
      </Camera>
    </AbsoluteFill>
  </Grain>
);

export default CarAndRunnerToEveryPlanet;
