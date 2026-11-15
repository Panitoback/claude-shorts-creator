import React from 'react';
import { Sequence, useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, GlowKind, MOTION, PALETTE, PlanetKind, RADIUS_KM, SAFE_RECT, TYPE } from '../brand';
import { GlowingBody } from './GlowingBody';
import { Planet } from './Planet';
import { ramp, startOf } from './anim';

// SCALE COMPARISON (brand §5 honest scale + §6) — bodies side by side at TRUE relative size.
// Anything that would be smaller than 4 px is drawn at 4 px and gets a marker ring, so it stays
// findable without lying about its size. Names (and optional values) sit on one label row.
export type ScaleBody = {
  name: string; // label: "EARTH"
  kind: PlanetKind | 'sun' | GlowKind; // planet preset, or a glowing star
  radiusKm?: number; // default: RADIUS_KM[kind] when known
  value?: string; // optional second label line: "12,742 km"
};

export type ScaleComparisonProps = {
  bodies: ScaleBody[];
  y?: number; // baseline (bottom of the bodies; default 1000)
  maxR?: number; // radius of the largest body in px before fitting (default 260)
  width?: number; // row width to fit into, centered on the safe rectangle (default 720)
  align?: 'bottom' | 'center'; // bottoms on one line (default) or centers on one line
  labels?: boolean;
  stagger?: number; // frames between bodies appearing (default MOTION.overlap * 2)
  at?: number;
  warm?: boolean;
};

const MIN_R = 4;
const GLOW: string[] = ['sun', 'red', 'white', 'blue'];
const labelW = (s: string) => s.length * 22 + 24; // TYPE.annotation, uppercase, letterSpacing 3

export const ScaleComparison: React.FC<ScaleComparisonProps> = ({
  bodies, y = 1000, maxR = 260, width = 720, align = 'bottom', labels = true, stagger = MOTION.overlap * 2, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const km = bodies.map((b) => b.radiusKm ?? (RADIUS_KM as Record<string, number>)[b.kind] ?? 1);
  const big = Math.max(...km);
  const gap = 36;

  // fit: shrink maxR until the row (bodies or their labels, whichever is wider) fits `width`
  const layout = (R: number) => {
    const rs = km.map((k) => Math.max(MIN_R, (k / big) * R));
    const slots = rs.map((r, i) => Math.max(2 * r + (GLOW.includes(bodies[i].kind) ? r * 0.5 : 0), labels ? labelW(bodies[i].name) : 0, 2 * ANNOTATION.markerRing));
    const total = slots.reduce((a, b) => a + b, 0) + gap * (slots.length - 1);
    return { rs, slots, total };
  };
  // labels can't shrink: if they alone exceed `width`, widen the row up to the safe rectangle
  const floor = layout(0).total;
  const target = Math.max(width, Math.min(floor, SAFE_RECT.w));
  let R = maxR;
  let L = layout(R);
  for (let i = 0; i < 60 && L.total > target && L.total > floor + 1; i++) {
    R *= 0.95;
    L = layout(R);
  }
  const cx0 = SAFE_RECT.x + SAFE_RECT.w / 2 - L.total / 2;
  let cursor = cx0;
  const placed = L.rs.map((r, i) => {
    const cx = cursor + L.slots[i] / 2;
    cursor += L.slots[i] + gap;
    const tiny = (km[i] / big) * R < MIN_R;
    const cy = align === 'bottom' ? y - r : y - Math.max(...L.rs);
    return { cx, cy, r, tiny };
  });
  const labelTop = y + 26; // under the baseline (center align: under the largest body)

  return (
    <>
      {bodies.map((b, i) => {
        const p = placed[i];
        return (
          <Sequence key={i} from={warm ? 0 : s + i * stagger} layout="none">
            {GLOW.includes(b.kind) ? (
              <GlowingBody x={p.cx} y={p.cy} r={p.r} kind={b.kind as GlowKind} wash={false} warm={warm} />
            ) : (
              <Planet x={p.cx} y={p.cy} r={p.r} kind={b.kind as PlanetKind} warm={warm} />
            )}
          </Sequence>
        );
      })}
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {placed.map((p, i) => {
          if (!p.tiny) return null;
          const m = ramp(f, s + i * stagger + MOTION.discIn - MOTION.overlap, MOTION.markerIn);
          return <circle key={i} cx={p.cx} cy={p.cy} r={ANNOTATION.markerRing * (1.6 - 0.6 * m)} fill="none" stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} opacity={m} />;
        })}
      </svg>
      {labels && placed.map((p, i) => {
        const a = ramp(f, s + i * stagger + MOTION.discIn - MOTION.overlap, MOTION.labelIn);
        return (
          <div key={i} style={{ position: 'absolute', left: p.cx - 150, width: 300, top: labelTop, textAlign: 'center', opacity: a }}>
            <div style={{ ...TYPE.annotation, color: PALETTE.sciText }}>{bodies[i].name}</div>
            {bodies[i].value && <div style={{ ...TYPE.annotation, color: PALETTE.sci, marginTop: 6, letterSpacing: 1 }}>{bodies[i].value}</div>}
          </div>
        );
      })}
    </>
  );
};
