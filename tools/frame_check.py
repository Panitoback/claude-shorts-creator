#!/usr/bin/env python3
"""
frame_check.py — two picture checks on a render (brand §5 "fill the frame", §8 "darkness is short").

Both look only at the CONTENT AREA: the safe rectangle above the caption lane (read from
remotion/src/brand.ts), at 540×960, with pixels lit when luma > --lit-luma (70).

1. EMPTY FRAMES: a frame is empty when < --empty-pct (0.8 %) of the content area is lit, i.e. almost
   nothing but background (stars count as background: they cover ~0.4–1 % of it). Runs longer than
   --empty-max seconds (1.0) are flagged, at frame accuracy.
2. HERO SIZE / FRAME FILLING: the lit pixels are eroded twice (stars, star dust and hairlines vanish;
   objects, big text and thick lines stay) and their bounding box is measured as % of the content
   area's width and height, per second (median). A second is SMALL when both are < --fill-pct (45 %):
   the main content is a small island in a mostly black frame. Runs of >= --fill-run seconds (2) are
   flagged. (Brand target for a hero object: ~50–60 % of the safe width or more.)

A small-content run that mostly overlaps an empty-frame run is dropped (same finding, reported once).

INTENTIONAL SCENES: inside a scene tagged intentional (beats.json "qa.intentional", see
qa_report.intentional_windows; or --intentional FROM-TO), the checks the tag names are skipped: by
default small-content only here (a Race's rows of small movers are the design, PROJECT_CONTEXT §4);
empty-frame stays on unless the tag lists "empty-frame". What would have been flagged there is kept
in the section's "waived" list (not in "flags").

CALIBRATION (2026-11-17, "Why Time Only Moves Forward", A): on the cut the user's frame-by-frame review
flagged, it reports empty 10.3–16.5 s (two tiny particles), 45.0–47.9 s, 52.6–55.1 s, the 73.2–76.5 s void,
and small content 8–14 s, 59–67 s (the corner timeline) and 73–81 s (the loop egg at 40 % wide). On the
approved rework (egg ~54 × 58 %, box ~86 × 50 %, timeline ~25–55 × 75–90 %) it still reports four real,
smaller things: 8–10 s (the word bursting into fine dust), 45.4–46.4 s (the gap between "entropy" and
the axis), 52–57 s (TODAY parked at the top, the rest sparse) and 73.2–76.1 s (stars-only sky + the
last point: stars are background). Flags are for review: the user decides what to fix.

Usage (from the repo root, on the full render):
  python tools/frame_check.py remotion/out/WhyTimeA.mp4             # → remotion/out/qa/WhyTimeA-qa.json ("frames")
  python tools/frame_check.py <video> --id WhyTimeA --strict        # exit 1 if anything is flagged
  python tools/frame_check.py <video> --beats shorts/<slug>/beats.json   # honor intentional scenes
Stdlib + ffmpeg only.
"""
import argparse
import statistics as st
import sys

from qa_report import brand_layout, comp_id, ffmpeg_metadata, fps_of, intentional_mask, intentional_windows, runs, write_section


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--id")
    ap.add_argument("--lit-luma", type=int, default=70, help="a pixel is lit above this luma, 0–255 (default 70)")
    ap.add_argument("--empty-pct", type=float, default=0.8, help="a frame is empty below this %% of the content area lit (default 0.8)")
    ap.add_argument("--empty-max", type=float, default=1.0, help="flag empty runs longer than this, seconds (default 1.0)")
    ap.add_argument("--fill-pct", type=float, default=45, help="content smaller than this %% in BOTH width and height is small (default 45)")
    ap.add_argument("--fill-run", type=int, default=2, help="flag small runs of at least this many seconds (default 2)")
    ap.add_argument("--beats", help="the short's beats.json: scenes tagged qa.intentional are waived")
    ap.add_argument("--intentional", action="append", metavar="FROM-TO", help="waive a scene (seconds); repeatable")
    ap.add_argument("--strict", action="store_true", help="exit 1 when anything is flagged")
    a = ap.parse_args()

    L = brand_layout()
    k = 0.5  # analysis scale (540×960)
    cx, cy, cw, ch = (int(round(v * k)) for v in L["content"])
    crop = f"scale={int(L['W'] * k)}:{int(L['H'] * k)},crop={cw}:{ch}:{cx}:{cy},lutyuv=y='if(gt(val,{a.lit_luma}),255,0)':u=128:v=128"
    fps = fps_of(a.video)
    lit = [v / 255 * 100 for v in ffmpeg_metadata(a.video, crop + ",signalstats", ["signalstats.YAVG"])["signalstats.YAVG"]]
    bb = ffmpeg_metadata(a.video, crop + ",erosion,erosion,bbox=min_val=128", ["bbox.w", "bbox.h"])
    n = len(lit)
    flags = []
    windows = intentional_windows(a.beats, a.intentional)
    waived = []

    def overlaps(s, e, mask):
        return any(mask[s:e])

    # 1. empty frames (frame accuracy)
    min_frames = int(a.empty_max * fps) + 1
    skip_f = intentional_mask(windows, "empty-frame", n, 1 / fps)
    empty = [x < a.empty_pct for x in lit]
    if windows:
        for s, e in runs(empty, min_frames):
            if overlaps(s, e, skip_f):
                waived.append({"check": "empty-frame", "from_s": round(s / fps, 2), "to_s": round(e / fps, 2)})
    for s, e in runs([x and not skip_f[i] for i, x in enumerate(empty)], min_frames):
        flags.append({"check": "empty-frame", "from_s": round(s / fps, 2), "to_s": round(e / fps, 2),
                      "message": f"{(e - s) / fps:.1f} s with almost nothing but background lit (≤ {a.empty_pct} % of the content area; limit {a.empty_max} s)"})

    # 2. hero size / frame filling (per second)
    step = int(round(fps))
    per_sec = []
    for s in range(0, n, step):
        fr = range(s, min(n, s + step))
        w = st.median(bb["bbox.w"][i] if i < len(bb["bbox.w"]) else 0 for i in fr) / cw * 100
        h = st.median(bb["bbox.h"][i] if i < len(bb["bbox.h"]) else 0 for i in fr) / ch * 100
        litp = sum(lit[i] for i in fr) / len(fr)
        per_sec.append({"w_pct": round(w), "h_pct": round(h), "lit_pct": round(litp, 1)})
    skip_s = intentional_mask(windows, "small-content", len(per_sec), 1.0)
    small = [p["w_pct"] < a.fill_pct and p["h_pct"] < a.fill_pct for p in per_sec]
    if windows:
        for s, e in runs(small, a.fill_run):
            if overlaps(s, e, skip_s):
                waived.append({"check": "small-content", "from_s": s, "to_s": e})
    for s, e in runs([x and not skip_s[i] for i, x in enumerate(small)], a.fill_run):
        seg = per_sec[s:e]
        flags.append({"check": "small-content", "from_s": s, "to_s": e,
                      "message": f"{e - s} s where the main content spans at most {max(p['w_pct'] for p in seg)} % × {max(p['h_pct'] for p in seg)} % "
                                 f"of the content area (needs ≥ {a.fill_pct:.0f} % in width or height; hero target ~50–60 % of the safe width)"})

    # a small-content run mostly inside an empty-frame run is the same finding: keep the empty one
    empties = [f for f in flags if f["check"] == "empty-frame"]
    def covered(f):
        return any(min(f["to_s"], e["to_s"]) - max(f["from_s"], e["from_s"]) >= 0.5 * (f["to_s"] - f["from_s"]) for e in empties)
    flags = [f for f in flags if f["check"] != "small-content" or not covered(f)]
    flags.sort(key=lambda f: f["from_s"])
    cid = comp_id(a.video, a.id)
    section = {"tool": "frame_check", "ok": not flags, "video": a.video.replace("\\", "/"),
               "content_area_px": L["content"],
               "params": {"lit_luma": a.lit_luma, "empty_pct": a.empty_pct, "empty_max_s": a.empty_max, "fill_pct": a.fill_pct, "fill_run_s": a.fill_run},
               "intentional": windows, "waived": waived,
               "per_second": per_sec, "flags": flags}
    path = write_section(cid, "frames", section)
    print(f"frame_check {cid}: {len(flags)} flag(s) → {path}")
    for f in waived:
        print(f"  waived (intentional scene) {f['from_s']}–{f['to_s']} s  [{f['check']}]")
    for f in flags:
        print(f"  FLAG {f['from_s']}–{f['to_s']} s  [{f['check']}] {f['message']}")
    sys.exit(1 if (flags and a.strict) else 0)


if __name__ == "__main__":
    main()
