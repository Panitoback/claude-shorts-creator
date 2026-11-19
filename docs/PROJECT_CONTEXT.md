# Project Context — the universe shorts channel

> **For:** the planning project where topics, aesthetics and scripts are developed.
> **Pair it with:** `brand.md` (the visual and sound style contract — read it for colors, type,
> captions, annotations, motion, safe zones and sound taste; this file never repeats it).
> **Version:** v0.18.1 · 2026-11-19 · phase: *sun-moon-400 published; first Race short in production (race board + spacecraft built)*
>
> This file describes **what can be asked for**, not how it is built. If a script asks for
> something listed here, it can be made. If it asks for something not listed, flag it as a
> *new component request*: it may well be possible, it just costs a build step first.

---

## 1. What this channel is

- **The channel is called *Look Back in Time*.**
- **Vertical shorts about the universe for YouTube Shorts, TikTok and Instagram Reels.** Usually 30–120 seconds, depending on the format (see section 5).
  Space, scale, light, gravity, time, planets, stars, the things that make the cosmos feel
  unreal but are true.
- **Every frame is animated with code.** There is no footage, no stock video, no photos, and
  **no AI-generated images or video**. What you see is drawn and moved precisely: real orbits,
  real proportions, numbers that actually count up. Because of that, every short can be
  re-edited, restyled or re-voiced later without starting over.
- **Minimalist and cinematic, with an energy curve.** The first ~3 seconds hit hard (a fast
  camera move or an ignition, the title arriving word by word with the voice, a sound you hear
  even on a phone); the body is calm and cinematic; the main reveal and the twist get a short
  burst, then settle (the **Race** format, §4, is the one calm exception: no burst, the movers
  carry it). One idea per short, one hero object on screen at a time, lots of
  dark space. Warm starlight on near-black, big editorial serif numbers, gold for the word that
  matters, and an occasional thin blue scientific annotation. The full look is in `brand.md`.

### The look in one scene

The reference scene, "1.3 million Earths fit inside the Sun", shows the whole visual vocabulary.
Scripts can ask for any of it by name:

- **Hero number + unit + subject:** "**1.3** *million* / *Earths*". The big serif number, its
  unit in gold italic, and what it counts underneath. One per scene.
- **Small label** above the number, for context: "BY VOLUME".
- **Hero object:** one glowing body (here the Sun) with a soft halo.
- **Annotations** (cool blue, thin, at most 2 on screen at once): a *marker* on a tiny object with a
  *leader line* and label ("EARTH ×1"), and a *scale bar* with a label ("109 × EARTH'S WIDTH").
- **Caption** with one **keyword** in gold italic: "fit inside the *Sun*".
- **Honest scale:** when a scene is about size, sizes are true. Earth really is that tiny next
  to the Sun.
- **English narration**, read by an ElevenLabs voice. ElevenLabs is the **only** outside
  service: it makes the voice and, when needed, sound effects and music beds. Everything else
  happens locally.
- **Captions are always on**, appear a few words at a time, and highlight each word exactly as
  it is spoken.
- **No "like and subscribe" endings.** Each short ends on its payoff and loops seamlessly back
  into its first frame, so replays feel continuous.

---

## 2. How a short gets made

```
idea  →  script  →  voice  →  animation  →  check  →  sound  →  final video
```

**Voice first** (the default since the quasar short): the narration is recorded before anything is
animated, at its natural pace, and the animation is timed to the real voice.

1. **Script.** You (in the planning project) write the narration and describe what should be
   on screen for each moment, using the handoff format in section 6.
2. **Fact check.** Every number and claim is verified before anything is animated. If a fact
   turns out to be wrong or misleading, the script changes, not the truth.
3. **Voice.** ElevenLabs reads each line (the channel voice on Eleven v4 Turbo) at its natural
   pace: nothing is sped up to fit a slot. Each line gets one light delivery direction
   (intrigued, awed, emphatic…) added at this step, matched to the beat; it shapes the reading
   and never appears on screen. The real timing of every spoken word is captured, and **the
   short's timeline is built from it**: its length, where each scene starts, and when each reveal
   lands all follow the voice.
4. **Animation.** The scenes are built from the visual components in section 3 and timed to the
   spoken words, so captions and on-screen moments land exactly on the word. If a scene needs
   something that doesn't exist yet, a new component is built first.
5. **Visual check.** Still frames are rendered at phone size and inspected: is the text
   readable, is anything cut off, is the first frame composed, and does the hook move fast?
6. **Sound.** A script **describes the mood or the moment** in plain words, never a specific
   clip: the overall feel in the optional `SOUND MOOD:` line (section 6), and any moment that
   matters in the beat itself ("an immediate opening hit on the first frame", "a deep rumble as
   the black hole appears"). **Production picks every clip** from the channel's sound library and
   its usage guide: subtle effects on key moments (a soft whoosh on a transition, a gentle impact
   on the reveal) plus up to two quiet background layers: a music bed (emotion: slow, warm, cinematic) and a space
   ambience under it (texture). The music comes from the channel's own library of steady beds; a
   script can describe where it should swell (the hook, the reveal, the twist) or drop out, and the
   mix shapes it. The sound taste is in
   `brand.md` §7. Sounds are chosen to work on a phone speaker as well as on headphones. Some
   sounds are made from the real numbers: a pulsar ticking at its actual rotation period, light
   "redshifting" as a falling tone, the chirp of two black holes merging. A script can ask for a
   specific pulsar or merger and it will be built to match.
7. **Final video.** Rendered at 1080×1920, 30 frames per second.

### What to hand off for a new short

Save each script as **`guion.md`** in its own folder, **`shorts/<slug>/`**, where the slug is a
short lowercase name such as `sun-volume` or `iss-falling`. It is built from there. Finished
shorts are recorded in the repo's `PRODUCED.md` (title, format, date, status).

- The **script in the handoff format** (section 6): title, hook, narration lines, and a short
  description of the visual for each beat.
- **Sources** for every number or claim (a link or a named reference is enough).
- Optional: tone notes (calm, awe, playful), a preferred voice, and the image the cover should
  be (the cover is picked at upload, from any frame).

---

## 3. Visual components

A *component* is a reusable visual building block that a script can ask for by describing
it. Options are what you can specify; anything not specified uses a sensible default from the
brand.

> **Status:** the channel's **base kit (3.1) is built** in the brand style and is what scripts
> should ask for. 3.2–3.3 were inherited from earlier example videos and still wear the old look.
> Don't request the old Captions, Backdrop, Stamp, Stat chip or Pause card: the base kit replaces
> them, or describe the need in plain words and it will be built in the new style.

### 3.1 Base kit (built, brand style)

All of these can arrive already in place on the first frame, so they work in a hook.

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Starfield** | The background sky: mostly faint stars in real temperature colors, a few bright ones with a tiny halo that twinkle. Kept clear behind text and around planets; tuned to survive platform compression. | density, how many bright stars, twinkle on/off, overall brightness (dims when something very luminous is on screen), bright stars switching off one by one (each a clear ~0.5 s fade, never the whole sky dimming), or **every star in the frame** going out one by one, faster and faster, until the sky is dark (an ending like heat death) |
| **Glowing body** | A sun or star: limb-darkened disc with a soft halo that blooms in after the disc and breathes gently | size, position, kind by temperature: *sun* (yellow), *red*, *white*, *blue*; glow strength |
| **Planet / moon** | A sphere lit from one side, night side falling to black, true muted colors, with each body's signature features: Earth's real continents (+ soft clouds), the Moon's soft maria and bright craters, cratered Mercury (craters as soft shading, never outlines), Mars's polar caps and dark regions, Jupiter's belts and Great Red Spot, Saturn's soft bands and ring with the Cassini division, Venus's faint cloud swirls, Neptune's streaks; Uranus nearly featureless (accurate). Small bodies (under ~60 px) are simplified to color and shading. | which body (Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune), size, position, light direction, how much is lit (phase), which side faces us, slow rotation (e.g. Earth turning), axial tilt (Uranus ~98° with its faint ring), atmosphere glow (Earth by default), the warm wash behind it when it's the hero |
| **Hero number** | Big serif number that counts up, gold italic unit, subject line under it, small label above | value, unit, subject, label, count up or just appear, starting value, size (hero or secondary). Long values shrink to fit the safe area. Power-of-ten form for numbers too long in words: "1 in 10³⁰" (gold italic words before the number, the exponent counts up). ⚠ When the narrator says the number in words ("a million trillion trillion"), show those words instead: "1 in 10³⁰" didn't read on #3. |
| **Caption with keyword** | The narration, a few words at a time; each word brightens as it is spoken; the keyword turns gold italic with a small pop | the keyword(s) per beat, matched regardless of capitals or surrounding punctuation ("Sun" matches "Sun," and "sun."). Captions always show the VO *as written*, even when the voice was given a phonetic spelling (PRONUNCIATION). |
| **Marker + leader line** | A ring that settles around an object, a thin blue line, a label (+ value) | what it points at, label, value, which side the label sits (below, above, left, right), a dot for objects too small to see |
| **Scale bar** | A measured span with end ticks that draws from its center outward, with a label | what it spans, label, second line, label above or below |
| **Data label** | A free-standing fact next to an object: small label + serif value, no line | label, value, alignment, value in gold italic when it is *the* number of the scene |
| **Kinetic title** *(new, for hooks)* | A big title that arrives word by word, each word landing exactly as the voice says it, with a fast rise (no bounce) | the words (from the hook line), which word is gold, size, when it leaves |
| **Depth stars** *(new, for hooks)* | A sky with real depth for fast camera moves: diving in, near stars stream past while far ones barely move; pulling back, the sky gathers in around the object. Stars stay small points | dive-in or pull-back, how far the camera travels, how many stars stream past |
| **Scale comparison** | Two or more bodies side by side at **true relative size**, names underneath. Anything that would be smaller than a few pixels is drawn as a dot with a ring, so it stays findable without lying about its size. | which bodies (any planet/moon above, the Sun, or a star with its real radius), the names, an optional value under each, bottoms aligned or centers aligned |

Annotations (marker, scale bar, data label) count toward the **max 2 on screen at once**.

### 3.2 Inherited kit (old look)

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Progress bar** | A thin line across the top that fills as the short plays | color |
| **Big title** | One to three lines of large headline text, e.g. the hook | text per line, color per line, a smaller subtitle, size, position |
| **Kicker** | A small label above the main visual ("STEP 2", "THE TWIST") | text, color, when it appears and disappears |

Replaced, don't request: Captions → *Caption with keyword*; Backdrop → *Starfield*; Stamp,
Stat chip, Pause card → retired.

### 3.3 Space and orbits (inherited from the "Astronauts are falling" short)

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Globe** | Earth as a shaded sphere with real continents | which side faces the camera, ocean and land colors, day/night shading on or off |
| **Atmosphere** | The thin glow of air around the planet, at true scale | thickness, color, opacity |
| **Trajectory** | The path of a thrown or orbiting object, physically simulated | how much of the path is drawn so far, color, line width, dashed or solid, glowing dot at the tip |
| **Impact** | A small burst where a falling object hits the ground | color, size |
| **Satellite** | A small craft at a given altitude and position around the planet | altitude, angle, color, size |
| **Cannon** | Newton's mountain-top cannon (the classic orbit thought experiment) | altitude, color, size |
| **Gravity arrow** | An arrow showing gravity pulling an object toward the planet | length, color, label, thickness |
| **Speed ladder** | A stacked list of speeds that light up one by one | each rung's value and note, colors |
| **Equality panel** | Two quantities side by side that turn out to be equal | both labels and values, the "=" appearing on cue, a footnote with the condition |

Real physics is available behind these: orbital speed, escape velocity, orbital period and
gravity at any altitude around Earth are *calculated*, not typed in. They get restyled into the
brand when a short needs them.

### 3.4 Black holes and quasars (built, brand style)

The quasar is **the most luminous object on the channel**, shown by contrast (a pure-black
shadow beside a near-white disk), never by flares, rays or haze.

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Black hole** | A perfectly black shadow (the channel's only pure black) hugged by a thin warm photon ring | size, position, ring strength, which side of the ring is brighter |
| **Accretion disk** | A tilted glowing disk around the shadow, one smooth gradient (holds up in a zoom): hottest and near-white inside, grading to gold and deep orange; the side coming toward us brighter; its near side crossing in front of the shadow as a band; the far side seen as bright bands bent over the top and under the bottom of the shadow | size, tilt (how edge-on), angle, brightness (dormant orange → blazing), slow drift on/off |
| **Jets** | Two thin beams of plasma along the spin axis, cool blue-white, like real jets: very narrow at the core and slowly widening (a narrow cone), fading toward the ends, with bright knots traveling outward | length, angle, brightness (they switch on as the quasar brightens) |
| **Host galaxy** | A calm, distant elliptical galaxy: soft warm haze and a few hundred stars | size, shape, angle, brightness |
| **Infalling gas** *(new)* | Thin streaks of gas spiraling into the disk from outside, faster as they close in, deep orange far out and gold at the disk, so the scene always moves | how many streaks, how fast, how bright |
| **Quasar** | All of the above together, driven by one **luminosity** dial: as it rises, the disk turns white-hot, the glow grows up to 3× the disk, the jets switch on, and the host galaxy and background stars all but vanish (as if the camera were exposing for the quasar) | size, position, luminosity (or a "switch-on" from dormant to full: it can be a hard, fast ignition for a hook), angle and tilt, jets on/off, an extreme close-up of the disk (the glow is toned down so the frame isn't washed out), seen from far away as a single bright point ("quasi-stellar") |

### 3.5 Visual variety kit (built, brand style)

These exist so **every number in the VO gets its own picture** (§5). Ask for them by name in
VISUAL. Each draws in on a cue, can be already in place on the first frame, and stays readable on
a phone.

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Orbit overlay** | The planets' orbits at **true relative scale**, as thin lines laid over another object to compare sizes (e.g. the whole solar system inside a black hole's horizon). Planets move at their real relative speeds. Orbits too small to see fold into the Sun's dot rather than being enlarged. | the scale (what it's laid over), which planets, which orbit is named (1–2), face-on or tilted, moving or still |
| **Comparison bars** | 2–4 bars that fill on the beat, each with a label above and its value under it, counting up as it fills (temperatures, efficiencies, masses). Lengths are true to the values; one gold bar is the point. | the bars (label, value, how it reads), which bar is the hero, log scale (labelled as such) for values far apart |
| **Meter** | A gauge for **one** value against a full scale: a gold arc fills, the value counts up inside (e.g. "~10% of the mass turned into light"), with an optional reference tick (e.g. fusion 0.7%) | value, full scale, label, a reference value with its label |
| **Timeline** | A time axis that draws in, with markers appearing on cue (e.g. Big Bang → light leaves → Earth forms → today). Positions are true; events close together get a short leader line instead of a fake gap | the events (name, date, cue word), which event is gold (more than one is fine), vertical (default, fits a phone) or horizontal (2–3 events), log scale, smaller labels for long names ("FARTHEST QUASAR'S LIGHT" fits on one line), a mid-scene change of scale (e.g. linear → log to reach the far future: markers glide to their new positions, events that fall off the axis slide away, LOG SCALE fades in) |
| **Balance** | Two totals weighed on a scale (e.g. every star in a galaxy vs one quasar): a heap of stars in one pan, one bright point in the other; the beam tips toward the heavier side and both totals appear | each side's label and value, what sits in each pan (a heap of stars, one bright point, nothing), when the pans get named (e.g. on the spoken words, before the tip), a slow calm tip or a fast peak move on a key word |
| **Flow paths** | Paths that draw in along the direction of travel with a soft glowing head (gas spiraling into a disk, light crossing space). A faint dashed "ghost" can show what does *not* happen first ("straight in?"), then fade | the paths (spiral into a disk, straight line, or a described route), which is the ghost, labels, an arrowhead |
| **Whip transition** *(new, for hooks and peaks)* | A hand-off between two pictures: the first sweeps off fast with motion blur while the next sweeps in from the other side, swapping at full speed and landing softly (no bounce). Chained, it makes a **whip montage** for the hook: several related pictures, ~0.6–1 s each. One whoosh per whip. | which pictures, in what order, the direction of each whip (left, right, up, down), when each whip happens (on a spoken word), how strong the blur is |

For a single big count-up, use the **Hero number** (3.1).

### 3.6 Planned (not built yet)

| Component (planned) | Status |
|---|---|
| **Zoom ruler** (continuous zoom galaxy → disk, with a scale bar that re-labels at each level) | Levels and figures sent for verification; built after approval |
| Light ray (light crossing space, redshifting) | Idea, not designed |
| **Race board** (for the Race format, §4): rows from one starting line to each destination, all movers departing together and arriving one by one in order, the real value written on each row as it arrives, the RULE LINE in small type under the board, a soft cue per arrival, the movers gliding back for the loop | **Built** (v0.18.1, first Race short). Up to 8 rows; one value can be gold (the payoff) |
| **Spacecraft** (the Race mover): a small stylized craft in the brand style (soft shading, warm light, a faint engine glow; no outlines, no agency logos, no real mission markings) | **Built** (v0.18.1): a generic probe (body, dish, boom) with an idling engine glow that brightens on departure and a short trail |
| **Car** and **Runner silhouette** (alternative Race movers for extended versions: a generic car with no brand marks; a sober runner in profile, like the ground-view observer) | Planned, after the spacecraft |

### 3.7 Everyday objects and the arrow of time (built, brand style)

Built for "Why Time Only Moves Forward". Everyday objects are stylized like the planets: soft
shading, no outlines. Their states are dials, so any of them can **break, mix or scatter, and try
to undo it and stall** (a rewind that gets halfway and falls back).

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Egg** | An ivory egg lit from one side; a gold hairline crack runs across it, then it breaks open (the cap lifts and tips, a few shards fly) | size, position, light direction, how far the crack has run, broken or whole, a rewind that stalls (pieces rise toward each other, stop halfway, fall back) |
| **Coffee cup** | A cup on its saucer seen from straight above, a spiral of milk on the coffee that blends into a latte color | size, position, the milk being poured (spiral growing from the center), mixing, an unmix that stalls, slow swirl on/off, handle direction |
| **Gold morph line** | ONE thin gold line that changes shape with no cut: a crack → a spiral → handwriting → gold dust, and back (dust → a point → a crack). It lands exactly on the object it becomes (the egg's crack, the cup's spiral) | the shapes and their order, when each change happens, the line drawing itself in (a crack racing across), breaking into dust and gathering back |
| **Word dissolve** | A serif word written left to right, that bursts into gold dust; it can try to re-form and stall as a faint ghost outline, then scatter | the word, italic or upright, size, when it is written, bursts, tries to re-form |
| **Particle box** | (a) **A hundred particles** packed in one half of a box; a divider lifts and they spread through the whole box and keep moving, exactly simulated (nothing pushes them). (b) **Two particles colliding**, played forward and then reversed: both look equally natural | (a) how many, which half, when the divider lifts, growing out of one point first, faint (behind a title), box visible or not · (b) forward/reversed timing, motion trails |
| **Deck of cards** | A fan of cards in perfect order (A → K, suits alternating, no brand marks) that a real riffle shuffle breaks: two packets interleave and the fan re-forms out of order | number of cards, fan size, when each shuffle happens (each shuffle gives a new order), a gold line along the fan's edge with a running glint |

### 3.8 Dynamism kit (built, brand style)

Built after the second short and applied to its body. These are ways to **move between and
inside scenes**, usable in any short (rules in `brand.md` §8 "Dynamism").

| Component | What it does | Options you can ask for |
|---|---|---|
| **Living camera** | The whole short is filmed by one slow-drifting camera, with the stars moving less than the objects (parallax) | camera pans/zooms on chosen words, a small wind-up before a big move, **punch-ins** (a quick 3 % zoom that settles) on the 2–3 biggest hits |
| **Shape match cut** | One shape survives the cut and becomes the next scene's key element (a sun → a bar, a box's frame → a balance beam, a line → an axis) | which shape becomes which, filled or outline |
| **Fly-through** | The camera dives into an object (a digit, a ring, a hole) and comes out in the next scene | what to fly into, what comes out on the other side |
| **Particles form a number** | Drifting particles condense into a number (digits, %, ×, a power of ten) and can release it | the number, when it forms, how many particles |
| **Odometer number** | A number that rolls on digit wheels (the higher wheels turn only on the carry) | the value(s), units/prefix (−, %), gold or ivory, as an exponent (10 with a rolling power, e.g. ways to arrange: 10⁰ → 10²⁹) |
| **Time stream** | Gold particles flowing one way along a line (time's arrow, a timeline's axis): steady motion that carries the idea "time runs one way" | which line, how dense, when it flows |
| **3D timeline flight** | The timeline tilts back in perspective while the camera flies along it, then lands flat | which stretch of time to fly over |
| **Beat sync** | Scene changes and camera accents land on the pulse of the music bed | automatic, once the bed is chosen |

### 3.9 Ground view: the sky as seen from Earth (built, brand style)

The channel's second visual mode, for near-space topics (Earth, the Moon, the Sun, satellites,
the sky you can see). Same identity as space view: only the backdrop changes (rules in
`brand.md` §11). A short can stay on the ground, stay in space, or travel between the two.
**One field of view drives everything:** the Sun, the Moon, the horizon and the stars all share it,
so sizes are honest. Say *wide* (a landscape, ~60° across: the Sun and Moon are ~9 px) or
*telephoto* with a number of degrees (1–8°: a big disc over a distant horizon).

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Sky view** | The sky from the ground in true-to-life colors, with stars where they would really show | time of day: *night*, *twilight*, *dusk*, *day* (bright pale blue), *muted day*, *eclipse*; a slow change from one to another (e.g. dusk → night); stars coming out one by one (planets first, then the brightest stars), or already there; bright planets placed where you want them |
| **Horizon** | Flat dark silhouettes along the bottom of the frame, 2–3 layers for depth; real heights at real distances | *hills*, *mountains*, *treeline*, *city skyline* (generic, a few lit windows, no landmarks), *sea* (with a soft reflection path of the Sun or Moon); how high the horizon sits; how far away each layer is; a sideways camera move with true parallax |
| **Observer** | A small, sober silhouette of a person in profile looking up, for scale and feeling (never cartoonish, never the hero), standing on the hill, not in it | pose: standing looking up, sitting (leaning back on the hands), pointing (arm rising to an angle you choose); where on the horizon; facing left or right |
| **Sun and Moon in the sky** | The Sun and the Moon at their **true apparent size** (~0.5°) for the view. Both redden near the horizon and the Sun flattens slightly (refraction); the Moon shows its phase and is pale by day | position in the sky (degrees above the horizon, left/right), rising or setting, wide or telephoto, the Moon's phase, an optional "0.5°" scale bar |
| **Ground scenes** *(ready-made)* | **Sunset on the sea** (the Sun on the sea horizon, dusk glow, broken reflection path) · **Full Moon rising over hills** (blue hour) | which one, field of view, when the body rises or sets |
| **Eclipse: total** | A total solar eclipse in true order: the Moon slides over the Sun (only seen where it covers it), the bright day sky darkens to a sunset ring all around the horizon, Baily's beads and the diamond ring (small and subtle, no flare), the pearly corona at totality, bright stars and planets coming out; then all of it in reverse | when each stage lands (on spoken words), stop at totality or play it back out, wide (with the horizon and an observer) or telephoto |
| **Eclipse: annular** | The Moon ~6 % narrower than the Sun: a thin bright ring of honest width, no corona, the sky stays light ("slightly dimmed daylight") | timing, wide or telephoto |
| **Angle cone** | Two gold sight lines from an observer's eye with a faint gold wedge; a dashed ghost disc slides along the cone, growing with distance, and lands exactly on a second disc: "same angle, same apparent size" (the Sun–Moon 400× coincidence) | the two bodies and their distances along the cone, when the lines draw and the ghost slides, a small label ("SAME ANGLE"); the angle can be drawn wider than the true 0.26° (it gets labelled) |
| **Tilt up** *(hand-off)* | Ground → space: the camera tilts up from the horizon; the ground and the observer slide out together, the sky deepens into the space starfield | which sky it starts from, speed (calm or a hook-fast move) |
| **Pull back to Earth** *(hand-off)* | From the observer up through the sky: the horizon curves, a thin blue atmosphere limb, then **Earth seen from space** with a marker ring where the observer stood | where on Earth faces us, how big the globe ends, the label on the marker ("YOU ARE HERE") |

> **Honest optics, by design:** a big Sun or Moon is fine **through a telephoto view** (narrow field
> of view, distant ridge or skyline in true proportion): that is what a long lens shows, and the
> moon-illusion topic needs it. What can't be made: a disc enlarged inside a *wide* landscape,
> photographic landscapes, recognizable skylines or landmarks, lens flares on the Sun.
> **Text over a bright day sky** goes in the upper sky, or gets the soft text shadow (captions over a
> bright sky always get it), never a dimmed sky.

Anything else: list it under NEW COMPONENTS NEEDED in the script.

> **Hero numbers that are too long now get flagged.** If a HERO NUMBER doesn't fit, it is shrunk
> to stay on screen *and* reported in the production QA, so it comes back to the script for a
> shorter wording.

---

## 4. Formats

A *format* is a reusable structure for a short: what it promises the viewer, how long it runs,
and which components carry it. Impossible Fact, Scale and How It Works are built on the six-beat
base below; **Race** has its own three beats and its own rules (its section says exactly which
base rules it replaces). Lengths and word budgets are in §5.

### Base: the six-beat short

| Beat | Time | Purpose |
|---|---|---|
| **Hook** | 0–3 s (always fixed) | **High energy.** The first frame is composed (no fade from black) and is the start of a fast move (ignition, pull-back, dive-in) that lands the surprising thing within ~3 s, with the title arriving word by word on the voice and a sound heard even on a phone. A clear visual change every 2–3 s for the first ~10 s. The cover is picked at upload, not frame 0. |
| **Setup** | ~20% | Show the situation fast; build the tension the hook promised. |
| **Quiz** *(optional)* | ~2.5 s | "Pause. Can you guess?" Drives comments and rewatches. |
| **Reveal** | ~45% | The payoff in 2–4 steps, each step landing on a spoken word **and shown with its own picture** (comparison, diagram, bars, timeline, counter). |
| **Twist** | ~20% | A reframe or bonus insight: the "send this to a friend" moment. |
| **Loop** | last ~3–4 s | The last frame visually matches the first, so the replay is seamless. |

> **Visual variety (every format, every beat):** one hero object per scene, but the scenes
> change: a new visual idea at least every ~5–10 s, and every number or comparison in the VO is
> shown on screen, not just said. Scenes hand over smoothly: preferably a **shape match cut**
> (one shape becomes the next scene's element) or a **fly-through**; also a camera move, a morph,
> an object carried over, or a whip (mainly in the hook and on 2–3 big changes). The camera is
> never static (slow drift + parallax), with **punch-ins only on the 2–3 biggest hits**, and cuts
> land on the music's pulse. See `brand.md` §5 and §8. **Race** is the exception: one continuous
> scene whose constant motion replaces the "new idea every 5–10 s" and hero-size rules (§4 Race).

### The four formats at a glance

| Format | Promise to the viewer | Length | Hook (frame 0 → ~3 s) | Carried by |
|---|---|---|---|---|
| **Impossible Fact** | "That can't be true." One counter-intuitive fact, proven fast | 30–60 s | The object on frame 0; the fact (hero number or title) lands fast with the voice | Hero number, Caption with keyword, Data label, Marker, Glowing body / Planet |
| **Scale** | "I finally *feel* how big that is." A size, distance or time next to something familiar | 40–75 s | A fast zoom or pull-back that puts the big thing and the familiar thing side by side, or lands the hero number over the big thing | Scale comparison, Hero number, Scale bar, Marker, Glowing body / Planet |
| **How It Works** | "Oh, *that's* how it works." A mechanism explained step by step | 60–120 s | The end result switching on or revealed fast (what the short will explain) | Any of the base kit and the visual variety kit (3.5), plus whatever new components the steps need (listed under NEW COMPONENTS NEEDED; all of them get built) |
| **Race** | "Who gets there first, and how long does it take?" A calm, single-scene comparison | 10–40 s | No burst: the full board on frame 0, movers departing together on the hook line | Race board + one mover (spacecraft; later car or runner), Starfield, Planet / Glowing body as destination markers (3.6) |

### Impossible Fact

- **Hook:** say the fact plainly, not as a tease. The first line *is* the claim
  ("A day on Venus is longer than its year.").
- **Setup:** why it sounds impossible: the intuition the viewer brings.
- **Quiz** (works well here): "Why?" or "Guess the number."
- **Reveal:** the reason in 2–3 steps, each step proven by one annotation or one number.
- **Twist:** a consequence or an even stranger corollary.
- **Loop:** back to the hook frame.
- **Rules:** the fact must be literally true as worded (no "basically"); one fact per short;
  every number in SOURCES.

### Scale

- **Hook:** a fast move reveals the comparison, or lands the hero number over the big object
  ("1.3 million Earths").
- **Setup:** introduce the familiar reference (Earth, a city, a human, a second of time) and
  mark it.
- **Quiz** (optional): "How many fit?" / "How long would it take?"
- **Reveal:** a ladder of 2–4 comparisons, each one bigger (or smaller) than the last; each
  step adds one new body or one new scale bar.
- **Twist:** flip the reference: the giant becomes a dot next to the next giant.
- **Loop:** back to the opening comparison.
- **Rules:** keep **one reference object** constant through the short so the viewer never loses
  their footing. SCALE must say *true* for comparison scenes (true relative size is the default
  for Scale comparison). If a scene can't be to scale, say *not to scale* and it will be labeled.

### How It Works

- **Hook:** reveal the end result fast (the quasar switching on, the eclipse, the tide), not the
  diagram.
- **Setup:** the question, in one line ("But black holes don't shine. So what does?").
- **Steps:** 2–4 SETUP → REVEAL pairs, **one idea per step, each with its own picture**: the
  temperature as bars, the efficiency as a meter, the distance as a timeline. Steps hand over
  smoothly (the hero object carried into the next scene, a camera move, a morph), never as hard
  cuts. Whips are for the hook and the peaks, not for the calm steps.
- **Twist:** what the mechanism implies (scale, age, a surprising consequence).
- **Loop:** back to the end result, now understood.
- **Rules:** at most one new element appears per step; at most 2 annotations on screen at once.
  If a step needs something that isn't in §3, list it under NEW COMPONENTS NEEDED: this format
  is where new components come from.

### Race

A calm, satisfying comparison: several journeys from one starting point, side by side, revealed
in order. Example: Earth → each planet, at a probe's speed.

- **One continuous scene.** No transitions, no montage, no whips, no punch-ins. One row per
  destination (3–8 rows), all starting from the same line (START). All movers depart together
  and **arrive one by one, staggered in ROWS order**.
- **The animation orders the reveal; it does not measure time.** The arrival order is true, but
  the gaps between arrivals are paced for watching (each arrival gets its own moment, roughly
  1.5–4 s apart), not proportional to the real values. The **real value is written on each row
  the moment its mover arrives**: that text is the claim, so it must be in SOURCES. No separate
  "not to scale" tag: SCALE says *not to scale (Race timing)* and the written values carry the truth.
- **Say what is racing and how fast.** A SPEED HEADER above the board names the mover and its
  speed in big type for the whole video (e.g. "NEW HORIZONS' LAUNCH SPEED" / "36,000 mph"), and the
  hook line names the mover ("…by spacecraft?"). A verb like "fly" alone leaves the viewer
  guessing whether it is a plane or a probe (learned on the first Race).
- **The rule behind the numbers is on screen**, in one small line under the board (RULE LINE):
  the path (e.g. straight line) and which distance was used (average, closest approach…), e.g.
  "STRAIGHT LINE · AVERAGE DISTANCE". Every value on the board must follow from the SPEED HEADER
  and that one rule.
- **Hook:** calm. Frame 0 is the complete board (speed header, rows named, movers on the starting line, rule
  line visible); the movers depart by the end of the spoken hook (≤ 7 words). No hook burst, no
  fast camera move, no kinetic title required; the hook line appears as a normal caption.
- **Body:** the race itself, with **no narration**. Something is always moving until the last
  arrival; the camera keeps its slow drift.
- **Loop:** an optional closing line (≤ 10 words) after the last arrival, then the movers glide
  back to the starting line, so the last frame matches frame 0.
- **Sound:** a calm music bed and a **soft cue on each arrival** (automatic, one per row); no
  hook hit, no peak bursts. SOUND MOOD can still describe the feel.
- **Rules it replaces** (so the script needs no exceptions): the six-beat structure (it uses
  HOOK / RACE / LOOP), the hook energy and HOOK MOVE, the "new visual idea every ~5–10 s" rule
  (constant motion satisfies visual variety), the hero-size rule (rows of small movers are the
  design), the hero number, and the 2-annotation limit for the board's own names and values
  (it still applies to any extra annotation). Production tags the race scene as *intentional*,
  so the automatic checks for stills and small content don't flag it; empty frames are still checked.
- **Rules it keeps:** every value sourced; captions for whatever is spoken; no call to action;
  a seamless loop; one mover kind per short.

Ideas for future formats (to be decided): *myth vs fact*, *"what if"*, *one number explained*.

---

## 5. Constraints and practical limits

### What works well on screen
- **One main object at a time**, big and centered. A phone screen is small; detail gets lost.
- **Numbers**, especially when they count up live, change scale, or compare two things.
- **Continuity over cuts, but not one scene.** Scenes flow into each other instead of hard
  cuts: first choice a **shape match cut** (a shape becomes the next scene's element) or a
  **fly-through** (into an object, out in the next scene; one or two per short); also a camera
  move, a morph, the same object carried over, or a **whip transition** (a fast sweep with motion
  blur, one whoosh each). Whips belong mainly in the hook (a rapid montage, ~0.6–1 s per picture)
  and on 2–3 big scene changes.
- **Motion that feels alive, not busy.** A slow-drifting camera with parallax throughout; a
  punch-in (3 % zoom) only on the 2–3 biggest hits; scene changes on the music's beat. Not
  available: shake, bounce or overshoot (brand bans them), and a rotoscope / hand-drawn boil look. Still never: a hard cut to an unrelated picture with no motion, shake, or flicker.
  The short still needs **a new visual idea every ~5–10 s**: one scene for the whole short reads as a still
  (except a **Race**, §4, whose movers never stop moving).
- **Show every number.** A claim with a number or comparison gets its own picture (a scale
  comparison, a diagram, bars or a meter, a timeline, a counter). If the screen looks the same
  with the sound off, the claim isn't shown.
- **Comparisons and scale**: "this many Earths fit in the Sun", true-to-scale distances.
- **Simulated motion**: orbits, falling, light travel. These are calculated, so they are
  accurate and look natural.

### What is hard or slow
- **Photographic realism** (real nebula textures, realistic clouds, surface photos): not
  possible without images, and images are off the table. Aim for clean and stylized instead.
- **Thousands of moving particles** (dense galaxies, dust clouds) or heavy blur/glow on many
  objects at once: possible, but slow to render. Use sparingly, for one hero moment.
- **Busy scenes**: more than about 3 distinct elements moving at once becomes hard to read.
- **3D**: true 3D camera moves are not part of the toolkit. Flat or lightly shaded "2.5D"
  (spheres with shading, layered depth) works well, and a flat element such as a timeline can tilt
  back in perspective while the camera flies along it (3.8).
- **Motion blur** is used only on fast moves (flights, whips, fly-throughs); it costs render time,
  so a short gets a few blurred seconds, not a blurred body.

### Timing and length
- **Length depends on the format.** The content decides the length; any scene that doesn't add
  something gets cut.

  | Format | Length | Narration (at ~2.4 words/s) |
  |---|---|---|
  | Impossible Fact | 30–60 s | ~70–145 words |
  | Scale | 40–75 s | ~95–180 words |
  | How It Works | 60–120 s | ~145–290 words |
  | Race | 10–40 s | ≤ 17 words: a hook ≤ 7 words + an optional closing line ≤ 10 words |

- **Hard ceiling: 180 s** (the YouTube Shorts limit, and Instagram's limit for reaching
  non-followers). Only with explicit approval.
- These ranges are **provisional**. Revisit them once we have retention data from the first
  5–10 shorts.
- **Scene length:** each scene or reveal step lasts 3–8 seconds; a beat can contain several steps. A single visual held longer than ~8 seconds
  needs something changing on screen. (A Race is one scene by design; its arrivals are the change.)
- **Hook:** the first spoken line should land within the first 3 seconds.

### Text on screen
- **Captions:** up to **4 words** at a time, on one line of **about 22 characters**, with **at
  most one keyword** per chunk. Very long words ("electromagnetically") break the rhythm.
- **Hero number + unit:** short. About **10 characters in total**: "1.3 million" fits,
  "1,300,000 Earths" does not. Write large numbers in words ("4.6 billion", not "4,600,000,000").
- **Subject line** under the number: 1–2 words ("Earths", "light-years").
- **Titles** (statements without a number): up to 3 lines, about **12–14 characters per line**
  at full size.
- **Labels and annotations:** 1–4 words, short ("EARTH ×1", "109 × EARTH'S WIDTH").
- **Annotations:** at most **2 on screen at once**, and every one must state a checked fact.

### Where things can go
- The apps cover the screen edges: tabs at the top, the title and description across the bottom,
  and the like/share buttons on the right. Everything important lives in the middle **safe area**
  (about the central 840 × 1210 px of the 1080 × 1920 frame). Atmosphere such as glow and stars
  may spill past it.
- In practice: the hero number sits in the upper part, the hero object in the middle, and the
  caption just above the bottom area. There is room for about one hero object plus one or two
  small annotations.

---

## 6. Script handoff format

Every script follows this template. Save it as `shorts/<slug>/guion.md`. The same template
lives in the repo as `shorts/script-template.md`, and the two are kept identical. Limits are in
brackets; going over one gets flagged before production.

```
FORMAT: Scale | Impossible Fact | How It Works | Race
TARGET LENGTH: XX s
TITLE: <the short's title, as it would appear on YouTube> [≤ 60 characters]
SLUG: <folder name: lowercase-with-dashes, e.g. sun-volume> [2–4 words]
TONE: <calm awe | playful | eerie | matter-of-fact>
HOOK FRAME: <what the very first frame shows: composed, subject already there, no fade from black. It is the START of the hook's motion, not the cover (the cover is picked at upload)>
HOOK MOVE: <the fast change in the first ~3 s that delivers the surprise: ignition, pull-back, dive-in, zoom, or a whip montage (rapid related pictures, ~0.6–1 s each, joined by whip transitions)…> <Race: write "none (Race)": the movers' departure is the hook's motion>
SCALE: <true | not to scale> <required if any scene is about size or distance; say which scenes>
> Race: SCALE is "not to scale (Race timing)": the arrival ORDER is true, the gaps between arrivals are not.

SOURCES:
- <fact> — <source: link, or named reference such as NASA, ESA, a textbook>
- <fact> — <source>
> Every number and claim in the VO, on screen or in an annotation needs a line here.

---

BEATS:
> VO word budgets assume ~2.4 words per second. Total narration ≈ TARGET LENGTH × 2.4 words
>   (e.g. 45 s ≈ 110 words, 90 s ≈ 215 words). Stay within the format's range in §5.
> VO is spoken AND captioned exactly as written (captions come from the
>   voice's word timestamps). Write it as it should sound and read: no
>   symbols or abbreviations (× % ~ km/s → 'times', 'percent', 'about',
>   'kilometers per second'); big numbers as in §5 ('1.3 million');
>   catalog names written as spoken, or avoided.
> HERO NUMBER: `value unit / "subject" / label "LABEL"`, any part optional. Value + unit
>   ≤ 10 characters ("1.3 million" ✓, "1,300,000 Earths" ✗). Write big numbers in words.
> KEYWORD: the word that turns gold in the caption. At most one per ~4 spoken words, and it
>   must carry the idea ("Sun", "falling"), not just be long.
> KEYWORD must appear verbatim in that beat's VO (same spelling and
>   form, e.g. 'quasars' not 'quasar').
> ANNOTATIONS: at most 2 on screen at once. Each one is a short label plus the fact it states.
>   Types: marker + leader line · scale bar · data label.

1. HOOK (0–3 s) [VO ≤ 7 words]
   VO: "<first line: the surprising claim>"
   VISUAL: <starts on the HOOK FRAME; the HOOK MOVE lands the surprising thing by ~3 s>
   HERO NUMBER: <optional>
   KEYWORD: <word>
   ANNOTATIONS: <optional, max 2>

2. SETUP [VO ~20% of total narration]
   VO: "<build the tension the hook promised>"
   VISUAL: <...>
   HERO NUMBER: <optional>
   KEYWORD: <word(s), one per caption chunk>
   ANNOTATIONS: <optional, max 2>

3. QUIZ (optional, ~2.5 s) [VO ≤ 6 words]
   VO: "<a question the viewer can try to answer>"
   VISUAL: use a title or caption, not the legacy Pause card (see §3 status)

4. REVEAL [VO ~45% of total narration, 2–4 steps; longer shorts may use several SETUP/REVEAL pairs]
   VO: "<step 1>" / "<step 2>" / "<step 3>"
   VISUAL: <per step, the picture that SHOWS its claim (a comparison, diagram, bars/meter,
     timeline or counter, by its §3 name), and how it hands over from the last scene>
   HERO NUMBER: <optional>
   KEYWORD: <word(s)>
   ANNOTATIONS: <optional, max 2 on screen at once>

5. TWIST [VO ~20% of total narration]
   VO: "<the reframe: the line worth sending to a friend>"
   VISUAL: <...>
   HERO NUMBER: <optional>
   KEYWORD: <word>
   ANNOTATIONS: <optional, max 2>

6. LOOP [VO ≤ 10 words, or none]
   VO: "<optional short closing line. No 'like and subscribe', no questions to the audience>"
   VISUAL: returns to the HOOK FRAME, so the replay is seamless

BEATS FOR A RACE (FORMAT: Race uses these three beats INSTEAD of 1–6 above):
> One continuous scene, no transitions. Total VO ≤ 17 words (hook + optional closing line).
> Row names and values belong to the race board: they are not annotations and don't count
>   toward the 2-annotation limit. No HERO NUMBER, no QUIZ.

MOVER: <spacecraft (built with the first Race short) | car | runner (both planned, §3.6)>
SPEED HEADER: <what is racing and how fast, shown big above the board for the whole video:
  label / value, e.g. "NEW HORIZONS' LAUNCH SPEED" / "36,000 mph"> [label ≤ 30 characters, value ≤ 12]
START: <the shared starting line, e.g. "Earth">
RULE LINE: <the one small line under the board stating how every value was worked out: the
  path and which distance (the speed is in the SPEED HEADER), e.g. "STRAIGHT LINE · AVERAGE DISTANCE"> [≤ 48 characters]
ROWS: [3–8 rows, listed in ARRIVAL ORDER, first arrival first]
- <destination> — <real value exactly as written on the row, e.g. "6 months"> [name ≤ 12 characters, value ≤ 12 characters]
- <destination> — <value>

1. HOOK (0–3 s) [VO ≤ 7 words]
   VO: "<the question or claim the race answers, naming the mover, e.g. '…by spacecraft?'>"
   VISUAL: frame 0 = the board already in place (rows named, movers on the starting line, RULE
     LINE visible); the movers depart together by the end of the line
   KEYWORD: <word>

2. RACE [no VO]
   VISUAL: <optional: anything specific about the movers or the board; arrivals are automatic,
     one by one in ROWS order, each row's value appearing as its mover arrives>

3. LOOP [VO ≤ 10 words, or none]
   VO: "<optional closing line, after the last arrival>"
   VISUAL: the movers glide back to the starting line, so the last frame matches frame 0

---

NEW COMPONENTS NEEDED: <anything not in PROJECT_CONTEXT §3, in plain words; "none" if none>
NOTES: <optional: voice delivery hints, anything else>
SOUND MOOD: <optional: what the sound should feel like and the moments that matter, in
  plain words (e.g. 'quiet and vast; one deep hit when the Sun appears'). Narrative intent
  only: never name clips, production picks every sound from the library>
PRONUNCIATION: <word — how to say it, e.g. 'quasar — KWAY-zar'; only
  for names the voice may misread>
```

### Before handing off: checklist

- [ ] Total VO ≈ TARGET LENGTH × 2.4 words, within the format's range in §5; each beat roughly
      within its share
- [ ] Every fact in VO, on screen or in an annotation is listed in SOURCES
- [ ] Hero numbers ≤ 10 characters; big numbers written in words
- [ ] At most 2 annotations on screen at once; ≤ 1 keyword per ~4 spoken words
- [ ] VO has no symbols/abbreviations; every KEYWORD appears verbatim in its VO
- [ ] SCALE stated for any scene about size or distance
- [ ] The HOOK FRAME is composed, and the HOOK MOVE shows the surprising thing within ~3 s
      (Race: frame 0 is the full board, movers on the starting line; HOOK MOVE "none (Race)")
- [ ] Each REVEAL step shows its claim visually (comparison, diagram, bars/meter, timeline or
      counter), and a new visual idea arrives at least every ~5–10 s (not for Race: its constant
      motion replaces this rule)
- [ ] The LOOP returns to the hook, with no call to action
- [ ] Race only: 10–40 s; 3–8 ROWS listed in arrival order, each value written as it should
      appear and backed by SOURCES (or by sourced distances + the speed in the SPEED HEADER); one
      SPEED HEADER naming the mover and its speed; one RULE LINE naming path and which distance;
      VO = hook ≤ 7 words naming the mover + optional closing line, nothing during the race

### Example (three beats)

```
FORMAT: Scale
TARGET LENGTH: 45 s
TITLE: 1.3 Million Earths Fit Inside the Sun
SLUG: sun-volume
TONE: calm awe
HOOK FRAME: close on the Sun's glowing surface, filling the frame, the camera already moving back
HOOK MOVE: fast pull-back: the whole Sun comes into view with a tiny Earth beside it, and
  "1.3 million Earths" lands with the voice by ~3 s
SCALE: true (beats 1–2 and reveal step 1)

SOURCES:
- Sun's volume ≈ 1.3 million Earths — NASA Sun fact sheet
- Sun's diameter ≈ 109 × Earth's — NASA Sun fact sheet
- Jupiter's diameter ≈ one tenth of the Sun's — NASA Sun and Jupiter fact sheets
- The Sun holds ≈ 99.8% of the solar system's mass — NASA Sun facts

BEATS:
1. HOOK (0–3 s)
   VO: "1.3 million Earths fit inside the Sun."
   VISUAL: starts on the HOOK FRAME; the pull-back reveals the Sun with its soft halo and Earth
     as a tiny dot to its left, the hero number landing as the voice says it
   HERO NUMBER: 1.3 million / "Earths" / label "BY VOLUME"
   KEYWORD: Sun
   ANNOTATIONS: marker on Earth — "EARTH ×1"

2. SETUP
   VO: "Side by side, the Sun is 109 Earths wide. That's not a drawing trick; this is the real scale."
   VISUAL: the scale bar draws under the Sun; the Earth marker stays
   HERO NUMBER: (none)
   KEYWORD: 109, real
   ANNOTATIONS: scale bar under the Sun — "109 × EARTH'S WIDTH"

4. REVEAL (two of its steps)
   VO: "Even Jupiter, the biggest planet, is a tenth of its width." / "And the Sun holds 99.8 percent of all the mass in the solar system."
   VISUAL: step 1, a Scale comparison: Jupiter slides in beside the Sun at true size, Earth still
     a dot, names underneath. Step 2, a Meter: the Sun shrinks into the center of the gauge, the
     gold arc fills almost all the way round as 99.8% counts up, label "OF ALL THE MASS"
   HERO NUMBER: (none)
   KEYWORD: Jupiter, mass
   ANNOTATIONS: (none: the comparison names and the meter carry the facts)
```

---

## 7. Learnings

What worked and what didn't. Newest first.

- **Ground view: honest optics carry the look.** Driving every ground-view piece from one field of
  view (Sun, Moon, horizon, stars) made "true size" automatic and made the telephoto Moon look like
  a real long-lens photo rather than a pasted disc. Three things only showed up on the render: a
  sky curve with a sharp kink that a telephoto view magnified into a visible color edge (fixed with
  a smooth curve), observers sunk into the hill they stand on (now placed on the ground), and an
  orange photosphere that made the last crescent read as a cartoon sun (now near-white). Sky
  gradients and the eclipse darkening survived a harsh re-encode (0.8 Mbps, CRF 32) with no new
  banding and the same stars visible at totality.
- **Small and empty reads as static, even when it moves.** A frame-by-frame review of "Why Time Only
  Moves Forward" found the heroes too small (the frame mostly black), a corner-sized timeline with
  tiny labels, four near-still stretches and ~4 s of black before the loop, even with the living
  camera on. Fixed by: hero objects at ~55 % of the safe width, a big centered timeline (60 px
  labels), big particles and arrow, a slow push-in per scene, **moving content tied to each idea**
  (a stream of particles along time's arrow and down the timeline, the gas mixing behind the
  balance), "entropy" shown with the real count (a sorted box mixing while the ways to arrange it
  roll from 10⁰ to 10²⁹), and a heat-death climax where every star goes out one by one, then under
  a second of dark. Measured motion in the flat stretches went from ~0.2–0.4 to ~1–2 (the box
  scenes, which felt right, measure ~2.5). Scripts can help: give every scene something that
  *moves* in its picture, not just something that appears.
- **True peak is measured after encoding.** Aiming loudnorm at −1.5 dBTP gave −0.6 on the AAC file.
  The delivery spec is now ≤ −2.0 dBTP on the encoded file, enforced by a tool that retries with a
  lower target and refuses to deliver a file out of spec.
- **Every render is now measured before you see it:** motion per second (near-still runs ≥ 4 s),
  near-empty frames (> 1 s) and hero size (too small for ≥ 2 s), calibrated on this short's review.
  Each flag comes with the QA report, so a script can be adjusted before the video exists in final
  form. Practical hint for scripts: transitions between big ideas and dark endings are where flags
  appear; give them something visible (a moving element, the next picture arriving early).

- **Connected scenes feel faster without being louder.** The dynamism pass on "Why Time Only
  Moves Forward" (a "100" of particles → the box, the box's frame → the balance beam, a dive into
  the odds → "entropy", whips around a separate star-birth scene, a 3D flight down the timeline)
  kept the same voice and length but no scene starts from nothing. Match cuts first, then
  fly-throughs; whips only where the topic really changes.
- **The camera zoom eats the safe margin.** A 4 % body zoom pushed the balance and a wide label
  against the safe edges; 2.5 % plus a narrower layout fixed it. Leave ~3 % room around wide
  elements in scenes the camera zooms into.

- **Show the number the way the voice says it.** "Why Time Only Moves Forward" first showed "1 in
  10³⁰" while the narrator said "one in a million trillion trillion": it didn't read. Replaced by
  the spoken words landing one by one ("1 in a million / trillion / trillion") plus a small line
  "that's a 1 followed by 30 zeros". Write big numbers in the script the way they should appear.
- **One delivery tag can stick out.** Hook B's `[intense]` sounded off against a calm, curious
  body; `[emphatic]` fit. A hook can be louder than the body, but in the same voice.
- **A fast morph hook reads.** Egg → coffee → "goodbye" → dust → stars, ~0.65–0.75 s per image,
  read at phone scale with no two images overlapping. Around 0.6 s per image is the floor.
- **The music should be heard.** At 19 dB under the voice the bed went unnoticed; the user wanted
  it present: 14 dB under. Between two library beds, `bed-minimal-pulse` beat `bed-warm-hopeful`
  for an explainer about time.
- **The deck variant (B) was the user's pick** over the egg hook (A). Concrete everyday actions
  (a shuffle) make a strong first second.

- **Same voice, new pictures: the visual variety rule works without re-voicing.** "What is a
  quasar?" v2 reused v1's recorded voice (0 credits) and rebuilt the screen: 14 visual ideas in
  74 s (orbit overlay, light paths, bars, meter, balance, timeline), one object carried through
  every scene. A voice-first timeline makes this cheap: a short can be re-animated any time.
- **Scripts that describe sound moods work.** Production picked every clip from the library from
  the script's SOUND MOOD alone. Counting ticks under continuous narration get eaten by the voice
  duck, though: if a count must be heard, leave a breath in the VO where it lands.

- **The narration explained five things; the screen showed one.** "What is a quasar?" talked
  about mass, temperature, efficiency, distance and time, but on screen the quasar only switched
  on and off. It shipped, but it's the lesson: every number gets its own picture (bars for the
  temperature, a meter for the efficiency, a timeline for the light's age, an orbit overlay for
  the size), and a new visual idea arrives every ~5–10 s. The scene can stay continuous; it
  can't stay the same. New components for this are in §3.5.

- **Deep sounds vanish on a phone.** The big cosmic hits are felt on headphones but nearly
  silent on a phone speaker, which is where Shorts are watched. Big moments now carry a small
  mid-range layer on the same beat. Sounds are still picked by ear first: twice the best-sounding
  take was the deep one, and the layer fixes the phone.

- **Anything the camera will zoom into has to be smooth.** Stepped color rings in the disk read
  as vinyl or Saturn's rings up close; the disk is now one continuous gradient.
- **The near side of the disk must be solid.** A see-through disk crossing the shadow looked
  like a half-lit moon. Opaque, it reads as a band passing in front of the black hole.
- **Real jets widen, they don't taper.** They start very narrow at the core and open slowly
  into a narrow cone, fading toward their ends.

- **A glow brighter than the object hides the object.** A near-white halo around the quasar
  swallowed the disk: it shrank to an orange line and the shadow read like an eye. The white
  now lives only on the disk's inner edge; the halo around it stays gold. Solid white jets
  read as bars, so they are thin and fade out instead.
- **Outlines turn planets into stickers.** Crater rings and hard-edged maria broke the sphere.
  Soft, low-contrast shading keeps the features readable and the day/night line the strongest
  thing on the planet.

- **Compression eats faint stars, and flicker is what it eats first.** In a low-bitrate
  re-encode test, faint twinkling stars and a sky fading in were erased even by our own master
  encode. Fix: bigger, brighter faint stars that hold still (only bright ones twinkle), the sky
  present from frame 0, and a near-invisible grain against banding in dark glows. Avoid scripts
  that rely on a sky slowly fading in mid-short.
- **Planets need their signature, not just their color.** Color-only planets looked alike; one
  or two real features each (continents, maria, Great Red Spot…) make them instantly readable.

- **Captions show the script, not the phonetic spelling.** When a name needs a phonetic spelling
  for the voice (PRONUNCIATION), the caption still shows the written word, timed to the voice.
- **Keywords match regardless of capitals and punctuation.** "Sun" in KEYWORD lights up "Sun,"
  in the VO. It still has to be the same word (§6).
- **True scale is brutal, and that's the point.** Next to the Sun, Earth is about 4 px: it is
  drawn as a dot with a ring rather than enlarged. Name labels need room too, so one comparison
  row fits about 5 bodies.

- **The bottom of the screen is bigger than it looks.** On a real phone, YouTube's title and
  description reach about 500 px up from the bottom, so captions sit higher than you'd guess.
- **Big numbers must be short.** At headline size, "1.3 million" fills the safe width; the
  digit version doesn't fit. Write big numbers in words.
- **Stars behind text read as typos.** A star landing on the "L" of VOLUME turned it into "Ł".
  The starfield is now always cleared around text.
- **Annotations work best as proof, not decoration.** "EARTH ×1" plus "109 × EARTH'S WIDTH"
  made the scale land instantly. A third would have been clutter.
- **Light should follow the object.** Letting the Sun's glow bloom more slowly than the disc made
  the reveal feel physical and cinematic.

- **Verify which two things are equal.** When a short's payoff is "these two numbers are the
  same", check exactly which quantities match, not just that they do. (From the orbit short:
  the drop matched the curve of the *orbit*, not of the ground.)
- **Scripts break on wrong facts, so fact-check before animating.** A planned phishing example
  turned out to be impossible in real browsers; the script changed, and the video improved.
- **Write for ~2.4 words per second.** Measured with the channel voice: it averages ~2.5 words/s,
  but lines with commas or an emphatic ending drop to ~2.05. Budgeted at 2.7, those lines had to be
  sped up by ~30%, which sounds rushed. Short, plain sentences keep it natural.
- **Eleven v4 sounds much better than v2.** Chosen by ear, with one delivery direction per line;
  v4 Turbo costs half and sounds the same to us, so it's the default.
- **Comment-bait endings feel dated.** End on the payoff and loop.
- **Sound stays under the voice.** Sparse effects on the key moments; never noise textures under
  narration. (Since brand v2.0 the hook and the peaks are louder than the body, still under the
  voice.)
- **Race (first one, v0.18.1):** a script written without the Race section came in as a 5-beat,
  no-voice, 13 s piece with a launch hit and a punch-in; production adapted it to HOOK / RACE / LOOP.
  Re-upload this file before writing the next Race. With only a hook and a closing line, the race
  itself is ~16 s without voice: the music bed has to sit higher than in a narrated short (about
  10 dB under the voice instead of 19) so the video still reaches delivery loudness, and the arrival
  cues stay soft. Gaps of ~1.6 → 3 s between arrivals read well; 7 rows fit the safe area.

---

## 8. Current phase

**Visual identity: done.** The chosen direction is the *Deep Field hybrid*: cinematic and
editorial, warm, with sparse scientific annotations. It is written up in `brand.md`. The channel
name is decided: ***Look Back in Time***.

**Components and formats: done (base).** The base kit (3.1) is built in the brand style and the
three formats (Impossible Fact, Scale, How It Works) are defined in section 4. The quasar pieces
(3.4) are built. The Zoom ruler (3.6) is next, once its figures are verified.

**First short: done.** "What is a quasar?" shipped (opening 2, pull-back). Its lesson (the
screen showed one thing while the voice explained five) became the visual variety rule and the
kit in 3.5.

**Second short: done.** "Why Time Only Moves Forward" (variants A egg / B deck; B chosen),
built with the arrow-of-time kit (3.7). Its body was then reworked with the **dynamism kit**
(3.8: match cuts, a fly-through, three whips, living camera, punch-ins, beat sync, 3D timeline,
odometer) and re-rendered as the final, then reworked once more after a frame-by-frame review
(bigger heroes, a big timeline, motion in every stretch, the heat-death climax; see Learnings).

**Ground view: done (v0.17).** A second visual mode for near-space topics (3.9): the sky from
the ground, horizons, an observer, the Sun and Moon at true apparent size (wide or telephoto),
total and annular eclipses, the angle cone, and two hand-offs into space view. Third short
"sun-moon-400" (the Sun–Moon size coincidence): published. Next: the moon illusion.

**Race format: defined (v0.18).** A calm, single-scene comparison (§4): rows from one starting
line, movers arriving one by one, the real value written on each row. Its race board and the
spacecraft get built with the first Race short; the car and the runner come later.

**Next:** the custom skills (`script-to-short`,
`new-component`); section 6 becomes final when `script-to-short` exists. Then Manim, only for
physics/equation scenes, rendered as clips inside Remotion.
