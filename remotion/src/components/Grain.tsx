import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { mulberry32 } from '../lib/sky';

// GRAIN — a static, near-invisible dither over the whole frame so dark radial gradients (glows,
// the warm wash, terminators) don't break into bands in 8-bit video and platform re-encodes.
// Overlay blend: its strength scales with the pixel underneath, so pure space stays black
// (no gray lift) while gradients get ±1–2 levels of noise. Static on purpose: animated grain
// would eat the bitrate the stars need. Mount it LAST in a shot, above everything.
export type GrainProps = { opacity?: number; seed?: number };

export const Grain: React.FC<GrainProps> = ({ opacity = 0.1, seed = 11 }) => {
  const url = useMemo(() => {
    if (typeof document === 'undefined') return '';
    const N = 256;
    const c = document.createElement('canvas');
    c.width = N;
    c.height = N;
    const ctx = c.getContext('2d');
    if (!ctx) return '';
    const img = ctx.createImageData(N, N);
    const rnd = mulberry32(seed);
    for (let i = 0; i < N * N * 4; i += 4) {
      const v = ((rnd() + rnd() + rnd()) / 3) * 255; // triangular-ish distribution around mid-gray
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }, [seed]);
  if (!url) return null;
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${url})`, backgroundSize: '256px 256px', mixBlendMode: 'overlay', opacity, pointerEvents: 'none' }} />
  );
};
