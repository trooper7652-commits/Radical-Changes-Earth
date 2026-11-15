import fs from "node:fs";
import { test, expect } from "@playwright/test";

const playButton = (page) => page.getByRole("button", { name: /play|pause/i });
const transportState = (page) => page.evaluate(() => Tone.getTransport().state);
const readSong = () => JSON.parse(fs.readFileSync("site/song-data.json", "utf8"));

// Records every note the player triggers from now on as { name, pitch, velocity } in window.triggered;
// triggered(page, n) returns the first n pitches.
const recordNotes = (page) =>
  page.evaluate(() => {
    window.triggered = [];
    for (const copy of window.songPlayer.instruments) {
      for (const [name, instrument] of Object.entries(copy)) {
        const trigger = instrument.triggerAttackRelease.bind(instrument);
        instrument.triggerAttackRelease = (pitch, duration, time, velocity) => {
          window.triggered.push({ name, pitch, velocity });
          return trigger(pitch, duration, time, velocity);
        };
      }
    }
  });
const triggered = (page, count) =>
  page.evaluate((n) => window.triggered.slice(0, n).map((note) => note.pitch), count);
const pitchesOfFrame = (page, index) =>
  page.evaluate((i) => window.songPlayer.songData.frames[i].notes.map((note) => note.pitch), index);
const seekTo = (page, time) =>
  page.evaluate(async (t) => {
    const video = document.getElementById("visuals");
    const seeked = new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
    video.currentTime = t;
    await seeked;
  }, time);

test("play-starts-audio", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  await recordNotes(page);
  await playButton(page).click();

  await expect(playButton(page)).toHaveAttribute("data-state", "playing");
  expect(await page.evaluate(() => Tone.context.state)).toBe("running");
  await expect.poll(() => transportState(page)).toBe("started");
  // The whole first frame plays, starting with its note at song time 0.
  const firstFrame = await pitchesOfFrame(page, 0);
  await expect.poll(() => triggered(page, firstFrame.length)).toEqual(firstFrame);

  await playButton(page).click();
  await expect(playButton(page)).toHaveAttribute("data-state", "paused");
  expect(await transportState(page)).toBe("stopped");
  expect(errors).toEqual([]);
});

test("stall-at-start: a stall right after the first note does not play it again", async ({ page }) => {
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  await recordNotes(page);
  await playButton(page).click();
  // What the browser sends when the video stalls and recovers ("waiting", then "playing" again),
  // just after the first note, while it is still inside the late-note window.
  await page.evaluate(async () => {
    while (window.triggered.length === 0) await new Promise(requestAnimationFrame);
    const video = document.getElementById("visuals");
    video.dispatchEvent(new Event("waiting"));
    video.dispatchEvent(new Event("playing"));
  });
  const firstFrame = await pitchesOfFrame(page, 0);
  await expect.poll(() => triggered(page, firstFrame.length)).toEqual(firstFrame);
});

test("seek-follows-video", async ({ page }) => {
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  const frameAt = (seconds) =>
    page.evaluate(async (time) => {
      const video = document.getElementById("visuals");
      const seeked = new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
      video.currentTime = time;
      await seeked;
      return window.songPlayer.activeFrameIndex();
    }, seconds);

  expect(await frameAt(12.5)).toBe(3);
  expect(await frameAt(11.9)).toBe(2);
  expect(await frameAt(27)).toBe(6);

  // Seeking while playing restarts the notes from the new song time.
  await playButton(page).click();
  await expect.poll(() => transportState(page)).toBe("started");
  await page.waitForTimeout(1000);
  await recordNotes(page);
  expect(await frameAt(20)).toBe(5);
  const sixthFrame = await pitchesOfFrame(page, 5);
  await expect.poll(() => triggered(page, sixthFrame.length)).toEqual(sixthFrame);
  const drift = await page.evaluate(
    () => document.getElementById("visuals").currentTime - 20 - Tone.getTransport().seconds,
  );
  expect(Math.abs(drift)).toBeLessThan(0.25);
});

test("loading-state", async ({ page }) => {
  let releaseSamples;
  const samplesHeld = new Promise((resolve) => (releaseSamples = resolve));
  await page.route("**/samples/**", async (route) => {
    await samplesHeld;
    await route.continue();
  });

  await page.goto("/");
  await expect(playButton(page)).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Loading sounds…");

  releaseSamples();
  await expect(playButton(page)).toBeEnabled();
  await expect(page.getByRole("status")).not.toHaveText("Loading sounds…");
});

test("loading-state: a missing sample names the instrument", async ({ page }) => {
  await page.route("**/samples/piano/C4.mp3", (route) => route.fulfill({ status: 404 }));

  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("Couldn't load Piano");
  await expect(playButton(page)).toBeDisabled();
});

test("instrument-swap-midplay", async ({ page }) => {
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  await playButton(page).click();
  await expect(playButton(page)).toHaveAttribute("data-state", "playing");
  const eventCount = () =>
    page.evaluate(() => window.songPlayer.parts.reduce((sum, part) => sum + part.length, 0));
  const before = await eventCount();
  expect(before).toBeGreaterThan(0);

  await page.evaluate(() => window.songPlayer.setInstrument("melody", "piano"));
  await expect(playButton(page)).toHaveAttribute("data-state", "playing");
  expect(await eventCount()).toBeLessThanOrEqual(before); // restarted from now: never more events
  expect(await page.evaluate(() => window.songPlayer.parts.length)).toBe(7);
});

test("play-pause-seek-no-duplicates", async ({ page }) => {
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  const state = (value) => expect(playButton(page)).toHaveAttribute("data-state", value);

  await playButton(page).click(); await state("playing");
  await playButton(page).click(); await state("paused");
  await playButton(page).click(); await state("playing");
  await seekTo(page, 5);
  await recordNotes(page);
  await playButton(page).click(); await state("paused");
  await playButton(page).click(); await state("playing");
  await page.waitForTimeout(1000);

  const { played, song } = await page.evaluate(() => ({
    played: window.triggered.map((note) => note.pitch),
    song: window.songPlayer.songData.frames.flatMap((f) => f.notes).sort((a, b) => a.time - b.time),
  }));
  expect(played.length).toBeGreaterThan(0);
  // Everything sounded since the seek, across the pause and resume, is a run of the song's notes in
  // order: none repeated, none skipped. It starts just after the seek point (the late-note window
  // reaches 0.1 s back; a note or two may sound before the recording starts).
  const start = song.findIndex((note, i) =>
    note.time >= 4.9 && played.every((pitch, j) => song[i + j]?.pitch === pitch));
  expect(start).toBeGreaterThanOrEqual(0);
  expect(song[start].time).toBeLessThan(6);
});

test("handpan-voice: a frame with a handpan part plays it on the handpan", async ({ page }) => {
  // No real frame has the harp (short notes and low contrast), so give frame 0 a handpan part as the
  // analyzer writes one: the melody's times and lengths, pitches inside the handpan's range.
  const song = readSong();
  const first = song.frames[0];
  const range = ["A3", "D4", "E4", "F4", "G4", "A4", "C5", "D5"];
  const handpan = first.notes.filter((note) => note.voice === "melody")
    .map((note, k) => ({ ...note, voice: "handpan", pitch: range[k % range.length] }));
  first.handpanInstrument = "handpan";
  first.notes = [...first.notes, ...handpan].sort((a, b) => a.time - b.time);
  await page.route("**/song-data.json", (route) => route.fulfill({ json: song }));

  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  await recordNotes(page);
  await playButton(page).click();
  // Only frame 0's: from frame 1 on, the panHang voice plays the handpan too.
  const onHandpan = () => page.evaluate((n) =>
    window.triggered.filter((note) => note.name === "handpan").map((note) => note.pitch).slice(0, n), handpan.length);
  await expect.poll(onHandpan).toEqual(handpan.map((note) => note.pitch));
});

test("change voices (hang, balafon, string bass): their volume follows the change", async ({ page }) => {
  // In the data: -30 dB at change 1 up to -6 dB at 100, the change doubled first (owner's 2x presence),
  // then 10 dB louder, capped at -3 dB (song v3).
  const song = readSong();
  const instrumentOf = { panHang: "handpan", panBalafon: "balafon", stringBass: "string bass" };
  const changeVoice = (note) => Object.hasOwn(instrumentOf, note.voice);
  for (const frame of song.frames) {
    const presence = Math.min(100, frame.change * 2);
    const notes = frame.notes.filter(changeVoice);
    expect(notes.length > 0).toBe(frame.index > 0); // frame 0 has no previous frame
    for (const note of notes) expect(note.volumeDb).toBeCloseTo(Math.min(-3, -30 + (24 * (presence - 1)) / 99 + 10), 9);
  }

  // In the player: each note sounds at its own volume.
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  await seekTo(page, 4); // frame 1
  await recordNotes(page);
  await playButton(page).click();
  const expected = song.frames[1].notes.filter(changeVoice).map((note) => ({
    name: instrumentOf[note.voice],
    pitch: note.pitch,
    velocity: expect.closeTo(10 ** (note.volumeDb / 20), 6),
  }));
  const onChangeVoices = () => page.evaluate((names) =>
    window.triggered.filter((note) => names.includes(note.name)), Object.values(instrumentOf));
  await expect.poll(onChangeVoices).toEqual(expected);
});

test("frame-volumes: full until 4i+4, about -12 dB at 4i+5 while the next frame fades in, silent at 4i+8", async ({ page }) => {
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  const levels = await page.evaluate(async () => {
    const { scheduleFrame, frameInstruments, VOICES } = await import("./app.js");
    const { frames } = window.songPlayer.songData;
    // Schedules a frame from song time `offset` on a fresh synth, far ahead so nothing sounds,
    // and reads the synth's volume (dB) back at the given song times.
    const volumeOf = (frame, offset, times) => {
      const synth = new Tone.PolySynth();
      const at = Tone.now() + 1000;
      scheduleFrame(frame, Object.fromEntries(VOICES.map((voice) => [voice, synth])), Tone, offset, at).dispose();
      const db = times.map((time) => synth.volume.getValueAtTime(at + time - offset));
      synth.dispose();
      return db;
    };
    const copies = window.songPlayer.instruments;
    return {
      first: volumeOf(frames[0], 0, [0, 3, 4, 5, 8]),
      third: volumeOf(frames[2], 0, [8, 8.5, 9, 11, 12, 12.5, 13, 14.5, 16, 20]),
      thirdFrom14: volumeOf(frames[2], 14, [14, 14.5, 16]),
      // Frames 1 and 2 overlap, so they must not share an instrument (both play the synth melody).
      separate: frameInstruments(frames[1], copies).melody !== frameInstruments(frames[2], copies).melody,
    };
  });
  const low = 10 ** (-12 / 20);
  const db = (gain) => expect.closeTo(20 * Math.log10(gain), 3);
  expect(levels.first).toEqual([db(1), db(1), db(1), db(low), -Infinity]); // frame 0 starts at full volume
  // frame 2 (8..12 s): fades in over 8..9, full until 12, -12 dB at 13 while frame 3 fades in, silent at 16
  expect(levels.third).toEqual([db(low), db(low + (1 - low) / 2), db(1), db(1), db(1), db((1 + low) / 2), db(low),
    db(low / 2), -Infinity, -Infinity]);
  expect(levels.thirdFrom14).toEqual([db(low * 2 / 3), db(low / 2), -Infinity]); // resumed mid-fade
  expect(levels.separate).toBe(true);
});

test("render-length", async ({ page }) => {
  await page.goto("/render.html");
  const download = page.waitForEvent("download", { timeout: 120000 });
  await page.getByRole("button", { name: "Render WAV" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("radical-changes-song.wav");
  // Rendering the committed WAV is a manual step: open /render.html, click "Render WAV", save to site/media/.
  await file.saveAs("test-results/radical-changes-song.wav");

  const wav = fs.readFileSync("test-results/radical-changes-song.wav");
  const rate = wav.readUInt32LE(24);
  const channels = wav.readUInt16LE(22);
  const seconds = wav.readUInt32LE(40) / (rate * channels * 2);
  expect(rate).toBe(44100);
  expect(channels).toBe(2);
  expect(Math.abs(seconds - 27)).toBeLessThan(0.05);
  // Not silence, and no clipping (the master limiter keeps every sample below full scale).
  let peak = 0;
  for (let i = 44; i < wav.length; i += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(i)));
  expect(peak).toBeGreaterThan(0);
  expect(peak).toBeLessThan(32767);
});

const COULDNT_START = "Couldn't start the player";

test("error: song-data.json fails", async ({ page }) => {
  await page.route("**/song-data.json", (route) => route.fulfill({ status: 404 }));
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText(COULDNT_START);
});

test("error: song-data.json invalid", async ({ page }) => {
  await page.route("**/song-data.json", (route) => route.fulfill({ status: 200, body: "{nope" }));
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText(COULDNT_START);
});

test("error: Tone CDN fails", async ({ page }) => {
  await page.route("**/cdnjs.cloudflare.com/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText(COULDNT_START);
});

test("error: play rejected", async ({ page }) => {
  await page.goto("/");
  await expect(playButton(page)).toBeEnabled();
  await page.evaluate(() => (window.songPlayer.video.play = () => Promise.reject(new Error("blocked"))));
  await playButton(page).click();
  await expect(page.getByRole("status")).toHaveText(COULDNT_START);
});
