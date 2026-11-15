# Rework plan: Radical changes (2026-11-15, before the 11:59 PM CST deadline)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the owner's 2026-11-15 answers to PR #1: notes overlap by 1 beat, no Handpan picker, the piano credited in the video. Then do the song and website rework the owner describes (Part B).

**Architecture:** One Java constant and its self-checks, small edits to the website picker, one new credit line in the video script, then a re-render of the WAV and MP4. Everything goes on branch `cloud/finish`, so PR #1 (into `build`) picks it up.

**Tech Stack:** Java (standard library), plain HTML/CSS/ES-module JS with Tone.js 15.1.22, Playwright tests, PowerShell + ffmpeg video script.

**Spec:** `docs/superpowers/specs/2026-11-14-radical-changes-design.md` (section 15), `docs/decisions/grill-log.md` rounds 11-15, `docs/superpowers/plans/2026-11-15-cloud-finish-plan.md` (song v3).

## Owner answers this plan implements (grill-log round 15)

- Notes overlap by **1 beat** (was 0.75).
- **Balafon** is the second pan instrument (confirmed, no change).
- **Hooktheory** is the source of the key order (confirmed, no change).
- **Remove the Handpan picker.** It is the voice that only joins the harp, and no frame of this song uses the harp. The "Handpan (hang)" *sound* stays in every list, because it is the hang drum's sound.
- **Credit the piano.** It is CC BY 3.0 and plays in frames 1-4 of the judged video. The site, CREDITS.md and LICENSES.md already credit it, but the video's end card does not.
- The song and the website still need rework. The owner's answers come first (Part B).

## Global Constraints

- The team owns every idea and rule. Claude never invents musical, scientific or design ideas. Where a detail is open, pick the simplest reading and list it as a builder call.
- Java: standard library only, simple, only what is necessary.
- The free models (FreeLLMAPI `auto:line_cooks-coding`) write the code. If one fails twice, pin a stronger free model. Claude codes only if absolutely necessary.
- Tests never write to `site/media/`. The media is re-rendered on purpose, in Task 4.
- Every model used gets a row in `SI_LOG.md`.
- Branch `cloud/finish`. Commit and push after each task. Never touch `main`, never make the repo public, never deploy production or change DNS without the owner.

## Review Focus

- Longer overlaps mean more notes sounding at once, so the WAV could clip. Task 4 checks that the peak is below 32767.
- If a frame ever has a handpan part, removing the select must not break playback. The existing `handpan-voice` test in `tests/site.spec.mjs` must still pass.
- Keyboard focus and labels for the six remaining selects are covered by the existing tests in `tests/page.spec.mjs`, which must still pass.
- The longer piano credit line must fit on the 1920 px end card. Task 3 grabs a frame and looks at it.
- One frame's sound may carry into at most one following frame (round 12). Overlap only lengthens notes inside a frame's own voice, so the last note of each voice keeps its length.

## Execution: the kitchen

| Task | Who |
|---|---|
| 0, 4, 6 | Manager (Opus session): commands, renders, git, Vercel |
| 1, 2, 3 | Free line cook from this plan's exact steps. On two failures, a pinned stronger free model. Sonnet only if both fail |
| 5 checks | Prep cook (Haiku) runs the full suite and reports |
| 5 gate | Head chef (Opus, effort max): one YES/NO on the whole diff |

---

### Task 0: Record the owner's answers (manager)

**Files:** Modify `docs/decisions/grill-log.md` (append), `SI_LOG.md` (append rows as work happens)

- [ ] Append `## Round 15: PR #1 answers (owner, 2026-11-15)` with the six bullets from "Owner answers" above, in the owner's words.
- [ ] Commit `docs: record owner round 15 answers` and push.

### Task 1: Overlap 1 beat

**Files:**
- Modify: `analyzer/src/radical/MusicRules.java:38`
- Modify: `analyzer/test/radical/SelfCheck.java` (change-voice block about lines 180-186, `checkSongV3` about lines 217-235)
- Modify: `README.md:22`

- [ ] **Step 1: Update the self-checks first.** In `checkSongV3`:
  - `assert MusicRules.OVERLAP_BEATS == 1.0 : "overlap 1 beat";`
  - The melody notes k = 0..4 last `2.0 * beat`. The handpan still equals the melody.
  - Bass note 0 lasts `5.0 * beat`.
  - The last notes are unchanged at `0.5 * beat`.
  - Long notes keep `2.85` beats.
  - Change every "0.75 beat" comment to "1 beat" and "1.75 beats" to "2 beats".

  In the change-voice loop (`for (int j = 0; j < 3; j++)`), replace the duration part of the assert with:
  ```java
  double expected = j < 2 ? Math.max(from.duration(), hang.get(j + 1).time() - from.time() + MusicRules.OVERLAP_BEATS * 60 / changed.bpm())
                          : from.duration();
  ```
  Then check `Math.abs(n.duration() - expected) < 1e-9` (the time and volume checks stay). The reason: a change-voice note rings 1 beat past the next note of its own voice, which can be longer than the melody note it copies. Update the comment above the loop to say so.
- [ ] **Step 2: Run the checks and expect a failure.** `powershell -ExecutionPolicy Bypass -File analyzer/run.ps1` should fail at "overlap 1 beat".
- [ ] **Step 3: Change the constant.** In `MusicRules.java:38`, set `static final double OVERLAP_BEATS = 1.0;`. In `README.md:22`, change "0.75 beat" to "1 beat".
- [ ] **Step 4: Run the checks and expect a pass.** The same command prints `ALL CHECKS PASSED` and `OK: site/song-data.json written and valid`.
- [ ] **Step 5: Commit and push.** Commit `song: notes overlap by 1 beat (owner round 15)` with the analyzer files, README and `site/song-data.json`.

### Task 2: Remove the Handpan picker

**Files:**
- Modify: `site/index.html:52` (delete the `<label>` holding `<select id="handpan">`)
- Modify: `site/page.js` (the two loops `for (const voice of VOICES)`: the picker build, and enabling the selects after load)
- Modify: `tests/page.spec.mjs:99-106`

- [ ] **Step 1: Update the tests first.** Remove `"handpan"` from `VOICE_IDS` and `"Handpan"` from `VOICE_NAMES`, and change `toHaveCount(7)` to `toHaveCount(6)`. `PICKER_LABELS` keeps `"Handpan (hang)"`.
- [ ] **Step 2: Run the test and expect a failure.** `npx playwright test tests/page.spec.mjs -g picker` should fail on 7 vs 6.
- [ ] **Step 3: Change the page.** Delete the label in `index.html`. In `page.js`, add `const PICKER_VOICES = VOICES.filter((voice) => voice !== "handpan"); // the handpan only joins the harp, which this song never uses` and use it in both loops. `VOICES` in `app.js` is unchanged, so a handpan part still plays the song's choice.
- [ ] **Step 4: Run the tests and expect a pass.** `npx playwright test tests/page.spec.mjs tests/site.spec.mjs --grep-invert render-length` passes, including `handpan-voice`.
- [ ] **Step 5: Commit and push.** Commit `site: remove the Handpan picker (owner round 15)`.

### Task 3: Credit the piano in the video

**Files:** Modify `tools/render-video.ps1:63`

- [ ] **Step 1: Add a third credit line.** After the `Music\: Radical changes` drawtext, add `drawtext=${font}:y=h/2+80:text='Piano\: Salamander Grand Piano by Alexander Holm, CC BY 3.0':enable='gte(t,27.8)'`. Join it with `,` like the line above it.
- [ ] **Step 2: Verify the end card (after Task 4 renders).** Grab a frame at 28.6 s (`ffmpeg -ss 28.6 -i site/media/radical-changes-30s.mp4 -frames:v 1 .cache/credit.png`). Look at it: three centred lines, none cut off.
- [ ] **Step 3: Commit and push.** Commit `video: credit the CC BY piano on the end card` together with Task 4's media.

### Task 4: Re-render the WAV and MP4 (manager)

- [ ] **Step 1: Render the WAV.** Run `npx playwright test -g render-length`, then copy `test-results/radical-changes-song.wav` to `site/media/`. Check that it is 27.0 s and that the peak is below 32767 (`python -I` with the `wave` module plus `array`).
- [ ] **Step 2: Rebuild the video.** Run `powershell -ExecutionPolicy Bypass -File tools/render-video.ps1`. The script throws unless the video is ≤ 29.5 s, 1920x1080, has one audio stream and carries the comment tag. The held-frame check must pass.
- [ ] **Step 3: Commit and push the media with Task 3.**

### Task 5: Docs, full suite, gate

- [ ] **Step 1: Update the docs.**
  - `docs/final-check.md`: tick "piano credited in the video" and record the round 15 answers.
  - `SI_LOG.md`: add one row per model that did Tasks 1-4.
- [ ] **Step 2: Run the full suite (prep cook).**
  - `powershell -ExecutionPolicy Bypass -File analyzer/run.ps1` prints `ALL CHECKS PASSED`.
  - `npx playwright test` passes (29/29, the same tests as before).
  - Report the exact counts.
- [ ] **Step 3: Gate (head chef, Opus max).** Review `git diff bdeab70..HEAD` (bdeab70 is the cloud run's last commit) against this plan and grill-log round 15. On NO, the fixes go back to the cook who wrote that code, then a second gate. On YES, push.

### Task 6: A website link (manager, needs the owner's OK)

There is no Vercel project for this site yet. The only project in the `helix-velocities` team is `spiral-node`.
- [ ] **Step 1: Add `.vercel` to `.gitignore`.**
- [ ] **Step 2: Deploy a preview.** From `site/`, run `vercel link --yes --scope helix-velocities --project radical-changes`, then `vercel deploy --yes`. That gives a **preview** URL, which Vercel Authentication keeps private to the owner's login.
- [ ] **Step 3: Check the preview.** Open the URL with the protected-deployment skill. The page loads, Tone.js loads from cdnjs, and Play gives sound. Send the owner the URL.
- [ ] Production, the radicalchanges.earth DNS (Porkbun) and making the repo public stay with the owner.

---

## Part B: Song and website rework (waiting on the owner)

The owner said the song and website "still need some rework" but has not said what. Under the team rule, Claude asks and does not suggest. These tasks get written once the owner answers these questions:

1. **Song:** what sounds wrong or unfinished? Say which part (a time in the video or a year/frame) and what you want instead.
2. **The high instrument in the second half:** this is the **flute** playing the melody in the three "Change 2012-2023" frames (16 s onward). It reaches C#6 and F6, but its recordings stop at C6, so F6 is stretched 5 semitones and sounds thinner. Do you want it changed, and if so, how?
3. **Website:** which parts need rework, and what should each one do or look like?
4. **Still open from PR #1:**
   - the oboe (only on D, F and A#, 5 notes in the song, versus "same notes, same times" as the melody)
   - the AI-log gaps
   - "student team" in the tester request
   - the disclosure link
   - the disclosure checkbox
