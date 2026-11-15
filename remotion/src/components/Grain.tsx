import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { mulberry32 } from '../lib/sky';

// GRAIN — a static, near-invisible dither over the whole frame so dark radial gradients (glows,
// the warm wash, terminators) don't break into bands in 8-bit video and platform re-encodes.
// Screen blend of a very dark noise tile: it ADDS 0–`amp` levels (out of 255), so the dither is
// a constant ±amp/2 in the shadows where banding lives, and invisible in bright areas (an earlier
// overlay version scaled with brightness and showed as speckle in the quasar's corona). Space
// lifts by ~amp/2 levels on average: imperceptible. Static on purpose: animated grain would eat
// the bitrate the stars need. Mount it LAST in a shot, above everything.
export type GrainProps = { amp?: number; seed?: number };

export const Grain: React.FC<GrainProps> = ({ amp = 5, seed = 11 }) => {
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
      const v = ((rnd() + rnd()) / 2) * amp; // triangular distribution, 0..amp levels
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }, [seed, amp]);
  if (!url) return null;
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${url})`, backgroundSize: '256px 256px', mixBlendMode: 'screen', pointerEvents: 'none' }} />
  );
};
