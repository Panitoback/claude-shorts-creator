"""Writes sfx-plan.json for fold-paper-to-the-moon from the real word times in beats.json.
Cue frames mirror the constants in remotion/src/shots/fold-paper-to-the-moon/FoldPaperToTheMoon.tsx
(same names), so a re-voice re-times every cue. Run from the repo root:
    python shorts/fold-paper-to-the-moon/make_sfx_plan.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(os.path.join(HERE, "beats.json"), encoding="utf-8"))
VO = B["vo"]
FPS = 30
END = B["format"]["durationSec"]
F = lambda s: round(s * FPS)
T = lambda l, w: VO[l]["words"][w]["start"]
S = lambda fr: round(fr / FPS, 3)

# ---- the composition's cue frames ----
RW0, RW1 = F(3.3), F(3.95)
FOLD1, FOLD2, FOLD3 = F(T(1, 2)) - 3, F(T(1, 4)) - 3, F(T(2, 1)) - 3
SP = F(T(2, 8)) + 4
ASC0 = SP + 50
R14 = F(T(4, 0)) + 6
R23b = F(T(5, 0)) + 34
R30b = F(T(6, 0)) + 26
R32b = F(T(7, 0)) + 28
R42a = F(T(8, 1)) - 1
MOON2 = F(T(8, 4))
TW0 = F(T(10, 0)) - 14
PULL0, PULL1 = F(T(11, 0)), F(T(11, 5)) + 10
RF0 = F(T(12, 0)) - 2
GHOST = F(T(13, 2)) - 6
B0 = F(T(14, 0))
SUN = F(T(15, 4))
UNI = F(T(16, 5))
LP0 = F(T(17, 0)) - 14

ev = []
def add(at_s, sfx, gain, cue, align="attack", optional=False):
    e = {"at_s": round(max(0.0, at_s), 3), "sfx_id": sfx, "gain_db": gain, "cue": cue, "align": align}
    if optional:
        e["optional"] = True
    ev.append(e)

# hook: hit on frame 0, the climb's whoosh at its fastest (middle of the 0.25 → 2.55 s count)
add(0.01, "hook-hit", 0, "frame 0: the sheet on the ground, counter at 0")
add(1.35, "whoosh-deep", 3, "the climb: fastest stretch of the 0 → 42 count", "peak")
# rewind into the macro shot
add(S(RW0 + 14), "whoosh-reverse", -3, "the column rewinds to one sheet", "peak")
# the first folds: a soft crease snap as each flap lands; the speed-up folds quieter
for i, fr in enumerate([FOLD1, FOLD2, FOLD3]):
    add(S(fr + 14), "paper-fold", [7, 4, 8][i], f"fold {i + 1} lands")
for i in range(5):
    add(S(SP + i * 10 + 8), "paper-fold", -1 - i * 0.8, f"fast fold {i + 4} lands", optional=True)
# the ladder: a gentle tick on each rung
# ...in the breath BEFORE each number (the voice leaves ~0.45 s there), as the counter starts its climb
for line, n in [(4, 14), (5, 23), (6, 30), (7, 32)]:
    add(T(line, 0) - 0.22, "tick-soft", 7, f"rung: the counter climbs to {n}")
# the Moon: deep whoosh on the pull-back, THE hit on "Moon" (+ the phone layer)
add(S(R42a + 9), "whoosh-deep", 2, "punch pull-back to the Earth–Moon frame", "peak")
add(T(8, 4), "impact-cosmic", 2, "'Moon': the column overshoots the Moon (main reveal)", "peak")
add(T(8, 4), "hook-hit", 3, "phone layer of the Moon hit (under the spoken word: above its usual -6)", "peak")
add(S(MOON2 + 16), "number-settle", 4, "273,000 miles lands", optional=True)
# reality check: match cut, pull back over the fields, 13 quick folds, the ghost of 10 miles
add(S(TW0 + 8), "swish-light", -3, "match cut: column → ribbon on the fields", "peak")
add(S(PULL0 + 18), "whoosh-wind", -4, "pull back over all 176 fields", "peak")
for i in range(0, 13, 2):
    add(S(RF0 + i * 3 + 3), "paper-fold", -3 - (i % 4) * 0.5, f"ribbon fold {i + 1}")
add(T(12, 4), "number-settle", 6, "the counter stops on 13")
add(S(GHOST + 16), "whoosh-soft", -4, "'10 miles': pull back, the ghost of the ribbon", "peak")
# keep going: block → bars, Sun, the swell into the universe hit
add(S(B0 + 6), "swish-light", -3, "shape match: block → the first bar", "peak")
add(S(B0 + 20), "pop-reveal", -2, "MOON bar appears")
add(S(SUN), "pop-reveal", 3, "'Sun': the SUN bar full")
add(S(UNI), "riser-soft", 0, "swell through the bars, crest on 'universe'", "peak")
add(S(UNI), "impact-deep-soft", 1, "'universe': the gold bar lands (twist peak)", "peak")
add(S(UNI), "pop-reveal", -3, "phone layer of the universe hit", "peak")
# loop: the bars collapse into the sheet, one last soft crease on "fold"
add(S(LP0 + 10), "whoosh-soft", -5, "bars collapse into the sheet edge", "peak")
add(T(17, 6) + 0.05, "paper-fold", -2, "'one fold': a last soft crease before the loop")

plan = {
    "_note": "fold-paper-to-the-moon. Clips from media/library/sfx/USAGE.md against guion.md SOUND MOOD; times from the real word times (this script mirrors FoldPaperToTheMoon.tsx). New clip: paper-fold (ours). Music dip for the toilet-paper beat is done in mix_music (negative lift).",
    "master": "shorts/fold-paper-to-the-moon/output/fold-paper-to-the-moon-voiced.mp4",
    "master_fps": FPS,
    "catalog": "media/library/sfx/catalog.json",
    "render": {
        "preview": "shorts/fold-paper-to-the-moon/output/fold-paper-to-the-moon-voiced.mp4",
        "out": "shorts/fold-paper-to-the-moon/output/fold-paper-to-the-moon-sfx.mp4",
        "end_s": END,
        "duck": True,
    },
    "silence": [{"from_s": round(T(13, 5) - 0.35, 2), "to_s": round(T(13, 5) - 0.02, 2), "note": "wry beat before 'toilet paper': nothing but the voice"}],
    "events": sorted(ev, key=lambda e: e["at_s"]),
}
json.dump(plan, open(os.path.join(HERE, "sfx-plan.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print(f"{len(ev)} events -> sfx-plan.json")
