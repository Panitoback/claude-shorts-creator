import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION, PALETTE, TYPE } from '../brand';
import { ramp } from './anim';

// CAPTION WITH KEYWORD (brand §4) — the caption lane: short phrases (≤4 words), each word brightens
// as it is spoken, KEYWORD words turn gold italic with a small pop. Block centered at y1350,
// max 720 px wide, symmetric — never in the bottom UI zone or the right rail.
//
// Lines come straight from beats.json (gen_voice.py output). When a line has a `tts` field
// (the spoken spelling, e.g. "ay-ree-SEE-boh"), its word timestamps belong to the TTS words —
// this component shows the `text` words instead, mapped onto the TTS timeline by character
// position, so captions always read as written.

export type CaptionWord = { w: string; start: number; end: number };
export type CaptionLine = { text: string; tts?: string; start: number; end: number; words?: CaptionWord[] };

export type KeywordCaptionsProps = {
  lines: CaptionLine[];
  keywords?: string[]; // verbatim words/phrases from the script's KEYWORD field (case/punctuation-insensitive)
  offsetSec?: number; // subtract from all times (when placed inside a Sequence that starts later)
  y?: number; // block center (default CAPTION.centerY)
  maxWords?: number; // default CAPTION.maxWords (4)
  maxChars?: number; // soft cap per phrase (default 22) — long words make shorter phrases
  holdSec?: number; // keep the last phrase of a line this long after it ends (default 0.35)
};

// letters/digits only — used to measure word length for timing
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
// keyword matching: ignore case and SURROUNDING punctuation only ("Sun" = "Sun." = "sun," = "“Sun”"),
// inner punctuation stays significant ("km/s" ≠ "kms", "it's" ≠ "its").
export const keyNorm = (s: string) => s.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const splitWords = (s: string) => s.split(/\s+/).filter(Boolean);

// Estimated timing when there is no alignment: spread the window weighted by word length.
const estimate = (words: string[], start: number, end: number): CaptionWord[] => {
  const wt = words.map((w) => Math.max(2, norm(w).length) + 1.6);
  const tot = wt.reduce((a, b) => a + b, 0) || 1;
  let t = start;
  return words.map((w, i) => {
    const d = ((end - start) * wt[i]) / tot;
    const out = { w, start: t, end: t + d };
    t += d;
    return out;
  });
};

// Show `text` words on the timeline of the spoken (tts) words, matched by relative character position.
export const mapTextOntoTts = (text: string, timed: CaptionWord[]): CaptionWord[] => {
  const words = splitWords(text);
  if (timed.length === 0 || words.length === 0) return [];
  const tLen = timed.map((w) => Math.max(1, norm(w.w).length));
  const tTot = tLen.reduce((a, b) => a + b, 0);
  // knots: (fraction of spoken characters, time)
  const knots: [number, number][] = [[0, timed[0].start]];
  let acc = 0;
  timed.forEach((w, i) => {
    const a = acc / tTot;
    acc += tLen[i];
    const b = acc / tTot;
    if (a > knots[knots.length - 1][0]) knots.push([a, w.start]);
    knots.push([b, w.end]);
  });
  const timeAt = (fr: number) => {
    for (let k = 1; k < knots.length; k++) {
      const [f0, t0] = knots[k - 1];
      const [f1, t1] = knots[k];
      if (fr <= f1) return f1 === f0 ? t1 : t0 + ((fr - f0) / (f1 - f0)) * (t1 - t0);
    }
    return knots[knots.length - 1][1];
  };
  const wLen = words.map((w) => Math.max(1, norm(w).length));
  const wTot = wLen.reduce((a, b) => a + b, 0);
  let c = 0;
  return words.map((w, i) => {
    const s = timeAt(c / wTot);
    c += wLen[i];
    return { w, start: s, end: timeAt(c / wTot) };
  });
};

const wordsOf = (line: CaptionLine): CaptionWord[] => {
  const has = line.words && line.words.length > 0;
  if (line.tts && line.tts !== line.text) {
    return mapTextOntoTts(line.text, has ? line.words! : estimate(splitWords(line.tts), line.start, line.end));
  }
  return has ? line.words! : estimate(splitWords(line.text), line.start, line.end);
};

type Phrase = { words: (CaptionWord & { key: boolean })[]; start: number; end: number };

const phrasesOf = (lines: CaptionLine[], keywords: string[], maxWords: number, maxChars: number, holdSec: number) => {
  const keys = keywords.map((k) => splitWords(k).map(keyNorm).filter(Boolean)).filter((k) => k.length > 0);
  const out: Phrase[] = [];
  lines.forEach((line) => {
    const firstOfLine = out.length;
    const ws = wordsOf(line);
    const n = ws.map((w) => keyNorm(w.w));
    const isKey = ws.map(() => false);
    keys.forEach((k) => {
      for (let i = 0; i + k.length <= n.length; i++) {
        if (k.every((p, j) => n[i + j] === p)) for (let j = 0; j < k.length; j++) isKey[i + j] = true;
      }
    });
    let cur: Phrase['words'] = [];
    let chars = 0;
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
      chars = 0;
    };
    ws.forEach((w, i) => {
      const len = w.w.length + (cur.length ? 1 : 0);
      if (cur.length >= maxWords || (cur.length > 0 && chars + len > maxChars)) flush();
      cur.push({ ...w, key: isKey[i] });
      chars += len;
      if (/[.!?;:]$/.test(w.w)) flush(); // a sentence break always starts a new phrase
    });
    flush();
    // no orphan: a lone last word joins the previous phrase of the same line when it nearly fits
    const last = out[out.length - 1];
    const prev = out[out.length - 2];
    if (out.length - firstOfLine >= 2 && last.words.length === 1 && prev.words.length < maxWords) {
      const len = prev.words.reduce((a, w) => a + w.w.length + 1, 0) + last.words[0].w.length;
      if (len <= maxChars + 6) {
        prev.words.push(last.words[0]);
        prev.end = last.end;
        out.pop();
      }
    }
    // the last phrase of a line lingers a moment (never past the next line's start)
    if (out.length) out[out.length - 1].end += holdSec;
  });
  for (let i = 0; i < out.length - 1; i++) out[i].end = Math.min(out[i].end, out[i + 1].start);
  return out;
};

export const KeywordCaptions: React.FC<KeywordCaptionsProps> = ({
  lines, keywords = [], offsetSec = 0, y = CAPTION.centerY, maxWords = CAPTION.maxWords, maxChars = 22, holdSec = 0.35,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phrases = useMemo(() => phrasesOf(lines, keywords, maxWords, maxChars, holdSec), [lines, keywords, maxWords, maxChars, holdSec]);
  const t = f / fps + offsetSec;
  const ph = phrases.find((p) => t >= p.start && t < Math.max(p.end, p.start + 0.2));
  if (!ph) return null;
  const phIn = ramp(f, Math.round((ph.start - offsetSec) * fps), 4);

  return (
    <div style={{ position: 'absolute', left: 540 - CAPTION.maxWidth / 2, width: CAPTION.maxWidth, top: y, transform: 'translateY(-50%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 16, rowGap: 4, opacity: phIn }}>
      {ph.words.map((w, i) => {
        const at = Math.round((w.start - offsetSec) * fps);
        const on = ramp(f, at, CAPTION.wordOnFrames);
        const pop = w.key ? 1 + (CAPTION.keywordPop - 1) * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - at) / 10))) : 1;
        const style = w.key ? { ...TYPE.keyword, color: PALETTE.gold } : { ...TYPE.caption, color: PALETTE.ivory };
        return (
          <span key={i} style={{ ...style, opacity: 0.3 + 0.7 * on, display: 'inline-block', transform: `scale(${pop})`, lineHeight: 1.15 }}>
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
