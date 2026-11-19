import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CANVAS, GROUND, PALETTE, SAFE_RECT, SKY_TEXT_SHADOW, TYPE } from '../../brand';
import {
  AngleCone, Camera, circleGeom, coneDisc, DataLabel, Eclipse, FlowPaths, FlyThrough, GlowingBody, Grain, groundYAt, GroundScene,
  HeroNumber, Horizon, kf, KeywordCaptions, LightFlow, KineticTitle, Marker, Observer, OdometerNumber, Planet, ramp, ScaleBar, ShapeMatch,
  SkyBody, SkyView, Starfield, WhipTransition, whipTiming,
} from '../../components';
import type { CaptionLine, HorizonLayer, SkyPlanet } from '../../components';
import type { Keys } from '../../components/anim';
import { mix as mixColor } from '../../components/color';
import { eclipseState, skyToScreen, sunRadiusPx } from '../../lib/groundSky';
import { DURATION_S, VO } from './vo.gen';

// "The Sun Is 400 Moons Wide. That's Why Eclipses Exist" — shorts/sun-moon-400/guion.md. Brand v2.5.
// VOICE-FIRST: every cue below is read from the real word times in vo.gen.ts (no guessed seconds).
// No <Sequence>s: every scene runs on GLOBAL frames, mounted only inside its window.
// Ground scenes: TELEPHOTO, the frame ≈ 6° tall (fov 3.375° across), so the Sun and Moon are ~170 px,
// true to each other and to the horizon (a ridge ~560 m away, real tree and human heights). Sky COLORS
// are spread as in a ~40° frame (SkyView colorFov): blue overhead, glow along the ridge (stylization of
// color only; sizes stay true). One ridge, one observer, one Sun position in every ground scene, so the
// moonrise → diagram → eclipse → future → loop read as the same place.
// Layout from SAFE_RECT (16:9-ready): no literal y positions.

const FPS = CANVAS.FPS;
const F = (s: number) => Math.round(s * FPS);
const T = (line: number, word: number) => VO[line].words![word].start; // spoken start of a word, s
const LAST = Math.round(DURATION_S * FPS) - 1;

// durationInSeconds = DURATION_S in vo.gen.ts (literal: gen-registry reads numbers only).
export const compositionConfig = { id: 'SunMoon400', durationInSeconds: 53.167, fps: 30, width: 1080, height: 1920 };

// ---- layout ----
const CX = SAFE_RECT.x + SAFE_RECT.w / 2; // 480
const HYG = SAFE_RECT.y + SAFE_RECT.h * 0.95; // ground-scene horizon, low: sky fills the frame, captions sit on the ridge
const FOV = (6 * CANVAS.W) / CANVAS.H; // 3.375° across = 6° tall
const COLOR_FOV = 40;
const VIEW = { fov: FOV, horizonY: HYG };
const PXDEG = CANVAS.W / FOV;
const SUN_AZ = (CX - CANVAS.W / 2) / PXDEG;
const SUN_EL = (HYG - (SAFE_RECT.y + SAFE_RECT.h * 0.36)) / PXDEG; // ≈ 2.3° above the horizon (a low eclipse: honest in a 6° frame)
const [SX, SY] = skyToScreen(SUN_AZ, SUN_EL, VIEW);
const SR = sunRadiusPx(FOV); // ≈ 85 px
const RIDGE: HorizonLayer[] = [
  { variant: 'hills', distance: 3200, height: 45, seed: 3 },
  { variant: 'hills', distance: 560, height: 6.5, seed: 7, treeX: [-15.5, 8.6, 10.3], treeHeight: 6 }, // ~6 m trees, 1 m ≈ 33 px
];
const OX = SAFE_RECT.x + 130;
const OY = groundYAt(OX, HYG, { layers: RIDGE, fov: FOV }) + 2;
const OH = ((1.7 / 560) * 180 / Math.PI) * PXDEG; // a 1.7 m person 560 m away ≈ 56 px
const sky = (daz: number, del: number) => ({ az: SUN_AZ + daz, el: SUN_EL + del });
const VENUS = sky(1.15, 0.7);

// ---- timing (from the voice) ----
const WHIP1 = F(T(1, 8)) - whipTiming(0, 8).swap; // swap on "same"
const WHIP2 = F(T(11, 0)) - whipTiming(0, 8).swap; // swap on "But"
const COVERS = T(7, 9);

// ---- small helpers ----
const Fade: React.FC<{ op: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ op, children, style }) =>
  op <= 0.001 ? null : <AbsoluteFill style={{ opacity: Math.min(1, op), ...style }}>{children}</AbsoluteFill>;
// a slow push-in inside one scene, about a fixed point (so that point, e.g. the observer, never moves)
const pushAt = (f: number, k: Keys) => kf(f, k, 1);
const Push: React.FC<{ s: number; o: [number, number]; children: React.ReactNode }> = ({ s, o, children }) => (
  <div style={{ position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: `${o[0]}px ${o[1]}px` }}>{children}</div>
);
const pushed = (p: [number, number], o: [number, number], s: number): [number, number] => [o[0] + (p[0] - o[0]) * s, o[1] + (p[1] - o[1]) * s];
const win = (f: number, a: number, b: number, inLen = 12, outLen = 12) => Math.min(ramp(f, a, inLen), 1 - ramp(f, b, outLen));
const Tag: React.FC<{ x: number; y: number; children: React.ReactNode; op?: number }> = ({ x, y, children, op = 1 }) => (
  <div style={{ position: 'absolute', right: CANVAS.W - x, top: y, ...TYPE.annotation, fontSize: 22, color: PALETTE.sciText, opacity: op }}>{children}</div>
);

// ---- the ground eclipse (hook, reveal step 3, future, loop) ----
type GroundProps = { sep: Keys; moonScale: number; mix: number; corona: Keys; planets?: SkyPlanet[]; look?: Keys };
const Ground: React.FC<GroundProps> = ({ sep, moonScale, mix, corona, planets = [], look = 8 }) => (
  <AbsoluteFill>
    <SkyView sky="day" to="eclipse" mix={mix} fov={FOV} horizonY={HYG} colorFov={COLOR_FOV} stars={0} planets={planets} />
    <Eclipse x={SX} y={SY} r={SR} sep={sep} angle={0} moonScale={moonScale} corona={corona} />
    <Horizon layers={RIDGE} fov={FOV} horizonY={HYG} sky="day" to="eclipse" mix={mix} />
    <Observer x={OX} y={OY} h={OH} look={look} facing="right" />
  </AbsoluteFill>
);
const HOOK_GROUND = <Ground sep={0} moonScale={1.03} mix={1} corona={1} planets={[{ ...VENUS, on: -1000 }]} />;

// ---- beat 1: the Sun in space, the Moon a ringed dot at true relative size ----
const SPACE_SUN = { x: CX, y: SAFE_RECT.y + SAFE_RECT.h * 0.55, r: SAFE_RECT.w * 0.3 };
const MOON_DOT = { x: SPACE_SUN.x + SPACE_SUN.r + 90, y: SPACE_SUN.y };
const SM1 = F(T(1, 0)) - 7; // shape match: space Sun → setting Sun
const Space: React.FC = () => {
  const f = useCurrentFrame();
  const sunOp = 1 - ramp(f, SM1 + 2, 4);
  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <Starfield count={260} seed={11} avoid={[[SPACE_SUN.x, SPACE_SUN.y, SPACE_SUN.r * 1.7]]} />
      {sunOp > 0 && <div style={{ opacity: sunOp }}><GlowingBody x={SPACE_SUN.x} y={SPACE_SUN.y} r={SPACE_SUN.r} kind="sun" warm /></div>}
      <Planet x={MOON_DOT.x} y={MOON_DOT.y} r={4} kind="moon" phase={1} warm />
      <Marker x={MOON_DOT.x} y={MOON_DOT.y} ringR={14} label="MOON ×1" side="above" length={70} at={F(T(0, 3)) + 6} />
      <ScaleBar x1={SPACE_SUN.x - SPACE_SUN.r} x2={SPACE_SUN.x + SPACE_SUN.r} y={SPACE_SUN.y + SPACE_SUN.r + 70} label="400 × MOON'S WIDTH" at={F(T(0, 3)) - 2} />
      <HeroNumber value={400} count={false} subject="Moons wide" label="SUN'S DIAMETER" x={CX} y={SAFE_RECT.y + 10} at={F(T(0, 3)) - 6} />
    </AbsoluteFill>
  );
};

// ---- beat 2: sunset on the sea, whip, full Moon over the ridge ----
const SUNSET_EL: Keys = [[SM1, 0.62], [WHIP1 + 10, 0.52]];
const SUNSET_Y = skyToScreen(SUN_AZ, 0.62, VIEW)[1];
const Sunset: React.FC = () => (
  <AbsoluteFill>
    <GroundScene preset="sunsetSea" horizonY={HYG} fov={FOV} az={SUN_AZ} el={SUNSET_EL} colorFov={COLOR_FOV} />
    <DataLabel x={SX + SR + 40} y={SUNSET_Y - 150} label="SUN" value="½°" at={SM1 + 18} />
  </AbsoluteFill>
);
const MOON_EL: Keys = [[WHIP1, 0.62], [F(T(4, 0)) + 6, 1.3]];
const HALF_AT = F(T(2, 2)) - 6;
const OBS: [number, number] = [OX, OY];
const MOONRISE_PUSH: Keys = [[WHIP1 + 8, 1], [F(T(4, 0)), 1.08, 'inOut']];
const Moonrise: React.FC = () => {
  const f = useCurrentFrame();
  const dim = 0.42 * win(f, F(T(3, 0)) - 6, F(T(4, 0)) - 8, 10, 10);
  const heroOp = 1 - ramp(f, F(T(3, 0)) - 12, 8);
  return (
    <AbsoluteFill>
      <Push s={pushAt(f, MOONRISE_PUSH)} o={OBS}>
        <SkyView sky="twilight" fov={FOV} horizonY={HYG} colorFov={COLOR_FOV} stars={0} />
        <SkyBody kind="moon" az={SUN_AZ} el={MOON_EL} fov={FOV} horizonY={HYG} phase={1} />
        <Horizon layers={RIDGE} fov={FOV} horizonY={HYG} sky="twilight" />
        <Observer x={OX} y={OY} h={OH} look={[[WHIP1, 3], [F(T(4, 0)), 6]]} facing="right" />
      </Push>
      <DataLabel x={SX + SR + 40} y={HYG - 1.0 * PXDEG - 40} label="MOON" value="½°" at={WHIP1 + 14} />
      {heroOp > 0 && (
        <div style={{ opacity: heroOp }}>
          <HeroNumber display="½" value={0.5} count={false} unit="degree" subject="each" label="AS SEEN FROM EARTH" x={CX} y={SAFE_RECT.y + 10} at={HALF_AT} />
        </div>
      )}
      {dim > 0 && <AbsoluteFill style={{ background: PALETTE.space, opacity: dim }} />}
    </AbsoluteFill>
  );
};

// ---- beat 4, steps 1–2: the side-view diagram (NOT TO SCALE) ----
const EYE: [number, number] = [OX + OH * 0.1, OY - OH * 0.93];
const TOWARD: [number, number] = [SAFE_RECT.x + SAFE_RECT.w - 250, SAFE_RECT.y + SAFE_RECT.h * 0.24];
const HALF = 12; // exaggerated (true 0.26°): diagram, labeled NOT TO SCALE
const D_SUN = Math.hypot(TOWARD[0] - EYE[0], TOWARD[1] - EYE[1]);
const D_MOON = D_SUN * 0.43;
const DS = coneDisc(EYE, TOWARD, HALF, D_SUN);
const DM = coneDisc(EYE, TOWARD, HALF, D_MOON);
const DIAG_IN = F(T(4, 0)) - 2;
// the two sight lines, from where they touch the Sun down to the eye: light flows along them
// (edges ±1 graze both discs and reach the eye; interior rays leave the whole disc and stop on the Moon)
const CONE_EDGES: [number, number][][] = [-1, 1, -0.5, 0, 0.5].map((sg) => {
  const a = Math.atan2(TOWARD[1] - EYE[1], TOWARD[0] - EYE[0]) + (sg * HALF * Math.PI) / 180;
  const dT = Math.abs(sg) === 1 ? D_SUN * Math.cos((HALF * Math.PI) / 180) : (() => { const th = (Math.abs(sg) * HALF * Math.PI) / 180; return D_SUN * Math.cos(th) - Math.sqrt(Math.max(0, DS.r * DS.r - (D_SUN * Math.sin(th)) ** 2)); })() /* where the ray leaves the Sun's near limb */;
  // interior rays end on the Moon's sunward limb: the Moon blocks them (only the edges reach the eye)
  const th = (Math.abs(sg) * HALF * Math.PI) / 180;
  const dEnd = Math.abs(sg) === 1 ? 10 : D_MOON * Math.cos(th) + Math.sqrt(Math.max(0, DM.r * DM.r - (D_MOON * Math.sin(th)) ** 2));
  return [[EYE[0] + Math.cos(a) * dT, EYE[1] + Math.sin(a) * dT], [EYE[0] + Math.cos(a) * dEnd, EYE[1] + Math.sin(a) * dEnd]];
});
const CARRY = F(T(6, 2)) + 4; // diagram → ground (the observer stays)
const Diagram: React.FC = () => {
  const f = useCurrentFrame();
  const lift = ramp(f, CARRY, 18);
  const obsColor = mixColor(GROUND.land, PALETTE.sciText, ramp(f, DIAG_IN + 6, 18) * (1 - lift));
  const R = 2600;
  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <Starfield count={140} seed={21} avoid={[[DS.x, DS.y, DS.r * 1.8], [DM.x, DM.y, DM.r * 1.4]]} />
      <Push s={pushAt(f, [[DIAG_IN + 10, 1], [CARRY, 1.05, 'inOut'], [CARRY + 18, 1, 'inOut']])} o={OBS}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-260 * lift}px)`, opacity: 1 - lift }}>
        <div style={{ position: 'absolute', inset: 0, opacity: ramp(f, DIAG_IN + 4, 12) }}><GlowingBody x={DS.x} y={DS.y} r={DS.r} kind="sun" warm /></div>
        <div style={{ position: 'absolute', inset: 0, opacity: ramp(f, DIAG_IN + 10, 6) }}><Planet x={DM.x} y={DM.y} r={DM.r} kind="moon" phase={1} warm /></div>
        <AngleCone eye={EYE} toward={TOWARD} halfAngle={HALF} reach={D_SUN + 70} drawAt={DIAG_IN + 12} drawLen={30}
          ghost={{ from: D_SUN, to: D_MOON, at: F(T(5, 4)) - 6, len: 40 }} />
        {CONE_EDGES.map((pts, i) => (
          <LightFlow key={i} points={pts} at={DIAG_IN + 28 + i * 5} until={CARRY - 10} period={i < 2 ? 12 : 16} travel={i < 2 ? 26 : 13}
            length={150} width={i < 2 ? 6 : 4.5} opacity={i < 2 ? 1 : 0.75} />
        ))}
      </div>
      {/* a thin arc of Earth under the observer */}
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={OX} cy={OY + R} r={R} fill="#0d1220" stroke={PALETTE.sciLine} strokeWidth={2} opacity={0.9 * (1 - lift)} />
      </svg>
      <Observer x={OX} y={OY} h={OH} look={[[DIAG_IN, 6], [DIAG_IN + 30, 40]]} facing="right" color={obsColor} />
      </Push>
      {/* labels stay out of the push-in (they never leave the safe rectangle) */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-260 * lift}px)`, opacity: 1 - lift }}>
        <DataLabel x={SAFE_RECT.x + 10} y={SAFE_RECT.y + SAFE_RECT.h * 0.3} label="DISTANCE" value="400 × farther" accent at={F(T(4, 8)) - 4} />
        <DataLabel x={SAFE_RECT.x + 10} y={SAFE_RECT.y + 20} label="DIAMETER" value="400 × wider" accent at={F(T(5, 2)) - 4} />
        <Tag x={SAFE_RECT.x + SAFE_RECT.w} y={SAFE_RECT.y + SAFE_RECT.h * 0.78} op={ramp(f, DIAG_IN + 20, 10)}>NOT TO SCALE</Tag>
      </div>
    </AbsoluteFill>
  );
};

// ---- beat 4, step 3: the eclipse from the ground ----
const STEP3_SEP: Keys = [[CARRY, 2.1], [F(COVERS) - 30, 0.09], [F(COVERS) - 14, 0.045], [F(COVERS) - 6, 0.026], [F(COVERS), 0]];
const STEP3_CORONA: Keys = [[F(COVERS) - 2, 0], [F(COVERS) + 60, 0.65], [F(T(9, 1)), 1]];
const STEP3_PLANETS: SkyPlanet[] = [
  { ...VENUS, on: F(T(10, 1)) },
  { ...sky(-1.25, 1.1), on: F(T(10, 2)), r: 2.8 }, // Jupiter
  { ...sky(0.75, 1.3), on: F(T(10, 3)), star: true },
  { ...sky(-1.35, -0.05), on: F(T(10, 4)) + 4, star: true },
  { ...sky(0.45, -0.85), on: F(T(10, 6)) + 4, star: true },
];
const Step3: React.FC = () => {
  const f = useCurrentFrame();
  const dark = eclipseState(kf(f, STEP3_SEP, 2.1), 1.03).darkness;
  return (
    <Push s={pushAt(f, [[CARRY + 18, 1], [F(COVERS), 1.04, 'inOut'], [WHIP2 + 4, 1.13]])} o={[SX, SY]}>
      <Ground sep={STEP3_SEP} moonScale={1.03} mix={dark} corona={STEP3_CORONA} planets={STEP3_PLANETS}
        look={[[CARRY, 6], [F(COVERS), 9], [F(T(9, 0)), 10], [F(T(10, 8)), 8]]} />
    </Push>
  );
};

// ---- beat 5: Earth and Moon at true scale and true distance ----
const EARTH = { x: SAFE_RECT.x + 90, y: SAFE_RECT.y + SAFE_RECT.h - 180 };
const MOON0 = { x: SAFE_RECT.x + SAFE_RECT.w - 100, y: SAFE_RECT.y + SAFE_RECT.h * 0.4 };
const EM_PUSH: Keys = [[WHIP2 + 10, 1], [F(T(13, 8)) - 2, 1.06, 'inOut']]; // until the shape match (SM3)
const EM_O: [number, number] = [CX, SAFE_RECT.y + SAFE_RECT.h / 2];
const EM_D = Math.hypot(MOON0.x - EARTH.x, MOON0.y - EARTH.y);
const ER = EM_D / (2 * (384400 / 12742)); // ~30 Earth diameters apart
const MR = Math.max(4, ER * (3475 / 12742));
const DRIFT = 23000 / 384400; // ≈ 6 %
const MOON1 = { x: MOON0.x + (MOON0.x - EARTH.x) * DRIFT, y: MOON0.y + (MOON0.y - EARTH.y) * DRIFT };
const ODO_AT = F(T(13, 1)) - 2;
const SM3 = F(T(13, 8)) - 2; // shape match: the Moon's ring → the annular ring
const EarthMoon: React.FC = () => {
  const f = useCurrentFrame();
  const k = kf(f, [[ODO_AT + 4, 0], [ODO_AT + 70, 1, 'inOut']], 0);
  const mx = MOON0.x + (MOON1.x - MOON0.x) * k, my = MOON0.y + (MOON1.y - MOON0.y) * k;
  const ux = (MOON0.x - EARTH.x) / EM_D, uy = (MOON0.y - EARTH.y) / EM_D;
  const nx = -uy * 9, ny = ux * 9; // the return beam runs beside the outgoing one
  const heroOp = 1 - ramp(f, ODO_AT - 10, 8);
  const odoOp = ramp(f, ODO_AT - 2, 8);
  const laserOp = 1 - ramp(f, ODO_AT + 10, 10);
  const trueOp = 1 - ramp(f, F(T(12, 0)) + 30, 10);
  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <Push s={pushAt(f, EM_PUSH)} o={EM_O}>
      <Starfield count={220} seed={33} avoid={[[EARTH.x, EARTH.y, 40]]} clear={[[SAFE_RECT.x, SAFE_RECT.y, SAFE_RECT.w, 330]]} />
      <Planet x={EARTH.x} y={EARTH.y} r={ER} kind="earth" warm />
      {k > 0 && (
        <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx={MOON0.x} cy={MOON0.y} r={MR + 2} fill="none" stroke={PALETTE.sciText} strokeWidth={2} strokeDasharray="4 5" opacity={0.6 * Math.min(1, k * 4)} />
        </svg>
      )}
      <Planet x={mx} y={my} r={MR} kind="moon" phase={1} warm />
      <Marker x={mx} y={my} ringR={14} label="MOON" side="below" length={60} warm />
      <FlowPaths paths={[
        { points: [[EARTH.x + ux * (ER + 4), EARTH.y + uy * (ER + 4)], [mx - ux * 16, my - uy * 16]], kind: 'sci', at: F(T(12, 0)) - 2, len: 12, arrow: true, fadeAt: ODO_AT + 6 },
        { points: [[mx - ux * 16 + nx, my - uy * 16 + ny], [EARTH.x + ux * (ER + 6) + nx, EARTH.y + uy * (ER + 6) + ny]], kind: 'sci', at: F(T(12, 0)) + 12, len: 12, arrow: true, fadeAt: ODO_AT + 6 },
      ]} />
      <LightFlow points={[[EARTH.x + ux * (ER + 4), EARTH.y + uy * (ER + 4)], [mx - ux * 8, my - uy * 8]]} at={F(T(12, 0)) + 2}
        until={SM3 - 24} period={16} travel={18} back length={120} width={5} color={PALETTE.sci} />
      {heroOp > 0 && (
        <div style={{ opacity: heroOp }}>
          <HeroNumber value={1.5} count={false} unit="inches" subject="per year" label="MOON DRIFTING AWAY" x={CX} y={SAFE_RECT.y + 10} at={F(T(12, 7)) - 6} />
        </div>
      )}
      </Push>
      {trueOp > 0 && <div style={{ opacity: trueOp }}>
        <DataLabel x={SAFE_RECT.x + SAFE_RECT.w} y={SAFE_RECT.y + SAFE_RECT.h * 0.7} align="right" label="TRUE SCALE" value="30 Earths apart" at={WHIP2 + 10} />
      </div>}
      {laserOp > 0 && <div style={{ opacity: laserOp }}>
        <DataLabel x={SAFE_RECT.x + SAFE_RECT.w} y={SAFE_RECT.y + SAFE_RECT.h * 0.7} align="right" label="LASER RANGING" value="3.8 cm a year" at={F(T(12, 0)) + 36} />
      </div>}
      <DataLabel x={SAFE_RECT.x + SAFE_RECT.w} y={SAFE_RECT.y + SAFE_RECT.h * 0.7} align="right" label="IN 600 MILLION YEARS" value="≈ 23,000 km farther" at={ODO_AT + 18} />
      {odoOp > 0 && (
        <div style={{ opacity: odoOp }}>
          <div style={{ position: 'absolute', left: SAFE_RECT.x, width: SAFE_RECT.w, top: SAFE_RECT.y + 10, textAlign: 'center', ...TYPE.label, color: PALETTE.sciText }}>FROM NOW</div>
          <OdometerNumber value={[[ODO_AT, 0], [ODO_AT + 34, 600, 'out']]} digits={3} x={CX} y={SAFE_RECT.y + 50} size={150} align="center" />
          <div style={{ position: 'absolute', left: SAFE_RECT.x, width: SAFE_RECT.w, top: SAFE_RECT.y + 225, textAlign: 'center', ...TYPE.numberUnit, color: PALETTE.gold }}>million years</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---- beat 5 step c + beat 6: the future annular, then time runs back into the hook frame ----
const FUT_IN = SM3 + 6;
const LOOP_AT = F(T(15, 0));
const FutureLabelGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <Fade op={1 - ramp(f, LOOP_AT - 4, 12)}>{children}</Fade>;
};

const KEYS: string[][] = [['Moons'], ['same'], ['degree'], ['possible'], ['farther'], [], ['cancel'], ['covers'], [], ['corona'], ['daytime'], ['last'], ['drifting'], ['small'], ['eclipses'], ['fits']];

export const SunMoon400: React.FC = () => {
  const f = useCurrentFrame();
  const lines: CaptionLine[] = React.useMemo(() => VO.map((l, i) => ({ ...l, keywords: KEYS[i] ?? [] })), []);
  const kinetic = [
    [{ w: 'How', start: T(3, 0) }, { w: 'is', start: T(3, 1) }, { w: 'that', start: T(3, 2) }],
    [{ w: 'possible?', start: T(3, 3), gold: true }],
  ];
  const sm2From = pushed(skyToScreen(SUN_AZ, kf(DIAG_IN, MOON_EL, 0), VIEW), OBS, pushAt(DIAG_IN, MOONRISE_PUSH));
  const sm3From = pushed([MOON1.x, MOON1.y], EM_O, pushAt(SM3, EM_PUSH));
  return (
    <Grain>
      <AbsoluteFill style={{ background: PALETTE.space }}>
        <Camera drift={8} driftPeriod={10} driftAmp={[[0, 0], [F(3), 1], [LOOP_AT + 10, 1], [LAST - 20, 0, 'inOut']]}
          zoom={[[0, 1], [FUT_IN, 1], [LOOP_AT, 1.035, 'inOut'], [LAST - 16, 1, 'inOut']]}
          punches={[F(COVERS), F(T(14, 3))]}>
          {/* hook: ground totality → fly-through into the Moon's disc → the Sun in space */}
          {f < SM1 + 22 && (
            <Fade op={1 - ramp(f, SM1 + 2, 14)}>
              <FlyThrough from={HOOK_GROUND} to={<Space />} at={10} len={26} x={SX} y={SY} hole={SR * 1.03} />
            </Fade>
          )}
          {/* setup: sunset → whip → moonrise; quiz over it */}
          {f >= SM1 && f < DIAG_IN + 16 && (
            <Fade op={Math.min(ramp(f, SM1 + 2, 16), 1 - ramp(f, DIAG_IN, 14))}>
              <WhipTransition at={WHIP1} dur={8} direction="right" from={<Sunset />} to={<Moonrise />} />
            </Fade>
          )}
          {/* reveal steps 1–2 */}
          {f >= DIAG_IN - 2 && f < CARRY + 22 && (
            <Fade op={ramp(f, DIAG_IN, 14)}><Diagram /></Fade>
          )}
          {/* reveal step 3 → whip up → twist in space */}
          {f >= CARRY && f < FUT_IN + 16 && (
            <Fade op={ramp(f, CARRY, 18)}>
              <WhipTransition at={WHIP2} dur={8} direction="down" from={<Step3 />}
                to={<Fade op={1 - ramp(f, FUT_IN, 14)}><EarthMoon /></Fade>} />
            </Fade>
          )}
          {/* the future annular → loop into the hook frame */}
          {f >= FUT_IN && (
            <Fade op={ramp(f, FUT_IN, 14)}>
              <Ground sep={0} moonScale={kf(f, [[LOOP_AT + 4, 0.94], [LOOP_AT + 40, 1.03, 'inOut']], 0.94)}
                mix={kf(f, [[LOOP_AT + 4, 0.22], [LOOP_AT + 44, 1, 'inOut']], 0.22)}
                corona={[[LOOP_AT + 34, 0], [LAST - 12, 1]]} planets={[{ ...VENUS, on: F(T(15, 4)) - 4 }]} />
            </Fade>
          )}
          {/* hand-offs */}
          <ShapeMatch color="ivory" glow={22}
            keys={[{ g: circleGeom(SPACE_SUN.x, SPACE_SUN.y, SPACE_SUN.r), at: SM1 }, { g: circleGeom(SX, SUNSET_Y, SR), at: SM1, len: 20 }]}
            opacity={[[SM1, 0], [SM1 + 3, 1], [SM1 + 18, 1], [SM1 + 28, 0]]} />
          <ShapeMatch color="ivory" glow={14} alpha={0.85}
            keys={[{ g: circleGeom(sm2From[0], sm2From[1], SR * 0.97 * pushAt(DIAG_IN, MOONRISE_PUSH)), at: DIAG_IN }, { g: circleGeom(DM.x, DM.y, DM.r), at: DIAG_IN, len: 14 }]}
            opacity={[[DIAG_IN - 2, 0], [DIAG_IN + 2, 1], [DIAG_IN + 12, 1], [DIAG_IN + 18, 0]]} />
          <ShapeMatch color="gold" outline={3} glow={12}
            keys={[{ g: circleGeom(sm3From[0], sm3From[1], 14), at: SM3 }, { g: circleGeom(SX, SY, SR), at: SM3, len: 16 }]}
            opacity={[[SM3 - 2, 0], [SM3 + 2, 1], [SM3 + 16, 1], [SM3 + 30, 0]]} />
        </Camera>
        {/* annotation + title overlays stay out of the camera (they don't drift) */}
        {f >= F(T(3, 0)) - 4 && f < F(T(4, 0)) && (
          <KineticTitle lines={kinetic} top={SAFE_RECT.y + 40} x={CX} outAt={T(4, 0) - 0.3} />
        )}
        {f >= FUT_IN && f < LOOP_AT + 12 && (
          <FutureLabelGate>
            <DataLabel x={SAFE_RECT.x + 10} y={SAFE_RECT.y + 20} label="FROM NOW" value="600 million years" accent at={FUT_IN + 10} />
          </FutureLabelGate>
        )}
        <div style={{ position: 'absolute', inset: 0, textShadow: SKY_TEXT_SHADOW }}>
          <KeywordCaptions lines={lines} maxChars={18} />
        </div>
      </AbsoluteFill>
    </Grain>
  );
};

export default SunMoon400;
