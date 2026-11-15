#!/usr/bin/env python3
"""
synth_sfx.py — sound effects synthesized from code (no API, deterministic, stdlib-only).

For sounds that ARE physics: the same parameters always give the same file, so a short can use
the real number (a pulsar's real period, a chirp shaped like a real merger). Recipes live in
media/library/sfx/palette.json as entries with a "synth" block; this renders them into clips/,
loudness-normalizes them like every library clip (brand §7: ~-20 LUFS, -1.5 dBFS peak, via
gen_sfx.normalize_clip) and writes their catalog entries (source "synthesized (code)").
tools/gen_sfx.py skips "synth" recipes.

Kinds and parameters (all optional except where noted; times in seconds, frequencies in Hz):
  redshift  f0=880 f1=220 dur=2.5 attack=0.12 release=0.6 space=0.25
            a soft tone gliding exponentially from f0 down to f1; its overtones fade as it
            slides, so it gets "redder" (darker) as well as lower
  pulsar    period=1.3373 dur=8 tick_hz=1800 thump_hz=140 space=0.2
            one soft tick (a bright click over a low thump) every `period` seconds. Real periods:
            PSR B1919+21, the first pulsar found = 1.3373 s; PSR J1748-2446ad, the fastest known
            = 1/716 s (at that rate the ticks fuse into a 716 Hz tone, as they really would)
  chirp     f0=40 f_peak=320 dur=2.6 ring_s=0.4 ring_ratio=1.15 harmonics=0.35 space=0.25
            a gravitational-wave chirp: inspiral with f(t) ~ (tc - t)^(-3/8) from f0 up to f_peak
            over `dur`, amplitude ~ f^(2/3) (the leading-order merger shape), then a ringdown at
            f_peak*ring_ratio decaying over ring_s. `harmonics` adds 2nd/3rd overtones so the low
            start is audible on phone speakers (a real chirp starts below what phones can play)
  space (every kind): 0..1, a light Schroeder reverb for a sense of space (0 = dry); adds a tail

Usage:
  python tools/synth_sfx.py                       # render every "synth" recipe in palette.json
  python tools/synth_sfx.py --only gw-chirp       # just these ids (comma-separated)
  python tools/synth_sfx.py --list                # the kinds and their defaults
  python tools/synth_sfx.py --kind pulsar --set period=0.089 --set dur=4 --out media/projects/vela/vela.mp3
                                                  # one-off variant for one video (not cataloged)
New LIBRARY variant: add a palette.json entry with a "synth" block (copy pulsar-ticks), then run
`python tools/synth_sfx.py --only <id>`. Free and instant, so re-render whenever you like.
"""
import json
import math
import os
import struct
import subprocess
import sys
import wave

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_sfx  # noqa: E402  (normalize_clip, probe_duration, paths)

SR = 44100
SOURCE = "synthesized (code)"
MODEL = "tools/synth_sfx.py"
LICENSE = "original: synthesized in code by the channel, no third-party rights"

DEFAULTS = {
    "redshift": {"f0": 880.0, "f1": 220.0, "dur": 2.5, "attack": 0.12, "release": 0.6, "space": 0.25},
    "pulsar": {"period": 1.3373, "dur": 8.0, "tick_hz": 1800.0, "thump_hz": 140.0, "space": 0.2},
    "chirp": {"f0": 40.0, "f_peak": 320.0, "dur": 2.6, "ring_s": 0.4, "ring_ratio": 1.15,
              "harmonics": 0.35, "space": 0.25},
}


def _fade(i, n, a, r):
    """Raised-cosine attack over `a` samples and release over the last `r` samples."""
    g = 1.0
    if a and i < a:
        g *= 0.5 - 0.5 * math.cos(math.pi * i / a)
    if r and i > n - r:
        g *= 0.5 - 0.5 * math.cos(math.pi * max(0, n - i) / r)
    return g


def redshift(f0, f1, dur, attack, release, **_):
    n = int(dur * SR)
    out, ph = [], 0.0
    a, r = int(attack * SR), int(release * SR)
    for i in range(n):
        u = i / n
        f = f0 * (f1 / f0) ** u  # exponential glide = constant musical rate
        ph += 2 * math.pi * f / SR
        bright = 1.0 - u  # overtones fade as the light reddens
        v = math.sin(ph) + 0.28 * bright * math.sin(2 * ph) + 0.12 * bright * math.sin(3 * ph)
        out.append(v * _fade(i, n, a, r))
    return out


def pulsar(period, dur, tick_hz, thump_hz, **_):
    n = int(dur * SR)
    tau_t = min(0.006, period / 5)  # bright click decay
    tau_b = min(0.03, period / 3)   # low thump decay
    edge = int(0.02 * SR)
    out = []
    for i in range(n):
        t = i / SR
        tl = t % period  # time since the last tick
        v = (0.55 * math.exp(-tl / tau_t) * math.sin(2 * math.pi * tick_hz * tl)
             + 0.7 * math.exp(-tl / tau_b) * math.sin(2 * math.pi * thump_hz * tl))
        out.append(v * _fade(i, n, edge, edge))
    return out


def chirp(f0, f_peak, dur, ring_s, ring_ratio, harmonics, **_):
    # f(t) = f0 * (1 - t/tc)^(-3/8), with tc chosen so that f(dur) = f_peak
    tc = dur / (1 - (f0 / f_peak) ** (8 / 3))
    n_in, n_rd = int(dur * SR), int(ring_s * SR)
    f_ring, tau = f_peak * ring_ratio, ring_s / 5
    glide = int(0.015 * SR)  # smooth the jump from f_peak to the ringdown tone
    out, ph = [], 0.0
    fade_in = int(min(0.3, dur / 4) * SR)

    def tone(p):
        return math.sin(p) + harmonics * math.sin(2 * p) + 0.4 * harmonics * math.sin(3 * p)

    for i in range(n_in):
        t = i / SR
        f = f0 * (1 - t / tc) ** (-3 / 8)
        ph += 2 * math.pi * f / SR
        amp = (f / f_peak) ** (2 / 3)
        out.append(tone(ph) * amp * _fade(i, n_in, fade_in, 0))
    for j in range(n_rd):
        k = min(1.0, j / glide)
        f = f_peak + (f_ring - f_peak) * k
        ph += 2 * math.pi * f / SR
        out.append(tone(ph) * math.exp(-j / SR / tau) * _fade(j, n_rd, 0, int(0.05 * SR)))
    return out


KINDS = {"redshift": redshift, "pulsar": pulsar, "chirp": chirp}


def space(x, amount):
    """Light Schroeder reverb (4 combs + 2 allpasses), mixed in at `amount`; adds a tail."""
    if amount <= 0:
        return x
    dry_len = len(x)
    tail = int(1.2 * SR)
    x = x + [0.0] * tail
    wet = [0.0] * len(x)
    for d, g in ((1557, 0.78), (1617, 0.77), (1491, 0.79), (1422, 0.8)):
        buf = [0.0] * d
        for i, s in enumerate(x):
            y = buf[i % d]
            buf[i % d] = s + g * y
            wet[i] += y * 0.25
    for d, g in ((225, 0.5), (556, 0.5)):
        buf = [0.0] * d
        for i, s in enumerate(wet):
            b = buf[i % d]
            y = -g * s + b
            buf[i % d] = s + g * y
            wet[i] = y
    out = [s + amount * w for s, w in zip(x, wet)]
    # trim the silent end of the tail
    peak = max(abs(v) for v in out) or 1.0
    end = len(out)
    while end > dry_len and abs(out[end - 1]) < peak * 1e-3:  # never shorter than asked
        end -= 1
    return out[:min(len(out), end + int(0.05 * SR))]


def render(kind, params):
    p = {**DEFAULTS[kind], **params}
    x = KINDS[kind](**p)
    x = space(x, p.get("space", 0))
    peak = max(abs(v) for v in x) or 1.0
    return [v / peak * 0.89 for v in x], p


def write_mp3(samples, out_path):
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    wav = out_path + ".tmp.wav"
    with wave.open(wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v)) * 32767)) for v in samples))
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", wav,
                    "-c:a", "libmp3lame", "-q:a", "2", out_path], check=True)
    os.remove(wav)


def parse_value(v):
    if "/" in v:
        a, b = v.split("/", 1)
        return float(a) / float(b)
    return float(v)


def main():
    args = sys.argv[1:]
    if "--list" in args:
        for k, d in DEFAULTS.items():
            print(f"{k:<9} " + " ".join(f"{a}={b}" for a, b in d.items()))
        return
    with open(gen_sfx.PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    target, ceiling = d.get("target_lufs", -20.0), d.get("ceiling_dbfs", -1.5)

    if "--kind" in args:  # one-off variant, not cataloged
        kind = args[args.index("--kind") + 1]
        params = {}
        for i, a in enumerate(args):
            if a == "--set":
                k, v = args[i + 1].split("=", 1)
                params[k] = parse_value(v)
        out = args[args.index("--out") + 1] if "--out" in args else f"{kind}.mp3"
        x, p = render(kind, params)
        write_mp3(x, out)
        lufs, peak = gen_sfx.normalize_clip(out, target, ceiling)
        print(f"{out}: {kind} {p}  dur={gen_sfx.probe_duration(out)}s peak={peak} lufs={lufs}")
        return

    only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
    with open(gen_sfx.CATALOG, encoding="utf-8") as f:
        catalog = json.load(f)
    by_id = {c["id"]: c for c in catalog["clips"]}
    n = 0
    for s in palette["sounds"]:
        if "synth" not in s or (only and s["id"] not in only):
            continue
        spec = dict(s["synth"])
        kind = spec.pop("kind")
        rel = f"clips/{s['id']}.mp3"
        path = os.path.join(gen_sfx.SFX_DIR, rel)
        x, p = render(kind, spec)
        write_mp3(x, path)
        lufs, peak = gen_sfx.normalize_clip(path, target, ceiling)
        dur = gen_sfx.probe_duration(path)
        print(f"   {s['id']}: {kind} dur={dur}s  peak={peak}dBFS  lufs={lufs}")
        by_id[s["id"]] = {
            "id": s["id"], "file": rel, "category": s.get("category", ""), "tags": s.get("tags", []),
            "duration_s": dur, "peak_dbfs": peak, "loudness_lufs": lufs, "source": SOURCE,
            "model": MODEL, "license": LICENSE, "prompt": s["prompt"],
            "synth": {"kind": kind, **{k: round(v, 6) for k, v in p.items()}},
            **{k: s[k] for k in gen_sfx.PASS_THROUGH if k in s},
            "used_in": by_id.get(s["id"], {}).get("used_in", []),
        }
        n += 1
    order = [s["id"] for s in palette["sounds"]]
    catalog["clips"] = [by_id[i] for i in order if i in by_id] + [c for i, c in by_id.items() if i not in order]
    with open(gen_sfx.CATALOG, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"rendered {n} synthesized clips; catalog -> {len(catalog['clips'])} clips")


if __name__ == "__main__":
    main()
