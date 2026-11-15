# SFX library — usage guide

How to use each clip when scoring a short. Read it with `brand/brand.md` §7 (the taste contract)
and `/suggest-sfx` (the workflow) before writing any `sfx-plan.json`. The catalog says what a
clip IS; this file says WHEN to use it.

**Status of every clip: approved by the user's ear (2026-11-15), untested in a real mix.**
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
- **Crackle = pauses only.** `solar-flare-surge` (flagged `not_under_narration`) and anything
  with crackle go in a gap in the voice, never over speech. `mix_sfx.py --print` flags them.

### Channel combos (recipes)
| Moment | Recipe | Timing |
|---|---|---|
| **The main reveal** | ~0.5 s near-silence → `riser-long` → `supernova` (or `impact-cosmic`) | the riser ends ON the reveal frame / key word; leave the half second of silence right before the hit (drop the bed or other cues there) |
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
  LUFS): `tick-soft` (−23.3), `number-settle` (−25.0), `pulsar-ticks` (−23.4), `ui-click-soft`
  (−22.1). Add **+3 to +5 dB** on top of the usual start (already included below).
- A cue that sits fully under continuous speech may never measure (the duck eats it): accept
  felt-not-heard or move it to a gap.

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
| `impact-soft` | underline a secondary fact or a scene landing | the main reveal | `riser-soft`, `whoosh-deep` | 0 |
| `impact-deep-soft` | a meaningful reveal that isn't THE main one | more than 2 per short | `riser-soft` | +1 |
| `pop-reveal` | a label, number or element appearing | big moments (too small) | `whoosh-reverse` (combo), `whoosh-soft` | +2 |
| `impact-cosmic` | THE main reveal, when it isn't an explosion (a scale payoff, "this is how big") | anything else; never with `supernova`/`gamma-flash` | `riser-long` (combo) | +2 |
| `supernova` | THE main reveal when a star explodes / dies violently | non-explosive reveals; never with `impact-cosmic`/`gamma-flash` | `riser-long` (combo) | +2 |
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
| `pulsar-ticks-fast` | the fastest pulsar (716 Hz) on screen, ideally after the slow one for contrast | long stretches (a continuous tone tires fast) | after `pulsar-ticks` | −3 |
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

## Mix log

*(Newest first. One entry per produced short: slug, clips used, gains that landed, what to change.)*

- none yet
