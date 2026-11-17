#!/usr/bin/env python3
"""
loop_music.py — turn a raw Eleven Music bed into a seamless library loop.

Eleven Music returns a piece with a fade-in and/or a fade-out, so its end never matches its
start. This takes the STEADY middle of media/library/music/raw/<id>.mp3 (--start/--end),
crossfades its last --xfade seconds into its first ones (equal-power), writes the loop to
media/library/music/clips/<id>.mp3, normalizes it like every bed (-20 LUFS, -1.5 dBFS ceiling),
checks the seam (RMS of the last vs first 0.5 s, must be < 0.5 dB) and records loop info in the
catalog. raw/ is never modified.

  python tools/loop_music.py --id bed-warm-hopeful --start 4 --end 67 [--xfade 2]
  python tools/loop_music.py --id bed-warm-hopeful --check        # seam check only

How the loop works: segment S = raw[start:end], length L. Output = crossfade(S[L-X:L] fading
out, S[0:X] fading in) + S[X:L-X]. The output ends at S[L-X], and replays from a crossfade that
starts with S[L-X]: the music runs on continuously across the seam.
"""
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_music import normalize_clip, probe_duration, CATALOG, MUSIC_DIR, ROOT  # noqa: E402


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit("ffmpeg failed:\n" + r.stdout[-3000:])
    return r.stdout


def rms(path, ss, t):
    out = run(["ffmpeg", "-hide_banner", "-ss", f"{ss:.3f}", "-t", f"{t:.3f}", "-i", path, "-af",
               "astats=measure_overall=RMS_level:measure_perchannel=none", "-f", "null", os.devnull])
    return float(re.findall(r"RMS level dB:\s*(-?[\d.]+|-inf)", out)[-1])


def seam(path):
    d = probe_duration(path)
    a, b = rms(path, 0, 0.5), rms(path, d - 0.5, 0.5)
    return a, b, round(b - a, 2)


def main():
    args = sys.argv[1:]
    get = lambda n, dflt=None, c=str: c(args[args.index(n) + 1]) if n in args else dflt  # noqa: E731
    bid = get("--id")
    out = os.path.join(MUSIC_DIR, "clips", f"{bid}.mp3")
    if "--check" in args:
        print(f"{bid}: start {seam(out)[0]:.1f} dB, end {seam(out)[1]:.1f} dB, seam {seam(out)[2]:+.2f} dB")
        return
    t0, t1, x = get("--start", None, float), get("--end", None, float), get("--xfade", 2.0, float)
    raw = os.path.join(MUSIC_DIR, "raw", f"{bid}.mp3")
    L = t1 - t0
    fc = (f"[0:a]atrim={t0:.3f}:{t1:.3f},asetpts=N/SR/TB,asplit=3[a][b][c];"
          f"[a]atrim=0:{x:.3f},asetpts=N/SR/TB,afade=t=in:d={x:.3f}:curve=qsin[head];"
          f"[b]atrim={L - x:.3f}:{L:.3f},asetpts=N/SR/TB,afade=t=out:d={x:.3f}:curve=qsin[tail];"
          f"[c]atrim={x:.3f}:{L - x:.3f},asetpts=N/SR/TB[body];"
          f"[head][tail]amix=inputs=2:normalize=0[xf];[xf][body]concat=n=2:v=0:a=1[out]")
    run(["ffmpeg", "-y", "-hide_banner", "-i", raw, "-filter_complex", fc, "-map", "[out]",
         "-c:a", "libmp3lame", "-b:a", "192k", out])
    lufs, peak = normalize_clip(out, -20.0, -1.5)
    a, b, diff = seam(out)
    ok = abs(diff) < 0.5
    print(f"{bid}: loop {L - x:.2f}s from raw {t0}-{t1}s (xfade {x}s)  lufs={lufs} peak={peak}  "
          f"seam start {a:.1f} / end {b:.1f} dB -> {diff:+.2f} dB  {'OK' if ok else 'FAIL (> 0.5 dB)'}")
    with open(CATALOG, encoding="utf-8") as f:
        cat = json.load(f)
    for c in cat["clips"]:
        if c["id"] == bid:
            c.update({"duration_s": probe_duration(out), "loudness_lufs": lufs, "peak_dbfs": peak,
                      "loop": True, "raw_file": f"raw/{bid}.mp3 (local, git-ignored)",
                      "loop_from_raw_s": [t0, t1], "loop_xfade_s": x, "seam_db": diff})
    with open(CATALOG, "w", encoding="utf-8") as f:
        json.dump(cat, f, indent=2, ensure_ascii=False)
        f.write("\n")
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
