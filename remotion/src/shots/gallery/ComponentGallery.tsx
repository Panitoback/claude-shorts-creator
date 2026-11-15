import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { PALETTE, TYPE } from '../../brand';
import {
  CaptionLine, DataLabel, GlowingBody, Grain, HeroNumber, KeywordCaptions, Marker, Planet, ScaleBar, ScaleComparison, Starfield,
} from '../../components';
import { PlanetKind } from '../../brand';

// COMPONENT GALLERY — every base-kit component with its main options, one page each (4 s).
// For review only, not channel content. Page titles sit in the TOP UNSAFE MARGIN on purpose
// (debug labels), so everything inside the safe rectangle is the component itself.
// QA: node scripts/frames.mjs ComponentGallery 110,230,... --scale=0.5 [--safe]
const PAGE = 120;

export const compositionConfig = {
  id: 'ComponentGallery',
  durationInSeconds: 40, // 10 pages × PAGE frames
  fps: 30,
  width: 1080,
  height: 1920,
};

const Header: React.FC<{ n: number; title: string; note: string }> = ({ n, title, note }) => (
  <div style={{ position: 'absolute', top: 70, left: 60, right: 180 }}>
    <div style={{ ...TYPE.annotation, color: PALETTE.gold, fontSize: 24 }}>{`${n} / 10 · ${title}`}</div>
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

export const ComponentGallery: React.FC = () => (
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
      <Starfield count={200} clear={[[60, 210, 840, 520], [60, 900, 840, 420]]} warm />
      <HeroNumber value={1.3} unit="million" subject="Earths" label="By volume" />
      <HeroNumber value={299792} grouping unit="km/s" subject="the speed of light" y={960} scale={0.55} at={30} />
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
    <Grain />
  </AbsoluteFill>
);

export default ComponentGallery;
