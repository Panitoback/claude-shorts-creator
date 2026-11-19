import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CANVAS, PALETTE, SAFE_RECT } from '../../brand';
import { Camera, CameraLayer, Grain, KeywordCaptions, RaceBoard, Starfield } from '../../components';
import type { RaceRow } from '../../components';
import { VO } from './vo.gen';

// "How Long to Fly to Every Planet?" — shorts/spacecraft-to-every-planet/guion.md. FORMAT: Race
// (PROJECT_CONTEXT v0.18.0 §4): one continuous scene, HOOK / RACE / LOOP, no punch-ins, no hook hit.
// VOICE-FIRST: departure on the spoken word "planet"; arrivals paced for watching (gaps grow ~1.6 → 3 s,
// order true, gaps not to scale); the closing line plays over the full board; then the values fade and
// every ship glides back to the START line, so the last frame matches frame 0.
// Layout from SAFE_RECT (16:9-ready).

const FPS = CANVAS.FPS;
const F = (s: number) => Math.round(s * FPS);
const T = (line: number, word: number) => VO[line].words![word].start;

const DEPART = F(T(0, 6)); // "spacecraft?"
const ARRIVE_S = [4.4, 6.0, 7.6, 9.6, 11.8, 14.4, 17.4]; // beats.json race.rows
const LINE2_END = F(VO[1].end);
const VALUES_OUT = LINE2_END + 5;
const REWIND = { at: VALUES_OUT + 3, len: 39 };
const TOTAL = REWIND.at + REWIND.len + 15; // ~0.5 s still, identical to frame 0

// durationInSeconds = TOTAL / 30 (literal: gen-registry reads numbers only). TOTAL = 763 frames.
export const compositionConfig = { id: 'SpacecraftToEveryPlanet', durationInSeconds: 25.433, fps: 30, width: 1080, height: 1920 };

const ROWS: RaceRow[] = [
  { label: 'EARTH → VENUS', dest: 'venus', value: '27 days', arrive: F(ARRIVE_S[0]) },
  { label: 'EARTH → MARS', dest: 'mars', value: '39 days', arrive: F(ARRIVE_S[1]) },
  { label: 'EARTH → MERCURY', dest: 'mercury', value: '55 days', arrive: F(ARRIVE_S[2]) },
  { label: 'EARTH → JUPITER', dest: 'jupiter', value: '14 months', arrive: F(ARRIVE_S[3]) },
  { label: 'EARTH → SATURN', dest: 'saturn', value: '2.3 years', arrive: F(ARRIVE_S[4]) },
  { label: 'EARTH → URANUS', dest: 'uranus', value: '5 years', arrive: F(ARRIVE_S[5]) },
  { label: 'EARTH → NEPTUNE', dest: 'neptune', value: '8.4 years', arrive: F(ARRIVE_S[6]), gold: true },
];

const HEADER_Y = SAFE_RECT.y + 26; // stays inside the safe top under the 1.02 camera push
const TOP = SAFE_RECT.y + 262; // room for the speed header above the board
const GAP = 114;
const LAST_LANE = TOP + GAP * (ROWS.length - 1);

// stars kept off the text bands (row labels + values) and the rule / caption area
const CLEAR: [number, number, number, number][] = [
  ...ROWS.map((_, i) => [SAFE_RECT.x - 20, TOP + i * GAP - 82, SAFE_RECT.w + 40, 64] as [number, number, number, number]),
  [140, LAST_LANE + 40, 800, 400],
  [140, SAFE_RECT.y - 10, 800, 160], // speed header
];

export const SpacecraftToEveryPlanet: React.FC = () => (
  <Grain>
    <AbsoluteFill style={{ backgroundColor: PALETTE.space }}>
      <Starfield count={170} bright={8} seed={23} clear={CLEAR} opacity={0.8} warm />
      <Camera
        drift={6}
        driftAmp={[[0, 0], [45, 1], [REWIND.at, 1], [TOTAL - 15, 0]]}
        zoom={[[DEPART, 1], [ROWS[6].arrive + 30, 1.02, 'inOut'], [REWIND.at, 1.02], [REWIND.at + REWIND.len, 1, 'inOut']]}
      >
        <CameraLayer depth={1}>
          <RaceBoard
            rows={ROWS}
            depart={DEPART}
            top={TOP}
            gap={GAP}
            header={{ label: "NEW HORIZONS' LAUNCH SPEED", value: '36,000 mph' }}
            headerY={HEADER_Y}
            rule="STRAIGHT LINE · CLOSEST DISTANCE"
            moverLength={66}
            destR={30}
            originR={15}
            valuesOut={VALUES_OUT}
            rewind={REWIND}
            warm
          />
        </CameraLayer>
      </Camera>
      <KeywordCaptions lines={VO} keywords={['spacecraft', 'Jupiter']} maxWords={3} />
    </AbsoluteFill>
  </Grain>
);

export default SpacecraftToEveryPlanet;
