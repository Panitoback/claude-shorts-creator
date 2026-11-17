# Brand: the house style

> This is the style contract for every short on the channel. Every skill reads it before building
> anything, and the planning project reads it before writing a script. The same values exist as
> code in `remotion/src/brand.ts`, and the two must always change together.
> **Reference scene:** the `BrandReference` composition is this document rendered on screen. If
> it looks right, the brand is right.
>
> v1.7 · 2026-11-16 · direction: *Deep Field hybrid* (cinematic and editorial, with a few
> scientific annotations)

---

## 1. Identity and voice

- **What it feels like:** looking up at a clear night sky with a very good guide beside you.
  Calm, warm and precise. The universe is the spectacle, so the design stays out of the way.
- **Cinematic, editorial and honest.** Lots of dark space and one hero object per scene. Numbers
  are set like magazine headlines. A thin line of scientific annotation can prove a point, but
  never decorates.
- **Minimalist.** If an element doesn't help the viewer understand the one idea of the scene, it
  goes.
- **Code-drawn, never generated.** There are no photos and no AI images or video. Every object is
  drawn, so it can be exact.
- **Never:** neon sci-fi, lens-flare overload, busy HUDs, sticker or cartoon pop, hard drop
  shadows, rainbow gradients, or an exclamation-mark tone.

## 2. Palette

| Role | Name | Value | Use |
|---|---|---|---|
| Background | **space** | `#05060a` | Every scene. Near-black and faintly warm, **never pure `#000`** (one exception below) |
| Black-hole shadow | **hole** | `#000000` | **The single exception:** only the shadow of a black hole. It must read as darker than space itself (light can't escape), and it sits right next to the brightest white on the channel (a quasar's disk), so the contrast carries the luminosity without flares. Nothing else, ever, is pure black. |
| Warm wash | spaceWarm | `rgba(255,170,90,.08)` | One soft radial wash behind the hero object, and nothing more |
| Text | **ivory** | `#f4f1ea` | Numbers, captions, titles: all primary text |
| Text, waiting | ivoryFaint | ivory at 30 % | Caption words not yet spoken |
| **Primary accent** | **gold** | `#ffd58a` | Keywords, the unit of the hero number, anything glowing |
| Accent, deep | goldDeep | `#ffb35c` | Glow edges, warm secondary tone |
| **Science** | **sci** | `#9cc7ff` | **Annotations only:** values on leader lines and scale bars |
| Science line | sciLine | `#9cc7ff` at 70 % | Annotation strokes |
| Science text | sciText | `#c9d9ee` | Annotation and label words |

**Rules**
- **Gold means it matters, or it glows.** Use it once or twice per frame: the keyword, the unit,
  the light source. Gold is never used for annotations.
- **Blue means science.** Cool blue is reserved for annotations: leader lines, scale bars, their
  numbers and small labels. It is never used for keywords or decoration.
- **True-color bodies are an exception to the accents.** Earth may be its own pale blue, Mars its
  own rust, stars their real temperature colors (§5) and a quasar's jets their cool blue-white.
  These are depictions, not accents (and not annotations).

## 3. Typography

Two families. **Fraunces** is a heavy editorial serif with a warm italic. **Inter** is a clean
sans. Both are free Google fonts, so nothing has to be installed.

| Role | Font | Size (on 1080×1920) | Color | Use |
|---|---|---|---|---|
| **Hero number** | Fraunces 600 | 210 px, tight tracking | ivory | The big number of a scene: "1.3", "7.7", "4.6" |
| **Number unit** | Fraunces *Italic* 600 | 125 px | gold | The word glued to the number: "*million*", "*km/s*" |
| **Subject** | Fraunces *Italic* 500 | 80 px | ivory | What the number counts: "*Earths*", "*years*" |
| **Title** | Fraunces 600 | 110 px, up to 3 lines | ivory (one word may be gold) | Statements without a number |
| **Caption** | Inter 600 | 64 px | ivory | Narration on screen |
| **Keyword** | Fraunces *Italic* 600 | 80 px | gold | The highlighted word inside a caption |
| **Label** | Inter 600, UPPERCASE, wide spacing | 30 px | sciText | Small context above a number: "BY VOLUME" |
| **Annotation** | Inter 600, UPPERCASE, spaced | 28 px (never smaller) | sciText, value in sci | "EARTH ×1", "109 × EARTH'S WIDTH" |

- Size steps up for importance, never sideways: hero number → unit → subject → caption → label.
- A hero number plus its unit must fit within **~670 px of width** (§9). If it doesn't, shorten
  it ("1.3 million", not "1,300,000"), or move the unit to the subject line.
- Numbers use tabular figures, so a count-up doesn't jitter.

## 4. Captions

- **Sans text with the keyword in gold italic serif.** Spoken words are ivory, words not yet
  spoken are faint ivory, and the keyword turns gold as it is said.
- **At most 4 words on screen at once**, in one line, centered.
- **The caption lane** is centered at y = 1350, at most 720 px wide, and symmetric around the
  center of the screen, so it never reaches the right-hand button rail (§9).
- **One keyword per caption chunk at most.** The keyword is the word that carries the idea
  ("*Sun*", "*falling*", "*sideways*"), not just any long word.
- Captions follow the narration exactly. Word timings come from the real voice, never estimates.

## 5. Objects and light

- **Stars:** tiny points of light, mostly faint, with only a few bright ones carrying a tiny soft
  halo. Each one is tinted by its real temperature, from red-orange through yellow and white to
  blue-white. They never sit behind text (the starfield is cleared around text blocks) and never
  crowd a planet (no bright stars right next to one).
- **Built to survive compression.** Platforms re-encode every upload, and faint 1 px dots and
  slow fades are the first thing they erase. So every star is at least ~3 px across and clearly
  brighter than the background; **only the bright stars twinkle** (faint ones stay still: tiny
  flickers are exactly what an encoder throws away); and the sky is already there on the first
  frame rather than fading in mid-video. A near-invisible static grain sits over the frame so
  dark gradients don't break into bands; it skips pure black, so a black hole's shadow stays `#000`.
- **Suns and glowing bodies:** a limb-darkened disc (bright core to deeper edge) with a **soft
  radial corona** about 1.5 times the disc's radius. The glow is gentle: no lens flares, no rays,
  no bloom haze over the whole frame.
- **Planets and moons:** shaded spheres lit from one consistent direction (upper left by default),
  in true-to-life colors, each with its one or two **signature features** so no two read alike
  (Earth's continents, the Moon's dark maria, Mars's polar cap, Jupiter's Great Red Spot,
  Saturn's Cassini division…). They are simple and stylized, and never photographic.
  Surface features are soft-edged, low-contrast fills, never strokes or outlines (craters are
  shading: a darker floor and a faint lit rim), so the terminator stays the strongest read. Detail
  follows size: a small body is just color and shading. Planets don't emit light: no glow of
  their own, only a soft atmosphere where one is real (Earth), fading outward, never an outline.
- **The warm wash** (§2) sits behind the scene's hero object, whether a sun or a planet.
- **Quasars are the brightest thing on the channel, by contrast alone:** a pure-black shadow
  (§2's single exception) beside an inner disk that clips to near-white and grades to gold, with
  a corona stronger than any star's. The near-white stays on the disk's inner edge and its
  lensed far side; the corona around them is gold, so the disk keeps its shape. The disk is one smooth
  gradient, never stepped rings; its near side crosses in front of the shadow as one opaque
  band, and its far side shows as bright bands bent over the top and under the bottom. Jets are
  narrow cones like real ones: very thin at the core, slowly widening, soft-edged and fading
  toward their ends, never solid bars. At full power the corona reaches 3× the disk, and the host
  galaxy and stars all but vanish (the camera exposes for the quasar). As a quasar brightens, its galaxy and the background stars
  dim. Still no flares, rays or frame-wide haze.
- **Honest scale.** **When a scene is about size or distance, the sizes are true to scale.** If a
  true-scale object would be invisible, draw it at the smallest visible size (about 4 px), mark
  it with an annotation ring and say so in the script. Never quietly enlarge it.
- **One hero object per scene.** Secondary objects are smaller, dimmer or both.

## 6. Annotations

These are thin scientific marks that prove a point: a **leader line** with a label, a **scale
bar** with end ticks, a **marker ring** around a tiny object, or a **small data label**.

- **At most one or two per scene.** If a scene needs three, it is really two scenes.
- **Always readable on a phone:** strokes at least 2 px and labels at least 28 px, in sciText with
  the value in sci blue.
- **They draw in rather than pop in.** The marker appears, the line draws, then the label fades in
  (§8).
- **They live in empty space** and never cross the hero object or the caption lane.
- **They must be true.** Every annotation states a real, checked fact ("109 × Earth's width"
  because the Sun's radius is about 109 times Earth's).

## 7. Sound design: SFX

Same energy as the motion: **calm and cinematic, felt rather than heard.** Sound effects season
the edit and never become the show. Choose every cue by its FUNCTION:

| Function | Sound | Its job | Calm sub-types |
|---|---|---|---|
| **Motion** | whoosh | direction and speed; carry one beat into the next | `whoosh-soft`, `whoosh-wind`, `whoosh-deep` (big zoom), `whoosh-reverse` (time), `swish-light` (small element) |
| **Tension** | riser | "something is coming"; hold before a reveal | `riser-soft`, `riser-long` (6 s), `riser-shimmer` (NO cymbal urgency) |
| **Emphasis** | impact / pop / swell | "this moment matters"; lands on the reveal | `impact-soft`, `impact-deep-soft`, `pop-reveal`, `impact-cosmic` (the one hero payoff), `glow-swell` (something lights up), `hook-hit` (an immediate hit on the first frame of a short) |
| **Snap** | click | small, satisfying, alive | `ui-click-soft`, `tick-soft` (counters, rulers), `number-settle` (a count lands) |
| **Texture** | sparkle / chime / rumble | color under a moment | `sparkle-soft`, `warm-shimmer`, `chime-discovery`, `deep-rumble` (massive objects) |
| **Ambient** | seamless 30 s loop | a quiet bed under the whole short | `space-drone-loop`, `space-air-loop`, `accretion-swirl-loop` (black holes) (well under the voice) |
| **Cosmic events** | signature sounds | the object or event itself, named in the script | `supernova`, `stellar-collapse`, `star-ignite`, `gamma-flash`, `jet-launch`, `light-speed-pass`, `photon-travel`, `event-horizon-fade`, `spaghettify-stretch`, `radiation-hum`, `solar-flare-surge` (crackle: **pauses only**, flagged `not_under_narration`) |
| **Physics (code)** | synthesized from the real numbers | the sound IS the data | `redshift-slide` (falling pitch), `pulsar-ticks` (a real period: 1.34 s), `pulsar-ticks-fast` (716 Hz), `gw-chirp` (black-hole merger); new variants from `tools/synth_sfx.py` |

- **Always under the voice.** Quiet and tasteful, never louder than the narration. Silence is part
  of the mix; never fill wall to wall. Space is quiet, and the mix can be too.
- **Layer only the big moments (build and drop):** riser into impact on a scripted reveal, whoosh
  into pop on a cut. A layer is two events at the same or adjacent `at_s`. Keep layers for the 2–3
  hero beats.
- **Density:** score key transitions and reveals, not every sub-moment. Mark everything you could
  live without as `"optional": true`.
- **Sync to the visual beat, and often to the exact word.** Being off by 100 ms reads as sloppy, so
  use real frame and word times.
- **Levels.** Library clips are normalized to about −20 LUFS with a −1.5 dBFS peak ceiling. Under
  continuous narration, start transitions and whooshes at **−3**, pops and impacts at **0 to +3**,
  snaps at **0 to +7**, and layered hero risers at **0 to +2**.
- **Heard on a phone too.** Shorts are watched on phone speakers, which play almost nothing below
  ~300 Hz. A deep hit (the cosmic hits, `impact-soft`) is felt on headphones but silent on a
  phone, so every big moment gets a mid-range layer (`pop-reveal`) on the same peak. Choose clips
  by ear first; the layer fixes the phone.
- **No static or glitch textures under narration.** They read as noise at any gain. Clips with any
  crackle carry `"not_under_narration": true` and only go in a gap in the voice.
- **Source:** the ElevenLabs Sound Effects API (the channel's only outside service, our account),
  or synthesized in code for physics sounds (`source: "synthesized (code)"`). Every clip's
  `source`, `model` and `license` is recorded in the catalog.
- **The library is the durable asset:** `media/library/sfx/` (`catalog.json` + `clips/`). It grows
  with every video, so reuse before generating.
- **Music bed (optional):** slow, ambient and warm, sitting well under the voice. Avoid epic
  trailer drums.

## 8. Motion

Measured from the 5-second hybrid test. **Calm, smooth and physical.** Things arrive the way light
does, by brightening rather than bouncing. Times are at 30 fps.

| Moment | Duration | How |
|---|---|---|
| Starfield | present from frame 0 | no fade-in: the sky is already there on the first frame (§5) |
| A body appears | 30 frames (1 s) | fade in plus scale 0.96 → 1 |
| Its glow blooms | 46 frames (1.5 s) | fades in **slower than the body**, so light follows the object |
| A number counts up | 48 frames (1.6 s) | counts to its value, easing out (fast start, gentle landing) |
| Text arrives | 14 frames (0.5 s) | fade in plus rise of 22 px |
| Annotation | 8 + 16 + 12 frames | marker appears → line draws → label fades in |
| Scale bar | 24 frames (0.8 s) | draws **from its center outward** |
| Caption word | 5 frames | brightens as it is spoken |
| Keyword | ~10 frames | turns gold with a single soft pop (up to 1.06×) |

**Principles**
1. **One easing for arrivals:** ease out (fast start, gentle landing). Ease in-out for camera moves
   and morphs. Ease in only for exits.
2. **Sequence, don't stack.** Each element starts about 8 frames before the previous one settles,
   so the scene builds in a readable order: sky → object → number → annotations → caption.
3. **Ambient life never stops:** glows breathe ±1.5 % over about 5 s and the bright stars twinkle
   ±20 %, slow and out of sync. A still frame still feels alive.
4. **No bounce, spin, elastic, shake or hard snap.** The only overshoot allowed is the keyword's
   single soft pop.
5. **Layout doesn't jump.** Elements are laid out in their final position from the start and only
   fade or rise in place. A counting number already holds its final width.
6. **Exits are faster than entrances:** fade, plus a small fall if needed.

## 9. Layout and safe zones

The canvas is 1080×1920. Shorts, TikTok and Reels all lay their own buttons and text over the
video. These margins are the **conservative overlap of all three**; nothing that matters (text,
hero objects, annotations) goes inside them.

| Edge | Margin | What covers it |
|---|---|---|
| Top | **210 px** | platform tabs, search, camera |
| Bottom | **500 px** | handle, title, description, music ticker (measured on a real phone: Shorts reaches about y = 1420) |
| Right | **180 px** | like, comment, share and remix rail |
| Left | **60 px** | breathing room |

That leaves a **safe rectangle of 840 × 1210 px** from (60, 210) to (900, 1420).

- **Centered content stays symmetric:** anything centered on the screen keeps within x 180 → 900
  (720 px wide), so it clears the right rail without looking off-center.
- **Glow and stars may bleed past the margins.** They are atmosphere, not information.
- **Debug overlay:** every composition can draw the safe zones, plus the caption lane, on top of
  itself.
  - In Studio, set `safeOverlay` to `true` in the props panel.
  - For QA stills or renders, add `--safe` (files get a `-safe` suffix).
  - It is QA only and never goes into a final render.
- These values are approximate. Platforms change their UI, so re-check against a real phone
  screenshot now and then.

## 10. Delivery

- **1080×1920, 30 fps**, rendered at full scale. **Length depends on the format** (ranges in
  `docs/PROJECT_CONTEXT.md` §5); hard ceiling 180 s, only with explicit approval.
- **Frame 0 is the thumbnail.** It is fully composed, with the payoff visible and no fade from
  black. (The 5-second reference scene animates in from empty; a real short pre-rolls its hook so
  that frame 0 is already complete.)
- **The last frame rhymes with frame 0**, so the loop is seamless. There are no subscribe or
  comment-bait outros.
