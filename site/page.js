// Page wiring: the player, the instrument pickers, frame descriptions, one-plays-at-a-time,
// and the sound-driven glow. The music itself lives in app.js.
import { SongPlayer, VOICES } from "./app.js";
import { INSTRUMENTS } from "./instruments.js";

const $ = (id) => document.getElementById(id);
const demo = $("demo");
const visuals = $("visuals");
const button = $("play");
const status = $("status");
const VOICE_LABELS = { melody: "Melody", bass: "Bass", handpan: "Handpan", panHang: "Hang drum",
  panBalafon: "Balafon", stringBass: "String bass", oboe: "Oboe" };
// What the picker offers, in this order (keys of INSTRUMENTS).
const PICKER = ["sustain strings", "harp", "bells", "string bass", "synth", "piano", "pipe organ", "guitar",
  "handpan", "balafon", "oboe", "bagpipes", "choir", "whistle", "pan pipes"];
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
function describe(frame, total, chosen = {}) {
  const name = (n) => INSTRUMENTS[n]?.label.toLowerCase() ?? n;
  // Every voice that plays in this frame (a null instrument means that voice is silent).
  // The visitor's picks replace the song's own instruments, but a voice that is silent here stays silent.
  const playing = VOICES.filter((voice) => frame[`${voice}Instrument`])
    .map((voice) => `${VOICE_LABELS[voice].toLowerCase()} on ${name(chosen[voice] || frame[`${voice}Instrument`])}`).join(", ");
  return `Frame ${frame.index + 1} of ${total}, ${frame.label}. ${frame.key} ${frame.mode}, ` +
    `${Math.round(frame.bpm)} beats per minute, ${frame.shortNotes ? "short" : "long"} notes. ` +
    `Playing: ${playing}.`;
}

// Each block eases in once as it scrolls into view (opacity and transform only). Never hides anything
// without JavaScript, with reduced motion, or when IntersectionObserver is missing.
function revealOnScroll() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const items = document.querySelectorAll("main h2, main .lede, main .frame, main .timeline, main .controls, " +
    "main .voices, .rules li, .frames, .small li, .small > p, .site-foot");
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("in"); watcher.unobserve(entry.target); }
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el, i) => { el.dataset.reveal = ""; el.style.setProperty("--i", i % 6); watcher.observe(el); });
  // A focused element must never sit invisible inside a block that has not been revealed yet.
  document.addEventListener("focusin", (e) => e.target.closest?.("[data-reveal]")?.classList.add("in"));
  document.documentElement.classList.add("reveal-ready");
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

revealOnScroll();
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
  $("timeline").innerHTML = songData.frames.map((f) => `<li><span>${f.label.replace("Change 2012-2023", "Change")}</span></li>`).join("");

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
    if (!visuals.paused) $("heard").textContent = describe(songData.frames[index], total, player.chosen);
  };
  visuals.addEventListener("timeupdate", showFrame);
  visuals.addEventListener("playing", () => { shown = -1; showFrame(); });

  // Instrument pickers, built from INSTRUMENTS.
  const options = () => `<option value="">Song's choice</option>` +
    PICKER.map((key) => `<option value="${key}">${INSTRUMENTS[key].label}</option>`).join("");
  for (const voice of VOICES) {
    const select = $(voice);
    select.innerHTML = options();
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
  for (const voice of VOICES) $(voice).disabled = false;
  status.textContent = "Ready";
  driveGlow(songData);
} catch (error) {
  status.textContent = error.message;
}
