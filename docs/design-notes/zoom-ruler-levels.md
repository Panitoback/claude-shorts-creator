# Zoom ruler: planned levels and labels (for verification, NOT built yet)

> **Status:** waiting for the user to verify the figures. Nothing is built until they're approved.
> Component: a general **Zoom ruler**. A scale bar fixed at the bottom of the safe area that
> **re-labels as the camera zooms continuously**, so every frame stays honest about scale.

## How the ruler behaves

- The bar sits under the subject, inside the safe rectangle, at **180–450 px** long.
- As the zoom passes through, the bar snaps to the next "nice" value and its length jumps back,
  the way a map's scale bar does. Values step in a **1 – 5 – 10** sequence (two labels per
  power of ten), so the label changes about every 1.5 s at a typical zoom speed rather than
  flickering.
- **Units stay in one family, the distance light travels:** light-years, then light-days, then
  light-hours. It's consistent, and it fits the story ("light takes 14 hours to cross it").
- Each re-label is a 12-frame cross-fade (the brand's label timing), never a hard cut.

## Reference quasar

The figures assume a **typical bright quasar: a black hole of 1 billion Suns** (real quasars
range from ~100 million to ~10 billion). Every black-hole size scales linearly with that mass.
If the script names a specific quasar (e.g. 3C 273, ~900 million Suns), the numbers get
recomputed for it.

| Quantity | Value (1 billion Suns) | How it's obtained |
|---|---|---|
| Schwarzschild radius | 2.95 billion km (~20 AU) | R = 2GM/c² = 2.95 km × mass in Suns |
| Event horizon, diameter | ~5.9 billion km ≈ **5.5 light-hours** | 2R |
| **Shadow, diameter** | ~15 billion km ≈ **14 light-hours** (~100 AU) | √27 · R ≈ 5.2 R (the photon-capture size, as in the M87* image) |
| Glowing accretion disk (optical/UV) | ~10¹⁵–10¹⁶ cm ≈ **0.4–4 light-days** across | quasar microlensing sizes (e.g. Morgan et al. 2010) |
| Broad-line gas region | **tens to hundreds of light-days** | reverberation mapping (e.g. Kaspi et al. 2000) |
| Dusty torus | ~**3–30 light-years** | infrared interferometry (≈1–10 parsecs) |
| Jets | up to **hundreds of thousands of light-years** | radio maps (e.g. 3C 273's jet) |
| Host galaxy | ~**100,000 light-years** | typical large host; massive ellipticals reach 2–3× that |

## Planned levels (the zoom passes through them continuously)

Frame width is the safe width (840 px). The bar is one of the labels below, drawn at true length.

| # | On screen | Frame width ≈ | Scale bar label(s) while here |
|---|---|---|---|
| 1 | **Host galaxy**, quasar blazing at its core; jets reach beyond the galaxy | 150,000 ly | **50,000 light-years** |
| 2 | Galaxy core; the galaxy's haze fills the frame and fades | 15,000 ly | 10,000 ly → **5,000 light-years** |
| 3 | Inner core; only the corona and the jets' bases | 1,500 ly | 1,000 ly → **500 light-years** |
| 4 | Nucleus (the dusty-torus scale; torus not drawn, it's a pass-through) | 150 ly | 100 ly → **50 light-years** → 10 ly |
| 5 | Inside the torus scale | 15 ly | **5 light-years** → 1 light-year |
| 6 | Broad-line gas scale (pass-through) | ~100 light-days | **100 light-days** → 50 light-days |
| 7 | **Accretion disk** resolves: hot inner disk, lensed far side, jets leave the poles | ~15 light-days | 10 light-days → **5 light-days** |
| 8 | **The shadow**: disk fills the frame, black center | ~2 light-days | **1 light-day** → **10 light-hours** |

**Full label sequence** (in order): 50,000 ly · 10,000 ly · 5,000 ly · 1,000 ly · 500 ly ·
100 ly · 50 ly · 10 ly · 5 ly · 1 light-year · 100 light-days · 50 light-days · 10 light-days ·
5 light-days · 1 light-day · 10 light-hours. That's 16 labels across ~7.3 powers of ten
(150,000 ly down to ~2 light-days, a zoom of ~25 million×).

## Honesty notes

- The zoom is continuous and the bar is always true for what's on screen, so no "not to scale"
  label is needed **during** the zoom.
- Between levels 3 and 7 there is genuinely almost nothing to draw at our level of detail; the
  zoom moves fast through there (most of the time is spent on levels 1, 7 and 8).
- The drawn disk's diameter is 4.6× the shadow's. With a 14-light-hour shadow that's ~64
  light-hours ≈ **2.7 light-days**, inside the measured 0.4–4 light-day range for the glowing
  disk, so the Quasar component is roughly to scale as drawn. Level 8's bar makes it explicit.

## To verify

1. The reference mass (1 billion Suns), or a specific quasar for the first short.
2. The figures in the reference table (they'll go into SOURCES).
3. Units: light-years → light-days → light-hours (alternative: kilometers throughout).
4. The 1 – 5 – 10 label sequence above.
