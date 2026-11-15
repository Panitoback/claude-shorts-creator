# Project Context — the universe shorts channel

> **For:** the planning project where topics, aesthetics and scripts are developed.
> **Pair it with:** `brand.md` (the visual and sound style contract — read it for colors, type,
> captions, annotations, motion, safe zones and sound taste; this file never repeats it).
> **Version:** v0.9.4 · 2026-11-15 · phase: *base components and formats done → first short next*
>
> This file describes **what can be asked for**, not how it is built. If a script asks for
> something listed here, it can be made. If it asks for something not listed, flag it as a
> *new component request*: it may well be possible, it just costs a build step first.

---

## 1. What this channel is

- **Vertical shorts about the universe for YouTube Shorts, TikTok and Instagram Reels.** Usually 30–120 seconds, depending on the format (see section 5).
  Space, scale, light, gravity, time, planets, stars, the things that make the cosmos feel
  unreal but are true.
- **Every frame is animated with code.** There is no footage, no stock video, no photos, and
  **no AI-generated images or video**. What you see is drawn and moved precisely: real orbits,
  real proportions, numbers that actually count up. Because of that, every short can be
  re-edited, restyled or re-voiced later without starting over.
- **Minimalist and cinematic.** One idea per short, one hero object on screen at a time, lots of
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
idea  →  script  →  animation  →  check  →  voice  →  sound  →  final video
```

1. **Script.** You (in the planning project) write the narration and describe what should be
   on screen for each moment, using the handoff format in section 6.
2. **Fact check.** Every number and claim is verified before anything is animated. If a fact
   turns out to be wrong or misleading, the script changes, not the truth.
3. **Animation.** The scenes are built from the visual components in section 3. If a scene
   needs something that doesn't exist yet, a new component is built first.
4. **Visual check.** Still frames are rendered at phone size and inspected: is the text
   readable, is anything cut off, does the first frame work as a thumbnail?
5. **Voice.** ElevenLabs reads each line (the channel voice on Eleven v4 Turbo). Each line gets
   one light delivery direction (intrigued, awed, emphatic…) added at this step, matched to the
   beat; it shapes the reading and never appears on screen. The real timing of every spoken word
   is captured, so captions and on-screen moments land exactly on the word.
6. **Sound.** Subtle sound effects are placed on key moments (a soft whoosh on a transition, a
   gentle impact on the reveal), plus an optional quiet music bed.
7. **Final video.** Rendered at 1080×1920, 30 frames per second.

### What to hand off for a new short

Save each script as **`guion.md`** in its own folder, **`shorts/<slug>/`**, where the slug is a
short lowercase name such as `sun-volume` or `iss-falling`. It is built from there. Finished
shorts are recorded in the repo's `PRODUCED.md` (title, format, date, status).

- The **script in the handoff format** (section 6): title, hook, narration lines, and a short
  description of the visual for each beat.
- **Sources** for every number or claim (a link or a named reference is enough).
- Optional: tone notes (calm, awe, playful), a preferred voice, and the one image the
  thumbnail should be.

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
| **Quasar** | All of the above together, driven by one **luminosity** dial: as it rises, the disk turns white-hot, the glow grows up to 3× the disk, the jets switch on, and the host galaxy and background stars all but vanish (as if the camera were exposing for the quasar) | size, position, luminosity (or a "switch-on" from dormant to full), angle and tilt, jets on/off |

### 3.5 Planned (not built yet)

| Component (planned) | Status |
|---|---|
| **Zoom ruler** (continuous zoom galaxy → disk, with a scale bar that re-labels at each level) | Levels and figures sent for verification; built after approval |
| Orbit diagram, light ray, timeline | Ideas, not designed |

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
| **Hook** | 0–3 s (always fixed) | The very first frame is fully composed and already shows the surprising thing. It is also the thumbnail. No fade from black. |
| **Setup** | ~20% | Show the situation fast; build the tension the hook promised. |
| **Quiz** *(optional)* | ~2.5 s | "Pause. Can you guess?" Drives comments and rewatches. |
| **Reveal** | ~45% | The payoff in 2–4 steps, each step landing on a spoken word. |
| **Twist** | ~20% | A reframe or bonus insight: the "send this to a friend" moment. |
| **Loop** | last ~3–4 s | The last frame visually matches the first, so the replay is seamless. |

### The three formats at a glance

| Format | Promise to the viewer | Length | Hook frame | Carried by |
|---|---|---|---|---|
| **Impossible Fact** | "That can't be true." One counter-intuitive fact, proven fast | 30–60 s | The fact itself, already on screen: hero number or title + the object | Hero number, Caption with keyword, Data label, Marker, Glowing body / Planet |
| **Scale** | "I finally *feel* how big that is." A size, distance or time next to something familiar | 40–75 s | The big thing and the familiar thing already side by side, or the hero number over the big thing | Scale comparison, Hero number, Scale bar, Marker, Glowing body / Planet |
| **How It Works** | "Oh, *that's* how it works." A mechanism explained step by step | 60–120 s | The end result, visible and striking (what the short will explain) | Any of the base kit, often plus one new component for the mechanism |

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

- **Hook:** the comparison is already visible, or the hero number sits over the big object
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

- **Hook:** show the end result (the glowing quasar, the eclipse, the tide), not the diagram.
- **Setup:** the question, in one line ("But black holes don't shine. So what does?").
- **Steps:** 2–4 SETUP → REVEAL pairs, **one idea per step**. Ideally the same scene evolving
  (one element added per step) rather than cuts to new scenes.
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
- **Continuity over cuts.** The best shorts keep one scene alive (the same planet, the same
  orbit) and evolve it, rather than jumping between unrelated pictures.
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
HOOK FRAME: <what the very first frame shows. It is also the thumbnail, so the surprising thing must already be visible>
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
   VISUAL: <the hero object / scene; must match HOOK FRAME>
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
   VISUAL: <what changes on screen at each step; ideally the same scene evolving, not cuts>
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
NOTES: <optional: voice delivery hints, music mood, anything else>
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
- [ ] The HOOK FRAME already shows the surprising thing
- [ ] The LOOP returns to the hook, with no call to action

### Example (first two beats)

```
FORMAT: Scale
TARGET LENGTH: 45 s
TITLE: 1.3 Million Earths Fit Inside the Sun
SLUG: sun-volume
TONE: calm awe
HOOK FRAME: the Sun, huge and glowing; a tiny Earth marked beside it; "1.3 million Earths"
SCALE: true (beats 1–2)

SOURCES:
- Sun's volume ≈ 1.3 million Earths — NASA Sun fact sheet
- Sun's diameter ≈ 109 × Earth's — NASA Sun fact sheet

BEATS:
1. HOOK (0–3 s)
   VO: "1.3 million Earths fit inside the Sun."
   VISUAL: the Sun with a soft halo; Earth as a tiny dot to its left
   HERO NUMBER: 1.3 million / "Earths" / label "BY VOLUME"
   KEYWORD: Sun
   ANNOTATIONS: marker on Earth — "EARTH ×1"

2. SETUP
   VO: "Side by side, the Sun is 109 Earths wide. That's not a drawing trick; this is the real scale."
   VISUAL: the scale bar draws under the Sun; the Earth marker stays
   HERO NUMBER: (none)
   KEYWORD: 109, real
   ANNOTATIONS: scale bar under the Sun — "109 × EARTH'S WIDTH"
```

---

## 7. Learnings

What worked and what didn't. Newest first.

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
- **Sound stays under the voice.** Calm, sparse effects on the 2–3 key moments; never noise
  textures under narration.

---

## 8. Current phase

**Visual identity: done.** The chosen direction is the *Deep Field hybrid*: cinematic and
editorial, warm, with sparse scientific annotations. It is written up in `brand.md`. The channel
name is still open.

**Components and formats: done (base).** The base kit (3.1) is built in the brand style and the
three formats (Impossible Fact, Scale, How It Works) are defined in section 4. The quasar pieces
(3.4) are built. The Zoom ruler (3.5) is next, once its figures are verified.

**Next: first short, 'What is a quasar?'** Then the custom skills (`script-to-short`,
`new-component`); section 6 becomes final when `script-to-short` exists. Then Manim, only for
physics/equation scenes, rendered as clips inside Remotion.
