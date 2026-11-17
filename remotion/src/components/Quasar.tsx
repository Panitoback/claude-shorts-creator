import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, QUASAR } from '../brand';
import { AccretionDisk } from './AccretionDisk';
import { BlackHole } from './BlackHole';
import { Jets } from './Jets';
import { ramp, startOf } from './anim';
import { clamp01 } from './color';

// QUASAR (design note §0) — the most luminous object on the channel, by CONTRAST, not effects:
// a pure-black shadow, a disk whose inner edge clips to near-white and grades out to gold and
// orange, a corona stronger than any GlowingBody, and jets. No flares, rays or frame-wide haze.
//
// One `luminosity` prop (0..1) drives everything together. Animate it 0 → 1 for the "switch-on".
// It also tells the REST of the scene how much to dim: pass `quasarExposure(l)` to the
// HostGalaxy (`dim`) and the Starfield (`opacity`), like a camera exposing for a bright source.
export type QuasarProps = {
  x: number;
  y: number;
  shadowR: number; // black-hole shadow radius, px — everything scales from it
  luminosity?: number; // 0 dormant … 1 full quasar (default 1)
  angle?: number; // disk in-plane rotation, degrees (default -8); jets are perpendicular
  tilt?: number; // disk tilt (default 0.15: the near side crosses the shadow as a band, black above and below)
  diskOuter?: number; // × shadowR (default 4.6)
  jets?: boolean | number; // default true; a number 0..1 fades them on/off (still gated by luminosity)
  disk?: number; // 0..1 (default 1): fade the disk (and corona, lensing) fully off, BELOW dormant,
  // leaving the bare black hole with a faint photon ring
  loopFrames?: number; // seamless-loop length, passed to the disk (see AccretionDisk)
  jetLength?: number; // px (default shadowR × 14)
  breathe?: number; // luminosity pulse of corona + disk, ± fraction (default 0 = steady; ~0.07 = a
  // living quasar: real quasars vary in brightness). Slow and smooth, never a flicker
  breathePeriod?: number; // frames per pulse (default 75 = 2.5 s); with loopFrames it is rounded to
  // a whole number of pulses in the loop
  hotspots?: number; // orbiting clumps in the disk, Doppler-brightened (see AccretionDisk)
  hotspotPeriod?: number; // frames per orbit of the inner clump (see AccretionDisk)
  streaks?: number; // drifting-streak opacity (see AccretionDisk)
  at?: number;
  warm?: boolean;
};

// Galaxy and sky brightness for a given quasar luminosity (design note §0 table).
export const quasarExposure = (l: number) => {
  const L = clamp01(l);
  const seg = (a: number, b: number, c: number) => (L <= 0.5 ? a + (b - a) * (L / 0.5) : b + (c - b) * ((L - 0.5) / 0.5));
  // at full power the camera exposes for the quasar: galaxy and sky nearly gone (it outshines them)
  return { galaxy: seg(1, 0.6, 0.05), stars: seg(1, 0.55, 0.08) };
};

let uid = 0;

export const Quasar: React.FC<QuasarProps> = ({
  x, y, shadowR, luminosity = 1, angle = -8, tilt = 0.15, diskOuter = 4.6, jets = true, disk = 1, loopFrames, jetLength,
  breathe = 0, breathePeriod = 75, hotspots = 0, hotspotPeriod, streaks, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `qs${uid++}`, []);
  const s = startOf(at, warm);
  // breathing: w swings 0..1; at the bottom of a breath corona + disk sit 2·breathe lower
  const per = loopFrames ? loopFrames / Math.max(1, Math.round(loopFrames / breathePeriod)) : breathePeriod;
  const w = 0.5 + 0.5 * Math.sin((2 * Math.PI * f) / per);
  const breath = 1 - 2 * breathe * (1 - w);
  const L = clamp01(luminosity) * breath;
  const glow = ramp(f, s + 4, MOTION.glowIn);
  const rOut = shadowR * diskOuter;
  const coronaR = rOut * (1 + (QUASAR.coronaMax - 1) * L); // 1× dormant → coronaMax (3×) at full
  const D = clamp01(disk);
  const c = L * glow * D;
  const common = { x, y, shadowR, luminosity: L, angle, tilt, outer: diskOuter, opacity: D, loopFrames, hotspots, hotspotPeriod, streaks, at, warm };
  const jetFade = typeof jets === 'number' ? clamp01(jets) : jets ? 1 : 0;

  return (
    <>
      {/* corona: local radial gradient, strongest on the channel; never a blur, never frame-wide.
          It stays GOLD and semi-transparent even at its center: the near-white belongs to the
          disk's inner edge and the lensed far side alone. A near-white corona core swallowed
          them (the disk shrank to an orange line and the shadow read like an eye). */}
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}c`} cx="50%" cy="50%" r="50%">
            {/* center: gold and translucent (disk + arcs stay readable); the MID falloff is
                where the power is: bright and wide, so the glow fills the frame around it */}
            <stop offset="0%" stopColor={QUASAR.corona[1]} stopOpacity={0.62 * c} />
            <stop offset="20%" stopColor={QUASAR.corona[1]} stopOpacity={0.58 * c} />
            <stop offset="42%" stopColor={QUASAR.corona[1]} stopOpacity={0.42 * c} />
            <stop offset="66%" stopColor={QUASAR.corona[1]} stopOpacity={0.2 * c} />
            <stop offset="86%" stopColor={QUASAR.corona[1]} stopOpacity={0.06 * c} />
            <stop offset="100%" stopColor={QUASAR.corona[1]} stopOpacity={0} />
          </radialGradient>
        </defs>
        {c > 0 && <circle cx={x} cy={y} r={coronaR} fill={`url(#${id}c)`} />}
      </svg>
      {jetFade > 0 && <Jets x={x} y={y} length={jetLength ?? shadowR * 14} width={shadowR * 0.42} angle={angle} luminosity={L} fade={jetFade * D} at={at} warm={warm} />}
      <AccretionDisk {...common} layer="back" />
      {/* bare (disk off): the ring drops to a faint glow */}
      <BlackHole x={x} y={y} r={shadowR} ring={(0.45 + 0.55 * L) * (0.5 + 0.5 * D)} at={at} warm={warm} />
      <AccretionDisk {...common} layer="front" />
    </>
  );
};
