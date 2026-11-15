# CLAUDE.md — claude-faceless-shorts-creator

A **faceless-shorts factory** driven by Claude Code. One production track: fully-synthetic
vertical shorts where every pixel is Remotion TSX.

## This channel

- **What:** a code-animated YouTube Shorts channel (also Reels/TikTok) **about the universe**:
  space, scale, light, gravity, time. English narration, minimalist and cinematic.
- **Hard constraints:** **no AI-generated visuals** (no image or video models, no photos, no
  stock) — every pixel is drawn in code. **ElevenLabs is the only external service** (voice,
  SFX, music beds); it's paid, so say what will be generated before calling it. Don't add other
  services or install new tools without asking.
- **Where content comes from:** topics and scripts are written in the user's separate **planning
  project**, and arrive as `shorts/<slug>/guion.md`, following **`shorts/script-template.md`** (mirrored in
  `docs/PROJECT_CONTEXT.md` §6 — keep the two identical; changing it = re-upload). Don't invent topics or rewrite scripts; fact-check and flag problems instead.
- **Record of what's done:** `PRODUCED.md`, one row per short (title, format, date, status).
  Update it whenever a short changes status.
- **`docs/PROJECT_CONTEXT.md` is the brief the planning project reads.** Write it for a creative
  collaborator (what can be requested, never code details), referencing `brand/brand.md` rather
  than copying it. **Update it at the end of every phase and whenever components, formats or the
  handoff format change, then tell the user it changed so they re-upload it** (same for
  `brand/brand.md`). Record what worked and what didn't in its Learnings section.
- **Phase order (set by the user, don't skip ahead):**
  1. ✅ cleanup (generative tracks removed) · 2. ✅ visual identity (`brand/brand.md`)
  3. ✅ **components + formats**: base kit in `remotion/src/components/` (review it in the
     `ComponentGallery` composition); formats Scale / Impossible Fact / How It Works in
     PROJECT_CONTEXT §4. Quasar pieces (black hole, disk, jets, host galaxy): design only, in
     `docs/design-notes/quasar-components.md`, waiting for the user to pick a direction.
  4. ▶ first short: "What is a quasar?"
  5. custom skills `script-to-short` and `new-component` (then §6 of PROJECT_CONTEXT becomes final)
  6. Manim — only for physics/equation scenes, rendered as clips inside Remotion
- **Still open:** channel name; channel voice (ElevenLabs voice ID); recalibrate the ~2.7 words/s
  rate after the first generation with the chosen channel voice (it was measured with Liam).
- `shorts/short-12-orbit` is the one **inherited example, in the old look**: a technique
  reference only (its `lib/orbit.tsx` has real orbital physics worth reusable components), not
  channel content.

| The user asks for… | Skill | Pixels come from | Projects live in |
|---|---|---|---|
| "make a short about X" | `/make-short` | 100% TSX (Remotion animation) | `shorts/short-N-<niche>/` |

The backbone: a `beats.json` contract, ElevenLabs voice with word-exact captions
(`gen_voice.py`), frame-by-frame QA at phone scale, library-first SFX (`/suggest-sfx`),
optional music bed, seamless frame-0==last-frame loops, no CTA outros. TSX crash rules live in
`/vidtsx-2d-generator`. The official Remotion skills (`remotion-*`, from `remotion-dev/skills`)
are installed as general reference; when they conflict with this repo's skills, the repo's
skills win.

## Layout

```
tools/            Python tools: gen_voice, gen_sfx, gen_music, mix_sfx, mix_music
remotion/         the Remotion project — src/components/ (the channel's base kit, brand style),
                  src/lib/ (shared + inherited kits), src/shots/short-N/, src/shots/gallery/
media/            Remotion's public root: library/ (reusable: sfx, music, logos)
                  + projects/<proj>/ (media for ONE video, created on demand)
shorts/           TSX shorts: script.md, beats.json, sfx-plan.json each
brand/brand.md    the style contract every skill reads (palette, type, captions, objects,
                  annotations, SFX, motion, safe zones). Code twin: remotion/src/brand.ts
PRODUCED.md       the record of what's done: every short made, with format, date and status
docs/PROJECT_CONTEXT.md  the channel brief for the user's planning project (they upload it there)
.claude/skills/   make-short, vidtsx-2d-generator, suggest-sfx (+ remotion-* official skills)
skills-lock.json  pins the installed remotion-* skills (`npx skills install` restores them)
```

## Conventions (hard rules)

- **Run everything from the repo root.** Tools resolve engine paths (media/library, catalogs)
  against their own location, but project paths (`shorts/...`) against the CWD.
- **Python:** any Python 3.10+ — the pipeline is stdlib-only. `ffmpeg`/`ffprobe` and
  `node`/`npx` on PATH.
- **API keys** live in `.env` at the repo root (copy `.env.example`). Never commit `.env`.
  ELEVENLABS_API_KEY = voice/SFX/music.
- **Registry is generated:** after adding/renaming a shot, `cd remotion && npm run gen`
  (frames.mjs/render-all.mjs do NOT run it themselves).
- **Media rules:** `media/library/` is for CROSS-VIDEO reusable assets only (each with a
  catalog). Anything made FOR ONE video goes in `media/projects/<proj>/`, referenced as
  `staticFile('projects/<proj>/x')`. Reuse before you generate — check the catalogs first.
- **Gitignored media:** `shorts/*/voice/` and `shorts/*/output/` are regenerable and never
  committed.
- **Brand:** `brand/brand.md` and `remotion/src/brand.ts` change together. New shots are built
  from `remotion/src/components/` + the brand tokens (PALETTE, TYPE, CAPTION, ANNOTATION, MOTION,
  SAFE), never hard-coded values. New reusable components go in `src/components/` and get a page
  in `ComponentGallery`.
  `BrandReference` is the brand rendered: re-check it after any token change.
- **Safe zones:** QA every shot with `--safe` (frames.mjs / render-all.mjs) or `safeOverlay` in
  Studio; nothing important outside the safe rectangle.
- **QA is not optional:** render frames at phone scale and READ them before any full render.
