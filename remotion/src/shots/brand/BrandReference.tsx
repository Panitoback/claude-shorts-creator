import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ANNOTATION, BODY, CAPTION, EASE, MOTION, PALETTE, TYPE } from '../../brand';
import { clearZones, makeStars, starTint } from '../../lib/sky';

// BRAND REFERENCE SCENE — brand/brand.md made visible. Built ONLY from brand tokens, so if this
// scene looks right, the tokens are right. 5 s: sky + Sun → count-up → two annotations → caption.
// Render with --safe to check it against the safe zones.
export const compositionConfig = {
  id: 'BrandReference',
  durationInSeconds: 5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const SUN = { x: 590, y: 930, r: 240 };
const EARTH = { x: 120, y: 860 };
const BAR_Y = SUN.y + SUN.r + 40;

const STARS = clearZones(makeStars(320, 7), [
  [150, 210, 780, 450], // number block
  [180, 1290, 720, 120], // caption lane
  [80, 830, 230, 160], // Earth annotation
  [330, BAR_Y - 20, 520, 80], // scale bar + label
]);

const CL = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
// ease a 0..1 (or from..to) ramp that starts at frame `a` and lasts `len` frames
const ramp = (f: number, a: number, len: number, from = 0, to = 1) =>
  interpolate(f, [a, a + len], [from, to], { ...CL, easing: EASE.out });

const WORDS = [
  { w: 'fit', at: 96 },
  { w: 'inside', at: 104 },
  { w: 'the', at: 114 },
  { w: 'Sun', at: 120, key: true },
];

const BrandReference: React.FC = () => {
  const f = useCurrentFrame();

  const sky = ramp(f, 0, MOTION.skyFade);
  const disc = ramp(f, 0, MOTION.discIn);
  const glow = ramp(f, 4, MOTION.glowIn);
  const breathe = 1 + MOTION.breathe * Math.sin((f / 150) * Math.PI * 2);

  const numIn = ramp(f, 10, MOTION.rise);
  const count = ramp(f, 14, MOTION.countUp, 0, 1.3);
  const unitIn = ramp(f, 54, MOTION.rise);
  const subjIn = ramp(f, 62, MOTION.rise);

  const dot = ramp(f, 70, MOTION.markerIn);
  const leader = ramp(f, 74, MOTION.lineDraw);
  const earthLabel = ramp(f, 84, MOTION.labelIn);
  const bar = ramp(f, 100, MOTION.scaleBarDraw);
  const barLabel = ramp(f, 116, MOTION.labelIn);

  const rise = (p: number) => `translateY(${(1 - p) * MOTION.risePx}px)`;

  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <AbsoluteFill
        style={{ opacity: glow, background: `radial-gradient(900px 760px at 55% 48%, ${PALETTE.spaceWarm}, transparent 70%)` }}
      />
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="sun" cx="46%" cy="44%" r="56%">
            <stop offset="0%" stopColor={BODY.sun[0]} />
            <stop offset="50%" stopColor={BODY.sun[1]} />
            <stop offset="82%" stopColor={BODY.sun[2]} />
            <stop offset="100%" stopColor={BODY.sun[3]} />
          </radialGradient>
          <radialGradient id="corona" cx="50%" cy="50%" r="50%">
            <stop offset="58%" stopColor={BODY.corona} />
            <stop offset="100%" stopColor="rgba(255,176,88,0)" />
          </radialGradient>
        </defs>

        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.8}
            fill={starTint(s.t)}
            opacity={sky * s.a * 0.85 * (1 - MOTION.twinkle + MOTION.twinkle * Math.sin(f / 18 + i * 1.7))}
          />
        ))}

        <circle cx={SUN.x} cy={SUN.y} r={SUN.r * 1.5 * breathe} fill="url(#corona)" opacity={glow} />
        <circle cx={SUN.x} cy={SUN.y} r={SUN.r * interpolate(disc, [0, 1], [0.96, 1])} fill="url(#sun)" opacity={disc} />

        {/* annotation 1 — marker + leader line (Earth drawn at 4 px; true scale here is ~2.2 px) */}
        <circle cx={EARTH.x} cy={EARTH.y} r={4} fill={BODY.earth} opacity={dot} />
        <circle
          cx={EARTH.x}
          cy={EARTH.y}
          r={ANNOTATION.markerRing * interpolate(dot, [0, 1], [1.6, 1])}
          fill="none"
          stroke={PALETTE.sciLine}
          strokeWidth={ANNOTATION.stroke}
          opacity={dot}
        />
        <line
          x1={EARTH.x}
          y1={EARTH.y + ANNOTATION.markerRing + 2}
          x2={EARTH.x}
          y2={EARTH.y + ANNOTATION.markerRing + 2 + 56 * leader}
          stroke={PALETTE.sciLine}
          strokeWidth={ANNOTATION.stroke}
        />

        {/* annotation 2 — scale bar, drawn from its center outward */}
        <g stroke={PALETTE.sciLine} strokeWidth={ANNOTATION.stroke} opacity={bar > 0 ? 1 : 0}>
          <line x1={SUN.x - SUN.r * bar} y1={BAR_Y} x2={SUN.x + SUN.r * bar} y2={BAR_Y} />
          <line x1={SUN.x - SUN.r * bar} y1={BAR_Y - ANNOTATION.tick} x2={SUN.x - SUN.r * bar} y2={BAR_Y + ANNOTATION.tick} />
          <line x1={SUN.x + SUN.r * bar} y1={BAR_Y - ANNOTATION.tick} x2={SUN.x + SUN.r * bar} y2={BAR_Y + ANNOTATION.tick} />
        </g>
      </svg>

      <div style={{ ...TYPE.annotation, position: 'absolute', left: EARTH.x - 24, top: EARTH.y + 80, color: PALETTE.sciText, opacity: earthLabel }}>
        Earth <span style={{ color: PALETTE.sci }}>×1</span>
      </div>
      <div
        style={{
          ...TYPE.annotation, position: 'absolute', top: BAR_Y + 20, left: SUN.x - 300, width: 600, textAlign: 'center',
          color: PALETTE.sciText, opacity: barLabel,
        }}
      >
        <span style={{ color: PALETTE.sci }}>109 ×</span> Earth's width
      </div>

      {/* hero number block */}
      <div style={{ position: 'absolute', top: 230, width: '100%', textAlign: 'center' }}>
        <div style={{ ...TYPE.label, color: PALETTE.sciText, opacity: numIn }}>By volume</div>
        <div style={{ ...TYPE.number, color: PALETTE.ivory, marginTop: 14, opacity: numIn, transform: rise(numIn), fontVariantNumeric: 'tabular-nums' }}>
          {count.toFixed(1)}
          <span style={{ ...TYPE.numberUnit, color: PALETTE.gold, marginLeft: 22, display: 'inline-block', opacity: unitIn, transform: rise(unitIn) }}>
            million
          </span>
        </div>
        <div style={{ ...TYPE.subject, color: PALETTE.ivory, marginTop: 4, opacity: subjIn, transform: rise(subjIn) }}>Earths</div>
      </div>

      {/* caption lane: sans words, keyword in gold italic serif */}
      <div
        style={{
          position: 'absolute', left: (1080 - CAPTION.maxWidth) / 2, width: CAPTION.maxWidth, top: CAPTION.centerY - 60,
          height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          opacity: ramp(f, 90, 6),
        }}
      >
        {WORDS.map(({ w, at, key }) => {
          const on = ramp(f, at, CAPTION.wordOnFrames);
          const op = 0.3 + 0.7 * on;
          if (key) {
            const pop = 1 + (CAPTION.keywordPop - 1) * Math.sin(Math.min(1, Math.max(0, (f - at) / 10)) * Math.PI);
            return (
              <span key={w} style={{ ...TYPE.keyword, color: on > 0 ? PALETTE.gold : PALETTE.ivory, opacity: op, display: 'inline-block', transform: `scale(${pop})` }}>
                {w}
              </span>
            );
          }
          return (
            <span key={w} style={{ ...TYPE.caption, color: PALETTE.ivory, opacity: op }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default BrandReference;
