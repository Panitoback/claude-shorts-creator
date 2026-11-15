# Script template — copy this into `shorts/<slug>/guion.md`

> Every short's script follows this template. It is the handoff from the planning project to
> production, and it mirrors `docs/PROJECT_CONTEXT.md` §6 (the two are kept identical).
> Fill every `<...>`. Delete the guidance lines (`>`) if you like; keep the field names.
> Limits are in brackets. Exceeding one isn't fatal, but it will be flagged before production.

---

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
> VO word budgets assume ~2.7 words per second. Total narration ≈ TARGET LENGTH × 2.7 words
>   (e.g. 45 s ≈ 120 words, 90 s ≈ 240 words). Stay within the format's range in §5.
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

2. SETUP [VO ~20% of total narration]
   VO: "<build the tension the hook promised>"
   VISUAL: <...>
   HERO NUMBER: <optional>
   KEYWORD: <word(s), one per caption chunk>
   ANNOTATIONS: <optional, max 2>

3. QUIZ (optional, ~2.5 s) [VO ≤ 7 words]
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

---

## Before handing off — checklist

- [ ] Total VO ≈ TARGET LENGTH × 2.7 words, within the format's range in §5; each beat roughly
      within its share
- [ ] Every fact in VO, on screen or in an annotation is listed in SOURCES
- [ ] Hero numbers ≤ 10 characters; big numbers written in words
- [ ] ≤ 2 annotations per beat; ≤ 1 keyword per ~4 spoken words
- [ ] SCALE stated for any scene about size or distance
- [ ] The HOOK FRAME already shows the surprising thing
- [ ] The LOOP returns to the hook, with no call to action

---

## Example (two beats)

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
