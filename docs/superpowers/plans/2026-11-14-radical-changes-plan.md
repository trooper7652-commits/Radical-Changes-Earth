# Radical changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execution follows the owner's **kitchen workflow** (section "Execution: the kitchen").

## Status and how to resume (update after every task)

- **Status:** build started 2026-11-14 evening. Tasks 0-3 done. Next: Task 4.
- **To resume in a new session:** open `C:\Users\troop\Radical changes\Radical-Changes`, run `git pull`, read this plan and the spec, and continue from the first unticked `- [ ]` step. Ticked boxes and the git log are the source of truth; each finished step is committed and pushed.

**Goal:** Turn 7 frames of NASA SVS 5313 (night lights 2012-2023) into a 27-second song with the owner's six rules, ship it as a ≤30 s demo video, and host a themed website (radicalchanges.earth) with the video plus a live, instrument-pickable version.

**Architecture:** A plain-Java analyzer (standard library only) measures the frames and writes `site/song-data.json` with every musical decision already made. A static website plays that data live with Tone.js in sync with a muted copy of the video, and a render page turns the same data into a WAV that ffmpeg combines with the slowed NASA video into the judged MP4.

**Tech Stack:** Java 21 (`javac`/`java`, no build tool, `java.awt.image`, `javax.imageio`), HTML/CSS/JavaScript, Tone.js (MIT, one exact version pinned from cdnjs; implementer confirms the version exists there), ffmpeg (from the `imageio-ffmpeg` wheel via `uv`), Playwright (`@playwright/cli`, isolated browser), Vercel static hosting.

**Spec:** `C:\Users\troop\Radical changes\decisions\2026-11-14-radical-changes-design.md` (read it with this plan). Owner Q&A history: `decisions/grill-log.md`.

## Key rule (owner, 2026-11-14)

- The key **changes frame to frame**. It is chosen by the same score as the melody: the difference between the main color and each column's average color, scored with HSV weights Hue 50%, Saturation 25%, Value 25%; "score is input, key is output", each key owning an equal slice of the 0-100 score, in the owner's list order.
- **Confirmed (owner, 2026-11-14):** the score picks one of the **12 keys** in the list happiness chose (slice = 100/12 ≈ 8.33 points per key).

## Global Constraints

- All analysis/music logic in **Java**, standard library only, readable, only what is necessary (owner HARD RULE). Website code may be HTML/CSS/JS.
- **No new idea from AI:** implement only the owner's rules in the spec; any musical or design choice not in the spec is a **[builder call]** listed for the owner, never presented as the team's idea.
- Frame times (owner's pick): 0, 3, 6, 9, 12, 15, 18 s of `nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4`.
- Analysis window = display window: crop x 1920-5760, y 0-2160 of the 7680x2160 frame (exactly one world copy, 16:9, keeps the year label and legend on screen) **[builder call]**; printed labels masked for analysis.
- Brightness = HSV value V = max(R,G,B) (0-255). Threshold 127. Full brightness = 255. Neighbours = 8-connected **[builder call]**.
- Scaling: each variable stretched across the 7 frames: `1 + 99*(x-min)/(max-min)`; all equal → 50.
- Cutoffs: happiness ≥ 50 major; uniqueness ≥ 50 short notes; contrast ≥ 50 energetic instruments.
- Timeline: frame i music at 4i to 4i+3 s, transition 4i+3 to 4i+4 s, song 27.0 s; video 0-20.25 s slowed to 0.75×; MP4 ≤ 29.5 s.
- Instruments (modular list): harp, bells, synth, piano, flute, sustain strings. Samples must be free-licensed with the license recorded.
- Every source cited; every AI model used is logged in `SI_LOG.md` as it is used (see the kitchen section).
- Commits on branch `build` of `trooper7652-commits/Radical-Changes`; push at the end of each task (owner approved this plan = approval to commit/push this branch). Merge to `main` and make the repo public only at Task 9, on the owner's go.

## Review Focus

1. **Audio blocked until a click:** browsers refuse sound before a user gesture; section 2 must start audio from the Play button and show a clear state. Test in Task 6.
2. **Video and music drift apart after seek/pause:** the scheduled frame must follow `video.currentTime`, not a free-running clock. Test in Task 6 (seek to 12.5 s → frame 3 is the active frame).
3. **Changing an instrument while playing:** no doubled or stuck notes, no restart. Test in Task 7.
4. **Samples load slowly or fail:** Play stays disabled with a readable "loading sounds" state, and a failed instrument shows an error instead of silence. Test in Task 6.
5. **Keyboard-only and screen-reader users:** every control reachable by Tab, labelled, visible focus, reduced motion respected. Test in Task 8.

---

## File Structure (inside the repo clone `C:\Users\troop\Radical changes\Radical-Changes\`)

```
analyzer/src/radical/Frame.java        load PNG, crop window, mask labels, pixel access
analyzer/src/radical/Measure.java      the six raw measurements
analyzer/src/radical/Scale.java        1-100 stretching, frame score, change size
analyzer/src/radical/MusicRules.java   tempo, key, articulation, instruments, melody, rhythm
analyzer/src/radical/SongJson.java     writes song-data.json (StringBuilder, no library)
analyzer/src/radical/Main.java         frames dir → site/song-data.json + printed table
analyzer/test/radical/SelfCheck.java   assert-based checks on tiny synthetic images
data/frames/f0.png … f6.png + data/frames/SOURCE.md
tools/extract-frames.ps1, tools/render-video.ps1   ffmpeg commands (not project logic)
site/index.html, site/styles.css, site/app.js (player + sync), site/instruments.js (modular list)
site/render.html + site/render.js     offline render of the song to WAV (dev page, not linked)
site/song-data.json (generated), site/media/*.mp4, site/samples/<instrument>/…, site/samples/LICENSES.md
tests/site.spec.mjs                    Playwright checks
README.md, SI_DISCLOSURE.md, SI_LOG.md, CREDITS.md, docs/superpowers/{specs,plans}/
```

Local project root `C:\Users\troop\Radical changes\` gets a `.graphifyignore` excluding `Radical-Changes/data/frames/`, `Radical-Changes/site/media/`, `Radical-Changes/site/samples/`, `*.png`, `*.mp4`, `*.wav`, `node_modules/` so graph updates never send media to a model.

---

### Task 0: Workspace, skills and data

**Files:**
- Create: repo clone, branch `build`, `docs/superpowers/specs/2026-11-14-radical-changes-design.md` (copy), `docs/superpowers/plans/2026-11-14-radical-changes-plan.md` (copy), `SI_LOG.md`, `tools/extract-frames.ps1`, `data/frames/f0.png`…`f6.png`, `data/frames/SOURCE.md`, `.graphifyignore` (local root)

**Interfaces:**
- Produces: `data/frames/f{0..6}.png` = full 7680x2160 frames at 0,3,6,9,12,15,18 s; `$env:FFMPEG` path printed by `tools/extract-frames.ps1`.

- [x] **Step 1:** `gh repo clone trooper7652-commits/Radical-Changes "C:\Users\troop\Radical changes\Radical-Changes"`; `git switch -c build`. Expected: README.md and brainstorm.md present.
- [x] **Step 2:** Install the vetted design skills **project-scoped** into `Radical-Changes/.claude/skills/` exactly as `decisions/skill-vetting.md` says: `emil-design-eng` only (commit 0f2e23b); taste-skill folder copied without its `hooks:` frontmatter block (commit f6b7657); ui-ux-pro-max core folder only, `${CLAUDE_PLUGIN_ROOT}` paths fixed (commit d643997); playwright-cli skill with the `allowed-tools` line removed (commit b217248). Do not install awesome-design-md (reference only). Verify: `git diff --stat` shows only those folders; grep finds no `hooks:` in taste-skill. Add `.claude/` to `.gitignore`.
- [x] **Step 3:** Write `tools/extract-frames.ps1`: download the 5313 MP4 into its own folder under `Radical-Changes/.cache/`, get ffmpeg via `uv run --no-project --with imageio-ffmpeg python -I -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`, extract `-ss {t} -frames:v 1` for t in 0,3,6,9,12,15,18 to `data/frames/f{i}.png`. Write `data/frames/SOURCE.md` (NASA SVS 5313 URL, file name, times, "NASA Scientific Visualization Studio" credit).
- [x] **Step 4:** Run it. Expected: 7 PNGs, each 7680x2160. Verify world period: mean |pixel(x) − pixel(x+3840)| over the frame < 2 (confirms one copy per 3840 px).
- [x] **Step 5:** Create `SI_LOG.md` (table: date, task, model, what it did) and add the Task 0 row. Commit `chore: workspace, frames, vetted skills` and push `build`.

### Task 1: Frame loading and label masks (Java)

**Files:** Create `analyzer/src/radical/Frame.java`, `analyzer/test/radical/SelfCheck.java`

**Interfaces:**
- Produces: `final class Frame { static Frame load(Path png, boolean changeMap); int width(); int height(); boolean isMasked(int x, int y); int rgb(int x, int y); int value(int x, int y); static Frame fromImage(BufferedImage img, Rectangle[] masks); }` (`value` = max(R,G,B)). Constants `YEAR_LABEL_MASKS`, `CHANGE_MAP_MASKS` (`Rectangle[]`, window coordinates). Frames 0-3 use year masks, 4-6 change-map masks.

- [x] **Step 1: failing checks** in `SelfCheck.main` (run with `-ea`):
```java
BufferedImage img = new BufferedImage(4, 2, BufferedImage.TYPE_INT_RGB);
img.setRGB(1, 0, 0x102030);
Frame f = Frame.fromImage(img, new Rectangle[]{ new Rectangle(3, 0, 1, 2) });
assert f.value(1, 0) == 0x30 : "value = max channel";
assert f.isMasked(3, 1) && !f.isMasked(0, 0) : "mask";
```
- [x] **Step 2:** `javac -d analyzer/out analyzer/src/radical/*.java analyzer/test/radical/*.java` → fails (no `Frame`).
- [x] **Step 3:** Implement `Frame`: `load` reads the PNG, crops x 1920-5760 (3840x2160), applies the masks. Find the mask rectangles by saving `analyzer/out/mask-preview-f0.png` and `-f4.png` with masked areas painted red and checking that the year label and the legend bar are fully covered (manager checks the two previews by eye).
- [x] **Step 4:** Compile and `java -ea -cp analyzer/out radical.SelfCheck` → prints `ALL CHECKS PASSED`.
- [x] **Step 5:** Commit `feat(analyzer): frame loading, crop window, label masks`.

### Task 2: The six measurements (Java)

**Files:** Create `analyzer/src/radical/Measure.java`; modify `SelfCheck.java`

**Interfaces:**
- Consumes: `Frame`.
- Produces: `record Raw(double distanceFromRed, double melodyMean, double[] columnScores, double vibrancy, double happiness, double uniqueness, double contrast)`; `static Raw Measure.all(Frame f, int columnGroups)`; `static int[] mainColor(Frame f)`; `static double[] columnScores(Frame f, int groups)` (each 0..1).

Formulas (spec + builder calls), unmasked pixels only:
- `mainColor`: most common color after quantizing each channel to `c/16*16+8` **[builder call: video compression makes exact colors noisy]**.
- `distanceFromRed` = Euclidean RGB distance from `mainColor` to (255,0,0).
- `melodyMean` (the variable used for scaling/change) is measured with 32 column groups **[builder call]**; the melody itself later uses one group per note (Task 3).
- `columnScores`: split width into `groups` equal column groups; each group's average color vs `mainColor` in HSV: `0.50*dH + 0.25*dS + 0.25*dV` with dH = circular hue difference/180, dS, dV in 0..1. `melodyMean` = average of the scores.
- `vibrancy` = mean of (S + V)/2 with S, V in 0..1 (50/50 **[builder call]**).
- `happiness` = 100 − 100 × share(V ≥ 127).
- `uniqueness` = mean V of the largest 8-connected region with V ≥ 127 ÷ max(1, mean V of the ring of pixels within 50 px of that region's bounding box but outside the region) **[builder call]**; no bright region → 1.0.
- `contrast` = count(V = 255 pixels with ≥ 1 V = 255 neighbour) ÷ max(1, count(V < 127)).

- [x] **Step 1: failing checks** (tiny synthetic images built in code):
```java
// happiness: 4x4, 4 pixels V=200, rest 0 → 75.0
// contrast: two adjacent 255 pixels + one isolated 255, 13 dark pixels → 2/13
// distanceFromRed: all-blue image → sqrt(255^2+255^2) ≈ 360.62 (±0.5 after quantizing)
// vibrancy: all-black → 0.0 ; all pure red → 1.0
// uniqueness: uniform gray 100 → 1.0 ; 3x3 white block on black → > 50
// columnScores: image equal to its main color → every score 0.0
```
- [x] **Step 2:** Compile → fails (no `Measure`).
- [x] **Step 3:** Implement `Measure` (flood fill with an `int[]` queue, no recursion).
- [x] **Step 4:** SelfCheck passes; also run `Measure.all` on `f0.png` and print the raw values. Expected near the spec's measured table (happiness ≈ 99.88, contrast ≈ 2.5e-5) after allowing for the new crop window.
- [x] **Step 5:** Commit `feat(analyzer): six measurements`.

### Task 3: Scaling, change size and music rules (Java)

**Files:** Create `analyzer/src/radical/Scale.java`, `analyzer/src/radical/MusicRules.java`; modify `SelfCheck.java`

**Interfaces:**
- Consumes: `Raw` ×7.
- Produces: `static double[] Scale.stretch(double[] values)`; `static double[] Scale.frameScores(double[][] scaledByVariable)`; `static double[] Scale.changes(double[] frameScores, double amplify)` (index 0 → 0, others `min(100, max(1, |s[i]-s[i-1]|*amplify))`); `static final double AMPLIFY = 1.5` (owner tunes by ear);
  `record FramePlan(int index, double bpm, String mode, String key, boolean shortNotes, String melodyInstrument, String bassInstrument, List<Note> notes)`; `record Note(double time, String pitch, double duration, String voice)`;
  `static FramePlan MusicRules.plan(int index, double[] scaled, double change, double[] columnScores)`;
  `static int MusicRules.keyIndex(double melodyScaled, String mode)` → owner's key rule (see "Key rule"): `min(11, floor((melodyScaled-1)/99*12))` into the owner's 12-key list for `mode`.

Rules (spec):
- `bpm` = 60 + (avg(vibrancy, change) − 1) × 100/99; frame 0 uses vibrancy alone.
- `mode` = happiness ≥ 50 ? major : minor; `key` = owner's list (spec section 6) at `keyIndex(melodyScaled, mode)`; the key changes frame to frame.
- `shortNotes` = uniqueness ≥ 50; note length 0.25 beat if short, 0.95 beat if long **[builder call]**.
- Instruments: contrast ≥ 50 → melody synth, bass piano; else short → harp/bells, long → flute/sustain strings.
- Melody: notes = floor(3 × bpm / 60), one per beat; recompute `columnScores` with that many groups; stretch all column scores across all 7 frames to 0..1 **[builder call, matches the owner's stretch choice]**; pitch = scale degree `min(13, floor(score × 14))` of two octaves of the key's major or natural-minor scale starting at octave 4.
- Bass: the key's tonic, octave 2, on beat 1 and every 4th beat after **[builder call]**.
- Rhythm: note k is pushed half a beat late when `(k * 37) % 100 < distanceFromRedScaled` **[builder call: deterministic "more offbeat"]**.
- Absolute times: frame i notes start at 4i s; nothing starts after 4i + 3 s.

- [x] **Step 1: failing checks:**
```java
assert Arrays.equals(Scale.stretch(new double[]{2,4,6}), new double[]{1,50.5,100});
assert Arrays.equals(Scale.stretch(new double[]{7,7,7}), new double[]{50,50,50});
// bpm: vibrancy 1 & change 1 → 60 ; 100 & 100 → 160
// mode: happiness 49 → "minor" ; 50 → "major"
// instruments: contrast 50, uniqueness 10 → synth/piano ; contrast 10, uniqueness 80 → harp/bells
// notes at 120 bpm → 6 melody notes, last start ≤ 4i+3
// score 0.0 → scale degree 0 ; 0.999 → 13
// keyIndex: melodyScaled 1 → 0 (C major / A minor); 100 → last key of the list
```
- [x] **Step 2:** Compile → fails.
- [x] **Step 3:** Implement `Scale` and `MusicRules`.
- [x] **Step 4:** SelfCheck passes.
- [x] **Step 5:** Commit `feat(analyzer): scaling, change size, music rules`.

### Task 4: song-data.json and the run command (Java)

**Files:** Create `analyzer/src/radical/SongJson.java`, `analyzer/src/radical/Main.java`, `analyzer/run.ps1`; generates `site/song-data.json`

**Interfaces:**
- Produces `site/song-data.json`:
```json
{"version":1,"songSeconds":27,"frameSeconds":3,"transitionSeconds":1,"videoSpeed":0.75,
 "frames":[{"index":0,"videoTime":0,"startTime":0,"label":"2012",
   "raw":{"distanceFromRed":0,"melody":0,"vibrancy":0,"happiness":0,"uniqueness":0,"contrast":0},
   "scaled":{"distanceFromRed":0,"melody":0,"vibrancy":0,"happiness":0,"uniqueness":0,"contrast":0},
   "change":0,"bpm":0,"mode":"major","key":"C","shortNotes":true,
   "melodyInstrument":"harp","bassInstrument":"bells",
   "notes":[{"time":0.0,"pitch":"C4","duration":0.12,"voice":"melody"}]}],
 "sources":["https://svs.gsfc.nasa.gov/5313/"]}
```
  Frame labels: 2012, 2017, 2022, 2023, "Change 2012-2023" ×3.

- [ ] **Step 1: failing check:** `SongJson.write` on a 1-frame `FramePlan` produces text that starts with `{"version":1` and contains `"pitch":"C4"`; a string with a quote is escaped.
- [ ] **Step 2:** Compile → fails.
- [ ] **Step 3:** Implement `SongJson` (StringBuilder) and `Main` (`java -cp analyzer/out radical.Main data/frames site/song-data.json`; prints one table row per frame: raw, scaled, change, bpm, key, articulation, instruments).
- [ ] **Step 4:** `analyzer/run.ps1` compiles, runs SelfCheck, then Main. Expected: `ALL CHECKS PASSED`, 7 table rows, a valid JSON (check with `python -I -c "import json;json.load(open('site/song-data.json'))"`).
- [ ] **Step 5:** **Head-chef gate 1:** Fable reviews `analyzer/` against spec section 6 → YES/NO. Commit `feat(analyzer): song-data.json`. Show the owner the printed table.

### Task 5: Instrument sounds

**Files:** Create `site/samples/<instrument>/…`, `site/samples/LICENSES.md`, `site/instruments.js`

**Interfaces:**
- Produces: `export const INSTRUMENTS = { harp:{...}, bells:{...}, synth:{...}, piano:{...}, flute:{...}, "sustain strings":{...} }` where each entry is `{ label, kind: "sampler"|"synth", urls?, baseUrl?, release }`; `export function createInstrument(name, Tone) → Promise<Tone.Instrument>`.

- [ ] **Step 1:** Download only free-licensed samples (candidates: VSCO 2 Community Edition, CC0, for harp/bells(glockenspiel)/flute/strings; Salamander Grand Piano, CC-BY 3.0, for piano), at most ~8 notes per instrument (Tone.Sampler fills the gaps). Record source URL, author, license, and file list in `LICENSES.md`. Synth uses `Tone.PolySynth` (no samples). Verify each license from the source page, not memory; if one fails, stop and report to the manager.
- [ ] **Step 2:** Write `instruments.js` (modular: adding an instrument = one entry).
- [ ] **Step 3:** Verify: total samples ≤ 15 MB; every folder has a LICENSES.md row.
- [ ] **Step 4:** Commit `feat(site): licensed instrument samples`.

### Task 6: Live player synced to the video

**Files:** Create `site/app.js`, minimal `site/index.html` test harness section, `tests/site.spec.mjs`, `site/media/nasa-5313-slowed.mp4` (muted visuals, from Task 7's script)

**Interfaces:**
- Consumes: `song-data.json`, `INSTRUMENTS`, `createInstrument`.
- Produces: `class SongPlayer { constructor(video, songData, Tone); async load(); async play(); pause(); setInstrument(voice, name); activeFrameIndex(); }`. Music follows `video.currentTime`: on play/seek, schedule notes from the current song time; on pause, stop.

- [ ] **Step 1: failing Playwright tests** (fresh isolated browser, local static server `npx http-server site -p 8080`):
  `play-starts-audio`: clicking Play sets a `data-state="playing"` attribute and `Tone.context.state === "running"`.
  `seek-follows-video`: set `video.currentTime = 12.5` → `activeFrameIndex() === 3`.
  `loading-state`: while samples load, Play is `disabled` and the status text reads "Loading sounds…"; a forced 404 shows "Couldn't load <instrument>".
- [ ] **Step 2:** Run `npx playwright test tests/site.spec.mjs` → fails.
- [ ] **Step 3:** Implement `SongPlayer` (Tone.Part per frame, rescheduled from `currentTime` on `play`/`seeked`).
- [ ] **Step 4:** Tests pass; no console errors.
- [ ] **Step 5:** Commit `feat(site): live player synced to video`.

### Task 7: Render the song and build the judged MP4

**Files:** Create `site/render.html`, `site/render.js`, `tools/render-video.ps1`; produce `site/media/radical-changes-30s.mp4`, `site/media/nasa-5313-slowed.mp4`, `site/media/radical-changes-song.wav`

**Interfaces:**
- Consumes: `song-data.json`, `INSTRUMENTS` (default instruments per frame).
- Produces: `renderSong(songData) → Promise<Blob>` (WAV, 44.1 kHz, `Tone.Offline`, 27.0 s); the same note-scheduling function `scheduleFrame(frame, instrumentsByVoice, Tone, offset)` used by `SongPlayer` (move it into `app.js` exports so both share it).

- [ ] **Step 1: failing tests:** `render-length`: `renderSong` blob decodes to 27.0 ± 0.05 s. `instrument-swap-midplay` (Review Focus 3): during playback, `setInstrument("melody","piano")` keeps `data-state="playing"`, produces no duplicate scheduled events (count of active Tone.Part events unchanged).
- [ ] **Step 2:** Run → fails.
- [ ] **Step 3:** Implement render page (button "Render WAV" downloads `radical-changes-song.wav`); write `tools/render-video.ps1`: crop 1920:… window x=1920 w=3840 from the 5313 MP4 0-20.25 s, `setpts=PTS/0.75`, scale 1920x1080, H.264; append a 2.5 s credit card (black, drawtext with `C:/Windows/Fonts/arial.ttf`: "Visuals: NASA Scientific Visualization Studio, SVS 5313 · Music: Radical changes"); mux the WAV (AAC); metadata `title=Radical changes`, `comment=Music generated by code written with AI assistance; see SI_DISCLOSURE.md`. Also write the muted 27 s visuals file for the website.
- [ ] **Step 4:** Tests pass; `ffprobe` shows duration ≤ 29.5 s, 1920x1080, one audio stream, the comment tag. Manager watches once: each frame's music starts when that frame is on screen.
- [ ] **Step 5:** Commit `feat: rendered song and 30-second demo video`. **Owner checkpoint:** owner listens, tunes `AMPLIFY` if wanted (rerun Tasks 4 and 7).

### Task 8: Website design and build (radicalchanges.earth)

**Files:** Modify `site/index.html`, create `site/styles.css`, site graphics (SVG/CSS only, original), `DESIGN.md`

**Interfaces:**
- Consumes: `SongPlayer`, `INSTRUMENTS`, media files.
- Produces: final page. Front page (hero) carries the owner's chosen quote, exact text: "The important thing isn't can you read music, it's can you hear it. Can you hear the music, Robert?" credited exactly as: "— Niels Bohr, as portrayed in *Oppenheimer* (2023)" (owner confirmed; also listed in CREDITS.md). Section 1: the 30 s MP4 (sound on, user starts it). Section 2 (scroll): muted visuals + `SongPlayer` + instrument picker (melody and bass `<select>` from `INSTRUMENTS`; a choice replaces the contrast rule, note lengths unchanged). Also: "How the music is made" (the six rules in plain words), per-frame text descriptions of what is heard, Sources/Credits, AI disclosure, `<meta name="radical-changes:ai-assistance" content="…">`.

- [ ] **Step 1:** Run the impeccable skill (with frontend-design, taste-skill, emil-design-eng) to produce **2-3 visual directions** themed on light pollution and the night sky (mockup screenshots). **Owner picks one** (the look is the owner's call). Record the pick in `DESIGN.md`.
- [ ] **Step 2: failing tests** (Review Focus 5): `keyboard-reach`: Tab reaches skip link, video 1 controls, Play, both selects, in that order with visible focus. `labels`: every button/select has an accessible name. `reduced-motion`: with `prefers-reduced-motion: reduce`, decorative animations have `animation: none`. `one-plays`: starting video 1 pauses section 2 and vice versa. `no-overflow`: no horizontal scroll at 360, 768, 1440 px.
- [ ] **Step 3:** Run → fail.
- [ ] **Step 4:** Build the page per `DESIGN.md`; animations eased (transform/opacity only); then run web-design-guidelines review and fix findings.
- [ ] **Step 5:** Tests pass; Playwright screenshots at 3 widths for the owner. **Head-chef gate 2:** Fable reviews site + video against the spec and the judging criteria → YES/NO. Commit `feat(site): themed website`.

### Task 9: Docs, deploy, final check

**Files:** Create `README.md` (what it is, how the six rules work, how to run `analyzer/run.ps1`, sources), `SI_DISCLOSURE.md` (built from `SI_LOG.md`: every Claude model and every free model by name, what each did, what was not AI: the idea, the rules, the frame choice), `CREDITS.md`, tester post draft `docs/tester-request.md`

- [ ] **Step 1:** Write the docs. The project-page description is written by the **owner** (Claude may proofread; logged).
- [ ] **Step 2:** Deploy `site/` to Vercel (manager runs it); owner points radicalchanges.earth DNS at Vercel in the WordPress.com domain settings (owner's login); verify `https://radicalchanges.earth` loads both videos with no login.
- [ ] **Step 3: Final pre-submit check** (each line checked and ticked in `docs/final-check.md`): no pre-hackathon work (commit dates all after 2026-11-14 09:00 CST); SI disclosure complete (every row of `SI_LOG.md` covered); MP4 comment tag + description label present; every source cited (NASA SVS 5313, Wikipedia "Light pollution" + linked sources, sample libraries, Tone.js); 5313 (Resources tab) used; MP4 ≤ 30 s, public link, no login; all English; team registered to Chicago; no unlicensed sounds or images; "Confirm All Work is Original" can be ticked truthfully.
- [ ] **Step 4:** Owner merges `build` → `main`, makes the repo public, submits on the Space Apps site, and posts the tester request (r/Blind, AppleVis forums, Mastodon #Blind #A11y, NFB/ACB communities; check each site's rules first).
- [ ] **Step 5:** Manager updates the graph/vault (`.graphifyignore` keeps media out) and memory.

---

## Execution: the kitchen

| Task | Who cooks | Who reviews |
|---|---|---|
| 0 Workspace, skills, data | Prep cook (Haiku) runs clone/extract; manager installs skills (needs judgment on the vetting rules) | Manager |
| 1 Frame + masks | Line cook (Sonnet) | Manager (checks mask previews by eye) |
| 2 Measurements | Line cook (Sonnet); **head chef (Fable)** writes the uniqueness flood fill and ring | Manager |
| 3 Scaling + music rules | **Head chef (Fable)**: the hardest logic (rules interact; mistakes are audible) | Manager |
| 4 JSON + Main | **Free line cook** (`auto:line_cooks-coding`) for `SongJson` string building from the exact schema; Sonnet for `Main` | Manager; **Head chef gate 1** |
| 5 Sounds | Prep cook (Haiku) downloads; manager verifies licenses | Manager |
| 6 Player + sync | **Head chef (Fable)**: timing sync with seek/pause is the riskiest code | Manager |
| 7 Render + MP4 | Line cook (Sonnet) for render.js; **free line cook** for `render-video.ps1` from the exact ffmpeg blueprint | Manager |
| 8 Website | Manager runs impeccable/design skills; Sonnet builds; **free line cook** for repetitive markup (credits list, per-frame description blocks) | Manager; **Head chef gate 2** |
| 9 Docs, deploy, check | Free line cook drafts README/CREDITS skeletons from exact lists; manager writes SI_DISCLOSURE (accuracy matters), deploys | Manager; final check by head chef |
| All test runs, log skims | **Free prep cook** (`auto:prep_cook_checks`) summarizes test output; Haiku if it fails | Manager reads the real output |

Rules:
- Free cooks get exact blueprints, code only, run in an isolated folder with no secrets: `CLAUDE_CONFIG_DIR="$HOME/.claude/profiles/freellm" claude -p "<blueprint>" --model auto:line_cooks-coding --tools "Read,Edit,Write,Glob,Grep" --permission-mode acceptEdits --output-format json`. One fix attempt, then Sonnet redoes it. Never send them the owner's grill log or private notes (free tiers may train on prompts). Verify their work from diffs and tests, never their summary.
- Manager (Opus) runs every command using the owner's logins (git push, gh, Vercel).
- Head chef (Fable 5.2) cooks the hardest code (Tasks 2-uniqueness, 3, 6), takes any problem a cook fails twice, and gives the two YES/NO gates. When the head chef cooked a task, a fresh Sonnet reviewer checks it before the manager's review, so no one reviews only their own work.
- **Every dispatch adds a row to `SI_LOG.md`** (model name as reported by the tool, task, what it produced) so the disclosure is exact.
- No Google models or credits.
- No machine-learning model is in the product now (happiness is a pixel share), so the "owner decides what the happiness model learns from" reminder does not apply unless that changes.

## Owner actions (in order)

1. Answer the key-choice blocker (before Task 3).
2. Pick one of the 2-3 visual directions (Task 8).
3. Listen to the song; tune `AMPLIFY` if wanted (Task 7).
4. Write the project-page description (Task 9).
5. Point radicalchanges.earth DNS at Vercel; merge to main; make the repo public; submit; post the tester request (Task 9).

## Time budget (deadline Sun 2026-11-15 11:59 PM CST)

Tasks 0-4 tonight; Tasks 5-7 by Sunday morning; Task 8 by Sunday afternoon; Task 9 by Sunday 8 PM, leaving ~4 h of slack before the deadline.
