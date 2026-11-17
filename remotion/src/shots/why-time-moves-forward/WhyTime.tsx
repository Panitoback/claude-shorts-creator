import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, CAPTION, EASE, PALETTE, SAFE_RECT, TYPE } from '../../brand';
import {
  Balance, BlackHole, CoffeeCup, ComparisonBars, DataLabel, DeckOfCards, Egg, GoldMorphLine, Grain, KeywordCaptions,
  KineticTitle, ParallaxStars, ParticleBox, Starfield, Timeline, WordDissolve, cupSpiralPts, eggCrackPts, keyNorm,
  morphLine, morphPoint, morphScribble,
} from '../../components';
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

export type Variant = 'a' | 'b';
const FPS = CANVAS.FPS;
const F = (s: number) => Math.round(s * FPS);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const curve = (t: number, xs: number[], ys: number[], e: (x: number) => number = EASE.inOut) =>
  interpolate(t, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
// visible window: fade in over inLen from a, fade out over outLen from b
const win = (t: number, a: number, b: number, inLen = 0.3, outLen = 0.3) =>
  Math.min(curve(t, [a, a + inLen], [0, 1], EASE.out), 1 - curve(t, [b, b + outLen], [0, 1], EASE.in));
const Fade: React.FC<{ op: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ op, children, style }) =>
  op <= 0.001 ? null : <AbsoluteFill style={{ opacity: Math.min(1, op), ...style }}>{children}</AbsoluteFill>;

// ---- layout (from the safe rectangle) ----
const CX = SAFE_RECT.x + SAFE_RECT.w / 2; // 480
const CY = SAFE_RECT.y + SAFE_RECT.h * 0.42; // ≈ 718: the hero object's center
const EGG_R = SAFE_RECT.w * 0.27;
const CUP_R = SAFE_RECT.w * 0.22;
const WORD = { y: CY - SAFE_RECT.h * 0.09, size: 170 };
const SCRIB: [number, number, number, number] = [CX - 300, CY + 40, 600, 110];
const ARROW = { x0: CX - SAFE_RECT.w * 0.38, x1: CX + SAFE_RECT.w * 0.38, y: CY };
const TL = { x: SAFE_RECT.x + 140, y: SAFE_RECT.y + 90, L: 720 };
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

const Label: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: 'absolute', left: CX - 420, width: 840, top: y, textAlign: 'center', ...TYPE.label, color: PALETTE.sciText } as React.CSSProperties}>{children}</div>
);

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

  // ================= shared body: positions =================
  const glideK = curve(t, [C.l20end - 0.1, C.ever + 0.6], [0, 1], EASE.inOut); // camera glides down to TODAY
  const rsAt = C.in23 - 0.1;
  const rsLen = 1.4;
  const rsK = curve(t, [rsAt, rsAt + rsLen], [0, 1], EASE.inOut); // same easing/window as the Timeline rescale
  const tlShift = GLIDE * glideK + (TODAY_Y - TL.y - GLIDE) * rsK; // keeps TODAY parked at TODAY_Y during the rescale
  const bhY = TL.y + TL.L * logU(1e100) + tlShift;

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
  const offs = [F(C.last + 0.15), F(C.last + 0.55), F(C.last + 0.95), F(C.fade + 0.2), F(C.black + 0.1), F(C.black + 0.5),
    F(C.evaporate), F(C.evaporate + 0.4), F(C.heat - 0.1), F(C.death + 0.2), F(C.death + 0.6), F(C.no)];
  const ons = offs.map((_, i) => F(C.loop + 0.4 + i * 0.12));

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
  const burstP = clamp01((t - C.one) / 0.7);
  const heroIn = C.one - 0.12;
  const oddsW = VO[15].words!; // About · one · in · a · million · trillion · trillion.

  return (
    <Grain>
      <AbsoluteFill style={{ background: PALETTE.space }}>
        <Starfield count={300} bright={12} seed={21} offs={offs} ons={ons} clear={[[SAFE_RECT.x + 60, CAPTION.centerY - 60, SAFE_RECT.w - 120, 120]]} warm />

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
        <GoldMorphLine keys={arrowLine} dust={[[F(C.time - 0.25), 1], [F(C.time + 0.5), 0]]} spread={300}
          opacity={[[F(C.time - 0.3), 0], [F(C.time - 0.1), 1], [F(C.but + 0.3), 1], [F(C.but + 0.45), 0]]} />
        {arrowHead > 0.001 && (
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: arrowHead }}>
            <path d={`M${ARROW.x1 - 26},${ARROW.y - 20} L${ARROW.x1 + 4},${ARROW.y} L${ARROW.x1 - 26},${ARROW.y + 20}`} fill="none"
              stroke={PALETTE.gold} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        {/* ---------- SETUP (c): a collision, forward then reversed ---------- */}
        <Fade op={win(t, C.but + 0.3, C.counting - 0.1, 0.3, 0.35)}>
          <ParticleBox x={CX} y={CY} w={SAFE_RECT.w * 0.86} mode="collide" box={0}
            clock={[[F(C.physics - 0.1), 0], [F(C.physics + 1.4), 1, 'linear'], [F(C.reverse - 0.6), 1], [F(C.reverse + 0.9), 0, 'linear']]} />
          <Fade op={win(t, C.physics - 0.05, C.reverse - 0.75, 0.25, 0.2)}>
            <Label y={CY - SAFE_RECT.h * 0.22}>FORWARD</Label>
          </Fade>
          <Fade op={win(t, C.reverse - 0.55, C.why1 - 0.1, 0.25, 0.25)}>
            <Label y={CY - SAFE_RECT.h * 0.22}>REVERSED</Label>
          </Fade>
        </Fade>
        <KineticTitle x={CX} top={CY - SAFE_RECT.h * 0.2} size={110} outAt={C.counting - 0.4} outLen={0.25}
          lines={[[{ w: 'Why?', start: C.why1, gold: true }]]} />

        {/* ---------- REVEAL 1–2: a hundred particles, the divider lifts, they mix ---------- */}
        <Fade op={win(t, C.counting - 0.2, C.vastly + 0.4, 0.3, 0.45)}
          style={{ transform: `translateX(${-SAFE_RECT.w * 0.6 * curve(t, [C.vastly, C.vastly + 0.8], [0, 1], EASE.in)}px)` }}>
          <ParticleBox x={CX} y={CY} w={SAFE_RECT.w * 0.86} h={SAFE_RECT.w * 0.62} releaseAt={F(C.go)} speed={6}
            gather={{ from: [CX - SAFE_RECT.w * 0.2, CY], at: F(C.counting), len: 40 }} at={F(C.counting - 0.2)} />
        </Fade>
        <Fade op={win(t, C.vastly + 0.35, C.about - 0.1, 0.4, 0.35)}>
          <Balance x={CX} y={CY - 40} span={SAFE_RECT.w * 0.33} at={F(C.vastly + 0.35)} labelsAt={F(C.ways)} tipAt={F(C.mixed)}
            tipFrames={14} tipEase="punch" valueSize={60}
            left={{ label: 'SORTED', value: 1, display: '1 way', glyph: 'point' }}
            right={{ label: 'MIXED', value: 1e30, display: 'all the rest', glyph: 'stars' }} />
        </Fade>

        {/* ---------- REVEAL 3: the main reveal — 1 in 10^30 (burst, then settle) ---------- */}
        <Fade op={win(t, heroIn, C.thats - 0.25, 0.05, 0.35)}>
          {burstP > 0 && burstP < 1 && (
            <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
              <circle cx={CX} cy={CY - SAFE_RECT.h * 0.06} r={60 + 420 * EASE.out(burstP)} fill="none" stroke={PALETTE.gold}
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
          <Fade op={curve(t, [oddsW[6].end + 0.05, oddsW[6].end + 0.45], [0, 1], EASE.out)}>
            <Label y={CY - SAFE_RECT.h * 0.22 + 112 * 3.15}>THAT&apos;S A 1 FOLLOWED BY 30 ZEROS</Label>
          </Fade>
        </Fade>

        {/* ---------- REVEAL 4: entropy = the number of arrangements ---------- */}
        <Fade op={win(t, C.thats - 0.2, C.so - 0.2, 0.4, 0.4) * 0.28}>
          <ParticleBox x={CX} y={CY + SAFE_RECT.h * 0.12} w={SAFE_RECT.w * 0.86} h={SAFE_RECT.w * 0.5} releaseAt={-1000} speed={4} box={0} seed={9} />
        </Fade>
        <Fade op={1 - curve(t, [C.so - 0.25, C.so + 0.1], [0, 1], EASE.in)}>
          <KineticTitle x={CX} top={CY - SAFE_RECT.h * 0.22} size={130} lines={[[{ w: 'entropy', start: C.entropy, gold: true }]]} />
          <Fade op={curve(t, [C.number - 0.1, C.number + 0.35], [0, 1], EASE.out)}>
            <div style={{ position: 'absolute', left: CX - 420, width: 840, top: CY - SAFE_RECT.h * 0.22 + 175, textAlign: 'center', ...TYPE.label, color: PALETTE.sciText } as React.CSSProperties}>
              = NUMBER OF ARRANGEMENTS
            </div>
          </Fade>
        </Fade>

        {/* ---------- REVEAL 5 → TWIST: the arrow becomes the timeline's axis ---------- */}
        <GoldMorphLine keys={axisLine} draw={[[F(C.so - 0.05), 0], [F(C.so + 0.5), 1, 'out']]}
          opacity={[[F(C.started - 0.2), 1], [F(C.started + 0.3), 0]]} />
        <Fade op={1 - curve(t, [C.death + 0.5, C.death + 1.1], [0, 1], EASE.in)} style={{ transform: `translateY(${tlShift}px)` }}>
          <Timeline x={TL.x} y={TL.y} length={TL.L} range={[0, 13.8e9]} labelSize={44} at={F(C.direction + 0.2)}
            rescale={{ at: F(rsAt), len: Math.round(rsLen * FPS), range: LOG_RANGE, log: true }}
            events={[
              { t: 0, label: 'Big Bang', date: 'LOWEST ENTROPY', at: F(C.started), hero: true },
              { t: 13.8e9, label: 'Today', date: '13.8 BILLION YEARS', at: F(C.low) },
              { t: 1e14, label: 'Last stars fade', date: '100 TRILLION YEARS', at: F(C.last) },
              { t: 1e100, label: 'Black holes evaporate', date: 'UP TO A GOOGOL YEARS', at: F(C.black) },
              { t: 1e110, label: 'Heat death', at: F(C.heat), hero: true },
            ]} />
          <Fade op={win(t, C.nobody, C.ever, 0.35, 0.4)}>
            <DataLabel x={TL.x + 44} y={TL.y + 96} label="WHY?" value="still unknown" size={44} />
          </Fade>
        </Fade>
        {/* a small black hole beside its marker, shrinking away */}
        {(() => {
          const r = 34 * (1 - curve(t, [C.evaporate - 0.1, C.evaporate + 1.0], [0, 1], EASE.in));
          const op = win(t, C.black + 0.1, C.heat, 0.3, 0.3);
          return r > 0.5 && op > 0 ? <Fade op={op}><BlackHole x={TL.x - 80} y={bhY} r={r} warm /></Fade> : null;
        })()}

        {/* TWIST (a): star birth, peak vs today — grows out of the TODAY marker */}
        <Fade op={win(t, C.star - 0.1, C.in23 - 0.2, 0.3, 0.4)} style={{ transform: `scaleY(${1 - curve(t, [C.in23 - 0.2, C.in23 + 0.2], [0, 1], EASE.in)})`, transformOrigin: `0 ${TODAY_Y}px` }}>
          <div style={{ position: 'absolute', left: TL.x + 44, top: TODAY_Y + 110, ...TYPE.annotation, color: PALETTE.sciText } as React.CSSProperties}>STAR BIRTH RATE</div>
          <ComparisonBars x={TL.x + 44} y={TODAY_Y + 190} width={SAFE_RECT.w - 220} gap={170} stagger={12} at={F(C.star + 0.2)} bars={[
            { label: 'PEAK', value: 100, unit: '%', display: '100%' },
            { label: 'TODAY', value: 10, unit: '%', display: '~10%', hero: true },
          ]} />
        </Fade>

        {isA ? (
          <Egg x={CX} y={CY} r={EGG_R} wash warm opacity={[[F(C.loop + 0.5), 0], [F(C.loop + 1.6), 1, 'out']]} />
        ) : (
          <DeckOfCards x={DECK.x} y={DECK.y} radius={DECK.radius} arc={DECK.arc} cardW={DECK.cardW} edge={1}
            at={LAST_F - (100000 % 75) - 75 * 4} /* glint phase on the last frame = the warm hook deck's on frame 0 */ opacity={[[F(C.loop + 0.6), 0], [F(C.loop + 1.8), 1, 'out']]} />
        )}

        {/* the last faint gold point → crack (A) / the fan's edge (B) */}
        <GoldMorphLine keys={pointLine} draw={isA ? 0.15 : 1} width={4}
          opacity={isA
            ? [[F(C.death + 0.5), 0], [F(C.death + 0.9), 0.6], [F(C.loop + 0.2), 0.6], [F(C.loop + 1.0), 1]]
            : [[F(C.death + 0.5), 0], [F(C.death + 0.9), 0.6], [F(C.loop + 0.2), 0.6], [F(C.loop + 1.0), 1], [F(C.loop + 1.6), 1], [F(C.loop + 2.1), 0]]} />
        <KeywordCaptions lines={lines} maxChars={18} />
      </AbsoluteFill>
    </Grain>
  );
};
