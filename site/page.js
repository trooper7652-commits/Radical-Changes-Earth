// Page wiring: the player, the instrument pickers, the frame descriptions, the side notes beside the demo,
// the score, one-plays-at-a-time, the Earth and the butterfly. The music itself lives in app.js.
import { SongPlayer, VOICES } from "./app.js";
import { INSTRUMENTS } from "./instruments.js";
import { startEarth, startFlight } from "./earth.js";
import { drawScore } from "./score.js";
import { highlightHeadings } from "./highlight.js";

// The reading-order highlighter on the headings below the hero (owner round 21); decoration, so never fatal.
let highlighted = false;
function startHighlight() {
  if (highlighted || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  highlighted = true;
  try { highlighter = highlightHeadings(document.querySelectorAll("main h2, .rules h3, #frames h3")); } catch (error) { console.warn(error); }
}
let highlighter = null;
// After an in-page link jump, settle the headings near the top so none rests half-highlighted.
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || !event.target.closest?.('a[href^="#"]')) return;
  let done = false;
  const settle = () => { if (!done) { done = true; highlighter?.settle(); } };
  addEventListener("scrollend", settle, { once: true });
  setTimeout(settle, 1200);
});

const $ = (id) => document.getElementById(id);
const demo = $("demo");
const visuals = $("visuals");
const button = $("play");
const status = $("status");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const VOICE_LABELS = { melody: "Melody", bass: "Bass", handpan: "Handpan", panHang: "Hang drum",
  panBalafon: "Balafon", stringBass: "String bass", oboe: "Oboe" };
// What the picker offers, in this order (keys of INSTRUMENTS).
const PICKER = ["sustain strings", "harp", "bells", "string bass", "synth", "piano", "pipe organ", "guitar",
  "handpan", "balafon", "oboe", "bagpipes", "choir", "whistle", "pan pipes"];
const COULDNT_START = "Couldn't start the player";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

// Only one video makes sound at a time.
demo.addEventListener("play", () => visuals.pause());
visuals.addEventListener("play", () => demo.pause());

function showState(state) {
  button.dataset.state = state;
  button.textContent = state === "playing" ? "Pause" : "Play";
}
visuals.addEventListener("playing", () => showState("playing"));
visuals.addEventListener("pause", () => showState("paused"));
visuals.addEventListener("ended", () => showState("paused"));

// The primary action: go to the demo (through the butterfly transition) and play it with sound.
let flight = null; // the transition, when motion is allowed
$("cta").addEventListener("click", async (event) => {
  event.preventDefault();
  if (flight) await flight.play(); // ends with "Hear the map change." at the top of the screen
  else $("listen").scrollIntoView({ block: "start" });
  demo.focus({ preventScroll: true });
  demo.play().catch(() => {});
});

const label = (name) => INSTRUMENTS[name]?.label ?? name;

// Plain-words description of a frame, made from song-data.json.
function describe(frame, total, chosen = {}) {
  const name = (n) => label(n).toLowerCase();
  // Every voice that plays in this frame (a null instrument means that voice is silent).
  // The visitor's picks replace the song's own instruments, but a voice that is silent here stays silent.
  const playing = VOICES.filter((voice) => frame[`${voice}Instrument`])
    .map((voice) => `${VOICE_LABELS[voice].toLowerCase()} on ${name(chosen[voice] || frame[`${voice}Instrument`])}`).join(", ");
  return `Frame ${frame.index + 1} of ${total}, ${frame.label}. ${frame.key} ${frame.mode}, ` +
    `${Math.round(frame.bpm)} beats per minute, ${frame.shortNotes ? "short" : "long"} notes. ` +
    `Playing: ${playing}.`;
}

// The instruments a voice plays in the video, in frame order, once each (INSTRUMENTS labels).
const videoInstruments = (frames, voice) =>
  [...new Set(frames.map((f) => f[`${voice}Instrument`]).filter(Boolean))].map(label);
// The picker's first option: the song's own choice, named.
function asInVideo(frames, voice) {
  const names = videoInstruments(frames, voice);
  if (names.length === 0) return "Silent (as in the video)";
  return `${names.map((n, i) => (i ? n.toLowerCase() : n)).join(", then ")} (as in the video)`;
}

// What each rule did in one frame, from the frame's real values (the side notes and the rule facts).
function ruleValues(frame) {
  const s = frame.scaled, r = Math.round;
  const changeNotes = frame.notes.filter((n) => ["panHang", "panBalafon", "stringBass"].includes(n.voice));
  const family = ["melody", "handpan", "bass"].map((v) => frame[`${v}Instrument`]).filter(Boolean).map((n) => label(n).toLowerCase());
  return {
    key: `${frame.key} · melody ${r(s.melody)}`,
    tempo: `${r(frame.bpm)} bpm · vibrancy ${r(s.vibrancy)}`,
    mode: `${frame.mode[0].toUpperCase()}${frame.mode.slice(1)} · happiness ${r(s.happiness)}`,
    length: `${frame.shortNotes ? "Short" : "Long"} · uniqueness ${r(s.uniqueness)}`,
    family: `Contrast ${r(s.contrast)}: ${family.join(", ")}`,
    change: changeNotes.length === 0 ? "Silent: no earlier frame"
      : `Change ${r(frame.change)} · up to ${r(Math.max(...changeNotes.map((n) => n.volumeDb)))} dB`,
  };
}

// Each block eases in once as it scrolls into view (opacity and transform only). Never hides anything
// without JavaScript, with reduced motion, or when IntersectionObserver is missing.
function revealOnScroll() {
  if (reduced || !("IntersectionObserver" in window)) return;
  const groups = [".listen-head", ".stage", ".deck", ".score-wrap", ".voices", ".how h2", ".rules li", ".words-head",
    ".frames", ".why > *", ".ends > *", ".site-foot"];
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("in"); watcher.unobserve(entry.target); }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const group of groups) {
    document.querySelectorAll(group).forEach((el, i) => {
      el.dataset.reveal = "";
      el.style.setProperty("--i", i % 4); // at most four staggered children
      watcher.observe(el);
    });
  }
  // A focused element must never sit invisible inside a block that has not been revealed yet.
  document.addEventListener("focusin", (e) => e.target.closest?.("[data-reveal]")?.classList.add("in"));
  document.documentElement.classList.add("reveal-ready");
}

// The demo's sound level (0..1), or the live song's notes, drive the small meter beside "Frame n of 7".
function driveMeter(songData) {
  if (reduced) return;
  const meter = document.querySelector(".meter");
  // Live song: each note flashes the meter, then it fades (read from the data, so the audio graph is untouched).
  const noteTimes = songData.frames.flatMap((f) => f.notes.map((n) => n.time)).sort((a, b) => a - b);
  let analyser, samples, raf = 0, last = 0, shown = -1;
  demo.addEventListener("play", async () => {
    if (analyser || demo.dataset.routed) return;
    demo.dataset.routed = "pending";
    const context = new AudioContext();
    await context.resume().catch(() => {}); // runs from the visitor's click
    if (context.state !== "running") { // never silence the demo: play it unrouted
      demo.dataset.routed = "skipped";
      return;
    }
    demo.dataset.routed = "running";
    analyser = context.createAnalyser();
    samples = new Float32Array(analyser.fftSize);
    context.createMediaElementSource(demo).connect(analyser);
    analyser.connect(context.destination);
  });
  function tick() {
    let level = 0;
    if (!visuals.paused) {
      const t = visuals.currentTime;
      const since = t - noteTimes.findLast((n) => n <= t);
      level = Number.isFinite(since) ? Math.exp(-since / 0.4) : 0;
    } else if (!demo.paused && analyser) {
      analyser.getFloatTimeDomainData(samples);
      level = Math.min(Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length) * 4, 1);
    }
    last += (level - last) * 0.25;
    if (Math.abs(last - shown) > 0.01) meter.style.transform = `scaleX(${(shown = last).toFixed(2)})`;
    raf = demo.paused && visuals.paused && last < 0.01 ? 0 : requestAnimationFrame(tick);
  }
  for (const video of [demo, visuals]) video.addEventListener("play", () => { if (!raf) raf = requestAnimationFrame(tick); });
}

revealOnScroll();
try { // decoration: a failure here must never stop the player below from loading
  const earth = startEarth(document.querySelector(".globe"), { reduced });
  // Under reduced motion there is no transition and no scroll capture: the satellite stays still.
  // As the section rises in after the transition, its heading is highlighted in full (round 22).
  if (!reduced) flight = startFlight($("flight"), earth.butterfly, $("listen"), $("h-listen"), () => highlighter?.land($("h-listen")));
} catch (error) {
  console.warn(error);
}

status.textContent = "Loading sounds…";
try {
  if (typeof Tone === "undefined") throw new Error(COULDNT_START); // the Tone.js CDN failed
  let songData;
  try {
    const response = await fetch("song-data.json");
    if (!response.ok) throw new Error(response.status);
    songData = await response.json();
    if (!Array.isArray(songData.frames)) throw new Error("no frames");
  } catch {
    throw new Error(COULDNT_START);
  }

  const { frames } = songData;
  const total = frames.length;
  const frameAt = (t) => Math.min(Math.max(Math.floor(t / (songData.frameSeconds + songData.transitionSeconds)), 0), total - 1);
  const short = (f) => f.label.replace("Change 2012-2023", "Change");
  const descriptions = frames.map((frame) => describe(frame, total));
  $("frames").innerHTML = frames.map((f, i) => `<li><img src="img/f${i}.jpg" alt="" width="1280" height="720" loading="lazy">` +
    `<h3>${f.label}</h3><span class="data">${Math.round(f.bpm)} bpm · ${f.key} ${f.mode}</span><p>${descriptions[i]}</p></li>`).join("");
  $("timeline").innerHTML = frames.map((f, i) => `<li><img src="img/f${i}.jpg" alt="" width="1280" height="720" loading="lazy"><span>${short(f)}</span></li>`).join("");
  startHighlight(); // now that every frame's heading exists

  // The rules, with what each did in the first frame and in the last.
  const first = ruleValues(frames[0]), lastValues = ruleValues(frames[total - 1]);
  document.querySelectorAll(".rules li").forEach((li) => {
    const rule = li.dataset.rule;
    li.querySelector(".fact").innerHTML = `<div><dt>${frames[0].label}</dt><dd>${first[rule]}</dd></div>` +
      `<div><dt>Last change map</dt><dd>${lastValues[rule]}</dd></div>`;
  });

  // Side notes beside the demo: what each rule does in the frame on screen, following whichever video plays.
  const now = $("now");
  let clock = demo, noted = -1;
  function showNotes(index) {
    if (index === noted) return;
    noted = index;
    const values = ruleValues(frames[index]);
    for (const li of $("notes").querySelectorAll("li")) {
      const value = li.querySelector(".v");
      value.textContent = values[li.dataset.rule];
      if (!reduced) value.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: EASE });
    }
    // Announced while the demo plays; the live player has its own, fuller announcement (#heard).
    now.setAttribute("aria-live", clock === demo ? "polite" : "off");
    now.textContent = `Frame ${index + 1} of ${total} · ${frames[index].label}`;
  }
  for (const video of [demo, visuals]) {
    video.addEventListener("play", () => (clock = video));
    video.addEventListener("seeked", () => { clock = video; showNotes(frameAt(video.currentTime)); });
    video.addEventListener("timeupdate", () => video === clock && showNotes(frameAt(video.currentTime)));
  }
  showNotes(0);

  // The score: rows labelled by the instruments the video uses, for every voice with notes.
  // A row's label names what that voice plays: the visitor's pick, or the video's own instruments (the same
  // source as the picker's first option, so the two never disagree).
  const rowLabel = (voice, chosen) => chosen ? `${VOICE_LABELS[voice]}: ${label(chosen)}`
    : voice === "melody" || voice === "bass"
      ? `${VOICE_LABELS[voice]}: ${videoInstruments(frames, voice).join(", then ").toLowerCase()}` : VOICE_LABELS[voice];
  const rows = VOICES.filter((voice) => frames.some((f) => f.notes.some((n) => n.voice === voice)))
    .map((voice) => ({ voice, label: rowLabel(voice) }));
  const markScore = drawScore($("score"), songData, rows);
  const relabelRow = (voice, chosen) => { // rows keep the label, so a redraw on resize keeps it too
    const row = rows.find((r) => r.voice === voice);
    if (!row) return;
    row.label = rowLabel(voice, chosen);
    const text = $("score").querySelector(`.row-label[data-voice="${voice}"]`);
    if (text) text.textContent = row.label;
  };
  let scoreRaf = 0;
  const followScore = () => {
    markScore(visuals.currentTime, { playing: !visuals.paused, stepped: reduced });
    scoreRaf = visuals.paused ? 0 : requestAnimationFrame(followScore);
  };
  visuals.addEventListener("playing", () => { if (!scoreRaf) scoreRaf = requestAnimationFrame(followScore); });
  for (const event of ["pause", "seeked", "ended"]) visuals.addEventListener(event, followScore);

  const player = new SongPlayer(visuals, songData, Tone);
  window.songPlayer = player; // for the tests and the browser console

  // Announce each frame politely as it plays, and light its segment.
  let shown = -1;
  const showFrame = () => {
    const index = player.activeFrameIndex();
    if (index === shown) return;
    shown = index;
    $("timeline").querySelectorAll("li").forEach((li, i) => li.classList.toggle("on", i === index));
    $("frames").querySelectorAll("li").forEach((li, i) => li.classList.toggle("now", i === index && !visuals.paused));
    if (!visuals.paused) $("heard").textContent = describe(frames[index], total, player.chosen);
  };
  visuals.addEventListener("timeupdate", showFrame);
  visuals.addEventListener("playing", () => { shown = -1; showFrame(); });

  // Instrument pickers, built from INSTRUMENTS. Each starts on the song's own choice, named.
  for (const voice of VOICES) {
    const select = $(voice);
    select.innerHTML = `<option value="">${asInVideo(frames, voice)}</option>` +
      PICKER.map((key) => `<option value="${key}">${INSTRUMENTS[key].label}</option>`).join("");
    let current = select.value;
    select.addEventListener("change", () => {
      // aria-busy, not disabled: a disabled select drops keyboard focus.
      if (select.getAttribute("aria-busy")) { select.value = current; return; }
      current = select.value;
      select.setAttribute("aria-busy", "true");
      const picked = select.value;
      player.setInstrument(voice, picked)
        .then(() => relabelRow(voice, picked)) // only once the sound has loaded; a failed load keeps the old label
        .catch((error) => (status.textContent = error.message))
        .finally(() => select.removeAttribute("aria-busy"));
    });
  }

  await player.load();
  button.addEventListener("click", () => {
    const action = button.dataset.state === "playing" ? player.pause() : player.play();
    Promise.resolve(action).catch(() => (status.textContent = COULDNT_START));
  });
  button.disabled = false;
  for (const voice of VOICES) $(voice).disabled = false;
  status.textContent = "Ready";
  driveMeter(songData);
} catch (error) {
  status.textContent = error.message;
  startHighlight(); // the static headings, even when the song data could not load
}
