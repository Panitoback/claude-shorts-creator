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

// =============================================================================
// LEGACY — tokens of the original light "AI-studio" look. Still used by the UI-clone kits
// (lib/browser, lib/terminal, lib/kit) of the inherited example shorts. Not the channel brand.
// =============================================================================
export const COLORS = {
  accent: '#6366F1',
  accent2: '#9b7cc4',
  signal: '#4db8a8',
  signalAlt: '#4ecdc4',
  warn: '#f5d76e',
  danger: '#e8879f',
  ink: '#1a1a2e',
  muted: '#6b6b7b',
  paper: '#fffef7',
  cream: '#faf8f5',
  line: '#e7e3da',
  d900: '#0d1117',
  d800: '#161b22',
  d600: '#30363d',
  d400: '#8b949e',
  d300: '#c9d1d9',
} as const;
export const GRADIENT = `linear-gradient(120deg, ${COLORS.accent}, ${COLORS.accent2}, ${COLORS.signal})`;
export const RADIUS = { card: 16, panel: 14, window: 10, pill: 999 } as const;
export const SHADOW = {
  soft: '0 8px 32px rgba(26,26,46,0.10)',
  card: '0 10px 40px rgba(26,26,46,0.08)',
} as const;
export const EASINGS = {
  easeOut: EASE.out,
  easeIn: EASE.in,
  easeInOut: EASE.inOut,
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1),
} as const;
