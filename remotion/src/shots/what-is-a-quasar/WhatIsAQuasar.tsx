import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, PALETTE } from '../../brand';
import {
  DataLabel, Grain, HeroNumber, HostGalaxy, InfallingGas, KeywordCaptions, KineticTitle, Marker, ParallaxStars, Quasar,
  keyNorm, quasarExposure,
} from '../../components';
import type { CaptionLine, KineticWord } from '../../components';
import type { VoLine } from '../../lib/shorts';
import { DURATION_S, HOOKS, VO } from './vo.gen';

// "What is a quasar?" — shorts/what-is-a-quasar/guion.md. Brand v2.0 (energy curve).
// VOICE-FIRST: every cue below is read from the REAL word times in vo.gen.ts, so re-laying the
// voice moves the animation with it.
//
// ONE camera, ONE persistent scene (the quasar never cuts):
//   HOOK (opening 2, "pull-back"): frame 0 is an extreme close-up of the disk's bright side at the
//     shadow's edge; ~1 s in, a fast pull-back (EASE.punch, log-scale zoom) through depth stars
//     reveals the quasar; it flares to full power on the hook's key word. A kinetic title says the
//     hook line word by word (variants: A title / B title + hero number / C question).
//   BODY: the short's calm dials (luminosity, disk, jets) and a slow push-in.
//   TWIST: the camera pulls far back; the quasar becomes one bright point among the stars.
//   LOOP: on "We still see them blazing" the camera flies from that point into the blazing disk,
//     landing exactly on frame 0's close-up (same camera, same dials, no text) — seamless replay.

export type Variant = 'a' | 'b' | 'c';
const FPS = CANVAS.FPS;
export const TOTAL_FRAMES = Math.round(DURATION_S * FPS);
const QX = 480; // safe-rect center
const QY = 900;
const R = 72; // shadow radius at rest framing
const SIZE_MIN = (0.07 * 46) / R; // the distant point (twist) keeps its approved pixel size
const K0 = 5.5; // frame 0 close-up: the quasar's apparent scale

// real time (s) a word starts: line + the spoken word's first letters
const wordIn = (line: VoLine, word: string) => {
  const w = line.words?.find((x) => keyNorm(x.w).startsWith(word.toLowerCase()));
  if (!w) throw new Error(`cue word "${word}" not in "${line.text}"`);
  return w.start;
};
const at = (line: number, word: string) => wordIn(VO[line], word);

// cues (seconds), all from the voice
const C = {
  quasar: at(1, 'kway'), // "It's called a quasar." → the hook text leaves
  blackHole: at(2, 'black'), // dial to dormant, marker on the shadow
  noLight: at(4, 'no'), // the disk fades out completely
  lightComes: at(7, 'the'), // REVEAL step 1: marker clears
  disk: at(9, 'disk'), // the disk fades back in, dim orange
  heats: at(10, 'heats'), // brightness rises
  tens: at(10, 'tens'), // temperature label
  beats: at(11, 'beats'), // label swaps
  feed: at(13, 'feed'), // step 3: luminosity climbs
  galaxy: at(13, 'galaxy'),
  combined: at(14, 'combined'), // THE hero moment: full power
  jets: at(15, 'jets'),
  twist: at(17, 'almost'),
  billions: at(17, 'billions'), // pull far back: a point among the stars
  fuel: at(19, 'fuel'), // the point dims
  thirteen: at(21, 'thirteen'), // hero number
  loop: at(23, 'we'),
  still: at(23, 'still'), // the fly-in starts: "still see them blazing"
};

// ---- hook, per variant: kinetic text pages + the flare word -------------------------------------
type Hook = { pages: { lines: KineticWord[][]; out: number }[]; flare: number; hero?: { at: number } };
const HOOK_OUT = C.quasar - 0.25;
const hookOf = (v: Variant): Hook => {
  const h = HOOKS[v];
  const w = (word: string, gold = false): KineticWord => {
    const x = h.words!.find((y) => keyNorm(y.w).startsWith(word.toLowerCase()))!;
    return { w: x.w, start: x.start, gold };
  };
  // pages swap ~0.1 s before the next page's first word; lines ≤ 14 characters (title size fits)
  if (v === 'b') {
    // "This outshines" → the hero number arrives on "up to a thousand galaxies"
    return { pages: [{ lines: [[w('This')], [w('outshines')]], out: wordIn(h, 'up') - 0.12 }], flare: wordIn(h, 'thousand'), hero: { at: wordIn(h, 'up') } };
  }
  if (v === 'c') {
    return {
      pages: [
        { lines: [[w('What'), w('can')], [w('shine'), w('like')]], out: wordIn(h, 'a') - 0.12 },
        { lines: [[w('a'), w('thousand', true)], [w('galaxies')]], out: HOOK_OUT },
      ],
      flare: wordIn(h, 'thousand'),
    };
  }
  return {
    pages: [
      { lines: [[w('Black'), w('holes')], [w('power')]], out: wordIn(h, 'the') - 0.12 },
      { lines: [[w('the'), w("universe's")], [w('brightest', true)], [w('lights')]], out: HOOK_OUT },
    ],
    flare: wordIn(h, 'brightest'),
  };
};

// per-line KEYWORD (guion.md), so a keyword lights up in its own beat only
const KEYS: Record<number, string[]> = {
  1: ['quasar'], 4: ['light'], 6: ['shining'], 9: ['disk'], 10: ['heats'], 12: ['ten'], 13: ['galaxy'],
  15: ['jets'], 17: ['billions'], 18: ['young'], 19: ['fuel'], 22: ['Earth'], 23: ['blazing'],
};

const CAM_PUSH = 1.12; // slow body push-in (×)
const S = (f: number) => f / FPS;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const curve = (t: number, xs: number[], ys: number[], e = EASE.inOut) =>
  interpolate(t, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });

// ---- the camera ----------------------------------------------------------------------------------
// The quasar's apparent scale k (1 = rest framing), built in LOG space so moves compose:
//   hook pull-back (K0 → 1) · body push (1 → 1.12, released in the twist) · twist (1 → point) ·
//   loop fly-in (point → K0). At the last frame the factors multiply back to exactly K0 = frame 0.
const PB = { t0: 0.95, t1: 0.95 + 1.7 }; // hold the close-up ~1 s, then pull back fast
const LOOP = { t0: C.still - 0.12, t1: DURATION_S };
const logK = (t: number) => {
  const hook = t < PB.t0 ? Math.log(lerp(K0, 5.4, t / PB.t0)) : curve(t, [PB.t0, PB.t1], [Math.log(5.4), 0], EASE.punch);
  const push = Math.log(curve(t, [2.9, C.blackHole + 1.6, C.billions - 0.2, C.billions + 2.0], [1, CAM_PUSH, CAM_PUSH, 1]));
  const size = Math.log(curve(t, [C.billions - 0.2, C.billions + 2.0], [1, SIZE_MIN]));
  // the fly-in: fast through "still see them blazing", a long soft landing on frame 0's framing
  const fly = curve(t, [LOOP.t0, LOOP.t1], [0, Math.log(K0 / SIZE_MIN)], EASE.punch);
  return hook + push + size + fly;
};
// the close-up looks at a point on the disk's bright (approaching, left) side at the shadow's edge,
// placed at S0 on screen; as k → 1 that focus slides back to the rest framing (identity)
const FOCUS = (() => {
  const a = (-8 * Math.PI) / 180;
  const lx = -1.75 * R;
  const ly = 0.08 * R;
  return { x: QX + lx * Math.cos(a) - ly * Math.sin(a), y: QY + lx * Math.sin(a) + ly * Math.cos(a) };
})();
const S0 = { x: 470, y: 980 };
// screen position of the quasar's center for scale k (k ≤ 1: zoom about the quasar itself)
const centerAt = (k: number, closeUpPhase: boolean) => {
  if (k <= 1 || !closeUpPhase) return { x: QX, y: QY };
  const u = (k - 1) / (K0 - 1);
  const sx = lerp(FOCUS.x, S0.x, u);
  const sy = lerp(FOCUS.y, S0.y, u);
  return { x: sx + (QX - FOCUS.x) * k, y: sy + (QY - FOCUS.y) * k };
};

// fade wrapper for elements that leave (components only animate their arrival)
const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0 ? null : <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
const out = (f: number, t: number, len = 0.5) =>
  1 - interpolate(S(f), [t, t + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.in });

export const WhatIsAQuasar: React.FC<{ variant: Variant }> = ({ variant }) => {
  const f = useCurrentFrame();
  const t = S(f);
  const hook = hookOf(variant);

  // ---- the quasar's dials (one scene, evolving) ----
  // hook: 0.75 during the pull-back (so the depth stars read), a flare to full on the key word
  const hookL = 0.75 + 0.25 * curve(t, [hook.flare - 0.1, hook.flare + 0.45], [0, 1], EASE.punch);
  const bodyL = curve(t,
    [C.quasar, C.blackHole + 1.6, C.heats - 0.1, C.heats + 2.7, C.feed + 0.1, C.galaxy + 0.1, C.combined - 0.05, C.combined + 0.6, C.fuel - 0.3, C.fuel + 1.4, LOOP.t0, LOOP.t0 + 1.6],
    [1, 0, 0, 0.45, 0.45, 0.85, 0.85, 1, 1, 0.15, 0.15, 0.75]);
  const L = t < C.quasar ? hookL : bodyL;
  const D = curve(t, [C.noLight - 0.1, C.noLight + 1.5, C.disk - 0.15, C.disk + 1.15], [1, 0, 0, 1]);
  const J = curve(t, [C.jets - 0.1, C.jets + 0.9, C.billions - 0.8, C.billions], [0, 1, 1, 0]);

  // ---- camera ----
  const k = Math.exp(logK(t));
  const dist = 1 / k;
  const closeUpPhase = t < 3 || t > LOOP.t0;
  const c = centerAt(k, closeUpPhase);
  const exp = quasarExposure(L * D);
  const far = clamp01((dist - 1) / 3); // far away it's just another star in a normal sky
  const starsOp = lerp(exp.stars, 1, far);
  const galaxyOp = clamp01(1 - (dist - 1.5) / 5); // too faint to see once it's a point
  const point = clamp01((dist - 3) / 8); // far away a quasar looks like a star ("quasi-stellar")
  const nearStars = clamp01(1 - (dist - 1.5) / 1.5); // the near depth layer is for close moves only
  const fgStars = t > LOOP.t0 - 0.5 ? clamp01((t - (LOOP.t0 - 0.5)) / 0.4) : 0; // stars the fly-in passes

  // ---- captions: none during the hook (the kinetic text says those words), back with SETUP ----
  const lines: CaptionLine[] = VO.slice(1).map((l, i) => ({ ...l, keywords: KEYS[i + 1] ?? [] }));
  const F = (s: number) => Math.round(s * FPS);

  const small = k <= 1; // ≤ 1: draw at rest size and shrink with CSS; > 1: scale the geometry (sharp)
  const qx = small ? QX : c.x;
  const qy = small ? QY : c.y;
  const qr = small ? R : R * k;
  const qProps = {
    luminosity: L, disk: D, jets: J, jetLength: R * 4.5 * (small ? 1 : k), loopFrames: TOTAL_FRAMES,
    breathe: 0.07, breathePeriod: 75, hotspots: 3, hotspotPeriod: 135, streaks: 0.3,
    drift: 1.2 * Math.max(1, k), corona: 1 / Math.max(1, Math.sqrt(k)), warm: true,
  };
  const gas = { luminosity: L * D, opacity: D * clamp01((k - 0.2) / 0.4), loopFrames: TOTAL_FRAMES };
  const body = (
    <>
      <HostGalaxy x={qx} y={qy} rx={520 * (small ? 1 : k)} dim={exp.galaxy * galaxyOp} warm />
      <InfallingGas x={qx} y={qy} shadowR={qr} {...gas} layer="back" />
      <Quasar x={qx} y={qy} shadowR={qr} {...qProps} />
      <InfallingGas x={qx} y={qy} shadowR={qr} {...gas} layer="front" />
    </>
  );
  const textClear: [number, number, number, number][] = [[60, 210, 840, 420], [160, 1270, 760, 150]];

  return (
    <Grain>
      <AbsoluteFill style={{ backgroundColor: PALETTE.space }}>
        {/* depth stars: a far layer always; a near layer for the close-up moves */}
        <ParallaxStars dist={dist} cx={c.x} cy={c.y} count={200} z={[40, 150]} opacity={starsOp} clear={textClear} seed={21} />
        <ParallaxStars dist={dist} cx={c.x} cy={c.y} count={160} z={[0.25, 3]} opacity={starsOp * nearStars} clear={textClear} seed={22} bright={6} />

        {/* the persistent scene */}
        {small
          ? <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: `${QX}px ${QY}px` }}>{body}</AbsoluteFill>
          : body}
        {point > 0 && (
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <defs>
              <radialGradient id="qPoint">
                <stop offset="0%" stopColor={PALETTE.ivory} stopOpacity={0.9} />
                <stop offset="30%" stopColor={PALETTE.gold} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
              </radialGradient>
            </defs>
            <circle cx={c.x} cy={c.y} r={26} fill="url(#qPoint)" opacity={point * (0.4 + 0.6 * L)} />
            <circle cx={c.x} cy={c.y} r={4.5} fill={PALETTE.ivory} opacity={point * (0.5 + 0.5 * L)} />
          </svg>
        )}
        {fgStars > 0 && (
          <ParallaxStars dist={dist} cx={c.x} cy={c.y} count={150} z={[-(1 / SIZE_MIN - 0.6), -0.3]} fillAt={1 / SIZE_MIN}
            opacity={fgStars} clear={textClear} seed={33} bright={14} />
        )}

        {/* HOOK: kinetic text pages (+ B's hero number) */}
        {hook.pages.map((p, i) => (
          <KineticTitle key={i} lines={p.lines} x={QX} outAt={p.out} outLen={i < hook.pages.length - 1 ? 0.12 : 0.35} />
        ))}
        {hook.hero && (
          <Fade op={out(f, HOOK_OUT, 0.35)}>
            <HeroNumber value={1000} grouping subject="galaxies" label="UP TO" x={QX} y={240} count={false} at={F(hook.hero.at - 0.05)} />
          </Fade>
        )}

        {/* SETUP: the shadow, named */}
        <Fade op={out(f, C.lightComes)}>
          <Marker x={QX} y={QY} ringR={(R + 10) * k} side="above" length={120} label="SUPERMASSIVE BLACK HOLE" at={F(C.blackHole + 0.5)} />
        </Fade>

        {/* REVEAL step 1 → 2: the data label swaps */}
        <Fade op={out(f, C.beats - 0.45, 0.35)}>
          <DataLabel x={QX} y={300} align="center" label="DISK TEMPERATURE" value="UP TO 100,000 K" at={F(C.tens)} />
        </Fade>
        <Fade op={out(f, C.feed - 0.1)}>
          <DataLabel x={QX} y={300} align="center" label="POUND FOR POUND" value="~10× FUSION" at={F(C.beats)} />
        </Fade>

        {/* REVEAL step 4: just above the upper jet's tip */}
        <Fade op={out(f, C.twist - 0.4)}>
          <DataLabel x={QX} y={410} align="center" label="STRONG JETS" value="~1 IN 10 QUASARS" size={46} at={F(C.jets + 0.5)} />
        </Fade>

        {/* TWIST: a point among the stars, then the farthest one's number; both leave as the fly-in starts */}
        <Fade op={out(f, LOOP.t0 - 0.35, 0.4)}>
          <Marker x={QX} y={QY} side="below" length={70} label="QUASAR" at={F(C.billions + 1.6)} />
          <HeroNumber value={13} unit="billion" subject="years ago" label="FARTHEST QUASAR" x={QX} y={240} at={F(C.thirteen - 0.15)} />
        </Fade>

        <KeywordCaptions lines={lines} />
      </AbsoluteFill>
    </Grain>
  );
};
