# Design note — quasar components

> **Status: proposal, nothing built.** Pick a direction per piece (or mix), then they get built
> as general components (useful beyond the quasar short: any black hole, any galaxy).
> Brand rules applied: `brand/brand.md` §5 (objects and light, honest scale), §6 (annotations),
> §8 (motion). PROJECT_CONTEXT §5 "hard or slow": no photographic realism, no thousands of
> moving particles, no heavy blur.

Shared constraints for all four pieces:

- **Drawn with the same tools as the base kit:** SVG circles, ellipses, paths and radial/linear
  gradients. **No blur filters** (`feGaussianBlur` is the slow part of a render), no images.
- **Colors from the existing tokens:** the disk uses the temperature ramp already in
  `GLOW_PRESETS` (blue-white hot → gold → deep orange cool); jets use the cool end of
  `STAR_TINTS`. **No neon:** no saturated cyan/magenta, no additive "bloom" stacking, no lens
  flares or streaks, no chromatic fringes.
- **Motion is slow and physical:** rotation suggested, never spun; brightening follows the
  brand's light-follows-object rule (glow arrives after the shape).
- **Honest scale:** disk → galaxy spans about a millionfold. A zoom between them is either
  labeled *not to scale* or done as cuts, each level with its own scale bar.
- Effort estimates include a gallery page and a `--safe` QA pass. S ≈ 2–3 h, M ≈ half a day to a
  day, L ≈ 1–2 days.

---

## 0. Direction (set by the user, applies to everything below)

**The quasar is the most luminous object on the channel, and that is conveyed by contrast, not by
effects.** Concretely:

- **Inner disk clips to near-white** (`#fffaf0` and up) and grades outward through gold
  (`PALETTE.gold`, `BODY.sun` tones) to deep orange at the outer edge.
- **Its corona is stronger than any GlowingBody:** wider (about 2.5× the disk's radius, against
  1.5× for a star) and brighter at the core. Still a radial gradient, never a blur.
- **True `#000` shadow at the center**: the deepest black in the channel, right next to the
  brightest white, for maximum contrast. (This settles open question 2 below: yes.)
- **When the quasar brightens, everything else dims:** host galaxy and background stars lose
  brightness, the way a camera exposing for a bright source would show them. That is what sells
  "brighter than a whole galaxy".
- **Still forbidden:** lens flares, rays or spikes, streaks, frame-wide haze or bloom. The glow
  stays local to the object.

**One `luminosity` prop (0 to 1) drives all of it together:**

| luminosity | Inner disk | Corona | Jets | Host galaxy | Starfield |
|---|---|---|---|---|---|
| 0 (dormant) | dim orange, no white | none | off | full brightness | full (opacity 1) |
| 0.5 | gold, core starting to clip | 1.5× disk radius, medium | faint | ~60% | ~0.6 |
| 1 (quasar) | clipped near-white core → gold → orange | 2.5× disk radius, strongest on the channel | full | ~15% (a ghost) | ~0.25 |

Animating `luminosity` from 0 to 1 is the "switch-on" moment of the short, and it costs nothing
extra: it only changes gradient stops and opacities. The Starfield already has an `opacity` prop,
and the galaxy (4A/4B) gets the same treatment. Implementation: a single `Quasar` scene component
owns `luminosity` and passes the derived values to the disk, corona, jets, galaxy and the sky.

## 1. Black hole

### 1A. Shadow + photon ring — *recommended*
A perfectly black disc (the shadow: true `#000`, approved as the one exception to "never pure
black", so it reads as darker than space) with a thin warm photon ring hugging it: a 2–3 px ivory-gold stroke whose light
falls off outward through a radial gradient (not blur). Optionally slightly brighter on one side
(the same side as the disk's approaching half).
- **Reads as:** "a hole in the light". Minimal, iconic, works at any size.
- **Render cost:** trivial (2–3 elements).
- **Effort:** S.

### 1B. 1A + gravitational lensing of the starfield
Stars near the hole are displaced outward and stretched into short arcs, with a faint second
image on the opposite side, using the real point-lens formula applied to the existing Starfield
positions. When the hole moves (or the camera pans), the sky visibly warps around it.
- **Reads as:** "gravity bends light", a genuine physics moment, no particles.
- **Render cost:** low (it's the same few hundred star dots, only repositioned per frame).
- **Effort:** M (on top of 1A). Could be added later; 1A doesn't block it.

---

## 2. Accretion disk

### 2A. Tilted flat disk
Concentric elliptical bands (6–10 strokes) around the hole, hot and blue-white inside, gold in
the middle, deep orange and fading at the edge. Doppler beaming: the approaching side is
brighter (a linear gradient across the disk's opacity). Rotation suggested by a few faint dashed
bands drifting (animated dash offset, cheap). The back half passes behind the shadow and the
front half over it (the same front/back split the Saturn ring already uses).
- **Reads as:** a glowing, turning disk, clean and diagrammatic. Best for "How It Works" steps
  ("matter spirals in and heats up").
- **Render cost:** low (~15 elements).
- **Effort:** M.

### 2B. 2A + lensed far side (the "seen around the hole" look) — *recommended*
Adds the feature everyone recognizes: the far side of the disk appears bent **over the top and
under the bottom** of the shadow, as two thin arcs hugging the photon ring. Drawn as arcs that
follow the shadow's outline, not ray-traced, in the same flat gradients, so it stays in the
brand's editorial style rather than the movie render.
- **Reads as:** unmistakably a black hole, even at phone size and in the thumbnail.
- **Render cost:** low (a few more paths).
- **Effort:** M+ (2A plus about 2–3 h of tuning the arcs so they look right at different tilts).

*Rejected:* a particle disk (thousands of orbiting dots). It looks great but it's exactly the
"slow to render" case, and it gets noisy on a phone.

---

## 3. Jets

### 3A. Tapered beams with traveling knots — *recommended*
Two very narrow tapered wedges along the spin axis (opposite directions), cool blue-white,
opacity fading to zero with distance. A few brighter "knots" (small soft ellipses) travel outward
along each beam and fade, which shows flow without particles. The jets come in *after* the disk
is established (light follows the object).
- **Reads as:** two thin searchlights of plasma. Calm, no flare.
- **Render cost:** trivial (2 wedges + ~6 knots).
- **Effort:** S.

### 3B. Filament bundle
Each jet built from 20–40 hairline strokes with tiny angle jitter and dashes flowing outward, a
softer, more "physical" texture.
- **Reads as:** more organic, more detail, slightly busier.
- **Render cost:** low (under 100 strokes).
- **Effort:** M. Risk: shimmer on phone compression; would need a QA check at phone scale.

---

## 4. Host galaxy

### 4A. Elliptical glow + sparse stars — *recommended for the quasar short*
3–4 stacked radial-gradient ellipses in warm ivory at very low opacity (a soft galaxy-shaped
haze), plus 150–300 tiny static dots, denser toward the center. One control matters for the
story: the **quasar brightness**. Turned up, the core's glow swallows the whole galaxy, which
*is* the "outshines its galaxy" point, made visible.
- **Reads as:** a calm, distant galaxy; the quasar is clearly the star of the shot.
- **Render cost:** low (static dots + gradients; the whole group can slowly scale or rotate as
  one transform).
- **Effort:** S–M.

### 4B. Spiral galaxy
Two logarithmic-spiral arms built from ~400–800 static dots scattered along the arms, a warm
bulge, a couple of faint dust-lane strokes; the whole group rotates slowly as one transform
(never per-dot animation).
- **Reads as:** "a galaxy" to everyone; more striking, and reusable for Milky Way shorts.
- **Render cost:** moderate (several hundred dots are fine; animating each one individually
  would not be).
- **Effort:** M–L.

---

## How they'd combine in "What is a quasar?"

1. **Hook:** galaxy (4A) with the core already blazing: the quasar outshining it.
2. **Zoom (labeled *not to scale*, or cuts with scale bars):** galaxy haze fades as the core
   region grows, then the disk (2B) and jets (3A) resolve, then the shadow (1A) at the center.
3. **Steps:** shadow alone → matter falls in, disk heats (color ramp) → jets switch on → pull
   back out to the galaxy.

**Recommended set:** 1A + 2B + 3A + 4A, plus the `luminosity` control from §0. Total effort
about **2 days**, all low render cost. 1B (lensing) and 4B (spiral) can come later as upgrades without redoing anything.

**To decide:**
1. One option per piece (or "recommended set").
2. ~~Whether the shadow may use true black~~: decided, yes (§0).
3. Zoom style for the short: labeled continuous zoom, or cuts with a scale bar per level.
