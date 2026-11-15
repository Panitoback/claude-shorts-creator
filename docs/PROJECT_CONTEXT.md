# Project Context — the universe shorts channel

> **For:** the planning project where topics, aesthetics and scripts are developed.
> **Pair it with:** `brand.md` (the visual and sound style contract — read it for colors, type,
> captions, annotations, motion, safe zones and sound taste; this file never repeats it).
> **Version:** v0.5 · 2026-11-15 · phase: *visual identity done → components and formats next*
>
> This file describes **what can be asked for**, not how it is built. If a script asks for
> something listed here, it can be made. If it asks for something not listed, flag it as a
> *new component request*: it may well be possible, it just costs a build step first.

---

## 1. What this channel is

- **YouTube Shorts about the universe.** Vertical video (phone screen), usually 30–120 seconds, depending on the format (see section 5).
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
- **Annotations** (cool blue, thin, at most 2 per scene): a *marker* on a tiny object with a
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
5. **Voice.** ElevenLabs reads each line. The real timing of every spoken word is captured, so
   captions and on-screen moments land exactly on the word.
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

> **Status:** the visual identity is set (see `brand.md`), so the channel's own space components
> come next (3.3). What 3.1–3.2 list was inherited from the earlier example videos and still
> wears the old look. It will be restyled or retired. Stamps, pause cards and colored chips in
> particular may not survive the new minimalist style.

### 3.1 Always available (used in every short)

| Component | What it shows | Options you can ask for |
|---|---|---|
| **Captions** | The narration on screen, a few words at a time, the spoken word highlighted | highlight color, size, vertical position, words per caption (default 4) |
| **Progress bar** | A thin line across the top that fills as the short plays | color |
| **Big title** | One to three lines of large headline text, e.g. the hook | text per line, color per line, a smaller subtitle, size, position |
| **Kicker** | A small label above the main visual ("STEP 2", "THE TWIST") | text, color, when it appears and disappears |
| **Stamp** | A word slapped on at an angle for emphasis ("WRONG", "FALLING") | text, color, position, size, tilt, timing |
| **Stat chip** | A small card with a label and a value ("Speed · 7.7 km/s") | label, value, color, position, width, timing |
| **Pause card** | A "pause and guess" card that invites the viewer to answer | title, subtitle, how long it stays, accent color |
| **Backdrop** | The background behind everything | base color, glow color |

### 3.2 Space and orbits (inherited from the "Astronauts are falling" short)

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
gravity at any altitude around Earth are *calculated*, not typed in.

### 3.3 Planned (not built yet)

These come straight from the brand. Most already appear, as a one-off, in the reference scene;
next they become reusable building blocks with options:

| Component (planned) | What it will show | Options you'll be able to ask for (expected) |
|---|---|---|
| **Starfield** | The background sky: faint stars in real colors, slowly twinkling | density, how many bright stars |
| **Glowing body** | A sun or star: bright disc with a soft halo | size, color/temperature, glow strength |
| **Planet / moon** | A shaded sphere lit from one side | which body, size, light direction |
| **Hero number** | Big serif number that counts up, with gold unit and subject line | value, unit, subject, small label above, count speed |
| **Caption with keyword** | Narration on screen, the keyword in gold italic | which word is the keyword |
| **Marker + leader line** | A ring around a tiny object, a thin line, a label | object, label text, value |
| **Scale bar** | A measured bar with end ticks and a label | what it spans, label text |
| **Data label** | A small blue fact next to an object | text, value |
| **Scale comparison** | Two or more bodies side by side at true scale | which bodies |

Further ideas, not yet designed: orbit diagram, distance/zoom ruler, light ray, timeline.
Entries move into 3.1–3.2 as they get built.

---

## 4. Formats

A *format* is a reusable structure for a short. Formats for this channel are not defined yet;
they will be designed with the components. Until then, every short follows the base structure:

### Base format: the six-beat short

| Beat | Time | Purpose |
|---|---|---|
| **Hook** | 0–3 s (always fixed) | The very first frame is fully composed and already shows the surprising thing. It is also the thumbnail. No fade from black. |
| **Setup** | ~20% | Show the situation fast; build the tension the hook promised. |
| **Quiz** *(optional)* | ~2.5 s | "Pause. Can you guess?" Drives comments and rewatches. |
| **Reveal** | ~45% | The payoff in 2–4 steps, each step landing on a spoken word. |
| **Twist** | ~20% | A reframe or bonus insight: the "send this to a friend" moment. |
| **Loop** | last ~3–4 s | The last frame visually matches the first, so the replay is seamless. |

Longer shorts (How It Works) may repeat Setup/Reveal pairs, one idea per beat.

Ideas for future formats (to be decided): *scale ladder* (zooming from small to huge),
*myth vs fact*, *"what if"*, *one number explained*.

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

  | Format | Length | Narration (at ~2.7 words/s) |
  |---|---|---|
  | Impossible Fact | 30–60 s | ~80–160 words |
  | Scale | 40–75 s | ~110–200 words |
  | How It Works | 60–120 s | ~160–320 words |

- **Hard ceiling: 180 s** (the YouTube Shorts limit, and Instagram's limit for reaching
  non-followers). Only with explicit approval.
- These ranges are **provisional**. Revisit them once we have retention data from the first
  5–10 shorts.
- **Scene length:** most beats are 3–8 seconds. A single visual held longer than ~8 seconds
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
- **Annotations:** at most **2 per scene**, and every one must state a checked fact.

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
> VO word budgets assume ~2.7 words per second. Total narration: ~100 words (max ~110).
> HERO NUMBER: `value unit / "subject" / label "LABEL"`, any part optional. Value + unit
>   ≤ 10 characters ("1.3 million" ✓, "1,300,000 Earths" ✗). Write big numbers in words.
> KEYWORD: the word that turns gold in the caption. At most one per ~4 spoken words, and it
>   must carry the idea ("Sun", "falling"), not just be long.
> ANNOTATIONS: at most 2 per beat. Each one is a short label plus the fact it states.
>   Types: marker + leader line · scale bar · data label.

1. HOOK (0–3 s) [VO ≤ 8 words]
   VO: "<first line: the surprising claim>"
   VISUAL: <the hero object / scene; must match HOOK FRAME>
   HERO NUMBER: <optional>
   KEYWORD: <word>
   ANNOTATIONS: <optional, max 2>

2. SETUP [VO ≤ 24 words]
   VO: "<build the tension the hook promised>"
   VISUAL: <...>
   HERO NUMBER: <optional>
   KEYWORD: <word(s), one per caption chunk>
   ANNOTATIONS: <optional, max 2>

3. QUIZ (optional, ~2.5 s) [VO ≤ 7 words]
   VO: "<a question the viewer can try to answer>"
   VISUAL: <...>

4. REVEAL [VO ≤ 48 words, in 2–4 steps]
   VO: "<step 1>" / "<step 2>" / "<step 3>"
   VISUAL: <what changes on screen at each step; ideally the same scene evolving, not cuts>
   HERO NUMBER: <optional>
   KEYWORD: <word(s)>
   ANNOTATIONS: <optional, max 2 on screen at once>

5. TWIST [VO ≤ 21 words]
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
```

### Before handing off: checklist

- [ ] Total VO ≈ 100 words (≤ 110), and each beat is within its word budget
- [ ] Every fact in VO, on screen or in an annotation is listed in SOURCES
- [ ] Hero numbers ≤ 10 characters; big numbers written in words
- [ ] ≤ 2 annotations per beat; ≤ 1 keyword per ~4 spoken words
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
   VO: "You could fit 1.3 million Earths inside the Sun."
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
- **Write for ~2.7 words per second.** Faster lines had to be sped up noticeably and sounded
  rushed.
- **Comment-bait endings feel dated.** End on the payoff and loop.
- **Sound stays under the voice.** Calm, sparse effects on the 2–3 key moments; never noise
  textures under narration.

---

## 8. Current phase

**Visual identity: done.** The chosen direction is the *Deep Field hybrid*: cinematic and
editorial, warm, with sparse scientific annotations. It is written up in `brand.md`. The channel
name is still open.

**Next: components and formats.** The planned components (3.3) get built in the brand style, and
the channel's formats (section 4) get defined. After that come the Manim skill and the custom
skills (`script-to-short`, `new-component`). Section 6 becomes final when `script-to-short` exists.
