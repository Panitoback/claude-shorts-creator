#!/usr/bin/env python3
"""
gen_sfx.py — grow the shared SFX library (media/library/sfx/) from a palette spec.

Step-4 (SFX) library builder for the AI Video Editor. Reads media/library/sfx/palette.json
(generic, reusable sound recipes), and for every sound that is NOT already on disk it
generates the clip via the ElevenLabs Sound Effects API (text -> sfx), peak-normalizes
it for consistent mixing headroom, measures duration + loudness, and (re)writes
media/library/sfx/catalog.json — the library manifest that /suggest-sfx and tools/mix_sfx.py read.

LIBRARY-FIRST: existing clips are skipped (never re-billed) unless --force. The library
is the durable, cross-project asset; each video is one draw from it.

Usage:
  python tools/gen_sfx.py                 # generate any missing palette sounds
  python tools/gen_sfx.py --force         # regenerate all (re-bills ElevenLabs)
  python tools/gen_sfx.py --only id1,id2  # just these ids
  python tools/gen_sfx.py --dry-run       # show what WOULD be generated, no API calls
  python tools/gen_sfx.py --only id --force --keep-old
                                          # regenerate OUR clip, archiving the current one as
                                          # superseded/<id>-vN.mp3 (catalog id "<id>--vN")
  python tools/gen_sfx.py --measure [--only ids]
                                          # (re)measure attack_s / peak_s / phone_db of every
                                          # active clip into the catalog (no API, no re-encode)

MEASUREMENTS (tools/sfx_measure.py): every catalog entry carries attack_s and peak_s (where the
clip is HEARD; mix_sfx.py "align" uses them) and phone_db (energy surviving a 300 Hz high-pass;
below -6 dB the clip is invisible on a phone speaker). Loops carry phone_db only.
  python tools/gen_sfx.py --regen-inherited [--dry-run]
                                          # regenerate every clip flagged regenerate_before_publish
                                          # (inherited from the original author's account) with OUR key

LEGACY / SUPERSEDED: catalog entries with "legacy": true (off-brand clips in media/library/sfx/legacy/)
or "superseded": true (the original author's clips, replaced 2026-11-15 by our own generations, kept
in superseded/ for reference) are never generated, regenerated, re-normalized or mixed.

Needs ELEVENLABS_API_KEY in .env (see .env.example). ffmpeg/ffprobe on PATH.
"""
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfx_measure  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "media", "library", "sfx")
PALETTE = os.path.join(SFX_DIR, "palette.json")
CATALOG = os.path.join(SFX_DIR, "catalog.json")
API_URL = "https://api.elevenlabs.io/v1/sound-generation"

LICENSE = ("ElevenLabs generated (text-to-sfx); owner: the generating account, commercial use per "
           "the account's ElevenLabs plan")
SOURCE = "elevenlabs:sound-generation"


def load_env():
    """Minimal .env reader so we don't depend on python-dotenv."""
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


def run_capture(cmd):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout


def probe_duration(path):
    out = run_capture(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                       "-of", "default=nw=1:nk=1", path]).strip()
    try:
        return round(float(out), 3)
    except ValueError:
        return None


def measure_peak_db(path):
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "volumedetect",
                       "-f", "null", os.devnull])
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", out)
    return float(m.group(1)) if m else None


def measure_lufs(path):
    """Best-effort integrated loudness (ebur128). Unreliable for <1s transients; informational."""
    out = run_capture(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", os.devnull])
    ms = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", out)
    try:
        return float(ms[-1]) if ms else None
    except ValueError:
        return None


def apply_gain(path, gain_db):
    if abs(gain_db) < 0.1:
        return True
    tmp = path + ".norm.mp3"
    run_capture(["ffmpeg", "-y", "-hide_banner", "-i", path, "-af", f"volume={gain_db:.2f}dB",
                 "-c:a", "libmp3lame", "-q:a", "2", tmp])
    if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
        return True
    if os.path.exists(tmp):
        os.remove(tmp)
    return False


def normalize_clip(path, target_lufs, ceiling_db):
    """Loudness-normalize to target_lufs so gain_db in a plan is perceptually meaningful,
    but never let the peak exceed ceiling_db (single re-encode). Falls back to a plain
    peak-to-ceiling normalize for transients too short for a reliable ebur128 reading."""
    lufs = measure_lufs(path)
    peak = measure_peak_db(path)
    if peak is None:
        return None, None
    if lufs is None or lufs < -50:  # ebur128 gated the clip — peak-normalize instead
        apply_gain(path, ceiling_db - peak)
    else:
        gain = target_lufs - lufs
        if peak + gain > ceiling_db:      # would clip -> clamp to the ceiling
            gain = ceiling_db - peak
        apply_gain(path, gain)
    for _ in range(3):  # mp3 re-encode overshoot (sharp transients): trim back under the ceiling
        peak = measure_peak_db(path)
        if peak is None or peak <= ceiling_db:
            break
        apply_gain(path, ceiling_db - peak - 0.3)
    return measure_lufs(path), measure_peak_db(path)


# usage flags copied from a palette recipe into its catalog entry
PASS_THROUGH = ("loop", "not_under_narration", "usage_note")

CREDITS_PER_S = 10  # explicit duration, eleven_text_to_sound_v3: measured 2026-11-15 (docs list 40/s, the v2 price)


def generate(api_key, prompt, duration_s, prompt_influence, model, loop=False):
    body = {
        "text": prompt,
        "duration_seconds": float(duration_s),  # 0.5..30 s, always explicit
        "prompt_influence": float(prompt_influence),
        "model_id": model,
    }
    if loop:
        body["loop"] = True  # seamless loop (ambient beds)
    req = urllib.request.Request(
        API_URL, data=json.dumps(body).encode("utf-8"),
        headers={"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def fmt_measure(m):
    if "attack_s" in m:
        return f"attack={m['attack_s']}s  peak_at={m['peak_s']}s  phone={m['phone_db']}dB"
    return f"phone={m['phone_db']}dB (loop)"


def main():
    args = sys.argv[1:]
    force = "--force" in args
    dry = "--dry-run" in args
    renorm = "--renorm" in args  # re-balance existing clips only, no API calls
    regen_inherited = "--regen-inherited" in args
    keep_old = "--keep-old" in args
    only = None
    if "--only" in args:
        only = set(args[args.index("--only") + 1].split(","))

    with open(PALETTE, encoding="utf-8") as f:
        palette = json.load(f)
    d = palette.get("defaults", {})
    pinf = d.get("prompt_influence", 0.45)
    target_lufs = d.get("target_lufs", -20.0)
    ceiling_db = d.get("ceiling_dbfs", -1.5)
    model = d.get("model", "eleven_text_to_sound_v3")

    catalog = {"note": "", "clips": []}
    if os.path.exists(CATALOG):
        with open(CATALOG, encoding="utf-8") as f:
            catalog = json.load(f)
    catalog["note"] = ("Shared SFX library manifest for the AI Video Editor. Generated by "
                       "tools/gen_sfx.py from palette.json. Clips are loudness-normalized mp3 in "
                       "media/library/sfx/clips/. Read by tools/mix_sfx.py and /suggest-sfx. "
                       "\"legacy\": true = off-brand clip moved to legacy/, never used or regenerated. "
                       "\"superseded\": true = the original author's clip, replaced by our own generation "
                       "(superseded_by), kept in superseded/ for reference, never used. Every active clip was "
                       "generated with the channel's ElevenLabs account (source/model/license per clip). Grows every "
                       "video (library-first). Note: SFX that must live INSIDE a Remotion TSX shot "
                       "go in remotion/public/media/library/sfx/ via staticFile(); this library is for the "
                       f"post-mix (tools/mix_sfx.py). Loudness-normalized to ~{target_lufs} LUFS with a "
                       f"{ceiling_db} dBFS peak ceiling, so a plan's per-cue gain_db is perceptually "
                       "meaningful (see each video's sfx-plan.json).")
    by_id = {c["id"]: c for c in catalog.get("clips", [])}
    legacy_ids = {i for i, c in by_id.items() if c.get("legacy") or c.get("superseded")}
    if regen_inherited:
        inherited = {i for i, c in by_id.items() if c.get("regenerate_before_publish") and i not in legacy_ids}
        only = inherited if only is None else only & inherited
        force = True
    # recipes with a "synth" block are rendered by tools/synth_sfx.py (code, no API), never here
    sounds = [s for s in palette["sounds"] if s["id"] not in legacy_ids and "synth" not in s]
    if regen_inherited:
        missing_recipe = sorted(only - {s["id"] for s in sounds})
        if missing_recipe:
            print("  WARNING no palette recipe for (can't regenerate):", ", ".join(missing_recipe))

    clips_dir = os.path.join(SFX_DIR, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    env = load_env()
    api_key = env.get("ELEVENLABS_API_KEY", "").strip()

    def entry(s, rel, path):
        lufs, peak = normalize_clip(path, target_lufs, ceiling_db)
        dur = probe_duration(path)
        m = sfx_measure.catalog_fields(path, loop=s.get("loop", False))
        print(f"   {s['id']}: dur={dur}s  peak={peak}dBFS  lufs={lufs}  " + fmt_measure(m))
        return {
            "id": s["id"], "file": rel, "category": s.get("category", ""),
            "tags": s.get("tags", []), "duration_s": dur, "peak_dbfs": peak,
            "loudness_lufs": lufs, **m, "source": SOURCE, "model": model, "license": LICENSE,
            "prompt": s["prompt"], **{k: s[k] for k in PASS_THROUGH if k in s}, "used_in": by_id.get(s["id"], {}).get("used_in", []),
        }

    def archive(cid, path):
        """Move our current clip to superseded/<id>-vN.mp3 and keep its catalog entry as <id>--vN."""
        n = 1
        while f"{cid}--v{n}" in by_id:
            n += 1
        rel_old = f"superseded/{cid}-v{n}.mp3"
        os.makedirs(os.path.join(SFX_DIR, "superseded"), exist_ok=True)
        os.replace(path, os.path.join(SFX_DIR, rel_old))
        old = dict(by_id.get(cid, {"id": cid}))
        old.update({"id": f"{cid}--v{n}", "file": rel_old, "superseded": True, "superseded_by": cid,
                    "used_in": old.get("used_in", [])})
        by_id[old["id"]] = old
        legacy_ids.add(old["id"])
        print(f"   archived previous {cid} -> {rel_old} (catalog id {old['id']})")

    def write_catalog():
        order = [s["id"] for s in palette["sounds"]]
        catalog["clips"] = ([by_id[i] for i in order if i in by_id]
                            + [c for i, c in by_id.items() if i not in order])
        with open(CATALOG, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"\ncatalog -> {os.path.relpath(CATALOG, ROOT)}  ({len(catalog['clips'])} clips)")

    if "--measure" in args:  # measurement only: every active clip, incl. synthesized ones
        n = 0
        for i, c in by_id.items():
            if i in legacy_ids or (only and i not in only):
                continue
            path = os.path.join(SFX_DIR, c["file"])
            if not os.path.exists(path):
                continue
            m = sfx_measure.catalog_fields(path, loop=c.get("loop", False))
            for k in ("attack_s", "peak_s", "phone_db"):
                c.pop(k, None)
            pos = list(c).index("loudness_lufs") + 1 if "loudness_lufs" in c else len(c)
            items = list(c.items())
            c.clear()
            c.update(items[:pos] + list(m.items()) + items[pos:])
            flag = "  PHONE-INVISIBLE" if m["phone_db"] < sfx_measure.PHONE_WARN_DB else ""
            print(f"   {i:<22} {fmt_measure(m)}{flag}")
            n += 1
        print(f"measured {n} clips")
        write_catalog()
        return

    if renorm:  # re-balance existing clips to the current loudness target, no API
        n = 0
        for s in sounds:
            if only and s["id"] not in only:
                continue
            rel = f"clips/{s['id']}.mp3"
            path = os.path.join(SFX_DIR, rel)
            if not os.path.exists(path):
                continue
            by_id[s["id"]] = entry(s, rel, path)
            n += 1
        print(f"re-normalized {n} clips to ~{target_lufs} LUFS (ceiling {ceiling_db} dBFS)")
        write_catalog()
        return

    todo, skip = [], []
    for s in sounds:
        if only and s["id"] not in only:
            continue
        rel = f"clips/{s['id']}.mp3"
        path = os.path.join(SFX_DIR, rel)
        if os.path.exists(path) and not force:
            skip.append(s["id"])
            continue
        todo.append((s, rel, path))

    print(f"palette: {len(sounds)} sounds ({len(legacy_ids)} legacy/superseded ignored) | to generate: {len(todo)} | skip (exist): {len(skip)}")
    if skip:
        print("  skipping (library-first):", ", ".join(skip))
    if dry:
        total = 0.0
        for s, rel, _ in todo:
            cr = s["duration_s"] * CREDITS_PER_S
            total += s["duration_s"]
            lp = "  loop" if s.get("loop") else ""
            print(f"  WOULD generate {s['id']:<18} {s['duration_s']:>5}s  ~{cr:>5.0f} cr{lp}  \"{s['prompt'][:50]}...\"")
        print(f"  TOTAL {len(todo)} clips, {total:.1f}s  ~{total * CREDITS_PER_S:.0f} credits")
        return
    if todo and not api_key:
        sys.exit("ELEVENLABS_API_KEY not set in .env — cannot generate. (Add it, or use --dry-run.)")

    for s, rel, path in todo:
        print(f"\n-> {s['id']}  ({s['duration_s']}s)")
        try:
            audio = generate(api_key, s["prompt"], s["duration_s"], s.get("prompt_influence", pinf), model,
                             loop=s.get("loop", False))
        except urllib.error.HTTPError as e:
            sys.exit(f"ElevenLabs HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:400]}")
        if keep_old and os.path.exists(path):
            archive(s["id"], path)
        with open(path, "wb") as f:
            f.write(audio)
        by_id[s["id"]] = entry(s, rel, path)

    write_catalog()


if __name__ == "__main__":
    main()
