# Project Context — the universe shorts channel

> **For:** the planning project where topics, aesthetics and scripts are developed.
> **Pair it with:** `brand.md` (the visual and sound style contract — read it for colors, type,
> captions, annotations, motion, safe zones and sound taste; this file never repeats it).
> **Version:** v0.12.0 · 2026-11-17 · phase: *first short done → visual variety kit built; whip transitions added*
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
  burst, then settle. One idea per short, one hero object on screen at a time, lots of
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
| **Starfield** | The background sky: mostly faint stars in real temperature colors, a few bright ones with a tiny halo that twinkle. Kept clear behind text and around planets; tuned to survive platform compression. | density, how many bright stars, twinkle on/off, overall brightness (dims when something very luminous is on screen) |
| **Glowing body** | A sun or star: limb-darkened disc with a soft halo that blooms in after the disc and breathes gently | size, position, kind by temperature: *sun* (yellow), *red*, *white*, *blue*; glow strength |
| **Planet / moon** | A sphere lit from one side, night side falling to black, true muted colors, with each body's signature features: Earth's real continents (+ soft clouds), the Moon's soft maria and bright craters, cratered Mercury (craters as soft shading, never outlines), Mars's polar caps and dark regions, Jupiter's belts and Great Red Spot, Saturn's soft bands and ring with the Cassini division, Venus's faint cloud swirls, Neptune's streaks; Uranus nearly featureless (accurate). Small bodies (under ~60 px) are simplified to color and shading. | which body (Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune), size, position, light direction, how much is lit (phase), which side faces us, slow rotation (e.g. Earth turning), axial tilt (Uranus ~98° with its faint ring), atmosphere glow (Earth by default), the warm wash behind it when it's the hero |
| **Hero number** | Big serif number that counts up, gold italic unit, subject line under it, small label above | value, unit, subject, label, count up or just appear, starting value, size (hero or secondary). Long values shrink to fit the safe area. |
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
| **Timeline** | A time axis that draws in, with markers appearing on cue (e.g. Big Bang → light leaves → Earth forms → today). Positions are true; events close together get a short leader line instead of a fake gap | the events (name, date, cue word), which event is gold (more than one is fine), vertical (default, fits a phone) or horizontal (2–3 events), log scale, smaller labels for long names ("FARTHEST QUASAR'S LIGHT" fits on one line) |
| **Balance** | Two totals weighed on a scale (e.g. every star in a galaxy vs one quasar): a heap of stars in one pan, one bright point in the other; the beam tips toward the heavier side and both totals appear | each side's label and value, what sits in each pan (a heap of stars, one bright point, nothing), when the pans get named (e.g. on the spoken words, before the tip), a slow calm tip or a fast peak move on a key word |
| **Flow paths** | Paths that draw in along the direction of travel with a soft glowing head (gas spiraling into a disk, light crossing space). A faint dashed "ghost" can show what does *not* happen first ("straight in?"), then fade | the paths (spiral into a disk, straight line, or a described route), which is the ghost, labels, an arrowhead |
| **Whip transition** *(new, for hooks and peaks)* | A hand-off between two pictures: the first sweeps off fast with motion blur while the next sweeps in from the other side, swapping at full speed and landing softly (no bounce). Chained, it makes a **whip montage** for the hook: several related pictures, ~0.6–1 s each. One whoosh per whip. | which pictures, in what order, the direction of each whip (left, right, up, down), when each whip happens (on a spoken word), how strong the blur is |

For a single big count-up, use the **Hero number** (3.1).

### 3.6 Planned (not built yet)

| Component (planned) | Status |
|---|---|
| **Zoom ruler** (continuous zoom galaxy → disk, with a scale bar that re-labels at each level) | Levels and figures sent for verification; built after approval |
| Light ray (light crossing space, redshifting) | Idea, not designed |

Anything else: list it under NEW COMPONENTS NEEDED in the script.

> **Hero numbers that are too long now get flagged.** If a HERO NUMBER doesn't fit, it is shrunk
> to stay on screen *and* reported in the production QA, so it comes back to the script for a
> shorter wording.

---

## 4. Formats

A *format* is a reusable structure for a short: what it promises the viewer, how long it runs,
and which components carry it. Every format is built on the six-beat base below. Lengths and
word budgets are in §5.

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
> shown on screen, not just said. Scenes hand over smoothly (a camera move, a morph, an object
> carried over, or a whip transition: mainly in the hook and on the peaks; sparingly in the calm
> body). See `brand.md` §5 and §8.

### The three formats at a glance

| Format | Promise to the viewer | Length | Hook (frame 0 → ~3 s) | Carried by |
|---|---|---|---|---|
| **Impossible Fact** | "That can't be true." One counter-intuitive fact, proven fast | 30–60 s | The object on frame 0; the fact (hero number or title) lands fast with the voice | Hero number, Caption with keyword, Data label, Marker, Glowing body / Planet |
| **Scale** | "I finally *feel* how big that is." A size, distance or time next to something familiar | 40–75 s | A fast zoom or pull-back that puts the big thing and the familiar thing side by side, or lands the hero number over the big thing | Scale comparison, Hero number, Scale bar, Marker, Glowing body / Planet |
| **How It Works** | "Oh, *that's* how it works." A mechanism explained step by step | 60–120 s | The end result switching on or revealed fast (what the short will explain) | Any of the base kit and the visual variety kit (3.5), plus whatever new components the steps need (listed under NEW COMPONENTS NEEDED; all of them get built) |

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

Ideas for future formats (to be decided): *myth vs fact*, *"what if"*, *one number explained*.

---

## 5. Constraints and practical limits

### What works well on screen
- **One main object at a time**, big and centered. A phone screen is small; detail gets lost.
- **Numbers**, especially when they count up live, change scale, or compare two things.
- **Continuity over cuts, but not one scene.** Scenes flow into each other (a camera move, a
  morph, the same object carried into the next picture, or a **whip transition**: a fast sweep
  with motion blur, one whoosh each) instead of hard cuts. Whips belong mainly in the hook (a
  rapid montage of related pictures, ~0.6–1 s each) and on the peaks; the calm body uses them
  sparingly. Still never: a hard cut to an unrelated picture with no motion, shake, or flicker.
  The short still needs **a new visual idea every ~5–10 s**: one scene for the whole short reads as a still.
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
- **3D**: true 3D camera moves are not currently part of the toolkit. Flat or lightly shaded
  "2.5D" (spheres with shading, layered depth) works well.

### Timing and length
- **Length depends on the format.** The content decides the length; any scene that doesn't add
  something gets cut.

  | Format | Length | Narration (at ~2.4 words/s) |
  |---|---|---|
  | Impossible Fact | 30–60 s | ~70–145 words |
  | Scale | 40–75 s | ~95–180 words |
  | How It Works | 60–120 s | ~145–290 words |

- **Hard ceiling: 180 s** (the YouTube Shorts limit, and Instagram's limit for reaching
  non-followers). Only with explicit approval.
- These ranges are **provisional**. Revisit them once we have retention data from the first
  5–10 shorts.
- **Scene length:** each scene or reveal step lasts 3–8 seconds; a beat can contain several steps. A single visual held longer than ~8 seconds
  needs something changing on screen.
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
FORMAT: Scale | Impossible Fact | How It Works
TARGET LENGTH: XX s
TITLE: <the short's title, as it would appear on YouTube> [≤ 60 characters]
SLUG: <folder name: lowercase-with-dashes, e.g. sun-volume> [2–4 words]
TONE: <calm awe | playful | eerie | matter-of-fact>
HOOK FRAME: <what the very first frame shows: composed, subject already there, no fade from black. It is the START of the hook's motion, not the cover (the cover is picked at upload)>
HOOK MOVE: <the fast change in the first ~3 s that delivers the surprise: ignition, pull-back, dive-in, zoom, or a whip montage (rapid related pictures, ~0.6–1 s each, joined by whip transitions)…>
SCALE: <true | not to scale> <required if any scene is about size or distance; say which scenes>

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
- [ ] Each REVEAL step shows its claim visually (comparison, diagram, bars/meter, timeline or
      counter), and a new visual idea arrives at least every ~5–10 s
- [ ] The LOOP returns to the hook, with no call to action

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

**Next:** the custom skills (`script-to-short`,
`new-component`); section 6 becomes final when `script-to-short` exists. Then Manim, only for
physics/equation scenes, rendered as clips inside Remotion.
