import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, GLOW_PRESETS, GROUND } from '../brand';
import { eclipseState } from '../lib/groundSky';
import { clamp01 } from './color';
import { hash01, kf, Keys } from './anim';

// ECLIPSE (brand §11) — a solar eclipse driven by ONE dial: `sep`, the Moon's center offset from the
// Sun's center in Sun radii (e.g. [[0, 2.3], [300, 0], [420, -2.3]] plays it through and out again).
//   total (moonScale ≈ 1.03): partial bite → Baily's beads → diamond ring → pearly corona → reverse
//   annular (moonScale ≈ 0.94): the Moon stays ~6 % narrower: a THIN bright ring of honest width
//     (0.06 R☉: 12 px on a 200 px Sun, never thickened), no corona, no beads; the sky stays light.
// The Moon is only seen where it covers the Sun (against a day sky it is invisible, as in reality);
// once the sky is dark it shows as a disc in the space color family with a faint earthshine — never
// #000 (that is reserved for black holes). Beads and the diamond ring are small soft points: no rays,
// no lens flare, no starburst. Drive the sky with eclipseState(sep, moonScale).darkness.
// The size is the caller's: r = sunRadiusPx(fov) keeps it honest in the frame's field of view.
export type EclipseProps = {
  x: number;
  y: number;
  r: number; // Sun radius in px (use sunRadiusPx(fov))
  sep: Keys; // Moon offset, Sun radii (0 = centered)
  angle?: number; // direction of the Moon's offset when sep > 0, degrees (0 = right; default 200)
  moonScale?: number; // Moon / Sun apparent radius (1.03 total, 0.94 annular)
  prominences?: boolean; // tiny pink-red prominences at the limb during totality (default true)
  streamers?: number; // faint coronal streamers (default 6: two broad equatorial + four short)
  glow?: number; // the Sun's soft halo strength (default 1)
};

let uid = 0;

export const Eclipse: React.FC<EclipseProps> = ({ x, y, r, sep, angle = 200, moonScale = 1.03, prominences = true, streamers = 6, glow = 1 }) => {
  const f = useCurrentFrame();
  const id = React.useMemo(() => `ec${uid++}`, []);
  const s = kf(f, sep, 2.5);
  const st = eclipseState(s, moonScale);
  const a = (angle * Math.PI) / 180;
  const mx = x + Math.cos(a) * s * r;
  const my = y + Math.sin(a) * s * r;
  const mr = moonScale * r;
  const total = moonScale >= 1;
  // corona: starts showing during the diamond ring (gap < ~1.2 % R☉), full in totality
  const cor = total ? clamp01(1 - st.gap / 0.012) : 0;
  // Moon disc against the sky: visible once the sky is dark
  // (only from the diamond ring on: at 97 % the Moon off the Sun is still lost in the sky glare)
  const moonVis = cor;
  const sunGlow = Math.sqrt(st.sun) * glow;
  // the side where the last sunlight shines: opposite the Moon's offset
  const lastA = s >= 0 ? a + Math.PI : a;
  // through a (filtered) telephoto the photosphere reads near-white, warming only at the limb
  const disc = ['#fffdf7', '#fff4dc', '#ffe6b4', '#f7c27a'];

  // Baily's beads: sunlight through lunar valleys along the last sliver, each with its own depth
  const beads = total
    ? Array.from({ length: 6 }, (_, i) => {
        const off = (hash01(i + 3) - 0.5) * 0.95; // ±27°
        const thr = -0.003 + hash01(i + 17) * 0.011;
        const on = clamp01((st.gap - thr) / 0.0035) * clamp01((0.022 - st.gap) / 0.008);
        return { ang: lastA + off, on, diamond: i === 0 };
      })
    : [];
  const diamond = total ? clamp01(1 - Math.abs(st.gap - 0.002) / 0.008) : 0;

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}d`} cx="46%" cy="44%" r="56%">
          {disc.map((c, i) => <stop key={i} offset={`${[0, 50, 82, 100][i]}%`} stopColor={c} />)}
        </radialGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="58%" stopColor={GLOW_PRESETS.sun.corona} />
          <stop offset="100%" stopColor={GLOW_PRESETS.sun.corona} stopOpacity={0} />
        </radialGradient>
        {/* pearly corona: bright at the limb, falling off fast to ~2.6 R☉ */}
        <radialGradient id={`${id}c`}>
          <stop offset="36%" stopColor={GROUND.corona} stopOpacity={0.95} />
          <stop offset="44%" stopColor={GROUND.corona} stopOpacity={0.5} />
          <stop offset="62%" stopColor={GROUND.corona} stopOpacity={0.16} />
          <stop offset="100%" stopColor={GROUND.corona} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}s`}>
          <stop offset="0%" stopColor={GROUND.corona} stopOpacity={0.42} />
          <stop offset="55%" stopColor={GROUND.corona} stopOpacity={0.14} />
          <stop offset="100%" stopColor={GROUND.corona} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}m`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GROUND.earthshine} />
          <stop offset="100%" stopColor={GROUND.moonDark} />
        </radialGradient>
        <radialGradient id={`${id}b`}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="30%" stopColor="#fff6ea" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#fff6ea" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}k`}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>

      {/* the Sun's soft halo, fading with the uncovered fraction */}
      <circle cx={x} cy={y} r={r * 1.55} fill={`url(#${id}g)`} opacity={Math.min(1.2, sunGlow)} />

      {/* corona + streamers (totality) */}
      {cor > 0 && (
        <g opacity={cor}>
          <circle cx={x} cy={y} r={r * 2.8} fill={`url(#${id}c)`} />
          {Array.from({ length: streamers }, (_, i) => {
            // two broad equatorial streamers (helmet-like) + shorter, fainter ones: irregular, never a starburst
            const eq = i < 2;
            const th = eq ? 12 + i * 180 + (hash01(i + 40) - 0.5) * 16 : hash01(i + 40) * 360;
            const len = r * (eq ? 1.5 + hash01(i + 60) * 0.7 : 0.6 + hash01(i + 60) * 0.6);
            const wd = r * (eq ? 0.42 + hash01(i + 80) * 0.15 : 0.2 + hash01(i + 80) * 0.12);
            const t = (th * Math.PI) / 180;
            const ccx = x + Math.cos(t) * (r * 0.9 + len * 0.42);
            const ccy = y + Math.sin(t) * (r * 0.9 + len * 0.42);
            return (
              <ellipse key={i} cx={ccx} cy={ccy} rx={len * 0.62} ry={wd} transform={`rotate(${th} ${ccx} ${ccy})`} fill={`url(#${id}s)`} opacity={eq ? 0.5 : 0.3} />
            );
          })}
          {prominences && [0.6, 2.4, 4.3].map((t, i) => (
            <ellipse key={i} cx={x + Math.cos(t) * r * 1.02} cy={y + Math.sin(t) * r * 1.02} rx={r * (0.035 + 0.02 * hash01(i + 90))} ry={r * 0.022}
              transform={`rotate(${(t * 180) / Math.PI} ${x + Math.cos(t) * r * 1.02} ${y + Math.sin(t) * r * 1.02})`} fill={GROUND.prominence} opacity={0.75} />
          ))}
        </g>
      )}

      {/* the photosphere */}
      <circle cx={x} cy={y} r={r} fill={`url(#${id}d)`} />
      {/* the Moon where it covers the Sun (always), and as a disc against the dark sky (totality) */}
      <circle cx={mx} cy={my} r={mr} fill={`url(#${id}m)`} clipPath={`url(#${id}k)`} />
      {moonVis > 0 && <circle cx={mx} cy={my} r={mr} fill={`url(#${id}m)`} opacity={moonVis} />}

      {/* Baily's beads → diamond ring: small, soft, no rays */}
      {beads.map((b, i) => b.on > 0 && (
        <circle key={i} cx={x + Math.cos(b.ang) * r * 0.995} cy={y + Math.sin(b.ang) * r * 0.995} r={Math.max(2.2, r * 0.03) * 3} fill={`url(#${id}b)`} opacity={b.on} />
      ))}
      {diamond > 0 && (
        <circle cx={x + Math.cos(beads[0].ang) * r} cy={y + Math.sin(beads[0].ang) * r} r={r * 0.32} fill={`url(#${id}b)`} opacity={diamond * 0.8} />
      )}
    </svg>
  );
};
