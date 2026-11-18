// Ground-view geometry (brand §11): one field of view drives everything, so the Sun, the Moon, the
// horizon silhouettes and the stars all share the same honest scale.
//   - fov   = degrees across the frame WIDTH (60 = wide landscape, 1–3 = telephoto)
//   - tilt  = camera pitch above the horizon, degrees (0 = looking level; the camera never rolls)
//   - horizonY = screen y of the true horizon when tilt = 0 (a prop: 16:9-ready, never a literal)
// Small-angle (linear) projection: fine for this stylized look, exact enough for discs and ridges.
import { APPARENT_DEG, CANVAS, SKY, SkyPreset } from '../brand';
import { mix } from '../components/color';

export type SkyFrame = { fov: number; tilt?: number; horizonY: number; W?: number };

export const pxPerDeg = (fov: number, W: number = CANVAS.W) => W / fov;

// az: degrees right of the frame center; el: degrees above the horizon
export const skyToScreen = (az: number, el: number, v: SkyFrame): [number, number] => {
  const W = v.W ?? CANVAS.W;
  const k = pxPerDeg(v.fov, W);
  return [W / 2 + az * k, v.horizonY - (el - (v.tilt ?? 0)) * k];
};
// screen y of the horizon line for this view (moves down as the camera tilts up)
export const horizonScreenY = (v: SkyFrame) => v.horizonY + (v.tilt ?? 0) * pxPerDeg(v.fov, v.W);
// elevation (deg) seen at screen y
export const elevationAt = (y: number, v: SkyFrame) => (v.tilt ?? 0) + (v.horizonY - y) / pxPerDeg(v.fov, v.W);

// apparent radius in px of a disc `deg` across (the Sun 0.533°, the Moon 0.518°)
export const discRadiusPx = (deg: number, fov: number, W: number = CANVAS.W) => (deg / 2) * pxPerDeg(fov, W);
export const sunRadiusPx = (fov: number, W?: number) => discRadiusPx(APPARENT_DEG.sun, fov, W);
export const moonRadiusPx = (fov: number, W?: number) => discRadiusPx(APPARENT_DEG.moon, fov, W);

// angular height (deg) of something h metres tall seen from d metres away
export const angularDeg = (h: number, d: number) => (Math.atan2(h, d) * 180) / Math.PI;

// Sky color at an elevation, for a preset. Stops at 0° (horizon), ~20° (mid) and ≥ 70° (zenith),
// eased so the horizon band is narrow and the dome deepens quickly, as a real sky does.
export const skyColorAt = (p: SkyPreset, el: number) => {
  const s = SKY[p];
  const e = Math.max(0, el);
  // C1-continuous: both segments have zero slope at the mid stop (no visible edge at 20°, which a
  // telephoto view would magnify), finite slope everywhere else
  if (e <= 20) {
    const t = e / 20;
    return mix(s.horizon, s.mid, 1 - (1 - t) * (1 - t));
  }
  const t = Math.min(1, (e - 20) / 45);
  return mix(s.mid, s.zenith, t * t * (3 - 2 * t));
};

// A sky blended between two presets (t 0..1), then toward plain space (toSpace 0..1: the tilt-up
// and pull-back hand-offs into space view).
export const blendedSkyAt = (a: SkyPreset, b: SkyPreset, t: number, toSpace: number, el: number, space: string) =>
  mix(mix(skyColorAt(a, el), skyColorAt(b, el), t), space, toSpace);

export const starsFor = (a: SkyPreset, b: SkyPreset, t: number) => SKY[a].stars + (SKY[b].stars - SKY[a].stars) * t;

// ---- eclipse geometry ------------------------------------------------------------------------
// sep = Moon center offset from the Sun center, in Sun radii; moonScale = Moon radius / Sun radius
// (≈ 1.03 for a total eclipse, ≈ 0.94 for an annular one).
const circleOverlap = (r1: number, r2: number, d: number) => {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const c = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  return a + b - c;
};
export const eclipseState = (sep: number, moonScale: number) => {
  const d = Math.abs(sep);
  const coverage = circleOverlap(1, moonScale, d) / Math.PI; // fraction of the Sun's disc covered
  // gap between the Moon's trailing limb and the Sun's limb (Sun radii): > 0 = sunlight still shows
  const gap = d - (moonScale - 1);
  const total = moonScale >= 1 && gap <= 0;
  // Daylight barely changes until ~90 % coverage (the eye adapts), then drops steeply.
  const sun = 1 - coverage; // uncovered fraction
  // (annular max ~88 % → ~0.11: "slightly dimmed daylight"; 99 % → ~0.88; totality → 1)
  const dark = total ? 1 : Math.min(0.92, Math.pow(Math.max(0, coverage - 0.8) / 0.2, 2.5));
  return { coverage, gap, total, sun, darkness: dark };
};
