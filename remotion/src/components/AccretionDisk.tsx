import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, PALETTE, QUASAR } from '../brand';
import { ramp, startOf } from './anim';
import { clamp01, mix, rampColor } from './color';

// ACCRETION DISK (design note 2B) — a tilted disk of infalling matter around a black hole:
// ONE smooth, continuous radial gradient graded by temperature (hottest inside), never stepped
// bands (those read as vinyl or Saturn's rings, worst of all when the camera zooms in). The
// approaching side is brighter (Doppler beaming), faint soft streaks drift to suggest rotation,
// and the far side of the disk is seen bent OVER the top and UNDER the bottom of the shadow
// (gravitational lensing) as two bright bands — flat shapes in the brand's style, not a
// ray-traced render.
//
// The disk is OPAQUE, so its near side crosses in front of the shadow as one continuous band
// that looks the same over the shadow as outside it; above and below that band the shadow stays
// pure #000. Its inner edge sits at 1.15× the shadow radius: the innermost stable orbit (3 Rs)
// against the shadow (2.6 Rs), so no gap shows around the hole.
//
// `luminosity` (0..1) grades it: 0 = a dim, dark-orange disk; 1 = a wide near-white inner band
// with a white-hot edge, grading out through gold to deep orange (design note §0).
//
// Layering: the disk passes BEHIND the shadow at the top and IN FRONT of it at the bottom, so
// it's drawn in two layers around <BlackHole>: layer="back" (back half + lensed arcs), then the
// hole, then layer="front". <Quasar> does this for you.
export type AccretionDiskProps = {
  x: number;
  y: number;
  shadowR: number; // radius of the black hole's shadow it surrounds, px
  inner?: number; // inner edge, × shadowR (default 1.15: the innermost stable orbit)
  outer?: number; // outer edge, × shadowR (default 4.6)
  tilt?: number; // ellipse height / width — how edge-on we see it (default 0.15)
  angle?: number; // in-plane rotation, degrees (default -8)
  luminosity?: number; // 0..1 (default 1)
  lensed?: boolean; // the bent far-side bands (default true)
  approaching?: 'left' | 'right'; // brighter side (default left)
  drift?: number; // drift speed of the soft streaks, px/frame along the disk (default 1.2; 0 = still)
  layer?: 'back' | 'front' | 'both';
  opacity?: number; // 0..1 (default 1): fade the whole disk out, below "dormant" (a bare black hole)
  loopFrames?: number; // a seamless-loop composition's length: the drifting streaks then complete a
  // whole number of turns in it, so the last frame matches frame 0 exactly
  streaks?: number; // opacity of the drifting streaks (default 0.14: barely-there texture)
  hotspots?: number; // bright clumps orbiting in the disk (default 0). They brighten on the
  // approaching side and fade on the receding one (Doppler), so the rotation reads from frame 0
  hotspotPeriod?: number; // frames per orbit of the innermost clump (default 150; outer ones slower,
  // Keplerian-ish). With loopFrames each clump makes a whole number of orbits in the loop
  at?: number;
  warm?: boolean;
};

const STOPS = 16; // gradient samples across the disk: smooth, no visible steps
// lensed far-side bands, × shadowR: half-width where they meet the disk (rx), reach (ry), and
// how far in the gradient (0..1 of the reach) the band's hot inner edge sits
const LENS = [
  { k: 'top', rx: 1.55, ry: 1.68, op: 1 },
  { k: 'bottom', rx: 1.4, ry: 1.32, op: 0.9 },
] as const;
const R0 = 1.03; // the bands' inner edge, × shadowR (just outside the photon ring)

let uid = 0;

export const AccretionDisk: React.FC<AccretionDiskProps> = ({
  x, y, shadowR, inner = 1.15, outer = 4.6, tilt = 0.15, angle = -8, luminosity = 1, lensed = true,
  approaching = 'left', drift = 1.2, layer = 'both', opacity = 1, loopFrames, streaks = 0.14, hotspots = 0,
  hotspotPeriod = 150, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `ad${uid++}`, []);
  const s = startOf(at, warm);
  const inP = ramp(f, s, MOTION.discIn) * clamp01(opacity);
  const L = clamp01(luminosity);
  const rIn = shadowR * inner;
  const rOut = shadowR * outer;
  const dir = approaching === 'left' ? 1 : -1;

  // dormant disks start further down the temperature ramp and are darker; as it brightens the
  // near-white inner band WIDENS (the first `hot` of the disk stays at the white end)
  const shift = (1 - L) * 0.55;
  const hot = 0.36 * L * L;
  const dim = (1 - L) * 0.45;
  const colorAt = (u: number) =>
    mix(rampColor(QUASAR.disk, shift + clamp01((u - hot) / (1 - hot)) * (1 - shift)), PALETTE.space, dim);
  const edge = (u: number) => (u < 0.68 ? 1 : Math.pow(clamp01((1 - u) / 0.32), 1.4)); // soft outer edge only
  const off = (u: number) => `${((100 * (rIn + u * (rOut - rIn))) / rOut).toFixed(2)}%`;
  const samples = Array.from({ length: STOPS + 1 }, (_, i) => i / STOPS);

  // the ring itself, in the squashed (tilted) frame: outer circle minus inner circle
  // (the back layer uses the solid disc: its hole is under the shadow anyway, and filling it with
  // the inner-edge color means no gap ever shows beside the shadow)
  const disc = `M${rOut} 0A${rOut} ${rOut} 0 1 0 ${-rOut} 0A${rOut} ${rOut} 0 1 0 ${rOut} 0Z`;
  const ring = disc + `M${rIn} 0A${rIn} ${rIn} 0 1 0 ${-rIn} 0A${rIn} ${rIn} 0 1 0 ${rIn} 0Z`;
  const sq = `scale(1 ${tilt})`;

  // The WHOLE disk is drawn once in the back layer (no midline cut, so no seam). The front layer
  // redraws only the near half where it crosses the shadow (clip: lower half of the shadow disc),
  // so nothing outside the shadow is drawn twice.
  const disk = (front: boolean) => {
    const shape = front ? ring : disc;
    return (
    <g clipPath={front ? `url(#${id}front)` : undefined} mask={`url(#${id}m)`} opacity={inP}>
      <path d={shape} transform={sq} fillRule="evenodd" fill={`url(#${id}body)`} />
      {/* Doppler: near-white over the approaching half, deep red over the receding half (real
          color shifts: dimming by opacity just showed the bright corona through the disk) */}
      <g mask={`url(#${id}ap)`}><path d={shape} transform={sq} fillRule="evenodd" fill={`url(#${id}tap)`} /></g>
      <g mask={`url(#${id}rc)`}><path d={shape} transform={sq} fillRule="evenodd" fill={`url(#${id}trc)`} /></g>
      {/* rotation: a few faint, soft streaks drifting around (blurred: texture, never edges) */}
      {drift !== 0 && (
        <g transform={sq} filter={`url(#${id}blur)`}>
          {[0.3, 0.52, 0.74].map((u, i) => {
            const rr = rIn + (rOut - rIn) * u;
            const period = rr * 1.7; // dash + gap
            let speed = drift * (1.4 - u);
            if (loopFrames) speed = (Math.max(1, Math.round((loopFrames * speed) / period)) * period) / loopFrames;
            return (
              <circle key={i} cx={0} cy={0} r={rr} fill="none" stroke={colorAt(u + 0.22)} strokeOpacity={streaks * edge(u)}
                strokeWidth={(rOut - rIn) * 0.2} strokeDasharray={`${rr * 0.6} ${rr * 1.1}`}
                strokeDashoffset={-dir * f * speed} strokeLinecap="round" />
            );
          })}
        </g>
      )}
      {/* orbiting clumps: soft blobs riding the disk (squashed with it), Doppler-brightened on the
          approaching side. Slow (seconds per orbit), never a flicker. */}
      {hotspots > 0 && (
        <g transform={sq} filter={`url(#${id}hblur)`}>
          {Array.from({ length: hotspots }, (_, i) => {
            const u = hotspots > 1 ? 0.34 + (0.4 * i) / (hotspots - 1) : 0.45;
            const rr = rIn + (rOut - rIn) * u;
            let per = hotspotPeriod * Math.pow(rr / (rIn + (rOut - rIn) * 0.34), 1.5);
            if (loopFrames) per = loopFrames / Math.max(1, Math.round(loopFrames / per));
            // the approaching side moves from the far side to the near side: angle decreases for 'left'
            const th = (i * 2.4) - dir * (2 * Math.PI * f) / per;
            const dop = clamp01(0.5 - 0.5 * dir * Math.cos(th)); // 1 on the approaching side
            const op = (0.5 + 0.5 * dop) * (0.35 + 0.65 * L) * edge(u);
            return (
              <ellipse key={i} cx={rr * Math.cos(th)} cy={rr * Math.sin(th)} rx={(rOut - rIn) * 0.2} ry={(rOut - rIn) * 0.32}
                transform={`rotate(${(th * 180) / Math.PI} ${rr * Math.cos(th)} ${rr * Math.sin(th)})`}
                fill={mix(colorAt(Math.max(0, u - 0.3)), "#ffffff", 0.6)} opacity={op} />
            );
          })}
        </g>
      )}
    </g>
    );
  };

  // lensed far side: a band from just outside the shadow out to an ellipse, over the top or under
  const r0 = shadowR * R0;
  const crescent = (top: boolean, rx: number, ry: number) => {
    const sy = top ? 1 : 0; // sweep flag (clockwise on screen = over the top)
    return `M${-rx} 0 A${rx} ${ry} 0 0 ${sy} ${rx} 0 L${r0} 0 A${r0} ${r0} 0 0 ${1 - sy} ${-r0} 0 Z`;
  };

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <clipPath id={`${id}front`}>
          {/* the lower half of the shadow disc (+1.5 px so its edge hides under the shadow's) */}
          <path d={`M${-(shadowR + 1.5)} 0A${shadowR + 1.5} ${shadowR + 1.5} 0 0 0 ${shadowR + 1.5} 0Z`} />
        </clipPath>
        {/* the disk body: one continuous temperature gradient, a white-hot inner edge */}
        <radialGradient id={`${id}body`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={rOut}>
          {samples.map((u) => (
            <stop key={u} offset={off(u)} stopColor={u === 0 ? mix(colorAt(0), '#ffffff', 0.7 * L) : colorAt(u)} stopOpacity={edge(u)} />
          ))}
        </radialGradient>
        <radialGradient id={`${id}tap`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={rOut}>
          {samples.map((u) => (
            <stop key={u} offset={off(u)} stopColor={QUASAR.disk[0]} stopOpacity={(0.2 + 0.55 * L) * (1 - 0.55 * u) * edge(u)} />
          ))}
        </radialGradient>
        <radialGradient id={`${id}trc`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={rOut}>
          {samples.map((u) => (
            <stop key={u} offset={off(u)} stopColor={QUASAR.disk[5]} stopOpacity={(0.15 + 0.45 * L) * edge(u)} />
          ))}
        </radialGradient>
        {/* Doppler masks across the disk: mild overall falloff (m), approaching half (ap), receding half (rc) */}
        {([
          ['m', [[0, 1], [1, 0.75]]],
          ['ap', [[0, 1], [0.55, 0]]],
          ['rc', [[0.45, 0], [1, 1]]],
        ] as const).map(([k, st]) => (
          <React.Fragment key={k}>
            <linearGradient id={`${id}g${k}`} x1={dir > 0 ? 0 : 1} y1={0.5} x2={dir > 0 ? 1 : 0} y2={0.5}>
              {st.map(([o, a]) => <stop key={o} offset={o} stopColor="#fff" stopOpacity={a} />)}
            </linearGradient>
            <mask id={`${id}${k}`} maskUnits="userSpaceOnUse" x={-rOut * 1.6} y={-rOut * 1.6} width={rOut * 3.2} height={rOut * 3.2}>
              <rect x={-rOut * 1.05} y={-rOut} width={rOut * 2.1} height={rOut * 2} fill={`url(#${id}g${k})`} />
            </mask>
          </React.Fragment>
        ))}
        <filter id={`${id}blur`} filterUnits="userSpaceOnUse" x={-rOut * 1.3} y={-rOut * 1.3} width={rOut * 2.6} height={rOut * 2.6}>
          {/* blurred in the squashed frame: soft across the disk, never a thin line */}
          <feGaussianBlur stdDeviation={`${((rOut - rIn) * 0.05).toFixed(2)} ${((rOut - rIn) * 0.12).toFixed(2)}`} />
        </filter>
        <filter id={`${id}hblur`} filterUnits="userSpaceOnUse" x={-rOut * 1.3} y={-rOut * 1.3} width={rOut * 2.6} height={rOut * 2.6}>
          <feGaussianBlur stdDeviation={((rOut - rIn) * 0.08).toFixed(2)} />
        </filter>
        {/* lensed bands: elliptical gradients, hot (white at full power) right at the shadow,
            holding their color across the band and fading only at the outer edge, so each reads
            as a defined bright band, not a glow */}
        {/* the bands fade out as they reach the disk plane, so their ends melt into the disk */}
        {LENS.map((a) => {
          const sgn = a.k === 'top' ? -1 : 1;
          return (
            <React.Fragment key={`f${a.k}`}>
              <linearGradient id={`${id}lg${a.k}`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={sgn * shadowR * 0.4}>
                <stop offset="0%" stopColor="#fff" stopOpacity={0} />
                <stop offset="100%" stopColor="#fff" stopOpacity={1} />
              </linearGradient>
              <mask id={`${id}lf${a.k}`} maskUnits="userSpaceOnUse" x={-rOut} y={-rOut} width={rOut * 2} height={rOut * 2}>
                <rect x={-shadowR * 2} y={a.k === 'top' ? -shadowR * 2.2 : 0} width={shadowR * 4} height={shadowR * 2.2} fill={`url(#${id}lg${a.k})`} />
              </mask>
            </React.Fragment>
          );
        })}
        {LENS.map((a) => {
          const t0 = R0 / Math.min(a.rx, a.ry); // the band's inner edge, in gradient units
          const pos = (k: number) => `${(100 * (t0 + (1 - t0) * k)).toFixed(1)}%`;
          return (
            <radialGradient key={a.k} id={`${id}l${a.k}`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={shadowR * a.rx}
              gradientTransform={`scale(1 ${(a.ry / a.rx).toFixed(4)})`}>
              {/* the disk's own ramp (white-hot → gold → orange): it reads as the same disk seen
                  bent over the top, not as a halo around the shadow */}
              <stop offset={pos(0)} stopColor={mix(colorAt(0), '#ffffff', 0.5 * L)} />
              <stop offset={pos(0.3)} stopColor={colorAt(hot + 0.05)} />
              <stop offset={pos(0.62)} stopColor={colorAt(hot + 0.3)} />
              <stop offset={pos(0.86)} stopColor={colorAt(hot + 0.5)} stopOpacity={0.8} />
              <stop offset="100%" stopColor={colorAt(hot + 0.6)} stopOpacity={0} />
            </radialGradient>
          );
        })}
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        {(layer === 'back' || layer === 'both') && (
          <>
            {/* lensed bands first: the opaque disk then covers their ends where they meet it */}
            {lensed && (
              <g opacity={inP} mask={`url(#${id}m)`}>
                {LENS.map((a) => (
                  <g key={a.k} mask={`url(#${id}lf${a.k})`}>
                    <path d={crescent(a.k === 'top', shadowR * a.rx, shadowR * a.ry)} fill={`url(#${id}l${a.k})`} opacity={a.op} />
                  </g>
                ))}
              </g>
            )}
            {disk(false)}
          </>
        )}
        {(layer === 'front' || layer === 'both') && disk(true)}
      </g>
    </svg>
  );
};
