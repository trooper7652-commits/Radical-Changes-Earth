// The landing Earth (NASA SVS 5313, the team's 2023 frame, as a WebGL sphere), its satellites, and the
// satellite that unfolds into a butterfly and flies off as the page scrolls (owner round 16).
// Everything here is decoration: the canvas has role="img" and a label, the rest is aria-hidden.

const TAU = Math.PI * 2;
const SVG = "http://www.w3.org/2000/svg";
const AUTO_SPIN = TAU / 90; // radians per second: one turn in 90 s
const START_LON = 2.0; // faces the Atlantic, between the Americas and Europe
const START_TILT = 0.32; // shows a little more of the north, where most of the lights are
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// The satellite: two solar panels and a hull, 176 units wide. In flight the panels fold away and the butterfly opens.
const SAT = `
  <g class="panels">
    <rect x="-88" y="-11" width="72" height="22"/><rect x="16" y="-11" width="72" height="22"/>
    <path d="M-70-11v22M-52-11v22M-34-11v22M34-11v22M52-11v22M70-11v22M-88 0h72M16 0h72" class="grid"/>
  </g>
  <g class="hull-group">
    <rect x="-9" y="-16" width="18" height="32" class="hull"/>
    <path d="M0-16v-12" class="mast"/><circle cy="-30" r="3.5" class="beacon"/>
  </g>`;
const SAT_STYLE = `
  .panels rect { fill: #10141c; stroke: #a3abba; stroke-width: 2; }
  .panels .grid { stroke: #a3abba; stroke-width: 1; opacity: .6; fill: none; }
  .hull { fill: #f3f5f8; stroke: #07090e; stroke-width: 2; }
  .mast { stroke: #f3f5f8; stroke-width: 2; }
  .beacon { fill: #ffb547; }`;

// The butterfly, in the site's colours only (night, ink, secondary, sodium, field). Body along the y axis, head up.
// Each wing is drawn for the left side and mirrored: veins, banded spot rows and eyespots on each.
const FOREWING = `
  <path class="wing" d="M-3-24C-12-46-48-80-92-76C-104-74-106-60-100-46C-96-34-92-26-84-16C-66 4-34 12-3 10Z"/>
  <path class="base" d="M-3-24C-10-30-20-30-24-22C-18-14-10-8-3-6Z"/>
  <path class="band" d="M-46-29C-42-18-36-6-27 7L-18 6C-27-6-32-18-36-29Z"/>
  <path class="vein" d="M-4-20C-20-46-52-74-88-76M-4-15C-34-40-72-62-100-60M-4-10C-40-30-78-44-101-44M-4-5C-42-16-76-24-95-30M-4 0C-40-2-70-6-86-16M-4 5C-36 8-62 6-74 0"/>
  <path class="vein" d="M-6-14C-14-20-20-22-26-20C-22-13-15-8-6-5"/>
  <g class="dots"><circle cx="-41" cy="-22" r="1.5"/><circle cx="-37.5" cy="-13" r="1.5"/><circle cx="-32.5" cy="-4" r="1.5"/><circle cx="-27" cy="4" r="1.4"/></g>
  <g class="apical"><circle cx="-36.5" cy="-22" r="1.6"/><circle cx="-33.5" cy="-13" r="1.6"/><circle cx="-29" cy="-4" r="1.5"/><circle cx="-22.5" cy="4" r="1.4"/></g>
  <circle class="e1" cx="-50" cy="0" r="4.4"/><circle class="e2 pale" cx="-50" cy="0" r="3"/><circle class="e3" cx="-50" cy="0" r="1.6"/>`;
const HINDWING = `
  <path class="wing" d="M-3-4C-30-10-70-6-86 20C-94 38-88 62-70 74C-56 84-36 84-24 74C-14 66-6 54-3 42Z"/>
  <path class="base" d="M-3-4C-12-6-20-2-22 6C-14 10-8 12-3 14Z"/>
  <path class="band" d="M-46 26C-38 32-26 34-14 30L-12 37C-26 42-40 40-50 33Z"/>
  <path class="vein" d="M-4 0C-30-4-62 0-84 18M-4 6C-34 10-64 26-90 40M-4 12C-30 22-56 42-78 66M-4 18C-24 34-40 58-52 80M-4 26C-14 42-22 60-30 78"/>
  <path class="vein" d="M-6 4C-14 6-20 9-24 13C-17 15-11 15-6 14"/>
  <g class="dots"><circle cx="-44" cy="31" r="1.5"/><circle cx="-36" cy="34.5" r="1.5"/><circle cx="-27" cy="35.5" r="1.5"/><circle cx="-18" cy="34" r="1.5"/></g>
  <circle class="e1" cx="-32" cy="17" r="4.2"/><circle class="e2" cx="-32" cy="17" r="2.9"/><circle class="e3" cx="-32" cy="17" r="1.6"/>`;
// Owner: the name across the wings ("RADICAL" left, "CHANGES" right). The right side is mirrored, so its word is flipped back.
const NAME = (word, flip) =>
  `<text class="name" x="${flip ? 60 : -60}" y="-42" text-anchor="middle"${flip ? ' transform="scale(-1 1)"' : ""}>${word}</text>`;
const SIDE = (word, flip) => `<g class="hw">${HINDWING}</g><g class="fw">${FOREWING}${NAME(word, flip)}</g>`;
const BODY = `
  <path class="feeler" d="M-1.5-35C-6-50-14-62-22-70M1.5-35C6-50 14-62 22-70"/>
  <ellipse class="club" cx="-23" cy="-71.5" rx="2.2" ry="3.8" transform="rotate(-40 -23 -71.5)"/>
  <ellipse class="club" cx="23" cy="-71.5" rx="2.2" ry="3.8" transform="rotate(40 23 -71.5)"/>
  <path class="abdomen" d="M0-2C4-2 5.5 6 5.5 16C5.5 32 3.5 46 0 56C-3.5 46-5.5 32-5.5 16C-5.5 6-4-2 0-2Z"/>
  <path class="seg" d="M-5.3 8h10.6M-5.5 14h11M-5.5 20h11M-5.3 26h10.6M-5 32h10M-4.5 38h9M-3.8 44h7.6M-2.6 50h5.2"/>
  <ellipse class="thorax" cy="-12" rx="7" ry="14"/>
  <path class="hair" d="M-5-19C-2-17 2-17 5-19M-6-12C-2-10 2-10 6-12M-5-5C-2-3 2-3 5-5"/>
  <circle class="head" cy="-31" r="5.5"/><circle class="eyeball" cx="-3.2" cy="-32" r="1.9"/><circle class="eyeball" cx="3.2" cy="-32" r="1.9"/>`;
const BUTTERFLY = `<g class="wings" opacity="0"><g>${SIDE("RADICAL", false)}</g><g transform="scale(-1 1)">${SIDE("CHANGES", true)}</g>${BODY}</g>`;
// Strokes keep their screen width at every scale (vector-effect), so the lines stay fine when it fills the screen.
const BUTTERFLY_STYLE = `
  .wing { fill: #ffb547; stroke: #07090e; stroke-width: 2.5; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
  .name { font-family: "Archivo", sans-serif; font-stretch: 125%; font-weight: 600; font-size: 11px; letter-spacing: .04em; fill: #07090e; }
  .base { fill: #10141c; } .band, .e1, .e3 { fill: #07090e; }
  .vein { fill: none; stroke: #07090e; stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
  .hair { fill: none; stroke: #a3abba; stroke-width: 1; stroke-linecap: round; vector-effect: non-scaling-stroke; }
  .seg { fill: none; stroke: #10141c; stroke-width: 1; vector-effect: non-scaling-stroke; }
  .dots circle { fill: #f3f5f8; } .apical circle, .e2 { fill: #ffb547; } .e2.pale { fill: #a3abba; }
  .abdomen, .head { fill: #07090e; stroke: #a3abba; stroke-width: 1; vector-effect: non-scaling-stroke; }
  .thorax { fill: #10141c; stroke: #a3abba; stroke-width: 1; vector-effect: non-scaling-stroke; }
  .eyeball { fill: #10141c; stroke: #f3f5f8; stroke-width: 1; vector-effect: non-scaling-stroke; }
  .feeler { fill: none; stroke: #a3abba; stroke-width: 1; stroke-linecap: round; vector-effect: non-scaling-stroke; } .club { fill: #a3abba; }`;

// Three orbits around the globe (viewBox -100..100, globe radius 76). The first carries the butterfly.
const ORBITS = [
  { rx: 97, ry: 22, tilt: -16, period: 96, phase: 1.9, size: 0.12, butterfly: true }, // starts low on the front, left of centre
  { rx: 86, ry: 36, tilt: 24, period: 44, phase: 0.5, size: 0.075 },
  { rx: 88, ry: 58, tilt: -60, period: 58, phase: 4.2, size: 0.065 },
];
const GLOBE_R = 76;

const VERT = `attribute vec2 p; varying vec2 v; void main() { v = p; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision mediump float;
varying vec2 v; uniform sampler2D map; uniform float lon; uniform float tilt; uniform float px;
void main() {
  float r = length(v);
  if (r > 1.0) discard;
  float z = sqrt(1.0 - r * r);
  float ct = cos(tilt), st = sin(tilt);
  vec3 q = vec3(v.x, v.y * ct + z * st, -v.y * st + z * ct);
  float lat = asin(clamp(q.y, -1.0, 1.0));
  float lo = atan(q.x, q.z) + lon;
  vec2 uv = vec2(fract(lo / 6.2831853 + 0.5), 0.5 - lat / 3.1415927);
  // Round 22: more contrast. A gain of 1.6 with a gentle curve brings the city lights up toward sodium-white
  // and lifts the dim lights and the land a little; the ocean stays at the field colour below.
  vec3 c = min(pow(texture2D(map, uv).rgb, vec3(0.9)) * 1.6, 1.0);
  c = max(c, vec3(0.063, 0.078, 0.110)); // the black ocean lifts to the field colour (#10141c), so the Earth stands off the ground without a glow
  float a = 1.0 - smoothstep(1.0 - 1.5 * px, 1.0, r);
  gl_FragColor = vec4(c * a, a);
}`;

function element(name, attrs = {}, parent) {
  const el = document.createElementNS(SVG, name);
  for (const [k, val] of Object.entries(attrs)) el.setAttribute(k, val);
  parent?.appendChild(el);
  return el;
}

export function startEarth(globe, { reduced }) {
  const canvas = globe.querySelector("canvas");
  const back = globe.querySelector(".orbits.back");
  const front = globe.querySelector(".orbits.front");
  element("style", {}, back).textContent = SAT_STYLE;

  // Orbits: the whole ellipse behind the globe, its near half in front of it.
  const sats = ORBITS.map((orbit) => {
    element("ellipse", { class: "ring" + (orbit.butterfly ? " lit" : ""), rx: orbit.rx, ry: orbit.ry, transform: `rotate(${orbit.tilt})` }, back);
    element("path", { class: "ring" + (orbit.butterfly ? " lit" : ""), transform: `rotate(${orbit.tilt})`,
      d: `M${-orbit.rx} 0A${orbit.rx} ${orbit.ry} 0 0 0 ${orbit.rx} 0` }, front);
    const craft = element("g", { class: "craft" });
    craft.innerHTML = orbit.butterfly ? SAT
      : `<rect x="-60" y="-9" width="44" height="18" class="panel"/><rect x="16" y="-9" width="44" height="18" class="panel"/><rect x="-12" y="-12" width="24" height="24" class="hull"/>`;
    return { ...orbit, craft, side: null };
  });
  element("circle", { class: "rim", r: GLOBE_R }, front);
  element("style", {}, front).textContent = SAT_STYLE + ".panel { fill: #10141c; stroke: #a3abba; stroke-width: 3; }";
  const butterfly = sats.find((s) => s.butterfly).craft;

  const placeSats = (seconds) => {
    for (const s of sats) {
      const angle = s.phase + (reduced ? 0 : (seconds * TAU) / s.period);
      const lx = s.rx * Math.cos(angle), ly = s.ry * Math.sin(angle);
      const t = (s.tilt * Math.PI) / 180;
      const x = lx * Math.cos(t) - ly * Math.sin(t), y = lx * Math.sin(t) + ly * Math.cos(t);
      const side = Math.sin(angle) > 0 ? front : back; // the near half of the orbit passes in front
      if (s.side !== side) side.appendChild(s.craft), (s.side = side);
      s.craft.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${s.tilt}) scale(${s.size})`);
    }
  };

  // State of the globe: longitude and tilt, plus a spin velocity for inertia after a drag or an arrow key.
  let lon = START_LON, tilt = START_TILT, velocity = 0, dragging = null, visible = true, raf = 0, last = 0, clock = 0;
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  let draw = () => {};
  if (gl) draw = setUpGl(gl, canvas, () => ({ lon, tilt }), () => wake());
  else globe.classList.add("no-gl");

  const announceTurn = () => (canvas.dataset.turn = String(Math.round((((-lon * 180) / Math.PI) % 360 + 360) % 360)));
  announceTurn();

  function loop(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!reduced) {
      clock += dt;
      if (!dragging) lon -= (AUTO_SPIN + velocity) * dt;
      velocity *= Math.exp(-dt * 2.2);
      placeSats(clock);
    }
    draw();
    raf = running() ? requestAnimationFrame(loop) : 0;
    if (!raf) last = 0;
  }
  const running = () => visible && !document.hidden && !reduced;
  function wake() {
    if (raf) return;
    if (running()) raf = requestAnimationFrame(loop);
    else requestAnimationFrame(() => draw()); // reduced motion: draw once per change
  }

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }).observe(globe);
  document.addEventListener("visibilitychange", wake);
  placeSats(0);
  wake();

  // Drag to spin, with inertia (none under reduced motion: the globe moves only while it is held).
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    dragging = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    velocity = 0;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const r = canvas.clientWidth / 2 || 1;
    const dLon = (e.clientX - dragging.x) / r;
    const dt = Math.max((e.timeStamp - dragging.t) / 1000, 1 / 120);
    lon -= dLon;
    tilt = clamp(tilt + (e.clientY - dragging.y) / r, -0.9, 0.9);
    if (!reduced) velocity = velocity * 0.6 + (dLon / dt) * 0.4;
    dragging = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    wake();
  });
  const release = () => {
    if (!dragging) return;
    dragging = null;
    velocity = reduced ? 0 : clamp(velocity, -6, 6);
    announceTurn();
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  // Arrow keys turn it by 15 degrees (and tilt by about 6).
  canvas.addEventListener("keydown", (e) => {
    const turn = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    const lean = { ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (!turn && !lean) return;
    e.preventDefault();
    if (turn && reduced) lon -= (turn * Math.PI) / 12;
    else if (turn) velocity += turn * 0.58; // the inertia decays to about 15 degrees of turn
    if (lean) tilt = clamp(tilt + lean * 0.1, -0.9, 0.9);
    // The reported turn includes where the inertia will carry it.
    const ahead = reduced ? lon : lon - velocity / 2.2;
    canvas.dataset.turn = String(Math.round((((-ahead * 180) / Math.PI) % 360 + 360) % 360));
    wake();
  });

  return { butterfly, sats };
}

function setUpGl(gl, canvas, view, redraw) {
  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const p = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(p);
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(program, name);
  const [uLon, uTilt, uPx] = [u("lon"), u("tilt"), u("px")];
  gl.clearColor(0, 0, 0, 0);

  let ready = false;
  const texture = gl.createTexture();
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    ready = true;
    redraw();
  };
  image.src = "img/earth.jpg";

  const fit = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const size = Math.round(canvas.clientWidth * ratio);
    if (size && canvas.width !== size) { canvas.width = canvas.height = size; gl.viewport(0, 0, size, size); }
  };
  new ResizeObserver(() => { fit(); redraw(); }).observe(canvas);

  return () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!ready || !canvas.width) return;
    const { lon, tilt } = view();
    gl.uniform1f(uLon, lon);
    gl.uniform1f(uTilt, tilt);
    gl.uniform1f(uPx, 2 / canvas.width);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

// The transition from the first viewport into "Hear the map change." (owner rounds 16, 18 and 19).
// Scrolling down out of the hero, once its text has been seen, plays a timed sequence over the page:
//   fly   the satellite unfolds into the butterfly, dips to the bottom-left and flies up and to the right,
//         unhurried, growing until its wings cover the whole screen;
//   hold  fully covered for a moment, while the page moves to the next section behind it (kept hidden);
//   exit  it flies off the top-right, accelerating gently, wings beating;
//   blank only the night ground, for a short pause;
//   rise  the section rises into place from below, in up to four staggered groups; what is below it follows.
// Scrolling input is held while it runs. Never started under reduced motion (see page.js).
// How long each phase lasts (ms): the owner's tuning knobs. Round 21 shortened the two still moments;
// round 22 made the fly-in and exit slower and calmer.
export const DURATION = { fly: 2200, hold: 380, exit: 1200, blank: 450 };
// At its largest the wings span this share of the screen's width (round 22: no longer the whole screen).
const PEAK = { wide: 0.75, tall: 0.88, height: 0.86 };
const SPAN = { width: 212, top: -76, bottom: 84 }; // the open butterfly's extent, in its own units
// The calm ease of the flight, cubic-bezier(0.45, 0, 0.25, 1), solved for x by bisection.
const calm = (x) => {
  const at = (t, a, b) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t * t + t ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (at(mid, 0.45, 0.25) < x) lo = mid; else hi = mid; }
  return at((lo + hi) / 2, 0, 1);
};
const T = { fly: DURATION.fly }; // phase ends, ms
T.hold = T.fly + DURATION.hold;
T.exit = T.hold + DURATION.exit;
T.blank = T.exit + DURATION.blank;
const RISE = { ms: 800, stagger: 70 }; // the section's rise, per group
const easeOut = (s) => 1 - (1 - s) ** 3;
const smooth = (a, b, v) => { const s = clamp((v - a) / (b - a), 0, 1); return s * s * (3 - 2 * s); };
const RISE_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

export function startFlight(flight, anchor, section, heading, onRise = () => {}) {
  // A night curtain under a full-viewport SVG in CSS pixels, so the butterfly is drawn as vectors at every size.
  // The curtain fades in under the butterfly near the end of the fly-in and hides the jump to the next section.
  flight.innerHTML = `<div class="curtain"></div><svg width="100%" height="100%"><style>${SAT_STYLE}${BUTTERFLY_STYLE}</style>` +
    `<g class="craft-fly">${BUTTERFLY}${SAT}</g></svg>`;
  const curtain = flight.querySelector(".curtain");
  let craft, wings, panels, hull, fores, hinds;
  const parts = () => {
    craft = flight.querySelector(".craft-fly");
    [wings, panels, hull] = [".wings", ".panels", ".hull-group"].map((s) => flight.querySelector(s));
    [fores, hinds] = [".fw", ".hw"].map((s) => flight.querySelectorAll(s));
  };
  parts();
  // Chrome can leave parts of the drawing unpainted after a long zoom (the spots, eyespots and veins vanished
  // at full size, while a fresh copy of the same nodes painted them). A fresh copy is swapped in at each phase.
  const repaint = () => { craft.replaceWith(craft.cloneNode(true)); parts(); };
  const copy = anchor.closest(".hero").querySelector(".hero-copy");
  const sectionTop = () => section.getBoundingClientRect().top + scrollY;
  const inHero = () => scrollY < sectionTop() - 2;
  // The hero's text has been on screen to its end (on phones the lede runs below the first view): until then
  // scrolling is native, so nothing is skipped unread.
  const heroSeen = (y = scrollY) => copy.getBoundingClientRect().bottom + scrollY - y <= innerHeight + 8;
  // The section rises in these groups (heading, left notes, video, right notes); everything after it follows.
  const groups = [".listen-head", ".notes ul:first-child", ".screen", ".notes ul:last-child"]
    .map((selector) => section.querySelector(selector)).filter(Boolean);
  const below = () => [...document.querySelectorAll(".listen ~ *, .band ~ *, .site-foot")];
  let running = null;

  // Keeps the section and what follows it hidden until their turn, then lifts them in.
  function veilAndRise(delay) {
    // Settle the scroll-reveal state now, under the veil, so it never fights the rise.
    for (const el of [...groups, ...below()]) el.closest("[data-reveal]")?.classList.add("in");
    const shift = `translateY(${Math.round(innerHeight * 0.1)}px)`;
    const rises = groups.map((el, i) => el.animate(
      [{ opacity: 0, transform: shift }, { opacity: 1, transform: "none" }],
      { duration: RISE.ms, delay: delay + i * RISE.stagger, easing: RISE_EASE, fill: "backwards" }));
    const after = delay + (groups.length - 1) * RISE.stagger + RISE.ms;
    below().forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: after, fill: "backwards" }));
    return Promise.all(rises.map((a) => a.finished.catch(() => {})));
  }

  function play() {
    if (running) return running;
    running = new Promise((resolve) => {
      const w = innerWidth, h = innerHeight;
      const box = anchor.getBoundingClientRect();
      const start = [box.left + box.width / 2, box.top + box.height / 2];
      const s0 = Math.max(box.width / 176, 0.1); // the satellite's size on screen (176 units wide)
      // Its largest size: the wings span PEAK of the width, and it stays fully on screen with room around it.
      const peak = Math.min(((h > w ? PEAK.tall : PEAK.wide) * w) / SPAN.width, (PEAK.height * h) / (SPAN.bottom - SPAN.top));
      const centre = [w / 2, h / 2 - ((SPAN.top + SPAN.bottom) / 2) * peak];
      const path = [start, [w * 0.06, h * 0.94], [w * 0.32, h * 0.92], centre];
      let t0 = 0, last = 0, phase = 0, jumped = null, painted = "", rose = false;
      anchor.style.opacity = "0";
      flight.hidden = false;
      flight.classList.add("run");

      const frame = (now) => {
        if (!t0) t0 = last = now;
        const t = now - t0, dt = (now - last) / 1000;
        last = now;
        flight.dataset.phase = t < T.fly ? "fly" : t < T.hold ? "hold" : t < T.exit ? "exit" : t < T.blank ? "blank" : "rise";
        // Covered: the page moves to the next section behind the wings; it stays hidden until it rises in.
        if (t >= T.fly && !jumped) {
          scrollTo({ top: sectionTop(), behavior: "instant" });
          jumped = veilAndRise(T.blank - t);
        }
        if (t >= T.exit) {
          flight.hidden = true; // gone: the blank night ground, then the rise
          if (t >= T.blank && !rose) { rose = true; onRise(); }
          if (t >= T.blank) return jumped.then(finish);
          return requestAnimationFrame(frame);
        }
        const unfold = easeOut(clamp(t / 400, 0, 1));
        const s = calm(clamp((t - 120) / (T.fly - 120), 0, 1));
        const out = calm(clamp((t - T.hold) / (T.exit - T.hold), 0, 1));
        let [x, y] = [0, 1].map((k) => (1 - s) ** 3 * path[0][k] + 3 * (1 - s) ** 2 * s * path[1][k] + 3 * (1 - s) * s * s * path[2][k] + s ** 3 * path[3][k]);
        let scale = s0 + (peak - s0) * s; // grows steadily with the eased flight, no zoom burst at the end
        let turn = -12 * Math.sin(Math.PI * s); // banks through the turn, level when it arrives
        if (out > 0) {
          x += out * (w / 2 + 130 * scale);
          y -= out * (h / 2 + 110 * scale);
          turn = 8 * out;
        }
        // The night curtain fades in under it over the last part of the fly-in, so the page jump is hidden.
        curtain.style.opacity = smooth(0.55, 0.95, s).toFixed(3);
        // Wing beats: calm, forewing and hindwing slightly out of phase, each bending as it folds (a squeeze plus a
        // skew reads as the wing turning away). The wings settle fully open as it arrives and rest through the
        // pause, then beat again as it leaves.
        const beat = 0.85 * (t < T.hold ? 1 - smooth(0.75, 1, s) : clamp((t - T.hold) / 400, 0, 1));
        phase += dt * TAU * 1.6;
        const fold = (lag, depth) => 1 - beat * depth * (0.5 - 0.5 * Math.cos(phase - lag));
        const fore = fold(0, 0.62), hind = fold(0.7, 0.5);
        // CSS transforms, not SVG transform attributes: Chrome stops repainting some of a group's children when an
        // ancestor's transform attribute changes every frame (the spots and veins vanished at full size).
        fores.forEach((el) => (el.style.transform = `scale(${fore.toFixed(3)}, 1) skewY(${((1 - fore) * 14).toFixed(2)}deg)`));
        hinds.forEach((el) => (el.style.transform = `scale(${hind.toFixed(3)}, 1) skewY(${((1 - hind) * 10).toFixed(2)}deg)`));
        // The satellite opens: its panels fold away as the wings spread from them.
        wings.style.opacity = unfold.toFixed(3);
        wings.style.transform = `scale(${(0.3 + 0.7 * unfold).toFixed(3)})`;
        panels.style.opacity = (1 - unfold).toFixed(3);
        hull.style.opacity = (1 - unfold).toFixed(3);
        craft.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        if (painted !== flight.dataset.phase) { painted = flight.dataset.phase; if (painted !== "fly") repaint(); }
        requestAnimationFrame(frame);
      };
      const finish = () => {
        flight.hidden = true;
        curtain.style.opacity = "0";
        flight.classList.remove("run");
        delete flight.dataset.phase;
        anchor.style.opacity = "";
        heading.focus({ preventScroll: true });
        running = null;
        resolve();
      };
      requestAnimationFrame(frame);
    });
    return running;
  }

  // Downward input in the hero, once its text has been seen, starts it; while it runs, input is held (dropped).
  const hold = (e) => { if (running) { e.preventDefault(); return true; } return false; };
  const ready = () => inHero() && heroSeen();
  addEventListener("wheel", (e) => {
    if (hold(e) || e.deltaY <= 0 || e.ctrlKey || !ready()) return;
    e.preventDefault();
    play();
  }, { passive: false });
  let touchY = null;
  addEventListener("touchstart", (e) => (touchY = e.touches[0].clientY), { passive: true });
  addEventListener("touchmove", (e) => {
    if (hold(e) || touchY === null || touchY - e.touches[0].clientY < 6 || !ready()) return;
    e.preventDefault();
    touchY = null;
    play();
  }, { passive: false });
  const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"];
  addEventListener("keydown", (e) => {
    if (!SCROLL_KEYS.includes(e.key) || hold(e) || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    // Arrow keys and Space belong to the focused control (the Earth, video, selects, buttons, links).
    if (e.target.closest?.("input, select, textarea, button, a, video, canvas, [contenteditable]")) return;
    if (!["ArrowDown", "PageDown", " "].includes(e.key) || !ready()) return;
    e.preventDefault();
    play();
  });
  // Clicks are held too while it runs.
  document.addEventListener("click", (e) => { if (running) { e.preventDefault(); e.stopPropagation(); } }, true);
  // In-page links: "Listen" plays it (the demo action calls play() itself); others jump without it.
  let linkedAt = -Infinity;
  document.addEventListener("click", (e) => {
    const link = e.target.closest?.('a[href^="#"]');
    if (!link) return;
    linkedAt = performance.now();
    if (link.getAttribute("href") !== "#listen" || e.defaultPrevented || !inHero()) return;
    e.preventDefault();
    play();
  });
  // Any other way down out of the hero (scrollbar, middle-click scroll), once its text was already on screen,
  // but not a link jump or a focus move.
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY, prev = lastY;
    lastY = y;
    if (running || performance.now() - linkedAt < 1500 || y <= prev) return;
    const focusInHero = document.activeElement === document.body || anchor.closest(".hero")?.contains(document.activeElement);
    if (prev < sectionTop() - 2 && heroSeen(prev) && y < sectionTop() + innerHeight / 2 && focusInHero) play();
  }, { passive: true });

  return { play };
}
