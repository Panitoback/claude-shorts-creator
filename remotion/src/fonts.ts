// Fonts, loaded from Google Fonts (bundled by Remotion at render time).
// Channel brand (brand/brand.md §3): Fraunces (numbers, keywords) + Inter (captions, labels).
// Space Grotesk / JetBrains Mono / Spectral serve the inherited example shorts.
import { loadFont as loadDisplay } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadBody } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSerif } from '@remotion/google-fonts/Spectral';
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';

export const FONT_DISPLAY = loadDisplay('normal', { weights: ['500', '600', '700'], subsets: ['latin'] }).fontFamily;
export const FONT_BODY = loadBody('normal', { weights: ['400', '500', '600'], subsets: ['latin'] }).fontFamily;
export const FONT_MONO = loadMono('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily;
// serif for the Claude Code wordmark clone (close match to the app's serif)
export const FONT_SERIF = loadSerif('normal', { weights: ['500', '600'], subsets: ['latin'] }).fontFamily;
// channel brand: heavy editorial serif for big numbers and titles, its italic for gold keywords
export const FONT_NUMBER = loadFraunces('normal', { weights: ['600', '700'], subsets: ['latin'] }).fontFamily;
export const FONT_NUMBER_ITALIC = loadFraunces('italic', { weights: ['500', '600'], subsets: ['latin'] }).fontFamily;
