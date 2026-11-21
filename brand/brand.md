# Brand: the house style

> This is the style contract for every short on the channel. Every skill reads it before building
> anything, and the planning project reads it before writing a script. The same values exist as
> code in `remotion/src/brand.ts`, and the two must always change together.
> **Reference scene:** the `BrandReference` composition is this document rendered on screen. If
> it looks right, the brand is right.
>
> v2.9.1 · 2026-11-20 · direction: *Deep Field hybrid* (cinematic and editorial, with a few
> scientific annotations) · **energy curve**: a high-energy hook, a calm body, bursts on the peaks ·
> **visual variety**: scenes change, and every number is shown · **whip transitions** approved as a
> hand-off (§8) · **dynamism** (v2.3): shape match cuts, fly-throughs, a living camera, punch-ins,
> beat sync, motion blur on fast moves only (§8) · **fill the frame** (v2.4): hero sizes, motion that
> registers in sparse scenes, ≤ 1 s of black at the end (§5, §8) · **two visual modes** (v2.5):
> SPACE VIEW (the default, §1–§10) and **GROUND VIEW**, the sky as seen from Earth (§11) ·
> **Race format** (v2.6): one calm continuous scene, the exception to the hook burst, the new-idea
> rhythm and hero size (§5, §8) · **centered, fuller safe area** (v2.7): right rail ignored, bottom
> margin 320 instead of 500, a 960 × 1390 safe rectangle (§9) · **the first second** (v2.8): frame 0
> states the question in plain words, large, already moves, and its key elements read at feed size;
> in a Race the speed is a small secondary line (§8, §10) · **the voice** (v2.9): warm, confident,
> conversational, never intense or emphatic; no delivery tags (§7)

---

## 1. Identity and voice

- **Channel name:** ***Look Back in Time***.
- **What it feels like:** looking up at a clear night sky with a very good guide beside you.
  Warm and precise. The universe is the spectacle, so the design stays out of the way.
- **An energy curve, not one energy level.** The first ~3 s grab (fast, bright, loud enough for
  a phone); the body is calm and cinematic; the main reveal and the twist get a short burst of
  energy, then settle. The identity (palette, type, honest scale, annotations, code-drawn) never
  changes with the energy: only speed, camera and sound do.
- **Cinematic, editorial and honest.** Lots of dark space and one hero object per scene, but
  never one scene for the whole short: what the voice explains, the screen shows (§5). Numbers
  are set like magazine headlines. A thin line of scientific annotation can prove a point, but
  never decorates.
- **Two visual modes, one identity (v2.5).** **Space view** (out among the objects, on `space`
  black) and **ground view** (the sky as you see it from Earth: a true-to-life sky, a dark
  horizon silhouette, optionally a small observer, §11). Typography, gold, annotations, captions,
  the energy curve, visual variety, motion and sound rules are the same in both; only the
  backdrop changes. A short may use one mode or travel between them (§11 transitions).
- **Minimalist.** If an element doesn't help the viewer understand the one idea of the scene, it
  goes.
- **Code-drawn, never generated.** There are no photos and no AI images or video. Every object is
  drawn, so it can be exact.
- **Never:** neon sci-fi, lens-flare overload, busy HUDs, sticker or cartoon pop, hard drop
  shadows, rainbow gradients, or an exclamation-mark tone.

## 2. Palette

| Role | Name | Value | Use |
|---|---|---|---|
| Background | **space** | `#05060a` | Every space-view scene (ground view uses the sky gradients of §11). Near-black and faintly warm, **never pure `#000`** (one exception below) |
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
- **Sky colors are depictions too (v2.5).** In ground view, the muted, true-to-life colors of the
  sky (a night's deep blue-black, twilight blue, a dusk horizon's dull amber, a day's pale or muted blue,
  an eclipse's 360° sunset ring) are depictions like a true-color planet, not accents: they never
  stand in for gold or for annotation blue. Their values live in §11.

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
- A hero number plus its unit must fit within **~800 px of width** (§9; ~670 px before v2.7). If it doesn't, shorten
  it ("1.3 million", not "1,300,000"), or move the unit to the subject line.
- Numbers use tabular figures, so a count-up doesn't jitter.

## 4. Captions

- **Sans text with the keyword in gold italic serif.** Spoken words are ivory, words not yet
  spoken are faint ivory, and the keyword turns gold as it is said.
- **At most 4 words on screen at once**, in one line, centered.
- **The caption lane** is centered at y = 1500 (v2.7; 1350 before), at most 720 px wide, and
  symmetric around the center of the screen (§9). **Checked on real phones (2026-11-20):** the
  user viewed published shorts from another account on YouTube, Instagram and Facebook, and
  captions at y = 1500 are not covered on any of them. It stays at 1500; re-check if a platform
  changes its UI.
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
- **Fill the frame (v2.4).** Unless the scene is about true scale, the hero object (an egg, a cup,
  a particle box, a balance, a diagram) spans **~50–60 % of the safe width or more**; no scene is
  half empty black. Small actors (particles, an arrow, a point, a black hole beside a diagram) are
  drawn **clearly visible at phone scale**: particles ≥ ~10 px radius in a hero role (~24 px when two
  of them are the whole scene), lines ~6–10 px, an arrowhead ~90 px. A diagram (timeline, chart)
  is centered and uses the safe height, with labels at 60 px or more. Keep ~3 % room around wide
  elements in scenes the camera pushes into.

### Visual variety

One hero object per scene, **not one scene per short**.

- **A new visual idea at least every ~5–10 s** (`SCENE.newIdeaEvery`). A new idea is something
  the viewer hasn't seen yet: a new object or diagram, a comparison, a framing that shows
  something new. Turning a dial on the same picture (brighter, dimmer, on/off) doesn't count.
- **Every number or comparison is shown, not just narrated.** Mass, temperature, efficiency,
  distance, age: each claim gets a picture of its own: a scale comparison, a diagram, bars or a
  meter, a timeline or a counter. Test: with the sound off, the screen should still make the
  claim.
- **Continuity means smooth transitions, not a single scene.** Scenes hand over with a camera
  move, a morph, an object carried into the next scene, or a **whip transition** (§8: mainly the
  hook and the peaks), never a hard cut to an unrelated picture with no motion. The short still
  travels through several scenes.
- **Race exception (v2.6, PROJECT_CONTEXT §4).** A Race short is ONE continuous scene by design:
  rows of small movers from one starting line, arriving one by one. Its constant motion satisfies
  visual variety; the new-idea rhythm and the hero-size targets don't apply to it. The race scene
  is tagged *intentional* so the render checks don't flag it (empty frames are still checked).

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

Sound follows the **energy curve** (§1, §8):

| Part | Sound energy | What it means |
|---|---|---|
| **Hook** (first ~3 s) | **high, heard on a phone** | a prominent, phone-audible hit in the first second: `hook-hit` on frame 0, or a short riser → hit landing on the hook's visual change; a motion cue (whoosh) on the camera move, one whoosh per whip in a whip montage (§8). The hook's energy comes from the picture and the sound, never from a louder read: the voice stays in its default delivery (below) |
| **Body** | **calm, felt rather than heard** | sound seasons the edit and never becomes the show |
| **Peaks** (the main reveal, the twist) | **a burst, heard on a phone** | the reveal combo (riser → silence → hit + `hook-hit` phone layer); the twist gets a phone-audible hit or swell; then the sound settles back |

Choose every cue by its FUNCTION:

| Function | Sound | Its job | Calm sub-types |
|---|---|---|---|
| **Motion** | whoosh | direction and speed; carry one beat into the next | `whoosh-soft`, `whoosh-wind`, `whoosh-deep` (big zoom), `whoosh-reverse` (time), `swish-light` (small element) |
| **Tension** | riser | "something is coming"; hold before a reveal | `riser-soft`, `riser-long` (6 s), `riser-shimmer` (NO cymbal urgency) |
| **Emphasis** | impact / pop / swell | "this moment matters"; lands on the reveal | `impact-soft`, `impact-deep-soft`, `pop-reveal`, `impact-cosmic` (the one hero payoff), `glow-swell` (something lights up), `hook-hit` (an immediate hit on the first frame of a short) |
| **Snap** | click | small, satisfying, alive | `ui-click-soft`, `tick-soft` (counters, rulers), `number-settle` (a count lands) |
| **Texture** | sparkle / chime / rumble | color under a moment | `sparkle-soft`, `warm-shimmer`, `chime-discovery`, `deep-rumble` (massive objects) |
| **Ambient** | seamless 30 s loop | a quiet texture under the short (or part of it), below the music | `space-drone-loop`, `space-air-loop`, `accretion-swirl-loop` (black holes) (well under the voice) |
| **Cosmic events** | signature sounds | the object or event itself, named in the script | `supernova`, `stellar-collapse`, `star-ignite`, `gamma-flash`, `jet-launch`, `light-speed-pass`, `photon-travel`, `event-horizon-fade`, `spaghettify-stretch`, `radiation-hum`, `solar-flare-surge` (crackle: **pauses only**, flagged `not_under_narration`) |
| **Physics (code)** | synthesized from the real numbers | the sound IS the data | `redshift-slide` (falling pitch), `pulsar-ticks` (a real period: 1.34 s), `pulsar-ticks-fast` (716 Hz), `gw-chirp` (black-hole merger); new variants from `tools/synth_sfx.py` |

- **The voice (v2.9, chosen by ear 2026-11-20).** The channel voice reads **warm, confident and
  conversational**, the same in every line, hook included: a good guide talking to one person,
  **never intense or emphatic**. In practice: no delivery tag, stability 0.50 (the default in
  `tools/gen_voice.py`). A `[curious]` or `[emphatic]` tag sounded more performed than the plain read.
- **Always under the voice.** Never louder than the narration, even in the hook and on the peaks
  (they are louder than the body, not louder than the voice). Silence is part of the mix; never
  fill wall to wall. Space is quiet, and the body of the mix can be too.
- **Layer only the high-energy moments (build and drop):** the hook, the main reveal, the twist.
  A layer is two events at the same or adjacent `at_s`, aligned by their audible peak.
- **Density:** score key transitions and reveals, not every sub-moment. Mark everything you could
  live without as `"optional": true`.
- **Sync to the visual beat, and often to the exact word.** Being off by 100 ms reads as sloppy, so
  use real frame and word times.
- **Levels.** Library clips are normalized to about −20 LUFS with a −1.5 dBFS peak ceiling. Under
  continuous narration, start transitions and whooshes at **−3**, pops and impacts at **0 to +3**,
  snaps at **0 to +7**, and layered hero risers at **0 to +2**.
- **Heard on a phone too.** Shorts are watched on phone speakers, which play almost nothing below
  ~300 Hz. **The hook and the peaks must pass the phone check** (every mix reports it); body cues
  may stay felt-not-heard. A deep hit (the cosmic hits, `impact-soft`) is silent on a phone, so
  the main reveal gets `hook-hit` as a mid-range layer on the same peak (smaller moments:
  `pop-reveal`). Choose clips by ear first; the layer fixes the phone.
- **Still never:** trailer slams, cymbal-urgency risers, glitch, static, cartoon or meme sounds,
  at any energy.
- **No static or glitch textures under narration.** They read as noise at any gain. Clips with any
  crackle carry `"not_under_narration": true` and only go in a gap in the voice.
- **Source:** the ElevenLabs Sound Effects API (the channel's only outside service, our account),
  or synthesized in code for physics sounds (`source: "synthesized (code)"`). Every clip's
  `source`, `model` and `license` is recorded in the catalog.
- **The library is the durable asset:** `media/library/sfx/` (`catalog.json` + `clips/`). It grows
  with every video, so reuse before generating.
- **Background: up to two layers, one of each.** An ambient loop (texture) and a music bed
  (emotion) may play together. Levels: **voice > SFX > music > ambient**: the music ~18–20 dB under
  the voice, ducked under speech and rising on the peaks; the ambient loop ~24 dB under the voice,
  also ducked. Music is slow, warm, cinematic ambient for a space documentary (soft pads, a gentle
  pulse, sparse piano or strings); never epic trailer drums, vocals or anything busy. Library beds
  are steady and loop seamlessly: each short shapes the bed in the mix (ducking, swells on the
  hook, main reveal and twist, fades), not in the composition. Source: Eleven Music with our
  account; `source` and `license` per bed in `media/library/music/catalog.json`.

## 8. Motion

**Smooth and physical at every energy.** Things arrive the way light does, by brightening rather
than bouncing. What changes along the energy curve (§1) is speed and camera. Times are at 30 fps.

### The energy curve

| Part | Motion | Rules |
|---|---|---|
| **Hook** (first ~3 s) | **high energy** | fast camera moves with a **strong ease-out** (`EASE.punch`: the bulk of the move in its first 12–24 frames, then a soft landing, ~1.5 s at most in all; big zooms are eased in log scale so the zoom looks even); ignition / zoom reveals; **moving on frame 0** (the move is already under way on the first frame: `EASE.punch` starts fast, no hold before it); **the question in big plain words from frame 0**, its words lighting up on their spoken times (a title that arrives word by word would leave frame 0 without its question, so it comes only after the question is up); **parallax depth** (2–3 star layers moving at different speeds during camera moves); **a clear visual change every 2–3 s** for the first ~10 s |
| **Body** | **calm, cinematic** | the table below: slow arrivals, ease in-out camera moves, ambient life |
| **Peaks** (main reveal, twist) | **a burst, then settle** | one fast move or ignition (`EASE.punch`, its bulk in 12–24 frames) on the beat, synced to its sound; then back to body pacing within ~1 s |

**Race (v2.6) is calm end to end:** no hook burst, no peaks, no punch-ins or whips. **Frame 0 (v2.8)
leads with the question in plain words**, large at the top (title size, the biggest text on screen),
over the full board. The mover's speed is **one small secondary line** under the title or next to
the rule line (Inter 600 caps, `sciText`, the rule line's size), never the big top element. The
movers are **already leaving on frame 0**: a short ease-in that moves from the first frame (≤ ~6
frames to cruise), then a steady cruise; each eases to a stop on arrival. The loop's glide back
hands straight into the departure, with no still hold at the seam. Sound: a calm bed, a soft cue
on each arrival, no hook hit.

### Hand-offs between scenes

Approved hand-offs, in order of preference: a **shape match cut**, a **fly-through**, a **camera
move**, a **morph**, an **object carried** into the next scene, and the **whip transition**.

- **Shape match cut (first choice):** one shape survives the cut and changes geometry into the next
  scene's key element (a sun becomes a bar, a box's frame becomes a balance beam, a line becomes an
  axis). Ease in-out, ~14–18 frames; the old scene fades around it, the new one builds on its final
  shape. Component: `ShapeMatch` (filled or outline).
- **Fly-through:** the camera dives into an object (a digit, a ring, a black hole) and comes out in
  the next scene: a small wind-up, a log-scale zoom (~24–26 frames), motion blur in the fast middle,
  a soft landing. One or two per short at most. Component: `FlyThrough`. Sound: one deep whoosh
  peaking just before the landing.

- **Whip transition:** the outgoing picture sweeps off fast in one direction, with directional
  motion blur, while the next one sweeps in from the opposite side. The swap happens at **peak
  speed**: the bulk of the move takes ~6–10 frames (`ENERGY.whipMove`), with `EASE.punch`-style
  speed (fast, then a soft landing, no bounce). Component: `WhipTransition` / `WhipMontage`.
- **Where:** mainly the **hook** (a rapid montage of related pictures, ~0.6–1 s each) and the
  **peaks**. In the calm body, prefer morphs, camera moves and carried objects; use whips there
  sparingly.
- **Sound:** **one whoosh per whip**, aligned so its **peak lands on the swap**; phone-audible in
  the hook. Vary the clip or the pitch across consecutive whips so they don't sound identical.
- **Still banned:** a hard cut to an unrelated picture with no motion, shake, and flicker faster
  than ~3 Hz.

- **Constant motion:** something always moves (a slow drift, infalling gas, the camera), so no
  frame is a still, especially in the hook: **frame 0 already moves visibly** (v2.8), and the loop
  seam doesn't hold still.

### Dynamism (v2.3)

- **A living camera:** the whole body sits inside one virtual camera (`Camera`) with a slow drift
  (~10 px, ~12 s period, a ±0.5 % breathing zoom) and **parallax**: the far star layer moves at
  ~0.15–0.45 of the objects (`CameraLayer depth`). The drift fades to zero in the hook's first frame
  and the loop's last, so frame 0 still matches the last frame (so the drift never counts as frame 0's
  motion: the hook's own move or the movers must be under way). Captions stay outside the camera.
- **Punch-in instead of shake:** on the **big hits only** (the main reveal, the final peak such as
  "heat death"): zoom 1 → 1.03 in 6 frames (ease-out), then it settles back over ~1.2 s (ease
  in-out). No overshoot. Shake stays banned. At most 2–3 per short.
- **Anticipation yes, overshoot no:** a big move may start with a small wind-up the other way
  (≤ 8 % of the move, ~8 frames). Arrivals stay soft: never past the target and back.
- **Keyword zooms only on peak words,** not on every gold keyword (it would pump all the time).
- **Beat sync:** scene changes and camera accents land on the pulse of the music bed (the
  quarter-note grid measured for each bed, `beat.ts`). A cut snaps to the beat only when the beat
  falls within ~0.18 s of its word; the voice wins otherwise. Punch-ins stay on the spoken hit.
- **Motion blur only on fast moves:** pull-backs, whips, flights, fly-throughs (`@remotion/motion-blur`,
  8 samples, 180° shutter), never on slow body motion or on text at rest. Blurred star frames look
  flatter for a few frames; the streaks read as speed.
- **Light 3D:** a flat element (a timeline) may tilt back in CSS perspective (≤ ~22°) while the camera
  flies along it, and come back flat on arrival. No free 3D camera.
- **Particles that form figures:** drifting particles can condense into a number (5×7 dot font,
  `ParticleGlyphs`) and release it again; a count can roll on odometer wheels (`OdometerNumber`).
- **Motion that registers (v2.4).** On a dark, sparse frame a slow drift changes almost no pixels, so
  it reads as a still. Every scene gets **a slow push-in** (~1.03–1.08 over the scene, reset inside a
  whip or eased back before the next), and every sparse scene gets **moving content tied to its
  idea**: a stream of gold particles flowing one way along time's arrow or a timeline's axis, a gas
  still mixing faintly (~30 %) behind a diagram, a counter rolling. Check it by measuring per-second
  motion on the render: no near-still second except deliberate holds (the loop's last frames, the
  darkness before the ending).
- **Darkness is short (v2.4).** A near-black screen lasts **≤ 1 s**, even at an ending about the dark
  (heat death). Something visible stays: the last glowing point.
- **The sky going out** (an ending like heat death) is a climax, not a fade: **every star in the
  frame**, in every layer, switches off one by one (each a clear ~0.5 s fade), slowly at first and
  faster toward the peak word, until only the last point is left (`Starfield offAll`). Never dim the
  whole sky at once (compression smears global fades).
- **Banned at every energy:** shake, bounce, elastic, spin, lens flares, glitch, neon, fast
  flicker (anything strobing faster than ~3 Hz), hard snaps. Fast means a fast ease-out, not
  jerky.

### Body timings

Measured from the 5-second hybrid test.

| Moment | Duration | How |
|---|---|---|
| Starfield | present from frame 0 | no fade-in: the sky is already there on the first frame (§5) |
| A body appears | 30 frames (1 s) | fade in plus scale 0.96 → 1 |
| Its glow blooms | 46 frames (1.5 s) | fades in **slower than the body**, so light follows the object |
| A number counts up | 48 frames (1.6 s) | counts to its value, easing out (fast start, gentle landing); or rolls on odometer wheels |
| Punch-in | 6 + 36 frames | 1 → 1.03 (ease-out), back to 1 (ease in-out); big hits only |
| Shape match cut | 14–18 frames | geometry and corner radius morph, ease in-out |
| Fly-through | 24–26 frames | wind-up 8 frames, log zoom, blur in the middle, soft landing |
| Text arrives | 14 frames (0.5 s) | fade in plus rise of 22 px |
| Annotation | 8 + 16 + 12 frames | marker appears → line draws → label fades in |
| Scale bar | 24 frames (0.8 s) | draws **from its center outward** |
| Caption word | 5 frames | brightens as it is spoken |
| Keyword | ~10 frames | turns gold with a single soft pop (up to 1.06×) |

**Principles**
1. **One easing for arrivals:** ease out (fast start, gentle landing). Ease in-out for body camera
   moves and morphs; `EASE.punch` (strong ease-out) for hook and peak camera moves. Ease in only
   for exits.
2. **Sequence, don't stack.** Each element starts about 8 frames before the previous one settles,
   so the scene builds in a readable order: sky → object → number → annotations → caption.
3. **Ambient life never stops:** glows breathe ±1.5 % over about 5 s and the bright stars twinkle
   ±20 %, slow and out of sync. A still frame still feels alive.
4. **No bounce, spin, elastic, shake or hard snap, at any energy.** The only overshoot allowed is
   the keyword's single soft pop.
5. **Layout doesn't jump.** Elements are laid out in their final position from the start and only
   fade or rise in place. A counting number already holds its final width.
6. **Exits are faster than entrances:** fade, plus a small fall if needed.

## 9. Layout and safe zones

The canvas is 1080×1920. Shorts, TikTok and Reels all lay their own buttons and text over the
video. **Since v2.7 (2026-11-19) the layout is centered and frame-filling**: the right-hand button
rail is ignored (the right margin equals the left one, so everything is symmetric around x = 540)
and the bottom keeps a moderate margin instead of the conservative one, so graphics can be bigger.
Nothing that matters (text, hero objects, annotations) goes inside these margins.

| Edge | Margin | What covers it |
|---|---|---|
| Top | **210 px** | platform tabs, search, camera |
| Bottom | **320 px** | the lowest band of handle / title / description / music ticker (the caption lane at y = 1500 was checked on real devices on 2026-11-20 and stays clear on YouTube, Instagram and Facebook; re-check if a platform changes its UI) |
| Right | **60 px** | breathing room (the like/share rail is ignored on purpose: content stays centered) |
| Left | **60 px** | breathing room |

That leaves a **safe rectangle of 960 × 1390 px** from (60, 210) to (1020, 1600).
(Until v2.6: bottom 500, right 180, a 840 × 1210 rectangle; shorts made before v2.7 used it.)

- **Centered content is centered on the screen** (x 540), not on the safe rectangle's old
  off-center middle.
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
- **Frame 0 is composed, but it is not the cover.** It is a complete, readable image with no fade
  from black (the subject is already there), and it is already *inside* the hook's motion, not its
  payoff: a dormant black hole about to ignite, an extreme close-up about to pull back. **The
  cover (thumbnail) is chosen at upload** from any frame (usually the hook's payoff or the main
  reveal). (The 5-second reference scene animates in from empty; a real short pre-rolls so frame
  0 is already complete.)
- **The first second (v2.8, every format).** Half the viewers decide in the first ~2 s (measured on
  the first Race: retention 100 % → ~45 % in 2–3 s, then nearly flat). Frame 0 must:
  1. **state the curiosity in plain words, large**: the question (or claim) the short opens, at
     title size (§3), readable in the feed in under a second; it is the first and biggest text;
  2. **not open on jargon**: no technical label, unexplained term or bare number as the first thing
     read (labels, speeds, rules and units come after it, small);
  3. **move visibly**: the hook's motion is under way on frame 0 (the camera drift alone doesn't
     count, §8), and the loop's last frames don't hold still before the seam;
  4. **read at feed size**: the question and the hero are big and inside the safe area, not a
     small detail in an empty frame.
- **The last frame leads back into frame 0**, so the loop is seamless: the ending returns to the
  hook's starting state, not to its payoff. There are no subscribe or comment-bait outros.
- **Audio: −14 LUFS integrated (±0.5), true peak ≤ −2.0 dBTP measured on the final encoded file**,
  and the audio ends with the picture (no tail past the last frame: it would freeze the loop seam).
  `tools/finalize_audio.py` does all three and fails loudly when the file is out of spec. A review
  copy keeps the final's audio stream untouched.
- **Checked on the render before anyone watches it:** no near-still run ≥ 4 s, no near-empty frame
  run > 1 s, no hero too small for ≥ 2 s (`tools/motion_check.py`, `tools/frame_check.py`; flags
  listed in the QA report).

## 11. Ground view (v2.5): the sky as seen from Earth

The channel's near-space topics (Earth, the Moon, the Sun, satellites, the sky you can see) often
happen *from the ground*. Ground view keeps the whole identity and changes only the backdrop:
**a sky, a horizon, and sometimes a person looking up.** It feels like the brand's founding image
(§1): a clear sky with a good guide beside you.

### The sky (`SkyView`)

A gradient **by elevation** (horizon → zenith) in true-to-life colors (depictions, §2), so it stays
right when the camera tilts or the field of view narrows (a telephoto view only sees the band just
above the horizon, as a real lens does). Six presets, and the sky can blend from one to the next:

| Preset | Zenith → horizon | Stars | When |
|---|---|---|---|
| **night** | `#05060a` → `#121a2b` (a faint airglow at the horizon) | full sky | the default for anything seen at night |
| **twilight** | `#0b1226` → `#33445f` | the brightest only | the blue hour, after dusk |
| **dusk** | `#1a2140` → `#b8764a` (a dull amber band, never saturated orange) | none, or 1–2 planets | sunset, sunrise |
| **dayMuted** | `#2c4466` → `#6f879e` (darker and greyer than a real noon sky, as if exposed for the Sun) | none | a quiet daylight backdrop under text; an annular eclipse's "slightly dimmed daylight" |
| **day** (bright) | `#4176b6` → `#bcd2e4` (pale blue, **lighter toward the horizon**) | none | full daylight: the start of a total eclipse, so day → totality is a strong contrast |
| **eclipse** | `#0c1222` → a **360° sunset ring** `#8a6a4a` at the horizon | bright stars and planets come out | totality: a dial blends *day → eclipse* as the Moon covers the Sun |

- **Text always reads, without darkening the sky.** Ivory text (large text) needs ≥ 3 : 1. Every
  preset except bright day passes everywhere (worst: dusk's horizon 3.25 : 1). Over the **bright day**
  sky, text reads by **placement** (the upper sky: bare zenith 4.1 : 1, measured 3.6 : 1 behind a
  title in the top of the safe area) or with the **soft text shadow** (`SKY_TEXT_SHADOW`: a wide,
  dark, feathered halo, measured 6.5 : 1 around caption glyphs in the caption lane, where the bare
  sky is only 1.4–2.2 : 1). No scrims, no boxes.
- **Stars come out one by one, never as a fade of the whole sky.** When the sky darkens, the
  brightest points appear first (planets, then the brightest stars), each a clear ~0.5 s fade,
  then fainter ones: the same compression rule as the sky going out (§8), run forwards. A sky
  that is night from frame 0 already has its stars (§5).
- **Brightness changes of the whole sky are slow and smooth** (≥ ~1.5 s), never a flicker; the
  eclipse darkening is the one sky change allowed to be dramatic, and it is still a ramp.
- **Grain is mandatory** over sky gradients (they band first under compression), as in §5.
- Stars in ground view follow §5 (sizes, tints, only bright ones twinkle) and never sit on the
  silhouette: they stop at the horizon.

### The horizon (`Horizon`)

**Flat, dark silhouettes, never photographic:** no texture, no lit faces, no outlines. Variants:
**hills**, **mountains**, **treeline**, **city skyline** (generic blocks and a few lit windows at
most, no recognizable skyline or landmark), **sea** (a flat line; the Sun or Moon may lay a soft,
broken reflection path on it).

- Color: near-black, slightly darker than the sky just above it, never pure `#000`. Farther
  layers take a little of the sky's color (aerial perspective), so 2–3 layers read as depth.
- **Real heights at real distances.** Each layer is a true height (a 15–20 m treeline, 30–150 m
  buildings, 1–3 km mountains) at a true distance, projected with the frame's field of view, so the
  silhouettes obey the same optics as the Sun and the Moon.
- **Parallax-ready:** each layer has a depth; moving the camera sideways moves near layers more
  than far ones, and the sky and stars don't move. (Panning or tilting moves everything together:
  that's a rotation, not parallax.)
- **The horizon is always level.** The camera never rolls.
- **Placement:** by default the horizon sits near the bottom of the safe rectangle and the
  silhouettes fill the platform-UI band below it (§9), so the sky, the safe area, holds the
  information. The horizon height is a prop (16:9-ready), never a fixed y.

### The observer (`Observer`, optional)

A small, sober human silhouette looking up, for scale and emotion: the same flat dark as the
horizon, realistic proportions, a few poses (standing, head tilted up; sitting; pointing). **No
cartoon look, no face, no gesture bigger than pointing.** One per scene, small (it is never the
hero; the sky is), standing **on** the nearest horizon layer (never sunk into it).

### The Sun and the Moon in the sky

- **True apparent size, always.** Both are ~0.5° across (Sun 0.533°, Moon 0.49–0.56°, 0.518° on
  average), drawn against the frame's **field of view** (degrees across the frame width). **Honest
  optics, two cases:**
  - **Wide frame** (a landscape, ~60° across): the disc is ~9 px, small and honest. **Never
    enlarge a disc in a wide frame**: no "giant Moon" pasted over a wide landscape.
  - **Telephoto** (a narrow field of view, 1–8° across): a **big Sun or Moon is allowed**, because
    that's what a long lens really shows: at 1.5° the Moon is ~370 px across. The horizon then
    follows the same optics: whatever stands in front of the disc is **far away, in true
    proportion** (a ridge or a skyline 10–20 km off; a 150 m tower at 20 km is ~0.43°, a little
    smaller than the Moon). Say "telephoto" in the script or on screen when it matters (a moon-
    illusion topic should).
- When a scene is about their size, a scale bar may say "0.5°".
- The Sun is a glowing body (§5, gold is right: it is the light source), reddened and dimmer near
  the horizon. The Moon is the Planet component's Moon, with its phase; in a day sky it is pale
  and low-contrast, as it really looks.

### The eclipse (`Eclipse`)

One progress dial plays a total solar eclipse in true order, then can play it in reverse:

1. **Partial:** the Moon slides over the Sun. It is seen **only where it covers the Sun** (against
   a daylight sky the Moon is invisible, as in reality). Its silhouette, whenever it shows, is in
   the **space color family** (`#0b0d14` with a faint earthshine toward `#1a1f2c`), **never `#000`**
   (pure black stays the black hole's alone, §2). The sky barely changes until ~90 % coverage,
   then drops steeply, as in reality.
2. **Darkening:** the last minute ramps the sky *day → eclipse*; the 360° sunset ring appears on
   the horizon.
3. **Baily's beads → diamond ring:** a few small bright points on the limb, then one; small and
   **subtle**: no rays, no lens flare, no starburst.
4. **Totality:** the **corona** appears, pearly ivory-white (not gold), soft and fading outward
   to ~2–3 Sun radii with a few faint streamers; tiny pink-red prominences at the limb (optional).
   Bright stars and planets come out one by one. The photosphere itself reads near-white (warming
   only at the limb), so the last crescent is a bright sliver, not an orange one.
5. **Reverse:** diamond ring on the other side, the corona goes, the sky brightens, the stars go
   one by one.

**Annular eclipse** (same component): the Moon is ~6 % narrower than the Sun, so totality never
comes. At mid-eclipse a **thin bright ring of honest width** (0.06 Sun radii: ~12 px on a 200 px Sun,
**never thickened**), **no corona, no beads, no stars**, and the sky stays light: "slightly dimmed
daylight" (bright day blended a little toward dayMuted).

### Ready-made ground scenes (`GroundScene`)

- **Sunset on the sea:** the Sun on a sea horizon at true apparent size for the view, reddened and
  slightly flattened by refraction, a dusk glow around it, a soft broken reflection path on the water.
- **Full Moon rising over hills:** a full Moon at true apparent size in the blue hour, rising from
  behind hills pushed far enough away for the field of view (honest optics).

### The angle cone (`AngleCone`)

For "same apparent size" ideas (the Sun is ~400× wider than the Moon and ~400× farther away): two
**sight lines** from the observer's eye draw outward with a **faint gold wedge** between them; a
**dashed ghost disc** slides along the cone, growing exactly with distance, and **lands exactly on
the second disc** ("same angle"). The geometry is exact (a disc at distance d has radius d·sin α).
The cone's half-angle may be exaggerated for legibility (the true one is 0.26°); say so with a
small label.

### Between the two modes

Two hand-offs join ground view and space view (they count as camera moves, §8):

- **Tilt up:** the camera tilts up from the horizon; the silhouette slides out of the bottom, the
  sky deepens from its preset to `space` and the stars thicken into the space-view Starfield.
  Ease in-out in the body; `EASE.punch` in a hook.
- **Pull back:** from the observer, the camera rises: the horizon flattens and then curves, the
  sky goes dark above a thin blue atmosphere limb, and the ground becomes **Earth seen from
  space** (the Planet component), with a marker ring where the observer stood. Log-scale zoom,
  motion blur in the fast middle (§8), one deep whoosh.

### Same rules, both modes

The energy curve, visual variety (a new idea every ~5–10 s; every number shown), annotations
(≤ 2, blue, true), captions and safe zones apply unchanged. **Fill the frame** in ground view: the
sky and the horizon fill it, so a frame is never empty black; when the Sun or Moon is the hero,
fill the frame with a narrower field of view, not a bigger disc.
