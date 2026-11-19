import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { CANVAS, CAPTION, PALETTE, SAFE_RECT, SKY_TEXT_SHADOW, SkyPreset, TYPE } from '../../brand';
import {
  AngleCone, coneDisc, DataLabel, LightFlow, groundYAt, Eclipse, GlowingBody, Grain, GroundScene, Horizon, kf, Marker, Observer, Planet, PullBackToEarth, SkyBody, SkyView, TiltUp,
} from '../../components';
import { HorizonVariant } from '../../components/Horizon';
import { eclipseState, moonRadiusPx, skyToScreen, sunRadiusPx } from '../../lib/groundSky';

// GROUND GALLERY — the ground-view kit (brand §11, v2.5), one page per component/option. Review only.
// Page titles sit in the TOP UNSAFE MARGIN on purpose (debug labels).
// QA: node scripts/frames.mjs GroundGallery <frames> --scale=0.5 [--safe]
const HY = SAFE_RECT.y + SAFE_RECT.h; // horizon at the bottom of the safe rectangle (16:9-ready: from the layout)
const CX = SAFE_RECT.x + SAFE_RECT.w / 2;
const PAGES = [120, 120, 120, 120, 120, 120, 120, 120, 120, 120, 240, 240, 240, 150, 120, 120];
const START = PAGES.map((_, i) => PAGES.slice(0, i).reduce((a, b) => a + b, 0));

export const compositionConfig = {
  id: 'GroundGallery',
  durationInSeconds: 77, // sum of PAGES (2310 frames)
  fps: 30,
  width: 1080,
  height: 1920,
};

const Header: React.FC<{ n: number; title: string; note: string }> = ({ n, title, note }) => (
  <div style={{ position: 'absolute', top: 70, left: 60, right: 180, textShadow: SKY_TEXT_SHADOW }}>
    <div style={{ ...TYPE.annotation, color: PALETTE.gold, fontSize: 24 }}>{`G${n} / ${PAGES.length} · ${title}`}</div>
    <div style={{ ...TYPE.annotation, color: PALETTE.sciText, fontSize: 20, letterSpacing: 1, textTransform: 'none', marginTop: 8, opacity: 0.9 }}>{note}</div>
  </div>
);
const Small: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: 'absolute', left: x - 220, width: 440, top: y, textAlign: 'center', ...TYPE.annotation, fontSize: 22, color: PALETTE.sciText, textShadow: SKY_TEXT_SHADOW }}>{children}</div>
);
const Page: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => (
  <Sequence from={START[i]} durationInFrames={PAGES[i]}>{children}</Sequence>
);

// G1: the six presets side by side (each strip is a slice of its full-frame sky)
const PRESETS: SkyPreset[] = ['night', 'twilight', 'dusk', 'dayMuted', 'day', 'eclipse'];
const Presets: React.FC = () => {
  const w = CANVAS.W / PRESETS.length;
  return (
    <>
      {PRESETS.map((p, i) => (
        <div key={p} style={{ position: 'absolute', left: i * w, top: 0, width: w, height: CANVAS.H, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -i * w, top: 0, width: CANVAS.W, height: CANVAS.H }}>
            <SkyView sky={p} horizonY={HY} />
            <Horizon variant="hills" horizonY={HY} sky={p} />
          </div>
          <div style={{ position: 'absolute', top: 980, width: w, textAlign: 'center', ...TYPE.annotation, fontSize: 20, color: PALETTE.ivory }}>{p}</div>
        </div>
      ))}
    </>
  );
};

// G3: bright day — text by placement (upper sky) and with the soft shadow (caption lane)
const DayText: React.FC = () => (
  <>
    <SkyView sky="day" horizonY={HY} />
    <SkyBody kind="sun" el={38} az={14} fov={60} horizonY={HY} />
    <Horizon variant="treeline" horizonY={HY} sky="day" />
    <div style={{ position: 'absolute', left: SAFE_RECT.x, width: SAFE_RECT.w, top: SAFE_RECT.y + 60, textAlign: 'center', ...TYPE.title, color: PALETTE.ivory }}>
      Upper sky, <span style={{ color: PALETTE.gold, fontStyle: 'italic' }}>no</span> shadow
    </div>
    <div style={{ position: 'absolute', left: CX - CAPTION.maxWidth / 2, width: CAPTION.maxWidth, top: CAPTION.centerY - 40, textAlign: 'center', ...TYPE.caption, color: PALETTE.ivory, textShadow: SKY_TEXT_SHADOW }}>
      caption lane, <span style={{ ...TYPE.keyword, color: PALETTE.gold }}>shadow</span>
    </div>
    <Small x={CX} y={1000}>{'bare: zenith 4.14:1 · mid 2.22:1 · horizon 1.38:1 · rendered: title 3.6:1, caption+shadow 6.5:1'}</Small>
  </>
);

// G4: horizon variants, one band each
const VARIANTS: HorizonVariant[] = ['hills', 'mountains', 'treeline', 'city', 'sea'];
const Variants: React.FC = () => {
  const bandH = 300;
  return (
    <>
      {VARIANTS.map((v, i) => {
        const top = SAFE_RECT.y + i * (bandH - 50);
        return (
          <div key={v} style={{ position: 'absolute', left: 0, top, width: CANVAS.W, height: bandH - 60, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: -(HY - (bandH - 110)), width: CANVAS.W, height: CANVAS.H }}>
              <SkyView sky={i === 4 ? 'dusk' : 'night'} horizonY={HY} />
              {i === 4 && <SkyBody kind="sun" el={0.3} fov={60} horizonY={HY} />}
              <Horizon variant={v} horizonY={HY} sky={i === 4 ? 'dusk' : 'night'} reflect={i === 4 ? { x: CANVAS.W / 2, r: 6 } : undefined} />
            </div>
            <div style={{ position: 'absolute', left: SAFE_RECT.x, top: 14, ...TYPE.annotation, fontSize: 22, color: PALETTE.sciText }}>{v}</div>
          </div>
        );
      })}
    </>
  );
};

// G11–12: the same eclipse keys, telephoto and wide
const SEP = [[0, 1.5], [80, 0.09], [110, 0.045], [126, 0.026], [134, 0], [170, 0], [178, -0.026], [194, -0.045], [215, -0.09], [240, -1.0]] as const;
const EclipseSky: React.FC<{ fov: number; moonScale?: number; wide?: boolean }> = ({ fov, moonScale = 1.03, wide }) => {
  const f = useCurrentFrame();
  const st = eclipseState(kf(f, SEP as never, 1.5), moonScale);
  const annular = moonScale < 1;
  const sunEl = wide ? 34 : 0;
  const hy = wide ? HY : HY + 2000; // telephoto: aimed at the Sun, no horizon in frame
  const [x, y] = wide ? skyToScreen(10, sunEl, { fov, horizonY: hy }) : [CX, SAFE_RECT.y + SAFE_RECT.h * 0.42];
  const r = sunRadiusPx(fov);
  const elv = wide ? 0 : 30;
  return (
    <>
      <SkyView sky="day" to={annular ? 'dayMuted' : 'eclipse'} mix={annular ? st.darkness * 0.6 : st.darkness} fov={fov} horizonY={wide ? hy : HY + elv * (CANVAS.W / fov)}
        planets={wide ? [{ az: -14, el: 22 }, { az: 22, el: 48, r: 2.6 }] : []} />
      <Eclipse x={x} y={y} r={r} sep={SEP as never} moonScale={moonScale} />
      {wide && <Horizon variant="hills" horizonY={HY} sky="day" to="eclipse" mix={st.darkness} />}
      {wide && <Observer x={CX - 160} y={groundYAt(CX - 160, HY) + 3} h={150} />}
      <Small x={CX} y={wide ? SAFE_RECT.y + 40 : SAFE_RECT.y + SAFE_RECT.h - 120}>{`coverage ${(st.coverage * 100).toFixed(1)} % · sky darkness ${st.darkness.toFixed(2)}${st.total ? ' · TOTALITY' : ''}`}</Small>
    </>
  );
};

// G14: the angle cone
const ConeDemo: React.FC = () => {
  const eye: [number, number] = [SAFE_RECT.x + 132, groundYAt(SAFE_RECT.x + 102, HY) - 150];
  const toward: [number, number] = [SAFE_RECT.x + SAFE_RECT.w, SAFE_RECT.y + 120];
  const half = 6;
  const moon = coneDisc(eye, toward, half, 260);
  const sun = coneDisc(eye, toward, half, 1000);
  return (
    <>
      <SkyView sky="night" horizonY={HY} />
      <Horizon variant="hills" horizonY={HY} />
      <Observer x={eye[0] - 18} y={groundYAt(eye[0] - 18, HY) + 3} h={162} look={40} />
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* bodies placed exactly in the cone */}
        <EclipseBody x={sun.x} y={sun.y} r={sun.r} kind="sun" />
        <EclipseBody x={moon.x} y={moon.y} r={moon.r} kind="moon" />
      </div>
      <AngleCone eye={eye} toward={toward} halfAngle={half} reach={1090} drawAt={10} ghost={{ from: 260, to: 1000, at: 50, len: 50 }} label="same angle" />
      {/* LightFlow: light pulses running down the sight lines, Sun → eye */}
      <LightFlow points={[[sun.x, sun.y], eye]} at={40} period={12} travel={26} length={150} width={6} />
      <Small x={CX} y={SAFE_RECT.y + SAFE_RECT.h - 60}>{'half-angle exaggerated (6°, true 0.26°) · ghost lands on the Sun'}</Small>
    </>
  );
};
const EclipseBody: React.FC<{ x: number; y: number; r: number; kind: 'sun' | 'moon' }> = ({ x, y, r, kind }) =>
  kind === 'sun' ? <GlowingBody x={x} y={y} r={r} kind="sun" warm /> : <Planet x={x} y={y} r={r} kind="moon" phase={1} warm />;

const Parallax: React.FC = () => (
  <>
    <SkyView sky="twilight" horizonY={HY} />
    <SkyBody kind="moon" el={9} az={8} fov={60} horizonY={HY} />
    <Horizon variant="hills" horizonY={HY} sky="twilight" dolly={[[0, 0], [110, 60]]} />
    <Small x={CX} y={SAFE_RECT.y + 200}>{'dolly 0 → 60 m sideways: near hills move most, the sky not at all'}</Small>
  </>
);

export const GroundGallery: React.FC = () => (
  <Grain>
    <AbsoluteFill style={{ background: PALETTE.space }}>
      <Page i={0}><Presets /><Header n={1} title="Sky view · presets" note="night · twilight · dusk · dayMuted · day (bright) · eclipse — gradient by elevation" /></Page>

      <Page i={1}>
        <SkyView sky="dusk" to="night" mix={[[10, 0], [110, 1]]} horizonY={HY} planets={[{ az: -12, el: 14 }]} />
        <Horizon variant="hills" horizonY={HY} sky="dusk" to="night" mix={[[10, 0], [110, 1]]} />
        <Header n={2} title="Sky view · dusk → night" note="stars come out ONE BY ONE (planet first, then brightest), each ~0.5 s — never a global fade" />
      </Page>

      <Page i={2}><DayText /><Header n={3} title="Bright day + text" note="readable by placement (upper sky) or SKY_TEXT_SHADOW (caption lane) — sky not darkened" /></Page>

      <Page i={3}><Variants /><Header n={4} title="Horizon · variants" note="hills · mountains · treeline · city (generic, few lit windows) · sea (+ reflection) — real heights at real distances" /></Page>

      <Page i={4}><Parallax /><Header n={5} title="Horizon · parallax" note="layers at 4 km, 1.2 km, 260 m · aerial perspective on the far ones" /></Page>

      <Page i={5}>
        <SkyView sky="twilight" horizonY={HY} />
        <Horizon variant="hills" horizonY={HY} sky="twilight" />
        <Observer x={CX - 260} y={groundYAt(CX - 260, HY) + 3} h={210} pose="standing" />
        <Observer x={CX - 20} y={groundYAt(CX - 20, HY) + 3} h={210} pose="sitting" />
        <Observer x={CX + 220} y={groundYAt(CX + 220, HY) + 3} h={210} pose="pointing" point={[[10, 20], [80, 55]]} />
        <Small x={CX} y={HY - 330}>{'standing · sitting · pointing (20° → 55°)'}</Small>
        <Header n={6} title="Observer" note="profile silhouette, ~7.5 heads, no face — sober, small, never the hero" />
      </Page>

      <Page i={6}>
        <SkyView sky="twilight" horizonY={HY} />
        <SkyBody kind="moon" el={6} az={4} fov={60} horizonY={HY} />
        <Horizon variant="hills" horizonY={HY} sky="twilight" />
        <Observer x={CX - 200} y={groundYAt(CX - 200, HY) + 3} h={150} />
        <Marker x={skyToScreen(4, 6, { fov: 60, horizonY: HY })[0]} y={skyToScreen(4, 6, { fov: 60, horizonY: HY })[1]} ringR={moonRadiusPx(60) + 10} label="The Moon" value="0.5° · true size" side="above" length={80} />
        <Header n={7} title="Wide frame · honest size" note={`fov 60° → the Moon is ${(moonRadiusPx(60) * 2).toFixed(0)} px across. Never enlarged in a wide frame`} />
      </Page>

      <Page i={7}>
        <SkyView sky="night" fov={1.5} horizonY={HY} />
        <SkyBody kind="moon" el={0.35} az={0.1} fov={1.5} horizonY={HY} />
        <Horizon layers={[{ variant: 'city', distance: 21000, height: 150, seed: 6 }, { variant: 'city', distance: 16000, height: 120, seed: 21 }]} fov={1.5} horizonY={HY} sky="night" />
        <DataLabel x={SAFE_RECT.x + 20} y={SAFE_RECT.y + 40} label="Telephoto · fov 1.5°" value="skyline 16–21 km away" />
        <Header n={8} title="Telephoto · big Moon, honest optics" note={`Moon still 0.518° → ${(moonRadiusPx(1.5) * 2).toFixed(0)} px; the skyline is far away, in true proportion`} />
      </Page>

      <Page i={8}>
        <GroundScene preset="sunsetSea" horizonY={HY} fov={8} el={[[0, 0.55], [120, -0.1]]} />
        <Header n={9} title="Ground scene · sunset on the sea" note={`fov 8° → Sun ${(sunRadiusPx(8) * 2).toFixed(0)} px, reddened + flattened near the horizon, reflection path`} />
      </Page>

      <Page i={9}>
        <GroundScene preset="moonriseHills" horizonY={HY} fov={6} el={[[0, 0.1], [120, 1.6]]} az={0.4} />
        <Header n={10} title="Ground scene · full Moon over hills" note={`fov 6° → Moon ${(moonRadiusPx(6) * 2).toFixed(0)} px rising behind hills ~2 km away`} />
      </Page>

      <Page i={10}><EclipseSky fov={2.2} /><Header n={11} title="Eclipse · total (telephoto)" note="bite → Baily's beads → diamond ring → pearly corona → reverse · no flare" /></Page>
      <Page i={11}><EclipseSky fov={60} wide /><Header n={12} title="Eclipse · total (wide)" note="day → eclipse sky, 360° sunset ring, planets + bright stars out one by one" /></Page>
      <Page i={12}><EclipseSky fov={2.2} moonScale={0.94} /><Header n={13} title="Eclipse · annular" note="Moon 6 % narrower: thin ring of honest width, no corona, sky stays light" /></Page>

      <Page i={13}><ConeDemo /><Header n={14} title="Angle cone" note="sight lines + faint gold wedge · dashed ghost slides along the cone and lands on the Sun" /></Page>

      <Page i={14}>
        <TiltUp progress={[[10, 0], [100, 1, 'inOut']]} horizonY={HY} sky="twilight" variant="treeline"
          ground={<Observer x={CX - 120} y={groundYAt(CX - 120, HY, { variant: 'treeline' }) + 3} h={170} />} />
        <Header n={15} title="Tilt up · ground → space" note="ground slides out together (pure rotation), sky → space, stars thicken" />
      </Page>

      <Page i={15}>
        <PullBackToEarth progress={[[10, 0], [100, 1, 'inOut']]} horizonY={HY} x0={CX - 60} sky="night" end={{ x: CX, y: SAFE_RECT.y + SAFE_RECT.h * 0.5, r: 260 }} marker={{ label: 'You are here', at: 98 }} />
        <Header n={16} title="Pull back to Earth" note="log-scale rise · horizon curves · thin atmosphere limb · globe + marker" />
      </Page>
    </AbsoluteFill>
  </Grain>
);

export default GroundGallery;
