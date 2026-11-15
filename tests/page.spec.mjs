import fs from "node:fs";
import { test, expect } from "@playwright/test";

const ready = async (page) => {
  await page.goto("/");
  await expect(page.locator("#play")).toBeEnabled();
  await expect(page.locator("#melody")).toBeEnabled();
};

test("keyboard-reach: skip link, nav, demo action, Earth, video 1, Play, both selects, in order, focus visible", async ({ page }) => {
  await ready(page);
  const focusVisible = async (selector) => {
    const outline = await page.locator(selector).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  };
  const tabTo = async (selector, most) => {
    for (let i = 0; i < most && !(await page.locator(selector).evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
  };
  await page.keyboard.press("Tab");
  await expect(page.locator("a.skip")).toBeFocused();
  await focusVisible("a.skip");
  // The wordmark and the section links come first (five), then the demo action, the Earth and the demo.
  for (const selector of ["#cta", "#earth", "#demo"]) {
    await tabTo(selector, 7);
    await expect(page.locator(selector)).toBeFocused();
    await focusVisible(selector);
  }
  // The video's own controls take a few more Tab presses; then Play comes next.
  await tabTo("#play", 15);
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
// The first option names the instruments the video uses for that voice, in frame order (same derivation as page.js).
const videoLabel = (song, labels, voice) => {
  const names = [...new Set(song.frames.map((f) => f[`${voice}Instrument`]).filter(Boolean))].map((n) => labels[n]);
  return names.length ? `${names.map((n, i) => (i ? n.toLowerCase() : n)).join(", then ")} (as in the video)` : "Silent (as in the video)";
};
const PICKER_LABELS = ["Sustain strings", "Harp", "Bells", "String bass", "Synth", "Piano", "Pipe organ", "Guitar",
  "Handpan (hang)", "Balafon", "Oboe", "Bagpipes", "Choir", "Whistle", "Pan pipes"];

test("picker: one labelled select per voice, the video's instruments first, exactly the listed instruments", async ({ page }) => {
  await ready(page);
  const song = JSON.parse(fs.readFileSync("site/song-data.json", "utf8"));
  const labels = await page.evaluate(async () => Object.fromEntries(
    Object.entries((await import("./instruments.js")).INSTRUMENTS).map(([key, spec]) => [key, spec.label])));
  await expect(page.locator(".voices select")).toHaveCount(7);
  // The owner's example: the bass plays piano in 2012-2023 and sustain strings in the change maps.
  await expect(page.locator("#bass option").first()).toHaveText("Piano, then sustain strings (as in the video)");
  for (const [i, id] of VOICE_IDS.entries()) {
    await expect(page.locator(`label:has(> span:text-is("${VOICE_NAMES[i]}")) select`)).toHaveAttribute("id", id);
    const options = await page.locator(`#${id} option`).evaluateAll((os) => os.map((o) => [o.value, o.textContent]));
    expect(options[0]).toEqual(["", videoLabel(song, labels, id)]);
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

test("focus-reveal: every tabbed element is visible at 390x844 (no focus inside an unrevealed block)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  let steps = 0;
  for (; steps < 80; steps++) {
    await page.keyboard.press("Tab");
    const state = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { done: true };
      const block = el.closest("[data-reveal]");
      return { opacity: block ? getComputedStyle(block).opacity : "1", name: el.tagName };
    });
    if (state.done) break;
    // A transition may still be running for a moment after the focus jump.
    await expect.poll(() => page.evaluate(() => {
      const block = document.activeElement.closest("[data-reveal]");
      return block ? getComputedStyle(block).opacity : "1";
    })).toBe("1");
  }
  expect(steps).toBeGreaterThan(15);
});

test("score: the strip and the score mark the current frame while the visuals play", async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const video = document.getElementById("visuals");
    const seeked = new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
    video.currentTime = 12.5; // frame 4 of 7 (index 3), 2023
    await seeked;
  });
  await page.locator("#play").click();
  await expect(page.locator("#play")).toHaveAttribute("data-state", "playing");
  await expect(page.locator("#timeline li").nth(3)).toHaveClass(/\bon\b/);
  await expect(page.locator("#timeline li.on")).toHaveCount(1);
  await expect(page.locator("#score .bar.on")).toHaveAttribute("data-bar", "3");
  await expect.poll(() => page.locator("#score .note.on").count()).toBeGreaterThan(0); // notes light while they sound
  expect(await page.locator("#score").evaluate((el) => el.closest("[aria-hidden]")?.getAttribute("aria-hidden"))).toBe("true");
  await page.locator("#play").click();
});

test("side notes: they follow the demo's frame across a boundary", async ({ page }) => {
  await ready(page);
  const song = JSON.parse(fs.readFileSync("site/song-data.json", "utf8"));
  const seekDemo = (time) => page.evaluate(async (t) => {
    const video = document.getElementById("demo");
    if (video.readyState < 1) { // preload="none": load its metadata first, as its controls would
      video.preload = "metadata";
      await new Promise((resolve) => { video.addEventListener("loadedmetadata", resolve, { once: true }); video.load(); });
    }
    const seeked = new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
    video.currentTime = t;
    await seeked;
  }, time);
  const tempo = page.locator('#notes li[data-rule="tempo"] .v');
  const tempoOf = (f) => `${Math.round(f.bpm)} bpm · vibrancy ${Math.round(f.scaled.vibrancy)}`;
  await seekDemo(3.9);
  await expect(tempo).toHaveText(tempoOf(song.frames[0]));
  await expect(page.locator("#now")).toHaveText("Frame 1 of 7 · 2012");
  await seekDemo(4.1);
  await expect(tempo).toHaveText(tempoOf(song.frames[1]));
  await expect(page.locator("#now")).toHaveText(`Frame 2 of 7 · ${song.frames[1].label}`);
  await expect(page.locator('#notes li[data-rule="key"] .v')).toContainText(song.frames[1].key);
});

test("earth: a labelled image that takes keyboard focus and turns with the arrow keys", async ({ page }) => {
  await ready(page);
  const earth = page.locator("canvas#earth");
  await expect(earth).toHaveAttribute("role", "img");
  await expect(earth).toHaveAttribute("aria-label", /Earth/);
  await expect(earth).toHaveAttribute("tabindex", "0");
  await earth.focus();
  await expect(earth).toBeFocused();
  const before = await earth.getAttribute("data-turn");
  await page.keyboard.press("ArrowRight");
  await expect(earth).not.toHaveAttribute("data-turn", before);
  expect(await page.evaluate(() => scrollY)).toBe(0); // the arrow key turned the Earth, not the page
});

test("butterfly: it flies on scroll, and under reduced motion it stays a still satellite", async ({ page }) => {
  await ready(page);
  await expect(page.locator("#flight")).toBeHidden();
  await page.evaluate(() => scrollTo(0, innerHeight * 0.4));
  await expect(page.locator("#flight")).toBeVisible();
  expect(await page.locator("#flight").evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.evaluate(() => scrollTo(0, innerHeight * 0.4));
  await page.waitForTimeout(300);
  await expect(page.locator("#flight")).toBeHidden();
});
