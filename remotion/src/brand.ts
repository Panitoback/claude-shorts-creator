// Brand tokens — the code side of /brand/brand.md. Change a value here and every shot follows.
// Section numbers (§) point at brand/brand.md.
import { Easing } from 'remotion';
import { FONT_BODY, FONT_NUMBER, FONT_NUMBER_ITALIC } from './fonts';

// =============================================================================
// §2 PALETTE
// =============================================================================
export const PALETTE = {
  // surfaces
  space: '#05060a', // the background. Near-black, faintly warm — never pure #000
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
  mercury: { lit: '#cfcac3', base: '#8f8a84', dark: '#2f2c29' },
  venus: { lit: '#f4e2bd', base: '#d9bb83', dark: '#5a4526' },
  earth: { lit: '#a9cdf5', base: '#4a7fc1', dark: '#14284a', atmosphere: '#9cc7ff' },
  moon: { lit: '#dcd8ce', base: '#9a978f', dark: '#2e2c29' },
  mars: { lit: '#eaa47e', base: '#c1643a', dark: '#4a1d10' },
  jupiter: { lit: '#f0dcc2', base: '#c9a27c', dark: '#4e3a27', bands: true },
  saturn: { lit: '#f3e5c4', base: '#d6bd8c', dark: '#5a4b31', bands: true, ring: true },
  uranus: { lit: '#d6f3f5', base: '#8fd0d8', dark: '#244c52' },
  neptune: { lit: '#a3bcf6', base: '#4b70dd', dark: '#16245a' },
};

// True mean radii in km (for honest scale, §5).
export const RADIUS_KM = {
  sun: 696340, mercury: 2440, venus: 6052, earth: 6371, moon: 1737, mars: 3390,
  jupiter: 69911, saturn: 58232, uranus: 25362, neptune: 24622,
} as const;

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
