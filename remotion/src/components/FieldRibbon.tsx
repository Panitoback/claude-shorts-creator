import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CANVAS, PALETTE } from '../brand';
import { kf, Keys } from './anim';

// FIELD RIBBON — a long row of generic football fields seen from straight above (muted green tiles,
// white yard lines every 10 yards, thicker goal lines; no logos, no numbers, no team colors), laid
// end to end, goal line to goal line, running DOWN the frame, with a thin ivory ribbon (toilet paper)
// unrolling along it. The ribbon can then fold onto itself again and again (`folds`): each fold halves
// its length around its middle and stacks the layers brighter, until it is one small block.
// True to scale ALONG its length (a field is 100 yd; the ribbon's real length in yards); its WIDTH is
// drawn at least `ribbonMinPx` so it stays visible (a 4.5-inch strip is far below a pixel at row
// scale). The camera is two dials: `fieldPx` (px per 100-yd field) and `center` (which point of the
// row, in fields from its start, sits at `cy`): a track along the row, a pull-back to the whole row.
export type FieldRibbonProps = {
  cx?: number; // row center x (default canvas center)
  cy: number; // screen y where `center` sits
  fields: number; // how many fields in the row (e.g. 176)
  fieldPx: Keys; // px per field (100 yd)
  center: Keys; // row position at cy, in fields from the row's start
  ribbonYd: number; // ribbon length, yards (e.g. 17,600 for 10 miles)
  unroll?: Keys; // 0..1 how much of the ribbon is laid out (default 1)
  folds?: Keys; // fold count (default 0); the ribbon shrinks around its middle
  ribbonMinPx?: number; // default 6
  ribbonInch?: number; // real ribbon width (default 4.5 in)
  rowMinPx?: number; // the row is never drawn narrower than this (width is not a measurement; default 0)
  opacity?: Keys;
};

const GRASS = '#2f4733';
const GRASS2 = '#33503a';

export const FieldRibbon: React.FC<FieldRibbonProps> = ({
  cx = CANVAS.W / 2, cy, fields, fieldPx, center, ribbonYd, unroll = 1, folds = 0, ribbonMinPx = 6, ribbonInch = 4.5, rowMinPx = 0, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const op = kf(f, opacity, 1);
  if (op <= 0.001) return null;
  const P = kf(f, fieldPx, 400);
  const C = kf(f, center, 0);
  const u = kf(f, unroll, 1);
  const nf = Math.max(0, kf(f, folds, 0));
  const yOf = (fieldPos: number) => cy + (fieldPos - C) * P; // field units → screen y
  const W = Math.max(rowMinPx, P * (53.33 / 100)); // field width
  const rowTop = yOf(0);
  const rowBot = yOf(fields);
  const y0 = Math.max(-20, rowTop);
  const y1 = Math.min(CANVAS.H + 20, rowBot);
  const tiles: React.ReactNode[] = [];
  if (y1 > y0) {
    tiles.push(<rect key="row" x={cx - W / 2} y={y0} width={Math.max(2, W)} height={y1 - y0} fill={GRASS} />);
    const first = Math.max(0, Math.floor((y0 - rowTop) / P));
    const last = Math.min(fields - 1, Math.ceil((y1 - rowTop) / P));
    if (P >= 6 && last - first < 400) {
      for (let i = first; i <= last; i++) {
        const ty = yOf(i);
        // mowing stripes every 10 yd + yard lines (fade in as the field grows on screen)
        const detail = Math.min(1, Math.max(0, (P - 60) / 200));
        for (let s = 0; s < 10; s++) {
          if (s % 2 === 1 && detail > 0) tiles.push(<rect key={`s${i}-${s}`} x={cx - W / 2} y={ty + (s * P) / 10} width={W} height={P / 10} fill={GRASS2} opacity={detail} />);
          if (s > 0 && detail > 0) tiles.push(<line key={`y${i}-${s}`} x1={cx - W / 2} x2={cx + W / 2} y1={ty + (s * P) / 10} y2={ty + (s * P) / 10} stroke="#f4f1ea" strokeOpacity={0.5 * detail} strokeWidth={Math.min(3, Math.max(1, P / 300))} />);
        }
        // goal line between fields
        tiles.push(<line key={`g${i}`} x1={cx - W / 2} x2={cx + W / 2} y1={ty} y2={ty} stroke="#f4f1ea" strokeOpacity={Math.min(0.85, 0.15 + P / 120)} strokeWidth={Math.min(6, Math.max(1, P / 150))} />);
      }
      if (P > 60) {
        const sw = Math.min(6, Math.max(1.5, P / 200));
        tiles.push(<line key="sl" x1={cx - W / 2} x2={cx - W / 2} y1={y0} y2={y1} stroke="#f4f1ea" strokeOpacity={0.7} strokeWidth={sw} />);
        tiles.push(<line key="sr" x1={cx + W / 2} x2={cx + W / 2} y1={y0} y2={y1} stroke="#f4f1ea" strokeOpacity={0.7} strokeWidth={sw} />);
      }
    }
  }
  // the ribbon: unrolls from the row's start, then folds toward its middle
  const lenF = (ribbonYd / 100) * u; // fields
  const mid = lenF / 2;
  const cur = lenF / 2 ** nf;
  const ra = yOf(mid - cur / 2);
  const rb = yOf(mid + cur / 2);
  const layers = 2 ** nf;
  const rw = Math.max(ribbonMinPx, (ribbonInch / 36 / 100) * P) * (1 + Math.min(1.6, nf * 0.12));
  const bright = Math.min(1, 0.82 + nf * 0.02);
  const ya = Math.max(-20, ra);
  const yb = Math.min(CANVAS.H + 20, Math.max(rb, ra + 2));
  return (
    <svg width={CANVAS.W} height={CANVAS.H} style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      {tiles}
      {u > 0 && yb > ya && (
        <>
          <rect x={cx - rw / 2 + 2} y={ya + 3} width={rw} height={yb - ya} fill="#000" opacity={0.25} />
          <rect x={cx - rw / 2} y={ya} width={rw} height={yb - ya} fill={PALETTE.ivory} opacity={bright} rx={layers > 8 ? 3 : 0} />
          {nf > 0.5 && <rect x={cx - rw / 2} y={ya} width={rw} height={yb - ya} fill="none" stroke="#c9bfae" strokeWidth={1.5} rx={layers > 8 ? 3 : 0} />}
        </>
      )}
    </svg>
  );
};
