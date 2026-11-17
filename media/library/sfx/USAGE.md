# SFX library — usage guide

How to use each clip when scoring a short. Read it with `brand/brand.md` §7 (the taste contract)
and `/suggest-sfx` (the workflow) before writing any `sfx-plan.json`. The catalog says what a
clip IS; this file says WHEN to use it.

**Status of every clip: approved by the user's ear (2026-11-15; `supernova`, `deep-rumble`,
`whoosh-deep` re-approved and `hook-hit` added 2026-11-16), untested in a real mix.**
Starting gains are educated guesses until a produced short measures them (see Maintenance).

## Rules

### Roles and conflicts
- **One big cosmic hit per short, at most:** `impact-cosmic` OR `supernova` OR `gamma-flash`,
  never two. It belongs to the main reveal and nowhere else.
- **Something gaining luminosity** (the quasar switching on, a disk brightening): `glow-swell`.
  `star-ignite` only for an actual star being born or igniting.
- **Black holes:** `deep-rumble` as a one-shot when the black hole first appears;
  `accretion-swirl-loop` as the bed only while the disk is on screen.
- **Physics sounds are honest sound, like honest scale.** `gw-chirp`, `pulsar-ticks`,
  `redshift-slide` only when the visual shows that exact phenomenon, with real parameters. A
  different pulsar = a variant at its real period (`tools/synth_sfx.py`), never the stock clip.
- **One sound per event.** Two non-hero cues audible together within ~12 dB of each other are
  clutter: keep one. When cues compete: voice > the event named in the VO > snap > texture > bed.
- **Distance is quiet.** Something far away or shrinking to a point gets less sound, not a hit
  (lower gain, no body layer). Sound follows the same dial as the picture.
- **Loop seam:** no tail may run past the end of the short (the replay would click). Check
  `at_s` + clip duration ≤ `end_s`.
- **Crackle = pauses only.** `solar-flare-surge` (flagged `not_under_narration`) and anything
  with crackle go in a gap in the voice, never over speech. `mix_sfx.py --print` flags them.

### The energy curve (brand v2.0)
- **Hook (first ~3 s): high, phone-audible.** One of the two hook recipes below, plus a whoosh on
  the hook's camera move. Must read "ok" in the PHONE CHECK.
- **Body: calm, felt-not-heard** (everything in the clip tables at their start gains).
- **Peaks (main reveal, twist): a phone-audible burst**, then settle. Must read "ok" in the PHONE
  CHECK.

### Channel combos (recipes)
| Moment | Recipe | Timing |
|---|---|---|
| **Hook, hit on frame 0** | `hook-hit` at 0 to +2 dB (`align: "attack"`) + optionally `whoosh-deep` under the camera move | the hit's attack on frame 0 (`at_s` = 0 − attack, clamp at 0); the whoosh's PEAK where the camera move is fastest (its first third with `EASE.punch`) |
| **Hook, riser → hit** | `riser-soft` (cut short, or its last ~1–1.5 s) → `hook-hit` (`align: "peak"`) | the hit's PEAK on the hook's visual change (the ignition, the end of the pull-back) or the key word; keep it within the first ~1.5 s |
| **The twist** | `glow-swell` or `impact-deep-soft` + `pop-reveal` at −6 dB on the same peak | a burst on the reframe word, then back to the body level |
| **The main reveal** | `riser-long` → ~0.5 s near-silence → `supernova` (or `impact-cosmic`) **+ `hook-hit` at −6 dB as the phone layer** on the same peak (`align: "peak"` on both; not `gamma-flash`, it counts as a second cosmic hit) | the riser's build ends just before the half second of silence (its peak is at 4.53 s, its tail fades to the file end at 6 s); the hit's PEAK lands on the reveal frame / key word; drop the bed and other cues in the silence |
| **A sub-bass hit that must read on phones** | the hit (body, ⚠ in the table) + a mid transient (attack) aligned peak-to-peak | the mid layer ~6–10 dB under the hit: on headphones you feel the body, on a phone you hear the attack |
| **A whoosh into a cut** | `whoosh-soft` / `whoosh-deep` | its PEAK 0.1–0.25 s before the cut (`at_s` = cut − 0.15 − peak) |
| **Falling into a black hole** | `stellar-collapse` → `event-horizon-fade` | the thud lands at the crossing; the fade carries the fall into silence |
| **A number counting up** | `tick-soft` repeated during the count → `number-settle` when the hero number lands | ticks every few frames, thinned out (not every digit); settle exactly on the final value |
| **A fact or label snapping in** | `whoosh-reverse` → `pop-reveal` | the reverse whoosh ends where the pop starts, on the label's first frame |
| **Silence** | ~0.5 s of near-silence before the main reveal | silence is a cue: put it in the plan as a `note` so the mix respects it |

### Beds
- **ONE bed at a time:** a space loop (`space-drone-loop`, `space-air-loop`),
  `accretion-swirl-loop`, OR a music bed. Never two together.
- Beds are not cues: lay them with `mix_music.py` after the SFX mix (`mix_sfx.py` refuses a loop
  in a plan). Start **~16 dB under the voice** (`--under 16`, the default for SFX-library loops),
  ducked further while the voice speaks; always faded in/out (`--fade`), never hard cuts.
  A bed for only part of the short: `--from S --to S` (e.g. accretion only while the disk shows).
  ```
  python tools/mix_music.py --bed accretion-swirl-loop --under 16 --from 12 --to 31 \
      --base shorts/<slug>/output/<slug>-sfx.mp4 --out shorts/<slug>/output/<slug>-bed.mp4
  ```

### Gain
- `gain_db` in a plan is relative to the clip's normalized level (~−20 LUFS). Brand §7 starting
  points under continuous narration: whooshes −3, pops/impacts 0 to +3, snaps 0 to +7, layered
  hero risers 0 to +2.
- **Very short clips catalog quieter** (they hit the −1.5 dBFS peak ceiling before reaching −20
  LUFS): `tick-soft` (−23.3), `number-settle` (−25.0), `pulsar-ticks` (−25.7), `ui-click-soft`
  (−22.1). Add **+3 to +5 dB** on top of the usual start (already included below).
- A cue that sits fully under continuous speech may never measure (the duck eats it): accept
  felt-not-heard or move it to a gap.
- **Repeats get a small jitter** (±1–2 dB per hit, thinning ticks slightly quieter) so a
  repeated clip never sounds like one sample looped.

### Timing and phone check (measured 2026-11-16)

Place by the audible point: write `at_s` as the picture time and add `"align": "attack"`
(snaps, clicks, arrivals) or `"align": "peak"` (hits, whooshes, riser crests); `mix_sfx.py`
subtracts the clip's measured offset. For a whoosh into a cut, `at_s` = cut − 0.15 with
`align: "peak"`. These numbers live in `catalog.json` (`attack_s`, `peak_s`, `phone_db`), written
by `gen_sfx.py`; refresh with `python tools/gen_sfx.py --measure`. Every mix ends with a per-cue
PHONE CHECK (`mix_sfx.py --check` to rerun it).

`phone dB` = how much of the clip survives a 300 Hz high-pass (what phone speakers play).
**Below about −6 dB the clip is invisible on a phone** (⚠): it is felt on headphones only. Never
let a story-critical moment rely on one alone; add a phone-safe mid layer on the same audible
point (see combos). Attack = first 10 ms window within 6 dB of the peak.

| Clip | Dur s | Attack s | Peak s | Phone dB |
|---|---|---|---|---|
| `whoosh-soft` | 1.00 | 0.21 | 0.27 | −4.2 |
| `whoosh-wind` | 1.48 | 0.70 | 0.89 | −0.1 |
| `whoosh-deep` (v2 + exciter, 2026-11-16) | 2.00 | 0.38 | 0.52 | −0.5 |
| `whoosh-reverse` | 1.48 | 1.15 | 1.26 | −3.5 |
| `swish-light` | 0.48 | 0.11 | 0.14 | −0.2 |
| `riser-soft` | 3.00 | 2.72 | 2.94 | −0.1 |
| `riser-long` | 6.00 | 3.49 | **4.53** (crests 1.5 s before its end) | −3.9 |
| `riser-shimmer` | 4.00 | 0.69 | 0.84 (front-loaded) | −0.4 |
| `impact-soft` | 1.48 | 0.23 | 0.24 | ⚠ −25.8 |
| `impact-deep-soft` (+ exciter, 2026-11-16) | 2.48 | 0.11 | 0.12 | ⚠ −7.1 (borderline) |
| `pop-reveal` | 0.48 | 0.00 | 0.00 | −0.5 |
| `impact-cosmic` | 4.00 | 0.06 | 0.27 | ⚠ −35.5 (always with a mid layer) |
| `hook-hit` (new, 2026-11-16) | 1.48 | 0.01 | 0.05 | −6.3 |
| `glow-swell` | 3.00 | 0.74 | 1.44 | −2.0 |
| `ui-click-soft` | 0.48 | 0.00 | 0.00 | 0.0 |
| `tick-soft` | 0.48 | 0.11 | 0.20 | 0.0 |
| `number-settle` | 0.80 | 0.03 | 0.03 | 0.0 |
| `sparkle-soft` | 1.48 | 0.09 | 0.27 | −1.6 |
| `warm-shimmer` | 2.48 | 0.14 | 0.22 | −1.3 |
| `deep-rumble` (v2 + exciter, 2026-11-16) | 4.00 | 0.52 | 1.19 | −3.4 |
| `chime-discovery` | 2.00 | 0.06 | 0.24 | 0.0 |
| `supernova` (v2, 2026-11-16) | 5.00 | 0.66 | 0.67 (not immediate: align by peak) | ⚠ −21.0 |
| `stellar-collapse` | 3.00 | 1.30 | 1.33 | ⚠ −7.2 |
| `star-ignite` | 3.00 | 0.65 | 1.02 | −1.6 |
| `light-speed-pass` | 1.48 | 0.22 | 0.25 | −0.1 |
| `photon-travel` | 2.00 | 0.19 | 0.31 | 0.0 |
| `gamma-flash` | 1.00 | 0.02 | 0.04 | −0.1 |
| `event-horizon-fade` | 4.00 | 0.40 | 0.85 | −1.3 |
| `spaghettify-stretch` | 3.00 | 0.21 | 0.72 | −2.5 |
| `jet-launch` | 2.48 | 0.54 | 0.76 | −1.1 |
| `radiation-hum` | 4.00 | 0.56 | 2.18 | −5.6 |
| `solar-flare-surge` | 3.00 | 0.20 | 0.96 | −5.6 |
| `redshift-slide` | 3.08 | 0.07 | 0.61 | −1.6 |
| `pulsar-ticks` (harmonics, 2026-11-16) | 8.05 | 0.00 (first tick; the meter reads 1.33 because the fade-in softens it) | each tick | −4.9 |
| `pulsar-ticks-fast` (spin-up, 2026-11-16) | 6.77 | 0.39 | — (ticks fuse into the tone at ~4.8 s) | −3.1 |
| `gw-chirp` (harmonics + exciter, 2026-11-16) | 3.56 | 2.54 | 2.61 (the merger) | −4.5 |
| beds: `space-drone-loop` / `space-air-loop` / `accretion-swirl-loop` (v2, 2026-11-16) | 30 | — | — | −6.2 / −2.9 / −0.9 |

The phone-invisible clips (⚠) are the weight of the library: the cosmic hits and the soft
impact. On headphones they are the best clips we have; on a phone they go silent, so they always
get the mid-layer combo. Re-measure a clip after regenerating it.

**Phone dB is a whole-clip ratio, so it cannot judge a combo:** a hit + mid layer still reads ⚠
because the low body dominates the total, even though the layer is clearly heard on a phone.
Judge combos with the mix's PHONE CHECK (dB added over the voice) or an absolute measurement.

### Fixing a phone-invisible clip: which approach when

Tested 2026-11-16 on the library's ⚠ clips (phone dB after processing, re-normalized to −20 LUFS).
"exciter, parallel" = `asplit[a][b];[b]aexciter=amount=8:drive=10:freq=2000:blend=0:listen=1,volume=6dB[x];[a][x]amix=inputs=2:normalize=0`;
"saturate lows" = the band under 250 Hz soft-clipped (tanh) and only its harmonics above 300 Hz mixed back.

| Clip | Original | `aexciter` default | exciter, parallel | saturate lows |
|---|---|---|---|---|
| `supernova` | −46.1 | −46.1 | −29.0 | −32.9 |
| `impact-cosmic` | −35.5 | −35.5 | −27.8 | −31.0 |
| `impact-soft` | −25.8 | −25.8 | −22.8 | −20.3 |
| `deep-rumble` | −25.4 | −25.4 | −23.2 | −19.6 |
| `whoosh-deep` | −18.3 | −18.3 | −10.0 | −15.2 |
| `stellar-collapse` | −7.2 | −7.0 | **−0.1** | −7.2 |
| `space-drone-loop` | −6.2 | −6.2 | **−3.3** | **−3.2** |
| `pulsar-ticks` | −9.9 | −9.9 | **−0.7** | −8.4 |
| `gw-chirp` | −10.5 | −10.5 | −10.6 | −7.2 |
| `accretion-swirl-loop` | −11.8 | −11.6 | **−0.4** | −8.6 |

**`aexciter` at its defaults does nothing** here (it only excites content above 7.5 kHz). An
exciter adds harmonics to what is already there; it cannot invent a mid range that isn't.

- **Phone dB between about −6 and −12** (some mid content exists): the parallel exciter rescues
  it, free and instantly (`stellar-collapse`, `accretion-swirl-loop`, `pulsar-ticks` → ~0 dB).
  Ear-check it for harshness before using it (brand §7: calm, no static). Physics clips
  (`pulsar-ticks`, `gw-chirp`) are better fixed in `tools/synth_sfx.py` by adding harmonics to the
  tone, so the sound stays exactly the data.
- **Below about −15** (pure sub-bass: the cosmic hits, the rumbles): no processing gets near
  −6. **Regenerate** with a prompt that asks for a clear mid-range transient over the low body
  (palette recipes written 2026-11-16), or, for one short, use the combo below.
- **Any big moment, whatever the clip:** keep the **low hit + mid layer aligned on the same
  peak** combo. It is the safest option: headphones get the body, phones get the attack.

**Second pass (2026-11-16, user's ear, `audition/batch-5`):** the exciter won on numbers almost
everywhere but **lost by ear on `stellar-collapse`, `radiation-hum`, `solar-flare-surge` and
`accretion-swirl-loop`** (originals kept; `accretion-swirl-loop` was then **regenerated** with a
prompt asking for an airy hiss and a mid-range swirl over the low tone: take 2 of 2 chosen,
−11.8 → −0.9). It was kept on `impact-deep-soft` (−17.7 → −7.1) and,
on top of extra harmonics, on `gw-chirp`. `pulsar-ticks` kept the code fix (stronger click and
thump harmonics, same period: −9.9 → −4.9). `space-drone-loop` stays as is: the exciter made its
seam click even when processed circularly. So the exciter is a **candidate, never a default**:
audition it against the original every time.

**A loop processed with any filter must be processed circularly** (`gen_sfx.apply_post(...,
loop=True)` does it: two copies back to back, keep the second), or the loop point clicks.

**What happened when we tried both (2026-11-16, judged by the user's ear, `audition/batch-3`):**

| Clip | v1 | v2 regenerated | v2 + exciter | Kept |
|---|---|---|---|---|
| `supernova` | −46.1 | −21.0 | −0.7 | **v2** (the exciter version sounded worse) |
| `impact-cosmic` | −35.5 | −4.7 | — | **v1** (sounds best; phone fixed by the combo) |
| `impact-soft` | −25.8 | −9.6 | −2.1 | **v1** (sounds best) |
| `deep-rumble` | −25.4 | −14.4 | −3.4 | **v2 + exciter** |
| `whoosh-deep` | −18.3 | −8.1 | −0.5 | **v2 + exciter** (the user liked v2 and v2 + exciter equally) |
| `hook-hit` (new) | — | −6.3 | −0.0 | **v2** |

Lessons: asking the model for a mid-range attack helps but is not enough (it drifts to the low
end; a prompt that describes the low body at length comes back as pure sub-bass). Regenerating
and then exciting worked on numbers for every clip, **but the ear decides**: twice the better-
sounding take was the phone-invisible v1. So the order is: **ear first, then the combo for the
phone.** Rejected takes were deleted (git history only). The exciter is applied
reproducibly as `"post": "exciter-parallel"` in the clip's palette recipe (`gen_sfx.py`).

**The combo, measured** (`audition/batch-4-hero-combo`): `impact-cosmic` alone peaks at −31.5 dB
through the phone filter; with `pop-reveal` at −6 dB on the same peak, −7.9 dB; with `hook-hit`
at −6 dB, −12.5 dB. +19 to +24 dB on a phone, nothing lost on headphones. **The user chose
`hook-hit`** (by ear, 2026-11-16): it is the channel's phone layer for the main reveal. **Raising the hit's own
gain is not the fix:** its energy above 300 Hz is 35 dB below its total, so a phone would need
~+30 dB, which would blast headphones and clip.

## Clips

Gains are starting `gain_db` values. Status for all: approved, untested in a real mix.

### Motion
| Clip | For | Avoid | Pairs with | Start gain |
|---|---|---|---|---|
| `whoosh-soft` | everyday cut between scenes | stacking on every cut; use on key transitions only | `pop-reveal` on the next scene's first element | −3 |
| `whoosh-wind` | slow glide / camera drift past an object | fast cuts (too long, 1.5 s) | `space-air-loop` bed | −3 |
| `whoosh-deep` | big zoom across a vast distance (zoom ruler steps) | small moves; more than 2 per short | `impact-soft` when the zoom stops | −2 |
| `whoosh-reverse` | time rewinding, pulling back, something snapping in | forward motion | `pop-reveal` (combo) | −3 |
| `swish-light` | a small element sliding in (label, marker, chip) | scene cuts (too small) | — | −4 |
| `light-speed-pass` | light (or anything at c) crossing the frame | slow objects; sci-fi "warp" moments without light | `photon-travel` for the follow-up | −2 |
| `photon-travel` | one photon / light signal traveling a distance (a line drawing from A to B) | things that aren't light | `chime-discovery` on arrival | −1 |
| `jet-launch` | quasar or pulsar jets switching on / firing | generic transitions | after `glow-swell` (the quasar powers up, then the jets fire) | −1 |

### Tension
| Clip | For | Avoid | Pairs with | Start gain |
|---|---|---|---|---|
| `riser-soft` | a short build into a minor reveal (3 s) | the main reveal (use `riser-long`) | `impact-soft`, `pop-reveal` | 0 |
| `riser-long` | the build into THE main reveal (6 s) | more than once per short | `supernova` / `impact-cosmic` (combo) | +1 |
| `riser-shimmer` | a build into something luminous or beautiful (a galaxy appearing, stars filling in) | dark or violent reveals | `warm-shimmer`, `glow-swell` | 0 |

### Emphasis
| Clip | For | Avoid | Pairs with | Start gain |
|---|---|---|---|---|
| `hook-hit` | (1) the first second of a short: an immediate, prominent hit on frame 0 (attack 0.01 s); (2) **the phone layer of the main reveal**, −6 dB under `impact-cosmic` / `supernova` on the same peak | secondary moments (use `pop-reveal`); more than those two uses per short | the title appearing; the cosmic hit (layer) | 0 alone, −6 as a layer (untested in a mix) |
| `impact-soft` | underline a secondary fact or a scene landing (⚠ phone: add `pop-reveal` if it must be heard) | the main reveal | `riser-soft`, `whoosh-deep` | 0 |
| `impact-deep-soft` | a meaningful reveal that isn't THE main one | more than 2 per short | `riser-soft` | +1 |
| `pop-reveal` | a label, number or element appearing | big moments (too small) | `whoosh-reverse` (combo), `whoosh-soft` | +2 |
| `impact-cosmic` | THE main reveal, when it isn't an explosion (a scale payoff, "this is how big") | anything else; never with `supernova`/`gamma-flash`; never without its mid layer | `riser-long` (combo); **always** `hook-hit` at −6 dB on its peak (phone) | +2 |
| `supernova` | THE main reveal when a star explodes / dies violently | non-explosive reveals; never with `impact-cosmic`/`gamma-flash`; never without its mid layer | `riser-long` (combo); **always** `hook-hit` at −6 dB on its peak (phone) | +2 |
| `gamma-flash` | THE main reveal when it's a burst of light (gamma-ray burst, a flash) | anything else; never with the other big hits | ~0.5 s silence before it | +1 |
| `glow-swell` | anything gaining luminosity: the quasar switching on, a disk brightening | a star being born (use `star-ignite`) | `jet-launch` after it | 0 |
| `star-ignite` | an actual star igniting / being born | the quasar or other brightening (use `glow-swell`) | `warm-shimmer` | 0 |
| `stellar-collapse` | a star collapsing, an implosion | explosions (use `supernova`) | `event-horizon-fade` (combo), `deep-rumble` | +1 |

### Snap
| Clip | For | Avoid | Pairs with | Start gain |
|---|---|---|---|---|
| `ui-click-soft` | an element locking in place (a marker, a toggle in a diagram) | repeated rhythm (use `tick-soft`) | — | +4 (short-clip compensation included) |
| `tick-soft` | steps of a count-up, a ruler, a dial | single big moments | `number-settle` (combo) | +5 (compensation included) |
| `number-settle` | the hero number landing on its final value | numbers that don't count up first | after `tick-soft` | +6 (compensation included) |

### Texture
| Clip | For | Avoid | Pairs with | Start gain |
|---|---|---|---|---|
| `sparkle-soft` | stars twinkling in, small glints | under dense narration (busy highs) | `riser-shimmer` | 0 |
| `warm-shimmer` | a moment of awe or beauty settling in | tension or danger | `star-ignite`, `riser-shimmer` | 0 |
| `chime-discovery` | "aha" facts, a quiet moment of understanding | more than twice per short; reward/game feel | `photon-travel` arrival | +1 |
| `deep-rumble` | a massive object's presence; the black hole's FIRST appearance (one-shot) | as a bed; repeating it | then `accretion-swirl-loop` as the bed | +2 |
| `event-horizon-fade` | falling past an event horizon; sound dying into silence | ordinary scene ends | after `stellar-collapse` (combo) | 0 |
| `spaghettify-stretch` | tidal stretching near a black hole (spaghettification shown on screen) | generic pitch drops (use `redshift-slide` for light) | `deep-rumble` before it | 0 |
| `radiation-hum` | invisible radiation / energy pouring out; safe under narration | as a bed for the whole short | `glow-swell`, `jet-launch` | −2 |
| `solar-flare-surge` | a solar flare erupting, **in a pause only** | anywhere under speech (crackle) | — | 0 |

### Physics (code, `tools/synth_sfx.py`)
| Clip | For | Avoid | Pairs with | Start gain |
|---|---|---|---|---|
| `redshift-slide` | light visibly redshifting (a color shifting red as it stretches) | generic "falling" moments | `photon-travel` | 0 |
| `pulsar-ticks` | PSR B1919+21 (the first pulsar, 1.3373 s) on screen; any other pulsar = a variant at its real period | as a generic clock | — | +4 (compensation included) |
| `pulsar-ticks-fast` | the fastest pulsar on screen: separate ticks **spin up** from 2/s to its real 716/s and fuse into a tone (~4.8 s), then hold; ideally after the slow one for contrast | long stretches; trimming off the spin-up (a bare 716 Hz tone reads as a beep, the user rejected it) | after `pulsar-ticks` | −3 |
| `gw-chirp` | two black holes merging / gravitational waves shown on screen | other collisions | ~0.5 s silence after the ringdown | +1 |

### Ambient beds (one at a time; `mix_music.py`, ~16 dB under the voice)
| Clip | For | Avoid | Pairs with | Start level |
|---|---|---|---|---|
| `space-drone-loop` | the default bed: deep space, contemplative scale | with music or another bed | — | `--under 16` |
| `space-air-loop` | a lighter, airier bed: near planets, the solar system | with music or another bed | — | `--under 16` |
| `accretion-swirl-loop` | the bed ONLY while an accretion disk is on screen (`--from/--to`) | the whole short; with another bed | `deep-rumble` at the black hole's entrance | `--under 16` |

## Maintenance

After each produced short:
1. Update this file with what worked: measured gains over the voice (replace the guesses), combos
   that landed, clips that didn't (and why). Change a clip's status from "untested in a real mix"
   once it has been used in a mix the user approved.
2. Add the short's slug to each used clip's `used_in` in `catalog.json`.
3. Commit and push.

## Where these techniques come from

Audible-point placement, the ±20 ms target, the phone-band check and the 12 dB clutter rule were
adapted from the community skill `sfx-sync` (Meraj-08/motion-studio-skills, MIT); the layer
anatomy, priority order and distance rule from `game-audio` (davila7/claude-code-templates); the
final-mix checklist from `video-audio-design` (AbsolutelySkilled, MIT). Ideas only, no code
copied; none of them are installed.

## Mix log

*(Newest first. One entry per produced short: slug, clips used, gains that landed, what to change.)*

- none yet
