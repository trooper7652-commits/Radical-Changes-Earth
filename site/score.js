// The live score: one bar per frame (song time 4i s), one row per voice, every note from song-data.json.
// It is aria-hidden decoration: the frame descriptions and the live region carry the same information.

const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (pitch) => {
  const [, letter, accidental, octave] = /^([A-G])([#b]?)(-?\d+)$/.exec(pitch) ?? [, "C", "", "4"];
  return 12 * (Number(octave) + 1) + SEMITONE[letter] + (accidental === "#") - (accidental === "b");
};

// rows: [{ voice, label }] in the order to draw them. Returns mark(time, { playing, stepped }).
export function drawScore(host, songData, rows) {
  const { frames } = songData;
  const barSeconds = songData.frameSeconds + songData.transitionSeconds;
  const end = frames.length * barSeconds;
  const notes = rows.flatMap(({ voice }, row) => frames.flatMap((f) => f.notes.filter((n) => n.voice === voice).map((n) => ({ ...n, row }))));
  let noteEls = [], barEls = [], playhead = null, toX = () => 0, lastMark = [0, {}];

  function draw() {
    const width = Math.round(host.clientWidth);
    if (!width) return;
    const narrow = width < 600;
    const lane = narrow ? 16 : 28, label = narrow ? 16 : 18, gap = narrow ? 6 : 10;
    const rowH = label + lane + gap, height = rows.length * rowH + 4;
    toX = (t) => (Math.min(Math.max(t, 0), end) / end) * width;
    const parts = [];
    frames.forEach((f, i) => parts.push(`<g class="bar" data-bar="${i}"><rect class="bar-bg" x="${toX(i * barSeconds)}" y="0" width="${toX(barSeconds)}" height="${height}"/></g>`));
    for (let i = 1; i < frames.length; i++) parts.push(`<line class="barline" x1="${toX(i * barSeconds)}" x2="${toX(i * barSeconds)}" y1="0" y2="${height}"/>`);
    rows.forEach(({ voice, label: text }, row) => {
      const y = row * rowH + label;
      parts.push(`<text class="row-label" x="4" y="${y - 4}">${text}</text>`);
      parts.push(`<line class="staff" x1="0" x2="${width}" y1="${y + lane / 2}" y2="${y + lane / 2}"/>`);
    });
    // Pitch sets each note's height inside its own row; length sets its width.
    const range = rows.map(({ voice }) => {
      const m = notes.filter((n) => n.voice === voice).map((n) => midi(n.pitch));
      return [Math.min(...m), Math.max(...m)];
    });
    const thick = narrow ? 3 : 5;
    for (const n of notes) {
      const [lo, hi] = range[n.row];
      const rise = hi > lo ? (midi(n.pitch) - lo) / (hi - lo) : 0.5;
      const y = n.row * rowH + label + (lane - thick) * (1 - rise);
      const x = toX(n.time);
      parts.push(`<rect class="note" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(toX(n.time + n.duration) - x, 3).toFixed(1)}" height="${thick}" rx="${thick / 2}"/>`);
    }
    parts.push(`<line class="playhead" x1="0" x2="0" y1="0" y2="${height}"/>`);
    host.innerHTML = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`;
    noteEls = [...host.querySelectorAll(".note")];
    barEls = [...host.querySelectorAll(".bar")];
    playhead = host.querySelector(".playhead");
    mark(...lastMark);
  }

  // Moves the playhead to song time t and lights the notes sounding now. With stepped (reduced motion)
  // the playhead sits at the start of the current bar instead of sweeping.
  function mark(t, { playing = false, stepped = false } = {}) {
    lastMark = [t, { playing, stepped }];
    if (!playhead) return;
    const bar = Math.min(Math.floor(t / barSeconds), frames.length - 1);
    playhead.setAttribute("transform", `translate(${toX(stepped ? bar * barSeconds : t).toFixed(1)} 0)`);
    barEls.forEach((el, i) => el.classList.toggle("on", i === bar));
    notes.forEach((n, i) => noteEls[i].classList.toggle("on", playing && n.time <= t && t < n.time + n.duration));
  }

  let pending = 0;
  new ResizeObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(draw); }).observe(host);
  draw();
  return mark;
}
