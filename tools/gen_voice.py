#!/usr/bin/env python3
"""
gen_voice.py — ElevenLabs TTS voice track for a TSX short, driven by its beats.json.

Shorts-track voice step. Reads a short's beats.json (vo[] lines with estimated
start/end seconds), generates each line with ElevenLabs text-to-speech (per line, so a
single line can be re-rolled without re-billing the rest), time-fits any clip that
overflows its window (gentle atempo, capped), assembles one timed voice track, and
writes the ACTUAL line timings back into beats.json — the TSX captions retime from it.

LIBRARY-FIRST: generated lines are cached by (index, text-hash); unchanged lines are
never re-billed. --force regenerates everything.

Usage:
  python tools/gen_voice.py --beats shorts/<slug>/beats.json
  python tools/gen_voice.py --beats ... --mux remotion/out/Short1Chess.mp4   # + voiced preview
  python tools/gen_voice.py --beats ... --dry-run                            # plan only
  python tools/gen_voice.py --beats ... --natural --emit-ts <vo.gen.ts>      # VOICE-FIRST (see below)

VOICE-FIRST (--natural): no windows, no tempo squeeze. Every line is generated at its natural
pace and the timeline is BUILT from the real clip durations: each line starts `gap_before`
seconds (default format.gap, 0.35) after the previous one ends; the composition is then animated
on these real word times. beats.json `hook_variants` ({"b": {"text","tts"}, ...}; vo[0] is
variant "a") are generated too: the hook gets a fixed slot = the longest variant, so everything
after it is identical in every variant; one voice track per variant (voice-<k>.wav), and
format.durationSec = last line end + format.tail (default 0.8).

Needs ELEVENLABS_API_KEY in .env. ffmpeg/ffprobe on PATH.
Default voice: the channel voice (JYUzXNeyCPmymMkfcicu). Override with --voice.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_VOICE = "JYUzXNeyCPmymMkfcicu"  # the channel voice (CLAUDE.md)
DEFAULT_MODEL = "eleven_v4_turbo"  # chosen 2026-11-15 by ear (v4 family >> v2); x0.5 credits
MAX_ATEMPO = 1.3  # never speed a line up more than 30%


def load_env():
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


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.exit(f"command failed: {' '.join(cmd)}\n{r.stdout}")
    return r.stdout


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


def tts_line(key, voice, model, text, prev_text, next_text, out_path):
    """TTS with character-level timestamps -> writes the mp3 AND <out_path>.words.json
    (per-word start/end seconds in the RAW clip) so captions can sync exactly.

    `text` may contain v3/v4 audio tags like [awed] — they steer delivery and are
    FILTERED out of the word map (never captioned). If the model rejects /with-timestamps,
    falls back to plain TTS with an empty word map (captions then use estimated timing)."""
    body = {"text": text, "model_id": model}
    if model.startswith("eleven_v4"):
        # v4 / v4 Turbo use only Stability and Similarity (no Style/Speed, no SSML). Context
        # stitching was accepted in the 2026-11-15 calibration, so it stays.
        body["voice_settings"] = {"stability": 0.5, "similarity_boost": 0.75}
        if prev_text:
            body["previous_text"] = prev_text
        if next_text:
            body["next_text"] = next_text
    elif not model.startswith("eleven_v3"):
        # v3 rejects the classic settings block AND previous/next context stitching;
        # server defaults are right for it
        body["voice_settings"] = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.3,
                                  "use_speaker_boost": True}
        if prev_text:
            body["previous_text"] = prev_text
        if next_text:
            body["next_text"] = next_text

    import base64

    def call(url):
        req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                     headers={"xi-api-key": key, "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=180) as r:
            ctype = r.headers.get("Content-Type", "")
            raw = r.read()
        return json.loads(raw) if "json" in ctype else raw

    base = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    try:
        resp = call(f"{base}/with-timestamps?output_format=mp3_44100_128")
        audio = base64.b64decode(resp["audio_base64"])
        align = resp.get("alignment") or {}
        words = chars_to_words(align.get("characters", []),
                               align.get("character_start_times_seconds", []),
                               align.get("character_end_times_seconds", []))
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:500]
        if e.code in (400, 404, 422):  # model may not support timestamps — plain fallback
            print(f"    (with-timestamps not available: {e.code}; falling back to plain TTS)")
            try:
                audio = call(f"{base}?output_format=mp3_44100_128")
                words = []
            except urllib.error.HTTPError as e2:
                sys.exit(f"ElevenLabs TTS failed ({e2.code}) for: {text!r}\n{e2.read().decode()[:500]}")
        else:
            sys.exit(f"ElevenLabs TTS failed ({e.code}) for: {text!r}\n{detail}")

    # audio tags ([excited], [pause]…) are delivery directions, not spoken words
    words = [w for w in words if not (w["w"].startswith("[") or w["w"].endswith("]"))]
    with open(out_path, "wb") as f:
        f.write(audio)
    with open(out_path + ".words.json", "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)


def chars_to_words(chars, starts, ends):
    """Collapse character alignment into [{w, start, end}] (whitespace-delimited)."""
    words, cur, w_start, w_end = [], "", None, None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "start": round(w_start, 3), "end": round(w_end, 3)})
                cur, w_start = "", None
            continue
        if not cur:
            w_start = s
        cur += ch
        w_end = e
    if cur:
        words.append({"w": cur, "start": round(w_start, 3), "end": round(w_end, 3)})
    return words


def _esc(t):
    return t.replace("\\", "\\\\").replace("'", "\\'")


def _ts_line(line):
    esc = line["text"].replace("\\", "\\\\").replace("'", "\\'")
    ws = ", ".join(
        "{ w: '%s', start: %s, end: %s }" % (w["w"].replace("\\", "\\\\").replace("'", "\\'"), w["start"], w["end"])
        for w in line.get("words", []))
    tts = ""
    if line.get("tts") and line["tts"] != line["text"]:  # captions show `text` mapped onto the spoken words
        tts = ", tts: '%s'" % _esc(line["tts"])
    return f"{{ text: '{esc}'{tts}, start: {line['start']}, end: {line['end']}, words: [{ws}] }}"


def emit_ts(vo, path, hooks=None, duration=None):
    """Write the generated VO (with exact word times) as a TS module the shot imports.
    With hook variants, also exports HOOKS (one line per variant) and the voiced DURATION_S."""
    lines = ["// AUTO-GENERATED by tools/gen_voice.py — do not edit.",
             "// Word times are the REAL ElevenLabs alignment; captions sync exactly.",
             "import type { VoLine } from '../../lib/shorts';", "",
             "export const VO: VoLine[] = ["]
    for line in vo:
        lines.append(f"  {_ts_line(line)},")
    lines += ["];", ""]
    if hooks:
        lines.append("// hook variants: same slot, everything after them is identical")
        lines.append("export const HOOKS: Record<string, VoLine> = {")
        for k, h in hooks.items():
            lines.append(f"  {k}: {_ts_line(h)},")
        lines += ["};", ""]
    if duration is not None:
        lines += [f"export const DURATION_S = {duration};", ""]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--beats", required=True, help="path to the short's beats.json")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--mux", help="optional rendered mp4 to mux the voice onto (-voiced.mp4)")
    ap.add_argument("--emit-ts", help="write the VO (with exact word times) as a TS module, e.g. remotion/src/shots/short-2/vo.gen.ts")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--natural", action="store_true",
                    help="voice-first: natural pace, timeline built from the real clip durations")
    args = ap.parse_args()
    if args.natural:
        return natural(args)

    beats_path = os.path.abspath(args.beats)
    beats = json.load(open(beats_path, encoding="utf-8"))
    vo = beats["vo"]
    total = float(beats["format"]["durationSec"])
    vdir = os.path.join(os.path.dirname(beats_path), "voice")
    os.makedirs(vdir, exist_ok=True)

    key = load_env().get("ELEVENLABS_API_KEY")
    if not key and not args.dry_run:
        sys.exit("ELEVENLABS_API_KEY not found in .env")

    fitted = []  # (path, start_sec, fitted_dur)
    print(f"{'line':4s} {'start':>6s} {'window':>6s} {'clip':>6s} {'tempo':>5s}  text")
    for i, line in enumerate(vo):
        start = float(line["start"])
        next_start = float(vo[i + 1]["start"]) if i + 1 < len(vo) else total - 0.3
        window = next_start - start - 0.05
        tts_text = line.get("tts", line["text"])  # optional tagged/phonetic variant for TTS
        h = hashlib.sha1(f"{args.voice}|{args.model}|{tts_text}".encode()).hexdigest()[:8]
        raw = os.path.join(vdir, f"line-{i:02d}-{h}.mp3")
        fit = os.path.join(vdir, f"line-{i:02d}-{h}-fit.wav")

        if args.dry_run:
            print(f"{i:4d} {start:6.2f} {window:6.2f}      ?     ?  {tts_text}")
            continue

        if args.force or not os.path.exists(raw) or not os.path.exists(raw + ".words.json"):
            prev_text = vo[i - 1].get("tts", vo[i - 1]["text"]) if i > 0 else None
            next_text = vo[i + 1].get("tts", vo[i + 1]["text"]) if i + 1 < len(vo) else None
            tts_line(key, args.voice, args.model, tts_text, prev_text, next_text, raw)

        dur = probe_duration(raw)
        tempo = 1.0
        if dur > window:
            tempo = min(MAX_ATEMPO, dur / window)
        if args.force or not os.path.exists(fit):
            run(["ffmpeg", "-y", "-v", "error", "-i", raw,
                 "-filter:a", f"atempo={tempo:.4f}", "-ar", "44100", "-ac", "2", fit])
        fdur = probe_duration(fit)
        overflow = " OVERFLOW" if fdur > window + 0.05 else ""
        print(f"{i:4d} {start:6.2f} {window:6.2f} {fdur:6.2f} {tempo:5.2f}  {line['text']}{overflow}")
        line["end"] = round(start + fdur, 2)
        # exact word times: raw alignment, scaled by the tempo fit, offset to global
        raw_words = json.load(open(raw + ".words.json", encoding="utf-8"))
        line["words"] = [{"w": w["w"],
                          "start": round(start + w["start"] / tempo, 3),
                          "end": round(start + w["end"] / tempo, 3)} for w in raw_words]
        fitted.append((fit, start, fdur))

    if args.dry_run:
        return

    # assemble: delay each line to its start, sum (lines never overlap), pad to length
    voice_wav = os.path.join(vdir, "voice.wav")
    inputs, parts = [], []
    for j, (path, start, _d) in enumerate(fitted):
        inputs += ["-i", path]
        ms = int(round(start * 1000))
        parts.append(f"[{j}:a]adelay={ms}|{ms}[a{j}]")
    chain = "".join(f"[a{j}]" for j in range(len(fitted)))
    fc = ";".join(parts) + f";{chain}amix=inputs={len(fitted)}:normalize=0,apad,atrim=0:{total}," \
         f"loudnorm=I=-16:TP=-1.5:LRA=11[out]"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc,
         "-map", "[out]", "-ar", "44100", "-ac", "2", voice_wav])
    print(f"voice track -> {os.path.relpath(voice_wav, ROOT)}")

    beats["voiceStatus"] = f"elevenlabs:{args.voice}"
    json.dump(beats, open(beats_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"actual line timings + word maps written back -> {os.path.relpath(beats_path, ROOT)}")

    if args.emit_ts:
        emit_ts(vo, rp := os.path.abspath(args.emit_ts))
        print(f"VO TS module -> {os.path.relpath(rp, ROOT)}")

    if args.mux:
        out = os.path.splitext(args.mux)[0] + "-voiced.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", args.mux, "-i", voice_wav,
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-t", str(total), out])
        print(f"voiced preview -> {os.path.relpath(out, ROOT)}")


def natural(args):
    """Voice-first: generate every line at its natural pace, then lay the timeline out from the
    real durations (no windows, no atempo). See the module docstring."""
    import math
    import shutil
    beats_path = os.path.abspath(args.beats)
    beats = json.load(open(beats_path, encoding="utf-8"))
    vo, fmt = beats["vo"], beats["format"]
    fps = fmt.get("fps", 30)
    gap_default = float(fmt.get("gap", 0.35))
    lead = float(fmt.get("leadIn", 0.15))
    tail = float(fmt.get("tail", 0.8))
    hooks = {"a": vo[0], **beats.get("hook_variants", {})}
    vdir = os.path.join(os.path.dirname(beats_path), "voice")
    os.makedirs(vdir, exist_ok=True)
    key = load_env().get("ELEVENLABS_API_KEY")
    if not key and not args.dry_run:
        sys.exit("ELEVENLABS_API_KEY not found in .env")

    if args.dry_run:
        chars = sum(len(h.get("tts", h["text"])) for h in hooks.values()) + \
            sum(len(l.get("tts", l["text"])) for l in vo[1:])
        mult = 0.5 if ("turbo" in args.model or "flash" in args.model) else 1.0
        print(f"{len(hooks)} hook variants + {len(vo) - 1} lines, {chars} billed characters "
              f"(tags included) -> ~{chars * mult:.0f} credits on {args.model}")
        return

    def clip(tag, line, prev_line, next_line):
        tts_text = line.get("tts", line["text"])
        h = hashlib.sha1(f"{args.voice}|{args.model}|{tts_text}".encode()).hexdigest()[:8]
        raw = os.path.join(vdir, f"line-{tag}-{h}.mp3")
        if args.force or not os.path.exists(raw) or not os.path.exists(raw + ".words.json"):
            prev_text = prev_line.get("tts", prev_line["text"]) if prev_line else None
            next_text = next_line.get("tts", next_line["text"]) if next_line else None
            print(f"    generating {tag}: {tts_text}")
            tts_line(key, args.voice, args.model, tts_text, prev_text, next_text, raw)
        return raw, probe_duration(raw), json.load(open(raw + ".words.json", encoding="utf-8"))

    # hook variants -> one fixed slot (the longest), so everything after is shared
    hook_clips = {k: clip(f"h{k}", h, None, vo[1] if len(vo) > 1 else None) for k, h in hooks.items()}
    # gaps are measured SPEECH to SPEECH (first word to last word), so the silence a clip carries
    # before its first word never adds to the pause; clips are placed so their first word lands
    # exactly `gap` after the previous line's last word. line start/end = speech start/end.
    def speech(words, dur):
        return (words[0]["start"], words[-1]["end"]) if words else (0.0, dur)

    hook_end = 0.0
    for k, h in hooks.items():
        raw, dur, words = hook_clips[k]
        s0, s1 = speech(words, dur)
        h["start"], h["end"] = round(lead + s0, 3), round(lead + s1, 3)
        h["words"] = [{"w": w["w"], "start": round(lead + w["start"], 3), "end": round(lead + w["end"], 3)}
                      for w in words]
        hook_end = max(hook_end, lead + s1)
    print("hook slot ends at %.2fs  (" % hook_end + ", ".join(f"{k} {h['end']:.2f}s" for k, h in hooks.items()) + ")")

    t = hook_end
    placed = []
    print(f"{'line':4s} {'gap':>5s} {'start':>6s} {'talk':>5s} {'w/s':>5s}  text")
    for i in range(1, len(vo)):
        line = vo[i]
        raw, dur, words = clip(f"{i:02d}", line, vo[i - 1], vo[i + 1] if i + 1 < len(vo) else None)
        gap = float(line.get("gap_before", gap_default))
        s0, s1 = speech(words, dur)
        clip_at = t + gap - s0  # the clip's own lead-in silence overlaps the pause
        line["start"], line["end"] = round(clip_at + s0, 3), round(clip_at + s1, 3)
        line["words"] = [{"w": w["w"], "start": round(clip_at + w["start"], 3), "end": round(clip_at + w["end"], 3)}
                         for w in words]
        nw = len(line["text"].split())
        print(f"{i:4d} {gap:5.2f} {line['start']:6.2f} {s1 - s0:5.2f} {nw / max(0.1, s1 - s0):5.2f}  {line['text']}")
        placed.append((raw, max(0.0, clip_at)))
        t = clip_at + s1
    total = math.ceil((t + tail) * fps) / fps
    fmt["durationSec"] = round(total, 3)
    words_total = sum(len(l["text"].split()) for l in vo)
    print(f"\nvoiced length {total:.2f}s ({words_total} words main track -> {words_total / total:.2f} w/s overall)")

    for k, (hraw, _, _) in hook_clips.items():
        items = [(hraw, lead)] + placed
        inputs, parts = [], []
        for j, (path, start) in enumerate(items):
            inputs += ["-i", path]
            ms = int(round(start * 1000))
            parts.append(f"[{j}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={ms}|{ms}[a{j}]")
        chain = "".join(f"[a{j}]" for j in range(len(items)))
        fc = ";".join(parts) + f";{chain}amix=inputs={len(items)}:normalize=0,apad,atrim=0:{total}," \
             f"loudnorm=I=-16:TP=-1.5:LRA=11[out]"
        out = os.path.join(vdir, f"voice-{k}.wav")
        run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", fc,
             "-map", "[out]", "-ar", "44100", "-ac", "2", out])
        print(f"voice track {k} -> {os.path.relpath(out, ROOT)}")
        if k == "a":
            shutil.copyfile(out, os.path.join(vdir, "voice.wav"))

    beats["voiceStatus"] = f"elevenlabs:{args.voice}:{args.model}:natural"
    json.dump(beats, open(beats_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"real timings + word maps -> {os.path.relpath(beats_path, ROOT)}")
    if args.emit_ts:
        rp = os.path.abspath(args.emit_ts)
        os.makedirs(os.path.dirname(rp), exist_ok=True)
        emit_ts(vo, rp, hooks if len(hooks) > 1 else None, fmt["durationSec"])
        print(f"VO TS module -> {os.path.relpath(rp, ROOT)}")


if __name__ == "__main__":
    main()
