#!/usr/bin/env python3
"""
sfx_audition.py — one listening file for library clips, plus a timestamp list.

Plays clips in palette order with 1.2 s of silence between them, exactly as normalized in the
library. A loop is auditioned as its last 6 s followed by its first 6 s, so the seam lands at
+6.0 s into its slot. Writes media/library/sfx/audition/<name>.mp3 and <name>.md.

Usage:
  python tools/sfx_audition.py                                  # every active clip -> library.mp3
  python tools/sfx_audition.py --only id1,id2 --name batch-2    # just these
"""
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX = os.path.join(ROOT, "media", "library", "sfx")
GAP, LEAD, LOOP_SEG = 1.2, 0.5, 6.0
FMT = ["-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le"]


def ff(args):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"] + args, check=True)


def dur(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                         capture_output=True, text=True).stdout
    return float(out)


def mmss(x):
    return f"{int(x // 60)}:{x % 60:05.2f}"


def main():
    args = sys.argv[1:]
    only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
    name = args[args.index("--name") + 1] if "--name" in args else "library"
    palette = json.load(open(os.path.join(SFX, "palette.json"), encoding="utf-8"))["sounds"]
    cat = {c["id"]: c for c in json.load(open(os.path.join(SFX, "catalog.json"), encoding="utf-8"))["clips"]}
    ids = [s["id"] for s in palette if s["id"] in cat and (only is None or s["id"] in only)]
    tmp = tempfile.mkdtemp()
    ff(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(GAP)] + FMT + [f"{tmp}/gap.wav"])
    ff(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(LEAD)] + FMT + [f"{tmp}/lead.wav"])
    parts, t, rows = [f"{tmp}/lead.wav"], LEAD, []
    for i, cid in enumerate(ids):
        c = cat[cid]
        src = os.path.join(SFX, c["file"])
        seg = f"{tmp}/{i:03d}.wav"
        notes = []
        if c.get("loop"):
            D = dur(src)
            ff(["-ss", str(D - LOOP_SEG), "-i", src, "-t", str(LOOP_SEG)] + FMT + [f"{tmp}/{i:03d}a.wav"])
            ff(["-i", src, "-t", str(LOOP_SEG)] + FMT + [f"{tmp}/{i:03d}b.wav"])
            ff(["-i", f"{tmp}/{i:03d}a.wav", "-i", f"{tmp}/{i:03d}b.wav",
                "-filter_complex", "[0][1]concat=n=2:v=0:a=1"] + FMT + [seg])
            notes.append(f"loop: last {LOOP_SEG:.0f} s then first {LOOP_SEG:.0f} s (seam at +{LOOP_SEG:.1f} s); full {D:.0f} s in clips/")
        else:
            ff(["-i", src] + FMT + [seg])
        if c.get("not_under_narration"):
            notes.append("NOT under narration (pauses only)")
        if c.get("source", "").startswith("synthesized"):
            notes.append("synthesized: " + ", ".join(f"{k}={v}" for k, v in c.get("synth", {}).items()))
        rows.append((t, cid, c.get("category", ""), c.get("duration_s"), c.get("loudness_lufs"),
                     c.get("peak_dbfs"), c.get("source", ""), "; ".join(notes)))
        parts += [seg, f"{tmp}/gap.wav"]
        t += dur(seg) + GAP
    lst = f"{tmp}/list.txt"
    with open(lst, "w", encoding="utf-8") as f:
        f.write("".join(f"file '{p}'\n" for p in parts))
    out_dir = os.path.join(SFX, "audition")
    os.makedirs(out_dir, exist_ok=True)
    mp3 = os.path.join(out_dir, f"{name}.mp3")
    ff(["-f", "concat", "-safe", "0", "-i", lst, "-c:a", "libmp3lame", "-b:a", "192k", mp3])
    md = [f"# SFX audition: {name}", "",
          f"`{name}.mp3`: {len(ids)} clips in palette order, {GAP} s of silence between them, as normalized",
          "in the library (~-20 LUFS, -1.5 dBFS peak). Made by `tools/sfx_audition.py`.", "",
          "| Time | Clip | Function | Length | LUFS | Peak dBFS | Source | Note |",
          "|---|---|---|---|---|---|---|---|"]
    md += [f"| {mmss(r[0])} | `{r[1]}` | {r[2]} | {r[3]} s | {r[4]} | {r[5]} | {r[6]} | {r[7]} |" for r in rows]
    md += ["", f"Total: {mmss(t)}."]
    with open(os.path.join(out_dir, f"{name}.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md) + "\n")
    print(f"{os.path.relpath(mp3, ROOT)}  ({len(ids)} clips, {mmss(t)})")


if __name__ == "__main__":
    main()
