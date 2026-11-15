import { Config } from '@remotion/cli/config';

// ../media is Remotion's public root: staticFile('library/logos/x') →
// ../media/library/x (reusable), staticFile('projects/<proj>/x') → ../media/projects/... (per-video).
Config.setPublicDir('../media');

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // auto (measured 2026-11-15: 4..12 tabs render at the same speed)
// GPU (ANGLE -> the RTX): ~30% faster frames than the default, output identical to the eye
// (PSNR 50-55 dB, the #000 shadow intact). Keep in sync with GL in scripts/render-all.mjs + frames.mjs.
Config.setChromiumOpenGlRenderer('angle');
