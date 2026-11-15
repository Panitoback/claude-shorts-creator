# CLAUDE.md — claude-faceless-shorts-creator

A **faceless-shorts factory** driven by Claude Code. One production track: fully-synthetic
vertical shorts where every pixel is Remotion TSX.

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
tools/            Python tools: gen_voice, gen_sfx, gen_music, mix_sfx, mix_music, gen_chords
remotion/         the Remotion project — src/lib/ (shared + niche kits), src/shots/short-N/
media/            Remotion's public root: library/ (reusable: sfx, music, logos)
                  + projects/<proj>/ (media for ONE video, created on demand)
shorts/           TSX shorts: script.md, beats.json, sfx-plan.json each
brand.md          the style contract every skill reads (palette, motion, safe areas, SFX taste)
IDEAS.md          the TSX-shorts idea bank + niche ranking
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
- **QA is not optional:** render frames at phone scale and READ them before any full render.
