// Page wiring: the player, the instrument pickers, frame descriptions, one-plays-at-a-time,
// and the sound-driven glow. The music itself lives in app.js.
import { SongPlayer } from "./app.js";
import { INSTRUMENTS } from "./instruments.js";

const $ = (id) => document.getElementById(id);
const demo = $("demo");
const visuals = $("visuals");
const button = $("play");
const status = $("status");
const COULDNT_START = "Couldn't start the player";

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

// Plain-words description of a frame, made from song-data.json.
function describe(frame, total) {
  const name = (n) => INSTRUMENTS[n]?.label.toLowerCase() ?? n;
  return `Frame ${frame.index + 1} of ${total}, ${frame.label}. ${frame.key} ${frame.mode}, ` +
    `${Math.round(frame.bpm)} beats per minute, ${frame.shortNotes ? "short" : "long"} notes. ` +
    `${name(frame.melodyInstrument).replace(/^./, (c) => c.toUpperCase())} melody over ${name(frame.bassInstrument)} bass.`;
}

// Sound level (0..1) drives the hero glow. Skipped when the visitor asks for less motion.
function driveGlow(songData) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const hero = document.querySelector(".hero"); // set on the hero only, so a style change stays small
  // Live song: each note flashes the glow, then it fades (read from the data, so the audio graph is untouched).
  const noteTimes = songData.frames.flatMap((f) => f.notes.map((n) => n.time)).sort((a, b) => a - b);
  let analyser, samples;
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
  let last = 0, shown = 0;
  (function tick() {
    let level = 0;
    if (!visuals.paused) {
      const t = visuals.currentTime;
      const since = t - noteTimes.findLast((n) => n <= t);
      level = Number.isFinite(since) ? Math.exp(-since / 0.4) : 0;
    }
    else if (!demo.paused && analyser) {
      analyser.getFloatTimeDomainData(samples);
      level = Math.min(Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length) * 4, 1);
    }
    last += (level - last) * 0.25;
    if (Math.abs(last - shown) > 0.01) hero.style.setProperty("--level", (shown = last).toFixed(2));
    requestAnimationFrame(tick);
  })();
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

  const total = songData.frames.length;
  const descriptions = songData.frames.map((frame) => describe(frame, total));
  $("frames").innerHTML = songData.frames
    .map((f, i) => `<li><h3>${f.label}</h3><p>${descriptions[i]}</p></li>`).join("");
  $("timeline").innerHTML = songData.frames.map(() => "<li></li>").join("");

  const player = new SongPlayer(visuals, songData, Tone);
  window.songPlayer = player; // for the tests and the browser console

  // Announce each frame politely as it plays, and light its segment.
  let shown = -1;
  const showFrame = () => {
    const index = player.activeFrameIndex();
    if (index === shown) return;
    shown = index;
    $("timeline").querySelectorAll("li").forEach((li, i) => li.classList.toggle("on", i === index));
    if (!visuals.paused) $("heard").textContent = descriptions[index];
  };
  visuals.addEventListener("timeupdate", showFrame);
  visuals.addEventListener("playing", () => { shown = -1; showFrame(); });

  // Instrument pickers, built from INSTRUMENTS.
  const options = (voice) => `<option value="">Song's own choice</option>` +
    Object.entries(INSTRUMENTS).map(([key, { label }]) => `<option value="${key}">${label}</option>`).join("");
  for (const voice of ["melody", "bass"]) {
    const select = $(voice);
    select.innerHTML = options(voice);
    let current = select.value;
    select.addEventListener("change", () => {
      // aria-busy, not disabled: a disabled select drops keyboard focus.
      if (select.getAttribute("aria-busy")) { select.value = current; return; }
      current = select.value;
      select.setAttribute("aria-busy", "true");
      player.setInstrument(voice, select.value)
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
  $("melody").disabled = $("bass").disabled = false;
  status.textContent = "Ready";
  driveGlow(songData);
} catch (error) {
  status.textContent = error.message;
}
