# claude-faceless-shorts-creator

**A faceless YouTube-Shorts factory you drive with [Claude Code](https://claude.com/claude-code).**
You describe the video and `/make-short` builds it — 100% code, a
[Remotion](https://remotion.dev) composition, no footage, no stock:

> *"make a short about the ×11 trick"*

The backbone: ElevenLabs voice with **word-exact synced captions**,
frame-by-frame QA at phone scale, a reusable self-growing SFX/music library, seamless
frame-0==last-frame loops, and no dated engagement-CTA outros.

## 📖 Read the guide

I wrote up the whole system on my site, including the six-beat grammar that decides whether a
40-second short is worth finishing:
**[Make Faceless YouTube Shorts With Claude Code](https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=body)**

Free to read, no login. More build guides at
**[learnwithhasan.com/guides](https://learnwithhasan.com/guides/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=body)**.

## The example videos (more coming)

**TSX shorts** (`shorts/`) — 11 complete productions; each folder has the script, beats
contract, and SFX cue sheet, and the committed composition renders the exact video:

| # | Niche | Title / hook |
|---|---|---|
| 1 | Chess | The 4-Move Checkmate — Punished |
| 2 | Math | The ×11 Trick |
| 3 | Algorithms | Bubble vs Quick: The Race |
| 4 | Dev tips | `git reflog` undoes any mistake |
| 5 | Probability | Monty Hall, Finally Intuitive |
| 6 | Excel | Excel Reads Your Mind (Flash Fill / Ctrl+E) |
| 8 | Cybersecurity | The URL That Isn't PayPal |
| 9 | Music theory | The 4 Chords In Every Hit |
| 10 | Money math | The 1% Fee That Eats 24% Of Your Retirement |
| 11 | Geography | The Map Lied To You |
| 12 | Physics | Astronauts Aren't Weightless. They're Falling. |

Rendered videos aren't committed (they're reproducible from the repo); links to published
versions will be added here as they go live.

## How a short gets made

```
topic ──▶ script.md + beats.json      the beat grammar: HOOK (frame 0 = the thumbnail)
                │                      → SETUP → QUIZ → REVEAL → TWIST → seamless LOOP
                ▼
        the visuals                    the TSX composition (one Remotion timeline)
                │
                ▼
        frame-by-frame QA              Claude renders PNGs at phone scale and READS them
                │
                ▼
        gen_voice.py                   ElevenLabs TTS per line → REAL per-word timestamps
                │                      → captions highlight on the exact spoken word
                ▼
        sfx-plan.json + mix_sfx.py     library-first sound design, audition mix, your ear
                │                      is the final gate (optional music bed: mix_music.py)
                ▼
        shorts/<project>/output/*-sfx.mp4
```

Three Claude Code **skills** encode the craft:

- **`/make-short`** — the TSX pipeline: hook grammar, no-CTA outros, caption safe areas,
  Sequence-local frame math, loop-into-intro endings.
- **`/vidtsx-2d-generator`** — the TSX authoring rules that keep Remotion renders from crashing.
- **`/suggest-sfx`** — taste-encoded sound design: function-first cues, layered hero moments,
  measured audibility (RMS-diff, not hope), a library that compounds across videos.

The official [Remotion skills](https://github.com/remotion-dev/skills) (`remotion-*`) are
installed alongside as general Remotion reference (pinned in `skills-lock.json`).

`brand/brand.md` is the style contract (palette, type, motion, SFX taste) — swap it for your own
brand and every future short follows it.

## Quickstart

Requirements: [Claude Code](https://claude.com/claude-code) · Node 18+ · Python 3.10+ ·
`ffmpeg` on PATH · an [ElevenLabs](https://elevenlabs.io) key (voice/SFX/music). No pip
installs — the Python tools are stdlib-only.

```bash
git clone https://github.com/hassancs91/claude-faceless-shorts-creator
cd claude-faceless-shorts-creator
cp .env.example .env          # add your keys
cd remotion && npm install && npm run gen && cd ..

claude                        # open the repo in Claude Code, then:
```

> **make a short about &lt;your topic&gt;**

…or rebuild an example: *"re-render short-5 and regenerate its voice"*.

To just explore the compositions visually: `cd remotion && npm run studio`.

## Repo layout

```
.claude/skills/   the three repo skills (this is where the "editor" lives) + remotion-* skills
tools/            Python: gen_voice, gen_sfx, gen_music, mix_sfx, mix_music, gen_chords
remotion/         the Remotion project — shared kits in src/lib/,
                  one folder per video in src/shots/
media/library/    reusable assets: SFX clips + music beds (catalogued, loudness-normalized)
media/projects/   media for one specific video (created on demand)
shorts/           the 11 TSX example productions
brand/brand.md    the style contract — make it yours
PRODUCED.md       log of the shorts produced (title, format, date, status)
```

## License

MIT — see [LICENSE](LICENSE). Bundled SFX/music clips were generated by the repo author
(ElevenLabs) and are redistributed here; per-clip provenance is recorded in
`media/library/*/catalog.json`.

<!-- lwh-footer -->

---

## 📘 The free book

This repo is one thing I built with AI. The book is the system underneath it.

**[Vibe Engineering Blocks](https://learnwithhasan.com/blocks/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer)** is my free 74-page book.
47 building blocks for shipping real apps with AI. One block per page, each with the exact
prompt to hand your AI.

Built by **[Hasan Aboul Hasan](https://learnwithhasan.com/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer)**. I build real products with AI and
write down exactly how.
[Guides](https://learnwithhasan.com/guides/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer) &nbsp;·&nbsp;
[YouTube](https://www.youtube.com/@HasanAboulHasan) &nbsp;·&nbsp;
[Community](https://learnwithhasan.com/community/?utm_source=github&utm_medium=readme&utm_campaign=claude-faceless-shorts-creator&utm_content=footer)
