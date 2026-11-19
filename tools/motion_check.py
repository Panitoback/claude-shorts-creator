#!/usr/bin/env python3
"""
motion_check.py — flags stretches of a render that read as a still (brand §8 "motion that registers").

Measures per-second motion: the mean absolute luma difference between consecutive frames (ffmpeg
tblend=difference + signalstats YAVG, at 270×480), averaged over each second. A slow drift over a
dark, sparse frame changes almost no pixels, so it scores as near-still even though "it moves".

A second is NEAR-STILL when its motion < --still (default 0.6). A run of near-still seconds may
pass through ONE isolated second below --bridge (1.0) if the next second is near-still again (a
brief accent doesn't rescue a static stretch). Runs of >= --min-run seconds (4) are flagged. The
last --tail seconds (3.5) are exempt: the loop's deliberate hold (camera drift is off there so the
last frame matches frame 0); the empty-frame check (frame_check.py) still covers that part.

INTENTIONAL SCENES: seconds inside a scene tagged intentional (beats.json "qa.intentional", see
qa_report.intentional_windows; or --intentional FROM-TO) are not counted as near-still, e.g. a Race
(PROJECT_CONTEXT §4: one continuous scene by design). What would have been flagged there is kept in
the section's "waived" list (not in "flags"), so the QA report can still mention it.

CALIBRATION (2026-11-17, "Why Time Only Moves Forward" A, full-quality renders): the cut the user's
frame-by-frame review flagged (static 9–17, 28–35, 45–51, 61–75 s; "entropy" its weakest picture) →
flags 9–18, 28–36, 38–52, 53–57, 58–76 s; the approved rework (same body, motion added) → no flags. Typical values: a box of
100 moving particles ~2.5–3.5; a scene with a particle stream ~1–2; a lone diagram on stars ~0.2–0.4.

Usage (from the repo root, on the full render):
  python tools/motion_check.py remotion/out/WhyTimeA.mp4            # → remotion/out/qa/WhyTimeA-qa.json ("motion")
  python tools/motion_check.py <video> --id WhyTimeA --strict       # exit 1 if anything is flagged
  python tools/motion_check.py <video> --beats shorts/<slug>/beats.json   # honor intentional scenes
Stdlib + ffmpeg only.
"""
import argparse
import sys

from qa_report import comp_id, ffmpeg_metadata, fps_of, intentional_mask, intentional_windows, write_section


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--id", help="composition id for the QA json (default: the file name)")
    ap.add_argument("--still", type=float, default=0.6, help="near-still below this per-second motion (default 0.6)")
    ap.add_argument("--bridge", type=float, default=1.0, help="one isolated second below this doesn't break a run (default 1.0)")
    ap.add_argument("--min-run", type=int, default=4, help="flag runs of at least this many seconds (default 4)")
    ap.add_argument("--tail", type=float, default=3.5, help="exempt the last N seconds: the loop hold (default 3.5)")
    ap.add_argument("--beats", help="the short's beats.json: scenes tagged qa.intentional are waived")
    ap.add_argument("--intentional", action="append", metavar="FROM-TO", help="waive a scene (seconds); repeatable")
    ap.add_argument("--strict", action="store_true", help="exit 1 when anything is flagged")
    a = ap.parse_args()

    fps = fps_of(a.video)
    d = ffmpeg_metadata(a.video, "scale=270:480,tblend=all_mode=difference,signalstats", ["signalstats.YAVG"])["signalstats.YAVG"]
    d = d[1:]  # tblend's first output frame compares nothing
    per_sec = []
    step = int(round(fps))
    for s in range(0, len(d), step):
        chunk = d[s:s + step]
        if len(chunk) >= step // 2:
            per_sec.append(round(sum(chunk) / len(chunk), 2))
    n = len(per_sec)
    last = max(0, n - int(round(a.tail)))  # seconds >= last are exempt
    windows = intentional_windows(a.beats, a.intentional)
    waived_s = intentional_mask(windows, "near-still", last, 1.0)

    def near_still_runs(skip):
        still = [v < a.still and not skip[i] for i, v in enumerate(per_sec[:last])]
        # bridge: one non-still second below --bridge between two near-still seconds counts as still
        for i in range(1, len(still) - 1):
            if not still[i] and not skip[i] and per_sec[i] < a.bridge and still[i - 1] and still[i + 1]:
                still[i] = True
        out, s = [], None
        for i, x in enumerate(still + [False]):
            if x and s is None:
                s = i
            elif not x and s is not None:
                if i - s >= a.min_run:
                    seg = per_sec[s:i]
                    out.append({"check": "near-still", "from_s": s, "to_s": i,
                                "message": f"{i - s} s near-still (motion {min(seg):.2f}–{max(seg):.2f}, needs ≥ {a.still}): add moving content tied to the idea or a push-in"})
                s = None
        return out

    flags = near_still_runs(waived_s)
    # what the intentional scenes hid: runs found without the waiver that touch a waived second
    waived = [f for f in near_still_runs([False] * last) if any(waived_s[f["from_s"]:f["to_s"]])] if windows else []
    cid = comp_id(a.video, a.id)
    section = {"tool": "motion_check", "ok": not flags, "video": a.video.replace("\\", "/"),
               "params": {"still": a.still, "bridge": a.bridge, "min_run_s": a.min_run, "tail_exempt_s": a.tail},
               "intentional": windows, "waived": waived,
               "per_second": per_sec, "flags": flags}
    path = write_section(cid, "motion", section)
    print(f"motion_check {cid}: {len(flags)} flag(s) → {path}")
    for f in waived:
        print(f"  waived (intentional scene) {f['from_s']}–{f['to_s']} s")
    for f in flags:
        print(f"  FLAG {f['from_s']}–{f['to_s']} s  {f['message']}")
    sys.exit(1 if (flags and a.strict) else 0)


if __name__ == "__main__":
    main()
