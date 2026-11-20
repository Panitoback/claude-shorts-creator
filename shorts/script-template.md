# Script template — copy this into `shorts/<slug>/guion.md`

> Every short's script follows this template. It is the handoff from the planning project to
> production, and it mirrors `docs/PROJECT_CONTEXT.md` §6 (the two are kept identical).
> Fill every `<...>`. Delete the guidance lines (`>`) if you like; keep the field names.
> Limits are in brackets. Exceeding one isn't fatal, but it will be flagged before production.

---

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

MOVER: <spacecraft | car | runner (all built, §3.6); a no-voice Race may run two of them one after the other (§4 Race, variant)>
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

---

## Before handing off — checklist

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

---

## Example (three beats)

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
