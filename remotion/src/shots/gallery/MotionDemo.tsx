import React from 'react';
import { AbsoluteFill, Audio, getInputProps, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { CANVAS, PALETTE, SAFE_RECT, TYPE } from '../../brand';
import {
  beatAt, barGeom, Camera, CameraLayer, circleGeom, FlyThrough, glyphLayout, GlowingBody, Grain, ParticleGlyphs, ShapeMatch,
  Starfield, Timeline, WhipTransition, whipTiming,
} from '../../components';
import { kf } from '../../components/anim';

// MOTION DEMO (2026-11-17): the dynamism kit in one 14 s piece, every change on the pulse of
// bed-minimal-pulse (70 BPM). 1 living camera + parallax → 2 shape match cut (the sun becomes a bar)
// + punch-in → 3 whip → particles condense into "10^30" + punch-in → 4 fly-through the "0" → a timeline
// + punch-in. Audio is in the composition (music + SFX) for the preview. Pages 34–37 of the
// ComponentGallery show the same scenes without audio.
// Render without motion blur (to measure its cost): --props='{"noBlur":true}'.
export const compositionConfig = { id: 'MotionDemo', durationInSeconds: 14.5, fps: 30, width: 1080, height: 1920 };

const FPS = CANVAS.FPS;
const F = (s: number) => Math.round(s * FPS);
const Q = (n: number) => beatAt(n); // the n-th quarter note of the bed (seconds)
const CX = SAFE_RECT.x + SAFE_RECT.w / 2;
const CY = SAFE_RECT.y + SAFE_RECT.h * 0.42;

const T = {
  match: F(Q(4)), punch1: F(Q(6)), whipSwap: F(Q(8)), form: F(Q(9)), punch2: F(Q(11)), fly: F(Q(12)), land: F(Q(13)), punch3: F(Q(15)),
};
const WHIP_AT = T.whipSwap - whipTiming(0, 8).swap;
const SUN_R = 110;
const BAR = { left: SAFE_RECT.x + 90, w: SAFE_RECT.w - 200, h: 30, y1: CY - 40, y2: CY + 150 };
const BOX = { x: CX, y: CY, w: SAFE_RECT.w * 0.86, h: SAFE_RECT.w * 0.62 };
const GLYPH = { text: '10^30', cx: CX, cy: CY - 20, cell: 26 };
const ZERO = glyphLayout(GLYPH.text, GLYPH.cx, GLYPH.cy, GLYPH.cell).centers[1]; // the "0" of "10"

const Tag: React.FC<{ n: number; children: string }> = ({ n, children }) => (
  <div style={{ position: 'absolute', left: SAFE_RECT.x, width: SAFE_RECT.w, top: SAFE_RECT.y + 10, textAlign: 'center', ...TYPE.annotation, fontSize: 24, color: PALETTE.sciText } as React.CSSProperties}>
    {`${n} · ${children}`}
  </div>
);
const Sky: React.FC<{ seed?: number }> = ({ seed = 3 }) => (
  <>
    <CameraLayer depth={0.15}><Starfield count={260} bright={10} seed={seed} warm /></CameraLayer>
    <CameraLayer depth={0.45}><Starfield count={45} bright={6} seed={seed + 40} warm /></CameraLayer>
  </>
);

// 1 + 2: the sun (living camera, parallax pan) → match cut into the PEAK bar → TODAY bar + punch-in
const SceneSunBars: React.FC = () => {
  const f = useCurrentFrame();
  const sunOp = 1 - kf(f, [[T.match - 4, 0], [T.match + 6, 1, 'in']], 0);
  const chart = kf(f, [[T.match + 6, 0], [T.match + 18, 1, 'out']], 0);
  const today = kf(f, [[T.punch1 - 14, 0], [T.punch1, 1, 'out']], 0);
  return (
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <Sky />
      <CameraLayer depth={1}>
        {sunOp > 0.001 && <AbsoluteFill style={{ opacity: sunOp }}><GlowingBody x={CX} y={CY} r={SUN_R} warm /></AbsoluteFill>}
        <ShapeMatch keys={[{ g: circleGeom(CX, CY, SUN_R), at: 0 }, { g: barGeom(BAR.left, BAR.y1, BAR.w, BAR.h), at: T.match, len: 16 }]}
          opacity={[[T.match - 6, 0], [T.match, 1]]} glow={20} />
        <div style={{ position: 'absolute', left: BAR.left, top: BAR.y1 - 90, opacity: chart, ...TYPE.annotation, color: PALETTE.sciText } as React.CSSProperties}>STARS BORN PER YEAR · PEAK</div>
        <div style={{ position: 'absolute', left: BAR.left, top: BAR.y1 + 30, opacity: chart, ...TYPE.subject, fontSize: 64, color: PALETTE.ivory } as React.CSSProperties}>100%</div>
        <div style={{ position: 'absolute', left: BAR.left, top: BAR.y2 - 60, opacity: today, ...TYPE.annotation, color: PALETTE.sciText } as React.CSSProperties}>TODAY</div>
        <div style={{ position: 'absolute', left: BAR.left, top: BAR.y2 - BAR.h / 2, width: Math.max(BAR.h, BAR.w * 0.1 * today), height: BAR.h, borderRadius: BAR.h / 2, background: 'rgba(244,241,234,0.55)', opacity: today > 0 ? 1 : 0 }} />
        <div style={{ position: 'absolute', left: BAR.left, top: BAR.y2 + 30, opacity: today, ...TYPE.keyword, fontSize: 64, color: PALETTE.gold } as React.CSSProperties}>~10%</div>
      </CameraLayer>
      <Tag n={f < T.match ? 1 : 2}>{f < T.match ? 'living camera + parallax' : 'shape match cut + punch-in'}</Tag>
    </AbsoluteFill>
  );
};

// 3: a gas of 100 particles condenses into 10^30 (punch-in when it lands)
const SceneParticles: React.FC = () => (
  <AbsoluteFill style={{ background: PALETTE.space }}>
    <Sky seed={8} />
    <CameraLayer depth={1}>
      <ParticleGlyphs box={BOX} text={GLYPH.text} cx={GLYPH.cx} cy={GLYPH.cy} cell={GLYPH.cell} at={T.form} len={36} stagger={16} start={T.whipSwap - 20}
        boxLine={[[T.form, 1], [T.form + 30, 0]]} />
      <div style={{ position: 'absolute', left: SAFE_RECT.x, width: SAFE_RECT.w, top: CY + 160, textAlign: 'center', ...TYPE.label, color: PALETTE.sciText,
        opacity: kf(useCurrentFrame(), [[T.punch2 - 4, 0], [T.punch2 + 10, 1, 'out']], 0) } as React.CSSProperties}>ODDS: ALL ONE SIDE</div>
    </CameraLayer>
    <Tag n={3}>whip · particles form a number + punch-in</Tag>
  </AbsoluteFill>
);

// 4: inside the zero — the timeline (punch-in on TODAY)
const SceneTimeline: React.FC = () => (
  <AbsoluteFill style={{ background: PALETTE.space }}>
    <Sky seed={14} />
    <CameraLayer depth={1}>
      <Timeline x={SAFE_RECT.x + 160} y={SAFE_RECT.y + 160} length={760} range={[0, 13.8e9]} labelSize={44} at={T.land - 20}
        events={[
          { t: 0, label: 'Big Bang', date: 'LOWEST ENTROPY', at: T.land - 6, hero: true },
          { t: 13.8e9, label: 'Today', date: '13.8 BILLION YEARS', at: T.punch3 - 4 },
        ]} />
    </CameraLayer>
    <Tag n={4}>fly-through the zero + punch-in</Tag>
  </AbsoluteFill>
);

const SFX: React.FC<{ id: string; at: number; vol?: number }> = ({ id, at, vol = 1 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none"><Audio src={staticFile(`library/sfx/clips/${id}.mp3`)} volume={vol} /></Sequence>
);

const MotionDemo: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const noBlur = Boolean((getInputProps() as { noBlur?: boolean }).noBlur);
  const pan = [[F(Q(1)), -50], [F(Q(3)), 50, 'inOut']] as const;
  return (
    <Grain>
      <AbsoluteFill style={{ background: PALETTE.space }}>
        <Camera x={pan} punches={[T.punch1, T.punch2, T.punch3]}>
          <FlyThrough at={T.fly} len={T.land - T.fly} x={ZERO.x} y={ZERO.y} hole={ZERO.cell * 1.3} blur={!noBlur}
            from={<WhipTransition at={WHIP_AT} dur={8} direction="left" from={<SceneSunBars />} to={<SceneParticles />} />}
            to={<SceneTimeline />} />
        </Camera>
      </AbsoluteFill>
      {audio && (
        <>
          <Audio src={staticFile('library/music/clips/bed-minimal-pulse.mp3')} volume={0.55} />
          <Audio src={staticFile('library/sfx/clips/space-air-loop.mp3')} volume={0.12} />
          <SFX id="swish-light" at={T.match + 8 - 0.14 * FPS} vol={0.9} />
          <SFX id="impact-soft" at={T.punch1 - 0.23 * FPS} vol={0.8} />
          <SFX id="pop-reveal" at={T.punch1} vol={0.6} />
          <SFX id="whoosh-soft" at={T.whipSwap - 0.27 * FPS} />
          <SFX id="sparkle-soft" at={T.form} vol={0.7} />
          <SFX id="hook-hit" at={T.punch2} vol={0.6} />
          <SFX id="whoosh-deep" at={T.fly + (T.land - T.fly) * 0.55 - 0.52 * FPS} />
          <SFX id="impact-soft" at={T.punch3 - 0.23 * FPS} vol={0.8} />
        </>
      )}
    </Grain>
  );
};
export default MotionDemo;
export { SceneSunBars, SceneParticles, SceneTimeline, T as MOTION_DEMO_T };

