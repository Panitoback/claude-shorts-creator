import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CANVAS, GROUND, PALETTE, RADIUS_KM, SKY, SkyPreset } from '../brand';
import { kf, Keys } from './anim';
import { GenericTower } from './GenericTower';
import { Horizon, HorizonVariant } from './Horizon';
import { Observer, ObserverPose } from './Observer';
import { PaperFoldStack, PaperFoldStackProps } from './PaperFoldStack';
import { Planet } from './Planet';
import { SkyView } from './SkyView';
import { SpaceStation } from './SpaceStation';

// ALTITUDE ASCENT — one continuous, log-paced camera climb in SIDE VIEW (an elevation: altitude is
// up, distance along the ground is across), true to scale in every frame. One dial drives it:
// `logScale` = log10(metres per pixel). Small values are a macro shot of a sheet on the ground under
// a dusk sky with a generic city skyline far behind (a ground view, brand §11); as the scale grows the
// observer and a supertall tower stand at their true heights, the ground line starts to curve with
// Earth's real radius, the sky thins to space above a thin blue atmosphere limb, the station rides its
// orbit and finally Earth and the Moon sit at their true sizes and true distance (the Planet
// component takes over the globe once it is small). Animate `logScale` with keys (equal screen time
// per doubling = log-paced); a fast keyframed jump + Camera blur is a hook-fast ascent.
// Objects are placed in metres (`xM` along the ground from the column, altitude above the ground).
// `children(world)` gets the projection so annotations can be pinned to world points.
// The column is a PaperFoldStack whose height is 0.1 mm × 2^n at the same scale.
export type AscentWorld = {
  S: number; // metres per px
  x: number; // the column's screen x (the ground point under the camera)
  groundY: number;
  cx: number; // Earth center on screen
  cy: number;
  rpx: number; // Earth radius on screen
  at: (xM: number, altM: number) => [number, number]; // world → screen (curved Earth)
  colTopY: number; // screen y of the column's top
};
export type AltitudeAscentProps = {
  logScale: Keys; // log10(metres per px)
  groundY: Keys; // screen y of the ground under the column
  x?: number; // column x (default canvas center)
  n: Keys; // fold count of the column
  stack?: Partial<Omit<PaperFoldStackProps, 'x' | 'baseY' | 'n' | 'pxPerMm'>>;
  sky?: SkyPreset; // the ground sky (default 'dusk')
  skyline?: HorizonVariant | false; // default 'city'
  horizonGap?: number; // px between the far horizon and the near ground at macro/human scale (default 170)
  observer?: { xM: number; hM?: number; pose?: ObserverPose; facing?: 'left' | 'right'; opacity?: Keys };
  tower?: { xM: number; heightM: number; opacity?: Keys };
  station?: { altM: number; xM: number; size?: number; orbit?: boolean; opacity?: Keys };
  moon?: { distM: number; angleDeg?: number; opacity?: Keys }; // center-to-center distance; angle from straight up (+ = right)
  lon0?: number; // Earth's face once it is a globe
  children?: (w: AscentWorld) => React.ReactNode;
};

const R = RADIUS_KM.earth * 1000;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const AltitudeAscent: React.FC<AltitudeAscentProps> = ({
  logScale, groundY: groundK, x = CANVAS.W / 2, n, stack = {}, sky = 'dusk', skyline = 'city', horizonGap = 170,
  observer, tower, station, moon, lon0, children,
}) => {
  const f = useCurrentFrame();
  const L = kf(f, logScale, -3);
  const S = 10 ** L;
  const gy = kf(f, groundK, CANVAS.H * 0.75);
  const rpx = R / S;
  const cx = x;
  const cy = gy + rpx;
  const at = (xM: number, altM: number): [number, number] => {
    const th = xM / R;
    const s2 = Math.sin(th / 2);
    return [x + ((R + altM) * Math.sin(th)) / S, gy + (R * 2 * s2 * s2 - altM * Math.cos(th)) / S];
  };
  // how far up the frame reaches decides how much of the sky is space
  const spaceAt = (LL: number, g: number) => smooth(3.9, 5.1, Math.log10(Math.max(1, g * 10 ** LL)));
  const toSpace = spaceAt(L, gy);
  const revealK: Keys = Array.from({ length: 16 }, (_, j) => {
    const fr = f - 15 + j;
    return [fr, Math.max(SKY[sky].stars, spaceAt(kf(fr, logScale, -3), kf(fr, groundK, gy)))] as const;
  });
  const human = 1 - smooth(-2.4, -1.0, L); // the near ground plane + skyline belong to human scale
  const macro = smooth(-3.6, -4.9, L); // depth of field: the far skyline goes soft in a macro shot
  const horizonY = gy - horizonGap * human;
  const flat = rpx > 3e5;
  const planetOn = smooth(1400, 500, rpx); // the globe takes over once Earth is small
  const limbPx = Math.max(3, 60e3 / S);
  const pxPerMm = 1 / (S * 1000);
  const H = 1e-4 * 2 ** Math.max(0, kf(f, n, 0));
  const colTopY = gy - H / S;
  const world: AscentWorld = { S, x, groundY: gy, cx, cy, rpx, at, colTopY };
  const id = 'aa';

  return (
    <AbsoluteFill>
      <SkyView sky={sky} horizonY={horizonY} toSpace={toSpace} reveal={revealK} />
      {skyline && human > 0.001 && (
        <AbsoluteFill style={{ opacity: human, filter: macro > 0.01 ? `blur(${(macro * 5).toFixed(2)}px)` : undefined }}>
          <Horizon variant={skyline} horizonY={horizonY} sky={sky} />
        </AbsoluteFill>
      )}
      <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141217" />
            <stop offset="1" stopColor={GROUND.land} />
          </linearGradient>
          {!flat && (
            <radialGradient id={`${id}l`} cx={cx} cy={cy} r={rpx + limbPx} gradientUnits="userSpaceOnUse">
              <stop offset={`${(rpx / (rpx + limbPx)) * 100 - 0.01}%`} stopColor="#9cc7ff" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#9cc7ff" stopOpacity={0} />
            </radialGradient>
          )}
        </defs>
        {flat ? (
          <rect x={0} y={horizonY} width={CANVAS.W} height={CANVAS.H - horizonY} fill={`url(#${id}g)`} />
        ) : (
          <>
            <circle cx={cx} cy={cy} r={rpx + limbPx} fill={`url(#${id}l)`} opacity={toSpace * (1 - planetOn * 0.7)} />
            <circle cx={cx} cy={cy} r={rpx} fill={GROUND.land} opacity={1 - planetOn} />
          </>
        )}
      </svg>
      {!flat && planetOn > 0.001 && (
        <AbsoluteFill style={{ opacity: planetOn }}>
          <Planet x={cx} y={cy} r={rpx} kind="earth" light={200} phase={0.62} lon0={lon0} warm />
        </AbsoluteFill>
      )}
      {tower && (
        <GenericTower x={at(tower.xM, 0)[0]} baseY={at(tower.xM, 0)[1]} heightPx={tower.heightM / S} opacity={tower.opacity} />
      )}
      {observer && (() => {
        const h = (observer.hM ?? 1.7) / S;
        if (h < 1.5 || h > 6000) return null;
        const [ox, oy] = at(observer.xM, 0);
        return (
          <div style={{ position: 'absolute', inset: 0, opacity: kf(f, observer.opacity, 1) * smooth(1.5, 6, h) }}>
            <Observer x={ox} y={oy + 1} h={h} pose={observer.pose ?? 'standing'} facing={observer.facing ?? 'left'} />
          </div>
        );
      })()}
      {station && (() => {
        const [sx, sy] = at(station.xM, station.altM);
        const ro = (R + station.altM) / S;
        const op = kf(f, station.opacity, 1);
        return (
          <>
            {station.orbit !== false && ro < 2e5 && (
              <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: op * 0.35 }}>
                <circle cx={cx} cy={cy} r={ro} fill="none" stroke={PALETTE.ivory} strokeWidth={1.5} />
              </svg>
            )}
            <SpaceStation x={sx} y={sy} size={station.size ?? 46} opacity={op} />
          </>
        );
      })()}
      {moon && (() => {
        const a = ((moon.angleDeg ?? 0) * Math.PI) / 180;
        const mx = cx + (moon.distM * Math.sin(a)) / S;
        const my = cy - (moon.distM * Math.cos(a)) / S;
        const mr = (RADIUS_KM.moon * 1000) / S;
        if (mr > 5000 || my < -mr - 50) return null;
        return (
          <div style={{ position: 'absolute', inset: 0, opacity: kf(f, moon.opacity, 1) }}>
            <Planet x={mx} y={my} r={Math.max(4, mr)} kind="moon" light={200} phase={0.92} warm />
          </div>
        );
      })()}
      <PaperFoldStack x={x} baseY={gy} n={n} pxPerMm={pxPerMm} {...stack} />
      {children?.(world)}
    </AbsoluteFill>
  );
};
