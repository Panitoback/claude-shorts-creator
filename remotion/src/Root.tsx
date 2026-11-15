import React from 'react';
import { Composition, getInputProps } from 'remotion';
import { shots } from './registry.gen';
import { SafeZoneOverlay } from './lib/safezone';

// Every shot file exports `compositionConfig` + a default component. gen-registry.mjs
// discovers them into registry.gen. This maps each to a <Composition>.
// `safeOverlay` (default false) mounts the safe-zone debug overlay on top of any shot:
// toggle it in the Studio props panel, or pass --safe to frames.mjs / render-all.mjs.
type OverlayProps = { safeOverlay?: boolean };

const withOverlay = (Comp: React.FC): React.FC<OverlayProps> => {
  const Wrapped: React.FC<OverlayProps> = ({ safeOverlay }) => {
    const on = safeOverlay || (getInputProps() as OverlayProps).safeOverlay;
    return (
      <>
        <Comp />
        {on ? <SafeZoneOverlay /> : null}
      </>
    );
  };
  return Wrapped;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {shots.map(({ Comp, config }) => (
        <Composition
          key={config.id}
          id={config.id}
          component={withOverlay(Comp as React.FC)}
          defaultProps={{ safeOverlay: false }}
          durationInFrames={Math.max(1, Math.round(config.durationInSeconds * config.fps))}
          fps={config.fps}
          width={config.width}
          height={config.height}
        />
      ))}
    </>
  );
};
