import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ANNOTATION, CANVAS, MOTION, PALETTE, TYPE } from '../brand';
import { clamp01 } from './color';
import { ramp, startOf } from './anim';

// ORBIT OVERLAY (brand §5 visual variety: show size comparisons) — the planets' orbits at TRUE
// relative scale, drawn as thin annotation lines that can be laid over another object to compare
// sizes ("the whole solar system fits inside this black hole's horizon"). One number sets the
// scale: `pxPerAU` (pixels per astronomical unit), so the orbits are honest against anything
// drawn at the same scale. Real semi-major axes; planets orbit at their real RELATIVE periods
// (Kepler: T ∝ a^1.5), sped up by `speed`.
//
// Orbits draw in from the inside out (one after another), then their labels fade in. An orbit
// smaller than MIN_R px isn't drawn as a line (it would be a blob): it's folded into the Sun's
// dot, and the honest way to say so is a label on the Sun ("inner planets") — never enlarge it.
// Lines in sci blue (they are annotations), planets as tiny ivory dots, labels in sciText.
export type OrbitPlanet = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
export const ORBIT_AU: Record<OrbitPlanet, number> = {
  mercury: 0.387, venus: 0.723, earth: 1.0, mars: 1.524, jupiter: 5.203, saturn: 9.537, uranus: 19.19, neptune: 30.07,
};
const NAMES: Record<OrbitPlanet, string> = {
  mercury: 'MERCURY', venus: 'VENUS', earth: 'EARTH', mars: 'MARS', jupiter: 'JUPITER', saturn: 'SATURN', uranus: 'URANUS', neptune: 'NEPTUNE',
};

export type OrbitOverlayProps = {
  x: number; // the Sun's position (the overlay's center)
  y: number;
  pxPerAU: number; // the scale: px per astronomical unit (match whatever it is laid over)
  planets?: OrbitPlanet[]; // default all eight
  labels?: OrbitPlanet[]; // which orbits get a name (default: the outermost drawn; keep to 1–2)
  tilt?: number; // 1 = seen face-on (circles), 0.3 = strongly tilted ellipses (default 1)
  speed?: number; // orbit speed: Earth's orbits per second (default 0.25; 0 = still)
  sun?: boolean; // a small gold dot for the Sun (default true)
  opacity?: number;
  at?: number;
  warm?: boolean;
};

const MIN_R = 6; // px: smaller orbits aren't drawn as lines

export const OrbitOverlay: React.FC<OrbitOverlayProps> = ({
  x, y, pxPerAU, planets = Object.keys(ORBIT_AU) as OrbitPlanet[], labels, tilt = 1, speed = 0.25, sun = true, opacity = 1,
  at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const s = startOf(at, warm);
  const drawn = planets.filter((p) => ORBIT_AU[p] * pxPerAU >= MIN_R).sort((a, b) => ORBIT_AU[a] - ORBIT_AU[b]);
  const named = labels ?? drawn.slice(-1);
  const step = Math.max(4, Math.round(MOTION.lineDraw / 2)); // each orbit starts a few frames after the last
  const t = f / CANVAS.FPS;
  const sunIn = ramp(f, s, MOTION.markerIn);

  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }}>
      {drawn.map((p, i) => {
        const r = ORBIT_AU[p] * pxPerAU;
        const ry = r * tilt;
        const d = ramp(f, s + i * step, MOTION.lineDraw);
        if (d <= 0) return null;
        // ellipse circumference (Ramanujan) for the draw-in dash
        const h = ((r - ry) / (r + ry)) ** 2;
        const C = Math.PI * (r + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
        const lb = ramp(f, s + i * step + MOTION.lineDraw - MOTION.overlap, MOTION.labelIn);
        // planet: real relative period, a fixed starting angle per planet (spread out)
        const ang = (i * 2.4 + (speed * 2 * Math.PI * t) / Math.pow(ORBIT_AU[p], 1.5)) % (2 * Math.PI);
        const px = x + r * Math.cos(ang);
        const py = y - ry * Math.sin(ang);
        return (
          <g key={p}>
            <ellipse cx={x} cy={y} rx={r} ry={ry} fill="none" stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke}
              strokeDasharray={`${C * d} ${C}`} />
            <circle cx={px} cy={py} r={Math.max(2.5, Math.min(5, r * 0.04))} fill={PALETTE.ivory} opacity={clamp01((d - 0.9) * 10)} />
            {named.includes(p) && (
              <text x={x} y={y - ry - 14} textAnchor="middle" fill={PALETTE.sciText} opacity={lb}
                style={{ ...TYPE.annotation, fontSize: Math.max(ANNOTATION.minLabelPx, 28) } as React.CSSProperties}>
                {NAMES[p]}
              </text>
            )}
          </g>
        );
      })}
      {sun && <circle cx={x} cy={y} r={4} fill={PALETTE.gold} opacity={sunIn} />}
    </svg>
  );
};
