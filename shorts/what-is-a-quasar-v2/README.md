# what-is-a-quasar-v2 — notes

- v2 of `what-is-a-quasar` (brand v2.1 visual-variety test). **Same voice** (v1's cached clips,
  hook A; 0 credits): `beats.json` copies v1's `vo[]`; `gen_voice.py` rebuilt the identical 73.8 s
  timeline. Variant A only. v1 and its composition are untouched.
- Composition: `remotion/src/shots/what-is-a-quasar-v2/WhatIsAQuasarV2.tsx` (`WhatIsAQuasarV2A`).
  Every dial is an absolute keyframe track read from the voice's word times.
- Deviations from guion.md: the hook's kinetic title also shows "Black holes / power" (page 1, as
  in v1) so the first three spoken words are on screen; added labels "STRONG JETS",
  "ALMOST EVERY QUASAR"; balance totals "~100 billion" vs "1 disk" (tilt at the conservative 100×);
  event horizon drawn at 1/2.6 of the shadow (the physical value).
- Outputs (git-ignored): `output/what-is-a-quasar-v2-a-final.mp4` (voice + SFX + music bed-mysterious-vast + ambient accretion-swirl-loop, −13.7 LUFS),
  `output/compare-v1-v2.mp4` (v1 left, v2 right, v2 audio), QA sheets `output/qa-*.png`.
- Revision (user request): REVEAL 1a now shows the gas streaming in and the disk building from "falling in" to "disk"; a light flicker around the shadow right after "So what's shining?". Two new library clips: `gas-infall-swirl`, `light-glint-flicker`.
- Final audio (user-approved): gas SFX lowered to −5 dB for voice clarity; music `bed-mysterious-vast` 19 dB under the voice with +3/+4/+3 dB lifts on the hook, "Combined." and the twist; ambient loop lowered to 24 dB under the voice. Mix command in `media/library/sfx/USAGE.md` (mix log).
