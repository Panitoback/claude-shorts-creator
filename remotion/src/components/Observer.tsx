import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, GROUND } from '../brand';
import { kf, Keys, ramp, startOf } from './anim';

// OBSERVER (brand §11) — a small, sober human silhouette looking up, for scale and feeling. Seen in
// profile, realistic proportions (~7.5 heads), the same flat near-black as the nearest horizon layer.
// No face, no cartoon features, no gesture bigger than pointing. Never the hero: keep it small.
// Built from a jointed skeleton (tapered limbs + rounded joints), so poses stay anatomically sane.
// Poses: 'standing' (head tilted back, looking up), 'sitting' (on the ground, leaning back on the
// hands), 'pointing' (standing, near arm raised toward `point` degrees above the horizon).
export type ObserverPose = 'standing' | 'sitting' | 'pointing';
export type ObserverProps = {
  x: number; // feet (standing) / seat (sitting) position on the ground
  y: number;
  h: number; // standing height in px (the figure is scaled from it in every pose)
  pose?: ObserverPose;
  facing?: 'right' | 'left';
  look?: Keys; // how far the head tips back, degrees (default 32 = looking up high); keys = a slow head turn
  point?: Keys; // pointing: arm elevation above the horizon, degrees (default 40)
  color?: string; // default GROUND.land
  at?: number;
  warm?: boolean;
};

type V = [number, number];
const dir = (a: number): V => [Math.sin((a * Math.PI) / 180), -Math.cos((a * Math.PI) / 180)]; // 0 = up, 90 = forward
const add = (p: V, d: V, l: number): V => [p[0] + d[0] * l, p[1] + d[1] * l];

// one tapered limb segment as a polygon + round caps (circles) at both joints
const Seg: React.FC<{ a: V; b: V; w0: number; w1: number; fill: string }> = ({ a, b, w0, w1, fill }) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const pts = [
    [a[0] + nx * w0 / 2, a[1] + ny * w0 / 2], [b[0] + nx * w1 / 2, b[1] + ny * w1 / 2],
    [b[0] - nx * w1 / 2, b[1] - ny * w1 / 2], [a[0] - nx * w0 / 2, a[1] - ny * w0 / 2],
  ].map((p) => p.join(',')).join(' ');
  return (
    <>
      <polygon points={pts} fill={fill} />
      <circle cx={a[0]} cy={a[1]} r={w0 / 2} fill={fill} />
      <circle cx={b[0]} cy={b[1]} r={w1 / 2} fill={fill} />
    </>
  );
};

export const Observer: React.FC<ObserverProps> = ({
  x, y, h, pose = 'standing', facing = 'right', look = 32, point = 40, color = GROUND.land, at = 0, warm = true,
}) => {
  const f = useCurrentFrame();
  const op = ramp(f, startOf(at, warm), 20);
  const pt = kf(f, point, 40);
  // segment lengths (fractions of standing height)
  const S = { thigh: 0.245, shin: 0.235, torso: 0.29, neck: 0.045, upper: 0.165, fore: 0.15, hand: 0.06 };
  // joint angles (deg; 0 = up, 90 = forward, 180 = down) per pose
  const P = {
    standing: { hip: [0, -0.52] as V, thigh: 178, shin: 182, torso: -3, neck: -6, upper: 186, fore: 176, far: 182, farFore: 170 },
    sitting: { hip: [0, -0.07] as V, thigh: 55, shin: 168, torso: -24, neck: -12, upper: 206, fore: 196, far: 200, farFore: 190 },
    pointing: { hip: [0, -0.52] as V, thigh: 178, shin: 182, torso: -3, neck: -6, upper: 90 - pt, fore: 90 - pt, far: 184, farFore: 172 },
  }[pose];

  const hip = P.hip;
  const knee = add(hip, dir(P.thigh), S.thigh);
  const ankle = add(knee, dir(P.shin), S.shin);
  const neckB = add(hip, dir(P.torso), S.torso);
  const shoulder = add(hip, dir(P.torso), S.torso * 0.86);
  const neckT = add(neckB, dir(P.neck), S.neck);
  const headTilt = -kf(f, look, 32); // tipping back
  const headC = add(neckT, dir(headTilt), 0.062);
  const elbow = add(shoulder, dir(P.upper), S.upper);
  const wrist = add(elbow, dir(P.fore), S.fore);
  const hand = add(wrist, dir(P.fore), S.hand);
  const elbowF = add(shoulder, dir(P.far), S.upper);
  const wristF = add(elbowF, dir(P.farFore), S.fore);
  // foot: heel just behind the ankle, toe forward along the ground
  const footY = Math.max(ankle[1], -0.012);
  const heel: V = [ankle[0] - 0.025, footY];
  const toe: V = [ankle[0] + 0.1, footY + 0.004];
  const face = dir(headTilt + 90); // the way the face points
  const nose = add(add(headC, face, 0.064), dir(headTilt), 0.004);
  const chin = add(add(headC, face, 0.046), dir(headTilt + 180), 0.05);
  const flip = facing === 'left' ? -1 : 1;
  const fill = color;
  const W = 1; // line widths are fractions of height too

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op }}>
      <g transform={`translate(${x} ${y}) scale(${h * flip} ${h})`}>
        {/* far arm first (behind the body) */}
        <Seg a={shoulder} b={elbowF} w0={0.042 * W} w1={0.036} fill={fill} />
        <Seg a={elbowF} b={wristF} w0={0.036} w1={0.028} fill={fill} />
        {/* legs (the far leg hidden behind the near one in profile, slightly offset) */}
        <Seg a={hip} b={add(knee, [0.012, 0], 1)} w0={0.088} w1={0.056} fill={fill} />
        <Seg a={add(knee, [0.012, 0], 1)} b={add(ankle, [-0.008, 0], 1)} w0={0.056} w1={0.034} fill={fill} />
        <Seg a={hip} b={knee} w0={0.11} w1={0.064} fill={fill} />
        <Seg a={knee} b={ankle} w0={0.064} w1={0.038} fill={fill} />
        <Seg a={heel} b={toe} w0={0.04} w1={0.022} fill={fill} />
        {/* torso: pelvis → chest, deepest at the chest */}
        <Seg a={add(hip, [-0.008, 0], 1)} b={add(hip, dir(P.torso), S.torso * 0.5)} w0={0.125} w1={0.122} fill={fill} />
        <Seg a={add(hip, dir(P.torso), S.torso * 0.5)} b={add(neckB, dir(P.torso + 180), 0.035)} w0={0.122} w1={0.115} fill={fill} />
        <Seg a={add(neckB, dir(P.torso + 180), 0.035)} b={neckB} w0={0.115} w1={0.06} fill={fill} />
        <Seg a={neckB} b={neckT} w0={0.05} w1={0.044} fill={fill} />
        {/* head: a skull ellipse tipped back, a soft nose and chin line — no eyes, no mouth */}
        <ellipse cx={headC[0]} cy={headC[1]} rx={0.05} ry={0.062} transform={`rotate(${headTilt} ${headC[0]} ${headC[1]})`} fill={fill} />
        <polygon points={[add(add(headC, face, 0.02), dir(headTilt), 0.04), add(add(headC, face, 0.05), dir(headTilt), 0.02), nose, add(add(nose, dir(headTilt + 180), 0.022), face, -0.008), chin, add(add(headC, face, 0.0), dir(headTilt + 180), 0.06)].map((p) => p.join(',')).join(' ')} fill={fill} />
        {/* near arm last */}
        <Seg a={shoulder} b={elbow} w0={0.052} w1={0.042} fill={fill} />
        <Seg a={elbow} b={wrist} w0={0.042} w1={0.032} fill={fill} />
        <Seg a={wrist} b={hand} w0={0.03} w1={pose === 'pointing' ? 0.014 : 0.026} fill={fill} />
      </g>
    </svg>
  );
};
