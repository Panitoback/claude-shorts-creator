import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { EASE, PALETTE, TYPE } from '../brand';
import { hash01, kf, Keys, ramp, startOf } from './anim';

// WORD DISSOLVE — a serif word that is written (revealed left to right), then bursts into gold
// particles; it can also try to re-form and stall as a faint ghost. One dial does it all:
// `state` 0 = the word, 1 = drifting dust; keys going 1 → ~0.25 → 1 = a re-form that almost
// spells the word (its ghost outline shows) and scatters again. `write` reveals the letters.
// Particles live inside each letter's own box (no text measuring), so any word and size works.
export type WordDissolveProps = {
  text: string;
  x: number; // center x
  y: number; // top of the word's line box
  size?: number; // font size (default 150)
  italic?: boolean; // serif italic (TYPE.keyword) — default true; false = TYPE.title
  color?: string; // default gold
  write?: Keys; // 0..1 revealed left → right (default 1)
  state?: Keys; // 0 word → 1 dust (default 0)
  ghost?: boolean; // show the faint outline while the dust is close to re-forming (default true)
  spread?: number; // drift at state 1, px (default 230)
  particles?: number; // per letter (default 24)
  opacity?: Keys;
  seed?: number;
  at?: number;
  warm?: boolean;
};

export const WordDissolve: React.FC<WordDissolveProps> = ({
  text, x, y, size = 150, italic = true, color = PALETTE.gold, write = 1, state = 0, ghost = true,
  spread = 230, particles = 24, opacity = 1, seed = 9, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const inP = ramp(f, startOf(at, warm), 10);
  const op = inP * kf(f, opacity, 1);
  const wr = Math.min(1, Math.max(0, kf(f, write, 1)));
  const st = Math.min(1, Math.max(0, kf(f, state, 0)));
  const letters = useMemo(() => [...text], [text]);
  const parts = useMemo(
    () => letters.map((_, li) => Array.from({ length: particles }, (_, k) => {
      const n = seed * 1000 + li * 97 + k;
      const a = hash01(n) * Math.PI * 2;
      const sp = 0.4 + 0.6 * hash01(n + 0.5);
      return { px: 18 + 64 * hash01(n + 1.3), py: 38 + 46 * hash01(n + 2.1), dx: Math.cos(a) * sp, dy: Math.sin(a) * sp - 0.15, r: 2.6 + 2.6 * hash01(n + 3.7) };
    })),
    [letters, particles, seed],
  );
  if (op <= 0.001) return null;

  const base = italic ? TYPE.keyword : TYPE.title;
  const solid = 1 - Math.min(1, st / 0.12);
  const ghostOp = ghost ? 0.4 * Math.min(1, Math.max(0, (0.6 - st) / 0.35)) * (1 - solid) : 0;
  const dustOp = Math.min(1, st / 0.06);
  const e = EASE.out(st);
  // left→right reveal (a soft edge), as if the word were being written
  const edge = wr * 115 - 10;
  const mask = wr >= 1 ? undefined : `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 10}%)`;
  return (
    <div style={{ position: 'absolute', left: x - 1000, width: 2000, top: y, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ display: 'flex', ...base, fontSize: size, lineHeight: 1.2, color, whiteSpace: 'pre', WebkitMaskImage: mask, maskImage: mask }}>
        {letters.map((ch, li) => (
          <span key={li} style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ opacity: solid }}>{ch}</span>
            {ghostOp > 0.002 && (
              <span style={{ position: 'absolute', left: 0, top: 0, color: 'transparent', WebkitTextStroke: `2px ${color}`, opacity: ghostOp }}>{ch}</span>
            )}
            {dustOp > 0.002 && ch !== ' ' && parts[li].map((p, k) => (
              <span key={k} style={{
                position: 'absolute', left: `${p.px}%`, top: `${p.py}%`, width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r,
                borderRadius: '50%', background: k % 5 ? color : '#fffaf0', opacity: dustOp * (0.7 + 0.3 * Math.sin(f / 6 + k)),
                transform: `translate(${p.dx * spread * e}px, ${p.dy * spread * e}px)`,
              }} />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
};
