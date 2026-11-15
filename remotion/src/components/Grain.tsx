import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CANVAS } from '../brand';

// GRAIN — a static, near-invisible dither so dark radial gradients (glows, the warm wash,
// terminators) don't break into bands in 8-bit video and platform re-encodes.
//
// It WRAPS the scene (an SVG filter on the shot's content) instead of sitting on top of it, so
// it can see what's underneath: it ADDS 0–`amp` levels (out of 255) of noise to every pixel
// EXCEPT pure #000. That keeps a black hole's shadow (PALETTE.hole, brand §2's single pure-black
// exception) truly #000, automatically and wherever the camera puts it. Additive like the old
// screen-blend overlay: a constant ±amp/2 dither in the shadows where banding lives, invisible in
// bright areas (no speckle in a quasar's corona). Space lifts by ~amp/2 levels on average:
// imperceptible. Static on purpose (fixed seed): animated grain would eat the bitrate the stars
// need. Wrap the whole shot: <Grain>{everything}</Grain>, background included.
export type GrainProps = { amp?: number; seed?: number; children?: React.ReactNode };

let uid = 0;

export const Grain: React.FC<GrainProps> = ({ amp = 5, seed = 11, children }) => {
  const id = React.useMemo(() => `grain${uid++}`, []);
  const k = amp / 255;
  return (
    <AbsoluteFill style={{ filter: `url(#${id})` }}>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        {/* sRGB math throughout: levels in, levels out (linearRGB would distort the amplitude) */}
        <filter id={id} x={0} y={0} width={CANVAS.W} height={CANVAS.H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          {/* per-pixel noise → grey 0..amp levels (turbulence R sits mostly in 0.25–0.75) */}
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={1} seed={seed} result="t" />
          <feColorMatrix
            in="t"
            type="matrix"
            values={`${2 * k} 0 0 0 ${-0.5 * k}  ${2 * k} 0 0 0 ${-0.5 * k}  ${2 * k} 0 0 0 ${-0.5 * k}  0 0 0 0 1`}
            result="noise"
          />
          {/* mask: 1 wherever the scene isn't pure black, 0 on #000 */}
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0 1" result="sum" />
          <feComponentTransfer in="sum" result="mask">
            <feFuncR type="discrete" tableValues={DISCRETE} />
            <feFuncG type="discrete" tableValues={DISCRETE} />
            <feFuncB type="discrete" tableValues={DISCRETE} />
          </feComponentTransfer>
          <feComposite in="noise" in2="mask" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="masked" />
          <feComposite in="SourceGraphic" in2="masked" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

// 0 for the first 1/256 of the range (exactly 0), 1 above it
const DISCRETE = ['0', ...Array(255).fill('1')].join(' ');
