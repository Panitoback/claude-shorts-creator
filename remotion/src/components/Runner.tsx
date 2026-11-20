import React from 'react';

// RUNNER (PROJECT_CONTEXT §3.6, a Race mover) — a generic sprinter in profile, facing right. Realistic
// proportions (~7.5 heads), no face, not modeled on any real athlete, never a celebration or a pointing
// pose. Built like the Observer: a jointed skeleton of tapered limbs with rounded joints, so every pose
// stays anatomically sane. Body near-black from the space family (never #000, brand §2) with a soft warm
// rim light on its upper-left edge so it reads against the sky; singlet and shoe colors are muted
// DEPICTIONS (like a true-color planet), never accents (default: muted green singlet + yellow trim).
//
// Pure drawing: the caller animates it. Poses blend: stand → `set` (crouched start, hands on the line)
// → `run` (the sprint cycle, driven by `phase` in radians: one stride = 2π). `breath` 0..1 = a slight
// idle breathing. Anchored at the HIP x and the GROUND y under the feet, so a moving runner keeps its
// hip on a straight line while the lowest foot stays on the ground.
export type RunnerProps = {
  x: number; // hip x
  y: number; // ground y (feet)
  h: number; // standing height, px (hook ~110, board row ~34–40)
  set?: number; // 0..1 blend toward the crouched start
  run?: number; // 0..1 blend toward the sprint cycle
  phase?: number; // sprint cycle phase, radians
  breath?: number; // 0..1 idle breathing (sin of something slow, supplied by the caller)
  opacity?: number;
  singlet?: string; // default muted green
  trim?: string; // default muted yellow (singlet trim + shoes)
  rim?: number; // rim light strength 0..1 (default 1)
};

type V = [number, number];
const dir = (a: number): V => [Math.sin((a * Math.PI) / 180), -Math.cos((a * Math.PI) / 180)]; // 0 = up, 90 = forward, 180 = down
const add = (p: V, d: V, l: number): V => [p[0] + d[0] * l, p[1] + d[1] * l];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BODY = '#0d0f17'; // near-black, space family
const BODY_FAR = '#1a1d27'; // far-side limbs: a touch lighter so the two legs separate
const RIM = '#ffc27a';

type Pose = {
  torso: number; neck: number;
  thighN: number; shinN: number; thighF: number; shinF: number;
  upperN: number; foreN: number; upperF: number; foreF: number;
};

// just stopped: weight settling, one foot ahead, knees soft, elbows bent (no gesture)
const STAND: Pose = { torso: 7, neck: 12, thighN: 166, shinN: 186, thighF: 192, shinF: 184, upperN: 196, foreN: 148, upperF: 170, foreF: 136 };
// "set" position: hips above the shoulders, hands on the START line under the shoulders, front knee ~90°
const SET: Pose = { torso: 102, neck: 116, thighN: 112, shinN: 205, thighF: 150, shinF: 236, upperN: 176, foreN: 180, upperF: 184, foreF: 182 };

const leg = (p: number) => {
  const thigh = 180 - 25 - 50 * Math.sin(p); // 105 (high knee) … 205 (push-off)
  const c = Math.max(0, Math.cos(p - 0.35));
  const knee = 15 + 110 * Math.pow(c, 1.3); // heel to the hip in the swing, nearly straight at push-off
  return [thigh, thigh + knee];
};
const arm = (p: number) => {
  const upper = 180 + 60 * Math.sin(p); // opposite of the same-side leg
  return [upper, upper - 75 + 15 * Math.sin(p)];
};
export const runPose = (phase: number): Pose => {
  const [thighN, shinN] = leg(phase);
  const [thighF, shinF] = leg(phase + Math.PI);
  const [upperN, foreN] = arm(phase);
  const [upperF, foreF] = arm(phase + Math.PI);
  return { torso: 16, neck: 20, thighN, shinN, thighF, shinF, upperN, foreN, upperF, foreF };
};

const blend = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (o[k] = lerp(a[k], b[k], t)));
  return o;
};

const Seg: React.FC<{ a: V; b: V; w0: number; w1: number; fill: string }> = ({ a, b, w0, w1, fill }) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  const pts = [
    [a[0] + (nx * w0) / 2, a[1] + (ny * w0) / 2], [b[0] + (nx * w1) / 2, b[1] + (ny * w1) / 2],
    [b[0] - (nx * w1) / 2, b[1] - (ny * w1) / 2], [a[0] - (nx * w0) / 2, a[1] - (ny * w0) / 2],
  ].map((q) => q.join(',')).join(' ');
  return (
    <>
      <polygon points={pts} fill={fill} />
      <circle cx={a[0]} cy={a[1]} r={w0 / 2} fill={fill} />
      <circle cx={b[0]} cy={b[1]} r={w1 / 2} fill={fill} />
    </>
  );
};

let uid = 0;

export const Runner: React.FC<RunnerProps> = ({
  x, y, h, set = 0, run = 0, phase = 0, breath = 0, opacity = 1, singlet = '#3c7a52', trim = '#d8b64e', rim = 1,
}) => {
  const id = React.useMemo(() => `rn${uid++}`, []);
  if (opacity <= 0.001) return null;
  const P = blend(blend(STAND, SET, Math.min(1, Math.max(0, set))), runPose(phase), Math.min(1, Math.max(0, run)));
  const S = { thigh: 0.245, shin: 0.245, torso: 0.3, neck: 0.04, upper: 0.165, fore: 0.155, foot: 0.07, head: 0.062 };
  const L = (k: keyof typeof S) => S[k] * h;
  // skeleton in local coords, hip at (0, 0)
  const hip: V = [0, 0];
  const sh = add(hip, dir(P.torso), L('torso') * (1 + 0.012 * breath));
  const neckEnd = add(sh, dir(P.neck), L('neck'));
  const head = add(neckEnd, dir(P.neck), L('head') * 0.95);
  const kneeN = add(hip, dir(P.thighN), L('thigh'));
  const ankleN = add(kneeN, dir(P.shinN), L('shin'));
  const kneeF = add(hip, dir(P.thighF), L('thigh'));
  const ankleF = add(kneeF, dir(P.shinF), L('shin'));
  const toeOf = (ankle: V, shin: number): V => add(ankle, dir(Math.min(150, Math.max(60, shin - 90))), L('foot')); // foot roughly ⟂ to the shin, toes forward
  const toeN = toeOf(ankleN, P.shinN);
  const toeF = toeOf(ankleF, P.shinF);
  const elN = add(sh, dir(P.upperN), L('upper'));
  const handN = add(elN, dir(P.foreN), L('fore'));
  const elF = add(sh, dir(P.upperF), L('upper'));
  const handF = add(elF, dir(P.foreF), L('fore'));
  // ground: the lowest of feet and hands (hands only count in the crouch) touches y
  const lows = [ankleN[1], ankleF[1], toeN[1], toeF[1]];
  if (set > 0.5) lows.push(handN[1], handF[1]);
  const lift = Math.max(...lows) + h * 0.012; // the foot's sole thickness
  const ox = x;
  const oy = y - lift;
  const W = h * 0.115; // chest width
  const limbs = (body: string, far: string, sing: string, tr: string) => (
    <>
      {/* far side first */}
      <Seg a={sh} b={elF} w0={h * 0.05} w1={h * 0.04} fill={far} />
      <Seg a={elF} b={handF} w0={h * 0.04} w1={h * 0.03} fill={far} />
      <Seg a={hip} b={kneeF} w0={h * 0.075} w1={h * 0.05} fill={far} />
      <Seg a={kneeF} b={ankleF} w0={h * 0.05} w1={h * 0.032} fill={far} />
      <Seg a={ankleF} b={toeF} w0={h * 0.032} w1={h * 0.022} fill={tr === body ? far : tr} />
      {/* torso: singlet over the trunk, head */}
      <Seg a={hip} b={sh} w0={W * 0.9} w1={W} fill={sing} />
      <Seg a={sh} b={neckEnd} w0={h * 0.045} w1={h * 0.04} fill={body} />
      <circle cx={head[0]} cy={head[1]} r={L('head')} fill={body} />
      {/* near side */}
      <Seg a={hip} b={kneeN} w0={h * 0.08} w1={h * 0.052} fill={body} />
      <Seg a={kneeN} b={ankleN} w0={h * 0.052} w1={h * 0.034} fill={body} />
      <Seg a={ankleN} b={toeN} w0={h * 0.034} w1={h * 0.024} fill={tr} />
      <Seg a={sh} b={elN} w0={h * 0.052} w1={h * 0.042} fill={body} />
      <Seg a={elN} b={handN} w0={h * 0.042} w1={h * 0.032} fill={body} />
    </>
  );
  // singlet trim: a stripe down the side of the trunk and the hem
  const trunk = (k: number, side: number): V => {
    const p = add(hip, dir(P.torso), L('torso') * k);
    const n = dir(P.torso + 90 * side);
    return add(p, n, (W * (0.9 + 0.1 * k)) / 2 - h * 0.012);
  };
  const ro = Math.max(1.3, h * 0.016); // rim offset (light from the upper left)
  return (
    <svg width={1} height={1} style={{ position: 'absolute', left: ox, top: oy, overflow: 'visible', opacity }}>
      <defs>
        <filter id={`${id}r`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={Math.max(0.5, h * 0.006)} />
        </filter>
        <filter id={`${id}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={Math.max(1.5, h * 0.03)} />
        </filter>
      </defs>
      {/* soft warm halo, then the rim (the whole figure, offset toward the light), then the body */}
      <g filter={`url(#${id}g)`} opacity={0.28 * rim}>{limbs(RIM, RIM, RIM, RIM)}</g>
      <g transform={`translate(${-ro} ${-ro})`} filter={`url(#${id}r)`} opacity={0.85 * rim}>{limbs(RIM, RIM, RIM, RIM)}</g>
      {limbs(BODY, BODY_FAR, singlet, trim)}
      <polyline points={[trunk(0.05, -1), trunk(0.95, -1)].map((q) => q.join(',')).join(' ')} stroke={trim} strokeWidth={Math.max(0.8, h * 0.012)} fill="none" strokeLinecap="round" />
    </svg>
  );
};
