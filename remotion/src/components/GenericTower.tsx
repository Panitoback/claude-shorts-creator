import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, GROUND } from '../brand';
import { kf, Keys } from './anim';

// GENERIC SUPERTALL TOWER — one needle-like tower as a flat dark silhouette (the Horizon's family:
// no texture, no lit faces, no outlines). Symmetric stepped setbacks and a long spire: it reads as
// "the tallest kind of building" without being any real one (deliberately NOT the Burj Khalifa's
// Y-plan spiral, brand §11: no recognizable landmarks). Drawn at a TRUE height: pass heightPx =
// height in metres ÷ metres per px. A few faint lit windows optional.
export type GenericTowerProps = {
  x: number; // center of the base
  baseY: number; // ground line
  heightPx: number; // full height to the spire tip (the honest number)
  color?: string; // default GROUND.land
  windows?: number; // 0..1 how many faint lit windows (default 0.35)
  opacity?: Keys;
};

// shape as fractions of the full height: [height up to here, half-width at that height]
const STEPS: [number, number][] = [
  [0.0, 0.05], [0.07, 0.05], [0.07, 0.04], [0.34, 0.037], [0.34, 0.03], [0.55, 0.027], [0.55, 0.021],
  [0.68, 0.019], [0.68, 0.013], [0.76, 0.011], [0.76, 0.006], [0.79, 0.005], [0.79, 0.0022], [1.0, 0.0006],
];

const hash = (n: number) => {
  const s = Math.sin(n * 91.7 + 13.1) * 43758.5;
  return s - Math.floor(s);
};

export const GenericTower: React.FC<GenericTowerProps> = ({ x, baseY, heightPx: H, color = GROUND.land, windows = 0.35, opacity = 1 }) => {
  const f = useCurrentFrame();
  const op = kf(f, opacity, 1);
  if (op <= 0.001 || H < 2) return null;
  const minHalf = 0.8;
  const pt = (h: number, w: number, s: 1 | -1) => `${x + s * Math.max(minHalf, w * H)},${baseY - h * H}`;
  const right = STEPS.map(([h, w]) => pt(h, w, 1));
  const left = [...STEPS].reverse().map(([h, w]) => pt(h, w, -1));
  const lit: React.ReactNode[] = [];
  if (windows > 0 && H > 220) {
    const rows = 60;
    for (let i = 2; i < rows; i++) {
      const hf = (i / rows) * 0.66;
      const seg = STEPS.findIndex(([h], j) => j > 0 && h > hf);
      const half = STEPS[Math.max(0, seg - 1)][1] * H * 0.75;
      if (hash(i) > windows || half < 3) continue;
      const wx = x + (hash(i * 7) - 0.5) * 2 * half;
      lit.push(<rect key={i} x={wx - 1} y={baseY - hf * H} width={2} height={Math.max(1.5, H * 0.003)} fill="#ffcf8a" opacity={0.45} />);
    }
  }
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: op, overflow: 'visible' }}>
      <polygon points={[...right, ...left].join(' ')} fill={color} />
      {lit}
    </svg>
  );
};
