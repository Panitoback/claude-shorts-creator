"""sun-moon-400: build sfx-plan.json from the REAL word times (beats.json) and the same frame cues as
SunMoon400.tsx (F() = round(s*30); whip swap = at + 4 with dur 8). Re-run after a re-voice."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
b = json.load(open(os.path.join(HERE, "beats.json"), encoding="utf-8"))
T = lambda line, word: b["vo"][line]["words"][word]["start"]
F = lambda s: round(s * 30)
s = lambda fr: round(fr / 30, 3)
END = b["format"]["durationSec"]
SM1 = F(T(1, 0)) - 7
WHIP1_SWAP = F(T(1, 8))
DIAG_IN = F(T(4, 0)) - 2
CARRY = F(T(6, 2)) + 4
COVERS = T(7, 9)
WHIP2_SWAP = F(T(11, 0))
ODO_AT = F(T(13, 1)) - 2
SM3 = F(T(13, 8)) - 2
LOOP_AT = F(T(15, 0))
E = []
def ev(at, sid, gain, cue, align="attack", optional=False):
    d = {"at_s": round(at, 3), "sfx_id": sid, "gain_db": gain, "cue": cue, "align": align}
    if optional: d["optional"] = True
    E.append(d)
# hook (high, phone-audible)
ev(0.01, "hook-hit", 0, "frame 0: totality over the ridge (corona, Venus)")
ev(s(10 + 0.6 * 26), "whoosh-deep", 1, "fly-through into the Moon's disc: fastest at the cover point, lands on '400'", "peak")
# setup
ev(s(SM1 + 10), "swish-light", -5, "shape match: the space Sun shrinks into the setting Sun", "peak")
ev(s(WHIP1_SWAP) + 0.3, "birds-settle", -18, "dusk over the ridge: a few distant birds settle as the Moon rises (ground ambience)", "start", optional=True)
ev(s(WHIP1_SWAP), "whoosh-soft", -1, "whip 1 (sunset -> moonrise), peak on the swap ('same')", "peak")
ev(s(F(T(2, 2)) - 6) + 0.05, "pop-reveal", -7, "hero '½ degree' arrives ('half')", optional=True)
# reveal steps 1-2
ev(s(DIAG_IN + 7), "swish-light", -6, "shape match: the Moon's disc becomes the diagram's Moon", "peak")
ev(s(DIAG_IN + 12), "photon-travel", -4, "the two sight lines draw from the eye to the Sun's edges")
ev(s(F(T(4, 8)) - 4), "pop-reveal", -2, "label '400 × farther'")
ev(s(F(T(5, 2)) - 4), "pop-reveal", -1, "label '400 × wider' (jitter)")
ev(s(F(T(5, 4)) - 6 + 40) + 0.03, "chime-discovery", -1, "the Sun's ghost lands exactly on the Moon: same angle (in the 0.25 s voice gap before 'They cancel out')")
# reveal step 3: build, hush, main reveal
ev(s(CARRY + 8), "whoosh-wind", -12, "camera drops back to the ground (the observer stays)", "peak")
ev(s(CARRY + 4), "eclipse-hush", -14, "daylight on the ridge: breeze + distant birds that fall silent as the Moon covers the Sun (the eclipse hush)", "start")
ev(COVERS - 0.55, "riser-long", -9, "slow tension under the partial eclipse; crest just before the hush", "peak")
ev(COVERS, "glow-swell", -8, "MAIN REVEAL: totality on 'covers'; the swell STARTS here (no onset in the hush) and crests as the corona blooms", "start")
ev(COVERS, "hook-hit", -6, "phone layer of the main reveal, same audible point", "peak")
ev(T(10, 1), "sparkle-soft", 0, "Venus switches on ('planets')")
ev(T(10, 3), "sparkle-soft", -7, "the first bright star ('stars'), quieter", optional=True)
# twist
ev(s(WHIP2_SWAP), "whoosh-deep", -6, "whip 2 up out of the eclipse into space (2nd and last whoosh-deep)", "peak")
ev(s(WHIP2_SWAP), "impact-deep-soft", -4, "soft low hit on 'But it won't last'", "peak")
ev(s(F(T(12, 0)) - 2), "photon-travel", -3, "laser Earth -> Moon ('Lasers')")
ev(s(F(T(12, 7)) - 6) + 0.05, "pop-reveal", -1, "hero '1.5 inches' arrives")
for i, (dt, g) in enumerate([(0.05, 4), (0.25, 3), (0.45, 4), (0.68, 2), (0.9, 3)]):
    ev(s(ODO_AT) + dt, "tick-soft", g, f"odometer rolling to 600 (tick {i + 1}, thinned)")
ev(s(ODO_AT + 34), "number-settle", 5, "'600' settles")
ev(s(SM3 + 8), "swish-light", -5, "shape match: the Moon's ring grows into the annular ring", "peak")
ev(T(14, 3), "impact-deep-soft", -5, "gentle emphasis + punch-in on 'eclipses' (2nd and last impact-deep-soft)", "peak")
# loop
ev(s(LOOP_AT + 4 + 32), "whoosh-reverse", -4, "time runs back: the Moon grows to today's size, the ring closes", "peak")
ev(s(F(T(15, 4)) - 4), "sparkle-soft", -3, "Venus switches on again (tail ends before the seam)")
plan = {
    "_note": "sun-moon-400 (brand v2.5). Clips from media/library/sfx/USAGE.md against guion.md SOUND MOOD; times from the real word times (make_sfx_plan.py, same cues as SunMoon400.tsx). Bed via mix_music.py: bed-mysterious-vast, lift hook +3 / partial eclipse +2 / TOTALITY -12 (the music almost drops out) / twist +2; ground ambiences by segment (mix_music --ambient id@from-to): wind on the ridge (hook, totality -3, future/loop), sea at sunset, dusk crickets at moonrise; space scenes have none.",
    "master": "shorts/sun-moon-400/output/sun-moon-400-voiced.mp4",
    "master_fps": 30,
    "catalog": "media/library/sfx/catalog.json",
    "render": {"preview": "shorts/sun-moon-400/output/sun-moon-400-voiced.mp4", "out": "shorts/sun-moon-400/output/sun-moon-400-sfx.mp4", "end_s": END, "duck": True},
    "silence": [{"from_s": round(COVERS - 0.5, 2), "to_s": round(COVERS - 0.02, 2), "note": "near-silence right before totality (the riser crest has passed)"}],
    "events": E,
}
json.dump(plan, open(os.path.join(HERE, "sfx-plan.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print(len(E), "events")
