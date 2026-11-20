import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { PALETTE, SAFE_RECT, TYPE } from '../../brand';
import {
  AccretionDisk, BlackHole, CaptionLine, DataLabel, GlowingBody, Grain, HostGalaxy, Jets, Quasar, quasarExposure, HeroNumber, KeywordCaptions, Marker, Planet, ScaleBar, ScaleComparison, Starfield,
  InfallingGas, KineticTitle, ParallaxStars,
  Balance, ComparisonBars, FlowPaths, Meter, OrbitOverlay, Timeline, linePath, spiralPath,
  WhipMontage, whipTiming,
  Egg, eggCrackPts, CoffeeCup, cupSpiralPts, GoldMorphLine, morphScribble, morphPoint, WordDissolve, ParticleBox, DeckOfCards,
  Camera, CameraLayer, OdometerNumber, TimeStream, RaceBoard,
  Runner, Car, MultiRaceBoard, TitleSwap, SpeedHeader, ElapsedCounter,
} from '../../components';
import { EASE } from '../../brand';
import { PlanetKind } from '../../brand';

// COMPONENT GALLERY — every base-kit component with its main options, one page each (4 s).
// For review only, not channel content. Page titles sit in the TOP UNSAFE MARGIN on purpose
// (debug labels), so everything inside the safe rectangle is the component itself.
// QA: node scripts/frames.mjs ComponentGallery 110,230,... --scale=0.5 [--safe]
import MotionDemo, { MOTION_DEMO_T } from './MotionDemo';
import { AscentDemo, FieldRibbonDemo, PaperFoldDemo } from './FoldKitDemos';
const PAGE = 120;

export const compositionConfig = {
  id: 'ComponentGallery',
  durationInSeconds: 184, // 46 pages × PAGE frames
  fps: 30,
  width: 1080,
  height: 1920,
};

const Header: React.FC<{ n: number; title: string; note: string }> = ({ n, title, note }) => (
  <div style={{ position: 'absolute', top: 70, left: 60, right: 180 }}>
    <div style={{ ...TYPE.annotation, color: PALETTE.gold, fontSize: 24 }}>{`${n} / 46 · ${title}`}</div>
    <div style={{ ...TYPE.annotation, color: PALETTE.sciText, fontSize: 20, letterSpacing: 1, textTransform: 'none', marginTop: 8, opacity: 0.8 }}>{note}</div>
  </div>
);

const Small: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: 'absolute', left: x - 200, width: 400, top: y, textAlign: 'center', ...TYPE.annotation, fontSize: 22, color: PALETTE.sciText, opacity: 0.85 }}>{children}</div>
);

// ---- 4 · captions demo data: a line whose spoken form (tts) differs from the written text ------
// The word timestamps belong to the TTS words (as gen_voice.py returns them).
const TTS_WORDS = [
  { w: 'Ah-reh-SEE-boh', start: 0.3, end: 1.05 },
  { w: 'heard', start: 1.1, end: 1.35 },
  { w: 'it', start: 1.38, end: 1.48 },
  { w: 'first.', start: 1.5, end: 1.9 },
];
const CAPTION_LINES: CaptionLine[] = [
  { text: 'Arecibo heard it first.', tts: 'Ah-reh-SEE-boh heard it first.', start: 0.3, end: 1.9, words: TTS_WORDS },
  { text: 'Brighter than the Sun, by far.', start: 2.05, end: 3.6 }, // no alignment → estimated timing
];

const PLANETS: PlanetKind[] = ['mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
// page 8: small grid under the hero (≈80 px across → mid detail)
const SMALL = PLANETS.map((_, i) => [215 + (i % 3) * 250, 900 + Math.floor(i / 3) * 150] as const);
// page 9: every body at hero size (≈216 px across → full detail)
const BIG = PLANETS.map((_, i) => [200 + (i % 3) * 280, 380 + Math.floor(i / 3) * 330] as const);

// page 15: luminosity sweeps 0 → 1; galaxy and sky dim with it (quasarExposure)
const QuasarSweep: React.FC = () => {
  const f = useCurrentFrame();
  const l = interpolate(f, [10, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exp = quasarExposure(l);
  return (
    <>
      <Starfield count={260} opacity={exp.stars} warm />
      <HostGalaxy x={480} y={800} rx={400} dim={exp.galaxy} warm />
      <Quasar x={480} y={800} shadowR={26} luminosity={l} warm />
      <Small x={480} y={1290}>{`luminosity ${l.toFixed(2)} · galaxy ${exp.galaxy.toFixed(2)} · stars ${exp.stars.toFixed(2)}`}</Small>
    </>
  );
};

export const ComponentGallery: React.FC = () => (
  <Grain>
  <AbsoluteFill style={{ background: PALETTE.space }}>
    {/* 1 STARFIELD */}
    <Sequence durationInFrames={PAGE}>
      <Starfield count={360} bright={12} clear={[[200, 760, 680, 300]]} warm />
      <div style={{ position: 'absolute', left: 200, top: 760, width: 680, height: 300, border: '2px dashed rgba(156,199,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...TYPE.annotation, color: PALETTE.sciText }}>
        clear zone · no stars behind text
      </div>
      <Header n={1} title="Starfield" note="count 360 · bright 12 (halos, twinkle) · faint stars static · clear=[[200,760,680,300]]" />
    </Sequence>

    {/* 2 GLOWING BODY */}
    <Sequence from={PAGE} durationInFrames={PAGE}>
      <Starfield count={220} clear={[[60, 1150, 840, 120]]} avoid={[[480, 620, 315], [220, 1080, 90], [480, 1080, 90], [740, 1080, 90]]} warm />
      <GlowingBody x={480} y={620} r={210} kind="sun" />
      {(['red', 'white', 'blue'] as const).map((k, i) => (
        <React.Fragment key={k}>
          <GlowingBody x={220 + i * 260} y={1080} r={62} kind={k} at={20 + i * 8} />
          <Small x={220 + i * 260} y={1180}>{`kind="${k}"`}</Small>
        </React.Fragment>
      ))}
      <Small x={480} y={870}>{'kind="sun" · wash on'}</Small>
      <Header n={2} title="Glowing body" note="disc 30f, glow blooms 46f, breathes ±1.5% · kinds by temperature" />
    </Sequence>

    {/* 3 HERO NUMBER */}
    <Sequence from={PAGE * 2} durationInFrames={PAGE}>
      <Starfield count={200} clear={[[60, 210, 840, 680], [60, 900, 840, 420]]} warm />
      <HeroNumber value={1.3} unit="million" subject="Earths" label="By volume" />
      <HeroNumber value={299792} grouping unit="km/s" subject="the speed of light" y={960} scale={0.55} at={30} />
      {/* too long on purpose: auto-shrinks AND logs a [QA] warning (see out/qa/ComponentGallery-qa.json) */}
      <HeroNumber value={1300000} grouping unit="Earths" y={640} at={15} />
      <Small x={480} y={850}>{'too long → auto-shrinks + QA warning'}</Small>
      <Header n={3} title="Hero number" note="count-up 48f · final width reserved · unit gold italic · scale 0.55 + grouping (bottom)" />
    </Sequence>

    {/* 4 CAPTION WITH KEYWORD */}
    <Sequence from={PAGE * 3} durationInFrames={PAGE}>
      <Starfield count={200} clear={[[150, 1240, 780, 220]]} avoid={[[480, 760, 150]]} warm />
      <Planet x={480} y={760} r={150} kind="moon" wash warm />
      <KeywordCaptions lines={CAPTION_LINES} keywords={['ARECIBO', 'sun']} />
      <Header n={4} title="Caption with keyword" note={'text shown on TTS timings ("Ah-reh-SEE-boh" → "Arecibo") · keywords "ARECIBO","sun" match "Sun,"'} />
    </Sequence>

    {/* 5 MARKER + LEADER LINE */}
    <Sequence from={PAGE * 4} durationInFrames={PAGE}>
      <Starfield count={200} avoid={[[300, 700, 110]]} warm />
      <Planet x={300} y={700} r={90} kind="earth" wash warm />
      <Marker x={300} y={700} ringR={104} label="Earth" value="12,742 km" side="below" length={56} />
      <Marker x={700} y={1050} dot label="The Moon" value="dot marker" side="above" at={14} />
      <Header n={5} title="Marker + leader line" note="ring settles 8f · line draws 16f · label 12f · sides below/above/left/right · dot for tiny objects" />
    </Sequence>

    {/* 6 SCALE BAR */}
    <Sequence from={PAGE * 5} durationInFrames={PAGE}>
      <Starfield count={200} avoid={[[480, 720, 390]]} warm />
      <GlowingBody x={480} y={720} r={260} kind="sun" warm />
      <ScaleBar x1={220} x2={740} y={1030} label="1.39 million km" value="the Sun's diameter" />
      <ScaleBar x1={300} x2={660} y={330} label="label above" side="above" at={20} />
      <Header n={6} title="Scale bar" note="draws from center outward 24f · end ticks · label below (or above)" />
    </Sequence>

    {/* 7 DATA LABEL */}
    <Sequence from={PAGE * 6} durationInFrames={PAGE}>
      <Starfield count={200} clear={[[60, 300, 840, 200], [60, 1050, 840, 260]]} avoid={[[480, 760, 190]]} warm />
      <Planet x={480} y={760} r={190} kind="mars" wash warm />
      <DataLabel x={100} y={320} label="Surface gravity" value="38% of Earth" />
      <DataLabel x={860} y={1080} label="One day lasts" value="24 h 37 min" align="right" accent at={16} />
      <Header n={7} title="Data label" note="label + serif value · align left/center/right · accent = gold italic" />
    </Sequence>

    {/* 8 PLANET / MOON — one hero + the small-size grid */}
    <Sequence from={PAGE * 7} durationInFrames={PAGE}>
      <Starfield count={180} avoid={[[480, 520, 250], ...SMALL.map(([x, y]) => [x, y, 60] as [number, number, number])]} warm />
      <Planet x={480} y={520} r={200} kind="earth" rotate={8} wash warm />
      <Small x={480} y={745}>{'earth · hero · rotate={8} · wash'}</Small>
      {PLANETS.map((k, i) => (
        <React.Fragment key={k}>
          <Planet x={SMALL[i][0]} y={SMALL[i][1]} r={k === 'saturn' ? 26 : k === 'uranus' ? 34 : 40} kind={k} ring={k === 'uranus' ? true : undefined} at={6 + i * 3} />
          <Small x={SMALL[i][0]} y={SMALL[i][1] + 50}>{k === 'uranus' ? 'uranus · tilt 98°' : k}</Small>
        </React.Fragment>
      ))}
      <Header n={8} title="Planet / moon" note="hero = full detail · grid at ~80 px = main features only · under 60 px = color + terminator (see page 10)" />
    </Sequence>

    {/* 9 PLANET DETAILS — every body at hero size */}
    <Sequence from={PAGE * 8} durationInFrames={PAGE}>
      <Starfield count={140} avoid={BIG.map(([x, y]) => [x, y, 120] as [number, number, number])} warm />
      {PLANETS.map((k, i) => (
        <React.Fragment key={k}>
          <Planet x={BIG[i][0]} y={BIG[i][1]} r={k === 'saturn' ? 52 : 108} kind={k} at={i * 3} light={k === 'moon' ? 200 : 225} phase={k === 'moon' ? 0.6 : 0.75} />
          <Small x={BIG[i][0]} y={BIG[i][1] + 118}>{k}</Small>
        </React.Fragment>
      ))}
      <Header n={9} title="Planet details" note="signature features at hero size: continents · maria · craters · polar caps · Great Red Spot · Cassini division · cloud swirls · streaks" />
    </Sequence>

    {/* 10 SCALE COMPARISON */}
    <Sequence from={PAGE * 9} durationInFrames={PAGE}>
      <Starfield count={200} warm />
      <ScaleComparison
        y={720}
        maxR={150}
        bodies={[{ name: 'Mercury', kind: 'mercury' }, { name: 'Moon', kind: 'moon' }, { name: 'Mars', kind: 'mars' }, { name: 'Venus', kind: 'venus' }, { name: 'Earth', kind: 'earth' }]}
      />
      <ScaleComparison
        y={1150}
        maxR={260}
        bodies={[{ name: 'Sun', kind: 'sun' }, { name: 'Jupiter', kind: 'jupiter' }, { name: 'Earth', kind: 'earth' }]}
        at={30}
      />
      <Header n={10} title="Scale comparison" note="true relative size · <4 px → 4 px + ring · auto-fit to 720 px · labels never collide" />
    </Sequence>

    {/* 11 BLACK HOLE */}
    <Sequence from={PAGE * 10} durationInFrames={PAGE}>
      <Starfield count={220} avoid={[[480, 640, 160], [480, 1120, 70]]} warm />
      <BlackHole x={480} y={640} r={130} />
      <Small x={480} y={820}>{'r 130 · photon ring brighter on the left'}</Small>
      <BlackHole x={480} y={1120} r={48} brightSide={null} at={14} />
      <Small x={480} y={1185}>{'brightSide={null} · even ring'}</Small>
      <Header n={11} title="Black hole" note="pure #000 shadow (the one brand exception) + thin photon ring, falloff by gradient, no blur" />
    </Sequence>

    {/* 12 ACCRETION DISK */}
    <Sequence from={PAGE * 11} durationInFrames={PAGE}>
      <Starfield count={220} avoid={[[480, 640, 430], [480, 1110, 220]]} warm />
      <AccretionDisk x={480} y={640} shadowR={88} layer="back" />
      <BlackHole x={480} y={640} r={88} />
      <AccretionDisk x={480} y={640} shadowR={88} layer="front" />
      <Small x={480} y={880}>{'luminosity 1 · lensed far side · drift'}</Small>
      <AccretionDisk x={480} y={1110} shadowR={40} luminosity={0.15} tilt={0.32} angle={6} layer="back" />
      <BlackHole x={480} y={1110} r={40} ring={0.5} />
      <AccretionDisk x={480} y={1110} shadowR={40} luminosity={0.15} tilt={0.32} angle={6} layer="front" />
      <Small x={480} y={1200}>{'luminosity 0.15 (dormant) · tilt 0.32'}</Small>
      <Header n={12} title="Accretion disk" note="one smooth gradient: near-white inside → gold → orange · approaching side brighter · far side bent over and under the shadow" />
    </Sequence>

    {/* 13 JETS */}
    <Sequence from={PAGE * 12} durationInFrames={PAGE}>
      <Starfield count={220} warm />
      <Jets x={480} y={800} length={540} angle={-8} />
      <AccretionDisk x={480} y={800} shadowR={34} layer="back" />
      <BlackHole x={480} y={800} r={34} />
      <AccretionDisk x={480} y={800} shadowR={34} layer="front" />
      <Small x={640} y={1180}>{'knots travel outward'}</Small>
      <Header n={13} title="Jets" note="narrow cones along the spin axis, widening and fading · cool blue-white · traveling knots · switch on with luminosity" />
    </Sequence>

    {/* 14 HOST GALAXY */}
    <Sequence from={PAGE * 13} durationInFrames={PAGE}>
      <Starfield count={220} avoid={[[480, 780, 420]]} warm />
      <HostGalaxy x={480} y={780} rx={410} />
      <Small x={480} y={1150}>{'dim 1 · 260 static stars · warm ivory haze'}</Small>
      <Header n={14} title="Host galaxy" note="stacked soft hazes + stars dense toward the core · `dim` lowers it when the quasar brightens" />
    </Sequence>

    {/* 15 QUASAR — luminosity drives everything */}
    <Sequence from={PAGE * 14} durationInFrames={PAGE}>
      <QuasarSweep />
      <Header n={15} title="Quasar · luminosity 0 → 1" note="disk clips to near-white · corona up to 3× the disk · jets switch on · galaxy and stars nearly vanish" />
    </Sequence>

    {/* 16 INFALLING GAS (brand v2.0: constant motion) */}
    <Sequence from={PAGE * 15} durationInFrames={PAGE}>
      <Starfield count={220} warm />
      <InfallingGas x={480} y={820} shadowR={60} luminosity={0.6} layer="back" />
      <Quasar x={480} y={820} shadowR={60} luminosity={0.6} jets={0} warm />
      <InfallingGas x={480} y={820} shadowR={60} luminosity={0.6} layer="front" />
      <Small x={480} y={1180}>{'streaks wind in faster as they close in · behind the shadow on the far side'}</Small>
      <Header n={16} title="Infalling gas" note="thin streaks spiraling into the disk from outside · deep orange far out, gold at the disk · loop-safe" />
    </Sequence>

    {/* 17 PARALLAX STARS (brand v2.0: depth on hook camera moves) */}
    <Sequence from={PAGE * 16} durationInFrames={PAGE}>
      <ParallaxDemo />
      <Header n={17} title="Parallax stars" note="a star VOLUME for dive-ins and pull-backs · near stars stream past, far ones barely move · stars stay points" />
    </Sequence>

    {/* 18 KINETIC TITLE (brand v2.0: the hook) */}
    <Sequence from={PAGE * 17} durationInFrames={PAGE}>
      <Starfield count={220} clear={[[60, 210, 840, 420]]} warm />
      <KineticTitle x={480} size={92} lines={[[{ w: 'Black', start: 0.3 }, { w: 'holes', start: 0.7 }, { w: 'power', start: 1.27 }], [{ w: 'the', start: 1.67 }, { w: "universe's", start: 1.83 }], [{ w: 'brightest', start: 2.75, gold: true }, { w: 'lights.', start: 3.19 }]]} />
      <Small x={480} y={1150}>{'each word lands on its spoken time · fast rise (EASE.punch) · no bounce'}</Small>
      <Header n={18} title="Kinetic title" note="the hook title arriving word by word with the voice · gold word = keyword style" />
    </Sequence>
    {/* 19 ORBIT OVERLAY (brand §5 visual variety): the solar system at true scale over a black hole */}
    <Sequence from={PAGE * 18} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[60, 1150, 840, 140]]} avoid={[[480, 860, 380]]} warm />
      <BlackHole x={480} y={860} r={330} warm />
      <OrbitOverlay x={480} y={860} pxPerAU={330 / 128} labels={['neptune']} at={10} />
      <Small x={480} y={1220}>{'M87*: horizon ≈ 128 AU · Neptune 30 AU · true scale'}</Small>
      <Header n={19} title="Orbit overlay" note="planet orbits at TRUE relative scale (pxPerAU) laid over another object · orbits draw in, planets at real relative periods" />
    </Sequence>

    {/* 20 COMPARISON BARS */}
    <Sequence from={PAGE * 19} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[60, 260, 860, 520]]} warm />
      <ComparisonBars y={320} at={10} bars={[
        { label: "SUN'S SURFACE", value: 5800, unit: ' K', display: '~5,800 K' },
        { label: 'QUASAR DISK, INNER EDGE', value: 100000, unit: ' K', display: '~100,000 K', hero: true },
      ]} />
      <Small x={480} y={1180}>{'lengths true to the values · one gold hero bar'}</Small>
      <Header n={20} title="Comparison bars" note="2–4 bars fill on the beat, values count up with them · labels in sciText, hero value gold italic" />
    </Sequence>

    {/* 21 METER */}
    <Sequence from={PAGE * 20} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[60, 400, 840, 760]]} warm />
      <Meter value={10} display="~10%" label="MASS TURNED INTO LIGHT" compare={{ value: 0.7, label: 'FUSION 0.7%' }} y={800} at={10} />
      <Small x={480} y={1220}>{'one value vs a full scale · blue tick = reference'}</Small>
      <Header n={21} title="Meter" note="a gauge for ONE value: the gold arc fills on the beat, the value counts up inside" />
    </Sequence>

    {/* 22 TIMELINE */}
    <Sequence from={PAGE * 21} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[60, 240, 860, 1040]]} warm />
      <Timeline range={[0, 13.8]} x={200} y={290} length={880} at={0} events={[
        { t: 0, label: 'Big Bang', date: '13.8 BILLION YEARS AGO', at: 18 },
        { t: 0.67, label: "Farthest quasar's light leaves", date: '~13 BILLION YEARS AGO', at: 38, hero: true },
        { t: 9.2, label: 'Sun and Earth form', date: '4.6 BILLION YEARS AGO', at: 58 },
        { t: 13.8, label: 'Today', at: 78 },
      ]} />
      <Small x={480} y={1220}>{'true positions · close events get a leader line'}</Small>
      <Header n={22} title="Timeline" note="the axis draws in, markers appear on cue (vertical for phones; horizontal for 2–3 short events)" />
    </Sequence>

    {/* 23 BALANCE */}
    <Sequence from={PAGE * 22} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[60, 400, 840, 820]]} warm />
      <Balance y={620} at={6} tipAt={36}
        left={{ label: 'EVERY STAR IN A GALAXY', value: 1, display: '×1', glyph: 'stars' }}
        right={{ label: 'ONE QUASAR', value: 1000, display: 'up to ×1,000', glyph: 'point' }} />
      <Small x={480} y={1240}>{'tips to the heavier total · slow, no overshoot'}</Small>
      <Header n={23} title="Balance" note="two totals weighed against each other · a heap of stars vs one bright point" />
    </Sequence>

    {/* 24 FLOW PATHS */}
    <Sequence from={PAGE * 23} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[60, 300, 860, 160]]} avoid={[[480, 860, 120]]} warm />
      <BlackHole x={480} y={860} r={46} warm />
      <FlowPaths paths={[
        { points: linePath(480, 400, 480, 790), kind: 'ghost', at: 6, len: 26, fadeAt: 46, label: 'STRAIGHT IN?' },
        { points: spiralPath(480, 860, 400, 70, 1.6, 120, -8, 0.35), kind: 'gold', at: 50, len: 60, arrow: true },
      ]} />
      <Small x={480} y={1180}>{'ghost = what does NOT happen · gold = the real path'}</Small>
      <Header n={24} title="Flow paths" note="paths draw in along their direction of travel · spiral and line helpers (spiral matches the disk plane)" />
    </Sequence>

    {/* 25 WHIP TRANSITION (brand §8 hand-off): a hook-style montage, ~1 s per picture */}
    <Sequence from={PAGE * 24} durationInFrames={PAGE}>
      <WhipDemo />
      <Header n={25} title="Whip transition" note="sweep off / sweep in at peak speed · motion blur by speed · bulk 8f · last whip direction up · whoosh peak = whipTiming().swap" />
    </Sequence>

    {/* 26-33: "Why time only moves forward" kit (positions derived from SAFE_RECT, 16:9-ready) */}
    <Sequence from={PAGE * 25} durationInFrames={PAGE}><EggDemo />
      <Header n={26} title="Egg" note="soft shading, no outline · crack 0→1 (gold hairline) · split = cap lifts + shards · split keys 1→0.45→1 = a rewind that stalls" /></Sequence>
    <Sequence from={PAGE * 26} durationInFrames={PAGE}><CupDemo />
      <Header n={27} title="Coffee cup" note="seen from above · spiral = milk poured (center out) · mix 0→1 blends to latte · mix keys 1→0.5→1 = an unmix that stalls" /></Sequence>
    <Sequence from={PAGE * 27} durationInFrames={PAGE}><MorphDemo />
      <Header n={28} title="Gold morph line" note="ONE line, no cuts: crack → spiral → handwriting → dust → point → crack · point-by-point morph (EASE.inOut) · draw + dust dials" /></Sequence>
    <Sequence from={PAGE * 28} durationInFrames={PAGE}><WordDemo />
      <Header n={29} title="Word dissolve" note="write (left → right) · burst into gold dust · re-form that stalls as a faint ghost outline, then scatters" /></Sequence>
    <Sequence from={PAGE * 29} durationInFrames={PAGE}><BoxDemo />
      <Header n={30} title="Particle box" note="gas: grow from a point · divider lifts · 100 particles mix (closed-form, deterministic) · collide: forward then the same clip reversed" /></Sequence>
    <Sequence from={PAGE * 30} durationInFrames={PAGE}><DeckDemo />
      <Header n={31} title="Deck of cards" note="ordered fan (A→K, suits alternate) · two riffle shuffles (real interleave) · gold edge with a running glint" /></Sequence>
    <Sequence from={PAGE * 31} durationInFrames={PAGE}><RescaleDemo />
      <Header n={32} title="Timeline rescale + stars going out" note="linear → LOG SCALE mid-scene: markers glide, t=0 slides off · Starfield offs = bright stars out one by one (~0.5 s each)" /></Sequence>
    <Sequence from={PAGE * 32} durationInFrames={PAGE}>
      <Starfield count={160} clear={[[SAFE_RECT.x, SAFE_RECT.y, SAFE_RECT.w, 520]]} warm />
      <HeroNumber value={10} exponent={30} prefix="1 in" label="ODDS: ALL ONE SIDE" y={SAFE_RECT.y + 120} at={10} />
      <Small x={SAFE_RECT.x + SAFE_RECT.w / 2} y={SAFE_RECT.y + 620}>{'exponent counts up · prefix in gold italic'}</Small>
      <Header n={33} title="Hero number · exponent" note="power-of-ten form for numbers too long in words: base + superscript (the exponent counts up)" /></Sequence>
    {/* 34-37: the dynamism kit, as cut from the MotionDemo composition (that one has the music + SFX) */}
    {([
      [34, 0, 'Living camera + parallax', 'Camera: slow drift + breathing zoom · CameraLayer depth 0.15 / 0.45 / 1 = parallax · pan on the beat'],
      [35, MOTION_DEMO_T.match - 40, 'Shape match cut + punch-in', 'ShapeMatch: the sun becomes the PEAK bar (geometry + radius morph, ease in-out) · punch-in 1 → 1.03, no overshoot'],
      [36, MOTION_DEMO_T.whipSwap - 20, 'Whip + particles form a number', 'ParticleGlyphs: 100 drifting particles condense into 10^30 (5×7 dots) · punch-in when it lands, on the beat'],
      [37, MOTION_DEMO_T.fly - 30, 'Fly-through', 'FlyThrough: wind-up, dive into the "0" (log zoom), motion blur in the fast middle, soft landing in the next scene'],
    ] as const).map(([n, start, title, note]) => (
      <Sequence key={n} from={PAGE * (n - 1)} durationInFrames={PAGE}>
        <Sequence from={-start}><MotionDemo audio={false} /></Sequence>
        <Header n={n} title={title} note={note} />
      </Sequence>
    ))}
    <Sequence from={PAGE * 37} durationInFrames={PAGE}><OdometerDemo />
      <Header n={38} title="Odometer number" note="OdometerNumber: digit wheels, the units roll, higher wheels turn only on the carry · leading zeros hidden · tabular, layout never jumps" /></Sequence>
    <Sequence from={PAGE * 38} durationInFrames={PAGE}><Timeline3DDemo />
      <Header n={39} title="3D timeline flight" note="timeline in CSS perspective: tilts back (rotateX ≤ 22°) while the camera flies along it, motion blur only during the flight, flat again on arrival" /></Sequence>
    <Sequence from={PAGE * 39} durationInFrames={PAGE}><TimeStreamDemo />
      <Header n={40} title="Time stream" note="TimeStream: gold particles flowing one way along a line (time's arrow, a timeline's axis) · own speed + lane each, fade at both ends · motion for sparse scenes" /></Sequence>
    <Sequence from={PAGE * 40} durationInFrames={PAGE}><RaceDemo />
      <Header n={41} title="Race board + spacecraft" note="RaceBoard: rows from one START line, movers at constant speed, value on arrival (one gold), soft flash · rewind back to START (loop) · Spacecraft: generic probe, engine idle/flare, trail" /></Sequence>
    <Sequence from={PAGE * 41} durationInFrames={PAGE}><MoversDemo />
      <Header n={42} title="Runner + car (Race movers)" note="Runner: generic sprinter, poses set → sprint cycle → upright stop → breathing, warm rim light, muted singlet colors · Car: generic profile, turning wheels, headlight idle/flare, trail" /></Sequence>
    <Sequence from={PAGE * 42} durationInFrames={PAGE}><MultiRaceDemo />
      <Header n={43} title="Multi race board + title swap" note="MultiRaceBoard: single lane unfolds into the board · two races on the same lanes (parks behind), values in a right column, gold hand-off, rewind that grows a mover · TitleSwap · SpeedHeader (state change + second line) · ElapsedCounter (lands on each value)" /></Sequence>
    <Sequence from={PAGE * 43} durationInFrames={PAGE}><PaperFoldDemo />
      <Header n={44} title="Paper fold stack" note="PaperFoldStack: edge-on sheet, height = 0.1 mm × 2^n exactly · animated folds (in-plane flap, then toward the camera, alternating like real folding) · layers as hairlines · hScale squeezes only the length in a macro shot" /></Sequence>
    <Sequence from={PAGE * 44} durationInFrames={PAGE}><AscentDemo />
      <Header n={45} title="Altitude ascent" note="AltitudeAscent: one log-paced true-scale climb (side view) · observer + GenericTower (828 m) → curving Earth, AltitudeLine at 100 km, SpaceStation (symbol size) → Earth + Moon at true distance · column tip glows gold" /></Sequence>
    <Sequence from={PAGE * 45} durationInFrames={PAGE}><FieldRibbonDemo />
      <Header n={46} title="Field ribbon" note="FieldRibbon: generic football fields top-down, goal line to goal line, true along the row · track → pull back to all 176 · the ribbon folds 13× into a block (width drawn ≥ 8 px)" /></Sequence>
  </AbsoluteFill>
  </Grain>
);

// ---- pages 26-33 ----------------------------------------------------------------------------
const CX = SAFE_RECT.x + SAFE_RECT.w / 2;
const CY = SAFE_RECT.y + SAFE_RECT.h / 2;
const EggDemo: React.FC = () => {
  const r = SAFE_RECT.w * 0.2;
  return (
    <>
      <Starfield count={160} avoid={[[CX, CY - r * 1.3, r * 1.6], [CX, CY + r * 1.6, r * 1.3]]} warm />
      <Egg x={CX - r * 1.1} y={CY - r * 1.3} r={r * 0.9} wash warm crack={[[10, 0], [34, 1, 'punch']]} />
      <Egg x={CX + r * 1.1} y={CY - r * 1.3} r={r * 0.9} warm crack={1} split={[[10, 0], [26, 1, 'punch']]} seed={8} />
      <Egg x={CX} y={CY + r * 1.6} r={r} warm crack={1} split={[[0, 1], [30, 1], [62, 0.45], [70, 0.45], [96, 1]]} seed={11} />
      <Small x={CX} y={CY + r * 2.75}>{'split 1 → 0.45 → 1: rewind stalls'}</Small>
    </>
  );
};
const CupDemo: React.FC = () => {
  const r = SAFE_RECT.w * 0.17;
  return (
    <>
      <Starfield count={160} avoid={[[CX - r * 1.3, CY - r * 1.4, r * 1.7], [CX + r * 1.3, CY - r * 1.4, r * 1.7], [CX, CY + r * 1.9, r * 1.7]]} warm />
      <CoffeeCup x={CX - r * 1.3} y={CY - r * 1.4} r={r * 0.8} warm swirl={0} spiral={[[10, 0], [50, 1]]} />
      <CoffeeCup x={CX + r * 1.3} y={CY - r * 1.4} r={r * 0.8} warm mix={[[10, 0], [80, 1]]} />
      <CoffeeCup x={CX} y={CY + r * 1.9} r={r} warm wash mix={[[0, 1], [20, 1], [55, 0.5], [65, 0.5], [95, 1]]} />
      <Small x={CX} y={CY + r * 3.75}>{'mix 1 → 0.5 → 1: unmix stalls'}</Small>
    </>
  );
};
const MorphDemo: React.FC = () => {
  const r = SAFE_RECT.w * 0.24;
  const keys = [
    { pts: eggCrackPts(CX, CY, r), at: 0 },
    { pts: cupSpiralPts(CX, CY, r * 0.8), at: 24, len: 14 },
    { pts: morphScribble(CX - r * 1.3, CY + r * 0.2, r * 2.6, r * 0.45), at: 48, len: 14 },
    { pts: morphPoint(CX, CY), at: 90, len: 16 },
    { pts: eggCrackPts(CX, CY, r), at: 106, len: 12 },
  ];
  return (
    <>
      <Starfield count={160} warm />
      <GoldMorphLine keys={keys} draw={[[0, 0.15], [16, 1, 'punch']]} dust={[[66, 0], [78, 1, 'out'], [90, 1], [102, 0]]} />
      <Small x={CX} y={CY + r * 1.6}>{'crack · spiral · handwriting · dust · point · crack'}</Small>
    </>
  );
};
const WordDemo: React.FC = () => (
  <>
    <Starfield count={160} clear={[[SAFE_RECT.x, CY - 160, SAFE_RECT.w, 260]]} warm />
    <WordDissolve text="goodbye" x={CX} y={CY - 120} size={170} write={[[4, 0], [30, 1, 'linear']]} state={[[40, 0], [52, 1, 'out'], [70, 1], [88, 0.22], [96, 0.22], [112, 1]]} />
    <Small x={CX} y={CY + 180}>{'write · burst · re-form stalls (ghost) · scatter'}</Small>
  </>
);
const BoxDemo: React.FC = () => {
  const w = SAFE_RECT.w * 0.86;
  return (
    <>
      <Starfield count={120} clear={[[SAFE_RECT.x, SAFE_RECT.y + 60, SAFE_RECT.w, 1100]]} warm />
      <ParticleBox x={CX} y={SAFE_RECT.y + 340} w={w} h={w * 0.62} releaseAt={44} gather={{ from: [CX - w * 0.25, SAFE_RECT.y + 340], at: 4, len: 26 }} />
      <ParticleBox x={CX} y={SAFE_RECT.y + 930} w={w} h={w * 0.4} mode="collide" box={0}
        clock={[[0, 0], [52, 1, 'linear'], [62, 1], [114, 0, 'linear']]} />
      <Small x={CX} y={SAFE_RECT.y + 1110}>{'collide: forward (0-52) · reversed (62-114)'}</Small>
    </>
  );
};
const DeckDemo: React.FC = () => (
  <>
    <Starfield count={160} warm />
    <DeckOfCards x={CX} y={CY + 380} riffles={[24, 72]} edge={[[0, 1]]} warm />
    <Small x={CX} y={CY + 470}>{'riffles at f24 and f72'}</Small>
  </>
);
const RescaleDemo: React.FC = () => (
  <>
    <Starfield count={220} bright={10} offs={[50, 62, 74, 86, 98]} warm />
    <Timeline x={SAFE_RECT.x + 140} y={SAFE_RECT.y + 80} length={880} warm range={[0, 13.8e9]}
      rescale={{ at: 30, len: 40, range: [13.8e9, 1e100], log: true }}
      events={[
        { t: 0, label: 'Big Bang', date: 'LOWEST ENTROPY', at: -100, hero: true },
        { t: 13.8e9, label: 'Today', date: '13.8 BILLION YEARS', at: -100 },
        { t: 1e14, label: 'Last stars fade', date: '100 TRILLION YEARS', at: 70 },
        { t: 1e100, label: 'Black holes evaporate', date: 'UP TO A GOOGOL YEARS', at: 90 },
      ]} labelSize={44} />
  </>
);

// page 25: positions derived from the safe rectangle (16:9-ready layout rule)
const WHIP_AT = [26, 56, 86];
const WhipDemo: React.FC = () => {
  const cx = SAFE_RECT.x + SAFE_RECT.w / 2;
  const cy = SAFE_RECT.y + SAFE_RECT.h / 2;
  const r = SAFE_RECT.w * 0.24;
  const label = (text: string) => <Small x={cx} y={cy + r * 1.5}>{text}</Small>;
  const items = [
    <><Starfield count={200} seed={11} avoid={[[cx, cy, r * 1.4]]} warm /><GlowingBody x={cx} y={cy} r={r} kind="sun" warm />{label('the Sun')}</>,
    <><Starfield count={200} seed={22} avoid={[[cx, cy, r * 1.2]]} warm /><Planet x={cx} y={cy} r={r * 0.8} kind="earth" wash warm />{label('Earth')}</>,
    <><Starfield count={200} seed={33} avoid={[[cx, cy, r * 1.6]]} warm /><Planet x={cx} y={cy} r={r * 0.55} kind="saturn" warm />{label('Saturn')}</>,
    <><Starfield count={200} seed={44} avoid={[[cx, cy, r * 1.2]]} warm /><BlackHole x={cx} y={cy} r={r * 0.6} warm />{label('a black hole')}</>,
  ];
  return (
    <>
      <WhipMontage items={items} at={WHIP_AT} direction={['left', 'left', 'up']} />
      <Small x={cx} y={SAFE_RECT.y + SAFE_RECT.h - 40}>{`swaps (whoosh peaks) at f ${WHIP_AT.map((a) => whipTiming(a).swap).join(', ')}`}</Small>
    </>
  );
};

const ParallaxDemo: React.FC = () => {
  const f = useCurrentFrame();
  // dive in from far away, then pull back out
  const k = Math.exp(interpolate(f, [10, 55, 70, 115], [Math.log(0.06), 0, 0, Math.log(0.06)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.punch }));
  const d = 1 / k;
  return (
    <>
      <ParallaxStars dist={d} cx={480} cy={820} z={[40, 150]} />
      <ParallaxStars dist={d} cx={480} cy={820} z={[-16, -0.3]} fillAt={1 / 0.06} count={150} bright={14} seed={33} />
      <Small x={480} y={1180}>{`camera distance ${d.toFixed(1)} (1 = rest framing)`}</Small>
    </>
  );
};

const OdometerDemo: React.FC = () => (
  <>
    <Starfield count={160} warm />
    <Small x={CX} y={SAFE_RECT.y + 150}>{'0 → 90 %, ease-out'}</Small>
    <OdometerNumber x={CX} y={SAFE_RECT.y + 230} size={170} digits={2} prefix="−" suffix="%" align="center" value={[[15, 0], [55, 90, 'out']]} />
    <Small x={CX} y={SAFE_RECT.y + 560}>{'0 → 13,800: wheels carry'}</Small>
    <OdometerNumber x={CX} y={SAFE_RECT.y + 640} size={120} digits={5} align="center" color="ivory" value={[[30, 0], [100, 13800, 'out']]} />
  </>
);

const Timeline3DDemo: React.FC = () => {
  const f = useCurrentFrame();
  const tilt = interpolate(f, [15, 50, 85], [0, 22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut });
  const shift = interpolate(f, [15, 85], [0, -380], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.inOut });
  const y0 = SAFE_RECT.y + 120;
  return (
    <Camera blur={[[30, 70]]}>
      <CameraLayer depth={0.2}><Starfield count={220} warm /></CameraLayer>
      <CameraLayer depth={1}>
        <AbsoluteFill style={{ perspective: '1600px', perspectiveOrigin: `${CX}px ${y0}px` }}>
          <AbsoluteFill style={{ transform: `translateY(${shift}px) rotateX(${tilt}deg)`, transformOrigin: `${CX}px ${y0 - shift}px` }}>
            <Timeline x={SAFE_RECT.x + 140} y={y0 + 40} length={900} range={[0, 13.8e9]} labelSize={44} warm
              events={[
                { t: 0, label: 'Big Bang', date: 'LOWEST ENTROPY', at: -100, hero: true },
                { t: 4.6e9, label: 'Halfway', date: '4.6 BILLION YEARS', at: -100 },
                { t: 13.8e9, label: 'Today', date: '13.8 BILLION YEARS', at: -100 },
              ]} />
          </AbsoluteFill>
        </AbsoluteFill>
      </CameraLayer>
    </Camera>
  );
};

const TimeStreamDemo: React.FC = () => (
  <>
    <Starfield count={160} warm />
    <Small x={CX} y={SAFE_RECT.y + 120}>{"along time's arrow (horizontal, wide lane)"}</Small>
    <TimeStream x0={SAFE_RECT.x + 60} y0={SAFE_RECT.y + 260} x1={SAFE_RECT.x + SAFE_RECT.w - 60} y1={SAFE_RECT.y + 260} from={0.1} to={3.6} n={80} spread={56} dot={7} seed={3} />
    <Small x={CX} y={SAFE_RECT.y + 420}>{"down a timeline's axis (vertical, narrow lane)"}</Small>
    <TimeStream x0={CX} y0={SAFE_RECT.y + 480} x1={CX} y1={SAFE_RECT.y + SAFE_RECT.h - 80} from={0.1} to={3.6} n={110} speed={300} spread={22} dot={6} seed={5} />
  </>
);

const RaceDemo: React.FC = () => (
  <AbsoluteFill>
    <Starfield count={120} warm />
    <RaceBoard
      rows={[
        { label: 'EARTH → MOON', dest: 'moon', value: '7 hours', arrive: 30 },
        { label: 'EARTH → MARS', dest: 'mars', value: '39 days', arrive: 52 },
        { label: 'EARTH → JUPITER', dest: 'jupiter', value: '14 months', arrive: 78, gold: true },
      ]}
      depart={10}
      gap={180}
      top={SAFE_RECT.y + 200}
      rule={'AT 36,000 MPH · STRAIGHT LINE\nCLOSEST DISTANCE'}
      valuesOut={92}
      rewind={{ at: 95, len: 22 }}
      moverLength={66}
      destR={30}
      warm
    />
  </AbsoluteFill>
);

const MoversDemo: React.FC = () => {
  const f = useCurrentFrame();
  const y1 = SAFE_RECT.y + 330;
  const y2 = SAFE_RECT.y + 700;
  const y3 = SAFE_RECT.y + 1000;
  return (
    <AbsoluteFill>
      <Starfield count={120} warm />
      <Small x={CX} y={y1 - 230}>{'set · sprint · stop · breathing (hook size 110 px)'}</Small>
      <Runner x={SAFE_RECT.x + 110} y={y1} h={110} set={1} />
      <Runner x={SAFE_RECT.x + 330} y={y1} h={110} run={1} phase={(f / 30) * 2.4 * Math.PI * 2} />
      <Runner x={SAFE_RECT.x + 560} y={y1} h={110} />
      <Runner x={SAFE_RECT.x + 760} y={y1} h={110} breath={0.5 + 0.5 * Math.sin(f / 14)} />
      <Small x={CX} y={y2 - 140}>{'board size (40 px), running'}</Small>
      {[0, 1, 2, 3].map((k) => (
        <Runner key={k} x={SAFE_RECT.x + 140 + k * 180} y={y2} h={40} run={1} phase={(f / 30) * 2.2 * Math.PI * 2 + k} />
      ))}
      <Small x={CX} y={y3 - 120}>{'car: idle → departure (wheels, headlight, trail)'}</Small>
      <Car x={SAFE_RECT.x + 200} y={y3} length={92} light={0.25} />
      <Car x={SAFE_RECT.x + 600} y={y3} length={92} light={1} trail={1} turn={f * 0.4} />
    </AbsoluteFill>
  );
};

const MultiRaceDemo: React.FC = () => (
  <AbsoluteFill>
    <Starfield count={120} warm />
    <TitleSwap states={[{ at: 0, lines: [[{ w: 'By' }, { w: 'car?', gold: true }]] }, { at: 62, lines: [[{ w: 'And' }, { w: 'running?', gold: true }]] }]} top={SAFE_RECT.y + 20} />
    <SpeedHeader states={[{ at: 0, label: 'A CAR ON CRUISE CONTROL', value: '60 mph' }]} y={SAFE_RECT.y + 150} sub={{ text: "USAIN BOLT'S TOP SPEED · 27.8 MPH", in: 62 }} />
    <ElapsedCounter marks={[[16, 0], [34, 45], [48, 700], [58, 5100], [64, 5100], [65, 0], [68, 0], [80, 97], [92, 1500], [104, 11000]]} label="YEARS PASSED" y={SAFE_RECT.y + 330} opacity={[[10, 0], [16, 1], [60, 1], [64, 0], [66, 0], [68, 1]]} />
    <MultiRaceBoard
      rows={[{ label: 'EARTH → VENUS', dest: 'venus' }, { label: 'EARTH → JUPITER', dest: 'jupiter' }, { label: 'EARTH → NEPTUNE', dest: 'neptune' }]}
      races={[
        { mover: 'car', size: 46, depart: 16, arrive: [34, 48, 58], values: ['45 YEARS', '700 YEARS', '5,100 YEARS'], valuePos: 'above', gold: 2, goldOff: 104, appear: { at: 6, len: 8 }, glow: [[64, 1], [76, 0]] },
        { mover: 'runner', size: 40, depart: 68, arrive: [80, 92, 104], values: ['97 YEARS', '1,500 YEARS', '11,000 YEARS'], valuePos: 'below', valueSize: 34, valueOpacity: 0.75, gold: 2, appear: { at: 62, len: 6 }, parkBehind: 0 },
      ]}
      top={SAFE_RECT.y + 520}
      gap={130}
      destX={SAFE_RECT.x + SAFE_RECT.w - 264}
      valueSide="right"
      fold={[[0, 1], [12, 0, 'inOut']]}
      rowsIn={{ at: 8, len: 8 }}
      rule={'STRAIGHT LINE · STEADY SPEED'}
    />
  </AbsoluteFill>
);

export default ComponentGallery;
