import fs from "node:fs";
import { test, expect } from "@playwright/test";

const playButton = (page) => page.getByRole("button", { name: /play|pause/i });
const transportState = (page) => page.evaluate(() => Tone.getTransport().state);

// Records every pitch the player triggers from now on; triggered(page, n) returns the first n.
const recordNotes = (page) =>
  page.evaluate(() => {
    window.triggered = [];
    for (const instrument of Object.values(window.songPlayer.instruments)) {
      const trigger = instrument.triggerAttackRelease.bind(instrument);
      instrument.triggerAttackRelease = (pitch, ...rest) => {
        window.triggered.push(pitch);
        return trigger(pitch, ...rest);
      };
    }
  });
const triggered = (page, count) => page.evaluate((n) => window.triggered.slice(0, n), count);
const pitchesOfFrame = (page, index) =>
  page.evaluate((i) => window.songPlayer.songData.frames[i].notes.map((note) => note.pitch), index);

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
  const seekTo = (time) =>
    page.evaluate(async (t) => {
      const video = document.getElementById("visuals");
      const seeked = new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
      video.currentTime = t;
      await seeked;
    }, time);
  const state = (value) => expect(playButton(page)).toHaveAttribute("data-state", value);

  await playButton(page).click(); await state("playing");
  await playButton(page).click(); await state("paused");
  await playButton(page).click(); await state("playing");
  await seekTo(5);
  await playButton(page).click(); await state("paused");
  await recordNotes(page);
  await playButton(page).click(); await state("playing");
  await page.waitForTimeout(1000);

  const { played, expected } = await page.evaluate(() => {
    const start = window.songPlayer.video.currentTime;
    const all = window.songPlayer.songData.frames.flatMap((f) => f.notes);
    all.sort((a, b) => a.time - b.time);
    // Resumed from the paused position, so the first notes are those at or just before it.
    const from = all.findIndex((n) => n.time >= start - 1.1);
    return { played: window.triggered, expected: all.slice(from).map((n) => n.pitch) };
  });
  expect(played.length).toBeGreaterThan(0);
  // Every sounded note, in order, with none repeated: a prefix of the song from the seek point on.
  const offset = expected.findIndex((_, i) => played.every((p, j) => expected[i + j] === p));
  expect(offset).toBeGreaterThanOrEqual(0);
  expect(offset).toBeLessThan(3);
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
  // Not silence.
  expect(wav.subarray(44).some((byte) => byte !== 0)).toBe(true);
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
