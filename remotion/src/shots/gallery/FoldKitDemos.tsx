import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PALETTE, SAFE_RECT } from '../../brand';
import { AltitudeAscent, AltitudeLine, FieldRibbon, kf, Marker, OdometerNumber, PaperFoldStack, ScaleBar } from '../../components';
import type { Key } from '../../components/anim';

// Gallery pages for the "Fold Paper 42 Times" kit (pages 44–46 of ComponentGallery, 120 frames each).
const CX = SAFE_RECT.x + SAFE_RECT.w / 2;
const steps = (from: number, n: number, every: number): Key[] => {
  const k: Key[] = [[from, 0]];
  for (let i = 0; i < n; i++) k.push([from + i * every + 4, i], [from + i * every + every, i + 1, 'inOut']);
  return k;
};

// 44: macro folds — 0 → 5 animated (in-plane, toward the camera, in-plane…), layers as hairlines
export const PaperFoldDemo: React.FC = () => {
  const gy = SAFE_RECT.y + SAFE_RECT.h * 0.62;
  const n = steps(6, 5, 20);
  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <OdometerNumber value={n} digits={1} x={CX} y={SAFE_RECT.y + 40} size={160} align="center" />
      <PaperFoldStack x={CX} baseY={gy} n={n} pxPerMm={180} hScale={60} />
      <ScaleBar vertical x1={gy - 18} x2={gy} y={CX + 330} label="0.1 MM" warm />
    </AbsoluteFill>
  );
};

// 45: the climb — one log-paced ascent: observer → tower → edge of space → station → the Moon
export const AscentDemo: React.FC = () => {
  const f = useCurrentFrame();
  const gy = SAFE_RECT.y + SAFE_RECT.h * 0.87;
  const nK: Key[] = [[0, 14], [110, 42, 'inOut']];
  const logs = Array.from({ length: 16 }, (_, j) => {
    const fr = f - 15 + j;
    return [fr, Math.log10((1e-4 * 2 ** kf(fr, nK, 14)) / kf(fr, [[0, 520], [110, 700]], 520))] as const;
  });
  return (
    <AltitudeAscent logScale={logs} groundY={gy} n={nK} stack={{ animate: 0, glow: [[40, 0], [60, 1]], gold: [[40, 0], [60, 0.75]] }}
      observer={{ xM: -0.55, hM: 1.68, facing: 'right' }} tower={{ xM: -255, heightM: 828 }}
      station={{ altM: 400e3, xM: 700e3, size: 46, opacity: [[50, 0], [60, 1], [80, 1], [90, 0]] }} moon={{ distM: 384400e3, angleDeg: 9 }}>
      {(w) => (
        <>
          {f > 40 && f < 92 && <AltitudeLine cx={w.cx} cy={w.cy} r={(w.rpx * w.S + 100e3) / w.S} fromX={w.x} label="EDGE OF SPACE" value="62 MI" at={42} out={86} />}
          {f > 96 && (() => {
            const a = (9 * Math.PI) / 180;
            return <Marker x={w.cx + (384400e3 * Math.sin(a)) / w.S} y={w.cy - (384400e3 * Math.cos(a)) / w.S} label="MOON" side="right" length={40} at={98} />;
          })()}
        </>
      )}
    </AltitudeAscent>
  );
};

// 46: the ribbon — track along a row of fields, pull back to all 176, fold 13 times into a block
export const FieldRibbonDemo: React.FC = () => {
  const f = useCurrentFrame();
  const cy = SAFE_RECT.y + SAFE_RECT.h * 0.5;
  const folds = steps(70, 13, 3);
  const n = kf(f, folds, 0);
  const full = (SAFE_RECT.h * 0.92) / 176;
  const z = kf(f, [[20, 0], [60, 1, 'inOut']], 0);
  const P = f >= 70 ? Math.max(full, (SAFE_RECT.h * 0.92 + (160 - SAFE_RECT.h * 0.92) * (n / 13)) / (176 / 2 ** n)) : 10 ** (Math.log10(520) + (Math.log10(full) - Math.log10(520)) * z);
  const C = f >= 70 ? 88 : kf(f, [[0, 2], [20, 4, 'linear']], 2) + (88 - kf(f, [[0, 2], [20, 4, 'linear']], 2)) * z;
  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <FieldRibbon cy={cy} fields={176} fieldPx={P} center={C} ribbonYd={17600} folds={folds} ribbonMinPx={8} />
      <OdometerNumber value={folds} digits={2} x={CX} y={SAFE_RECT.y + 20} size={150} align="center" />
    </AbsoluteFill>
  );
};
