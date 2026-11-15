---
name: make-short
description: Build a fully-synthetic vertical short (1080×1920, 30–120 s depending on format) for the universe channel end-to-end from the user's script (shorts/<slug>/guion.md, written in their planning project) — beats.json, linked TSX beats over a persistent canvas, phone-scale QA, render, ElevenLabs voice with exact word-synced captions, SFX audition, optional music bed. Use when the user wants to "make a short", "produce guion.md", "create a shorts video", add voice/captions to a short, or re-render one. Defers raw TSX crash rules to vidtsx-2d-generator and SFX taste to suggest-sfx + brand/brand.md §7.
---

# make-short — fully-TSX vertical shorts, end to end

Everything is code: no footage, no stock, **no AI-generated images or video**. One short = one
Remotion composition fed by a beats contract, with voice and SFX layered on after render.

**Input comes from the user's planning project**, not from here: `shorts/<slug>/guion.md`,
following `shorts/script-template.md` (mirrored in `docs/PROJECT_CONTEXT.md` §6). Check it
against the template's limits and checklist first and report anything over budget. Topics and wording are the user's — don't
invent topics or silently rewrite the script. Fact-check it; if a fact is wrong, a line is too
long for its window, or a beat asks for something not buildable, flag it and propose the fix.
Visual style is fixed by **`brand/brand.md`** (code twin `remotion/src/brand.ts`) — read it first.
`shorts/short-12-orbit` is the one inherited example in the OLD look: useful for technique
(frame math, captions, loops, real orbital physics), not for style.

Run everything from the **repo root**. Tools are stdlib-only Python 3.10+; `ffmpeg`/`node`
must be on PATH; API keys live in `.env` (see `.env.example`).

## Artifact contract

```
shorts/<slug>/
  guion.md         — the user's script from the planning project (source of truth for content)
  script.md        — production beat sheet derived from guion.md (time | on screen | VO), notes
  beats.json       — machine contract: format, vo[] (text+start/end+words), beats[], niche timeline
  voice/           — per-line TTS clips + voice.wav        (gen_voice.py)   [gitignored]
  sfx-plan.json    — cue sheet on the global timeline       (mix_sfx.py)
  output/          — <slug>-sfx.mp4 (+ music auditions)                    [gitignored]
remotion/src/shots/<slug>/
  <Name>.tsx       — THE composition (registered by npm run gen)
  vo.gen.ts        — AUTO-GENERATED VO with exact word times (never hand-edit)
```

**Brand first:** build every visual from the tokens in `remotion/src/brand.ts` (PALETTE, BODY,
TYPE, CAPTION, ANNOTATION, MOTION, EASE, SAFE) — never hard-coded colors, fonts or timings.
**Base kit — use it first:** `remotion/src/components/` (import from `../../components`):
`Starfield` (pass text blocks as `clear`), `GlowingBody`, `Planet`, `HeroNumber`,
`KeywordCaptions`, `Marker`, `ScaleBar`, `DataLabel`, `ScaleComparison`. Every component takes
`at` (start frame, local to its Sequence) and `warm` (fully arrived at frame 0 — use in the hook).
See them all in the `ComponentGallery` composition (and its source for usage).
`shots/brand/BrandReference.tsx` is the brand rendered as one scene.
Max 2 annotations per scene; honest scale when the scene is about size. The formats (Impossible
Fact, Scale, How It Works) and which components carry each are in PROJECT_CONTEXT §4.

Inherited kit (old look): `lib/shorts.tsx` — ProgressBar, BigTitle, Kicker, prog helper are still
usable; do NOT use its Captions/Stamp/StatChip/PauseCard/ShortsBackdrop (replaced or retired).
`lib/orbit.tsx` (real orbital physics + Globe/Trajectory) — restyle to the brand before reuse. **Add at most ONE new
reusable component lib per short.**

## Stage 1 — script + beats

Length comes from guion.md's FORMAT + TARGET LENGTH (ranges: `docs/PROJECT_CONTEXT.md` §5 —
Impossible Fact 30–60 s, Scale 40–75 s, How It Works 60–120 s; hard ceiling 180 s, only with
explicit approval). Beat grammar, as shares of the total: **HOOK** (0–3 s, always fixed; frame 0 FULLY composed — the payoff already visible,
no fade from black) → **SETUP** ~20% → optional **QUIZ** (~2.5 s — drives comments) →
**REVEAL** ~45%, in 2–4 steps, each synced to a VO word → **TWIST** ~20% → **LOOP** last ~3–4 s
(last frame == frame 0,
dissolving the payoff back into the intro so it replays seamlessly). Longer shorts (How It
Works) may repeat Setup/Reveal pairs, one idea per beat.

**Outros — no fluff.** NEVER end on an old-school engagement-CTA — no "what should I do next?",
no "comment below", no "which one should I break down". They read as dated. End on the PAYOFF
line, and let the visual LOOP blend back into the intro — the loop-into-intro *is* the ending.
Prefer a clean visual dissolve/reset that lands the last frame exactly on frame 0. If a seamless
loop genuinely isn't possible for a topic, just end on the payoff with no filler. Don't pad the
tail: trim the composition so it ends shortly after the payoff, not seconds of dead air.

VO rules: total words ≈ length × 2.4 (e.g. 45 s ≈ 110 words); estimate line windows at **~2.4 words/sec with slack to the next
line's start** (tighter forces audible atempo squeeze). Measured 2026-11-15 with the channel voice
(`shorts/_calibration/`): v4 Turbo with delivery tags 2.55 w/s overall, 2.05–2.8 per line (v2 was
2.45); lines with commas or an emphatic ending are slowest and needed 1.32× squeeze in the 2.7 w/s test
windows (over the 1.3 cap), hence the 2.4 budget. Give comma-heavy lines extra room. Facts must be verified before animating. From `guion.md`, write `script.md` + `beats.json`
(vo lines with estimated start/end; timeline in global SECONDS) — HERO NUMBER / KEYWORD /
ANNOTATIONS per beat carry straight over.

## Stage 2 — the composition

- One `.tsx` under `remotion/src/shots/<slug>/`, `compositionConfig` 1080×1920 @30, `durationInSeconds` = the
  guion's TARGET LENGTH (adjusted to the real voice length after Stage 4).
  Follow vidtsx-2d-generator's hard rules (frame-based only, monotonic ranges, Easing.bezier).
- Beats = `<Sequence>` scenes over ONE persistent canvas (the board/equation/array is the
  continuity — rewinds and evolutions happen in a single component's timeline, not cuts).
- `KeywordCaptions lines={VO} keywords={[...]}` (+ optional `ProgressBar`) mounted at the ROOT
  (global time), scenes beneath. `keywords` = the guion's KEYWORD words (case/punctuation-insensitive).
- **THE recurring bug: frames inside a `<Sequence>` are LOCAL.** Converting a global beat
  second to a scene cue is `local_f = global_s*fps − sequence_from`. Check every cue twice.
- Frame-0 rule: hook scene uses `warm` props (BigTitle/EqRow) and negative `at`s so highlights/
  stamps are already on at f0. Loop scene reverses the hook's punch-in (settle 1.06→1 vs grow
  1→1.06) so the video loops seamlessly.
- Safe zones (brand §9): everything important inside `SAFE_RECT` (x 60→900, y 210→1420);
  captions in the caption lane (`CAPTION.centerY` 1350, ≤720 px wide, symmetric).
- Caption keyword = gold italic serif (`TYPE.keyword`); one per chunk, from guion.md KEYWORD.

## Stage 3 — QA (do not skip, it catches real bugs every time)

```
cd remotion && npm run gen        # frames.mjs does NOT run gen-registry itself
node scripts/frames.mjs <Id> 0,<beat-boundaries+hero-frames>,<last> --scale=0.5
node scripts/frames.mjs <Id> 0,<hero-frames> --scale=0.5 --safe   # safe-zone overlay pass
```
READ every PNG (phone scale). Checklist: frame 0 composed & thumbnail-grade · every reveal
synced to its beat · nothing covering the payoff element · kickers swap with the narration ·
nothing important outside the safe rectangle in the `--safe` pass · stars cleared behind text ·
≤2 annotations per scene · loop frame ≈ frame 0.

**QA warnings:** components report fixable problems as `[QA]` browser warnings; frames.mjs and
render-all.mjs print them and write `remotion/out/qa/<Id>-qa.json`. The QA report you give the
user MUST include a **"Shrunk hero numbers"** list from that file (value, characters, shrink
factor), or say "none". A shrunk hero number means the guion's HERO NUMBER is over ~10 characters:
flag it back to the script (shorter wording, e.g. "1.3 million") rather than shipping it small.

Fix, re-render frames, only then:

```
node scripts/render-all.mjs <Id> --scale=1     # -> remotion/out/<Id>.mp4
```

## Stage 4 — voice (ElevenLabs, word-exact captions)

```
python tools/gen_voice.py --beats shorts/<slug>/beats.json \
    --emit-ts remotion/src/shots/<slug>/vo.gen.ts
```
- Per-line TTS with `/with-timestamps` → REAL per-word times (tempo-scaled, global) written
  into beats.json AND `vo.gen.ts`. The shot imports `{ VO } from './vo.gen'` — captions then
  highlight on the exact spoken word. Never estimate when a voice track exists.
- Clips are cached by text-hash: rewriting one line only re-bills that line.
- Voice: the channel voice `JYUzXNeyCPmymMkfcicu` on **Eleven v4 Turbo** (`eleven_v4_turbo`,
  ×0.5 credits) are gen_voice.py's defaults (no `--voice`/`--model` needed; pass them only to
  audition). v4 takes only Stability + Similarity; no Style/Speed, no SSML `<break>`.
- **Delivery tags (we write them; the API has no "auto tags").** The app's "Enhance" button is an
  LLM writing tags into the text; by API we do that job: put ONE light, narration-fit tag at the
  start of each line's `tts` (`"tts": "[awed] That light has crossed…"`; tags used in the
  calibration: `[intrigued]`, `[building excitement]`, `[awed]`, `[emphatic]`). Match the beat's
  intent (hook = intrigue, payoff = awe/emphasis); never comedic or theatrical tags. Tags are
  filtered out of the word map and never captioned. They count as billed characters.
- ElevenLabs is paid: state roughly what will be generated before calling it.
- **Pronunciation (guion.md `PRONUNCIATION:`):** for a name the voice may misread, add a per-line
  `tts` field in beats.json next to `text` (e.g. `"text": "Quasars outshine galaxies."`,
  `"tts": "Kway-zars outshine galaxies."`). gen_voice.py sends `tts` to ElevenLabs (and hashes it
  for the cache) instead of `text`. The word timestamps come from the TTS text, but
  `KeywordCaptions` shows the `text` words mapped onto those timings (by character position), so
  the respelling never reaches the screen. Pass the beats.json lines straight in, `tts` included.
- Then re-render the composition (captions retimed) and mux:
  `ffmpeg -i remotion/out/<Id>.mp4 -i shorts/.../voice/voice.wav -map 0:v -map 1:a -c:v copy
   -c:a aac -b:a 192k -t <durationSec> remotion/out/<Id>-voiced.mp4`

## Stage 5 — SFX (the suggest-sfx machinery, shorts flavor)

Read `brand/brand.md` §7 + `media/library/sfx/catalog.json` (skip `"legacy": true` entries; clips
flagged `regenerate_before_publish` must be regenerated with our key before `final`, see
`/suggest-sfx`). Library-first; add generic recipes to
`palette.json` + `python tools/gen_sfx.py` only for genuine misses. Author
`shorts/<slug>/sfx-plan.json` (preview = the -voiced.mp4, out = output/<slug>-sfx.mp4).

Shorts taste adaptations: **diegetic action sounds are the content** (piece thocks, digit
pops) and may exceed long-form density; decorative cues stay `optional: true`; layer the 2–3
hero moments (capture+stamp, carry flight+landing+chime). Cue times from EXACT landing frames:
`at_s = (move.at + move.dur + sequence_from) / fps`.

```
PYTHONIOENCODING=utf-8 python tools/mix_sfx.py shorts/<slug>/sfx-plan.json --print
PYTHONIOENCODING=utf-8 python tools/mix_sfx.py shorts/<slug>/sfx-plan.json
```
The mix is an AUDITION — the user's ear is the audit gate before anything is called final.
Update catalog `used_in` afterwards.

## Stage 6 — music (optional, per video)

Library beds in `media/library/music/` (gen_music.py to grow). Audition over the SFX mix:
`python tools/mix_music.py --all --base shorts/<slug>/output/<slug>-sfx.mp4`
(or `--bed <id>`). Hard-ducked under voice.

## Done =

script.md + beats.json derived from guion.md (facts verified) · composition QA'd frame-by-frame
(incl. `--safe` pass) · rendered at scale 1 · voice generated with word-exact captions and muxed ·
SFX plan authored + audition mixed (~−15.5 LUFS, awaiting the user's ear) · library used_in
updated · **`PRODUCED.md` row added/updated** · anything learned added to the Learnings section of
`docs/PROJECT_CONTEXT.md` (then tell the user it changed so they re-upload it).
