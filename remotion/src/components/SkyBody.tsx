import React from 'react';
import { useCurrentFrame } from 'remotion';
import { APPARENT_DEG, CANVAS, GLOW_PRESETS, MOTION, PALETTE } from '../brand';
import { discRadiusPx, skyToScreen } from '../lib/groundSky';
import { clamp01, mix } from './color';
import { kf, Keys, ramp, startOf } from './anim';
import { Planet } from './Planet';

// SKY BODY (brand §11) — the Sun or the Moon in a ground-view sky at its TRUE APPARENT SIZE for the
// frame's field of view (Sun 0.533°, Moon 0.518°): ~9 px across in a wide 60° landscape, frame-filling
// only through a telephoto fov. The radius is derived, never typed in, so it can't be enlarged.
// Near the horizon both redden and the Sun flattens slightly (refraction), as they really do.
// The Moon reuses Planet (maria, phase); in a day sky it is pale and low-contrast (`daylight`).
export type SkyBodyProps = {
  kind: 'sun' | 'moon';
  az?: Keys; // degrees right of frame center (default 0)
  el: Keys; // degrees above the horizon (keys = rising / setting)
  fov: number;
  tilt?: Keys;
  horizonY: number;
  apparentDeg?: number; // override the true size only for a REAL variation (perigee/apogee Moon)
  phase?: number; // Moon: 0..1 lit (default 1 = full)
  light?: number; // Moon: direction the light comes from (default 225)
  daylight?: Keys; // Moon: 0..1, washes the disc toward the sky color (pale day Moon)
  skyColor?: string; // the sky behind it (for the day wash), default a day blue
  glow?: number; // Sun: corona strength (default 1)
  at?: number;
  warm?: boolean;
};

let uid = 0;

export const SkyBody: React.FC<SkyBodyProps> = ({
  kind, az = 0, el, fov, tilt = 0, horizonY, apparentDeg, phase = 1, light = 225, daylight = 0, skyColor = '#7fa7d4', glow = 1, at = 0, warm = true,
}) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `sb${uid++}`, []);
  const e = kf(f, el, 10);
  const [x, y] = skyToScreen(kf(f, az, 0), e, { fov, tilt: kf(f, tilt, 0), horizonY });
  const deg = apparentDeg ?? (kind === 'sun' ? APPARENT_DEG.sun : APPARENT_DEG.moon);
  const r = discRadiusPx(deg, fov);
  const low = clamp01(1 - e / 8); // 0 high in the sky → 1 at the horizon
  const flat = 1 - 0.16 * clamp01(1 - e / 1.2); // refraction squash, only within ~1° of the horizon
  const appear = ramp(f, startOf(at, warm), MOTION.discIn);

  if (kind === 'moon') {
    const dl = kf(f, daylight, 0);
    return (
      <div style={{ position: 'absolute', inset: 0, opacity: appear }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(1, ${flat}) translate(${-x}px, ${-y}px)` }}>
          <Planet x={x} y={y} r={r} kind="moon" phase={phase} light={light} warm />
          <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0 }}>
            {/* low Moon: warmer (atmospheric reddening) · day Moon: washed by the sky in front of it */}
            <circle cx={x} cy={y} r={r * 1.01} fill="#d9894a" opacity={low * 0.42} style={{ mixBlendMode: 'multiply' }} />
            <circle cx={x} cy={y} r={r * 1.01} fill={skyColor} opacity={dl * 0.5} />
          </svg>
        </div>
      </div>
    );
  }

  // Sun: limb-darkened disc + soft corona (brand §5), reddened and dimmer near the horizon
  const base = GLOW_PRESETS.sun;
  const red = GLOW_PRESETS.red;
  const disc = base.disc.map((c, i) => mix(c, red.disc[i], low * 0.85));
  const corona = low > 0.5 ? red.corona : base.corona;
  const br = 1 + MOTION.breathe * Math.sin((f / 150) * Math.PI * 2);
  const cr = Math.max(r * 1.5, r + 6);
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: appear }}>
      <defs>
        <radialGradient id={`${id}d`} cx="46%" cy="44%" r="56%">
          {disc.map((c, i) => <stop key={i} offset={`${[0, 50, 82, 100][i]}%`} stopColor={c} />)}
        </radialGradient>
        <radialGradient id={`${id}c`}>
          <stop offset={`${Math.round((r / cr) * 87)}%`} stopColor={corona} />
          <stop offset="100%" stopColor={corona} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}w`}>
          <stop offset="0%" stopColor={PALETTE.spaceWarm} />
          <stop offset="100%" stopColor={PALETTE.spaceWarm} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={Math.max(r * 3.4, 40)} ry={Math.max(r * 3, 36) * flat} fill={`url(#${id}w)`} />
      <ellipse cx={x} cy={y} rx={cr * br} ry={cr * br * flat} fill={`url(#${id}c)`} opacity={Math.min(1.5, glow) * (1 - low * 0.35)} />
      <ellipse cx={x} cy={y} rx={r} ry={r * flat} fill={`url(#${id}d)`} />
    </svg>
  );
};

export const skyBodyRadius = (kind: 'sun' | 'moon', fov: number) => discRadiusPx(kind === 'sun' ? APPARENT_DEG.sun : APPARENT_DEG.moon, fov);
