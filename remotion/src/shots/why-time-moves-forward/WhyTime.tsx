import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, CAPTION, EASE, PALETTE, SAFE_RECT, TYPE } from '../../brand';
import {
  Balance, BlackHole, Camera, CameraLayer, CoffeeCup, ComparisonBars, DataLabel, DeckOfCards, Egg, FlyThrough, GoldMorphLine, Grain,
  KeywordCaptions, KineticTitle, OdometerNumber, ParallaxStars, ParticleBox, ParticleGlyphs, ShapeMatch, Starfield, Timeline,
  TimeStream, WhipTransition, WordDissolve, cupSpiralPts, eggCrackPts, keyNorm, lineGeom, morphLine, morphPoint, morphScribble, snapToBeat,
  whipTiming,
} from '../../components';
import type { Key } from '../../components/anim';
import type { CaptionLine, MorphKey, Pt } from '../../components';
import type { VoLine } from '../../lib/shorts';
import { DURATION_S as DUR_A, VO as VO_A } from './vo.gen';
import { DURATION_S as DUR_B, VO as VO_B } from './vo-b.gen';

// "Why Time Only Moves Forward" — shorts/why-time-moves-forward/guion.md. Brand v2.2.
// VOICE-FIRST: every cue is read from the real word times (vo.gen.ts / vo-b.gen.ts).
// Variant A: egg → coffee → "goodbye" → dust → stars hook, egg loop.
// Variant B (trial reel): deck + riffle hook, bridge where egg/coffee/goodbye break for the first
// time, deck loop. The body (VO lines 4–26) is the same code in both, on each variant's own times.
// One gold line is the through-line: crack → spiral → handwriting → dust → time's arrow → the
// timeline's axis → a last faint point → the crack (A) / the fan's edge (B).
// Layout comes from SAFE_RECT / CAPTION (16:9-ready rule): no literal y positions below.
// DYNAMISM PASS (2026-11-17, brand §8): the body runs inside one living Camera (drift, parallax star
// layer, punch-ins only on the main reveal and "heat death"; drift fades to 0 in the hook and loop so
// the loop still closes). Scenes hand off by match cuts first (a "100" of particles bursts into the box;
// the box's frame becomes the balance beam; the gold line becomes the axis), one fly-through (the odds →
// the entropy gas), whips on 3 big changes ("Why?" → the box; timeline → star birth → back). The
// timeline tilts in CSS 3D while the camera flies along it (motion blur only there). Free cut times
// snap to the pulse of bed-minimal-pulse (beat.ts) when the beat falls within ~0.18 s of the word.

export type Variant = 'a' | 'b';
const FPS = CANVAS.FPS;
const F = (s: number) => Math.round(s * FPS);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const curve = (t: number, xs: number[], ys: number[], e: (x: number) => number = EASE.inOut) =>
  interpolate(t, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
// visible window: fade in over inLen from a, fade out over outLen from b
const win = (t: number, a: number, b: number, inLen = 0.3, outLen = 0.3) =>
  Math.min(curve(t, [a, a + inLen], [0, 1], EASE.out), 1 - curve(t, [b, b + outLen], [0, 1], EASE.in));
// piecewise keys that may restart ([a,0],[b,22],[c,0],[d,0],…): the tilt of the 3D timeline
const kfDeg = (f: number, keys: Key[]) => {
  let v = keys[0][1];
  for (let i = 0; i < keys.length; i++) {
    const [k, val, e] = keys[i] as readonly [number, number, string?];
    if (f < k) {
      if (i === 0) return v;
      const [k0, v0] = keys[i - 1];
      const p = Math.min(1, Math.max(0, (f - k0) / (k - k0)));
      return v0 + (val - v0) * (e === 'inOut' ? EASE.inOut(p) : p);
    }
    v = val;
  }
  return v;
};
const Fade: React.FC<{ op: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ op, children, style }) =>
  op <= 0.001 ? null : <AbsoluteFill style={{ opacity: Math.min(1, op), ...style }}>{children}</AbsoluteFill>;

// ---- layout (from the safe rectangle) ----
const CX = SAFE_RECT.x + SAFE_RECT.w / 2; // 480
const CY = SAFE_RECT.y + SAFE_RECT.h * 0.42; // ≈ 718: the hero object's center
const EGG_R = SAFE_RECT.w * 0.37; // half its height: the egg spans ~55 % of the safe width (review 2026-11-17)
const CUP_R = SAFE_RECT.w * 0.22;
const WORD = { y: CY - SAFE_RECT.h * 0.09, size: 170 };
const SCRIB: [number, number, number, number] = [CX - 300, CY + 40, 600, 110];
const ARROW = { x0: CX - SAFE_RECT.w * 0.38, x1: CX + SAFE_RECT.w * 0.38, y: CY };
const TL = { x: SAFE_RECT.x + 110, y: SAFE_RECT.y + 90, L: CAPTION.centerY - 150 - (SAFE_RECT.y + 120) }; // axis + 60 px labels ≈ centered, top to the caption lane
const TL_LABEL = 60;
const TODAY_Y = SAFE_RECT.y + 120; // where the camera parks the TODAY marker
const GLIDE = TODAY_Y - (TL.y + TL.L); // translate that brings TODAY (linear axis end) to TODAY_Y
const LOG_RANGE: [number, number] = [1.38e10, 1e110];
const logU = (t: number) => Math.log10(t / LOG_RANGE[0]) / Math.log10(LOG_RANGE[1] / LOG_RANGE[0]);
const DECK = { x: CX, y: CY + SAFE_RECT.h * 0.3, radius: 380, arc: 76, cardW: 150 };
const deckEdge = (): Pt[] => {
  const er = DECK.radius + (DECK.cardW * 1.4) / 2 + 10;
  const half = DECK.arc / 2 + 5;
  return Array.from({ length: 41 }, (_, i) => {
    const a = ((-half + (2 * half * i) / 40) * Math.PI) / 180;
    return [DECK.x + er * Math.sin(a), DECK.y - er * Math.cos(a)] as Pt;
  });
};

const BOX = { x: CX, y: CY, w: SAFE_RECT.w * 0.86, h: SAFE_RECT.w * 0.62 };
const BAL = { y: CY - 40, span: SAFE_RECT.w * 0.26 };
const HOLE = { x: CX, y: CY - SAFE_RECT.h * 0.06 }; // the fly-through's opening (center of the odds)
const onBeat = (t: number, tol = 0.18) => { const b = snapToBeat(t); return Math.abs(b - t) <= tol ? b : t; };
const WHIP_SWAP = whipTiming(0, 8).swap;

const Label: React.FC<{ y: number; size?: number; spacing?: number; children: React.ReactNode }> = ({ y, size, spacing, children }) => (
  <div style={{ position: 'absolute', left: CX - 420, width: 840, top: y, textAlign: 'center', ...TYPE.label, color: PALETTE.sciText,
    ...(size ? { fontSize: size } : {}), ...(spacing !== undefined ? { letterSpacing: spacing } : {}) } as React.CSSProperties}>{children}</div>
);
// a gold ring that expands and fades once (an impact, a marker igniting)
const Ring: React.FC<{ x: number; y: number; t: number; at: number; r0?: number; r1?: number; dur?: number; w?: number }> = ({ x, y, t, at, r0 = 24, r1 = 240, dur = 0.7, w = 6 }) => {
  const p = (t - at) / dur;
  if (p <= 0 || p >= 1) return null;
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <circle cx={x} cy={y} r={r0 + (r1 - r0) * EASE.out(p)} fill="none" stroke={PALETTE.gold} strokeWidth={w * (1 - p) + 1.5} opacity={0.75 * (1 - p)} />
    </svg>
  );
};
// one-by-one switch-off times: n stars between a and b (seconds), the rate accelerating toward b
const offTimes = (n: number, a: number, b: number) => Array.from({ length: n }, (_, i) => F(a + (b - a) * Math.pow(n === 1 ? 0 : i / (n - 1), 0.6)));

// ---- cues ----
const cuesOf = (VO: VoLine[]) => {
  const at = (line: number, word: string) => {
    const w = VO[line].words?.find((x) => keyNorm(x.w).startsWith(word.toLowerCase()));
    if (!w) throw new Error(`cue word "${word}" not in "${VO[line].text}"`);
    return w.start;
  };
  return {
    l1: VO[1].start, l2: VO[2].start, l3: VO[3].start,
    broken1: at(1, 'broken'), milk: at(2, 'milk'), words: at(3, 'words'), regret: at(3, 'regret'),
    time: at(4, 'time'), way: at(4, 'way'),
    but: at(5, 'but'), physics: at(5, 'physics'), they: at(6, 'they'), reverse: at(6, 'reverse'), why1: at(7, 'why'),
    counting: at(8, 'counting'), put: at(9, 'put'), hundred: at(9, 'hundred'), half: at(9, 'half'), go: at(10, 'go'),
    spread: at(11, 'spread'), vastly: at(13, 'vastly'), ways: at(13, 'ways'), mixed: at(13, 'mixed'), sorted: at(13, 'sorted'),
    ninety: at(22, 'ninety'),
    odds: at(14, 'odds'), side: at(14, 'side'), about: at(15, 'about'), one: at(15, 'one'), trillion2: VO[15].words![6].start,
    thats: at(16, 'that'), entropy: at(16, 'entropy'), number: at(17, 'number'), grows: at(18, 'grows'),
    so: at(19, 'so'), direction: at(19, 'direction'), started: at(19, 'started'), low: at(19, 'low'),
    nobody: at(20, 'nobody'), why2: at(20, 'why'), l20end: VO[20].end,
    ever: at(21, 'ever'), order: at(21, 'order'), star: at(22, 'star'), peak: at(22, 'peak'),
    in23: at(23, 'in'), last: at(23, 'last'), fade: at(23, 'fade'),
    googol: at(24, 'goo'), black: at(24, 'black'), evaporate: at(24, 'evaporate'),
    then: at(25, 'then'), heat: at(25, 'heat'), death: at(25, 'death'),
    no: at(26, 'no'), spend: at(26, 'spend'),
    loop: VO[27].start,
  };
};

// per-line KEYWORD (guion.md); lines not listed get none
const KEYS_A: Record<number, string[]> = {
  0: ['undo'], 1: ['egg'], 2: ['coffee'], 3: ['regret'], 4: ['way'], 6: ['reverse'], 7: ['why'], 8: ['counting'], 13: ['mixed'],
  15: ['million'], 16: ['entropy'], 18: ['grows'], 19: ['direction'], 20: ['why'], 21: ['order'], 22: ['peak'], 23: ['fade'],
  24: ['evaporate'], 25: ['death'],
};
const KEYS_B: Record<number, string[]> = { ...KEYS_A, 0: ['shuffle'], 1: ['egg'], 2: ['coffee'], 3: ['regret'] };

export const durationOf = (v: Variant) => (v === 'a' ? DUR_A : DUR_B);

export const WhyTime: React.FC<{ variant: Variant }> = ({ variant }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const VO = variant === 'a' ? VO_A : VO_B;
  const END = durationOf(variant);
  const LAST_F = Math.round(END * FPS) - 1;
  const C = React.useMemo(() => cuesOf(VO), [VO]);
  const isA = variant === 'a';

  // ---- captions: A's hook shows its first sentence only (the kinetic title carries "Blame the Big Bang") ----
  const lines: CaptionLine[] = React.useMemo(() => VO.map((l, i) => {
    const keys = (isA ? KEYS_A : KEYS_B)[i] ?? [];
    if (isA && i === 0) {
      const words = l.words!.slice(0, 4);
      return { text: "You can't undo anything.", start: words[0].start, end: words[3].end, words, keywords: keys };
    }
    return { ...l, keywords: keys };
  }), [VO, isA]);

  // ================= HOOK A (0 → ~4 s) =================
  const H = { split0: 0.42, split1: 0.8, toCup: 0.72, toWord: 1.38, write0: 1.42, write1: 1.86, burst: 2.18, pull0: 2.36, pull1: 3.3 };
  const hookLine: MorphKey[] = [
    { pts: eggCrackPts(CX, CY, EGG_R), at: 0 },
    { pts: cupSpiralPts(CX, CY, CUP_R), at: F(H.toCup), len: 9 },
    { pts: morphScribble(...SCRIB), at: F(H.toWord), len: 9 },
  ];
  const pullK = Math.exp(curve(t, [H.pull0, H.pull1], [0, Math.log(0.18)], EASE.punch)); // dust shrinks into the sky
  const pullD = Math.exp(curve(t, [H.pull0, H.pull1 + 0.2], [0, Math.log(12)], EASE.punch)); // camera distance

  // ================= shared body: the cut times (snapped to the bed's pulse when close) =================
  const S1 = onBeat(C.counting - 0.1); // whip: "Why?" → the box
  const M = onBeat(C.vastly); // match cut: the box's frame → the balance beam
  const heroIn = C.one - 0.12; // the main reveal (voice + hit: not snapped)
  const L1 = onBeat(C.entropy - 0.15); // fly-through lands in the entropy gas
  const FLY_LEN = 24;
  const FLY_AT = F(L1) - FLY_LEN;
  const S2 = onBeat(C.star - 0.1); // whip: timeline → star birth
  const S3 = onBeat(C.in23 - 0.15); // whip: star birth → timeline (then the log rescale)
  const W1 = F(S1) - WHIP_SWAP, W2 = F(S2) - WHIP_SWAP, W3 = F(S3) - WHIP_SWAP;
  const G0 = C.l20end - 0.1, G1 = C.ever + 0.6; // the flight down the timeline to TODAY

  // ================= shared body: positions =================
  const glideK = curve(t, [G0, G1], [0, 1], EASE.inOut); // camera glides down to TODAY
  const rsAt = S3 + 0.15;
  const rsLen = 1.4;
  const rsK = curve(t, [rsAt, rsAt + rsLen], [0, 1], EASE.inOut); // same easing/window as the Timeline rescale
  const tlShift = GLIDE * glideK + (TODAY_Y - TL.y - GLIDE) * rsK; // keeps TODAY parked at TODAY_Y during the rescale

  // the last faint gold point: born at the heat-death marker, drifts to the center
  const pointLine: MorphKey[] = isA
    ? [
      { pts: morphPoint(TL.x, TODAY_Y + TL.L), at: 0 }, // the heat-death marker, after the rescale
      { pts: morphPoint(CX, CY), at: F(C.death + 0.9), len: 36 },
      { pts: eggCrackPts(CX, CY, EGG_R), at: F(C.loop + 0.25), len: 30 },
    ]
    : [
      { pts: morphPoint(TL.x, TODAY_Y + TL.L), at: 0 },
      { pts: morphPoint(CX, CY), at: F(C.death + 0.9), len: 36 },
      { pts: deckEdge(), at: F(C.loop + 0.2), len: 30 },
    ];

  // ================= the sky =================
  // HEAT DEATH CLIMAX: every star in the frame (both layers) switches off one by one, each a clear 0.5 s
  // fade: a few on "the last stars fade", more on the black holes, the rest accelerating from "heat death"
  // until the sky is dark (then only the gold point is left). They relight while the egg re-forms.
  const skyOffs = (nLast: number, nBlack: number, nHeat: number) => [
    ...offTimes(nLast, C.last + 0.15, C.fade + 0.9), ...offTimes(nBlack, C.black, C.evaporate + 1.4), ...offTimes(nHeat, C.heat - 0.1, C.spend + 0.6),
  ];
  const offs = skyOffs(14, 30, 230);
  const ons = offs.map((_, i) => F(C.loop + 0.3 + (2.0 * i) / offs.length));
  const offsNear = skyOffs(3, 6, 48);
  const onsNear = offsNear.map((_, i) => F(C.loop + 0.3 + (2.0 * i) / offsNear.length));

  // ================= B: deck hook + bridge =================
  const B = isA ? null : {
    r1: 0.25, r2: VO[0].words![5].start - 0.1, // riffles on "Shuffle" and "un-shuffles"
    toCrack: C.l1 - 0.35, split: C.broken1 + 0.05, toCup: C.l2 - 0.3, mix0: C.milk + 0.1, toWord: C.l3 - 0.2, burst: VO[3].end + 0.03, // burst in the pause after "regret" (its sound is heard there)
  };

  // the arrow (time's direction) from the word's dust, then it collapses into one particle at its head
  const arrowLine: MorphKey[] = [
    { pts: morphScribble(...SCRIB), at: 0 },
    { pts: morphLine(ARROW.x0, ARROW.y, ARROW.x1, ARROW.y), at: F(C.time - 0.2), len: 20 },
    { pts: morphPoint(ARROW.x1, ARROW.y), at: F(C.but - 0.05), len: 10 },
  ];
  const arrowHead = win(t, C.way - 0.05, C.but - 0.1, 0.2, 0.2);
  // the axis: the arrow returns and turns into the timeline's axis
  const axisLine: MorphKey[] = [
    { pts: morphLine(ARROW.x0, ARROW.y, ARROW.x1, ARROW.y), at: 0 },
    { pts: morphLine(TL.x, TL.y, TL.x, TL.y + TL.L), at: F(C.direction), len: 16 },
  ];

  // ================= main reveal burst =================
  const burstP = clamp01((t - heroIn) / 0.7);
  const oddsW = VO[15].words!; // About · one · in · a · million · trillion · trillion.

  // ================= camera =================
  const driftAmp: Key[] = [[F(C.time - 0.5), 0], [F(C.time + 0.5), 1, 'inOut'], [F(C.death + 0.6), 1], [F(C.death + 1.6), 0, 'inOut']];
  // every scene gets a slow push-in (reset inside a whip or eased back before the next scene), so no
  // stretch reads as a still; back to exactly 1 before the loop (frame 0 = the last frame)
  const camZoom: Key[] = [
    [F(C.time - 0.5), 1], [F(C.why1 + 0.6), 1.08, 'inOut'], // the arrow + the collision
    [F(S1) - 4, 1.08], [F(S1) + 4, 1, 'inOut'], // reset inside whip 1
    [F(M - 0.2), 1.06, 'inOut'], // the box
    [F(C.about - 0.2), 1.05, 'inOut'], // the balance
    [F(heroIn), 1, 'inOut'], // pull back for the reveal
    [FLY_AT, 1.1, 'inOut'], // push into the odds
    [F(L1), 1, 'inOut'],
    [F(C.so - 0.3), 1.03, 'inOut'], // entropy (its layout already fills the frame)
    [F(C.direction + 0.3), 1, 'inOut'],
    [F(G0), 1.06, 'inOut'], [F(G1), 1, 'inOut'], // the timeline, then the flight to TODAY
    [F(S2) - 4, 1.04, 'inOut'], [F(S2) + 4, 1, 'inOut'],
    [F(S3) - 4, 1.06, 'inOut'], [F(S3) + 4, 1, 'inOut'],
    [F(C.heat), 1.08, 'inOut'], // the far future, to the climax
    [F(C.loop + 0.5), 1, 'inOut'],
  ];
  const camX = 0;
  const blurWins: [number, number][] = [[F(G0 + 0.35), F(G1 - 0.35)], [F(rsAt + 0.3), F(rsAt + rsLen - 0.3)]];
  const tilt = kfDeg(f, [[F(G0), 0], [F((G0 + G1) / 2), 22, 'inOut'], [F(G1), 0, 'inOut'], [F(rsAt), 0], [F(rsAt + rsLen / 2), 22, 'inOut'], [F(rsAt + rsLen), 0, 'inOut']]);

  // ---------- SETUP (c): a collision, forward then reversed (leaves by the whip) ----------
  const collisionNode = (
    <>
      <Fade op={win(t, C.but + 0.3, S1 + 0.5, 0.3, 0.2)}>
        <ParticleBox x={CX} y={CY} w={SAFE_RECT.w * 0.86} mode="collide" box={0} dot={24}
          clock={[[F(C.physics - 0.1), 0], [F(C.physics + 1.4), 1, 'linear'], [F(C.reverse - 0.6), 1], [F(C.reverse + 0.9), 0, 'linear']]} />
        <Ring x={CX} y={CY} t={t} at={C.physics + 0.6} r1={260} />
        <Ring x={CX} y={CY} t={t} at={C.reverse + 0.1} r1={260} />
        <Fade op={win(t, C.physics - 0.05, C.reverse - 0.75, 0.25, 0.2)}>
          <Label y={CY - SAFE_RECT.h * 0.24} size={44}>FORWARD</Label>
        </Fade>
        <Fade op={win(t, C.reverse - 0.55, C.why1 - 0.1, 0.25, 0.25)}>
          <Label y={CY - SAFE_RECT.h * 0.24} size={44}>REVERSED</Label>
        </Fade>
      </Fade>
      <KineticTitle x={CX} top={CY - SAFE_RECT.h * 0.2} size={110} outAt={S1 + 0.5} outLen={0.2}
        lines={[[{ w: 'Why?', start: C.why1, gold: true }]]} />
    </>
  );

  // ---------- REVEAL 1–2: "100" of particles → bursts into the box's left half → the divider lifts ----------
  const boxNode = (
    <>
      <ParticleGlyphs box={BOX} text="100" cx={CX} cy={CY} cell={26} dot={10} start={F(S1) - 20} at={F(C.hundred - 0.35)} len={30} stagger={12}
        opacity={[[F(C.half - 0.05), 1], [F(C.half + 0.2), 0]]} />
      <ParticleBox x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} releaseAt={F(C.go)} speed={6} dot={10} at={F(C.half - 0.1)}
        gather={{ from: [CX, CY], at: F(C.half - 0.05), len: 24 }}
        box={[[F(C.half - 0.05), 0], [F(C.half + 0.3), 1], [F(M) - 1, 1], [F(M), 0]]} opacity={[[F(M) - 3, 1], [F(M) + 9, 0]]} />
    </>
  );

  // ---------- REVEAL 3: the main reveal (punch-in on the hit) ----------
  const heroNode = (
    <Fade op={win(t, heroIn, L1 + 0.5, 0.05, 0.01)}>
      {burstP > 0 && burstP < 1 && (
        <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx={HOLE.x} cy={HOLE.y} r={60 + 420 * EASE.out(burstP)} fill="none" stroke={PALETTE.gold}
            strokeWidth={6 * (1 - burstP) + 1} opacity={0.6 * (1 - burstP)} />
        </svg>
      )}
      {/* the odds in the narrator's own words (10^30 alone didn't read), each word on its spoken time */}
      <Label y={CY - SAFE_RECT.h * 0.27}>ODDS: ALL ONE SIDE</Label>
      <KineticTitle x={CX} top={CY - SAFE_RECT.h * 0.22} size={112} lines={[
        [{ w: '1', start: oddsW[1].start, gold: true }, { w: 'in', start: oddsW[2].start }, { w: 'a', start: oddsW[3].start }, { w: 'million', start: oddsW[4].start }],
        [{ w: 'trillion', start: oddsW[5].start, gold: true }],
        [{ w: 'trillion', start: oddsW[6].start, gold: true }],
      ]} />
      <Fade op={curve(t, [oddsW[6].start + 0.45, oddsW[6].start + 0.85], [0, 1], EASE.out)}>
        <Label y={CY - SAFE_RECT.h * 0.22 + 112 * 3.15} size={26} spacing={6}>THAT&apos;S A 1 FOLLOWED BY 30 ZEROS</Label>
      </Fade>
    </Fade>
  );

  // ---------- REVEAL 4: inside the odds — entropy, shown: a sorted box mixes while the count of ways
  // to arrange it rolls up. Real numbers: 100 particles all on one side = 1 way (10^0); spread 50/50 =
  // C(100, 50) ≈ 1.0 × 10^29 ways. The exponent rolls on an odometer as the gas spreads. ----------
  const EBOX = { x: CX, y: SAFE_RECT.y + 610, w: SAFE_RECT.w * 0.86, h: SAFE_RECT.w * 0.5 };
  const eRel = C.number + 0.1; // the divider lifts on "number (of possible arrangements)"
  const WAYS = { y: EBOX.y + EBOX.h / 2 + 50, size: 128 };
  const entropyNode = (
    <Fade op={1 - curve(t, [C.so - 0.25, C.so + 0.1], [0, 1], EASE.in)}>
      <KineticTitle x={CX} top={SAFE_RECT.y + 70} size={130} lines={[[{ w: 'entropy', start: C.entropy, gold: true }]]} />
      <Fade op={curve(t, [C.number - 0.1, C.number + 0.35], [0, 1], EASE.out)}>
        <Label y={SAFE_RECT.y + 235}>= NUMBER OF ARRANGEMENTS</Label>
      </Fade>
      <ParticleBox x={EBOX.x} y={EBOX.y} w={EBOX.w} h={EBOX.h} releaseAt={F(eRel)} speed={7} dot={10} seed={9} at={F(L1) - 20} />
      <Fade op={curve(t, [L1 + 0.4, L1 + 0.8], [0, 1], EASE.out)}>
        <Label y={WAYS.y}>WAYS TO ARRANGE THEM</Label>
        <div style={{ position: 'absolute', left: CX - 150, top: WAYS.y + 50, ...TYPE.number, fontSize: WAYS.size, lineHeight: `${WAYS.size * 1.05}px`, color: PALETTE.ivory } as React.CSSProperties}>10</div>
        <OdometerNumber x={CX - 150 + WAYS.size * 1.24 - 8} y={WAYS.y + 30} size={WAYS.size * 0.6} digits={2} collapse
          value={[[F(eRel + 0.15), 0], [F(eRel + 2.6), 29, 'out']]} />
      </Fade>
    </Fade>
  );

  // ---------- REVEAL 5 → TWIST: the timeline, in 3D perspective while the camera flies along it ----------
  const timelineNode = (
    <>
      <Fade op={1 - curve(t, [C.death + 0.5, C.death + 1.1], [0, 1], EASE.in)} style={{ perspective: '1600px', perspectiveOrigin: `${CX}px ${TODAY_Y}px` }}>
        <AbsoluteFill style={{ transform: `translateY(${tlShift}px) rotateX(${tilt}deg)`, transformOrigin: `${CX}px ${TODAY_Y - tlShift}px` }}>
          <Timeline x={TL.x} y={TL.y} length={TL.L} range={[0, 13.8e9]} labelSize={TL_LABEL} at={F(C.direction + 0.2)}
            rescale={{ at: F(rsAt), len: Math.round(rsLen * FPS), range: LOG_RANGE, log: true }}
            events={[
              { t: 0, label: 'Big Bang', date: 'LOWEST ENTROPY', at: F(C.started), hero: true },
              { t: 13.8e9, label: 'Today', date: '13.8 BILLION YEARS', at: F(C.low) },
              { t: 1e14, label: 'Last stars fade', date: '100 TRILLION YEARS', at: F(C.last) },
              { t: 1e100, label: 'Black holes evaporate', date: 'UP TO A GOOGOL YEARS', at: F(C.black) },
              { t: 1e110, label: 'Heat death', at: F(C.heat), hero: true },
            ]} />
          <TimeStream x0={TL.x} y0={TL.y} x1={TL.x} y1={TL.y + TL.L} from={C.started - 0.2} to={C.death + 0.5} n={110} speed={300} spread={22} dot={6} seed={5} />
          <Ring x={TL.x} y={TL.y} t={t} at={C.started} r1={200} />
          <Ring x={TL.x} y={TL.y + TL.L} t={t} at={C.low} r1={160} w={4} />
          <Fade op={win(t, C.nobody, C.ever, 0.35, 0.4)}>
            <DataLabel x={TL.x + 54} y={TL.y + 150} label="WHY?" value="still unknown" size={60} />
          </Fade>
        </AbsoluteFill>
      </Fade>
      {/* a big black hole in the empty middle of the log axis, evaporating away */}
      {(() => {
        const r = 120 * (1 - curve(t, [C.evaporate - 0.1, C.heat - 0.3], [0, 1], EASE.in));
        const op = win(t, C.black + 0.05, C.heat, 0.4, 0.3);
        return r > 0.5 && op > 0 ? <Fade op={op}><BlackHole x={CX + 110} y={TODAY_Y + TL.L * 0.46} r={r} warm /></Fade> : null;
      })()}
    </>
  );

  // ---------- TWIST (a): star birth — its own scene between two whips; the drop rolls on an odometer ----------
  const barsNode = (
    <>
      <div style={{ position: 'absolute', left: SAFE_RECT.x + 80, top: SAFE_RECT.y + 150, ...TYPE.label, color: PALETTE.sciText } as React.CSSProperties}>STAR BIRTH RATE</div>
      <ComparisonBars x={SAFE_RECT.x + 80} y={SAFE_RECT.y + 240} width={SAFE_RECT.w - 200} gap={190} stagger={12} at={F(C.star + 0.2)} bars={[
        { label: 'PEAK', value: 100, unit: '%', display: '100%' },
        { label: 'TODAY', value: 10, unit: '%', display: '~10%', hero: true },
      ]} />
      <Fade op={curve(t, [C.ninety - 0.45, C.ninety - 0.2], [0, 1], EASE.out)}>
        <div style={{ position: 'absolute', left: SAFE_RECT.x + 80, top: SAFE_RECT.y + 700, ...TYPE.label, color: PALETTE.sciText } as React.CSSProperties}>DOWN</div>
        <OdometerNumber x={SAFE_RECT.x + 80 + 70} y={SAFE_RECT.y + 750} size={170} digits={2} prefix="−" suffix="%"
          value={[[F(C.ninety - 0.3), 0], [F(C.ninety + 0.9), 90, 'out']]} />
      </Fade>
    </>
  );

  return (
    <Grain>
      <AbsoluteFill style={{ background: PALETTE.space }}>
        <Camera x={camX} zoom={camZoom} drift={30} driftPeriod={8} driftAmp={driftAmp} punches={[F(heroIn), F(C.heat)]} blur={blurWins}>
          <CameraLayer depth={0.2}>
            <Starfield count={300} bright={12} seed={21} offs={offs} ons={ons} offAll clear={[[SAFE_RECT.x + 60, CAPTION.centerY - 60, SAFE_RECT.w - 120, 120]]} warm />
          </CameraLayer>
          <CameraLayer depth={0.55}>
            <Starfield count={60} bright={6} seed={57} offs={offsNear} ons={onsNear} offAll clear={[[SAFE_RECT.x + 60, CAPTION.centerY - 60, SAFE_RECT.w - 120, 120]]} warm />
          </CameraLayer>
          <CameraLayer depth={1}>

        {/* ---------- HOOK A ---------- */}
        {isA && (
          <>
            <Egg x={CX} y={CY} r={EGG_R} wash warm split={[[F(H.split0), 0], [F(H.split1), 1, 'punch']]}
              opacity={[[F(H.toCup), 1], [F(H.toCup + 0.25), 0]]} />
            <CoffeeCup x={CX} y={CY} r={CUP_R} swirl={0} spiral={[[F(H.toCup + 0.12), 0], [F(H.toCup + 0.3), 1, 'out']]}
              mix={[[F(H.toWord), 0], [F(H.toWord + 0.4), 0.35]]}
              opacity={[[F(H.toCup), 0], [F(H.toCup + 0.18), 1, 'out'], [F(H.toWord + 0.05), 1], [F(H.toWord + 0.3), 0]]} warm />
            <GoldMorphLine keys={hookLine} draw={[[0, 0.15], [F(0.5), 1, 'punch']]}
              opacity={[[F(H.write1 - 0.12), 1], [F(H.write1 + 0.1), 0]]} />
            <Fade op={1 - curve(t, [H.pull1 - 0.4, H.pull1 + 0.2], [0, 1], EASE.in)}
              style={{ transform: `scale(${pullK})`, transformOrigin: `${CX}px ${CY}px` }}>
              <WordDissolve text="goodbye" x={CX} y={WORD.y} size={WORD.size} spread={300} ghost={false}
                write={[[F(H.write0), 0], [F(H.write1), 1, 'linear']]} state={[[F(H.burst), 0], [F(H.burst + 0.3), 1, 'out']]}
                opacity={[[F(H.write0 - 0.01), 0], [F(H.write0), 1]]} />
            </Fade>
            <Fade op={win(t, H.pull0, 3.7, 0.15, 0.5)}>
              <ParallaxStars dist={pullD} cx={CX} cy={CY} z={[40, 150]} />
              <ParallaxStars dist={pullD} cx={CX} cy={CY} z={[-16, -0.3]} fillAt={12} count={150} bright={12} seed={33} />
            </Fade>
            <KineticTitle x={CX} top={CY - 190} size={124} outAt={C.l1 - 0.35} outLen={0.3}
              lines={[[{ w: 'Blame', start: VO[0].words![4].start }, { w: 'the', start: VO[0].words![5].start }],
                [{ w: 'Big', start: VO[0].words![6].start, gold: true }, { w: 'Bang.', start: VO[0].words![7].start, gold: true }]]} />
          </>
        )}

        {/* ---------- HOOK B + bridge ---------- */}
        {B && (
          <>
            <DeckOfCards x={DECK.x} y={DECK.y} radius={DECK.radius} arc={DECK.arc} cardW={DECK.cardW} warm edge={1}
              riffles={[F(B.r1), F(B.r2)]} riffleLen={30} opacity={[[F(B.toCrack - 0.1), 1], [F(B.toCrack + 0.3), 0]]} />
            <GoldMorphLine
              keys={[
                { pts: deckEdge(), at: 0 },
                { pts: eggCrackPts(CX, CY, EGG_R), at: F(B.toCrack), len: 12 },
                { pts: cupSpiralPts(CX, CY, CUP_R), at: F(B.toCup), len: 12 },
                { pts: morphScribble(...SCRIB), at: F(B.toWord), len: 12 },
              ]}
              opacity={[[F(B.toCrack - 0.15), 0], [F(B.toCrack), 1], [F(B.toWord + 0.5), 1], [F(B.toWord + 0.75), 0]]} />
            <Egg x={CX} y={CY} r={EGG_R} wash split={[[F(B.split), 0], [F(B.split + 0.45), 1, 'punch']]}
              opacity={[[F(B.toCrack + 0.1), 0], [F(B.toCrack + 0.4), 1], [F(B.toCup), 1], [F(B.toCup + 0.3), 0]]} warm />
            <CoffeeCup x={CX} y={CY} r={CUP_R} swirl={0} spiral={[[F(B.toCup + 0.25), 0], [F(B.toCup + 0.55), 1, 'out']]}
              mix={[[F(B.mix0), 0], [F(B.mix0 + 1.0), 1]]}
              opacity={[[F(B.toCup), 0], [F(B.toCup + 0.3), 1], [F(B.toWord), 1], [F(B.toWord + 0.3), 0]]} warm />
            <WordDissolve text="goodbye" x={CX} y={WORD.y} size={WORD.size} ghost={false}
              write={[[F(B.toWord + 0.1), 0], [F(B.toWord + 0.75), 1, 'linear']]} state={[[F(B.burst), 0], [F(B.burst + 0.4), 1, 'out']]}
              opacity={[[F(B.toWord + 0.09), 0], [F(B.toWord + 0.1), 1], [F(C.time + 0.2), 1], [F(C.time + 0.6), 0]]} />
          </>
        )}

        {/* ---------- SETUP A (a): failed rewinds ---------- */}
        {isA && (
          <>
            <Egg x={CX} y={CY} r={EGG_R} wash warm split={[[F(C.broken1), 1], [F(C.broken1 + 0.55), 0.45], [F(C.broken1 + 0.75), 0.45], [F(C.l2 - 0.2), 1, 'in']]}
              opacity={[[F(C.l1 - 0.35), 0], [F(C.l1 - 0.05), 1, 'out'], [F(C.l2 - 0.15), 1], [F(C.l2 + 0.15), 0]]} />
            <GoldMorphLine keys={[{ pts: eggCrackPts(CX, CY, EGG_R), at: 0 }, { pts: cupSpiralPts(CX, CY, CUP_R), at: F(C.l2 - 0.15), len: 12 }]}
              opacity={[[F(C.l2 - 0.3), 0], [F(C.l2 - 0.15), 1], [F(C.milk - 0.05), 1], [F(C.milk + 0.25), 0]]} />
            <CoffeeCup x={CX} y={CY} r={CUP_R} swirl={4} mix={[[F(C.milk), 1], [F(C.milk + 0.6), 0.45], [F(C.milk + 0.85), 0.45], [F(C.l3 - 0.15), 1, 'in']]}
              opacity={[[F(C.l2 - 0.15), 0], [F(C.l2 + 0.15), 1, 'out'], [F(C.l3 - 0.1), 1], [F(C.l3 + 0.2), 0]]} warm />
            <WordDissolve text="goodbye" x={CX} y={WORD.y} size={WORD.size}
              state={[[F(C.words), 1], [F(C.words + 0.75), 0.22], [F(C.regret + 0.25), 0.22], [F(C.regret + 0.8), 1, 'out']]}
              opacity={[[F(C.l3 - 0.2), 0], [F(C.l3 + 0.1), 1], [F(C.time + 0.2), 1], [F(C.time + 0.6), 0]]} />
          </>
        )}

        {/* ---------- SETUP (b): the dust streams into time's arrow ---------- */}
        <GoldMorphLine keys={arrowLine} width={10} dustSize={5} dust={[[F(C.time - 0.25), 1], [F(C.time + 0.5), 0]]} spread={300}
          opacity={[[F(C.time - 0.3), 0], [F(C.time - 0.1), 1], [F(C.but + 0.3), 1], [F(C.but + 0.45), 0]]} />
        <TimeStream x0={ARROW.x0} y0={ARROW.y} x1={ARROW.x1} y1={ARROW.y} from={C.time + 0.2} to={C.but + 0.2} n={80} spread={56} dot={7} seed={3} />
        {arrowHead > 0.001 && (
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: arrowHead }}>
            <path d={`M${ARROW.x1 - 50},${ARROW.y - 40} L${ARROW.x1 + 6},${ARROW.y} L${ARROW.x1 - 50},${ARROW.y + 40}`} fill="none"
              stroke={PALETTE.gold} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        {/* ---------- whip 1: "Why?" → the box ---------- */}
        <WhipTransition at={W1} dur={8} direction="left" from={collisionNode} to={boxNode} />

        {/* ---------- match cut: the box's frame becomes the balance beam ---------- */}
        <ShapeMatch color="ivory" outline={3} alpha={0.55} glow={0}
          keys={[{ g: { x: BOX.x, y: BOX.y, w: BOX.w, h: BOX.h, r: 0 }, at: 0 }, { g: lineGeom(CX - BAL.span, BAL.y, CX + BAL.span, BAL.y, 4), at: F(M), len: 18 }]}
          opacity={[[F(M) - 1, 0], [F(M), 1], [F(M) + 24, 1], [F(M) + 34, 0]]} />
        <Fade op={win(t, M + 0.2, C.about - 0.1, 0.5, 0.35) * 0.3}>
          <ParticleBox x={CX} y={CY + SAFE_RECT.h * 0.1} w={SAFE_RECT.w * 0.9} h={SAFE_RECT.h * 0.55} releaseAt={-1000} speed={6} dot={8} box={0} seed={4} />
        </Fade>
        <Fade op={win(t, M, C.about - 0.1, 0.01, 0.35)}>
          <Balance x={CX} y={BAL.y} span={BAL.span} at={F(M) + 14} labelsAt={F(C.ways)} tipAt={F(C.mixed)}
            tipFrames={14} tipEase="punch" valueSize={60}
            left={{ label: 'SORTED', value: 1, display: '1 way', glyph: 'point' }}
            right={{ label: 'MIXED', value: 1e30, display: 'all the rest', glyph: 'stars' }} />
        </Fade>

        {/* ---------- fly-through: into the odds, out in the entropy gas ---------- */}
        <FlyThrough from={heroNode} to={entropyNode} at={FLY_AT} len={FLY_LEN} x={HOLE.x} y={HOLE.y} hole={34} />

        {/* the arrow returns and becomes the timeline's axis (the gold line's match cut) */}
        <GoldMorphLine keys={axisLine} width={6} draw={[[F(C.so - 0.05), 0], [F(C.so + 0.5), 1, 'out']]}
          opacity={[[F(C.started - 0.2), 1], [F(C.started + 0.3), 0]]} />

        {/* ---------- whips 2 + 3: timeline → star birth → timeline ---------- */}
        <WhipTransition at={W2} dur={8} direction="left" from={timelineNode}
          to={<WhipTransition at={W3} dur={8} direction="right" from={barsNode} to={timelineNode} />} />

        {isA ? (
          <Egg x={CX} y={CY} r={EGG_R} wash warm opacity={[[F(C.loop + 0.2), 0], [F(C.loop + 1.3), 1, 'out']]} />
        ) : (
          <DeckOfCards x={DECK.x} y={DECK.y} radius={DECK.radius} arc={DECK.arc} cardW={DECK.cardW} edge={1}
            at={LAST_F - (100000 % 75) - 75 * 4} /* glint phase on the last frame = the warm hook deck's on frame 0 */ opacity={[[F(C.loop + 0.6), 0], [F(C.loop + 1.8), 1, 'out']]} />
        )}

        {/* the last faint gold point → crack (A) / the fan's edge (B) */}
        <GoldMorphLine keys={pointLine} draw={isA ? 0.15 : 1} width={isA ? 4 : 4}
          opacity={isA
            ? [[F(C.death + 0.5), 0], [F(C.death + 0.9), 1], [F(C.loop + 1.0), 1]]
            : [[F(C.death + 0.5), 0], [F(C.death + 0.9), 1], [F(C.loop + 1.6), 1], [F(C.loop + 2.1), 0]]} />
        {/* the point's glow: the last light in the universe, breathing until it becomes the crack */}
        {(() => {
          const g = win(t, C.death + 0.6, C.loop + 0.35, 0.4, 0.3);
          if (g <= 0) return null;
          const k = curve(t, [C.death + 0.9, C.death + 2.1], [0, 1], EASE.inOut);
          const px = TL.x + (CX - TL.x) * k, py = TODAY_Y + TL.L + (CY - TODAY_Y - TL.L) * k;
          const br = 1 + 0.15 * Math.sin(t * 3);
          return (
            <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
              <defs><radialGradient id="lastLight"><stop offset="0%" stopColor={PALETTE.gold} stopOpacity={0.9} /><stop offset="35%" stopColor={PALETTE.gold} stopOpacity={0.35} /><stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} /></radialGradient></defs>
              <circle cx={px} cy={py} r={70 * br} fill="url(#lastLight)" opacity={g} />
              <circle cx={px} cy={py} r={9} fill={PALETTE.ivory} opacity={g} />
            </svg>
          );
        })()}
          </CameraLayer>
        </Camera>
        <KeywordCaptions lines={lines} maxChars={18} />
      </AbsoluteFill>
    </Grain>
  );
};
