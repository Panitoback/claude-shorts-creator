import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, MOTION, PALETTE, TYPE } from '../../brand';
import {
  DataLabel, Grain, HeroNumber, HostGalaxy, KeywordCaptions, Marker, Quasar, Starfield, keyNorm, quasarExposure, ramp,
} from '../../components';
import type { CaptionLine } from '../../components';
import { DURATION_S, VO } from './vo.gen';

// "What is a quasar?" — shorts/what-is-a-quasar/guion.md. VOICE-FIRST: the voice was generated at
// its natural pace (gen_voice.py --natural) and every cue below is read from the REAL word times
// in vo.gen.ts (`at(line, word)`), so re-laying the voice moves the animation with it.
// One persistent scene: the quasar never cuts; its dials (luminosity, disk, jets, size) evolve.
// Three hook variants (A/B/C) share everything after the hook; each variant's last frame carries
// its own hook text, so every loop is seamless (last frame == frame 0).

export type Variant = 'a' | 'b' | 'c';
const FPS = CANVAS.FPS;
export const TOTAL_FRAMES = Math.round(DURATION_S * FPS);
const QX = 480; // safe-rect center
const QY = 900;
const R = 72; // shadow radius at hook size (outer disk 9.2R ≈ 660 px, bright disk ≈ half the safe width)

// real time (s) a word starts: line index + the spoken word's first letters
const at = (line: number, word: string) => {
  const w = VO[line].words?.find((x) => keyNorm(x.w).startsWith(word.toLowerCase()));
  if (!w) throw new Error(`cue word "${word}" not in VO line ${line}`);
  return w.start;
};

// cues (seconds), all from the voice
const C = {
  quasar: at(1, 'kway'), // "It's called a quasar." → the title leaves
  blackHole: at(2, 'black'), // dial to dormant, marker on the shadow
  noLight: at(4, 'no'), // the disk fades out completely
  lightComes: at(7, 'the'), // REVEAL step 1: marker clears
  disk: at(9, 'disk'), // the disk fades back in, dim orange
  heats: at(10, 'heats'), // brightness rises
  tens: at(10, 'tens'), // temperature label
  pound: at(11, 'pound'), // step 2
  beats: at(11, 'beats'), // label swaps
  feed: at(13, 'feed'), // step 3: luminosity climbs
  galaxy: at(13, 'galaxy'),
  combined: at(14, 'combined'), // THE hero moment: full power
  someQ: at(15, 'some'), // step 4
  jets: at(15, 'jets'),
  twist: at(17, 'almost'),
  billions: at(17, 'billions'), // shrink to a point
  fuel: at(19, 'fuel'), // the point dims
  thirteen: at(21, 'thirteen'), // hero number
  loop: at(23, 'we'),
};

// hook text out with the title cue, back for the last ~1 s
const HOOK_OUT = C.quasar - 0.15;
const HOOK_IN = DURATION_S - 1.75;

// per-line KEYWORD (guion.md), so a keyword lights up in its own beat only
const KEYS: Record<number, string[]> = {
  1: ['quasar'], 4: ['light'], 6: ['shining'], 9: ['disk'], 10: ['heats'], 12: ['ten'], 13: ['galaxy'],
  15: ['jets'], 17: ['billions'], 18: ['young'], 19: ['fuel'], 22: ['Earth'], 23: ['blazing'],
};

const CAM_PUSH = 1.12; // slow push-in (×)
const S = (f: number) => f / FPS;
const curve = (t: number, xs: number[], ys: number[]) =>
  interpolate(t, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut });

const Title: React.FC<{ lines: React.ReactNode[]; size?: number }> = ({ lines, size = TYPE.title.fontSize }) => (
  <div style={{ position: 'absolute', top: 250, left: QX - 420, width: 840, textAlign: 'center' }}>
    {lines.map((l, i) => (
      <div key={i} style={{ ...TYPE.title, fontSize: size, color: PALETTE.ivory }}>{l}</div>
    ))}
  </div>
);
const Gold: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = TYPE.title.fontSize }) => (
  <span style={{ ...TYPE.keyword, fontSize: size * 1.02, color: PALETTE.gold }}>{children}</span>
);

const HookText: React.FC<{ v: Variant }> = ({ v }) => {
  if (v === 'b') return <HeroNumber value={1000} grouping subject="galaxies" label="UP TO" x={QX} y={240} count={false} warm />;
  if (v === 'c') return <Title size={100} lines={['What can shine', <>like <Gold size={100}>1,000</Gold></>, 'galaxies?']} />;
  return <Title lines={[<>The <Gold>brightest</Gold></>, 'light']} />;
};

// fade wrapper for elements that leave (components only animate their arrival)
const Fade: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) =>
  op <= 0 ? null : <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
const out = (f: number, t: number, len = 0.5) =>
  1 - interpolate(S(f), [t, t + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.in });

export const WhatIsAQuasar: React.FC<{ variant: Variant }> = ({ variant }) => {
  const f = useCurrentFrame();
  const t = S(f);

  // ---- the quasar's dials (one scene, evolving) ----
  // SETUP dims from "quasar" (not "black hole"): the change starts ~2.5 s sooner
  const L = curve(t,
    [C.quasar, C.blackHole + 1.6, C.heats - 0.1, C.heats + 2.7, C.feed + 0.1, C.galaxy + 0.1, C.combined - 0.05, C.combined + 0.6, C.fuel - 0.3, C.fuel + 1.4, C.loop + 0.4, C.loop + 3.4],
    [1, 0, 0, 0.45, 0.45, 0.85, 0.85, 1, 1, 0.15, 0.15, 1]);
  const D = curve(t, [C.noLight - 0.1, C.noLight + 1.5, C.disk - 0.15, C.disk + 1.15], [1, 0, 0, 1]);
  const J = curve(t, [C.jets - 0.1, C.jets + 0.9, C.billions - 0.8, C.billions], [0, 1, 1, 0]);
  const SIZE_MIN = 0.07 * 46 / R; // the distant point keeps its approved pixel size
  const size = curve(t, [C.billions - 0.2, C.billions + 2.0, C.loop + 0.35, C.loop + 3.55], [1, SIZE_MIN, SIZE_MIN, 1]);
  const far = (1 - size) / (1 - SIZE_MIN); // 0 at hook size → 1 as a distant point
  // camera: a slow push-in through the hook and early SETUP, released inside the twist's pull-back
  // (hidden by the shrink), so the loop lands back on frame 0's framing
  const cam = curve(t, [0, C.blackHole + 1.6, C.billions - 0.2, C.billions + 2.0], [1, CAM_PUSH, CAM_PUSH, 1]);
  const starCam = 1 + (cam - 1) * 0.35; // the sky is far behind: less push (parallax)
  const exp = quasarExposure(L * D);
  const stars = exp.stars + (1 - exp.stars) * far; // far away it's just another star in a normal sky

  // ---- hook text ----
  const hookOp = f < HOOK_IN * FPS
    ? 1 - interpolate(t, [HOOK_OUT, HOOK_OUT + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.in })
    : ramp(f, HOOK_IN * FPS, 26);
  const hookRise = f < HOOK_IN * FPS ? 0 : (1 - hookOp) * MOTION.risePx;

  // ---- captions: none during the hook (the title / hero number is on screen), back with SETUP ----
  const lines: CaptionLine[] = VO.slice(1).map((l, i) => ({ ...l, keywords: KEYS[i + 1] ?? [] }));

  const F = (s: number) => Math.round(s * FPS);

  return (
    <Grain>
      <AbsoluteFill style={{ backgroundColor: PALETTE.space }}>
        <AbsoluteFill style={{ transform: `scale(${starCam})`, transformOrigin: `${QX}px ${QY}px` }}>
        <Starfield count={300} seed={21} opacity={stars} warm
          clear={[[60, 210, 840, 420], [160, 1270, 760, 150], [220, 400, 520, 120], [250, 630, 460, 100], [380, 975, 200, 70]]}
          avoid={[[QX, QY, R * 5.2 * size * cam / starCam]]} />
        </AbsoluteFill>

        {/* the persistent scene: host galaxy + quasar, one size dial (the twist's pull-back) */}
        <AbsoluteFill style={{ transform: `scale(${size * cam})`, transformOrigin: `${QX}px ${QY}px` }}>
          <HostGalaxy x={QX} y={QY} rx={520} dim={exp.galaxy} warm />
          <Quasar x={QX} y={QY} shadowR={R} luminosity={L} disk={D} jets={J} jetLength={R * 4.5} loopFrames={TOTAL_FRAMES}
            breathe={0.07} breathePeriod={75} hotspots={3} hotspotPeriod={135} streaks={0.3} warm />
        </AbsoluteFill>

        {/* hook text (A title / B hero number / C title), back at the end for the loop */}
        <Fade op={hookOp}>
          <AbsoluteFill style={{ transform: `translateY(${hookRise}px)` }}><HookText v={variant} /></AbsoluteFill>
        </Fade>

        {/* SETUP: the shadow, named */}
        <Fade op={out(f, C.lightComes)}>
          <Marker x={QX} y={QY} ringR={(R + 10) * cam} side="above" length={120} label="SUPERMASSIVE BLACK HOLE" at={F(C.blackHole + 0.5)} />
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

        {/* TWIST: a point among the stars, then the farthest one's number */}
        <Fade op={out(f, C.loop)}>
          <Marker x={QX} y={QY} side="below" length={70} label="QUASAR" at={F(C.billions + 1.6)} />
          <HeroNumber value={13} unit="billion" subject="years ago" label="FARTHEST QUASAR" x={QX} y={240} at={F(C.thirteen - 0.15)} />
        </Fade>

        <KeywordCaptions lines={lines} />
      </AbsoluteFill>
    </Grain>
  );
};
