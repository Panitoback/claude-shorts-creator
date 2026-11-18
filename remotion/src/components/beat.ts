// BEAT GRID of the library music beds — so scene changes and camera accents land on the pulse.
// Measured from the bed file (onset autocorrelation + grid search, 2026-11-17). The bed starts at
// t = 0 of the short (mix_music.py, no --from) and loops every `loop` seconds; the grid restarts
// at each loop seam (bed-minimal-pulse: 120.16 eighths per loop, so the seam drifts only ~0.07 s).
export type BedId = 'bed-minimal-pulse';
export const BEDS: Record<BedId, { bpm: number; eighth: number; phase: number; loop: number }> = {
  'bed-minimal-pulse': { bpm: 70, eighth: 60 / 140, phase: 0.23, loop: 51.5 },
};

// unit = eighths per step: 1 = eighth note, 2 = quarter (the felt beat), 8 = one bar of 4/4
export const beatAt = (n: number, bed: BedId = 'bed-minimal-pulse', unit = 2): number => {
  const b = BEDS[bed];
  const step = b.eighth * unit;
  const perLoop = Math.floor((b.loop - b.phase) / step) + 1; // steps that start inside one pass
  const k = Math.floor(n / perLoop);
  return k * b.loop + b.phase + (n - k * perLoop) * step;
};

// the nearest beat to t (seconds)
export const snapToBeat = (t: number, bed: BedId = 'bed-minimal-pulse', unit = 2): number => {
  const b = BEDS[bed];
  const step = b.eighth * unit;
  const k = Math.max(0, Math.floor(t / b.loop));
  const local = t - k * b.loop;
  const n = Math.max(0, Math.round((local - b.phase) / step));
  return Math.min(k * b.loop + b.phase + n * step, (k + 1) * b.loop + b.phase);
};
