import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CANVAS, PALETTE, SAFE_RECT, SKY_TEXT_SHADOW, TYPE } from '../../brand';
import {
  AltitudeAscent, AltitudeLine, barGeom, Camera, ComparisonBars, DataLabel, FieldRibbon, Grain, HeroNumber, kf, KeywordCaptions,
  CameraLayer, lineGeom, Marker, OdometerNumber, ramp, ScaleBar, ShapeMatch,
} from '../../components';
import type { AscentWorld, CaptionLine } from '../../components';
import type { Key, Keys } from '../../components/anim';
import { DURATION_S, VO } from './vo.gen';

// "Fold Paper 42 Times and You Reach the Moon" — shorts/fold-paper-to-the-moon/guion.md (Scale).
// VOICE-FIRST: every cue is read from the real word times in vo.gen.ts. No <Sequence>s: global frames.
// One world (AltitudeAscent) carries hook → rewind → macro folds → the ladder → the Moon: the camera
// scale is S = S0 + H/fill (metres per px), H = 0.1 mm × 2^n, so the column's tip rides at `fill` px
// above the ground whenever the column is big, and the floor S0 holds the macro / hook framings. Every
// frame is true to scale vertically; the macro fold shot squeezes only the sheet's LENGTH (hScale).
// Layout from SAFE_RECT (16:9-ready): no literal y positions.

const FPS = CANVAS.FPS;
const F = (s: number) => Math.round(s * FPS);
const T = (line: number, word: number) => VO[line].words![word].start;
const LAST = Math.round(DURATION_S * FPS) - 1;

// durationInSeconds = DURATION_S in vo.gen.ts (literal: gen-registry reads numbers only).
export const compositionConfig = { id: 'FoldPaperToTheMoon', durationInSeconds: 55.867, fps: 30, width: 1080, height: 1920 };

// ---- layout ----
const CX = SAFE_RECT.x + SAFE_RECT.w / 2;
const GYW = SAFE_RECT.y + SAFE_RECT.h * 0.87; // the ground under the column (wide shots)
const GYM = SAFE_RECT.y + SAFE_RECT.h * 0.62; // the ground in the macro fold shot
const ODO_Y = SAFE_RECT.y + 10;
const ODO_SIZE = 200;
const HERO_Y = ODO_Y + ODO_SIZE * 0.72 * 1.02 + 150; // under the counter's "folds" line
const SHEET_PX = 1e-4; // m
const MOON_M = 384400e3;
const lg = Math.log10;

// ---- timing (from the voice) ----
const HOOK_N = F(2.55); // column at 42 just before "Moon"
const RW0 = F(3.3); // rewind
const RW1 = F(3.95);
const FOLD1 = F(T(1, 2)) - 3; // "doubles"
const FOLD2 = F(T(1, 4)) - 3; // "thickness"
const FOLD3 = F(T(2, 1)) - 3; // "sheet"
const SP = F(T(2, 8)) + 4; // "millimeter": the folds speed up
const ASC0 = SP + 50; // n = 8: the climb begins
const R14 = F(T(4, 0)) + 6;
const R23a = F(T(4, 4)) + 26, R23b = F(T(5, 0)) + 34;
const R30a = F(T(6, 0)) - 12, R30b = F(T(6, 0)) + 26;
const R32a = F(T(7, 0)) - 10, R32b = F(T(7, 0)) + 28;
const R42a = F(T(8, 1)) - 1, R42b = F(T(8, 1)) + 44;
const MOON2 = F(T(8, 4));
const TW0 = F(T(10, 0)) - 14; // match cut: column → ribbon
const PULL0 = F(T(11, 0)), PULL1 = F(T(11, 5)) + 10;
const RF0 = F(T(12, 0)) - 2, RF1 = F(T(12, 4)); // 13 folds land on "13"
const B0 = F(T(14, 0)); // "But": the block doubles again → bars
const SUN = F(T(15, 4));
const UNI = F(T(16, 5));
const LP0 = F(T(17, 0)) - 14; // loop

// ---- the world's dials ----
const foldSteps = (from: number, n0: number, n1: number, every: number, len: number): Key[] => {
  const out: Key[] = [];
  for (let i = n0; i < n1; i++) out.push([from + (i - n0) * every, i], [from + (i - n0) * every + len, i + 1, 'inOut']);
  return out;
};
const N_K: Key[] = [
  [0, 0], [F(0.25), 0], [HOOK_N, 42, 'inOut'],
  [RW0, 42], [RW1, 0, 'inOut'],
  [FOLD1, 0], [FOLD1 + 16, 1], [FOLD2, 1], [FOLD2 + 16, 2], [FOLD3, 2], [FOLD3 + 16, 3],
  ...foldSteps(SP, 3, 8, 10, 9),
  [ASC0, 8], [R14, 14, 'inOut'],
  [R23a, 14], [R23b, 23, 'inOut'],
  [R30a, 23], [R30b, 30, 'inOut'],
  [R32a, 30], [R32b, 32, 'inOut'],
  [R42a, 32], [R42b, 42, 'punch'],
];
const LOGS0_K: Key[] = [[0, -3.3], [RW0, -3.3], [RW1, -5.15, 'inOut'], [FOLD1, -5.15], [SP, -5.45, 'inOut'], [ASC0, -8, 'inOut']];
const LOGFILL_K: Key[] = [
  [0, lg(880)], [RW1, lg(880)], [RW1 + 8, 7], [SP, 7], [ASC0, lg(450), 'inOut'], [R14, lg(520), 'inOut'], [R23a, lg(560)],
  [R23b, lg(780), 'inOut'], [R30a, lg(780)], [R30b, lg(300), 'inOut'], [R32a, lg(250)], [R32b, lg(200), 'inOut'], [R42a, lg(200)], [R42b, lg(680), 'punch'],
];
const GROUND_K: Keys = [[RW0, GYW], [RW1, GYM, 'inOut'], [ASC0, GYM], [R14, GYW, 'inOut']];
const HSCALE_K: Keys = [[RW0, 1], [RW1, 50, 'inOut'], [SP, 50], [ASC0, 1, 'inOut']];
const ANIM_K: Keys = [[RW1 - 1, 0], [RW1, 1], [ASC0 - 1, 1], [ASC0, 0]];
const PITCH_K: Keys = [[RW0, 0.15], [RW1, 0]];
const GLOW_K: Keys = [[F(1.0), 0], [F(1.7), 1], [RW0, 1], [RW1 - 4, 0], [R30a, 0], [R30b, 1]];
const GOLD_K: Keys = [[F(1.0), 0], [F(1.7), 0.75], [RW0, 0.75], [RW1 - 4, 0], [R30a, 0], [R30b, 0.75]];

const logScaleAt = (fr: number, nK: Keys, s0K: Keys, fillK: Keys) => {
  const H = SHEET_PX * 2 ** Math.max(0, kf(fr, nK, 0));
  return lg(10 ** kf(fr, s0K, -3.3) + H / 10 ** kf(fr, fillK, 3));
};
// the scale as keys over the last 16 frames (AltitudeAscent fades stars in from their history)
const scaleKeys = (f: number, nK: Keys, s0K: Keys, fillK: Keys): Keys =>
  Array.from({ length: 16 }, (_, j) => [f - 15 + j, logScaleAt(f - 15 + j, nK, s0K, fillK)] as const);

// ---- small helpers ----
const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0.001 ? null : <AbsoluteFill style={{ opacity: Math.min(1, op) }}>{children}</AbsoluteFill>;
const win = (f: number, a: number, b: number, inLen = 10, outLen = 12) => Math.min(ramp(f, a, inLen), 1 - ramp(f, b, outLen));

const OBS = { xM: -0.55, hM: 1.68, facing: 'right' as const };
const TOWER = { xM: -255, heightM: 828 };
const STATION_ALT = 400e3;
const STATION_X = 700e3;
const MOON = { distM: MOON_M, angleDeg: 9 };

// annotations pinned to the world (inside the camera, so they ride with it)
const BodyNotes: React.FC<{ w: AscentWorld }> = ({ w }) => {
  const f = useCurrentFrame();
  const head = w.at(OBS.xM, OBS.hM);
  const towerTop = w.at(TOWER.xM, TOWER.heightM);
  const R = w.rpx * w.S;
  const [stx, sty] = w.at(STATION_X, STATION_ALT);
  const a = (MOON.angleDeg * Math.PI) / 180;
  const mx = w.cx + (MOON.distM * Math.sin(a)) / w.S;
  const my = w.cy - (MOON.distM * Math.cos(a)) / w.S;
  return (
    <>
      <Fade op={win(f, F(T(4, 4)) - 4, R23a - 6)}>
        <DataLabel x={w.x + 34} y={w.colTopY - 34} label="AFTER 14 FOLDS" value="5 ft 4 in" at={F(T(4, 4)) - 4} />
      </Fade>
      <Fade op={win(f, R23a, R23b + 6)}>
        <Marker x={head[0]} y={head[1]} label="" ringR={16} length={0} at={R23a} />
      </Fade>
      <Fade op={win(f, F(T(5, 1)), R30a - 4)}>
        <DataLabel x={towerTop[0]} y={towerTop[1] - 140} align="center" label="TALLEST BUILDING" value="2,717 ft" at={F(T(5, 1))} />
        <DataLabel x={w.x + 34} y={w.colTopY - 30} label="AFTER 23 FOLDS" value="2,752 ft" at={F(T(5, 1)) + 8} />
      </Fade>
      {f >= R30a - 2 && f < R42a + 12 && (
        <AltitudeLine cx={w.cx} cy={w.cy} r={(R + 100e3) / w.S} fromX={w.x} span={470} labelX={w.x + 40} label="EDGE OF SPACE" value="62 MI" at={R30a} out={R42a} />
      )}
      <Fade op={win(f, R32a, R42a)}>
        <Marker x={stx} y={sty} label="SPACE STATION" value="~250 MI" side="above" length={60} ringR={30} at={R32a + 4} />
      </Fade>
      <Fade op={win(f, F(T(0, 6)) - 8, RW0 - 4, 8, 8)}>
        <Marker x={mx} y={my} label="" ringR={14} length={0} at={F(T(0, 6)) - 8} />
      </Fade>
      <Fade op={win(f, MOON2 - 8, TW0)}>
        <Marker x={mx} y={my} label="MOON" value="238,855 MI" side="right" length={50} ringR={14} at={MOON2 - 8} />
      </Fade>
    </>
  );
};

// the macro shot's measurement: one layer's thickness, beside the stack's right edge
const SheetBar: React.FC = () => {
  const f = useCurrentFrame();
  const op = win(f, RW1 + 2, SP - 4);
  if (op <= 0.001) return null;
  const S = 10 ** logScaleAt(f, N_K, LOGS0_K, LOGFILL_K);
  const n = kf(f, N_K, 0);
  const L0 = 0.21 / S / kf(f, HSCALE_K, 1);
  const w = L0 / 2 ** Math.ceil(Math.floor(n) / 2);
  const t = SHEET_PX / S;
  const gy = kf(f, GROUND_K, GYW);
  return (
    <Fade op={op}>
      <ScaleBar vertical x1={gy - t} x2={gy} y={CX + w / 2 + 28} label="0.1 MM" at={RW1 + 2} />
    </Fade>
  );
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AltitudeAscent
      logScale={scaleKeys(f, N_K, LOGS0_K, LOGFILL_K)} groundY={GROUND_K} x={CX} n={N_K}
      stack={{ hScale: HSCALE_K, animate: ANIM_K, pitch: PITCH_K, glow: GLOW_K, gold: GOLD_K, minWidth: 5 }}
      observer={{ ...OBS, opacity: [[R14 - 14, 0], [R14, 1]] }}
      tower={{ ...TOWER, opacity: [[R14, 0], [R23a, 1]] }}
      station={{ altM: STATION_ALT, xM: STATION_X, size: 52, opacity: [[R32a - 10, 0], [R32a + 8, 1], [R42a, 1], [R42a + 8, 0]] }}
      moon={MOON}
    >
      {(w) => <BodyNotes w={w} />}
    </AltitudeAscent>
  );
};

// ---- twist 1: the ribbon over 176 fields, folded 13 times ----
const FIELDS = 176;
const RIBBON_YD = 17600;
const FCY = SAFE_RECT.y + SAFE_RECT.h * 0.55; // row view clear of the counter and the caption lane
const FOLD_K: Key[] = foldSteps(RF0, 0, 13, 3, 3);
const ROW_H = SAFE_RECT.h * 0.66;
const P_FULL = ROW_H / FIELDS;
const GHOST = F(T(13, 2)) - 6; // "10 miles": pull back again over the whole row, a ghost of the ribbon that was used
const fieldCam = (f: number) => {
  const n = kf(f, FOLD_K, 0);
  if (f >= RF0) {
    const len = FIELDS / 2 ** n;
    const target = ROW_H + (160 - ROW_H) * (n / 13);
    const settle = kf(f, [[RF1, 1], [GHOST, 1.3, 'inOut']], 1); // slow push-in on the finished block
    const Pb = Math.max(P_FULL, target / len) * settle;
    const g = kf(f, [[GHOST, 0], [GHOST + 34, 1, 'inOut']], 0);
    return { P: 10 ** (lg(Pb) + (lg(P_FULL) - lg(Pb)) * g), C: FIELDS / 2 };
  }
  const z = kf(f, [[PULL0, 0], [PULL1, 1, 'inOut']], 0);
  const C0 = kf(f, [[TW0, 2], [PULL0, 6, 'linear']], 2);
  return { P: 10 ** (lg(520) + (lg(P_FULL) - lg(520)) * z), C: C0 + (FIELDS / 2 - C0) * z };
};
// the finished block's size on screen at the hand-off to the bars (same math as FieldRibbon)
const BLOCK = (() => {
  const P = fieldCam(B0).P;
  return { h: (FIELDS / 2 ** 13) * P, w: Math.max(8, (4.5 / 36 / 100) * P) * (1 + Math.min(1.6, 13 * 0.12)) };
})();
const Fields: React.FC = () => {
  const f = useCurrentFrame();
  const { P, C } = fieldCam(f);
  const rowTop = FCY - C * P;
  const rowBot = FCY + (FIELDS - C) * P;
  return (
    <>
      <FieldRibbon cy={FCY} fields={FIELDS} fieldPx={P} center={C} ribbonYd={RIBBON_YD} folds={FOLD_K} ribbonMinPx={8} rowMinPx={30} />
      <Fade op={0.4 * win(f, GHOST + 4, B0, 24, 10)}>
        <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <line x1={CX} x2={CX} y1={rowTop} y2={rowBot} stroke={PALETTE.ivory} strokeWidth={6} strokeDasharray="14 10" />
        </svg>
      </Fade>
      <Fade op={win(f, PULL1 - 24, RF0)}>
        <ScaleBar vertical x1={Math.max(SAFE_RECT.y, rowTop)} x2={Math.min(SAFE_RECT.y + SAFE_RECT.h, rowBot)} y={CX + 30}
          label="10 MILES" value="≈ 176 FOOTBALL FIELDS" at={PULL1 - 24} />
      </Fade>
      <Fade op={win(f, RF1 + 6, B0)}>
        <DataLabel x={CX + 40} y={FCY + Math.max(40, (FIELDS / 2 ** kf(f, FOLD_K, 0)) * P / 2 + 36)} align="left" label="ST. MARK'S · MIT · 2011" value="13 folds" accent at={RF1 + 6} />
      </Fade>
    </>
  );
};

// ---- twist 2: three bars, log scale (length ∝ folds = doublings from 0.1 mm) ----
const BX = SAFE_RECT.x + 50;
const BW = SAFE_RECT.w - 100;
const BY = [SAFE_RECT.y + SAFE_RECT.h * 0.27, SAFE_RECT.y + SAFE_RECT.h * 0.46, SAFE_RECT.y + SAFE_RECT.h * 0.65];
const BAR_C = 59; // bar centerline below a ComparisonBars block's top (label + gap + half the bar)
const Bars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', right: CANVAS.W - (BX + BW), top: BY[0] - 60, ...TYPE.annotation, color: PALETTE.sciText, opacity: ramp(f, B0 + 20, 12) * 0.9 }}>LOG SCALE</div>
      <ComparisonBars bars={[{ label: 'MOON', value: 42, unit: ' folds' }]} x={BX} y={BY[0]} width={BW} max={103} at={B0 + 14} />
      <ComparisonBars bars={[{ label: 'SUN', value: 51, unit: ' folds' }]} x={BX} y={BY[1]} width={BW} max={103} at={SUN - 50} />
      <ComparisonBars bars={[{ label: 'OBSERVABLE UNIVERSE', value: 103, unit: ' folds', hero: true }]} x={BX} y={BY[2]} width={BW} max={103} at={UNI - 50} />
      <Fade op={ramp(f, UNI + 8, 10)}>
        <DataLabel x={BX} y={BY[2] + 175} label="ACROSS" value="93 billion light-years" size={48} at={UNI + 8} />
      </Fade>
    </>
  );
};

// ---- loop: the camera comes back down to the sheet on the ground (= frame 0) ----
const LOOP_S0: Key[] = [[LP0, -1.4], [LAST - 4, -3.3, 'inOut']];
const LoopWorld: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AltitudeAscent logScale={scaleKeys(f, 0, LOOP_S0, 3)} groundY={GYW} x={CX} n={0} stack={{ pitch: 0.15, animate: 0, minWidth: 5 }} />
  );
};

// ---- the fold counter (the reference object, constant through the short) ----
const ODO_K: Key[] = [
  ...N_K, [TW0, 42], [TW0 + 20, 0, 'inOut'], ...FOLD_K,
  [B0, 13], [SUN, 51, 'inOut'], [F(T(16, 0)) - 6, 51], [UNI, 103, 'inOut'],
  [LP0, 103], [LP0 + 34, 0, 'inOut'],
];
const ODO_SCALE: Keys = [[RW0, 1], [RW1, 0.72, 'inOut'], [LP0, 0.72], [LAST - 8, 1, 'inOut']];
const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const s = kf(f, ODO_SCALE, 1);
  const assume = win(f, RW1 + 6, R14);
  return (
    <div style={{ position: 'absolute', left: 0, top: ODO_Y, width: CANVAS.W, transform: `scale(${s})`, transformOrigin: `${CX}px 0px` }}>
      <OdometerNumber value={ODO_K} digits={3} x={CX} y={0} size={ODO_SIZE} align="center" color="gold" />
      <div style={{ position: 'absolute', left: 0, width: CANVAS.W, top: ODO_SIZE * 1.02, textAlign: 'center', ...TYPE.subject, fontSize: 64, color: PALETTE.ivory }}>folds</div>
      {assume > 0.001 && (
        <div style={{ position: 'absolute', left: 0, width: CANVAS.W, top: ODO_SIZE * 1.02 + 92, textAlign: 'center', ...TYPE.annotation, fontSize: 30, color: PALETTE.sciText, opacity: assume }}>
          ASSUMES 0.1 MM PAPER
        </div>
      )}
    </div>
  );
};

const KEYS: Record<number, string[]> = { 0: ['Moon'], 1: ['doubles'], 4: ['height'], 5: ['building'], 6: ['space'], 7: ['Station'], 8: ['Moon'], 12: ['13'], 13: ['toilet'], 15: ['Sun'], 16: ['universe'] };

export const FoldPaperToTheMoon: React.FC = () => {
  const f = useCurrentFrame();
  const lines: CaptionLine[] = React.useMemo(() => VO.map((l, i) => ({ ...l, keywords: KEYS[i] ?? [] })), []);
  const colTop = GYW - 680; // the column's tip in the Moon frame (fill 680)
  return (
    <Grain>
      <AbsoluteFill style={{ background: PALETTE.space }}>
        <Camera drift={8} driftPeriod={10} driftAmp={[[0, 0], [F(3), 1], [LP0, 1], [LAST - 16, 0, 'inOut']]}
          punches={[MOON2, UNI]}
          blur={[[F(0.7), F(2.4)], [RW0 + 2, RW1 - 2], [R42a, R42a + 26]]}
          zoom={[[FOLD1, 1], [SP, 1.07, 'inOut'], [ASC0, 1, 'inOut'], [R30b, 1], [R42a, 1.05, 'inOut'], [R42b, 1, 'out']]}
          origin={[CX, GYM]}>
          <CameraLayer>
          {f < TW0 + 16 && <Fade op={1 - ramp(f, TW0, 14)}><World /></Fade>}
          {f >= TW0 && f < B0 + 16 && <Fade op={Math.min(ramp(f, TW0 + 2, 12), 1 - ramp(f, B0, 14))}><Fields /></Fade>}
          {f >= B0 && f < LP0 + 16 && <Fade op={Math.min(ramp(f, B0 + 8, 10), 1 - ramp(f, LP0, 14))}><Bars /></Fade>}
          {f >= LP0 && <Fade op={ramp(f, LP0 + 6, 22)}><LoopWorld /></Fade>}
          {/* shape match cuts: column → ribbon, block → the first bar, the gold bar → the sheet */}
          <ShapeMatch color="gold" glow={14}
            keys={[{ g: lineGeom(CX, colTop, CX, GYW, 5), at: TW0 }, { g: lineGeom(CX, -20, CX, CANVAS.H + 20, 10), at: TW0, len: 16 }]}
            opacity={[[TW0 - 2, 0], [TW0 + 2, 1], [TW0 + 16, 1], [TW0 + 26, 0]]} />
          <ShapeMatch color="ivory" glow={10}
            keys={[{ g: lineGeom(CX, FCY - BLOCK.h / 2, CX, FCY + BLOCK.h / 2, BLOCK.w), at: B0 }, { g: barGeom(BX, BY[0] + BAR_C, 26, 26), at: B0, len: 14 }]}
            opacity={[[B0 - 2, 0], [B0 + 2, 1], [B0 + 14, 1], [B0 + 22, 0]]} />
          <ShapeMatch color="gold" glow={12}
            keys={[{ g: barGeom(BX, BY[2] + BAR_C, BW, 26), at: LP0 }, { g: lineGeom(CX - 210, GYW - 6, CX + 210, GYW - 6, 12), at: LP0, len: 20 }]}
            opacity={[[LP0 - 2, 0], [LP0 + 2, 1], [LP0 + 20, 1], [LP0 + 32, 0]]} />
            <SheetBar />
          </CameraLayer>
        </Camera>
        <Counter />
        <Fade op={win(f, MOON2 - 6, TW0 - 6)}>
          <div style={{ position: 'absolute', left: 0, width: CANVAS.W, top: HERO_Y - 44, textAlign: 'center', ...TYPE.label, color: PALETTE.sciText, opacity: ramp(f, MOON2 - 6, 12) }}>AFTER 42 FOLDS</div>
          <HeroNumber value={273000} grouping subject="miles" x={CX} y={HERO_Y} scale={0.6} at={MOON2 - 6} />
        </Fade>
        <div style={{ position: 'absolute', inset: 0, textShadow: SKY_TEXT_SHADOW }}>
          <KeywordCaptions lines={lines} maxChars={18} />
        </div>
      </AbsoluteFill>
    </Grain>
  );
};

export default FoldPaperToTheMoon;
