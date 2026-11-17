#!/usr/bin/env python3
"""
mix_sfx.py — audition mixer for the SFX pass (step 4 of the AI Video Editor).

Reads a per-video sfx-plan.json (the audited source of truth: one event per cue, times
on the MASTER timeline) + the shared library catalog + a composited preview, and renders
an SFX-mixed preview: each clip is delayed to its cue time, gained per the plan, summed
into an SFX bus, optionally ducked under the voice (sidechain), and mixed over the master
audio. Video is copied through untouched.

This is the AUDITION mixer — get the cues right with the user here. Final polished
mix / ducking / loudness normalization is /assemble's job later.

Usage:
  python tools/mix_sfx.py [video-1/work/sfx-plan.json]
  python tools/mix_sfx.py plan.json --print         # show the resolved cue sheet, no render
  python tools/mix_sfx.py plan.json --no-optional    # drop events marked "optional": true
  python tools/mix_sfx.py plan.json --no-duck --end 60 --out path.mp4
  python tools/mix_sfx.py plan.json --check          # phone check of the existing mix, no render

ALIGN: an event may carry "align": "attack" | "peak". Then at_s is the PICTURE time of the hit
and the clip starts at at_s - its attack_s / peak_s (measured per clip in catalog.json by
gen_sfx.py --measure). Without align, at_s is the file start (old behaviour).

PHONE CHECK (runs after every mix, or alone with --check): for each cue, how much it adds over
the voice-only preview at its audible point, full band and through a 300 Hz high-pass (a phone
speaker). A cue that adds < 1 dB through the high-pass DISAPPEARS on a phone.

ffmpeg/ffprobe on PATH. The preview + all referenced clips must exist.
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfx_measure  # noqa: E402

# Windows consoles default to cp1252 — force UTF-8 so unicode cue text (✓, →) prints
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rp(p):
    """Engine/LIBRARY paths (catalog, clips) resolve relative to ROOT (=core/)."""
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def proj(p):
    """PROJECT-data paths (plan, preview, output) resolve relative to CWD — the type workspace
    you run from (longs/), where video-N lives — NOT ROOT (=core/, the shared engine)."""
    return p if os.path.isabs(p) else os.path.abspath(p)


def show(p):
    """relpath for display, but tolerate paths on a different drive (Windows)."""
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + r.stdout[-4000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def main():
    args = sys.argv[1:]
    flags = {"print": "--print" in args, "no_optional": "--no-optional" in args, "check": "--check" in args}
    duck_override = None
    if "--no-duck" in args:
        duck_override = False
    if "--duck" in args:
        duck_override = True
    end_override = out_override = preview_override = None
    if "--end" in args:
        end_override = float(args[args.index("--end") + 1])
    if "--out" in args:
        out_override = args[args.index("--out") + 1]
    if "--preview" in args:  # mix over a different composited video than the plan names
        preview_override = args[args.index("--preview") + 1]
    positional = [a for a in args if not a.startswith("--")
                  and a not in {str(end_override), out_override, preview_override}]
    plan_path = proj(positional[0]) if positional else proj(os.path.join("video-1", "work", "sfx-plan.json"))

    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    render = plan.get("render", {})
    catalog_path = rp(plan.get("catalog", "media/library/sfx/catalog.json"))
    with open(catalog_path, encoding="utf-8") as f:
        catalog = json.load(f)
    # legacy clips (off-brand, in media/library/sfx/legacy/) and superseded clips (the original
    # author's, replaced by our own generations, in superseded/) are never mixed
    legacy_ids = {c["id"] for c in catalog.get("clips", []) if c.get("legacy")}
    superseded = {c["id"].split("--")[0]: c.get("superseded_by", "")
                  for c in catalog.get("clips", []) if c.get("superseded")}
    lib = {c["id"]: c for c in catalog.get("clips", []) if not c.get("legacy") and not c.get("superseded")}

    preview = proj(preview_override or render.get("preview", "video-1/output/video-1-preview.mp4"))
    out = proj(out_override or render.get("out", "video-1/output/video-1-first60-sfx.mp4"))
    end = end_override if end_override is not None else float(render.get("end_s", 60))
    duck = duck_override if duck_override is not None else bool(render.get("duck", True))

    # resolve + filter events
    events = []
    missing = set()
    bad_align = []
    for e in plan["events"]:
        if flags["no_optional"] and e.get("optional"):
            continue
        clip = lib.get(e["sfx_id"])
        if clip and clip.get("loop"):
            missing.add(e["sfx_id"] + " (a bed, not a cue: lay it with mix_music.py --bed, one bed per short)")
            continue
        if not clip:
            why = (" (legacy: off-brand, pick a brand clip)" if e["sfx_id"] in legacy_ids
                   else f" (superseded: use {superseded[e['sfx_id']]})" if e["sfx_id"] in superseded else "")
            missing.add(e["sfx_id"] + why)
            continue
        f = rp(os.path.join("media", "library", "sfx", clip["file"]))
        if not os.path.exists(f):
            missing.add(e["sfx_id"] + " (file)")
            continue
        align = e.get("align")
        at = float(e["at_s"])
        if align in ("attack", "peak"):
            off = clip.get(f"{align}_s")
            if off is None:
                bad_align.append(f"{e['sfx_id']} (no {align}_s in the catalog: run gen_sfx.py --measure)")
                continue
            start, hit = at - off, at
        elif align in (None, "start"):
            start, hit = at, at + clip.get("peak_s", 0.0)   # unaligned: heard at its peak
        else:
            bad_align.append(f"{e['sfx_id']} (align must be attack|peak, got {align!r})")
            continue
        if start < 0:
            bad_align.append(f"{e['sfx_id']} at {at:.2f}s (its {align} is {off}s into the file: starts before 0)")
            continue
        if start >= end:
            continue
        events.append({**e, "file": f, "clip": clip, "start_s": round(start, 3), "hit_s": round(hit, 3)})
    events.sort(key=lambda e: e["start_s"])

    # cue sheet
    print(f"plan: {show(plan_path)}   catalog: {len(lib)} clips")
    print(f"preview: {show(preview)}   end: {end}s   duck: {duck}")
    print(f"events: {len(events)}" + (f"  (dropping {sum(1 for e in plan['events'] if e.get('optional'))} optional)"
                                      if flags["no_optional"] else ""))
    print(f"  {'at_s':>7} {'align':>6} {'start':>7}  {'sfx_id':<18} {'gain':>5} {'phone':>6}  cue")
    seam = []
    for e in events:
        opt = " (opt)" if e.get("optional") else ""
        ph = e["clip"].get("phone_db")
        phs = "  ?" if ph is None else f"{ph:5.1f}" + ("!" if ph < sfx_measure.PHONE_WARN_DB else " ")
        print(f"  {float(e['at_s']):>7.2f} {e.get('align', '-'):>6} {e['start_s']:>7.2f}  {e['sfx_id']:<18} "
              f"{e.get('gain_db', 0):>4}dB {phs}  {e.get('cue', '')[:56]}{opt}")
        if e["start_s"] + float(e["clip"].get("duration_s") or 0) > end + 0.01:
            seam.append(f"{e['sfx_id']} @ {e['start_s']:.2f}s")
    print("  (phone = the clip's own level through a 300 Hz high-pass; '!' = phone-invisible clip, "
          "give it a mid layer — USAGE.md)")
    if seam:
        print("  CHECK loop seam — these tails run past the end (the replay would click):", ", ".join(seam))
    if bad_align:
        print("  ALIGN problems:", "; ".join(bad_align))
    if missing:
        print("  MISSING from library (run tools/gen_sfx.py):", ", ".join(sorted(missing)))
    pause_only = sorted({e["sfx_id"] for e in events if e["clip"].get("not_under_narration")})
    if pause_only:
        print("  CHECK pause-only clips (crackle; never under narration, brand §7) — make sure each sits "
              "in a gap in the voice:", ", ".join(pause_only))
    if flags["print"]:
        return
    if bad_align:
        sys.exit("fix the align problems first.")
    if flags["check"]:
        if not os.path.exists(out):
            sys.exit(f"--check: no mix at {show(out)} yet; run without --check first.")
        phone_check(events, preview, out, end)
        return
    if not events:
        sys.exit("no events to mix.")
    if missing:
        sys.exit("missing clips — generate them first (tools/gen_sfx.py).")
    for p in (preview,):
        if not os.path.exists(p):
            sys.exit(f"missing preview: {p}")
    os.makedirs(os.path.dirname(out), exist_ok=True)

    # ffmpeg: input 0 = preview; inputs 1..N = each event's clip
    cmd = ["ffmpeg", "-y", "-hide_banner", "-i", preview]
    for e in events:
        cmd += ["-i", e["file"]]

    parts, labels = [], []
    for i, e in enumerate(events):
        ms = int(round(float(e["start_s"]) * 1000))
        g = float(e.get("gain_db", 0))
        parts.append(f"[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                     f"adelay={ms}:all=1,volume={g:.2f}dB[e{i}]")
        labels.append(f"[e{i}]")

    if len(labels) == 1:
        parts.append(f"{labels[0]}anull[sfxraw]")
    else:
        parts.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:"
                     f"dropout_transition=0[sfxraw]")

    if duck:
        parts.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[v1][v2]")
        # GENTLE duck: only tuck the SFX a few dB under the loudest speech, never bury them.
        # (The per-cue gain_db already sets them under the voice; this just cleans overlaps.)
        parts.append("[sfxraw][v1]sidechaincompress=threshold=0.15:ratio=2:attack=5:"
                     "release=200:makeup=2[sfxduck]")
        parts.append("[v2][sfxduck]amix=inputs=2:normalize=0[mixraw]")
    else:
        parts.append("[0:a]aformat=sample_rates=48000:channel_layouts=stereo[v2]")
        parts.append("[v2][sfxraw]amix=inputs=2:normalize=0[mixraw]")
    # gentle safety limiter so summed peaks never clip
    parts.append("[mixraw]alimiter=level_in=1:level_out=1:limit=0.97[mix]")

    cmd += ["-filter_complex", ";".join(parts),
            "-map", "0:v:0", "-map", "[mix]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{end:.3f}", "-movflags", "+faststart", out]
    print(f"\nrendering -> {show(out)}")
    run(cmd)
    dur = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", out]).strip()
    print(f"done -> {show(out)}  ({dur}s, {len(events)} cues)")
    phone_check(events, preview, out, end)


def phone_check(events, preview, out, end):
    """Per cue: dB the cue adds over the voice-only preview at its audible point, full band and
    through the 300 Hz phone high-pass. Windows: risers = the second before their crest; everything
    else = 50 ms before to 300 ms after the hit (tight, so a click isn't diluted)."""
    sr = sfx_measure.SR
    hp = sfx_measure.PHONE_HP
    tracks = {(k, f): sfx_measure.decode(src, f, 0, end)
              for k, src in (("prev", preview), ("mix", out)) for f in (None, hp)}
    print()
    print(f"PHONE CHECK  (dB each cue adds over the voice-only preview; phone = through a 300 Hz high-pass)")
    print(f"  {'hit_s':>7}  {'sfx_id':<18} {'full':>6} {'phone':>6}  verdict")
    # Floor = the preview's average level (per band) minus 20 dB. In a gap in the voice the
    # preview is near silence, so a bare ratio would call any whisper "audible"; against this
    # floor a cue in a gap must reach at least ~20 dB under the program's typical level to count.
    floors = {f: sfx_measure.energy(tracks[("prev", f)]) / max(1, len(tracks[("prev", f)])) * 0.01
              for f in (None, hp)}
    gone = []
    for e in events:
        h = e["hit_s"]
        t0, t1 = (h - 1.0, h) if e["clip"].get("category") == "tension" else (h - 0.05, h + 0.30)
        i0, i1 = int(t0 * sr), int(t1 * sr)
        d = {}
        for f, name in ((None, "full"), (hp, "phone")):
            ep = sfx_measure.energy(tracks[("prev", f)], i0, i1)
            em = sfx_measure.energy(tracks[("mix", f)], i0, i1)
            floor = floors[f] * (i1 - i0)
            d[name] = sfx_measure.db((em + floor) / (ep + floor))
        if d["phone"] < 1.0:
            verdict = "GONE on phone" + (" (inaudible everywhere)" if d["full"] < 1.0 else " (headphones only)")
            gone.append(f"{e['sfx_id']} @ {h:.2f}s")
        elif d["phone"] < 3.0:
            verdict = "weak on phone"
        else:
            verdict = "ok"
        if d["full"] < 4.0 and not e.get("optional") and verdict == "ok":
            verdict = "ok on phone; < +4 dB full band (fine for texture, low for a story cue)"
        print(f"  {h:>7.2f}  {e['sfx_id']:<18} {d['full']:>+6.1f} {d['phone']:>+6.1f}  {verdict}")
    if gone:
        print("  FLAG — disappears on a phone:", ", ".join(gone))
        print("  -> add a mid layer on the same peak, use a phone-safe clip, or accept it as felt-not-heard.")
    else:
        print("  every cue survives the phone high-pass.")


if __name__ == "__main__":
    main()
