import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SkyPreset } from '../brand';
import { skyToScreen, sunRadiusPx, moonRadiusPx } from '../lib/groundSky';
import { kf, Keys } from './anim';
import { Horizon, horizonLayers, HorizonLayer, HorizonVariant } from './Horizon';
import { SkyBody } from './SkyBody';
import { SkyView } from './SkyView';

// GROUND SCENE (brand §11) — ready-made ground views, all at TRUE apparent size for their fov:
//   'sunsetSea'     : the Sun setting on a sea horizon, dusk sky with a soft glow, a broken
//                     reflection path on the water
//   'moonriseHills' : a full Moon rising over dark hills in the blue hour (the hills pushed far
//                     enough away that the fov is honest optics, see Horizon)
// `el` keys move the body (rising / setting). fov 60 = wide (the disc is ~9 px, honest and small);
// fov 2–8 = telephoto (a big disc over a distant horizon, still honest). Extra layers via children
// (drawn between the sky body and the horizon, e.g. an Observer goes after the horizon instead).
export type GroundScenePreset = 'sunsetSea' | 'moonriseHills';
export type GroundSceneProps = {
  preset: GroundScenePreset;
  horizonY: number;
  fov?: number; // default 8 (moderate telephoto)
  az?: Keys; // body azimuth, degrees from frame center (default 0)
  el?: Keys; // body elevation, degrees (default: just above the horizon)
  sky?: SkyPreset; // override the preset's sky
  to?: SkyPreset;
  mix?: Keys;
  layers?: HorizonLayer[]; // override the horizon
  variant?: HorizonVariant;
  tilt?: Keys;
  colorFov?: number; // see SkyView
  children?: React.ReactNode; // drawn above everything (observer, captions, annotations)
};

export const GroundScene: React.FC<GroundSceneProps> = ({ preset, horizonY, fov = 8, az = 0, el, sky, to, mix, layers, variant, tilt = 0, colorFov, children }) => {
  const f = useCurrentFrame();
  const sunset = preset === 'sunsetSea';
  const e = el ?? (sunset ? 0.45 : 0.6);
  const skyP: SkyPreset = sky ?? (sunset ? 'dusk' : 'twilight');
  const [bx] = skyToScreen(kf(f, az, 0), kf(f, e, 0), { fov, tilt: kf(f, tilt, 0), horizonY });
  const r = sunset ? sunRadiusPx(fov) : moonRadiusPx(fov);
  const hv: HorizonVariant = variant ?? (sunset ? 'sea' : 'hills');
  const L = layers ?? (sunset ? [{ variant: 'sea' as const, distance: 1e9 }] : horizonLayers(hv, fov));
  return (
    <>
      <SkyView sky={skyP} to={to} mix={mix} fov={fov} tilt={tilt} horizonY={horizonY} colorFov={colorFov}
        glow={sunset ? { az: kf(f, az, 0), el: kf(f, e, 0), strength: 1, radiusDeg: Math.min(18, fov * 0.9) } : undefined} />
      <SkyBody kind={sunset ? 'sun' : 'moon'} az={az} el={e} fov={fov} tilt={tilt} horizonY={horizonY} phase={1} light={sunset ? 225 : 250} />
      <Horizon layers={L} fov={fov} tilt={tilt} horizonY={horizonY} sky={skyP} to={to} mix={mix}
        reflect={sunset ? { x: bx, r: Math.max(r, 5), color: '#e5a066' } : undefined} />
      {children}
    </>
  );
};
