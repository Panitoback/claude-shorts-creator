import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, MOTION, QUASAR } from '../brand';
import { ramp, startOf } from './anim';
import { clamp01, rampColor } from './color';

// ACCRETION DISK (design note 2B) — a tilted disk of infalling matter around a black hole:
// concentric bands graded by temperature (hottest inside), the approaching side brighter
// (Doppler beaming), slow drift suggested by a few dashed bands, and the far side of the disk
// seen bent OVER the top and UNDER the bottom of the shadow (gravitational lensing), drawn as
// flat arcs in the brand's style — not a ray-traced render.
//
// `luminosity` (0..1) grades it: 0 = dim orange disk; 1 = the inner disk clips to near-white,
// grading out through gold to deep orange (design note §0).
//
// Layering: the disk passes BEHIND the shadow at the top and IN FRONT of it at the bottom, so
// it's drawn in two layers around <BlackHole>: layer="back" (back half + lensed arcs), then the
// hole, then layer="front". <Quasar> does this for you.
export type AccretionDiskProps = {
  x: number;
  y: number;
  shadowR: number; // radius of the black hole's shadow it surrounds, px
  inner?: number; // inner edge, × shadowR (default 1.6)
  outer?: number; // outer edge, × shadowR (default 4.6)
  tilt?: number; // ellipse height / width — how edge-on we see it (default 0.2)
  angle?: number; // in-plane rotation, degrees (default -8)
  luminosity?: number; // 0..1 (default 1)
  lensed?: boolean; // the bent far-side arcs (default true)
  approaching?: 'left' | 'right'; // brighter side (default left)
  drift?: number; // drift speed of the dashed bands, px/frame along the band (default 1.2; 0 = still)
  layer?: 'back' | 'front' | 'both';
  at?: number;
  warm?: boolean;
};

const N = 10; // temperature bands
// lensed far-side arcs, × shadowR: half-width at the sides (rx) and reach above/below (ry)
const LENS = [
  { k: 'top', rx: 1.3, ry: 2.05, op: 0.95 },
  { k: 'bottom', rx: 1.22, ry: 1.62, op: 0.85 },
] as const;

let uid = 0;

export const AccretionDisk: React.FC<AccretionDiskProps> = ({
  x, y, shadowR, inner = 1.6, outer = 4.6, tilt = 0.2, angle = -8, luminosity = 1, lensed = true,
  approaching = 'left', drift = 1.2, layer = 'both', at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `ad${uid++}`, []);
  const s = startOf(at, warm);
  const inP = ramp(f, s, MOTION.discIn);
  const L = clamp01(luminosity);
  const rIn = shadowR * inner;
  const rOut = shadowR * outer;
  const bw = (rOut - rIn) / N;
  // dormant disks start further down the temperature ramp; a full quasar starts at near-white
  const shift = (1 - L) * 0.55;
  // as it brightens, the near-white inner band WIDENS (the disk "burns"): the first `hot` of the
  // disk stays at the white end of the ramp, the rest grades gold → orange as before
  const hot = 0.32 * L * L;
  const colorAt = (u: number) => rampColor(QUASAR.disk, shift + clamp01((u - hot) / (1 - hot)) * (1 - shift));
  const alpha = (0.4 + 0.6 * L) * inP;
  const dir = approaching === 'left' ? 1 : -1;
  const bands = Array.from({ length: N }, (_, i) => {
    const rr = rIn + bw * (i + 0.5);
    return { rr, c: colorAt(i / (N - 1)), op: 1 - 0.55 * (i / (N - 1)) };
  });

  // Doppler tint layers: the same bands re-stroked near-white on the approaching side and deep
  // red on the receding side. Real color shifts, not transparency: dimming by opacity just shows
  // the (equally bright) corona through the disk, so the asymmetry never read.
  const tintLayer = (mask: string, color: string, opOf: (i: number) => number) => (
    <g mask={`url(#${id}${mask})`}>
      <g transform={`scale(1 ${tilt})`}>
        {bands.map((b, i) => (
          <circle key={i} cx={0} cy={0} r={b.rr} fill="none" stroke={color} strokeOpacity={opOf(i)} strokeWidth={bw * 1.15} />
        ))}
      </g>
    </g>
  );

  const half = (h: 'back' | 'front') => (
    <g clipPath={`url(#${id}${h})`} mask={`url(#${id}m)`} opacity={alpha}>
      {/* circles squashed by the tilt, so band widths foreshorten correctly */}
      <g transform={`scale(1 ${tilt})`}>
      {bands.map((b, i) => (
        <circle key={i} cx={0} cy={0} r={b.rr} fill="none" stroke={b.c} strokeOpacity={b.op} strokeWidth={bw * 1.15} />
      ))}
      </g>
      {tintLayer('ap', QUASAR.disk[0], (i) => (0.2 + 0.5 * L) * (1 - 0.6 * (i / (N - 1))))}
      {tintLayer('rc', QUASAR.disk[5], () => 0.15 + 0.45 * L)}
      <g transform={`scale(1 ${tilt})`}>
      {drift !== 0 &&
        [0.25, 0.5, 0.75].map((u, i) => {
          const rr = rIn + (rOut - rIn) * u;
          return (
            <circle key={`d${i}`} cx={0} cy={0} r={rr} fill="none" stroke={colorAt(u * 0.6)} strokeOpacity={0.3}
              strokeWidth={Math.max(2 / tilt, bw * 0.35)} strokeDasharray={`${rr * 0.5} ${rr * 0.9}`} strokeDashoffset={-dir * f * drift * (1.4 - u)} strokeLinecap="round" />
          );
        })}
      </g>
    </g>
  );

  // lensed far side: a crescent arching over the shadow (thick) and a thin one under it
  const r0 = shadowR * 1.07;
  const crescent = (top: boolean, rx: number, ry: number) => {
    const sy = top ? 1 : 0; // sweep flag (clockwise on screen = over the top)
    return `M${-rx} 0 A${rx} ${ry} 0 0 ${sy} ${rx} 0 L${r0} 0 A${r0} ${r0} 0 0 ${1 - sy} ${-r0} 0 Z`;
  };

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <clipPath id={`${id}back`}>
          <rect x={-rOut * 1.5} y={-rOut * 1.5} width={rOut * 3} height={rOut * 1.5} />
        </clipPath>
        <clipPath id={`${id}front`}>
          <rect x={-rOut * 1.5} y={0} width={rOut * 3} height={rOut * 1.5} />
        </clipPath>
        {/* Doppler beaming, approaching side brighter: a mild opacity falloff (m) plus the two
            tint layers, near-white over the approaching half (ap), deep red over the receding (rc) */}
        <linearGradient id={`${id}d`} x1={dir > 0 ? 0 : 1} y1={0.5} x2={dir > 0 ? 1 : 0} y2={0.5}>
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={`${id}da`} x1={dir > 0 ? 0 : 1} y1={0.5} x2={dir > 0 ? 1 : 0} y2={0.5}>
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="55%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}dr`} x1={dir > 0 ? 0 : 1} y1={0.5} x2={dir > 0 ? 1 : 0} y2={0.5}>
          <stop offset="45%" stopColor="#fff" stopOpacity={0} />
          <stop offset="100%" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
        {(['m', 'ap', 'rc'] as const).map((k) => (
          <mask key={k} id={`${id}${k}`} maskUnits="userSpaceOnUse" x={-rOut * 1.6} y={-rOut * 1.6} width={rOut * 3.2} height={rOut * 3.2}>
            <rect x={-rOut * 1.1} y={-rOut} width={rOut * 2.2} height={rOut * 2} fill={`url(#${id}${k === 'm' ? 'd' : k === 'ap' ? 'da' : 'dr'})`} />
          </mask>
        ))}
        {/* lensed far side: a BROAD band arching over the top and under the bottom, hot at the
            shadow and fading outward. Elliptical gradients (one per arc) so the band is thick at
            the top/bottom and tapers to nothing at the sides: a silhouette, not an outline. */}
        {LENS.map((a) => (
          <radialGradient key={a.k} id={`${id}l${a.k}`} gradientUnits="userSpaceOnUse" cx={0} cy={0} r={shadowR * a.rx}
            gradientTransform={`scale(1 ${(a.ry / a.rx).toFixed(4)})`}>
            <stop offset="50%" stopColor={colorAt(0)} />
            <stop offset="70%" stopColor={colorAt(0.25)} stopOpacity={0.92} />
            <stop offset="88%" stopColor={colorAt(0.55)} stopOpacity={0.45} />
            <stop offset="100%" stopColor={colorAt(0.8)} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        {(layer === 'back' || layer === 'both') && (
          <>
            {half('back')}
            {lensed && (
              <g opacity={alpha} mask={`url(#${id}m)`}>
                {LENS.map((a) => (
                  <path key={a.k} d={crescent(a.k === 'top', shadowR * a.rx, shadowR * a.ry)} fill={`url(#${id}l${a.k})`} opacity={a.op} />
                ))}
              </g>
            )}
          </>
        )}
        {(layer === 'front' || layer === 'both') && half('front')}
      </g>
    </svg>
  );
};
