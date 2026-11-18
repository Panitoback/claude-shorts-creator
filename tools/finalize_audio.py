#!/usr/bin/env python3
"""
finalize_audio.py — the last audio step of every short: two-pass loudnorm to the delivery spec,
verified on the ENCODED file (brand §10: −14 LUFS integrated, true peak ≤ −2.0 dBTP).

Pass 1 measures the input; pass 2 applies loudnorm in linear mode with those measurements and
encodes AAC (video copied). The AAC encode adds a few tenths of a dB of true peak, so the result is
re-measured (ebur128, true peak) and, if the peak is still above the limit, the step is redone from
the ORIGINAL input with a lower true-peak target (up to --attempts times). If the final file is still
out of spec, or its audio runs > 50 ms past the video (the audio is trimmed to the picture: a longer
tail freezes the last frame, a hitch at the loop seam), it FAILS LOUDLY: exit code 2, a FAIL banner, and the file is written next to the output
as <name>.FAILED.mp4 (the output path is left untouched).

Usage (from the repo root):
  python tools/finalize_audio.py shorts/<slug>/output/<slug>-final.mp4              # in place
  python tools/finalize_audio.py mixed.mp4 --out final.mp4 --id WhyTimeA            # + "audio" section in the QA json
  python tools/finalize_audio.py final.mp4 --check                                  # measure only, fail if out of spec
Options: --lufs −14  --tp −2.0 (limit)  --lufs-tol 0.5 (LU)  --attempts 3
Stdlib + ffmpeg only.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

from qa_report import write_section


def sh(args):
    p = subprocess.run(args, capture_output=True, text=True, errors="replace")
    if p.returncode != 0:
        raise SystemExit(f"ffmpeg failed: {' '.join(args[:6])} …\n{p.stderr[-2000:]}")
    return p.stderr


def measure_loudnorm(path, lufs, tp):
    err = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", f"loudnorm=I={lufs}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"])
    return json.loads(err[err.rindex("{"):err.rindex("}") + 1])


def measure_final(path):
    """(integrated LUFS, true peak dBTP) of an encoded file, with ebur128."""
    err = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"])
    summary = err[err.rindex("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summary).group(1))
    m = re.search(r"True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS", summary)
    tp = float(m.group(1)) if m and m.group(1) != "-inf" else -99.0
    return i, tp


def stream_durations(path):
    """{'video': s, 'audio': s} from ffprobe (missing streams are left out)."""
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,duration", "-of", "json", path], capture_output=True, text=True)
    out = {}
    for st in json.loads(p.stdout or "{}").get("streams", []):
        if st.get("duration") not in (None, "N/A"):
            out.setdefault(st["codec_type"], float(st["duration"]))
    return out


def apply(src, dst, lufs, tp_target):
    m = measure_loudnorm(src, lufs, tp_target)
    vdur = stream_durations(src).get("video")  # the audio must end with the picture (a longer tail freezes the last frame = a loop hitch)
    af = (f"loudnorm=I={lufs}:TP={tp_target}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
    if vdur:
        af += f",atrim=end={vdur:.3f},afade=t=out:st={max(0.0, vdur - 0.02):.3f}:d=0.02"  # 20 ms: no click at the cut / loop seam
    sh(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "192k", dst])


def banner(msg):
    line = "!" * 72
    print(f"\n{line}\n!! FAIL: {msg}\n{line}\n", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("--out", help="output file (default: replace the input)")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-2.0, help="true-peak LIMIT on the encoded file, dBTP (default -2.0)")
    ap.add_argument("--lufs-tol", type=float, default=0.5, help="allowed |integrated - target|, LU (default 0.5)")
    ap.add_argument("--attempts", type=int, default=3)
    ap.add_argument("--check", action="store_true", help="only measure the input against the spec")
    ap.add_argument("--id", help="also write an 'audio' section to remotion/out/qa/<id>-qa.json")
    a = ap.parse_args()

    out = a.out or a.input
    def in_spec(i, tp, path=None):
        d = stream_durations(path) if path else {}
        sync = "video" not in d or "audio" not in d or d["audio"] - d["video"] <= 0.05
        return abs(i - a.lufs) <= a.lufs_tol and tp <= a.tp and sync

    if a.check:
        i, tp = measure_final(a.input)
        ok = in_spec(i, tp, a.input)
        tries = []
    else:
        tmpdir = tempfile.mkdtemp(prefix="finalize_audio_")
        src = os.path.join(tmpdir, "src" + os.path.splitext(a.input)[1])
        shutil.copyfile(a.input, src)
        target = a.tp - 0.8  # the AAC encode usually adds ~0.6–0.9 dB of true peak
        tries = []
        for k in range(a.attempts):
            dst = os.path.join(tmpdir, f"try{k}.mp4")
            apply(src, dst, a.lufs, target)
            i, tp = measure_final(dst)
            tries.append({"tp_target": round(target, 2), "lufs": i, "true_peak": tp})
            print(f"  attempt {k + 1}: TP target {target:.2f} → {i:.1f} LUFS, true peak {tp:.1f} dBTP")
            if in_spec(i, tp, dst):
                break
            target -= max(0.2, tp - a.tp + 0.2) if tp > a.tp else 0.0
            if tp <= a.tp:  # the peak is fine but the loudness isn't: retrying won't help
                break
        ok = in_spec(i, tp, dst)
        if ok:
            shutil.move(dst, out)
        else:
            failed = os.path.splitext(out)[0] + ".FAILED.mp4"
            shutil.move(dst, failed)
        shutil.rmtree(tmpdir, ignore_errors=True)

    d = stream_durations(out if (ok or a.check) else os.path.splitext(out)[0] + ".FAILED.mp4")
    tail = round(d["audio"] - d["video"], 3) if "audio" in d and "video" in d else None
    result = {"tool": "finalize_audio", "ok": ok, "audio_tail_s": tail, "file": out.replace("\\", "/"), "lufs": i, "true_peak_dbtp": tp,
              "spec": {"lufs": a.lufs, "lufs_tol": a.lufs_tol, "true_peak_max": a.tp}, "attempts": tries,
              "flags": [] if ok else [{"check": "audio-spec", "from_s": None, "to_s": None,
                                       "message": f"{i:.1f} LUFS / {tp:.1f} dBTP, audio tail {tail} s: out of spec ({a.lufs:g} ± {a.lufs_tol} LUFS, true peak ≤ {a.tp:g} dBTP, audio ends with the video ±0.05 s)"}]}
    if a.id:
        write_section(a.id, "audio", result)
    if ok:
        print(f"finalize_audio OK: {out}  {i:.1f} LUFS, true peak {tp:.1f} dBTP (limit {a.tp:g})")
        sys.exit(0)
    banner(f"{i:.1f} LUFS, true peak {tp:.1f} dBTP, audio tail {tail} s — spec is {a.lufs:g} ± {a.lufs_tol} LUFS, true peak ≤ {a.tp:g} dBTP, audio ending with the video"
           + ("" if a.check else f". Output NOT written; inspect {os.path.splitext(out)[0]}.FAILED.mp4"))
    sys.exit(2)


if __name__ == "__main__":
    main()
