import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, PALETTE } from '../brand';
import { kf, Keys } from './anim';
import { mix } from './color';

// PAPER FOLD STACK — a sheet of paper seen edge-on that folds in half, again and again. Its height is
// EXACTLY `sheetMm × 2^n` at the scene's vertical scale (`pxPerMm`), driven by the fold count `n`
// (sync it to an OdometerNumber with the same keys). Two ways to read `n`:
//   - animated folds (`animate` ≥ 0.5): between n = k and k + 1 the right half lifts up and over onto
//     the left half (a hinge at the fold line), layers visible as fine lines while each is ≥ ~2.5 px;
//   - smooth growth (`animate` < 0.5): the height follows 2^n continuously (a column racing upward).
// Switch modes only at whole n (both draw the same stack there).
// The footprint is true too: folds alternate direction like real folding (`alternate`, default on),
// so the edge-on length halves every OTHER fold (the in-between folds flip toward the camera: the
// flap stands up and lands on top), down to `minWidth` px. A macro shot that must show 0.1 mm of
// thickness AND the whole sheet can squeeze the horizontal axis with `hScale` (> 1 = length drawn
// that many times shorter than true); bring it back to 1 as the camera pulls back. `pitch` tips the
// view slightly from above (the sheet's top face shows, e.g. lying on the ground in a hook frame).
// `glow` lights the tip in soft gold so a hairline column stays findable; `gold` tints it toward gold.
// Rewind = keys going back down. Switch `animate` only at whole, EVEN n (both modes match there).
export type PaperFoldStackProps = {
  x: number; // center of the stack
  baseY: number; // screen y of the stack's bottom (the surface it lies on)
  n: Keys; // fold count (0 = one sheet)
  pxPerMm: Keys | number; // vertical scale
  sheetLengthMm?: number; // the sheet's length seen edge-on (default 210, A4's short side)
  hScale?: Keys; // horizontal squeeze for macro shots (default 1 = true length)
  alternate?: boolean; // folds alternate direction (default true)
  minWidth?: number; // the column never gets thinner than this (default 4)
  sheetMm?: number; // one sheet's thickness (default 0.1)
  animate?: Keys; // ≥ 0.5 = animated folds (default 1)
  pitch?: Keys; // top face depth as a fraction of the visible length (default 0 = edge-on; ~0.15 = seen slightly from above)
  glow?: Keys; // tip glow 0..1 (default 0)
  gold?: Keys; // tint toward gold 0..1 (default 0)
  shadow?: boolean; // soft contact shadow on the surface (default true)
  opacity?: Keys;
};

let uid = 0;
const EDGE = '#e6dfd0'; // the sheet's edge face, a touch darker than the top face (ivory family)
const LINE = 'rgba(120,104,80,0.55)'; // the hairline between layers

export const PaperFoldStack: React.FC<PaperFoldStackProps> = ({
  x, baseY, n, pxPerMm, sheetLengthMm = 210, hScale = 1, alternate = true, minWidth = 4, sheetMm = 0.1, animate = 1, pitch = 0, glow = 0, gold = 0, shadow = true, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const id = useMemo(() => `pfs${uid++}`, []);
  const op = kf(f, opacity, 1);
  if (op <= 0.001) return null;
  const N = Math.max(0, kf(f, n, 0));
  const k = kf(f, pxPerMm, 1);
  const L0 = (sheetLengthMm * kf(f, pxPerMm, 1)) / Math.max(1e-6, kf(f, hScale, 1)); // px, one sheet
  const anim = kf(f, animate, 1) >= 0.5;
  const g = kf(f, gold, 0);
  const gl = kf(f, glow, 0);
  const pit = kf(f, pitch, 0);
  const face = mix(PALETTE.ivory, PALETTE.gold, g);
  const edge = mix(EDGE, PALETTE.goldDeep, g);

  // in-plane folds so far: every fold (alternate off) or every other one, starting with the first
  const inPlane = (m: number, whole: boolean) => (!alternate ? m : whole ? Math.ceil(m / 2) : m / 2);
  const widthAt = (m: number, whole = true) => Math.max(minWidth, L0 / 2 ** inPlane(m, whole));
  const thickAt = (m: number) => sheetMm * 2 ** m * k;

  // a block of 2^m layers: [left, right] × [top, bottom]
  const block = (key: string, left: number, w: number, bottom: number, m: number, extra?: React.SVGProps<SVGGElement>) => {
    const t = thickAt(m);
    const top = Math.max(-200, bottom - t);
    const h = bottom - top;
    const layers = 2 ** Math.round(m);
    const lpx = t / layers;
    const lines = lpx >= 2.5 && layers <= 128 && Number.isInteger(Math.round(m)) ? layers : 0;
    return (
      <g key={key} {...extra}>
        <rect x={left} y={top} width={w} height={Math.max(0.6, h)} fill={edge} />
        {lines > 1 && Array.from({ length: lines - 1 }, (_, i) => (
          <line key={i} x1={left} x2={left + w} y1={bottom - (i + 1) * lpx} y2={bottom - (i + 1) * lpx} stroke={LINE} strokeWidth={Math.min(1.5, lpx * 0.35)} />
        ))}
        {lines === 0 && h > 6 && w > 8 && <rect x={left} y={top} width={w} height={h} fill={`url(#${id}tex)`} />}
      </g>
    );
  };

  let body: React.ReactNode;
  let topY: number;
  let topW: number;
  if (anim && N % 1 > 0.0001) {
    const kk = Math.floor(N);
    const u = N - kk;
    const Lk = widthAt(kk);
    const tk = thickAt(kk);
    if (!alternate || kk % 2 === 0) {
      // in-plane fold: the right half lifts up and over onto the left half
      const shift = (Lk / 4) * (u * u * (3 - 2 * u)); // re-center as the fold settles
      const hingeX = x + shift;
      const ang = -180 * Math.min(1, u * 1.08);
      body = (
        <>
          {block('base', hingeX - Lk / 2, Lk / 2, baseY, kk)}
          {block('flap', hingeX, Lk / 2, baseY, kk, { transform: `rotate(${ang} ${hingeX} ${baseY - tk})`, opacity: 0.94 + 0.06 * Math.abs(Math.cos((ang * Math.PI) / 180)) })}
        </>
      );
      topY = baseY - tk * (1 + Math.min(1, u * 1.08));
      topW = Lk / 2;
    } else {
      // fold toward the camera: the back half stands up (seen edge-on) and lands on top
      const uu = Math.min(1, u * 1.08);
      const stand = Lk * 0.55 * Math.sin(Math.PI * uu); // the flap's footprint seen as height mid-flip
      const fh = Math.max(tk * uu, stand);
      body = (
        <>
          {block('base', x - Lk / 2, Lk, baseY, kk)}
          <rect x={x - Lk / 2} y={baseY - tk - fh} width={Lk} height={fh} fill={mix(edge, '#000000', 0.18 * Math.sin(Math.PI * uu))} />
        </>
      );
      topY = baseY - tk - fh;
      topW = Lk;
    }
  } else {
    const w = widthAt(N, anim);
    body = block('col', x - w / 2, w, baseY, N);
    topY = baseY - thickAt(N);
    topW = w;
  }
  const depth = pit * (L0 / 2 ** inPlane(N, anim)); // shrinks with the footprint and the camera scale
  const skew = depth * 0.35;
  const left = x - topW / 2;
  const tipY = Math.max(-100, topY);

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: op, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}tex`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.10} />
          <stop offset="0.5" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.14} />
        </linearGradient>
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor={PALETTE.gold} stopOpacity={0.9} />
          <stop offset="0.35" stopColor={PALETTE.gold} stopOpacity={0.35} />
          <stop offset="1" stopColor={PALETTE.goldDeep} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}sh`}>
          <stop offset="0" stopColor="#000" stopOpacity={0.55} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      {shadow && <ellipse cx={x} cy={baseY + 2} rx={Math.max(topW, minWidth) * 0.62 + 6} ry={Math.max(3, depth * 0.5 + 4)} fill={`url(#${id}sh)`} />}
      {body}
      {depth > 0.5 && !(anim && N % 1 > 0.0001) && (
        <polygon
          points={`${left},${topY} ${left + topW},${topY} ${left + topW + skew},${topY - depth} ${left + skew},${topY - depth}`}
          fill={face}
        />
      )}
      {gl > 0.001 && <circle cx={x} cy={tipY} r={26 + 22 * gl} fill={`url(#${id}glow)`} opacity={gl} />}
      {gl > 0.001 && <circle cx={x} cy={tipY} r={3.2} fill={PALETTE.ivory} opacity={gl} />}
    </svg>
  );
};
