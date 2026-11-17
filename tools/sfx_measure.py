#!/usr/bin/env python3
"""
sfx_measure.py — where a clip is HEARD and whether a phone can hear it (stdlib + ffmpeg).

A clip is placed by its audible point, not its file start (USAGE.md "Timing and phone check"):
  attack_s  first 10 ms window within 6 dB of the loudest window (snaps, clicks, arrivals)
  peak_s    the loudest 10 ms window (hits, whooshes, riser crests)
  phone_db  how much of the clip's energy survives a 300 Hz high-pass (phone speakers play
            almost nothing below that). Below PHONE_WARN_DB the clip is invisible on a phone.

Used by gen_sfx.py / synth_sfx.py (stored per clip in catalog.json) and mix_sfx.py (the
per-cue phone check after a mix).

Usage:
  python tools/sfx_measure.py <file> [<file> ...]      # print attack/peak/phone for any audio files
"""
import array
import math
import subprocess
import sys

SR = 16000            # analysis rate: plenty for timing at 10 ms and a 300 Hz split
WIN_S = 0.010
PHONE_HP = "highpass=f=300,highpass=f=300"   # 2 x 12 dB/oct = a steep phone-speaker proxy
PHONE_WARN_DB = -6.0  # a clip (or a cue) losing more than this through the high-pass = phone-invisible


def decode(path, af=None, start=None, dur=None):
    """Mono 16 kHz s16 samples of `path` (optionally filtered, optionally a time window)."""
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{max(0.0, start):.3f}"]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    cmd += ["-i", path, "-vn"]
    if af:
        cmd += ["-af", af]
    cmd += ["-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
    a = array.array("h")
    a.frombytes(subprocess.run(cmd, capture_output=True, check=True).stdout)
    return a


def energy(a, i0=0, i1=None):
    i1 = len(a) if i1 is None else min(i1, len(a))
    return sum(x * x for x in a[max(0, i0):i1])


def db(ratio):
    return 10 * math.log10(ratio) if ratio > 0 else -120.0


def envelope(a):
    w = int(SR * WIN_S)
    return [math.sqrt(energy(a, i, i + w) / w) for i in range(0, max(1, len(a) - w + 1), w)]


def measure(path):
    """{'attack_s', 'peak_s', 'phone_db'} for one clip file."""
    a = decode(path)
    env = envelope(a)
    pk = max(env) if env else 0
    if pk <= 0:
        return {"attack_s": 0.0, "peak_s": 0.0, "phone_db": -120.0}
    peak_i = env.index(pk)
    attack_i = next(i for i, v in enumerate(env) if v >= pk * 0.5)
    phone = db(energy(decode(path, PHONE_HP)) / max(1, energy(a)))
    return {"attack_s": round(attack_i * WIN_S, 3), "peak_s": round(peak_i * WIN_S, 3),
            "phone_db": round(phone, 1)}


def catalog_fields(path, loop=False):
    """The measurement block stored in a catalog entry (loops: phone level only)."""
    m = measure(path)
    if loop:
        return {"phone_db": m["phone_db"]}
    return m


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    print(f"{'file':40} {'attack':>7} {'peak':>7} {'phone dB':>9}")
    for p in sys.argv[1:]:
        m = measure(p)
        flag = "  PHONE-INVISIBLE" if m["phone_db"] < PHONE_WARN_DB else ""
        print(f"{p[-40:]:40} {m['attack_s']:>7.2f} {m['peak_s']:>7.2f} {m['phone_db']:>9.1f}{flag}")
