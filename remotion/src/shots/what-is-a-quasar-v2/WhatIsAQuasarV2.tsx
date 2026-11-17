import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, PALETTE, QUASAR, TYPE } from '../../brand';
import {
  Balance, ComparisonBars, DataLabel, FlowPaths, Grain, HostGalaxy, InfallingGas, KeywordCaptions, KineticTitle, Marker, Meter,
  OrbitOverlay, ParallaxStars, Quasar, Timeline, keyNorm, linePath, quasarExposure, spiralPath,
} from '../../components';
import type { CaptionLine, FlowPath, KineticWord, Pt } from '../../components';
import { mix } from '../../components/color';
import type { VoLine } from '../../lib/shorts';
import { DURATION_S, VO } from './vo.gen';

// "What is a quasar?" v2 — shorts/what-is-a-quasar-v2/guion.md. Brand v2.1 (visual variety):
// the same voice as v1, but every claim gets its own picture. VOICE-FIRST: every cue is read from
// the real word times in vo.gen.ts.
//
// One persistent object (the quasar / black hole) is CARRIED through every scene, never cut:
//   hook pull-back → dive to the shadow (orbit overlay: the solar system inside its horizon) →
//   light paths ending at the shadow → bare black hole → gas spirals in, the disk forms → the disk
//   rises over the temperature bars → shrinks into the meter → becomes the point in the balance's
//   pan → grows back into the full quasar, jets ignite → pull-back to a point → the point tops
//   the timeline → fly-in back to frame 0's close-up (seamless loop).
// Every dial is an absolute keyframe track (log-space for scales), so the last frame lands on
// exactly frame 0's values.

const FPS = CANVAS.FPS;
export const TOTAL_FRAMES = Math.round(DURATION_S * FPS);
const QX = 480; // safe-rect center
const QY = 900;
const R = 72; // shadow radius at rest framing
const K0 = 5.5; // frame 0 close-up scale
const SIZE_MIN = (0.07 * 46) / R; // the distant point (twist)
const ZOOM = 5; // SETUP (b): the shadow at 5× (radius 360 px) so Earth's orbit is ≥ 6 px
const HORIZON = 1 / 2.6; // event horizon radius / shadow radius (shadow ≈ 2.6 Rs; NASA SVS 14335: "about twice")
const RS_AU_1E9 = 19.7; // event horizon radius of a 1-billion-Sun (nonspinning) black hole, AU (2.95 km/Msun)

// ---- cues (seconds), all from the voice ----
const wordIn = (line: VoLine, word: string) => {
  const w = line.words?.find((x) => keyNorm(x.w).startsWith(word.toLowerCase()));
  if (!w) throw new Error(`cue word "${word}" not in "${line.text}"`);
  return w.start;
};
const at = (line: number, word: string) => wordIn(VO[line], word);
const C = {
  brightest: at(0, 'brightest'),
  quasar: at(1, 'kway'),
  blackHole: at(2, 'black'),
  billionsSun: at(3, 'billions'),
  but: at(4, 'but'),
  give: at(4, 'give'),
  so: at(6, 'so'),
  shining: at(6, 'shining'),
  light: at(7, 'the'),
  falling: at(7, 'falling'),
  gas: at(8, 'gas'),
  down: at(8, 'down'),
  disk: at(9, 'disk'),
  heats: at(10, 'heats'),
  pound: at(11, 'pound'),
  fusion: at(11, 'fusion'),
  ten: at(12, 'ten'),
  feed: at(13, 'feed'),
  diskWord: at(13, 'disk'),
  galaxy: at(13, 'galaxy'),
  combined: at(14, 'combined'),
  some: at(15, 'some'),
  jets: at(15, 'jets'),
  almost: at(17, 'almost'),
  billions: at(17, 'billions'),
  they: at(18, 'they'),
  young: at(18, 'young'),
  fuel: at(19, 'fuel'),
  thirteen: at(21, 'thirteen'),
  earth: at(22, 'earth'),
  still: at(23, 'still'),
};
const LOOP = { t0: C.still - 0.12, t1: DURATION_S };
const GLIDE_BACK = { t0: C.still - 0.8, t1: C.still + 0.45 }; // the timeline's point returns to center

// per-line KEYWORD (guion.md)
const KEYS: Record<number, string[]> = {
  1: ['quasar'], 4: ['light'], 6: ['shining'], 9: ['disk'], 10: ['heats'], 12: ['ten'], 13: ['galaxy'],
  15: ['jets'], 17: ['billions'], 18: ['young'], 19: ['fuel'], 22: ['Earth'], 23: ['blazing'],
};

// ---- helpers ----
type Ease = (x: number) => number;
const S = (f: number) => f / FPS;
const F = (s: number) => Math.round(s * FPS);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const curve = (t: number, xs: number[], ys: number[], e: Ease = EASE.inOut) =>
  interpolate(t, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
// keyframe track: [time, value, easing INTO this key]; held before the first and after the last
type Key = [number, number, Ease?];
const track = (t: number, keys: Key[], log = false) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const u = (e ?? EASE.inOut)(clamp01((t - t0) / Math.max(1e-6, t1 - t0)));
      return log ? Math.exp(lerp(Math.log(v0), Math.log(v1), u)) : lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
};
const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0 ? null : <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
// on/off window: fades in over `inLen`, out over `outLen`
const win = (t: number, a: number, b: number, inLen = 0.4, outLen = 0.4) =>
  Math.min(curve(t, [a, a + inLen], [0, 1], EASE.out), 1 - curve(t, [b, b + outLen], [0, 1], EASE.in));
const quad = (p0: Pt, c: Pt, p1: Pt, n = 32): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const a = (1 - u) * (1 - u);
    const b = 2 * u * (1 - u);
    const d = u * u;
    return [a * p0[0] + b * c[0] + d * p1[0], a * p0[1] + b * c[1] + d * p1[1]] as Pt;
  });

// ---- the balance (REVEAL step 3): its right pan carries the quasar as a point ----
const BAL = { x: 500, y: 700, span: 240, maxTilt: 16, ratio: 100, tipFrames: 14, at: C.feed + 0.05 };
const balanceTilt = (t: number) => {
  const tip = curve(t, [C.combined, C.combined + BAL.tipFrames / FPS], [0, 1], EASE.punch);
  return Math.min(BAL.maxTilt, Math.log10(BAL.ratio) * (BAL.maxTilt / 3)) * tip;
};
const panPoint = (t: number) => {
  const a = (balanceTilt(t) * Math.PI) / 180;
  return { x: BAL.x + BAL.span * Math.cos(a), y: BAL.y + BAL.span * Math.sin(a) + 90 - 18 };
};

// ---- the object's scale k (1 = rest framing), absolute keys in log space ----
const K_KEYS: Key[] = [
  [0, K0],
  [1.5, 1, EASE.punch], // HOOK MOVE: bulk of the pull-back in the first ~12–24 frames
  [C.blackHole + 0.15, 1],
  [C.blackHole + 2.0, ZOOM], // ease in on the shadow
  [C.but + 0.1, ZOOM],
  [C.but + 1.3, 3.2], // (c) a little room for the light paths
  [C.so - 0.6, 3.2],
  [C.so + 1.4, 1], // (d) the bare black hole in its galaxy
  [C.light + 0.1, 1],
  [C.light + 1.5, 1.2],
  [C.heats, 1.2],
  [C.heats + 1.6, 0.8], // rises over the bars
  [C.pound + 0.15, 0.8],
  [C.pound + 1.85, 16 / R], // into the meter
  [C.feed - 0.3, 16 / R],
  [C.feed + 1.1, 0.07], // the point in the pan
  [C.combined + 1.1, 0.07],
  [C.combined + 2.7, 1], // grows back into the full quasar
  [C.billions - 0.2, 1],
  [C.billions + 2.0, SIZE_MIN, EASE.punch], // TWIST pull-back
  [LOOP.t0, SIZE_MIN],
  [LOOP.t1, K0, EASE.punch], // LOOP fly-in → frame 0
];
// the CAMERA's distance for the depth stars (1/kCam): it follows the real camera moves only
// (hook, the dive to the shadow, twist, loop); the infographic scenes move the object, not the camera
const CAM_KEYS: Key[] = [
  [0, K0], [1.5, 1, EASE.punch],
  [C.blackHole + 0.15, 1], [C.blackHole + 2.0, 2.5], [C.but + 0.1, 2.5], [C.but + 1.3, 2], [C.so - 0.6, 2], [C.so + 1.4, 1],
  [C.billions - 0.2, 1], [C.billions + 2.0, SIZE_MIN, EASE.punch], [LOOP.t0, SIZE_MIN], [LOOP.t1, K0, EASE.punch],
];
const TL = { x: 130, y: 330, length: 820 }; // the twist's timeline
const POINT_TOP = { x: TL.x, y: TL.y - 52 }; // the point tops the timeline
// the object's base position (rest framing), except where a scene carries it somewhere
const basePos = (t: number) => {
  const pts: { t: number; x: number; y: number }[] = [
    { t: C.heats, x: QX, y: QY },
    { t: C.heats + 1.6, x: QX, y: 560 },
    { t: C.pound + 0.15, x: QX, y: 560 },
    { t: C.pound + 1.85, x: QX, y: 965 },
    { t: C.feed - 0.3, x: QX, y: 965 },
  ];
  if (t >= C.feed - 0.3 && t <= C.combined + 2.7) {
    // into the pan, ride it as it tips, then back to center
    if (t < C.feed + 1.1) {
      const p = panPoint(t);
      const u = EASE.inOut(clamp01((t - (C.feed - 0.3)) / 1.4));
      return { x: lerp(QX, p.x, u), y: lerp(965, p.y, u) };
    }
    const p = panPoint(Math.min(t, C.combined + 1.1));
    const u = EASE.inOut(clamp01((t - (C.combined + 1.1)) / 1.6));
    return { x: lerp(p.x, QX, u), y: lerp(p.y, QY, u) };
  }
  if (t > C.combined + 2.7) {
    const u1 = EASE.inOut(clamp01((t - (C.they)) / 1.3));
    const u2 = EASE.inOut(clamp01((t - GLIDE_BACK.t0) / (GLIDE_BACK.t1 - GLIDE_BACK.t0)));
    const x = lerp(lerp(QX, POINT_TOP.x, u1), QX, u2);
    const y = lerp(lerp(QY, POINT_TOP.y, u1), QY, u2);
    return { x, y };
  }
  if (t <= pts[0].t) return { x: QX, y: QY };
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i].t) {
      const u = EASE.inOut(clamp01((t - pts[i - 1].t) / (pts[i].t - pts[i - 1].t)));
      return { x: lerp(pts[i - 1].x, pts[i].x, u), y: lerp(pts[i - 1].y, pts[i].y, u) };
    }
  }
  return pts[pts.length - 1];
};

// the close-up (hook/loop) looks at a point on the disk's bright side at the shadow's edge
const FOCUS = (() => {
  const a = (-8 * Math.PI) / 180;
  const lx = -1.75 * R;
  const ly = 0.08 * R;
  return { x: QX + lx * Math.cos(a) - ly * Math.sin(a), y: QY + lx * Math.sin(a) + ly * Math.cos(a) };
})();
const S0 = { x: 470, y: 980 };
const closeUpCenter = (k: number) => {
  const u = (k - 1) / (K0 - 1);
  const sx = lerp(FOCUS.x, S0.x, u);
  const sy = lerp(FOCUS.y, S0.y, u);
  return { x: sx + (QX - FOCUS.x) * k, y: sy + (QY - FOCUS.y) * k };
};

// ---- hook: kinetic pages + the brightness surge on "brightest" ----
const hw = (word: string, gold = false): KineticWord => {
  const x = VO[0].words!.find((y) => keyNorm(y.w).startsWith(word.toLowerCase()))!;
  return { w: x.w, start: x.start, gold };
};
const HOOK_OUT = C.quasar - 0.25;
const PAGES = [
  { lines: [[hw('Black'), hw('holes')], [hw('power')]], out: wordIn(VO[0], 'the') - 0.12 },
  { lines: [[hw('the'), hw("universe's")], [hw('brightest', true)], [hw('lights')]], out: HOOK_OUT },
];

// ---- scene geometry ----
const rAt = (k: number) => R * k;
const R_ZOOM = rAt(ZOOM);
const R_C = rAt(3.2);
const R_1A = rAt(1.2);
const edge = (r: number, deg: number): Pt => [QX + r * Math.cos((deg * Math.PI) / 180), QY + r * Math.sin((deg * Math.PI) / 180)];
const LIGHT_PATHS: { from: Pt; via: Pt; to: Pt }[] = [
  { from: [150, 430], via: [250, 720], to: edge(R_C, -150) },
  { from: [860, 470], via: [850, 720], to: edge(R_C, -35) },
  { from: [840, 1225], via: [620, 1240], to: edge(R_C, 60) },
];

export const WhatIsAQuasarV2: React.FC = () => {
  const f = useCurrentFrame();
  const t = S(f);

  // ---- dials ----
  const surge = curve(t, [C.brightest - 0.1, C.brightest + 0.3], [0, 1], EASE.punch) * (1 - 0.6 * curve(t, [C.brightest + 0.3, C.brightest + 1.4], [0, 1]));
  const hookL = 0.8 + 0.2 * surge;
  const hookEnd = 0.8 + 0.2 * 0.4;
  const L = t < C.quasar ? hookL : track(t, [
    [C.quasar, hookEnd], [C.blackHole, hookEnd], [C.blackHole + 1.5, 0], // dormant
    [C.falling, 0], [C.disk + 0.6, 0.18], // the forming disk: a faint orange glow
    [C.heats - 0.1, 0.18], [C.heats + 2.6, 0.5], // friction heats it
    [C.feed + 0.1, 0.5], [C.galaxy + 0.1, 0.85], [C.combined - 0.05, 0.85], [C.combined + 0.5, 1, EASE.punch],
    [C.fuel - 0.3, 1], [C.fuel + 1.4, 0.15], // ran out of fuel
    [LOOP.t0, 0.15], [LOOP.t0 + 1.6, 0.8], // = frame 0
  ]);
  // REVEAL 1a: the disk BUILDS as the gas arrives: a thin, faint ring from "falling in", growing in
  // size and density while the gas spirals in, complete on "disk"
  const D = track(t, [[0, 1], [C.blackHole + 1.55, 1], [C.blackHole + 2.4, 0], [C.falling, 0], [C.down + 0.2, 0.4], [C.disk + 0.7, 1]]);
  const diskOuter = track(t, [[0, 4.6], [C.falling, 2.0], [C.down + 0.2, 3.0], [C.disk + 0.7, 4.6]]);
  // a second, denser layer of infalling gas just for this scene, streaming in from beyond the frame
  const gasIn = track(t, [[0, 0], [C.light - 0.3, 0], [C.falling, 1], [C.disk + 0.4, 1], [C.heats + 0.6, 0]]);
  const J = track(t, [[0, 0], [C.jets - 0.1, 0], [C.jets + 0.8, 1], [C.almost + 0.8, 1], [C.billions, 0]]);
  const G = track(t, [
    [0, 1], [C.blackHole, 1], [C.blackHole + 1.2, 0], [C.light + 0.2, 0], [C.light + 1.3, 1],
    [C.heats, 1], [C.heats + 1.2, 0.6], [C.pound, 0.6], [C.pound + 0.9, 0], [C.combined + 1.4, 0], [C.combined + 2.6, 1],
  ]);
  const coronaK = track(t, [[0, 1], [C.heats, 1], [C.heats + 1.2, 0.45], [C.feed - 0.3, 0.45], [C.feed + 1.1, 1]]) * (1 + 0.35 * surge);
  const galaxyVis = track(t, [[0, 1], [C.heats, 1], [C.heats + 1.2, 0], [C.combined + 1.3, 0], [C.combined + 2.7, 1]]);
  const sky = track(t, [
    [0, 1], [C.heats, 1], [C.heats + 1.0, 0.55], [C.combined + 1.1, 0.55], [C.combined + 2.4, 1],
    [C.they, 1], [C.they + 0.8, 0.6], [GLIDE_BACK.t0, 0.6], [GLIDE_BACK.t0 + 0.6, 1],
  ]);

  // ---- camera / object ----
  const k = track(t, K_KEYS, true);
  const kCam = track(t, CAM_KEYS, true);
  const dist = 1 / k; // the object's apparent distance
  const camDist = 1 / kCam;
  const base = basePos(t);
  const closeUp = (t < 3 || t > LOOP.t0) && k > 1;
  const c = closeUp ? closeUpCenter(k) : base;
  const vanish = t < 3 || t > GLIDE_BACK.t1 ? c : { x: QX, y: QY };
  const exp = quasarExposure(L * D);
  const far = clamp01((camDist - 1) / 3);
  const starsOp = lerp(exp.stars, 1, far) * sky;
  const galaxyOp = clamp01(1 - (dist - 1.5) / 5) * galaxyVis;
  const point = clamp01((dist - 3) / 8); // far away (or tiny), a quasar is a point of light
  const nearStars = clamp01(1 - (camDist - 1.5) / 1.5);
  const fgStars = t > LOOP.t0 - 0.5 ? clamp01((t - (LOOP.t0 - 0.5)) / 0.4) : 0;
  // the point's swell on "Combined." (the main reveal peak)
  const swell = curve(t, [C.combined - 0.02, C.combined + 0.25], [0, 1], EASE.punch) * (1 - curve(t, [C.combined + 0.25, C.combined + 1.4], [0, 1]));
  const faint = t > C.fuel - 1 ? clamp01((0.85 - L) / 0.7) : 0; // out of fuel: the point fades to orange

  const small = k <= 1;
  const qx = small ? base.x : c.x;
  const qy = small ? base.y : c.y;
  const qr = small ? R : R * k;
  const qProps = {
    luminosity: L, disk: D, diskOuter, jets: J, jetLength: R * 4.5 * (small ? 1 : k), loopFrames: TOTAL_FRAMES,
    breathe: 0.07, breathePeriod: 75, hotspots: 3, hotspotPeriod: 135, streaks: 0.3,
    drift: 1.2 * Math.max(1, k), corona: coronaK / Math.max(1, Math.sqrt(k)), warm: true,
  };
  const gas = { luminosity: Math.max(L, 0.25), opacity: G * clamp01((k - 0.2) / 0.4), loopFrames: TOTAL_FRAMES };
  const body = (
    <>
      <HostGalaxy x={qx} y={qy} rx={520 * (small ? 1 : k)} dim={exp.galaxy * galaxyOp} warm />
      <InfallingGas x={qx} y={qy} shadowR={qr} {...gas} layer="back" />
      {gasIn > 0 && <InfallingGas x={qx} y={qy} shadowR={qr} count={20} seed={41} period={120} turns={1.15} width={0.06}
        to={diskOuter - 0.2} luminosity={1} opacity={gasIn} loopFrames={TOTAL_FRAMES} layer="back" />}
      <Quasar x={qx} y={qy} shadowR={qr} {...qProps} />
      <InfallingGas x={qx} y={qy} shadowR={qr} {...gas} layer="front" />
      {gasIn > 0 && <InfallingGas x={qx} y={qy} shadowR={qr} count={20} seed={41} period={120} turns={1.15} width={0.06}
        to={diskOuter - 0.2} luminosity={1} opacity={gasIn} loopFrames={TOTAL_FRAMES} layer="front" />}
    </>
  );

  // stars never behind text: always the title + caption lanes, plus each infographic while it shows
  const clear: [number, number, number, number][] = [[60, 210, 840, 420], [160, 1270, 760, 150]];
  if (t > C.heats - 0.3 && t < C.pound + 0.6) clear.push([60, 820, 840, 420]);
  if (t > C.pound && t < C.feed + 0.4) clear.push([100, 560, 760, 420]);
  if (t > C.feed - 0.2 && t < C.combined + 1.6) clear.push([40, 520, 880, 560]);
  if (t > C.they - 0.2 && t < GLIDE_BACK.t0 + 0.3) clear.push([60, 230, 840, 1000]);

  const lines: CaptionLine[] = VO.slice(1).map((l, i) => ({ ...l, keywords: KEYS[i + 1] ?? [] }));

  // ---- SETUP (c) + REVEAL 1a flow paths ----
  const lightPaths: FlowPath[] = LIGHT_PATHS.map((p, i) => ({
    points: quad(p.from, p.via, p.to), kind: 'gold', at: F(C.give + i * 0.22), len: 36, fadeAt: F(C.so - 0.5), head: true,
  }));
  const diskPaths: FlowPath[] = [
    { points: linePath(QX, 400, QX, QY - R_1A - 18), kind: 'ghost', at: F(C.gas - 0.05), len: 28, fadeAt: F(C.down + 0.45), arrow: true, label: 'STRAIGHT IN?' },
    { points: spiralPath(QX, QY, 560, 2.2 * R_1A, 1.25, 200, -8, 0.22), kind: 'gold', at: F(C.down + 0.2), len: 60, fadeAt: F(C.disk + 0.7) },
    { points: spiralPath(QX, QY, 560, 2.2 * R_1A, 1.25, 20, -8, 0.22), kind: 'gold', at: F(C.down + 0.35), len: 60, fadeAt: F(C.disk + 0.7) },
  ];
  const starsAt = win(t, C.give - 0.3, C.so - 0.5, 0.4, 0.5);
  // SETUP (d) "shining": a brief flicker of light around the bare shadow (three soft pulses, then dark)
  const pulse = (t0: number, amp: number) => amp * curve(t, [t0, t0 + 0.08], [0, 1], EASE.out) * (1 - curve(t, [t0 + 0.08, t0 + 0.32], [0, 1], EASE.in));
  // in the pause right after the question (the voice would bury its sound otherwise)
  const FL = VO[6].end + 0.02;
  const flicker = pulse(FL, 1) + pulse(FL + 0.22, 0.55) + pulse(FL + 0.44, 0.8);
  const flR = R * k; // the shadow's on-screen radius right now

  // the point (twist / pan / timeline): ivory core, gold glow; out of fuel it turns orange
  const pr = 26 * (1 + 1.3 * swell);
  const coreCol = mix(PALETTE.ivory, QUASAR.disk[3], faint);
  const glowCol = mix(PALETTE.gold, QUASAR.disk[4], faint);

  return (
    <Grain>
      <AbsoluteFill style={{ backgroundColor: PALETTE.space }}>
        <ParallaxStars dist={camDist} cx={vanish.x} cy={vanish.y} count={200} z={[40, 150]} opacity={starsOp} clear={clear} seed={21} />
        <ParallaxStars dist={camDist} cx={vanish.x} cy={vanish.y} count={160} z={[0.25, 3]} opacity={starsOp * nearStars} clear={clear} seed={22} bright={6} />

        {/* the persistent object */}
        {small
          ? <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: `${base.x}px ${base.y}px` }}>{body}</AbsoluteFill>
          : body}
        {point > 0 && (
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <defs>
              <radialGradient id="qPoint2">
                <stop offset="0%" stopColor={coreCol} stopOpacity={0.9} />
                <stop offset="30%" stopColor={glowCol} stopOpacity={0.35 + 0.25 * swell} />
                <stop offset="100%" stopColor={glowCol} stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle cx={c.x} cy={c.y} r={pr} fill="url(#qPoint2)" opacity={point * (0.4 + 0.6 * L)} />
            <circle cx={c.x} cy={c.y} r={4.5 * (1 + 0.5 * swell)} fill={coreCol} opacity={point * (0.5 + 0.5 * L)} />
          </svg>
        )}
        {fgStars > 0 && (
          <ParallaxStars dist={camDist} cx={vanish.x} cy={vanish.y} count={150} z={[-(1 / SIZE_MIN - 0.6), -0.3]} fillAt={1 / SIZE_MIN}
            opacity={fgStars} clear={clear} seed={33} bright={14} />
        )}

        {/* HOOK: the kinetic title, word by word on the voice */}
        {PAGES.map((p, i) => (
          <KineticTitle key={i} lines={p.lines} x={QX} outAt={p.out} outLen={i < PAGES.length - 1 ? 0.12 : 0.35} />
        ))}

        {/* SETUP (a): named */}
        <Fade op={1 - curve(t, [C.blackHole - 0.1, C.blackHole + 0.3], [0, 1], EASE.in)}>
          <DataLabel x={QX} y={300} align="center" label="" value="Quasar" size={96} at={F(C.quasar - 0.05)} />
        </Fade>

        {/* SETUP (b): the solar system inside the event horizon of a 1-billion-Sun black hole (true scale) */}
        <Fade op={win(t, C.billionsSun, C.but + 0.05, 0.5, 0.45)}>
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <circle cx={QX} cy={QY} r={R_ZOOM * HORIZON} fill="none" stroke={PALETTE.ivory} strokeOpacity={0.75} strokeWidth={2.5} strokeDasharray="7 7" />
          </svg>
          <OrbitOverlay x={QX} y={QY} pxPerAU={(R_ZOOM * HORIZON) / RS_AU_1E9} planets={['earth', 'mars', 'jupiter', 'saturn', 'uranus']}
            labels={['earth', 'uranus']} at={F(C.billionsSun + 0.05)} />
          <DataLabel x={QX} y={330} align="center" label="EVENT HORIZON" value="1 billion Suns" at={F(C.billionsSun + 0.35)} />
        </Fade>

        {/* SETUP (c): light from nearby stars falls in; none comes back out */}
        <Fade op={starsAt}>
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
            {LIGHT_PATHS.map((p, i) => (
              <g key={i}>
                <circle cx={p.from[0]} cy={p.from[1]} r={16} fill={PALETTE.gold} opacity={0.18} />
                <circle cx={p.from[0]} cy={p.from[1]} r={4.5} fill={PALETTE.ivory} />
              </g>
            ))}
          </svg>
        </Fade>
        <FlowPaths paths={lightPaths} />

        {/* SETUP (d): "So what's shining?" — light flickers around the dark shadow */}
        {flicker > 0.005 && (
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <defs>
              <radialGradient id="flick" gradientUnits="userSpaceOnUse" cx={base.x} cy={base.y} r={flR * 2.2}>
                <stop offset={`${(100 / 2.2).toFixed(1)}%`} stopColor={QUASAR.photonRing} stopOpacity={0.95} />
                <stop offset={`${(100 * 1.12 / 2.2).toFixed(1)}%`} stopColor={PALETTE.gold} stopOpacity={0.45} />
                <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle cx={base.x} cy={base.y} r={flR * 2.2} fill="url(#flick)" opacity={Math.min(1, flicker)} />
            <circle cx={base.x} cy={base.y} r={flR} fill={PALETTE.hole} />
            {[200, 25, 300, 130].map((deg, i) => {
              const gx = base.x + flR * 1.12 * Math.cos((deg * Math.PI) / 180);
              const gy = base.y + flR * 1.12 * Math.sin((deg * Math.PI) / 180);
              const g = Math.min(1, flicker * (i % 2 ? 0.8 : 1));
              return (
                <g key={i} opacity={g}>
                  <circle cx={gx} cy={gy} r={14} fill={PALETTE.gold} opacity={0.3} />
                  <line x1={gx - 16} y1={gy} x2={gx + 16} y2={gy} stroke={PALETTE.ivory} strokeWidth={2} strokeLinecap="round" />
                  <line x1={gx} y1={gy - 16} x2={gx} y2={gy + 16} stroke={PALETTE.ivory} strokeWidth={2} strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
        )}

        {/* REVEAL 1a: not straight in — it swirls into a disk */}
        <FlowPaths paths={diskPaths} />

        {/* REVEAL 1b: tens of thousands of degrees, against the Sun's surface (true linear lengths) */}
        <Fade op={1 - curve(t, [C.pound - 0.05, C.pound + 0.35], [0, 1], EASE.in)}>
          <ComparisonBars x={80} y={840} width={760} stagger={15} at={F(C.heats)} bars={[
            { label: "SUN'S SURFACE", value: 5800, unit: ' K', display: '~5,800 K' },
            { label: 'INNER DISK, UP TO', value: 100000, unit: ' K', display: '100,000 K', hero: true },
          ]} />
        </Fade>

        {/* REVEAL 2: ~10% of the mass turned into light, vs fusion's 0.7% */}
        <Fade op={1 - curve(t, [C.feed - 0.3, C.feed + 0.1], [0, 1], EASE.in)}>
          <Meter value={10} max={100} display="~10%" label="OF THE MASS → LIGHT" compare={{ value: 0.7, label: 'FUSION 0.7%' }}
            x={QX} y={740} r={300} at={F(C.ten - (8 + 48) / FPS)} />
        </Fade>

        {/* REVEAL 3: every star in the galaxy vs one quasar disk; tips on "Combined." */}
        <Fade op={1 - curve(t, [C.combined + 0.95, C.combined + 1.4], [0, 1], EASE.in)}>
          <div style={{ position: 'absolute', left: BAL.x - 300, width: 600, top: 540, textAlign: 'center', ...TYPE.annotation, color: PALETTE.sciText,
            opacity: curve(t, [BAL.at + 0.3, BAL.at + 0.8], [0, 1], EASE.out) } as React.CSSProperties}>TOTAL LIGHT</div>
          <Balance x={BAL.x} y={BAL.y} span={BAL.span} maxTilt={BAL.maxTilt} at={F(BAL.at)} tipAt={F(C.combined)} tipFrames={BAL.tipFrames}
            tipEase="punch" labelsAt={F(C.diskWord)} valueSize={64}
            left={{ label: 'EVERY STAR IN THE GALAXY', value: 1, display: '~100 billion', glyph: 'stars' }}
            right={{ label: 'ONE QUASAR DISK', value: BAL.ratio, display: '1 disk', glyph: 'none' }} />
        </Fade>

        {/* REVEAL 4: the jets */}
        <Fade op={1 - curve(t, [C.almost + 0.2, C.almost + 0.6], [0, 1], EASE.in)}>
          <DataLabel x={540} y={440} align="left" label="STRONG JETS" value="~1 in 10 quasars" size={46} at={F(C.jets + 0.5)} />
        </Fade>

        {/* TWIST (a): a point among the stars */}
        <Fade op={1 - curve(t, [C.they + 0.05, C.they + 0.4], [0, 1], EASE.in)}>
          <Marker x={QX} y={QY} side="below" length={70} label="QUASAR" at={F(C.billions + 0.55)} />
          <DataLabel x={QX} y={560} align="center" label="ALMOST EVERY QUASAR" value="billions of light-years" size={60} at={F(C.billions + 0.5)} />
        </Fade>

        {/* TWIST (b)(c): the timeline (positions true in time; years ago, top = Big Bang) */}
        <Fade op={1 - curve(t, [GLIDE_BACK.t0 - 0.2, GLIDE_BACK.t0 + 0.3], [0, 1], EASE.in)}>
          <Timeline x={TL.x} y={TL.y} length={TL.length} range={[13.8, 0]} labelSize={44} at={F(C.they + 0.3)} events={[
            { t: 13.8, label: 'BIG BANG', date: '13.8 BILLION YEARS AGO', at: F(C.they + 0.7) },
            { t: 0, label: 'TODAY', at: F(C.they + 1.5) },
            { t: 10, label: 'QUASAR PEAK', date: '~10 BILLION YEARS AGO', at: F(C.young - 0.05), hero: true },
            { t: 13.1, label: "FARTHEST QUASAR'S LIGHT", date: '13.1 BILLION YEARS AGO', at: F(C.thirteen - 0.05), hero: true },
            { t: 4.54, label: 'EARTH FORMS', date: '4.54 BILLION YEARS AGO', at: F(C.earth - 0.05) },
          ]} />
        </Fade>

        <KeywordCaptions lines={lines} />
      </AbsoluteFill>
    </Grain>
  );
};
