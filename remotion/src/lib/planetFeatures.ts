// Signature surface features for the Planet component (brand/brand.md §5: simple, stylized,
// code-drawn, never photographic). Everything is computed ONCE per body/view as static SVG paths
// in a local space of radius 100 centered on (0,0); the Planet scales it to its size.
// Positions are real (lat/lon) and projected orthographically, so features foreshorten at the limb.
// RULE: no strokes on surface features. Every feature is a FILL, most with soft edges (`soft`),
// and low enough in contrast that the terminator stays the strongest read on the sphere.
import { PlanetKind } from '../brand';
import { WORLD } from './geo/world';
import { makeView, orthoRingPath } from './orbit';
import { mulberry32 } from './sky';

export type Feature = {
  d: string;
  fill: string;
  opacity: number;
  level: 1 | 2; // 1 = shown from mid size up, 2 = only at hero size
  soft?: number; // edge softness: blur radius in feature units (sphere radius = 100). Omitted = crisp
};

// blur radii are quantized so features share a few filters instead of one each
const q = (v: number) => Math.max(0.5, Math.round(v * 2) / 2);

const R = 100;
const VIEW = makeView(0, 0, R);
const D2R = Math.PI / 180;

// A blob on the sphere: points at angular radius `rad` (deg) around (lat, lon), optionally
// stretched east-west (`stretch`) and wobbled so it isn't a perfect circle.
const capRing = (lat: number, lon: number, rad: number, seed = 1, wobble = 0.18, stretch = 1): [number, number][] => {
  const rnd = mulberry32(seed);
  const p1 = rnd() * 6.28;
  const p2 = rnd() * 6.28;
  const out: [number, number][] = [];
  if (Math.abs(lat) > 89) {
    // polar cap: a wobbly ring of constant latitude (bearings are undefined at the pole itself)
    for (let i = 0; i <= 36; i++) {
      const th = (i / 36) * Math.PI * 2;
      const k = 1 + wobble * (0.6 * Math.sin(3 * th + p1) + 0.4 * Math.sin(5 * th + p2));
      out.push([(th / D2R) - 180, Math.sign(lat) * (90 - rad * k)]);
    }
    return out;
  }
  const f1 = lat * D2R;
  for (let i = 0; i <= 36; i++) {
    const th = (i / 36) * Math.PI * 2;
    const k = 1 + wobble * (0.6 * Math.sin(3 * th + p1) + 0.4 * Math.sin(5 * th + p2));
    // ellipse in the local tangent frame: semi-axis `rad` north-south, `rad·stretch` east-west
    const be = th; // bearing from north
    const dd = (rad * k * D2R) / Math.hypot(Math.cos(th), Math.sin(th) / stretch);
    const f2 = Math.asin(Math.sin(f1) * Math.cos(dd) + Math.cos(f1) * Math.sin(dd) * Math.cos(be));
    const l2 = lon * D2R + Math.atan2(Math.sin(be) * Math.sin(dd) * Math.cos(f1), Math.cos(dd) - Math.sin(f1) * Math.sin(f2));
    out.push([l2 / D2R, f2 / D2R]);
  }
  return out;
};

const cap = (lat: number, lon: number, rad: number, lon0: number, lat0: number, seed?: number, wobble?: number, stretch?: number) =>
  orthoRingPath(capRing(lat, lon, rad, seed, wobble, stretch), VIEW, lon0, lat0);

// A latitude band seen with the pole straight up (lat0 = 0): flat in projection, y = -R·sin(lat).
// `wave` adds a gentle scalloped edge (Jupiter's crisp belt edges).
const band = (latN: number, latS: number, wave = 0, seed = 1) => {
  const rnd = mulberry32(seed);
  const ph = rnd() * 6.28;
  const yN = -R * Math.sin(latN * D2R);
  const yS = -R * Math.sin(latS * D2R);
  const edge = (y0: number, dir: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = -R + (i / 24) * 2 * R;
      pts.push(`${x.toFixed(1)} ${(y0 + dir * wave * Math.sin(x / 9 + ph)).toFixed(1)}`);
    }
    return pts;
  };
  const top = edge(yN, 1);
  const bot = edge(yS, -1).reverse();
  return `M${top.join('L')}L${bot.join('L')}Z`;
};

// Craters as soft SHADING, never outlines: a faint lit rim (a lighter soft blob nudged away from
// the upper-left light, so it peeks out on the lower-right wall), then the darker floor nudged
// toward the light on top of it. Both blurred; nothing is stroked.
const craterSet = (n: number, seed: number, lon0: number, lat0: number, minR: number, maxR: number, dark: string, rim: string, darkOp: number): Feature[] => {
  const rnd = mulberry32(seed);
  const out: Feature[] = [];
  for (let i = 0; i < n; i++) {
    const lat = Math.asin(rnd() * 2 - 1) / D2R;
    const lon = lon0 + (rnd() * 2 - 1) * 85;
    const r = minR + Math.pow(rnd(), 2.2) * (maxR - minR);
    const level = r > (minR + maxR) / 2 ? 1 : 2;
    const sd = seed * 31 + i;
    const lit = cap(lat - r * 0.16, lon + r * 0.16, r * 0.95, lon0, lat0, sd, 0.08);
    const floor = cap(lat + r * 0.06, lon - r * 0.06, r * 0.86, lon0, lat0, sd, 0.08);
    if (lit) out.push({ d: lit, fill: rim, opacity: 0.22, level, soft: q(r * 0.22) });
    if (floor) out.push({ d: floor, fill: dark, opacity: darkOp, level, soft: q(r * 0.28) });
  }
  return out;
};

export type FeatureView = { lon0: number; lat0: number };

// Default face shown for each body (lon0 = central meridian, lat0 = tilt toward viewer).
export const DEFAULT_VIEW: Record<PlanetKind, FeatureView> = {
  mercury: { lon0: 0, lat0: 10 },
  venus: { lon0: 0, lat0: 0 },
  earth: { lon0: 12, lat0: 18 },
  moon: { lon0: 0, lat0: 0 },
  mars: { lon0: 80, lat0: 20 },
  jupiter: { lon0: 0, lat0: 0 },
  saturn: { lon0: 0, lat0: 0 },
  uranus: { lon0: 0, lat0: 0 },
  neptune: { lon0: 0, lat0: 0 },
};

// --- per-body features ---------------------------------------------------------------------------
const MOON_MARIA: [number, number, number, number?][] = [
  // lat, lon, angular radius, east-west stretch — the near side's "face"
  [33, -16, 15], [28, 17, 9], [8, 31, 11, 1.2], [17, 59, 7], [-7, 51, 7], [-15, 34, 5],
  [18, -55, 18, 0.7], [-3, -35, 12], [-21, -17, 9], [-24, -39, 5], [56, 2, 6, 3.2], [-37, 25, 4],
];

const earth = (v: FeatureView): Feature[] => {
  const land: Feature[] = WORLD.map((c) => {
    const d = c.rings.map((r) => orthoRingPath(r, VIEW, v.lon0, v.lat0)).filter(Boolean).join(' ');
    return d ? { d, fill: c.cont === 'Antarctica' ? '#e9edf0' : '#8a9466', opacity: c.cont === 'Antarctica' ? 0.85 : 1, level: 1 as const } : null;
  }).filter(Boolean) as Feature[];
  const clouds: Feature[] = [
    [52, -30, 9, 3], [-48, 60, 10, 3.5], [8, 110, 6, 2.5], [38, 150, 7, 3], [-12, -20, 5, 2.4], [62, 70, 8, 3], [-58, -100, 9, 3.5], [20, -70, 5, 2.2],
  ].map(([lat, lon, r, s], i) => ({ d: cap(lat, lon, r, v.lon0, v.lat0, 50 + i, 0.3, s), fill: '#f4f6f8', opacity: 0.2, level: 2 as const }))
    .filter((f) => f.d);
  return [...land, ...clouds];
};

const moon = (v: FeatureView): Feature[] => [
  ...MOON_MARIA.map(([lat, lon, r, s], i) => ({ d: cap(lat, lon, r, v.lon0, v.lat0, 10 + i, 0.22, s ?? 1), fill: '#625f59', opacity: 0.4, level: 1 as const, soft: q(r * 0.22) })).filter((f) => f.d),
  // Tycho and Copernicus: the two bright young craters you can spot with the naked eye
  ...[[-43, -11, 2.6], [10, -20, 2.4]].map(([lat, lon, r], i) => ({ d: cap(lat, lon, r, v.lon0, v.lat0, 70 + i, 0.05), fill: '#efece4', opacity: 0.45, level: 1 as const, soft: 1 })).filter((f) => f.d),
  ...craterSet(14, 7, v.lon0, v.lat0, 1.2, 4, '#5d5a54', '#e6e2d8', 0.3),
];

const mercury = (v: FeatureView): Feature[] => craterSet(46, 3, v.lon0, v.lat0, 1.2, 7, '#4b4540', '#d8cdbd', 0.4);

const mars = (v: FeatureView): Feature[] => [
  // darker albedo regions (Syrtis Major, Acidalium, Erythraeum, Meridiani, Tyrrhenum, Cimmerium)
  ...[[10, 70, 9, 0.8], [46, -30, 10, 1.5], [-25, -40, 11, 1.8], [-4, 2, 6, 1.6], [-15, 100, 9, 1.6], [-22, 140, 9, 2]]
    .map(([lat, lon, r, s], i) => ({ d: cap(lat, lon, r, v.lon0, v.lat0, 20 + i, 0.3, s), fill: '#6d2f1a', opacity: 0.45, level: 1 as const, soft: q(r * 0.25) })).filter((f) => f.d),
  { d: cap(90, 0, 11, v.lon0, v.lat0, 30, 0.15), fill: '#f6f1ea', opacity: 0.9, level: 1 as const, soft: 1.5 },
  { d: cap(-90, 0, 7, v.lon0, v.lat0, 31, 0.15), fill: '#f6f1ea', opacity: 0.82, level: 1 as const, soft: 1.5 },
].filter((f) => f.d);

const jupiter = (v: FeatureView): Feature[] => [
  // belts (dark) and zones (light), real-ish latitudes; scalloped edges for crispness
  { d: band(90, 46), fill: '#8a6448', opacity: 0.45, level: 1 },
  { d: band(-46, -90), fill: '#8a6448', opacity: 0.45, level: 1 },
  { d: band(31, 24, 0.8, 1), fill: '#9c6d4b', opacity: 0.55, level: 1 },
  { d: band(18, 7, 1.2, 2), fill: '#a0663f', opacity: 0.75, level: 1 },
  { d: band(5, -5), fill: '#f6e7cf', opacity: 0.35, level: 1 },
  { d: band(-7, -19, 1.2, 3), fill: '#a0663f', opacity: 0.7, level: 1 },
  { d: band(-26, -32, 0.8, 4), fill: '#9c6d4b', opacity: 0.5, level: 1 },
  { d: band(40, 36), fill: '#9c6d4b', opacity: 0.3, level: 2 },
  { d: band(-37, -41), fill: '#9c6d4b', opacity: 0.3, level: 2 },
  // the Great Red Spot, sitting in the south equatorial belt's southern edge
  // one filled, soft reddish oval blended into its band: no ring, no outline
  { d: cap(-22, v.lon0 + 18, 6.5, v.lon0, v.lat0, 40, 0.04, 1.7), fill: '#e09670', opacity: 0.55, level: 1, soft: 1.5 },
  { d: cap(-22, v.lon0 + 18, 4.8, v.lon0, v.lat0, 40, 0.04, 1.7), fill: '#cc6644', opacity: 0.75, level: 1, soft: 1 },
];

const saturn = (): Feature[] => [
  { d: band(90, 55), fill: '#8f7a55', opacity: 0.28, level: 1 },
  { d: band(-55, -90), fill: '#8f7a55', opacity: 0.28, level: 1 },
  { d: band(30, 18, 0.4, 1), fill: '#a68b5c', opacity: 0.25, level: 1 },
  { d: band(8, -8), fill: '#fbf0d6', opacity: 0.25, level: 1 },
  { d: band(-18, -30, 0.4, 2), fill: '#a68b5c', opacity: 0.25, level: 1 },
  { d: band(45, 38), fill: '#a68b5c', opacity: 0.18, level: 2 },
  { d: band(-38, -45), fill: '#a68b5c', opacity: 0.18, level: 2 },
];

// Venus: only the cloud deck — soft sideways "Y" swirls, very low contrast.
const venus = (): Feature[] => {
  // a filled ribbon `w` thick along a gentle curve (fills only: no strokes on surface features)
  const sw = (y: number, bend: number, w: number, c: string, op: number, level: 1 | 2): Feature => {
    const h = w / 2;
    return {
      d: `M-110 ${y - h} Q 10 ${y + bend - h} 110 ${y + bend * 0.2 - h} L110 ${y + bend * 0.2 + h} Q 10 ${y + bend + h} -110 ${y + h}Z`,
      fill: c, opacity: op, level, soft: q(w * 0.3),
    };
  };
  return [
    sw(-55, 30, 16, '#fff6dd', 0.16, 1), sw(-20, 24, 12, '#b89660', 0.12, 1), sw(15, -24, 14, '#fff6dd', 0.14, 1),
    sw(50, -30, 12, '#b89660', 0.12, 1), sw(-80, 18, 8, '#b89660', 0.1, 2), sw(78, -18, 8, '#fff6dd', 0.12, 2), sw(0, 4, 6, '#b89660', 0.1, 2),
  ];
};

const neptune = (v: FeatureView): Feature[] => [
  { d: band(-48, -62), fill: '#1c2f86', opacity: 0.35, level: 1 },
  { d: band(15, -10), fill: '#5b7fe6', opacity: 0.15, level: 1 },
  { d: band(70, 52), fill: '#1c2f86', opacity: 0.25, level: 2 },
  // thin bright methane-ice cloud streaks
  ...[[26, 15, 7, 6], [-32, -30, 6, 7], [-40, 25, 3, 5], [30, -35, 3, 6]].map(([lat, lon, r, s], i) => ({
    d: cap(lat, v.lon0 + lon, r * 0.35, v.lon0, v.lat0, 60 + i, 0.25, s), fill: '#f2f6ff', opacity: 0.7, level: (i < 2 ? 1 : 2) as 1 | 2,
  })).filter((f) => f.d),
];

export const featuresFor = (kind: PlanetKind, v: FeatureView): Feature[] => {
  switch (kind) {
    case 'earth': return earth(v);
    case 'moon': return moon(v);
    case 'mercury': return mercury(v);
    case 'mars': return mars(v);
    case 'jupiter': return jupiter(v);
    case 'saturn': return saturn();
    case 'venus': return venus();
    case 'neptune': return neptune(v);
    case 'uranus': return []; // nearly featureless — that's accurate
  }
};
