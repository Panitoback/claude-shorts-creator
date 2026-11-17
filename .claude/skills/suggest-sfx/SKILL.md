---
name: suggest-sfx
description: The SFX pass. Analyze a short's beats + narration and propose tasteful sound effects synced to them, drawing from (and growing) a shared, reusable SFX library, then render an SFX-mixed audition preview. Use when the user wants to "add SFX / sound effects", "suggest sfx", "score the transitions", "sound-design this beat", generate/source sound effects, build or extend the sfx library/catalog, author or audit a sfx-plan, or mix SFX over a rendered short in this repo. Covers reading beats + word times + brand §7, the library-first flow, generating misses with the ElevenLabs Sound Effects API, the per-video sfx-plan.json, the hard user-audit gate, and mixing with tools/mix_sfx.py (light voice ducking).
---

# suggest-sfx — the SFX pass

Take a rendered, voiced short and add **tasteful sound effects**, synced to the visual beats and
the narration, drawn from a **shared, growing SFX library**. Work **collaboratively and
beat-by-beat**; the user audits the plan and gives notes.

The shape: a **declarative plan** (`sfx-plan.json`) is the source of truth → a **tool** consumes it
(`tools/mix_sfx.py`) → a **library** grows (`media/library/sfx/`) → a **hard USER-AUDIT gate**
before anything is mixed.

Sound taste is a brand contract — read **`brand/brand.md` §7** every time. The house style is calm/premium
(Linear / Anthropic / Vercel), felt-not-heard, always under the voice. NOT MrBeast-loud.

## Inputs (read these first, every session)

- **`brand/brand.md` §7 (Sound design)** — the SFX taste contract: subtlety, density, palette, levels,
  sync, signature motifs, source policy. Non-negotiable.
- **`shorts/short-N-<niche>/beats.json`** — the beats and REAL per-word voice times (written back
  by `gen_voice.py`). Sync cues to these words (a pop on "boom", a chime on "free").
- **The shot source** `remotion/src/shots/short-N/*.tsx` — the INTERNAL animation frames are where
  the real visual beats are (piece lands, digit pops, badge stamps). Read the shot, convert its
  local frame to global time: `at_s = (local_frame + sequence_from) / fps`. Do not guess — the
  cue must land on the exact frame the thing happens.
- **`media/library/sfx/USAGE.md`** — WHEN to use each clip: roles and conflicts (one big cosmic
  hit per short, honest physics sounds), the channel's combo recipes, bed rules, starting gains
  per clip. Follow it; after each produced short, update it (measured gains, combos that landed,
  clips that didn't) and the catalog's `used_in`, then commit and push.
- **`media/library/sfx/catalog.json`** + **`palette.json`** — the library you draw from and grow.

## The library (`media/library/sfx/`) — the durable asset

- `palette.json` — generation recipes: generic, reusable sound ids + prompts + duration + tags.
  The source of truth for what the library SHOULD contain.
- `catalog.json` — the manifest of what EXISTS: `{id, file, category, tags, duration_s, peak_dbfs,
  loudness_lufs, source, model, license, prompt, used_in}` per clip. Written by `gen_sfx.py`.
- `clips/*.mp3` — loudness-normalized clips (~−20 LUFS, −1.5 dBFS ceiling) so a plan's per-cue
  `gain_db` is perceptually meaningful. **Only these are usable.**
- `legacy/*.mp3` — **off-brand clips, ignore them.** Catalog entries with `"legacy": true` are
  never proposed, never put in a sfx-plan, never regenerated (`mix_sfx.py` refuses them,
  `gen_sfx.py` skips them even though their recipes are still in `palette.json`). If a sound is
  only covered by a legacy clip, treat it as a miss: propose a brand-fit (brand §7) recipe.
- `superseded/*.mp3` — **the original author's clips, ignore them.** Entries with
  `"superseded": true` (ids ending `--inherited`) were replaced on 2026-11-15 by clips generated
  with the channel's own account; `superseded_by` names the replacement. Never proposed or mixed.
  Every clip in `clips/` is ours (source/model/license recorded per clip); new ones must be too.
- **`"not_under_narration": true`** (e.g. `solar-flare-surge`, it has crackle): place it only in a
  gap in the voice, never over speech; `mix_sfx.py --print` flags these for a check.
- **Physics sounds come from code, not the API.** `redshift-slide`, `pulsar-ticks`,
  `pulsar-ticks-fast`, `gw-chirp` are synthesized by `tools/synth_sfx.py` (free, deterministic).
  When a short needs the REAL number (another pulsar's period, a different glide), make a variant:
  one-off for one video → `python tools/synth_sfx.py --kind pulsar --set period=0.089 --out
  media/projects/<proj>/vela.mp3`; reusable → add a palette entry with a `"synth"` block and run
  `--only <id>`. `--list` shows the kinds and parameters.
- **Library-first, always.** Reuse an existing clip before generating. Name/tag clips GENERICALLY
  (`whoosh-soft`, `pop-reveal`, `tick-soft`) so future videos reuse them — the library is the
  durable asset, each video is one draw from it. Only genuinely-missing sounds get added to
  `palette.json` and generated.

## Workflow

1. **Read** brand §7 + beats.json + the shot source + catalog. Pull exact cue times: for each
   candidate beat, find the visual moment's local frame in the shot and/or the narration word,
   and convert to global seconds.
2. **Decide taste with the user up front** if unsettled (present-ness, density, which kinds,
   source) — then apply brand §7. Don't re-ask settled decisions.
3. **Propose the cue list — function-first.** For each beat ask what it needs (brand §7): **motion**
   (whoosh) · **tension** (riser) · **emphasis** (impact/pop) · **snap** (click). Score key
   transitions, reveals, and tasteful click-sequences; a 3–4-shot click-sequence counts as ONE
   gesture. Mark genuinely deniable texture as `"optional": true`. Apply "Placement and
   audibility" below to every cue (audible-point offset, phone check, no stacking). **Layer the 2–3 biggest moments**
   (build-and-drop): riser→impact on a scripted reveal, whoosh→pop so a cut stands out — in the
   plan a layer is two events at the same/adjacent `at_s` that sum. Sync each cue to the VISUAL
   beat and often the exact word.
4. **Library-first sourcing.** For each distinct sound the plan needs, reuse a catalog clip if one
   fits. For misses, add a generic recipe to `palette.json` and generate: `python tools/gen_sfx.py`
   (ElevenLabs Sound Effects API → normalized clip → catalog). Fall back to curated royalty-free
   only where generation is weak; record `source` + `license` either way.
5. **Author `shorts/short-N-<niche>/sfx-plan.json`** — one event per cue, `at_s` in global seconds.
   (Schema below.)
6. **USER-AUDIT GATE (hard).** Present the resolved cue sheet
   (`python tools/mix_sfx.py <plan> --print`) and get the user's approval/notes BEFORE mixing.
7. **Mix the audition preview** once approved: `python tools/mix_sfx.py shorts/short-N-<niche>/sfx-plan.json`
   → the plan's `render.out`. Light sidechain duck under the voice + a safety limiter. Iterate on
   the user's notes (gains, timing, add/cut cues) — re-print, re-mix.
   - **The PHONE CHECK runs after every mix** (or alone: `mix_sfx.py <plan> --check`): per cue,
     the dB it adds over the voice-only preview at its audible point, full band and through the
     300 Hz phone high-pass. **Report it to the user with every mix**, and call out each cue
     flagged `GONE on phone` (fix: a mid layer on the same peak, a phone-safe clip, or the user
     accepts it as felt-not-heard). In a gap in the voice a cue must reach ~20 dB under the
     program's average level to count, so a whisper in silence doesn't pass.
   - **Verify audibility with numbers, not hope.** After mixing, RMS-diff the mixed audio vs the
     voice-only preview at each cue window: a story-critical cue should add **≥ +4 dB**, texture
     +1–3 dB. Inaudible cues hide in cue sheets — don't ship a cue you haven't confirmed lands.
   - **Transient-clip gain gotcha.** Short percussive clips (knock/stamp/keys/snap) hit the
     −1.5 dBFS peak ceiling BEFORE reaching the −20 LUFS loudness target, so they catalog ~3–5 dB
     quieter than sustained clips. Their plan `gain_db` must be **~3–5 dB higher** than the brand
     table implies. The audibility check above is what surfaces this.
   - **SHORTS calibration.** Under a short's near-continuous narration (~2.4 w/s, few gaps) a
     conservative gain table is **4–8 dB too quiet across the board** — the duck + voice masking
     eat everything. Proven landing zone: transitions/whooshes **−3**, story pops/impacts **0..+3**,
     stamps/snaps **0..+7**, layered-hero risers **0..+2**. Start a short's plan there.
   - **Cues that sit fully UNDER continuous speech never measure — accept felt-not-heard or cut
     them.** The sidechain duck suppresses quiet clips the whole time the voice is active (a
     click-sequence can measure +0 dB at ANY gain). Set such cues at a sane +6-ish and let them
     live in the word gaps, or delete them; do NOT chase them with gain (a pause would make them
     spike).
   - **Measure transients with tight windows.** RMS over 0.6s dilutes a 50 ms click to nothing and
     an adjacent loud cue can leak in and fake a pass. Use ~0.3s windows for snap/pop/zap/stamp,
     and measure a riser at its final third (its energy is at the END).
   - **A noisy TEXTURE cannot be fixed by gain.** Static/glitchy/hummy clips read as NOISE over
     speech even at −4 dB; lowering them just makes quiet noise. If the user says "noisy", swap the
     sound's CHARACTER (clean mechanical snap) or use silence — see brand §7 "no static/glitch
     textures under narration".
8. **Save back.** New clips stay in the library + catalog (they carry to the next video). Update
   `used_in`.

## Placement and audibility (apply while authoring the plan)

Where a sound sits in time matters more than which clip it is. `mix_sfx.py` puts the **start of
the file** at `at_s`, but the ear hears a clip at its **audible point** (attack or peak), which
can be a second or more into the file. Always compute:

**Write `at_s` as the PICTURE time of the hit and set `"align": "peak"` or `"attack"`** on the
event: `mix_sfx.py` then starts the clip at `at_s` − its measured `peak_s` / `attack_s` (stored per
clip in `catalog.json` by `gen_sfx.py`; `--measure` refreshes them). Without `align`, `at_s` is the
file start, which is almost never what you want. The cue sheet shows the resolved `start`.

| Sound | Align its… | to |
|---|---|---|
| snaps, clicks, ticks, pops (a state change) | attack | the frame (0 ms) |
| hero hits (impact, cosmic event, the reveal) | peak | the frame / the key word |
| whoosh into a cut or a big move | peak | **100–250 ms before** the cut (the ear cues the eye) |
| arrivals (a body settles, a label lands after moving) | attack | the **settle**, not the start of the move (~250 ms in) |
| risers | end of the build (its peak) | the hit; the channel combo then keeps ~0.5 s of near-silence before the hit (USAGE.md) |

- **Target: within ±20 ms of the frame.** At 30 fps one frame is 33 ms, so land on the frame.
- **Confirm the frame on the render, not the brief.** The shot source gives the frame; check it
  with `frames.mjs` at that frame (the thing has visibly happened there, not one frame later).
  Never "fix" an offset before re-checking the picture against a fresh render.
- **Phone check (Shorts are watched on phones).** Phone speakers play almost nothing under
  ~300 Hz. A clip that loses more than ~6 dB through a 300 Hz high-pass (the `phone dB` column in
  USAGE.md) is **invisible on a phone**. Never let a story-critical moment rest on one alone:
  layer a mid-range sweetener (a clip with a good phone figure) at the same audible point, so the
  sub-bass is felt on headphones and the mid is heard on the phone. Listen to the final mix once
  through `-af highpass=f=300` as a phone proxy.
- **One sound per event; no accidental stacking.** Two cues audible at the same time within
  ~12 dB of each other read as clutter: keep one, unless it is one of the 2–3 deliberate hero
  layers. When cues compete, cut by priority: voice > story cue (the event named in the VO) >
  snap > texture > bed.
- **A layer has anatomy:** attack (a short mid transient so it reads), body (the weight: the
  rumble, the boom), tail (the decay into silence). Build hero layers from clips that cover
  different slots, not two clips that do the same job.
- **Vary repeats.** A clip repeated in a row (count-up ticks, a click-sequence) gets a small
  `gain_db` jitter per hit (±1–2 dB, the thinned-out ticks getting slightly quieter) so it never
  sounds like one sample looped.
- **Sound follows the same dial as the picture.** If a visual parameter drives the scene
  (luminosity, size, distance), the sound tracks it: brightening = `glow-swell`; far away = quieter
  and sparser (an object shrinking to a distant point loses its body sound; don't hit it hard).
  Honest sound, like honest scale.
- **Respect the loop seam.** Every cue's tail must finish before `end_s`: the last frame loops
  into frame 0, so a tail cut at the end is an audible click on replay. Move the cue earlier or
  pick a shorter clip; never extend the picture (it would break the seamless loop).
- **Silence is a cue.** Leave the gaps in the voice open unless a cue earns them.

## Final mix checklist (before showing the user a mix)

1. Every cue corresponds to something visible on screen at that moment; remove the rest.
2. Audible points land on their frames (spot-check the hero cues at phone scale, frame by frame).
3. Story-critical cues pass the RMS check (≥ +4 dB) **and** survive the 300 Hz phone proxy.
4. No two non-hero cues overlap within ~12 dB; the 0.5 s silence before the main reveal is intact.
5. Narration level is even across the short; nothing peaks above the voice.
6. No tail crosses the loop seam; the bed (if any) fades rather than cutting.

## sfx-plan.json (the source of truth)

```jsonc
{
  "master": "remotion/out/ShortNName-voiced.mp4", "master_fps": 30,
  "catalog": "media/library/sfx/catalog.json",
  "render": {
    "preview": "remotion/out/ShortNName-voiced.mp4",   // the voiced render to mix over
    "out": "shorts/short-N-<niche>/output/short-N-sfx.mp4",
    "end_s": 42, "duck": true
  },
  "events": [
    { "at_s": 4.9, "sfx_id": "impact-soft", "align": "peak", "gain_db": 0, "shot": "MainScene",
      "cue": "the planet lands (local f51)", "note": "peak on the settle frame" },
    { "at_s": 13.03, "sfx_id": "ui-click-soft", "gain_db": -18, "optional": true, "cue": "card locks" }
  ]
}
```

- `at_s` — global-timeline seconds (same clock as beats.json). With `align`, the picture time of
  the hit; without it, the file start.
- `align` — `"peak"` (hits, whooshes, riser crests) or `"attack"` (snaps, clicks, arrivals).
  Use it on every new cue.
- `gain_db` — dB relative to the clip's normalized level (lower = quieter). See the SHORTS
  calibration above for starting values.
- `optional: true` — deniable texture; `mix_sfx.py --no-optional` drops it. Use it liberally so
  the audit is about the core set.
- `cue` / `note` — human-readable anchor (the exact frame/word) so the audit is legible.

## Tooling quick reference

- Grow the library: `python tools/gen_sfx.py [--dry-run] [--only id1,id2] [--force] [--renorm]`.
  `--renorm` re-balances existing clips to the loudness target (no API/billing). Needs
  `ELEVENLABS_API_KEY` in `.env`.
- Measure clips: `python tools/gen_sfx.py --measure [--only ids]` (catalog attack_s / peak_s /
  phone_db, no API); any file: `python tools/sfx_measure.py <file>...`.
- Recipe post-processing: `"post": "exciter-parallel"` in a palette recipe (applied after
  generation); apply it to the clip on disk with `gen_sfx.py --post-only --only <id>` (never
  stacks). Ear-check exciter takes for harshness: the user rejected one (`supernova`).
- Regenerate one of OUR clips keeping the old take: `python tools/gen_sfx.py --only <id> --force
  --keep-old` (old one → `superseded/<id>-vN.mp3`, catalog id `<id>--vN`).
- Print the cue sheet (the audit artifact): `python tools/mix_sfx.py <plan> --print [--no-optional]`
  (shows align → start, each clip's phone level, loop-seam and align problems).
- Phone check of an existing mix: `python tools/mix_sfx.py <plan> --check`.
- Mix: `python tools/mix_sfx.py <plan> [--no-optional] [--no-duck] [--end S] [--out path]`.

## Principles (the house style — apply them)

- **Under the voice, always.** SFX are seasoning; the voice is the show. Duck them, keep them
  quiet, never let one peak above the narration. Silence is part of the mix.
- **Key transitions & reveals only** — plus the diegetic action sounds that ARE a synthetic short's
  content (piece thocks, digit pops). Everything past that is `optional`.
- **Sync to the visual beat AND the word.** A click exactly on the toggle flip; a pop exactly on
  the reveal. Off-by-100ms reads as sloppy — use real frame/word times, and place each clip by its
  audible point (attack/peak), not its file start (see "Placement and audibility").
- **Reusable-first.** Generic names + tags so the library compounds across videos. Reuse before
  you generate. The library is the deliverable that outlives this video.
- **Function over vibe.** Pick the sound by its job — motion/tension/emphasis/snap (brand §7) —
  not by browsing the catalog for something that "feels right." The same few foundational sounds
  do the heavy lifting; more is not better. Keep signature motifs consistent.
- **Layer the big moments, keep the rest single.** Build-and-drop (riser→impact, whoosh→pop) is
  where SFX earn their keep — but only on the 2–3 hero beats.
- **Take structure, not drama.** Calm/premium: no cymbal-urgency risers, no trailer slams, no
  whoosh on every move.
- **Audit before mixing.** The user reads and approves `sfx-plan.json` first. Non-negotiable.

Done = the library has the needed clips (catalogued with source+license), `sfx-plan.json` is
authored and **audited by the user**, the SFX-mixed preview is rendered and spot-checked by ear,
and any new clips + `used_in` are saved back to the library.
