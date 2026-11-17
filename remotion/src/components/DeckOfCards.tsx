import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, PALETTE, TYPE } from '../brand';
import { hash01, kf, Keys, ramp, startOf } from './anim';

// DECK OF CARDS (everyday object, stylized, no brand marks) — a fan of cards in a perfect order
// (ranks A→K, suits alternating) that a riffle shuffle breaks: the fan closes into two packets,
// they interleave into one pile, and the pile fans out again in the new order (a real riffle:
// the two halves interleave in random-sized runs). Several `riffles` = several shuffles, each a
// different order. Faces ivory, suit marks in warm ink and muted gold. `edge` draws a gold line
// along the fan's outer edge (0..1, from the middle out), with a moving glint.
export type DeckOfCardsProps = {
  x: number; // fan pivot (below the cards)
  y: number;
  radius?: number; // pivot → card center (default 380)
  arc?: number; // fan spread in degrees (default 76)
  count?: number; // cards (default 13)
  cardW?: number; // default 150 (height = 1.4 × width)
  riffles?: number[]; // start frame of each shuffle
  riffleLen?: number; // frames per shuffle (default 36 ≈ 1.2 s)
  edge?: Keys; // gold edge line 0..1 (default 0)
  glintPeriod?: number; // frames for the glint to run along the edge (default 75)
  opacity?: Keys;
  seed?: number;
  at?: number;
  warm?: boolean;
};

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const INK = '#3a3128';
const MUTED_GOLD = '#c2934a';
const SPADE = 'M0,-10 C6,-4 11,0 11,4 C11,8 7,10 3,8 C3.5,10 4.5,12 6,13 L-6,13 C-4.5,12 -3.5,10 -3,8 C-7,10 -11,8 -11,4 C-11,0 -6,-4 0,-10Z';
const HEART = 'M0,12 C-6,7 -11,3 -11,-2 C-11,-7 -6,-10 -2.5,-7 C-1,-6 0,-4.5 0,-4.5 C0,-4.5 1,-6 2.5,-7 C6,-10 11,-7 11,-2 C11,3 6,7 0,12Z';

// riffle: cut near the middle, interleave runs of 1–3 cards from alternating halves
const riffle = (order: number[], seed: number) => {
  const cut = Math.floor(order.length / 2) + (hash01(seed) > 0.5 ? 1 : 0) - 1;
  const a = order.slice(0, cut + 1), b = order.slice(cut + 1);
  const out: number[] = [];
  let k = 0, fromA = hash01(seed * 3) > 0.5;
  while (a.length || b.length) {
    const src = (fromA && a.length) || !b.length ? a : b;
    const run = 1 + Math.floor(hash01(seed * 7 + k++) * 3);
    for (let i = 0; i < run && src.length; i++) out.push(src.shift()!);
    fromA = !fromA;
  }
  return out;
};

export const DeckOfCards: React.FC<DeckOfCardsProps> = ({
  x, y, radius = 380, arc = 76, count = 13, cardW = 150, riffles = [], riffleLen = 36, edge = 0, glintPeriod = 75,
  opacity = 1, seed = 2, at = 0, warm = false,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const s0 = startOf(at, warm);
  const op = ramp(f, s0, 20) * kf(f, opacity, 1);
  const cardH = cardW * 1.4;
  // orders[k] = the order (card ids by fan slot) after k shuffles
  const orders = useMemo(() => {
    const o = [Array.from({ length: count }, (_, i) => i)];
    riffles.forEach((_, k) => o.push(riffle([...o[k]], seed * 10 + k + 1)));
    return o;
  }, [count, riffles.length, seed]);
  if (op <= 0.001) return null;

  const fanPose = (slot: number) => {
    const a = -arc / 2 + (arc * slot) / Math.max(1, count - 1);
    const r = (a * Math.PI) / 180;
    return { x: x + radius * Math.sin(r), y: y - radius * Math.cos(r), rot: a, z: slot };
  };
  // pose of card `id` at frame f
  const poseOf = (id: number) => {
    let k = 0;
    while (k < riffles.length && f >= riffles[k] + riffleLen) k++;
    const before = orders[k];
    if (k >= riffles.length || f < riffles[k]) return fanPose(before.indexOf(id));
    const after = orders[k + 1];
    const u = (f - riffles[k]) / riffleLen;
    const cut = Math.floor(count / 2) + (hash01(seed * 10 + k + 1) > 0.5 ? 1 : 0) - 1;
    const slot = before.indexOf(id);
    const inA = slot <= cut;
    const packet = { x: x + (inA ? -1 : 1) * cardW * 0.62, y: y - radius * 0.9, rot: inA ? -10 : 10, z: slot };
    const pile = { x, y: y - radius * 0.95, rot: (hash01(id * 5 + k) - 0.5) * 4, z: 100 + after.indexOf(id) };
    const out = fanPose(after.indexOf(id));
    const lerp = (A: typeof packet, B: typeof packet, t: number) => ({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, rot: A.rot + (B.rot - A.rot) * t, z: t < 0.5 ? A.z : B.z });
    if (u < 0.3) return lerp(fanPose(slot), packet, EASE.inOut(u / 0.3));
    if (u < 0.62) {
      // each card drops into the pile in its new order (a riffle: fast, one after another)
      const i = after.indexOf(id);
      const t0 = 0.3 + (0.26 * i) / count;
      const t = Math.min(1, Math.max(0, (u - t0) / 0.06));
      return lerp(packet, pile, EASE.out(t));
    }
    return lerp(pile, out, EASE.punch((u - 0.62) / 0.38));
  };

  const cards = Array.from({ length: count }, (_, id) => ({ id, ...poseOf(id) })).sort((a, b) => a.z - b.z);
  const ed = Math.min(1, Math.max(0, kf(f, edge, 0)));
  const er = radius + cardH / 2 + 10;
  const arcPath = (from: number, to: number) => {
    const p = (a: number) => [x + er * Math.sin((a * Math.PI) / 180), y - er * Math.cos((a * Math.PI) / 180)];
    const [ax, ay] = p(from), [bx, by] = p(to);
    return `M${ax},${ay} A${er},${er} 0 0 1 ${bx},${by}`;
  };
  const half = (arc / 2 + 5) * ed;
  const g = ((f - s0) % glintPeriod) / glintPeriod;
  const ga = -half + 2 * half * g;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: op }}>
      <defs>
        <linearGradient id="deckFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbf7ef" />
          <stop offset="100%" stopColor="#e6dccb" />
        </linearGradient>
      </defs>
      {cards.map((c) => {
        const red = c.id % 2 === 1;
        const col = red ? MUTED_GOLD : INK;
        const rank = RANKS[c.id % 13];
        return (
          <g key={c.id} transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}>
            <rect x={-cardW / 2 + 3} y={-cardH / 2 + 4} width={cardW} height={cardH} rx={12} fill="#000" opacity={0.28} />
            <rect x={-cardW / 2} y={-cardH / 2} width={cardW} height={cardH} rx={12} fill="url(#deckFace)" />
            <text x={-cardW / 2 + 14} y={-cardH / 2 + 38} fontFamily={TYPE.number.fontFamily} fontWeight={600} fontSize={32} fill={col}>{rank}</text>
            <path d={red ? HEART : SPADE} transform={`translate(${-cardW / 2 + 24} ${-cardH / 2 + 62}) scale(0.9)`} fill={col} />
            <path d={red ? HEART : SPADE} transform={`scale(${cardW / 60})`} fill={col} />
          </g>
        );
      })}
      {ed > 0.001 && (
        <g fill="none" strokeLinecap="round">
          <path d={arcPath(-half, half)} stroke={PALETTE.goldDeep} strokeOpacity={0.25} strokeWidth={12} />
          <path d={arcPath(-half, half)} stroke={PALETTE.gold} strokeWidth={4} />
          {ed >= 0.999 && <path d={arcPath(Math.max(-half, ga - 6), Math.min(half, ga + 6))} stroke="#fffaf0" strokeWidth={6} />}
        </g>
      )}
    </svg>
  );
};
