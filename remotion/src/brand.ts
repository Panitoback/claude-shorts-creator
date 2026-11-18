// Brand tokens — the code side of /brand/brand.md. Change a value here and every shot follows.
// Section numbers (§) point at brand/brand.md.
import { Easing } from 'remotion';
import { FONT_BODY, FONT_NUMBER, FONT_NUMBER_ITALIC } from './fonts';

// =============================================================================
// §2 PALETTE
// =============================================================================
export const PALETTE = {
  // surfaces
  space: '#05060a', // the background. Near-black, faintly warm — never pure #000 (except `hole`)
  // THE single pure-black exception (brand §2): ONLY a black hole's shadow. It must read darker
  // than space, and sits beside the channel's brightest white (a quasar disk) for contrast.
  hole: '#000000',
  spaceWarm: 'rgba(255,170,90,0.08)', // the one soft warm wash behind the hero object
  // text
  ivory: '#f4f1ea', // all primary text: numbers, captions, titles
  ivoryFaint: 'rgba(244,241,234,0.30)', // caption words not yet spoken
  // accent — warm gold: keywords, the hero number's unit, glowing objects
  gold: '#ffd58a',
  goldDeep: '#ffb35c', // glow edges, warm secondary
  // science — cool blue, ONLY for annotations (leader lines, scale bars, their values)
  sci: '#9cc7ff',
  sciLine: 'rgba(156,199,255,0.70)',
  sciText: '#c9d9ee', // annotation label text: light enough to survive phone compression
} as const;

// Stellar body colors (§5). True-color references, not accents.
export const BODY = {
  sun: ['#fff5df', '#ffd08a', '#ff9a3d', '#d9561a'], // core → limb (limb-darkened)
  corona: 'rgba(255,176,88,0.26)',
  earth: '#9cc7ff',
} as const;

// Real star colors by temperature (cool → hot). Pick by a 0..1 temperature.
export const STAR_TINTS = ['#ffb38a', '#ffd9a8', '#fff6ea', '#e6eeff', '#b9d0ff'] as const;

// Glowing bodies by temperature (§5): disc core → limb, plus corona color. True-color depictions.
export type GlowKind = 'sun' | 'red' | 'white' | 'blue';
export const GLOW_PRESETS: Record<GlowKind, { disc: readonly string[]; corona: string }> = {
  sun: { disc: BODY.sun, corona: BODY.corona },
  red: { disc: ['#ffe2cc', '#ffa477', '#e8653a', '#a8341c'], corona: 'rgba(255,122,80,0.24)' },
  white: { disc: ['#ffffff', '#f3f1ff', '#d9dcff', '#a8b2f0'], corona: 'rgba(205,212,255,0.22)' },
  blue: { disc: ['#f4f8ff', '#cfe0ff', '#93b8ff', '#4f78e0'], corona: 'rgba(140,180,255,0.26)' },
};

// Planets and moons (§5): lit color, base color, night-side color. Muted true colors.
export type PlanetKind = 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
export const PLANET_PRESETS: Record<PlanetKind, { lit: string; base: string; dark: string; bands?: boolean; ring?: boolean; atmosphere?: string }> = {
  mercury: { lit: '#c9bba8', base: '#857a6c', dark: '#2a2520' }, // warmer, darker than the Moon
  venus: { lit: '#f4e2bd', base: '#d9bb83', dark: '#5a4526' },
  earth: { lit: '#a9cdf5', base: '#4a7fc1', dark: '#14284a', atmosphere: '#9cc7ff' },
  moon: { lit: '#dcd8ce', base: '#9a978f', dark: '#2e2c29' },
  mars: { lit: '#eaa47e', base: '#c1643a', dark: '#4a1d10' },
  jupiter: { lit: '#f0dcc2', base: '#c9a27c', dark: '#4e3a27', bands: true },
  saturn: { lit: '#f3e5c4', base: '#d6bd8c', dark: '#5a4b31', bands: true, ring: true },
  uranus: { lit: '#dff6f6', base: '#a3dade', dark: '#2a5257' }, // pale cyan, nearly featureless
  neptune: { lit: '#8aa8f2', base: '#3558cc', dark: '#0e1a4e' }, // deeper blue than Uranus
};

// Quasar / black hole (§5, docs/design-notes/quasar-components.md §0). Luminosity is shown by
// CONTRAST: a clipped near-white inner disk beside the pure-black shadow. No flares, rays or haze.
export const QUASAR = {
  disk: ['#fffaf0', '#ffe9b8', '#ffd58a', '#ff9a3d', '#d9561a', '#7a2a10'], // inner (hottest) → outer
  photonRing: '#fff1d6',
  corona: ['#fffaf0', '#ffd58a'], // core → falloff
  coronaMax: 3, // corona radius at full luminosity, × the disk's outer radius (a star's is 1.5)
  jet: '#e6eeff', // cool blue-white, never neon
  galaxy: '#f1e6d2', // warm ivory haze
} as const;

// True mean radii in km (for honest scale, §5).
export const RADIUS_KM = {
  sun: 696340, mercury: 2440, venus: 6052, earth: 6371, moon: 1737, mars: 3390,
  jupiter: 69911, saturn: 58232, uranus: 25362, neptune: 24622,
} as const;

// =============================================================================
// §11 GROUND VIEW (brand v2.5) — the sky as seen from Earth. Muted true-to-life sky colors are
// DEPICTIONS (like a true-color planet), never accents. Stops: zenith, mid (~20° elevation), horizon.
// =============================================================================
export type SkyPreset = 'night' | 'twilight' | 'dusk' | 'dayMuted' | 'day' | 'eclipse';
export const SKY: Record<SkyPreset, { zenith: string; mid: string; horizon: string; stars: number }> = {
  // stars = how much of the starfield shows (0 none … 1 all), brightest first
  night: { zenith: '#05060a', mid: '#080b14', horizon: '#121a2b', stars: 1 },
  twilight: { zenith: '#0b1226', mid: '#1a2846', horizon: '#33445f', stars: 0.12 },
  dusk: { zenith: '#1a2140', mid: '#4a4560', horizon: '#b8764a', stars: 0.02 },
  dayMuted: { zenith: '#2c4466', mid: '#46607f', horizon: '#6f879e', stars: 0 },
  // bright day (v2.5): pale blue, lighter toward the horizon. Ivory text reads by PLACEMENT (upper
  // sky: ≥ 3:1 above ~50° elevation, measured 3.7:1 behind a title) or with SKY_TEXT_SHADOW (6.4:1), never by darkening the sky.
  day: { zenith: '#4176b6', mid: '#7fa7d4', horizon: '#bcd2e4', stars: 0 },
  // totality: a dark blue-grey dome with a 360° sunset ring on the horizon
  eclipse: { zenith: '#0c1222', mid: '#1b2234', horizon: '#8a6a4a', stars: 0.1 },
};
// soft dark halo for ivory text over a bright sky (6.4:1 measured around caption glyphs on the day sky, brand §11)
export const SKY_TEXT_SHADOW = '0 0 22px rgba(5,6,10,0.55), 0 0 8px rgba(5,6,10,0.45), 0 2px 3px rgba(5,6,10,0.35)';
export const GROUND = {
  land: '#06070b', // the nearest silhouette: near-black, never #000; farther layers take sky color
  aerial: 0.55, // how much sky color the farthest layer takes (aerial perspective)
  wideFov: 60, // degrees across the frame width in a wide landscape
  eyeM: 1.6, // observer eye height, m
  moonDark: '#0b0d14', // the Moon's night side against the Sun: the space family, never #000
  earthshine: '#1a1f2c', // faint lift on that night side
  corona: '#f4f1ea', // pearly ivory-white (NOT gold)
  prominence: '#e88a8a',
} as const;
// true apparent diameters, degrees (honest scale, brand §11)
export const APPARENT_DEG = { sun: 0.533, moon: 0.518, moonPerigee: 0.558, moonApogee: 0.491 } as const;

// =============================================================================
// §3 TYPOGRAPHY — roles, not fonts. Sizes are px on the 1080×1920 canvas.
// =============================================================================
export const TYPE = {
  number: { fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: 210, letterSpacing: -5, lineHeight: 1 },
  numberUnit: { fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 600, fontSize: 125, letterSpacing: -3 },
  subject: { fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 500, fontSize: 80 },
  title: { fontFamily: FONT_NUMBER, fontWeight: 600, fontSize: 110, letterSpacing: -2, lineHeight: 1.05 },
  caption: { fontFamily: FONT_BODY, fontWeight: 600, fontSize: 64, letterSpacing: -0.5 },
  keyword: { fontFamily: FONT_NUMBER_ITALIC, fontStyle: 'italic', fontWeight: 600, fontSize: 80 },
  label: { fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, letterSpacing: 9, textTransform: 'uppercase' },
  annotation: { fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, letterSpacing: 3, textTransform: 'uppercase' },
} as const;

// =============================================================================
// §4 CAPTIONS
// =============================================================================
export const CAPTION = {
  centerY: 1350, // vertical center of the caption block (block must end above y1420)
  maxWidth: 720, // symmetric around x=540 so it never enters the right-side UI rail
  maxWords: 4,
  wordOnFrames: 5, // a word brightens over 5 frames as it is spoken
  keywordPop: 1.06, // keyword scale peak, over ~10 frames
} as const;

// =============================================================================
// §6 ANNOTATIONS
// =============================================================================
export const ANNOTATION = {
  maxPerScene: 2,
  stroke: 2, // px — thin, but never below 2 (it disappears on a phone)
  tick: 12, // scale-bar end tick half-length
  markerRing: 14, // ring radius around a tiny marked object
  minLabelPx: 28,
} as const;

// =============================================================================
// §8 MOTION — measured from the 5-second hybrid test. Frames at 30 fps.
// =============================================================================
export const EASE = {
  out: Easing.bezier(0.33, 1, 0.68, 1), // the default for everything that arrives
  inOut: Easing.bezier(0.37, 0, 0.63, 1), // camera moves, morphs
  in: Easing.bezier(0.32, 0, 0.67, 0), // exits only
  // brand v2.0 energy curve: hook and peak camera moves. Most of the move in the first third,
  // then a long soft landing. Fast, never jerky (no overshoot: it is not elastic).
  punch: Easing.bezier(0.16, 1, 0.3, 1),
} as const;

// §8 DYNAMISM (brand v2.3): the living camera, punch-in (1 → 1.03, 6 + 36 frames), shape match cuts,
// fly-throughs, beat grid and motion-blur windows live in components/Camera.tsx, ShapeMatch.tsx,
// FlyThrough.tsx and beat.ts (their constants are the code twin of brand.md §8 "Dynamism").
// §5/§8 FILL THE FRAME (brand v2.4): hero ≥ ~50–60 % of the safe width, motion that registers in sparse
// scenes (components/TimeStream.tsx, per-scene push-ins), ≤ 1 s of near-black, the sky going out star by
// star (Starfield offAll). Audio delivery: −14 LUFS, true peak ≤ −2.0 dBTP on the encoded file (tools/finalize_audio.py).
// §8 ENERGY CURVE (brand v2.0): high-energy hook, calm body, bursts on the peaks.
// Visual variety (brand §5): a new visual idea at least every ~5–10 s; every number is shown.
export const SCENE = {
  newIdeaEvery: [150, 300], // frames between new visual ideas (a dial change on the same picture doesn't count)
} as const;

export const ENERGY = {
  hookFrames: 90, // the high-energy hook: first ~3 s
  punchMove: [12, 24], // frames for the BULK of a hook/peak move or ignition (EASE.punch)
  punchMaxS: 1.5, // ...including its soft landing, at most this long
  whipMove: [6, 10], // frames for the BULK of a whip transition (swap at peak speed, no bounce)
  changeEvery: [60, 90], // a clear visual change every 2–3 s during the first ~10 s
  changeWindow: 300, // ...for the first ~10 s
  settle: 30, // after a peak burst, back to body pacing within ~1 s
  maxFlickerHz: 3, // nothing strobes faster than this, at any energy
} as const;

export const MOTION = {
  skyFade: 20, // starfield fade-in
  discIn: 30, // a body appears: opacity 0→1, scale 0.96→1
  glowIn: 46, // its glow blooms in, slower than the body
  countUp: 48, // a number counting to its value
  rise: 14, // text arrives: fade + rise
  risePx: 22,
  markerIn: 8, // annotation: marker appears
  lineDraw: 16, // annotation: leader line draws
  labelIn: 12, // annotation: label fades in
  scaleBarDraw: 24, // scale bar draws from its center outward
  overlap: 8, // consecutive elements overlap their entrances by ~8 frames
  breathe: 0.015, // glow scale oscillation, ±1.5% over ~5 s
  twinkle: 0.2, // star opacity oscillation, ±20%, slow and desynchronized
} as const;

// =============================================================================
// §9 SAFE ZONES — conservative union of YouTube Shorts, TikTok and Instagram Reels UI.
// Nothing important (text, key objects) inside these margins.
// =============================================================================
export const CANVAS = { W: 1080, H: 1920, FPS: 30 } as const;
// bottom 500: measured on a real phone — Shorts' handle/title/description reach ~y1420.
export const SAFE = { top: 210, bottom: 500, left: 60, right: 180 } as const;
export const SAFE_RECT = {
  x: SAFE.left,
  y: SAFE.top,
  w: CANVAS.W - SAFE.left - SAFE.right, // 840
  h: CANVAS.H - SAFE.top - SAFE.bottom, // 1210
} as const;
