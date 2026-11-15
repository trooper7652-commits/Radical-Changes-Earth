# Cloud finish plan: Radical changes (runs 2026-11-15, 4:20 AM CST)

You are the **manager** (Claude Opus) of a NASA Space Apps 2026 entry, "Radical changes" (challenge: The Earth Information Jukebox). Submission closes **Sun 2026-11-15 11:59 PM CST**. Work on branch **`cloud/finish`** (create it from `build`), push often, and when done open a pull request **into `build`** (never touch `main`, never make the repo public, never deploy, never change DNS).

## Read first (authority, in order)

1. `docs/superpowers/specs/2026-11-14-radical-changes-design.md`: the team's design. **Section 15 (song v2)** plus this plan's "Song v3" section override older parts.
2. `docs/decisions/grill-log.md`: every decision the team made (rounds 1-14). The team's ideas are theirs: **never invent project ideas or musical/scientific rules**. Where a detail is undefined, choose the simplest reading, keep it as one named constant, and list it as a "builder call" in the status file.
3. `docs/superpowers/plans/2026-11-14-radical-changes-plan.md` (original plan; Tasks 0-8 done) and `SI_DISCLOSURE.md` / `SI_LOG.md`.

## Kitchen workflow (the team's standing rule; Fable replaced by Opus)

| Role | Model | Use for |
|---|---|---|
| Head chef | Claude **Opus, effort max** (Agent tool `model: opus`, `effort: max`) | hardest code (song v3 Java + player), the final YES/NO gate |
| Manager | you (Opus session) | blueprints, reviewing every diff, running commands, git push, the PR, the status file |
| Line cook | Claude **Sonnet** (`model: sonnet`) | website code, docs |
| Prep cook | Claude **Haiku** (`model: haiku`) | running tests, screenshots, log skims, checklists |

No free models in the cloud. The team's Claude usage is nearly used up, so **keep Claude use minimal**: small exact blueprints, no redundant reviews, and stop when done. Every model used gets a row in `SI_LOG.md`.

## Hard rules

- Java: standard library only, simple and readable, only what is necessary (team rule). Website: plain HTML/CSS/ES-module JS, Tone.js 15.1.22 from cdnjs.
- Sounds only from `site/samples/` (licenses in `site/samples/LICENSES.md`). The judged video's default instruments must stay CC0. Choir, whistle and pan pipes (FluidR3) are picker-only.
- Never let tests overwrite `site/media/`. The rendered song/video are made deliberately (step C2).
- AI disclosure: the frames (NASA SVS 5313), the instrument recordings and the music are NOT AI-made. The music comes from the team's algorithm, and the code was written with AI assistance. Keep `SI_DISCLOSURE.md` accurate.

## Status file (checkers read it)

Append one line to **`docs/cloud-status.md`** at the start, after each step, and at the end, then commit and push it:
`2026-11-15T10:25Z | C1 song v3 | started` (use `date -u +%Y-%m-%dT%H:%MZ`). The final line must be `... | ALL | DONE (PR <url or "PR not possible: reason">)`.

## Steps

### C1. Song v3 (head chef, Opus max). Skip if `grep -q panBalafon analyzer/src/radical/MusicRules.java` already succeeds and SelfCheck passes.
The team's requests (grill-log rounds 13-14): notes overlap more; bagpipes replaced; oboe added.
- **Overlap:** after a frame's notes are built, per voice sorted by time, each note with a next note in the same voice gets `duration = max(duration, (next.time - time) + OVERLAP_BEATS * 60 / bpm)`, with `OVERLAP_BEATS = 0.75`. The last note is unchanged.
- **Louder change voices:** change-voice dB = `min(-3, oldDb + CHANGE_VOICE_BOOST_DB)`, with `CHANGE_VOICE_BOOST_DB = 10`.
- **Replace bagpipes** with two voices playing the same notes together: `panHang` (instrument `handpan`, pitches moved by octaves into A3..D5) and `panBalafon` (instrument `balafon`, into C#3..F5). Same times, durations and volumes the bagpipes had.
- **Oboe** voice `oboe` doubles the melody, but **only at its recorded pitches, never stretched**: for each melody note whose pitch class is D, F or A#, add an oboe note at that pitch class in the nearest recorded octave among A#2, D3, F3, A#3, D4, F4, A#4, D5, F5. No other melody notes get an oboe note.
- JSON per frame: `panHangInstrument`, `panBalafonInstrument`, `oboeInstrument` (null when silent); remove `bagpipesInstrument`.
- JS: `VOICES` in `site/app.js` = melody, bass, handpan, panHang, panBalafon, stringBass, oboe. Add `oboe` (urls As2,D3,F3,As3,D4,F4,As4,D5,F5 → keys "A#2"…) and `balafon` (Cs3,F3,C4,F4,C5,F5) entries to `site/instruments.js`; the files are already in `site/samples/`.
- Tests: SelfCheck covers each rule with exact values; the Playwright suite passes.
- Regenerate `site/song-data.json` with `analyzer/run.ps1`, or on Linux the same commands: `javac -d analyzer/out analyzer/src/radical/*.java analyzer/test/radical/*.java && java -ea -cp analyzer/out radical.SelfCheck && java -cp analyzer/out radical.Main data/frames site/song-data.json`.

### C2. Re-render the media (manager runs it)
WAV: serve `site/` and drive `render.html` with Playwright to save `radical-changes-song.wav` (see the render-length test), then copy it to `site/media/`. MP4: run `tools/render-video.ps1` (held mode). If `pwsh` is unavailable, run the same ffmpeg steps directly (get ffmpeg with `pip install imageio-ffmpeg`). Check that the WAV is 27.0 s with peak < 32767, that the MP4 is ≤ 29.5 s at 1920x1080 with one audio stream and the comment tag, and that the held-frame alignment check passes.

### C3. Website polish (line cook Sonnet, using the design skills in `.claude/skills/`)
Use `emil-design-eng` (motion), `design-taste-frontend` (taste), `ui-ux-pro-max`, `unslop` (avoid the generic AI look; keep its CC-BY credit), and `playwright-cli` (fresh isolated browser only). Keep direction B "Horizon Glow" (`DESIGN.md`). Required (the team's words in grill-log rounds 10-13):
- The site must capture the judges' attention, be extremely memorable, and jump out without trying too hard. **Show, don't tell** the theme: bridging NASA's Earth Information Center and people with low vision; accessible, engaging, multi-sensory; uniting scientific research.
- **Easy-to-read font:** Atkinson Hyperlegible (Google Fonts) for body text and UI, comfortable sizes (≥ 18 px body), high contrast. The display face is kept only for big headings if it stays readable.
- **Dedicated, smooth animations per element** (transform/opacity only, purposeful, `prefers-reduced-motion` honored).
- **Instrument picker:** one select per voice (melody, bass, handpan, panHang "Hang drum", panBalafon "Balafon", stringBass "String bass", oboe), each defaulting to "Song's choice". Options: sustain strings, harp, bells, string bass, synth, piano, pipe organ, guitar, handpan, balafon, oboe, bagpipes, choir, whistle, pan pipes. No drums. Keyboard focus stays on the select while sounds load.
- Per-frame descriptions mention every voice that plays.
- **Footer line** (exact): "Site graphics and code made with AI assistance. The music is generated by the team's algorithm from NASA data; the instrument sounds are real recordings."
- Keep everything accessible (one h1, labels, focus, live region) and keep all existing tests passing. Add tests for the picker voices and the footer. Save screenshots at 1440/768/390 to `design/final/`.

### C4. Gate 2 (head chef, Opus max)
Review the site, song and video against the spec, the grill log and the five judging criteria (Impact, Creativity, Validity, Relevance, Presentation): YES or NO with fixes. Fix NO findings with the line cook, then re-gate (at most 2 rounds).

### C5. Docs (line cook Sonnet; the manager checks the disclosure)
- `README.md`: what it is, how the six rules work, how to run the analyzer and the site, and the sources.
- `CREDITS.md`: NASA SVS 5313 (NASA's Scientific Visualization Studio), every sample library from `LICENSES.md` (VSCO 2 CE, VCSL, FreePats, Salamander Grand Piano CC BY 3.0, FluidR3 GM credit), Tone.js (MIT), the quote credit "— Niels Bohr, as portrayed in *Oppenheimer* (2023)", Wikipedia "Light pollution", the unslop credit.
- Update `SI_DISCLOSURE.md` and `SI_LOG.md` (add the cloud models).
- `docs/tester-request.md`: a short anonymous request for blind/low-vision listeners (no personal data kept), plus where to post it (r/Blind, AppleVis forums, Mastodon #Blind #A11y, NFB/ACB communities; check each site's rules first).
- `docs/final-check.md`: the pre-submit checklist (spec section 12), each line marked done / OWNER (deploy to Vercel, point radicalchanges.earth DNS at Porkbun, make `Radical-Changes-Earth` public, submit, post the tester request).

### C6. Finish
Run the full test suite once. Push `cloud/finish`, open a PR into `build` titled "Cloud finish: song v3, website polish, docs" listing what changed, the builder calls, and the OWNER items. Write the final status line. Stop.
