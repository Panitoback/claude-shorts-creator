import json, os
os.chdir(r"C:\Users\User\Desktop\Claude Factory\claude-shorts-creator")
SL = "why-time-moves-forward"

def vo(path):
    return json.load(open(path, encoding="utf-8"))["vo"]

def word(V, line, w):
    for x in V[line]["words"]:
        if x["w"].lower().strip(".,?!:;'\"").startswith(w):
            return x["start"]
    raise KeyError((line, w))

A = vo(f"shorts/{SL}/beats.json")
B = vo(f"shorts/{SL}/b/beats.json")
OFF = A[4]["start"] - B[4]["start"]  # body lines 4-26 are the same clips: constant shift

def E(at, sid, g, cue, align=None, opt=False):
    e = {"at_s": round(at, 3), "sfx_id": sid, "gain_db": g, "cue": cue}
    if align: e["align"] = align
    if opt: e["optional"] = True
    return e

def body(V):
    w = lambda l, s: word(V, l, s)
    one = w(15, "one")
    return [
        E(w(4, "time") - 0.15, "whoosh-soft", -3, "the dust streams into time's arrow", "peak"),
        E(w(4, "way") - 0.02, "pop-reveal", -4, "arrowhead lands on \"way\"", "attack", True),
        E(w(5, "physics") - 0.1 + 0.75, "tick-soft", 3, "collision, forward (clock 0.5)", "attack"),
        E(w(6, "reverse") - 0.6 + 0.75, "tick-soft", 2, "the same collision, reversed", "attack"),
        E(V[7]["end"] + 0.05, "pop-reveal", -2, "\"Why?\" title, in the pause after the word", "attack"),
        E(w(10, "go") + 0.05, "swish-light", -1, "the divider lifts", "attack"),
        E(w(11, "spread") + 0.1, "tick-soft", 1, "particles spread (soft tick 1)", "attack", True),
        E(w(11, "spread") + 0.5, "tick-soft", 0, "tick 2", "attack", True),
        E(w(11, "spread") + 0.95, "tick-soft", -1, "tick 3", "attack", True),
        E(w(13, "mixed"), "impact-soft", 0, "the balance tips to MIXED", "attack"),
        E(w(13, "mixed"), "pop-reveal", 0, "mid layer for phones on the tip", "attack"),
        E(V[14]["end"] - 0.05, "riser-long", 1, "build to the main reveal; peaks at the end of \"one side?\"", "peak"),
        E(one - 0.12, "impact-cosmic", 2, "MAIN REVEAL: 1 in 10^30 + burst ring", "attack"),
        E(one - 0.12, "hook-hit", 0, "mid-range layer for phones on the reveal", "attack"),
        E(w(16, "entropy") + 0.05, "warm-shimmer", -3, "\"entropy\" title", "attack", True),
        E(w(19, "started") + 0.05, "pop-reveal", -2, "BIG BANG marker (lowest entropy)", "attack"),
        E(w(19, "low") + 0.05, "tick-soft", 2, "TODAY marker", "attack", True),
        E((V[20]["end"] - 0.1 + w(21, "ever") + 0.6) / 2, "whoosh-wind", -4, "camera glides down to TODAY", "peak", True),
        E(w(23, "in") - 0.1 + 0.8, "whoosh-deep", 0, "TWIST: the timeline rescales to log, the far future opens", "peak"),
        E(w(23, "last") + 0.15, "event-horizon-fade", -4, "LAST STARS FADE: bright stars go out", "attack"),
        E(w(24, "black") + 0.1, "deep-rumble", -4, "black holes; the small one starts to shrink", "attack", True),
        E(w(25, "heat"), "impact-deep-soft", 2, "one soft hit on \"heat death\"", "attack"),
        E(w(25, "heat"), "pop-reveal", -3, "mid layer for phones on heat death (mix log: pop at -3)", "attack"),
    ], [
        {"from_s": round(V[14]["end"], 2), "to_s": round(one - 0.15, 2), "note": "brief silence before the reveal hit"},
        {"from_s": round(V[25]["end"] + 0.2, 2), "to_s": round(V[27]["start"] + 0.3, 2), "note": "near silence after heat death"},
    ]

def plan(variant, V, ev, sil, end, lift):
    base = f"shorts/{SL}/output/{SL}-{variant}"
    events, s2 = body(V)
    return {
        "_note": f"{SL} variant {variant.upper()} (brand v2.2). Clips from media/library/sfx/USAGE.md against guion.md SOUND MOOD; "
                 "times from the real word times (the same cues as WhyTime.tsx). Bed via mix_music.py: "
                 f"bed-mysterious-vast + space-air-loop, lift {lift}.",
        "master": f"{base}-voiced.mp4", "master_fps": 30, "catalog": "media/library/sfx/catalog.json",
        "render": {"preview": f"{base}-voiced.mp4", "out": f"{base}-sfx.mp4", "end_s": end, "duck": True},
        "silence": sil + s2,
        "events": sorted(ev + events, key=lambda e: e["at_s"]),
    }

# ---------- A ----------
wA = lambda l, s: word(A, l, s)
evA = [
    E(0.01, "hook-hit", -4, "frame 0: the gold crack races across the egg", "attack"),
    E(0.42, "shell-crack", 6, "the crack completes and the egg breaks open: phone-audible (SOUND MOOD)", "attack"),
    E(0.72, "swish-light", 2, "morph: crack → coffee spiral", "peak"),
    E(1.38, "whoosh-soft", 1, "morph: spiral → handwriting \"goodbye\"", "peak"),
    E(2.18, "sparkle-soft", 0, "\"goodbye\" bursts into dust", "attack"),
    E(2.36, "whoosh-deep", 3, "HOOK MOVE: pull-back into the stars", None),
    E(wA(0, "bang"), "glow-swell", 0, "rising swell landing on \"Big Bang\"", "peak"),
    E(wA(1, "broken") + 0.05, "whoosh-reverse", -4, "the egg tries to rewind… and stalls", "attack"),
    E(wA(2, "milk") + 0.05, "whoosh-reverse", -5, "the milk tries to unmix… and stalls", "attack"),
    E(wA(3, "regret") + 0.3, "swish-light", -3, "it scatters again", "attack", True),
    E(A[27]["start"] + 0.25 + 1.0, "shell-crack", -6, "LOOP: a faint crack as the point becomes the egg's crack (bridges into the replay)", "attack"),
    E(A[27]["start"] + 1.4, "glow-swell", -3, "the egg forms again", "peak"),
]
pA = plan("a", A, evA, [], 80.1, "0-3.6:+3,32.4-35:+4,61.5-75:-4")

# ---------- B ----------
wB = lambda l, s: word(B, l, s)
r2 = B[0]["words"][5]["start"] - 0.1
toCrack, toCup, toWord = B[1]["start"] - 0.35, B[2]["start"] - 0.3, B[3]["start"] - 0.2
evB = [
    E(0.01, "hook-hit", -3, "frame 0: the ordered fan, gold edge", "attack"),
    E(0.25, "card-riffle", 9, "riffle 1 on \"Shuffle\"", "attack"),
    E(r2, "card-riffle", 4, "riffle 2 on \"un-shuffles\"", "attack"),
    E(toCrack + 0.2, "swish-light", -2, "the fan's edge becomes the crack", "peak"),
    E(wB(1, "broken") + 0.05, "shell-crack", 6, "the egg breaks (first time in B)", "attack"),
    E(toCup + 0.2, "swish-light", 1, "morph: crack → coffee spiral", "peak"),
    E(wB(2, "milk") + 0.1, "warm-shimmer", -5, "the milk mixes", "attack", True),
    E(toWord + 0.2, "whoosh-soft", 1, "morph: spiral → \"goodbye\"", "peak"),
    E(B[3]["end"] + 0.03, "sparkle-soft", 3, "\"goodbye\" bursts into dust (in the pause after \"regret\")", "attack"),
    E(B[27]["start"] + 0.2 + 0.9, "swish-light", -4, "LOOP: the point becomes the fan's edge", "peak"),
    E(B[27]["start"] + 1.6, "glow-swell", -3, "the ordered deck forms again", "peak"),
]
pB = plan("b", B, evB, [], 79.633, "0-3.3:+3,32.0-34.6:+4,61.1-74.6:-4")

json.dump(pA, open(f"shorts/{SL}/sfx-plan.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
json.dump(pB, open(f"shorts/{SL}/b/sfx-plan.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print("OFF", round(OFF, 3), "| A events", len(pA["events"]), "| B events", len(pB["events"]))
