import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CANVAS, EASE, PALETTE } from '../../brand';
import {
  Grain, HostGalaxy, InfallingGas, KeywordCaptions, KineticTitle, ParallaxStars, Quasar, keyNorm, quasarExposure,
} from '../../components';
import type { CaptionLine, KineticWord } from '../../components';
import { VO } from './vo.gen';

// OPENING PROTOTYPES (brand v2.0 energy curve) — three versions of the first ~6.5 s of "What is a
// quasar?" (variant A voice). Each ends on the short's hook framing (QX, QY, R, full power), so
// the chosen one drops straight into the existing body. Cues come from the REAL word times.
//   1 Ignition  — frame 0: the dormant black hole in its galaxy; on "brightest" it switches on hard.
//   2 Pull-back — frame 0: an extreme close-up of the disk's bright side at the shadow's edge; a
//                 fast pull-back reveals the quasar, then it flares to full power on "brightest".
//   3 Dive-in   — frame 0: a star field with one bright point; a fast push-in through the stars
//                 lands on the quasar, then it flares to full power on "brightest".
// All: infalling gas for constant motion, a kinetic title on the voice, a change every 2–3 s.

export type Opening = 1 | 2 | 3;
export const OPENING_S = 6.5;
const FPS = CANVAS.FPS;
const QX = 480; // the short's framing (safe-rect center)
const QY = 900;
const R = 72;
const SIZE_MIN = (0.07 * 46) / R; // the short's approved "distant point" size

const word = (line: number, w: string) => {
  const x = VO[line].words?.find((y) => keyNorm(y.w).startsWith(w.toLowerCase()));
  if (!x) throw new Error(`cue word "${w}" not in VO line ${line}`);
  return x.start;
};
const W0 = VO[0].words ?? [];
const kw = (i: number, gold = false): KineticWord => ({ w: W0[i].w, start: W0[i].start, gold });
// "Black holes power / the universe's / brightest lights."
const TITLE: KineticWord[][] = [[kw(0), kw(1), kw(2)], [kw(3), kw(4)], [kw(5, true), kw(6)]];
const BRIGHTEST = word(0, 'brightest');
const QUASAR_W = word(1, 'kway');
const TITLE_OUT = QUASAR_W - 0.25;

const ease = (t: number, xs: number[], ys: number[], e = EASE.inOut) =>
  interpolate(t, xs, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
// a zoom from apparent scale k0 to k1, eased in log space (a uniform-looking zoom), as a distance
const zoomDist = (t: number, t0: number, t1: number, k0: number, k1: number, e = EASE.punch) =>
  1 / Math.exp(ease(t, [t0, t1], [Math.log(k0), Math.log(k1)], e));

// ---- camera ----------------------------------------------------------------------------------
// dist = camera distance to the quasar's plane (1 = the short's framing; the quasar's apparent
// scale is 1/dist). Big moves ease the DISTANCE with EASE.punch: fast travel, long soft landing.
type Cam = { dist: number; fx: number; fy: number; sx: number; sy: number };
// screen position of a rest-framing point p: the focus F (world) sits at S on screen, scaled by k
const toScreen = (c: Cam, px: number, py: number) => {
  const k = 1 / c.dist;
  return { X: c.sx + (px - c.fx) * k, Y: c.sy + (py - c.fy) * k };
};

const Scene: React.FC<{ cam: Cam; L: number; starsOp: number; gasOp?: number; galaxy?: number; fg?: { fillAt: number } }> = ({ cam, L, starsOp, gasOp = 1, galaxy = 1, fg }) => {
  // background depth: near the hero for small moves; very far when the camera travels a long way
  // (else the whole sky would bunch up around the vanishing point at the start)
  const bgZ: [number, number] = fg ? [40, 150] : [0.25, 3];
  const point = Math.min(1, Math.max(0, (cam.dist - 3) / 8));
  const k = 1 / cam.dist;
  const exp = quasarExposure(L);
  const c = toScreen(cam, QX, QY);
  const r = R * k;
  const clear: [number, number, number, number][] = [[60, 210, 840, 400], [160, 1270, 760, 150]];
  const quasarProps = {
    luminosity: L, jets: 0, breathe: 0.07, breathePeriod: 75, hotspots: 3, hotspotPeriod: 135, streaks: 0.3,
    drift: 1.2 * Math.max(1, k), corona: 1 / Math.max(1, Math.sqrt(k)), warm: true,
  };
  // k ≤ 1: draw at rest size and shrink with a CSS scale (the short's approved distant point);
  // k > 1: scale the geometry itself, so a close-up stays vector-sharp
  const small = k <= 1;
  const qx = small ? QX : c.X;
  const qy = small ? QY : c.Y;
  const qr = small ? R : r;
  const body = (
    <>
      <HostGalaxy x={qx} y={qy} rx={520 * (small ? 1 : k)} dim={exp.galaxy * galaxy} warm />
      <InfallingGas x={qx} y={qy} shadowR={qr} luminosity={L} opacity={gasOp} layer="back" />
      <Quasar x={qx} y={qy} shadowR={qr} {...quasarProps} />
      <InfallingGas x={qx} y={qy} shadowR={qr} luminosity={L} opacity={gasOp} layer="front" />
    </>
  );
  return (
    <>
      <ParallaxStars dist={cam.dist} cx={c.X} cy={c.Y} count={240} z={bgZ} opacity={starsOp} clear={clear} seed={21} />
      {small
        ? <AbsoluteFill style={{ transform: `translate(${c.X - QX}px, ${c.Y - QY}px) scale(${k})`, transformOrigin: `${QX}px ${QY}px` }}>{body}</AbsoluteFill>
        : body}
      {/* far away a quasar looks like a star ("quasi-stellar"): one bright point, fading as we close in */}
      {fg && point > 0 && (
        <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <radialGradient id="qPoint">
              <stop offset="0%" stopColor={PALETTE.ivory} stopOpacity={0.9} />
              <stop offset="30%" stopColor={PALETTE.gold} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PALETTE.gold} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={c.X} cy={c.Y} r={26} fill="url(#qPoint)" opacity={point} />
          <circle cx={c.X} cy={c.Y} r={4.5} fill={PALETTE.ivory} opacity={point} />
        </svg>
      )}
      {fg && <ParallaxStars dist={cam.dist} cx={c.X} cy={c.Y} count={150} z={[-(fg.fillAt - 0.6), -0.3]} fillAt={fg.fillAt} opacity={1} clear={clear} seed={33} bright={14} />}
    </>
  );
};

// ---- the three openings ------------------------------------------------------------------------
const ignition = (t: number) => {
  // dormant until "brightest", then a hard switch-on (14 frames, punch); the camera creeps in,
  // punches in with the ignition, then settles back to the short's framing by the end
  const on = ease(t, [BRIGHTEST - 0.12, BRIGHTEST + 0.35], [0, 1], EASE.punch);
  const L = on;
  const k = 1 + 0.025 * Math.min(t, BRIGHTEST) / BRIGHTEST + ease(t, [BRIGHTEST - 0.12, BRIGHTEST + 0.5], [0, 0.07], EASE.punch)
    - ease(t, [TITLE_OUT, OPENING_S], [0, 0.095]);
  const cam: Cam = { dist: 1 / k, fx: QX, fy: QY, sx: QX, sy: QY };
  // the exposure adapts a little slower than the ignition (the camera catching up)
  const expL = ease(t, [BRIGHTEST - 0.05, BRIGHTEST + 0.8], [0, 1], EASE.out);
  return { cam, L, starsOp: quasarExposure(expL).stars };
};

const PB_FOCUS = (() => {
  // a point on the disk's bright (approaching, left) side, just outside the shadow's edge
  const a = (-8 * Math.PI) / 180;
  const lx = -1.75 * R;
  const ly = 0.08 * R;
  return { fx: QX + lx * Math.cos(a) - ly * Math.sin(a), fy: QY + lx * Math.sin(a) + ly * Math.cos(a) };
})();
const pullback = (t: number) => {
  const K0 = 5.5;
  const t0 = 0.95; // hold the close-up ~1 s, then pull back fast
  const t1 = t0 + 1.7;
  const d = t < t0 ? 1 / lerp(K0, 5.1, t / t0) : zoomDist(t, t0, t1, 5.1, 1);
  const u = (1 / d - 1) / (K0 - 1); // 1 at the close-up → 0 at rest
  const cam: Cam = { dist: d, ...PB_FOCUS, sx: lerp(PB_FOCUS.fx, 470, u), sy: lerp(PB_FOCUS.fy, 980, u) };
  const L = 0.75 + 0.25 * ease(t, [BRIGHTEST - 0.1, BRIGHTEST + 0.45], [0, 1], EASE.punch);
  return { cam, L, starsOp: quasarExposure(L).stars };
};

const divein = (t: number) => {
  const D0 = 1 / SIZE_MIN; // ~22: the quasar is a point among the stars
  const t0 = 0.45;
  const t1 = t0 + 1.5;
  const d = t < t0 ? lerp(D0, D0 * 0.93, t / t0) : zoomDist(t, t0, t1, 1 / (D0 * 0.93), 1);
  const cam: Cam = { dist: d, fx: QX, fy: QY, sx: QX, sy: QY };
  const L = 0.7 + 0.3 * ease(t, [BRIGHTEST - 0.1, BRIGHTEST + 0.45], [0, 1], EASE.punch);
  // far away the quasar is just another star in a normal sky; up close the camera exposes for it
  const far = Math.min(1, Math.max(0, (d - 1) / 3));
  const starsOp = lerp(quasarExposure(L).stars, 1, far);
  // far away: one bright point, its galaxy too faint to see
  return { cam, L, starsOp, gasOp: Math.min(1, Math.max(0, (1 / d - 0.2) / 0.4)), galaxy: Math.min(1, Math.max(0, 1 - (d - 1.5) / 5)) };
};

const captionLines: CaptionLine[] = VO.slice(1, 3).map((l, i) => ({ ...l, keywords: i === 0 ? ['quasar'] : [] }));

export const OpeningPrototype: React.FC<{ opening: Opening }> = ({ opening }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s: { cam: Cam; L: number; starsOp: number; gasOp?: number; galaxy?: number } = opening === 1 ? ignition(t) : opening === 2 ? pullback(t) : divein(t);
  return (
    <Grain>
      <AbsoluteFill style={{ backgroundColor: PALETTE.space }}>
        <Scene cam={s.cam} L={s.L} starsOp={s.starsOp} gasOp={s.gasOp ?? 1} galaxy={s.galaxy ?? 1}
          fg={opening === 3 ? { fillAt: 1 / SIZE_MIN } : undefined} />
        <KineticTitle lines={TITLE} x={QX} size={92} outAt={TITLE_OUT} />
        <KeywordCaptions lines={captionLines} />
      </AbsoluteFill>
    </Grain>
  );
};
