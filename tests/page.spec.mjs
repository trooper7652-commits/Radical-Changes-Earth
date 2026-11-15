import fs from "node:fs";
import { test, expect } from "@playwright/test";

const ready = async (page) => {
  await page.goto("/");
  await expect(page.locator("#play")).toBeEnabled();
  await expect(page.locator("#melody")).toBeEnabled();
};

test("keyboard-reach: skip link, video 1, Play, both selects, in order, focus visible", async ({ page }) => {
  await ready(page);
  const focusVisible = async (selector) => {
    const outline = await page.locator(selector).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  };
  for (const selector of ["a.skip", "#demo"]) {
    await page.keyboard.press("Tab");
    await expect(page.locator(selector)).toBeFocused();
    await focusVisible(selector);
  }
  // The video's own controls take a few more Tab presses; then Play comes next.
  for (let i = 0; i < 15 && !(await page.locator("#play").evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  for (const selector of ["#play", "#melody", "#bass"]) {
    await expect(page.locator(selector)).toBeFocused();
    await focusVisible(selector);
    await page.keyboard.press("Tab");
  }
});

test("labels: every button and select has an accessible name", async ({ page }) => {
  await ready(page);
  for (const el of await page.locator("button, select, video[controls]").all()) {
    const name = await el.evaluate((node) =>
      node.getAttribute("aria-label") || node.labels?.[0]?.textContent.trim() || node.textContent.trim());
    expect(name.length).toBeGreaterThan(0);
  }
});

test("reduced-motion: decorative animations are off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  for (const el of await page.locator("[data-decor], blockquote, .site").all()) {
    expect(await el.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
  }
});

test("one-plays: starting either video pauses the other", async ({ page }) => {
  await ready(page);
  await page.locator("#play").click();
  await expect(page.locator("#play")).toHaveAttribute("data-state", "playing");
  await page.evaluate(() => document.getElementById("demo").play());
  await expect.poll(() => page.evaluate(() => document.getElementById("visuals").paused)).toBe(true);
  expect(await page.evaluate(() => document.getElementById("demo").paused)).toBe(false);
  await page.locator("#play").click();
  await expect(page.locator("#play")).toHaveAttribute("data-state", "playing");
  await expect.poll(() => page.evaluate(() => document.getElementById("demo").paused)).toBe(true);
});

for (const width of [360, 768, 1440]) {
  test(`no-overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("content: quote, AI meta, announced frame descriptions, instrument picker", async ({ page }) => {
  await ready(page);
  await expect(page.locator("blockquote")).toContainText("Can you hear the music, Robert?");
  await expect(page.locator('meta[name="radical-changes:ai-assistance"]')).toHaveAttribute("content", /SI_DISCLOSURE\.md/);
  await expect(page.locator("#frames li")).toHaveCount(7);
  await expect(page.locator("#heard")).toHaveAttribute("aria-live", "polite");
  await page.locator("#melody").selectOption("piano");
  await expect.poll(() => page.evaluate(() => window.songPlayer.chosen.melody)).toBe("piano");
  await page.locator("#play").click();
  await expect(page.locator("#heard")).toContainText("Frame 1 of 7");
});

test("one h1, and the demo is not silenced by the audio routing", async ({ page }) => {
  await ready(page);
  await expect(page.locator("h1")).toHaveCount(1);
  await page.evaluate(() => document.getElementById("demo").play());
  await expect(page.locator("#demo")).not.toHaveAttribute("data-routed", "pending");
  expect(await page.evaluate(() => document.getElementById("demo").muted)).toBe(false);
  expect(["running", "skipped"]).toContain(await page.locator("#demo").getAttribute("data-routed"));
});

test("choosing an instrument keeps focus on the select", async ({ page }) => {
  await ready(page);
  await page.locator("#melody").focus();
  await page.locator("#melody").selectOption("harp");
  await expect.poll(() => page.evaluate(() => window.songPlayer.chosen.melody)).toBe("harp");
  await expect(page.locator("#melody")).toBeFocused();
});

const VOICE_IDS = ["melody", "bass", "handpan", "panHang", "panBalafon", "stringBass", "oboe"];
const VOICE_NAMES = ["Melody", "Bass", "Handpan", "Hang drum", "Balafon", "String bass", "Oboe"];
const PICKER_LABELS = ["Sustain strings", "Harp", "Bells", "String bass", "Synth", "Piano", "Pipe organ", "Guitar",
  "Handpan (hang)", "Balafon", "Oboe", "Bagpipes", "Choir", "Whistle", "Pan pipes"];

test("picker: one labelled select per voice, Song's choice first, exactly the listed instruments", async ({ page }) => {
  await ready(page);
  await expect(page.locator(".voices select")).toHaveCount(7);
  for (const [i, id] of VOICE_IDS.entries()) {
    await expect(page.locator(`label:has(> span:text-is("${VOICE_NAMES[i]}")) select`)).toHaveAttribute("id", id);
    const options = await page.locator(`#${id} option`).evaluateAll((os) => os.map((o) => [o.value, o.textContent]));
    expect(options[0]).toEqual(["", "Song's choice"]);
    expect(options.slice(1).map((o) => o[1])).toEqual(PICKER_LABELS);
    expect(await page.locator(`#${id}`).inputValue()).toBe("");
  }
  await page.locator("#oboe").focus();
  await page.locator("#oboe").selectOption("choir");
  await expect.poll(() => page.evaluate(() => window.songPlayer.chosen.oboe)).toBe("choir");
  await expect(page.locator("#oboe")).toBeFocused();
});

test("descriptions: each frame names every voice that plays in it", async ({ page }) => {
  await ready(page);
  const song = JSON.parse(fs.readFileSync("site/song-data.json", "utf8"));
  const names = { melody: "melody", bass: "bass", handpan: "handpan on", panHang: "hang drum", panBalafon: "balafon", stringBass: "string bass", oboe: "oboe" };
  for (const [i, frame] of song.frames.entries()) {
    const text = (await page.locator("#frames li p").nth(i).textContent()).toLowerCase();
    for (const voice of VOICE_IDS) {
      if (frame[`${voice}Instrument`]) expect(text).toContain(names[voice]);
      else expect(text).not.toContain(names[voice] + (voice === "handpan" ? "" : " on"));
    }
  }
});

test("footer: AI-assistance line, exact text", async ({ page }) => {
  await ready(page);
  await expect(page.locator("body > footer")).toContainText(
    "Site graphics and code made with AI assistance. The music is generated by the team's algorithm from NASA data; the instrument sounds are real recordings.");
});
