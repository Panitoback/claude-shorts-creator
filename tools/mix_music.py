#!/usr/bin/env python3
"""
mix_music.py — the background-layer mixer (music pass, after mix_sfx.py).

Up to TWO background layers under a base video (voice + SFX), brand §7:
  * a MUSIC bed (emotion): a track from media/library/music/, ~-18 to -20 dB under the voice,
    ducked under speech, free to rise on the peaks (--lift);
  * an AMBIENT loop (texture): a "loop": true clip from the SFX library (space-drone-loop,
    space-air-loop, accretion-swirl-loop), ~-24 dB under the voice, also ducked.
Level order: voice > SFX > music > ambient. Never two music beds or two ambient loops.

THE BED ADAPTS THROUGH THE MIX, NOT THE COMPOSITION: library music beds are steady-intensity
seamless loops that fit any short. Each short shapes the bed here: ducked under the voice,
--lift swells on the peaks (hook, main reveal, twist), --from/--to + --fade where the energy
curve asks it to enter or leave, the ambient loop below it.

Both layers are gained relative to the VOICE's loudness (measured on --voice, the voice-only
mux; falls back to --base), high-passed so they never muddy speech, sidechain-ducked keyed by
the voice only (so the music is NOT pushed down by the SFX hits it should support), faded at
the edges, and summed with a safety limiter. Video is copied through untouched.

Usage:
  # the standard two-layer mix
  python tools/mix_music.py --base shorts/<slug>/output/<slug>-sfx.mp4
      --voice shorts/<slug>/output/<slug>-voiced.mp4
      --music <music-id> --lift "40.6-43.4:+4,51.6-54:+3"
      --ambient accretion-swirl-loop --out shorts/<slug>/output/<slug>-final.mp4

  # audition every (non-legacy) music bed over the same base + ambient: <base-stem>-<id>.mp4
  python tools/mix_music.py --all --base ... --voice ... --ambient accretion-swirl-loop

  --music <id>          music bed (music catalog id)
  --music-file <path>   a music file not in the catalog (an audition preview), measured on the fly
  --music-under 19      dB the music sits under the voice (default 19)
  --music-duck 9        extra dB it drops while the voice speaks (default 9)
  --lift "t0-t1:+dB,…"  raise the music on these windows (the peaks), 0.6 s linear ramps
  --fade 1.5            music fade in/out seconds
  --from 12 --to 31     play the music only in this window
  --ambient <id>        ambient loop (SFX-library loop id)
  --ambient-under 24    dB under the voice (default 24)
  --ambient-duck 6      extra dB under speech (default 6)
  --ambient-fade 0.3    ambient fade in/out seconds
  --bed <id>            legacy single-layer flag: routed to --music or --ambient by catalog
                        (--under / --duck are accepted as the music aliases)
  --end 60              trim output to N seconds (default: full base)
  --print               show the resolved settings, no render

ffmpeg/ffprobe on PATH.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "media", "library", "music", "catalog.json")
SFX_CATALOG = os.path.join(ROOT, "media", "library", "sfx", "catalog.json")


def rp(p):
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def show(p):
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


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", path]).strip()
    return float(out)


def flag(args, name, default=None, cast=str):
    if name in args:
        return cast(args[args.index(name) + 1])
    return default


def measure_lufs(path):
    out = run(["ffmpeg", "-hide_banner", "-i", path, "-vn", "-af", "ebur128", "-f", "null", os.devnull])
    ms = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", out)
    return float(ms[-1]) if ms else None


def parse_lift(spec):
    """'40.6-43.4:+4,51.6-54:+3' -> [(40.6, 43.4, 4.0), (51.6, 54.0, 3.0)]"""
    out = []
    for part in (spec or "").split(","):
        part = part.strip()
        if part:
            win, db = part.split(":")
            t0, t1 = win.split("-")
            out.append((float(t0), float(t1), float(db)))
    return out


def lift_expr(lifts, ramp=0.6):
    """ffmpeg volume expression: 1 outside the windows, the window's gain inside, linear ramps."""
    terms = []
    for t0, t1, db in lifts:
        g = 10 ** (db / 20) - 1
        terms.append(f"{g:.4f}*clip((t-{t0 - ramp:.3f})/{ramp},0,1)*clip(({t1 + ramp:.3f}-t)/{ramp},0,1)")
    return "1+" + "+".join(terms)


def mix_layers(base, voice, out, layers, end):
    """Render `base` with the background `layers` underneath.
    layers: [{file, gain, duck, fade, t0?, t1?, lift?}] (music first, then ambient)."""
    os.makedirs(os.path.dirname(out), exist_ok=True)
    dur = end if end is not None else probe_duration(base)
    n = len(layers)
    # input 0 = base (voice + SFX, what we hear), input 1 = voice only (the duck key)
    cmd = ["ffmpeg", "-y", "-hide_banner", "-i", base, "-i", voice]
    parts = ["[0:a]aformat=sample_rates=48000:channel_layouts=stereo[main]",
             f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit={n}"
             + "".join(f"[key{i}]" for i in range(n))]
    outs = []
    for i, L in enumerate(layers):
        cmd += ["-stream_loop", "-1", "-i", L["file"]]
        t0 = max(0.0, L.get("t0") or 0.0)
        t1 = min(dur, L["t1"] if L.get("t1") is not None else dur)
        span = max(0.1, t1 - t0)
        fade = min(L["fade"], span / 2)
        # format, gentle high-pass so it never muddies speech, level, trim, fades, place
        parts.append(
            f"[{i + 2}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
            f"highpass=f=90,volume={L['gain']:.2f}dB,atrim=0:{span:.3f},asetpts=N/SR/TB,"
            f"afade=t=in:st=0:d={fade:.2f},afade=t=out:st={max(0.0, span - fade):.3f}:d={fade:.2f},"
            f"adelay={int(t0 * 1000)}:all=1,apad=whole_dur={dur:.3f}[l{i}]")
        # duck under the voice: drops ~`duck` dB while it speaks, slow release so it never pumps
        ratio = max(2.0, L["duck"] / 3.0)
        parts.append(f"[l{i}][key{i}]sidechaincompress=threshold=0.03:ratio={ratio:.2f}:attack=15:"
                     f"release=450:makeup=1[d{i}]")
        if L.get("lift"):  # after the duck, so the lift on a peak is not compressed away
            parts.append(f"[d{i}]volume=volume='{lift_expr(L['lift'])}':eval=frame[o{i}]")
        else:
            parts.append(f"[d{i}]anull[o{i}]")
        outs.append(f"[o{i}]")
    parts.append("[main]" + "".join(outs)
                 + f"amix=inputs={1 + n}:normalize=0:dropout_transition=0[mixraw]")
    parts.append("[mixraw]alimiter=level_in=1:level_out=1:limit=0.97[mix]")
    cmd += ["-filter_complex", ";".join(parts),
            "-map", "0:v:0", "-map", "[mix]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{dur:.3f}", "-movflags", "+faststart", out]
    print(f"  rendering -> {show(out)}")
    run(cmd)
    return out


def main():
    args = sys.argv[1:]
    base = rp(flag(args, "--base", ""))
    voice = rp(flag(args, "--voice")) if "--voice" in args else base
    end = flag(args, "--end", None, float)
    out_override = flag(args, "--out", None)

    with open(CATALOG, encoding="utf-8") as f:
        music = {c["id"]: c for c in json.load(f).get("clips", [])}
    loops = {}
    if os.path.exists(SFX_CATALOG):
        with open(SFX_CATALOG, encoding="utf-8") as f:
            loops = {c["id"]: c for c in json.load(f).get("clips", [])
                     if c.get("loop") and not c.get("legacy") and not c.get("superseded")}

    music_id, amb_id = flag(args, "--music"), flag(args, "--ambient")
    mfile = flag(args, "--music-file")
    if mfile:
        music_id = os.path.splitext(os.path.basename(mfile))[0]
        music[music_id] = {"id": music_id, "file": os.path.relpath(rp(mfile), os.path.dirname(CATALOG))}
    bed = flag(args, "--bed")
    if bed:  # legacy single-layer flag
        if bed in loops:
            amb_id = amb_id or bed
        else:
            music_id = music_id or bed
    if "--all" in args:
        targets = [m for m, c in music.items() if not c.get("legacy")]
    else:
        targets = [music_id]
    if not base or not os.path.exists(base):
        sys.exit(f"missing --base video: {base}")
    if targets == [None] and not amb_id:
        sys.exit("give --music <id> and/or --ambient <id>  (music: " + ", ".join(music)
                 + " | ambient loops: " + ", ".join(loops) + ")")

    voice_lufs = measure_lufs(voice)
    print(f"base: {show(base)}   voice ref: {show(voice)} ({voice_lufs} LUFS)")

    def gain_for(clip, path, under):
        lufs = clip.get("loudness_lufs") or measure_lufs(path)
        return voice_lufs - under - lufs

    amb_layer = None
    if amb_id:
        if amb_id not in loops:
            sys.exit(f"--ambient {amb_id}: not an SFX-library loop ({', '.join(loops)})")
        c = loops[amb_id]
        path = rp(os.path.join("media", "library", "sfx", c["file"]))
        u = flag(args, "--ambient-under", 24.0, float)
        amb_layer = {"file": path, "gain": gain_for(c, path, u),
                     "duck": flag(args, "--ambient-duck", 6.0, float),
                     "fade": flag(args, "--ambient-fade", 0.3, float)}
        print(f"  ambient {amb_id}: {u:g} dB under the voice -> gain {amb_layer['gain']:.1f} dB,"
              f" duck {amb_layer['duck']:g} dB")

    stem = os.path.splitext(os.path.basename(base))[0]
    results = []
    for mid in targets:
        layers = []
        if mid:
            if mid in loops:
                sys.exit(f"--music {mid} is an ambient loop: pass it as --ambient (one of each, brand §7)")
            if mid not in music:
                sys.exit(f"--music {mid}: not in the music catalog")
            c = music[mid]
            if c.get("legacy"):
                print(f"  WARNING {mid} is legacy (not ours to publish): audition only")
            path = rp(os.path.join("media", "library", "music", c["file"]))
            u = flag(args, "--music-under", flag(args, "--under", 19.0, float), float)
            lift = parse_lift(flag(args, "--lift"))
            layers.append({"file": path, "gain": gain_for(c, path, u),
                           "duck": flag(args, "--music-duck", flag(args, "--duck", 9.0, float), float),
                           "fade": flag(args, "--fade", 1.5, float),
                           "t0": flag(args, "--from", None, float), "t1": flag(args, "--to", None, float),
                           "lift": lift})
            print(f"  music {mid}: {u:g} dB under the voice -> gain {layers[0]['gain']:.1f} dB"
                  + (f", lifts {lift}" if lift else ""))
        if amb_layer:
            layers.append(amb_layer)
        if out_override and len(targets) == 1:
            out = rp(out_override)
        else:
            out = os.path.join(os.path.dirname(base), f"{stem}-{mid or amb_id}.mp4")
        if "--print" in args:
            print(f"  -> {show(out)}")
            continue
        results.append(mix_layers(base, voice, out, layers, end))

    if results:
        print("\ndone:")
        for r in results:
            print(f"  {show(r)}  ({probe_duration(r):.1f}s)")


if __name__ == "__main__":
    main()
