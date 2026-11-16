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

for (const [width, height] of [[1440, 900], [1366, 768], [1280, 720], [390, 844]]) {
  test(`hero at ${width}x${height}: Earth on the left, the quote and the demo action on the first screen`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await ready(page);
    const box = (selector) => page.locator(selector).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, bottom: r.bottom, centre: r.left + r.width / 2 };
    });
    const [earth, h1, quote, cta] = await Promise.all(["#earth", "h1", ".hero blockquote", "#cta"].map(box));
    expect(earth.centre).toBeLessThan(h1.centre); // the globe sits left of the headline
    expect(quote.bottom).toBeLessThanOrEqual(height); // the Bohr quote is in the first viewport
    expect(cta.bottom).toBeLessThanOrEqual(height);
    await expect(page.locator(".hero blockquote")).toContainText("Can you hear the music, Robert?");
    await expect(page.locator(".hero blockquote cite")).toContainText("Niels Bohr, as portrayed in Oppenheimer (2023)");
    await expect(page.locator("blockquote")).toHaveCount(1); // shown once
  });
}

test("dark page: one night ground from top to footer, no light sections, rules set like the side notes", async ({ page }) => {
  await ready(page);
  const light = await page.evaluate(() => {
    const luminance = (c) => { const [r, g, b] = c.match(/\d+(\.\d+)?/g).map(Number); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
    const found = [getComputedStyle(document.body).backgroundColor];
    for (const el of document.querySelectorAll("main section, main > div, footer.site-foot, .rules li, .frames li")) {
      const bg = getComputedStyle(el).backgroundColor;
      if (!/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && luminance(bg) > 0.2) found.push(`${el.className}: ${bg}`);
    }
    return found;
  });
  expect(light).toEqual(["rgb(7, 9, 14)"]);
  const style = (selector) => page.locator(selector).first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return [cs.fontFamily.split(",")[0].replaceAll('"', ""), cs.textTransform];
  });
  expect(await style(".rules h3")).toEqual(await style("#notes .k"));
  expect((await style(".rules dd"))[0]).toBe("Atkinson Hyperlegible Mono");
  expect((await style(".rules p"))[0]).toBe("Atkinson Hyperlegible Next");
});

test("picker label: the bass picker's first option is not cut off at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  // A select never wraps, so its shown text must fit inside it (minus its padding and the 24 px arrow).
  const { text, room } = await page.locator("#bass").evaluate((el) => {
    const cs = getComputedStyle(el);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return {
      text: ctx.measureText(el.options[el.selectedIndex].text).width,
      room: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 24,
    };
  });
  expect(text).toBeLessThanOrEqual(room);
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

// Waits (in the page) for the butterfly's hold, then lists the points of a 5x5 grid, corners included,
// that its painted wings do NOT cover.
const uncoveredDuringHold = (page) => page.evaluate(() => new Promise((resolve) => {
  const flight = document.getElementById("flight");
  const check = () => {
    if (flight.dataset.phase !== "hold") return requestAnimationFrame(check);
    const gaps = [];
    for (const fx of [0, 0.25, 0.5, 0.75, 1]) for (const fy of [0, 0.25, 0.5, 0.75, 1]) {
      const [x, y] = [Math.min(fx * innerWidth, innerWidth - 1), Math.min(fy * innerHeight, innerHeight - 1)];
      if (!document.elementFromPoint(x, y)?.closest("#flight")) gaps.push([x, y]);
    }
    resolve(gaps);
  };
  check();
}));

// Waits (in the page) for the blank pause after the butterfly leaves, and reports what is on screen then.
const duringBlank = (page) => page.evaluate(() => new Promise((resolve) => {
  const flight = document.getElementById("flight");
  const check = () => {
    if (flight.dataset.phase !== "blank") return requestAnimationFrame(check);
    const opacity = (selector) => Number(getComputedStyle(document.querySelector(selector)).opacity);
    resolve({
      heading: opacity(".listen-head"), video: opacity("#listen .screen"), notes: opacity(".notes ul"),
      butterfly: !!document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("#flight"),
    });
  };
  check();
}));
// Brings the end of the hero's text on screen without starting anything (a plain scroll from the top).
const toHeroEnd = (page) => page.evaluate(() => {
  const copy = document.querySelector(".hero-copy");
  scrollTo({ top: Math.max(0, copy.getBoundingClientRect().bottom + scrollY - innerHeight), behavior: "instant" });
});
const sequenceDone = (page) => expect(page.locator("#flight")).not.toHaveAttribute("data-phase", /./, { timeout: 8000 });

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`butterfly at ${width}x${height}: covers the screen, pauses, leaves, blank pause, then "Hear the map change." rises in`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await ready(page);
    await expect(page.locator("#flight")).toBeHidden();
    await toHeroEnd(page);
    await page.mouse.move(width / 2, height / 2);
    await page.mouse.wheel(0, 120);
    expect(await uncoveredDuringHold(page)).toEqual([]);
    // After it leaves: only the night ground, the section still hidden and no butterfly painted.
    const blank = await duringBlank(page);
    expect(blank.butterfly).toBe(false);
    for (const value of [blank.heading, blank.video, blank.notes]) expect(value).toBeLessThan(0.05);
    await sequenceDone(page);
    expect(Math.abs(await page.evaluate(() => document.getElementById("listen").getBoundingClientRect().top))).toBeLessThanOrEqual(1);
    for (const selector of [".listen-head", "#listen .screen", ".notes ul"]) {
      await expect(page.locator(selector).first()).toHaveCSS("opacity", "1");
    }
    await expect(page.locator("#h-listen")).toBeFocused();
    // Afterwards the page scrolls normally, and the overlay never takes clicks.
    await page.mouse.wheel(0, 200);
    await expect.poll(() => page.evaluate(() => document.getElementById("listen").getBoundingClientRect().top)).toBeLessThan(-100);
    expect(await page.locator("#flight").evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  });
}

test("phone: the first swipe scrolls natively while the end of the hero's text is still below the screen", async ({ page }) => {
  // At 390x844 the hero's text now ends on the first screen (822 px); a shorter phone still runs it below.
  await page.setViewportSize({ width: 375, height: 667 });
  await ready(page);
  const copyBelow = () => page.evaluate(() => document.querySelector(".hero-copy").getBoundingClientRect().bottom > innerHeight + 8);
  expect(await copyBelow()).toBe(true);
  await page.mouse.move(187, 333);
  await page.mouse.wheel(0, 60);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  await expect(page.locator("#flight")).toBeHidden();
  await expect(page.locator("#flight")).not.toHaveAttribute("data-phase", /./);
});

test("cta: the demo action plays the transition and ends with the demo playing", async ({ page }) => {
  await ready(page);
  await page.locator("#cta").click();
  await expect(page.locator("#flight")).toBeVisible();
  await sequenceDone(page);
  await expect.poll(() => page.evaluate(() => !document.getElementById("demo").paused)).toBe(true);
  expect(Math.abs(await page.evaluate(() => document.getElementById("listen").getBoundingClientRect().top))).toBeLessThanOrEqual(1);
});

test("butterfly: under reduced motion there is no overlay and no scroll capture", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.mouse.move(400, 400);
  await page.mouse.wheel(0, 150);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  await expect(page.locator("#flight")).toBeHidden();
  expect(await page.evaluate(() => scrollY)).toBeLessThan(400); // an ordinary scroll, not a jump to the next section
});

test("score labels follow the pickers, and go back to the video's instruments", async ({ page }) => {
  await ready(page);
  const song = JSON.parse(fs.readFileSync("site/song-data.json", "utf8"));
  const labels = await page.evaluate(async () => Object.fromEntries(
    Object.entries((await import("./instruments.js")).INSTRUMENTS).map(([key, spec]) => [key, spec.label])));
  // The video's own label: the same instruments, in frame order, as the picker's first option.
  const videoRow = (name, voice) =>
    `${name}: ${[...new Set(song.frames.map((f) => f[`${voice}Instrument`]).filter(Boolean))].map((n) => labels[n]).join(", then ").toLowerCase()}`;
  for (const [voice, name, pick] of [["melody", "Melody", "piano"], ["bass", "Bass", "harp"]]) {
    const row = page.locator(`#score .row-label[data-voice="${voice}"]`);
    await expect(row).toHaveText(videoRow(name, voice));
    await page.locator(`#${voice}`).selectOption(pick);
    await expect(row).toHaveText(`${name}: ${labels[pick]}`);
    await page.locator(`#${voice}`).selectOption("");
    await expect(row).toHaveText(videoRow(name, voice));
  }
  await expect(page.locator("#score .row-label[data-voice=bass]")).toHaveText("Bass: piano, then sustain strings");
});

test("rhythm is gone: six side notes, six rules, five measurements, no red", async ({ page }) => {
  await ready(page);
  await expect(page.locator("#notes li")).toHaveCount(6);
  await expect(page.locator("#notes ul").first().locator("li")).toHaveCount(3);
  await expect(page.locator(".rules li")).toHaveCount(6);
  await expect(page.locator("#h-rules")).toHaveAccessibleName("Six rules, measured from the pixels.");
  await expect(page.locator("#h-ai + p")).toContainText("five measurement rules");
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const word of ["rhythm", "offbeat", "from red", "seven rules", "six measurement"]) expect(text).not.toContain(word);
  // Every value is filled, with or without the old field in the song data.
  for (const value of await page.locator("#notes .v, .rules dd").allTextContents()) expect(value).not.toMatch(/undefined|NaN/);
});

test("transition: the hold and the blank pause follow the tunable durations (round 21: shorter)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const duration = await page.evaluate(async () => (await import("./earth.js")).DURATION);
  expect(duration).toEqual({ fly: 1300, hold: 380, exit: 1000, blank: 450 });
  // Record when each phase starts, then run the transition once.
  await page.evaluate(() => {
    window.phases = {};
    const flight = document.getElementById("flight");
    new MutationObserver(() => { const p = flight.dataset.phase; if (p && !(p in window.phases)) window.phases[p] = performance.now(); })
      .observe(flight, { attributes: true, attributeFilter: ["data-phase"] });
  });
  await toHeroEnd(page);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await sequenceDone(page);
  const p = await page.evaluate(() => window.phases);
  expect(Math.abs(p.exit - p.hold - duration.hold)).toBeLessThan(90);
  expect(Math.abs(p.rise - p.blank - duration.blank)).toBeLessThan(90);
});

// Puts a heading's top at a fraction of the viewport height and returns each line's highlighted window.
const linesAt = async (page, selector, fraction) => {
  await page.evaluate(([s, f]) => {
    const h = document.querySelector(s);
    scrollTo({ top: h.getBoundingClientRect().top + scrollY - innerHeight * f, behavior: "instant" });
  }, [selector, fraction]);
  await page.waitForTimeout(150);
  return page.locator(`${selector} .hl-line`).evaluateAll((lines) => lines.map((l) => ({
    x0: Number(l.dataset.x0), x1: Number(l.dataset.x1), w: l.getBoundingClientRect().width })));
};

test("highlighter: headings highlight in reading order as they rise, then clear in the same order", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  // "Six rules, measured from the pixels." sets on two lines at this width.
  const mid = await linesAt(page, "#h-rules", 0.72);
  expect(mid.length).toBeGreaterThanOrEqual(2);
  expect(mid[0].x0).toBe(0);
  expect(mid[0].x1).toBeGreaterThan(0);
  expect(mid[0].x1).toBeLessThan(mid[0].w - 1); // line 1 part-way
  expect(mid[1].x1).toBe(0); // line 2 not yet
  const full = await linesAt(page, "#h-rules", 0.45);
  for (const line of full) { expect(line.x0).toBe(0); expect(line.x1).toBeGreaterThan(line.w - 1); }
  const out = await linesAt(page, "#h-rules", 0.22);
  expect(out[0].x0).toBeGreaterThan(0);
  expect(out[0].x0).toBeLessThan(out[0].w - 1); // line 1 clearing from the left
  expect(out[1].x0).toBe(0);
  expect(out[1].x1).toBeGreaterThan(out[1].w - 1); // later lines still full
  // Text on the yellow is night ink, about 16:1; the marks are hidden from assistive technology.
  const colours = await page.locator("#h-rules .hl").evaluate((mark) => ({
    ink: getComputedStyle(mark.querySelector(".hl-text")).color,
    yellow: getComputedStyle(mark.querySelector(".hl-ink")).backgroundColor,
    hidden: mark.getAttribute("aria-hidden"),
  }));
  expect(colours.ink).toBe("rgb(7, 9, 14)");
  expect(colours.hidden).toBe("true");
  const luminance = (c) => {
    const [r, g, b] = c.match(/\d+/g).slice(0, 3).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  expect((luminance(colours.yellow) + 0.05) / (luminance(colours.ink) + 0.05)).toBeGreaterThan(15);
  // Every dark copy breaks its lines exactly like its heading (the same lines), at a wide and a narrow width.
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    const mismatched = await page.locator(".hl").evaluateAll((marks) => {
      // The text of each rendered line, read from the rects of each character.
      const lines = (node) => {
        const out = new Map(), range = document.createRange();
        for (let i = 0; i < node.data.length; i++) {
          range.setStart(node, i); range.setEnd(node, i + 1);
          const r = range.getClientRects()[0];
          if (!r) continue;
          const key = Math.round(r.top);
          out.set(key, (out.get(key) ?? "") + node.data[i]);
        }
        return [...out.values()].map((s) => s.trim()).join(" | ");
      };
      return marks.map((mark) => [lines(mark.parentElement.firstChild), lines(mark.querySelector(".hl-text").firstChild)])
        .filter(([own, copy]) => own !== copy);
    });
    expect(mismatched).toEqual([]);
  }
  // Which headings carry it: the section headings and the rule and frame names, not the hero or the side notes.
  await expect(page.locator("main h2 .hl")).toHaveCount(7);
  await expect(page.locator(".rules h3 .hl")).toHaveCount(6);
  await expect(page.locator("#frames h3 .hl")).toHaveCount(7);
  await expect(page.locator("h1 .hl, #notes .hl")).toHaveCount(0);
});

test("highlighter: none under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await linesAt(page, "#h-rules", 0.5);
  await expect(page.locator(".hl")).toHaveCount(0);
});
