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
  tilt?: number; // disk tilt (default 0.2)
  diskOuter?: number; // × shadowR (default 4.6)
  jets?: boolean; // default true
  jetLength?: number; // px (default shadowR × 14)
  at?: number;
  warm?: boolean;
};

// Galaxy and sky brightness for a given quasar luminosity (design note §0 table).
export const quasarExposure = (l: number) => {
  const L = clamp01(l);
  const seg = (a: number, b: number, c: number) => (L <= 0.5 ? a + (b - a) * (L / 0.5) : b + (c - b) * ((L - 0.5) / 0.5));
  return { galaxy: seg(1, 0.6, 0.15), stars: seg(1, 0.6, 0.25) };
};

let uid = 0;

export const Quasar: React.FC<QuasarProps> = ({
  x, y, shadowR, luminosity = 1, angle = -8, tilt = 0.2, diskOuter = 4.6, jets = true, jetLength, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `qs${uid++}`, []);
  const s = startOf(at, warm);
  const L = clamp01(luminosity);
  const glow = ramp(f, s + 4, MOTION.glowIn);
  const rOut = shadowR * diskOuter;
  const coronaR = rOut * (1 + (QUASAR.coronaMax - 1) * L); // 1× dormant → 2.5× at full
  const c = L * glow;
  const common = { x, y, shadowR, luminosity: L, angle, tilt, outer: diskOuter, at, warm };

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
            <stop offset="0%" stopColor={QUASAR.corona[1]} stopOpacity={0.55 * c} />
            <stop offset="18%" stopColor={QUASAR.corona[1]} stopOpacity={0.52 * c} />
            <stop offset="38%" stopColor={QUASAR.corona[1]} stopOpacity={0.36 * c} />
            <stop offset="62%" stopColor={QUASAR.corona[1]} stopOpacity={0.15 * c} />
            <stop offset="82%" stopColor={QUASAR.corona[1]} stopOpacity={0.04 * c} />
            <stop offset="100%" stopColor={QUASAR.corona[1]} stopOpacity={0} />
          </radialGradient>
        </defs>
        {c > 0 && <circle cx={x} cy={y} r={coronaR} fill={`url(#${id}c)`} />}
      </svg>
      {jets && <Jets x={x} y={y} length={jetLength ?? shadowR * 14} width={shadowR * 0.22} angle={angle} luminosity={L} at={at} warm={warm} />}
      <AccretionDisk {...common} layer="back" />
      <BlackHole x={x} y={y} r={shadowR} ring={0.45 + 0.55 * L} at={at} warm={warm} />
      <AccretionDisk {...common} layer="front" />
    </>
  );
};
