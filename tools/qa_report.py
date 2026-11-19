#!/usr/bin/env python3
"""
qa_report.py — shared helpers for the video QA tools (motion_check, frame_check, finalize_audio).

Every check writes its section into ONE file per composition: remotion/out/qa/<Id>-qa.json (the
same file frames.mjs starts with its layout warnings). Each section is
  {"tool": ..., "ok": bool, "flags": [{"check", "from_s", "to_s", "message"}], ...details}
and the file's top-level "flags" list is rebuilt from all sections, so the QA report can list every
flag before anyone watches the video. Note: frames.mjs wipes out/qa/ on each run unless --keep-qa,
so run these checks AFTER the last frames.mjs pass (they run on the full render anyway).

Also: the brand's layout tokens (SAFE, CAPTION.centerY, CANVAS) read from remotion/src/brand.ts, so
the checks follow the brand instead of hard-coding the safe area. Stdlib only.
"""
import json
import os
import re
import subprocess
import sys

# the Windows console defaults to cp1252: print the reports' arrows/dashes instead of crashing
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QA_DIR = os.path.join(ROOT, "remotion", "out", "qa")
BRAND_TS = os.path.join(ROOT, "remotion", "src", "brand.ts")


def brand_layout():
    """{'W','H','safe': (x, y, w, h), 'content': (x, y, w, h)}; content = the safe rect above the caption lane."""
    src = open(BRAND_TS, encoding="utf-8").read()
    num = lambda pat, d: int(re.search(pat, src).group(1)) if re.search(pat, src) else d
    W = num(r"W:\s*(\d+)", 1080)
    H = num(r"H:\s*(\d+)", 1920)
    m = re.search(r"export const SAFE = \{\s*top:\s*(\d+),\s*bottom:\s*(\d+),\s*left:\s*(\d+),\s*right:\s*(\d+)", src)
    top, bottom, left, right = (int(g) for g in m.groups()) if m else (210, 500, 60, 180)
    cap = num(r"centerY:\s*(\d+)", 1350)
    safe = (left, top, W - left - right, H - top - bottom)
    content_bottom = cap - 80  # the caption block is ~±70 px around centerY: captions are not "content"
    return {"W": W, "H": H, "safe": safe, "content": (left, top, W - left - right, content_bottom - top)}


def comp_id(video, given=None):
    if given:
        return given
    return os.path.splitext(os.path.basename(video))[0]


def write_section(cid, key, section, qa_dir=QA_DIR):
    os.makedirs(qa_dir, exist_ok=True)
    path = os.path.join(qa_dir, f"{cid}-qa.json")
    data = {}
    if os.path.exists(path):
        try:
            data = json.load(open(path, encoding="utf-8"))
        except ValueError:
            data = {}
    data.setdefault("id", cid)
    data[key] = section
    flags = []
    for k, v in data.items():
        if isinstance(v, dict) and isinstance(v.get("flags"), list):
            flags += [dict(f, section=k) for f in v["flags"]]
    data["flags"] = sorted(flags, key=lambda f: (f.get("from_s") if f.get("from_s") is not None else -1, f.get("section", "")))
    json.dump(data, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    return path


def ffmpeg_metadata(video, vf, keys):
    """Run ffmpeg with a filter chain ending in metadata=print; return {key: [value per frame]}."""
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-vf", vf + ",metadata=print:file=-", "-an", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace")
    if p.returncode != 0:
        raise SystemExit(f"ffmpeg failed on {video}:\n{p.stderr[-2000:]}")
    out = {k: {} for k in keys}
    cur = None
    for line in p.stdout.splitlines():
        m = re.match(r"frame:(\d+)", line)
        if m:
            cur = int(m.group(1))
            continue
        for k in keys:
            if line.startswith(f"lavfi.{k}="):
                out[k][cur] = float(line.split("=", 1)[1])
    n = max((max(v) for v in out.values() if v), default=-1) + 1
    return {k: [v.get(i, 0.0) for i in range(n)] for k, v in out.items()}


def fps_of(video):
    p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video],
                       capture_output=True, text=True)
    rate = (p.stdout.strip().split()[0] if p.stdout.strip() else "30/1").strip(",")  # csv may end in ','
    a, b = rate.split("/")
    return float(a) / float(b)


# Checks an "intentional" window waives when it doesn't name its own: the two rules a Race scene
# (PROJECT_CONTEXT §4) breaks on purpose — "a new idea every 5–10 s" (near-still) and hero size
# (small-content). Empty frames stay checked unless a window lists "empty-frame" explicitly.
DEFAULT_WAIVED = ("near-still", "small-content")


def intentional_windows(beats_path=None, cli=None):
    """Scenes tagged intentional, as [{'from_s', 'to_s', 'reason', 'checks'}].

    From beats.json: {"qa": {"intentional": [{"from_s": 3.2, "to_s": 38, "reason": "Race scene",
    "checks": ["near-still", "small-content"]}]}} ("checks" optional, default DEFAULT_WAIVED).
    From the CLI: "FROM-TO" strings in seconds (default checks)."""
    out = []
    if beats_path:
        data = json.load(open(beats_path, encoding="utf-8"))
        for w in (data.get("qa") or {}).get("intentional", []):
            out.append({"from_s": float(w["from_s"]), "to_s": float(w["to_s"]),
                        "reason": w.get("reason", ""), "checks": list(w.get("checks") or DEFAULT_WAIVED)})
    for spec in cli or []:
        a, b = spec.split("-", 1)
        out.append({"from_s": float(a), "to_s": float(b), "reason": "--intentional", "checks": list(DEFAULT_WAIVED)})
    return out


def intentional_mask(windows, check, n, unit_s):
    """[bool] per unit (a second or a frame): True where `check` is waived by an intentional window."""
    m = [False] * n
    for w in windows:
        if check not in w["checks"]:
            continue
        for i in range(n):
            t0, t1 = i * unit_s, (i + 1) * unit_s
            if min(t1, w["to_s"]) - max(t0, w["from_s"]) >= 0.5 * unit_s:  # mostly inside
                m[i] = True
    return m


def runs(flags_per_unit, min_len):
    """[(start, end_exclusive)] of consecutive True values at least min_len long."""
    out, s = [], None
    for i, x in enumerate(list(flags_per_unit) + [False]):
        if x and s is None:
            s = i
        elif not x and s is not None:
            if i - s >= min_len:
                out.append((s, i))
            s = None
    return out
