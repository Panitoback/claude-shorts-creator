// Safe-zone debug overlay (brand/brand.md §9). Never part of a final render: Root mounts it over
// every composition only when the `safeOverlay` prop is true (Studio props panel, or
// `--safe` on scripts/frames.mjs and scripts/render-all.mjs).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CANVAS, CAPTION, SAFE } from '../brand';

const zone = 'rgba(255,60,60,0.22)';
const edge = '2px dashed rgba(255,90,90,0.9)';
const tag: React.CSSProperties = {
  position: 'absolute', fontFamily: 'monospace', fontSize: 22, color: '#ff8080', letterSpacing: 1,
};

export const SafeZoneOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 9999 }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SAFE.top, background: zone }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: SAFE.bottom, background: zone }} />
    <div style={{ position: 'absolute', top: SAFE.top, bottom: SAFE.bottom, right: 0, width: SAFE.right, background: zone }} />
    <div style={{ position: 'absolute', top: SAFE.top, bottom: SAFE.bottom, left: 0, width: SAFE.left, background: zone }} />
    {/* the safe rectangle */}
    <div style={{ position: 'absolute', top: SAFE.top, left: SAFE.left, right: SAFE.right, bottom: SAFE.bottom, border: edge }} />
    {/* caption lane: symmetric around the center so it never touches the right rail */}
    <div
      style={{
        position: 'absolute', left: (CANVAS.W - CAPTION.maxWidth) / 2, width: CAPTION.maxWidth,
        top: CAPTION.centerY - 70, height: 140, border: '2px dotted rgba(255,213,138,0.9)',
      }}
    />
    <div style={{ ...tag, top: SAFE.top - 34, left: SAFE.left + 8 }}>SAFE TOP {SAFE.top}px · platform tabs</div>
    <div style={{ ...tag, top: CANVAS.H - SAFE.bottom + 12, left: SAFE.left + 8 }}>SAFE BOTTOM {SAFE.bottom}px · handle, title, description</div>
    <div style={{ ...tag, top: SAFE.top + 12, right: 8, width: SAFE.right - 16, textAlign: 'right' }}>RIGHT {SAFE.right}px · margin (rail ignored, v2.7)</div>
    <div style={{ ...tag, top: CAPTION.centerY - 66, left: (CANVAS.W - CAPTION.maxWidth) / 2 + 8, color: '#ffd58a', fontSize: 18 }}>CAPTION LANE</div>
  </AbsoluteFill>
);
