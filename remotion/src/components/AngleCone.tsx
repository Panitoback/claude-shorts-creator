import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { CL, kf, Keys, ramp, startOf } from './anim';

// ANGLE CONE (brand §11, built for "same apparent size" ideas like the Sun–Moon 400× coincidence) —
// two sight lines from an observer's eye that draw outward, a faint gold wedge between them, and a
// dashed GHOST DISC that slides along the cone, growing exactly with distance, and lands on a second
// disc: anything that fills the same angle looks the same size. Geometry is exact: a disc at
// distance d along the axis has radius d·sin(half-angle), so the ghost always touches both lines.
// Place your real bodies with coneDisc() so they sit exactly in the cone; the cone draws only lines,
// wedge and ghost (Flow-paths style: lines draw in, the ghost is dashed and faint).
export type AngleConeProps = {
  eye: [number, number]; // the observer's eye
  toward: [number, number]; // a point on the cone's axis (sets the direction)
  halfAngle: number; // degrees (exaggerate for a diagram; say so if it's not the true 0.26°)
  reach: number; // how far the sight lines extend, px along the axis
  ghost?: { from: number; to: number; at: number; len?: number }; // distances along the axis (px), slide timing
  drawAt?: number; // frame the lines start drawing
  drawLen?: number; // frames to draw (default 24)
  wedge?: number; // gold wedge opacity (default 0.12)
  label?: string; // e.g. "SAME ANGLE": fades in near the eye once the ghost lands
  fade?: Keys; // overall opacity keys (to clear the diagram)
  warm?: boolean;
};

export const coneDisc = (eye: [number, number], toward: [number, number], halfAngle: number, d: number) => {
  const L = Math.hypot(toward[0] - eye[0], toward[1] - eye[1]) || 1;
  const ux = (toward[0] - eye[0]) / L;
  const uy = (toward[1] - eye[1]) / L;
  // a disc tangent to both lines: center at distance D along the axis, radius D·sin(α)
  const r = d * Math.sin((halfAngle * Math.PI) / 180);
  return { x: eye[0] + ux * d, y: eye[1] + uy * d, r };
};

export const AngleCone: React.FC<AngleConeProps> = ({
  eye, toward, halfAngle, reach, ghost, drawAt = 0, drawLen = 24, wedge = 0.12, label, fade = 1, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(drawAt, warm);
  const p = ramp(f, s, drawLen);
  const L = Math.hypot(toward[0] - eye[0], toward[1] - eye[1]) || 1;
  const ux = (toward[0] - eye[0]) / L;
  const uy = (toward[1] - eye[1]) / L;
  const al = (halfAngle * Math.PI) / 180;
  const rot = (vx: number, vy: number, t: number): [number, number] => [vx * Math.cos(t) - vy * Math.sin(t), vx * Math.sin(t) + vy * Math.cos(t)];
  const [ax, ay] = rot(ux, uy, al);
  const [bx, by] = rot(ux, uy, -al);
  const len = (reach / Math.cos(al)) * p;
  const A: [number, number] = [eye[0] + ax * len, eye[1] + ay * len];
  const B: [number, number] = [eye[0] + bx * len, eye[1] + by * len];
  const op = kf(f, fade, 1);

  let g: React.ReactNode = null;
  if (ghost) {
    const gl = ghost.len ?? 40;
    const gs = ghost.at;
    const show = interpolate(f, [gs - 8, gs], [0, 1], CL);
    const d = interpolate(f, [gs, gs + gl], [ghost.from, ghost.to], { ...CL, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
    const landed = interpolate(f, [gs + gl - 4, gs + gl + 10], [0, 1], CL);
    const c = coneDisc(eye, toward, halfAngle, d);
    g = (
      <circle cx={c.x} cy={c.y} r={c.r} fill="none" stroke={PALETTE.ivory} strokeWidth={3} strokeDasharray="10 9" opacity={show * (0.75 - 0.35 * landed)} />
    );
  }
  const lb = label && ghost ? ramp(f, ghost.at + (ghost.len ?? 40), MOTION.labelIn + 4) : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op }}>
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <polygon points={`${eye.join(',')} ${A.join(',')} ${B.join(',')}`} fill={PALETTE.gold} opacity={wedge * p} />
        <line x1={eye[0]} y1={eye[1]} x2={A[0]} y2={A[1]} stroke={PALETTE.gold} strokeWidth={Math.max(ANNOTATION.stroke, 3)} strokeLinecap="round" opacity={0.85} />
        <line x1={eye[0]} y1={eye[1]} x2={B[0]} y2={B[1]} stroke={PALETTE.gold} strokeWidth={Math.max(ANNOTATION.stroke, 3)} strokeLinecap="round" opacity={0.85} />
        <circle cx={eye[0]} cy={eye[1]} r={6} fill={PALETTE.gold} opacity={p} />
        {g}
      </svg>
      {label && (
        <div style={{ position: 'absolute', left: eye[0] - 300, width: 600, top: eye[1] + 26, textAlign: 'center', ...TYPE.annotation, color: PALETTE.sciText, opacity: lb }}>
          {label}
        </div>
      )}
    </div>
  );
};
