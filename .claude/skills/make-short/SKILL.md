---
name: make-short
description: Build a fully-synthetic vertical short (1080×1920, 30–120 s depending on format) for the universe channel end-to-end from the user's script (shorts/<slug>/guion.md, written in their planning project) — voice-first: beats.json, ElevenLabs voice at natural pace (the timeline comes from its real word timings), linked TSX beats animated on that timeline, phone-scale QA, render, SFX audition, optional music bed. Use when the user wants to "make a short", "produce guion.md", "create a shorts video", add voice/captions to a short, or re-render one. Defers raw TSX crash rules to vidtsx-2d-generator and SFX taste to suggest-sfx + brand/brand.md §7.
---

# make-short — fully-TSX vertical shorts, end to end

Everything is code: no footage, no stock, **no AI-generated images or video**. One short = one
Remotion composition fed by a beats contract.

**Voice-first is the default order** (it worked on the quasar short):
`script → voice → animation → check → sound → final video`. The voice is generated at its
natural pace (no tempo squeeze) and the timeline is built from its REAL word timings; the
composition is then animated on those times, so every cue lands on a spoken word.

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
`lib/orbit.tsx` (real orbital physics + Globe/Trajectory) — restyle to the brand before reuse.

**New components: build every one listed in guion.md's NEW COMPONENTS NEEDED** (the visual
variety rule, brand §5, often needs two or three per short). Each one generic and reusable, never
shot-specific: a component in `src/components/` with options instead of hard-coded content,
`at`/`warm` props, brand tokens only (energy curve rules for its motion), phone-readable, and a
`ComponentGallery` page; then list it in PROJECT_CONTEXT §3 (so scripts can ask for it by name)
and tell the user PROJECT_CONTEXT changed. **If the list is more than three, show it to the user
before building** (what each is and why the script needs it) and wait.

## Stage 1 — script + beats

Length comes from guion.md's FORMAT + TARGET LENGTH (ranges: `docs/PROJECT_CONTEXT.md` §5 —
Impossible Fact 30–60 s, Scale 40–75 s, How It Works 60–120 s; hard ceiling 180 s, only with
explicit approval). Beat grammar, as shares of the total: **HOOK** (0–3 s, always fixed; brand v2.0 energy curve: frame 0 composed, no fade from
black, but it's the START of a fast hook move that lands the surprise by ~3 s; the cover is picked at upload) → **SETUP** ~20% → optional **QUIZ** (~2.5 s — drives comments) →
**REVEAL** ~45%, in 2–4 steps, each synced to a VO word and SHOWN with its own picture (brand §5 visual variety: a new visual idea every ~5–10 s) → **TWIST** ~20% → **LOOP** last ~3–4 s
(last frame == frame 0,
dissolving the payoff back into the intro so it replays seamlessly). Longer shorts (How It
Works) may repeat Setup/Reveal pairs, one idea per beat.

**Outros — no fluff.** NEVER end on an old-school engagement-CTA — no "what should I do next?",
no "comment below", no "which one should I break down". They read as dated. End on the PAYOFF
line, and let the visual LOOP blend back into the intro — the loop-into-intro *is* the ending.
Prefer a clean visual dissolve/reset that lands the last frame exactly on frame 0. If a seamless
loop genuinely isn't possible for a topic, just end on the payoff with no filler. Don't pad the
tail: trim the composition so it ends shortly after the payoff, not seconds of dead air.

VO rules: total words ≈ length × 2.4 (e.g. 45 s ≈ 110 words) — a budget for the script, not a
window to squeeze into. Measured 2026-11-15 with the channel voice (`shorts/_calibration/`): v4
Turbo with delivery tags 2.55 w/s overall, 2.05–2.8 per line; lines with commas or an emphatic
ending are slowest. Facts must be verified before the voice is generated. From `guion.md`, write
`script.md` + `beats.json`: `vo[]` lines with `text` (+ `tts` with the delivery tag / phonetic
spelling) and optional `gap_before` (pause before the line, default `format.gap` 0.35 s; give the
reveal and twist a longer breath); no start/end needed — Stage 2 fills them. Timeline cues in
`beats.json` are anchored to VO words (e.g. "line 4, word 'white'"), not to guessed seconds.
HERO NUMBER / KEYWORD / ANNOTATIONS per beat carry straight over.

## Stage 2 — voice (ElevenLabs, natural pace, word-exact timeline)

```
python tools/gen_voice.py --beats shorts/<slug>/beats.json --dry-run     # credits estimate
python tools/gen_voice.py --beats shorts/<slug>/beats.json \
    --emit-ts remotion/src/shots/<slug>/vo.gen.ts
```
- Voice-first is gen_voice.py's default: each line at its **natural pace, no tempo squeeze**;
  each line's first word lands `gap_before` after the previous line's last word, and
  `format.durationSec` = last word + `format.tail` (0.8 s). Optional `hook_variants` share one
  hook slot (one `voice-<k>.wav` each).
- Per-line TTS with `/with-timestamps` → REAL per-word times (global) written into beats.json
  AND `vo.gen.ts` (`VO`, `DURATION_S`). The shot imports them and is animated on them: captions
  highlight on the exact spoken word, and every reveal cue is taken from a word time.
- Listen to `voice/voice.wav` before animating; re-roll a line (edit its `tts`) if the read is off.
- `--fit-windows` is the LEGACY animation-first mode (lines squeezed into estimated windows,
  atempo ≤ 1.3×): only for re-voicing a short animated before voice-first.
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

## Stage 3 — the composition

- One `.tsx` under `remotion/src/shots/<slug>/`, `compositionConfig` 1080×1920 @30, `durationInSeconds` =
  `DURATION_S` from `vo.gen.ts` (the real voice length from Stage 2).
  Follow vidtsx-2d-generator's hard rules (frame-based only, monotonic ranges, Easing.bezier).
- Beats = `<Sequence>` scenes over ONE persistent canvas (the board/equation/array is the
  continuity — rewinds and evolutions happen in a single component's timeline, not cuts).
- `KeywordCaptions lines={VO} keywords={[...]}` (+ optional `ProgressBar`) mounted at the ROOT
  (global time), scenes beneath. `keywords` = the guion's KEYWORD words (case/punctuation-insensitive).
- Scene boundaries and reveal cues come from `VO` word times (`word.start * fps`), never from
  guessed seconds.
- **THE recurring bug: frames inside a `<Sequence>` are LOCAL.** Converting a global beat
  second to a scene cue is `local_f = global_s*fps − sequence_from`. Check every cue twice.
- Frame-0 rule: hook scene uses `warm` props (BigTitle/EqRow) and negative `at`s so highlights/
  stamps are already on at f0. Loop scene reverses the hook's punch-in (settle 1.06→1 vs grow
  1→1.06) so the video loops seamlessly.
- Safe zones (brand §9): everything important inside `SAFE_RECT` (x 60→900, y 210→1420);
  captions in the caption lane (`CAPTION.centerY` 1350, ≤720 px wide, symmetric).
- **No hard-coded vertical positions (16:9-ready):** shorts may later be re-rendered at
  1920×1080 for long-form compilations. In new components and compositions, take y positions and
  heights from props or the shared layout tokens (safe area, caption lane, title zone: `SAFE`,
  `SAFE_RECT`, `CAPTION` in `brand.ts`), derived from them rather than typed as literals, so a
  16:9 layout object can be swapped in later. Don't refactor existing shots for this.
- Caption keyword = gold italic serif (`TYPE.keyword`); one per chunk, from guion.md KEYWORD.

## Stage 4 — QA (do not skip, it catches real bugs every time)

```
cd remotion && npm run gen        # frames.mjs does NOT run gen-registry itself
node scripts/frames.mjs <Id> 0,<beat-boundaries+hero-frames>,<last> --scale=0.5
node scripts/frames.mjs <Id> 0,<hero-frames> --scale=0.5 --safe --keep-qa   # safe-zone overlay pass
```
Each frames.mjs call wipes `remotion/out/qa/` first, so it always holds exactly the latest run;
every further call in the same run (the `--safe` pass, a second composition) needs `--keep-qa`.
READ every PNG (phone scale). Checklist: frame 0 composed & thumbnail-grade · every reveal
synced to its beat · nothing covering the payoff element · kickers swap with the narration ·
nothing important outside the safe rectangle in the `--safe` pass · stars cleared behind text ·
≤2 annotations per scene · loop frame ≈ frame 0 · **frame filling (brand §5 v2.4): each scene's
hero spans ~50–60 % of the safe width or more, small actors (particles, arrows, points) clearly
visible at phone scale, no scene half black, diagrams centered with labels ≥ 60 px**.

**QA warnings:** components report fixable problems as `[QA]` browser warnings; frames.mjs and
render-all.mjs print them and write `remotion/out/qa/<Id>-qa.json`. The QA report you give the
user MUST include a **"Shrunk hero numbers"** list from that file (value, characters, shrink
factor), or say "none". A shrunk hero number means the guion's HERO NUMBER is over ~10 characters:
flag it back to the script (shorter wording, e.g. "1.3 million") rather than shipping it small.

Fix, re-render frames, only then:

```
node scripts/render-all.mjs <Id> --scale=1     # -> remotion/out/<Id>.mp4
ffmpeg -i remotion/out/<Id>.mp4 -i shorts/<slug>/voice/voice.wav -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 192k -t <durationSec> remotion/out/<Id>-voiced.mp4
```

**Video checks on the full render (do not skip; run AFTER the last frames.mjs pass, which wipes
out/qa/):**

```
python tools/motion_check.py remotion/out/<Id>.mp4     # near-still runs ≥ 4 s (per-second motion)
python tools/frame_check.py remotion/out/<Id>.mp4      # empty frames > 1 s · hero too small ≥ 2 s
```
Both add a section to `remotion/out/qa/<Id>-qa.json` (`motion`, `frames`) and rebuild its
top-level `flags` list. Thresholds are calibrated on "Why Time Only Moves Forward" (see each
tool's docstring). **The QA report you give the user lists EVERY flag from that file (time range +
check + message) BEFORE you show or send any video**, or says "no flags". Fix what you can
(moving content tied to the idea, a push-in, a bigger hero, shorter darkness: brand §5/§8) and
re-run the checks; anything left is the user's call, so say what it is and why it's there.

## Stage 5 — SFX (the suggest-sfx machinery, shorts flavor)

The script only describes the mood or moment (guion.md `SOUND MOOD:` in NOTES, plus any sound
moments named in plain words); **production picks every clip** from USAGE.md, never the script.
Read `brand/brand.md` §7 + **`media/library/sfx/USAGE.md`** (when to use each clip, combo recipes,
starting gains) + `media/library/sfx/catalog.json` (skip `"legacy": true` and `"superseded": true`
entries; see `/suggest-sfx`). Library-first; add generic recipes to
`palette.json` + `python tools/gen_sfx.py` only for genuine misses. Author
`shorts/<slug>/sfx-plan.json` (preview = the -voiced.mp4, out = output/<slug>-sfx.mp4).

Shorts taste adaptations: **diegetic action sounds are the content** (piece thocks, digit
pops) and may exceed long-form density; decorative cues stay `optional: true`; layer the 2–3
hero moments (capture+stamp, carry flight+landing+chime). Whips (`WhipTransition`/`WhipMontage`,
brand §8): one whoosh each, its PEAK on `whipTiming(at, dur).swap`, clip or pitch varied across
consecutive whips. Cue times from EXACT landing frames:
`at_s = (move.at + move.dur + sequence_from) / fps`.

```
PYTHONIOENCODING=utf-8 python tools/mix_sfx.py shorts/<slug>/sfx-plan.json --print
PYTHONIOENCODING=utf-8 python tools/mix_sfx.py shorts/<slug>/sfx-plan.json
```
The mix is an AUDITION — the user's ear is the audit gate before anything is called final.
Once approved: update catalog `used_in` and `USAGE.md` (Mix log + measured gains, combos that
landed, clips that didn't; flip used clips' status), then commit and push.

## Stage 6 — music (optional, per video)

ONE bed per short (USAGE.md): a music bed from `media/library/music/` (gen_music.py to grow) OR
a space loop from the SFX library (`space-drone-loop`, `space-air-loop`, `accretion-swirl-loop`).
Audition over the SFX mix: `python tools/mix_music.py --all --base shorts/<slug>/output/<slug>-sfx.mp4`
(or `--bed <id>`; SFX loops default to `--under 16`; `--from/--to` for a partial bed). Ducked
under voice, faded in/out.

## Stage 7 — finalize the audio (every final, always last)

```
python tools/finalize_audio.py shorts/<slug>/output/<slug>-final.mp4 --id <Id>
```
Two-pass loudnorm to **−14 LUFS, true peak ≤ −2.0 dBTP measured on the encoded AAC file** (it
retries with a lower target if the encode overshoots), audio trimmed to end with the picture (a
longer tail freezes the last frame at the loop seam) with a 20 ms fade. It writes the `audio`
section of the QA json. **If it prints FAIL (exit 2), the final is NOT delivered**: the output is
left untouched and the attempt is saved as `<name>.FAILED.mp4`; fix the mix (usually a hot SFX
hit) and run it again. `--check` measures an existing file against the spec.

## Done =

script.md + beats.json derived from guion.md (facts verified) · voice generated first at natural
pace, timeline from its real word timings · composition animated on that timeline, QA'd
frame-by-frame (incl. `--safe` pass) · rendered at scale 1 and muxed with the voice ·
video checks run and every flag listed in the QA report before the user saw a video ·
SFX plan authored + audition mixed (~−15.5 LUFS, awaiting the user's ear) · final passed
`finalize_audio.py` (−14 LUFS, ≤ −2.0 dBTP) · library used_in
and `media/library/sfx/USAGE.md` updated · **`PRODUCED.md` row added/updated** · anything learned added to the Learnings section of
`docs/PROJECT_CONTEXT.md` (then tell the user it changed so they re-upload it).
