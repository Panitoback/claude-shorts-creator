import json, os
root = r"C:\Users\User\Desktop\Claude Factory\claude-shorts-creator\shorts\why-time-moves-forward"

# (text, tag, gap_before, tts-override-text)
BODY = [
    ("Time only runs one way.", "emphatic", 0.45, None),
    ("But the laws of physics?", "curious", 0.5, None),
    ("They work just fine in reverse.", "intrigued", None, None),
    ("Why?", "curious", 0.45, None),
    ("It's about counting.", "intrigued", 0.8, None),
    ("Put a hundred particles in one half of a box.", "calm", None, None),
    ("Let go.", "calm", 0.3, None),
    ("They spread out.", "calm", 0.7, None),
    ("Nothing pushes them.", "calm", None, None),
    ("There are vastly more ways to be mixed than sorted.", "building excitement", None, None),
    ("Odds they all drift back to one side?", "curious", 0.5, None),
    ("About one in a million trillion trillion.", "awed", 0.6, None),
    ("That's entropy.", "emphatic", 0.7, None),
    ("Not mess: the number of possible arrangements.", "calm", None, None),
    ("And it almost always grows.", "calm", None, None),
    ("So time has a direction because the universe started with very low entropy.", "intrigued", 0.6, None),
    ("Nobody knows why.", "hushed", 0.45, None),
    ("Ever since, it's been spending that order.", "calm", 0.8, None),
    ("Star birth is already down about ninety percent from its peak.", "calm", None, None),
    ("In about a hundred trillion years, the last stars fade.", "awed", 0.5, None),
    ("In up to a googol years, even black holes evaporate.", "awed", None, "In up to a goo-gol years, even black holes evaporate."),
    ("Then, most likely: heat death.", "somber", 0.55, None),
    ("No order left to spend.", "slowly", 0.4, None),
]

def line(text, tag, gap, tts=None):
    d = {"text": text, "tts": f"[{tag}] {tts or text}"}
    if gap is not None:
        d["gap_before"] = gap
    return d

def beats(variant, hook, bridge, loop):
    vo = [line(*hook)] + [line(*b) for b in bridge] + [line(*b) for b in BODY] + [line(*loop)]
    return {
        "_note": f"why-time-moves-forward, variant {variant.upper()} (guion.md). Voice-first: start/end/words filled by gen_voice.py. "
                 "Lines 4-26 (the body) are identical in A and B, so B reuses A's cached clips.",
        "slug": "why-time-moves-forward",
        "variant": variant,
        "format": {"name": "How It Works", "fps": 30, "width": 1080, "height": 1920, "targetSec": 72,
                   "leadIn": 0.15, "gap": 0.3, "tail": 0.8},
        "vo": vo,
    }

A = beats("a",
          ("You can't undo anything. Blame the Big Bang.", "intense", None),
          [("Not a broken egg.", "calm", 0.6), ("Not milk in your coffee.", "calm", None), ("Not words you regret.", "calm", None)],
          ("And every broken egg is a step along the way.", "whispers", 0.9))
B = beats("b",
          ("Shuffle a deck. It never un-shuffles.", "emphatic", None),
          [("Neither does a broken egg.", "calm", 0.6), ("Or milk in your coffee.", "calm", None), ("Or words you regret.", "calm", None)],
          ("And every shuffle is a step along the way.", "whispers", 0.9))
os.makedirs(os.path.join(root, "b"), exist_ok=True)
json.dump(A, open(os.path.join(root, "beats.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
json.dump(B, open(os.path.join(root, "b", "beats.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
assert len(A["vo"]) == len(B["vo"]) == 28
shared = sum(1 for a, b in zip(A["vo"], B["vo"]) if a["tts"] == b["tts"])
newB = sum(len(b["tts"]) for a, b in zip(A["vo"], B["vo"]) if a["tts"] != b["tts"])
print("A words", sum(len(l["text"].split()) for l in A["vo"]), "| B words", sum(len(l["text"].split()) for l in B["vo"]))
print("shared lines", shared, "| B-only billed chars", newB, "-> ~", round(newB * 0.5), "credits")
