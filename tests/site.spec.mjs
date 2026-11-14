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
      const video = document.querySelector("video");
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
    () => document.querySelector("video").currentTime - 20 - Tone.getTransport().seconds,
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
