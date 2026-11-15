// The landing Earth (NASA SVS 5313, the team's 2023 frame, as a WebGL sphere), its satellites, and the
// satellite that unfolds into a butterfly and flies off as the page scrolls (owner round 16).
// Everything here is decoration: the canvas has role="img" and a label, the rest is aria-hidden.

const TAU = Math.PI * 2;
const SVG = "http://www.w3.org/2000/svg";
const AUTO_SPIN = TAU / 90; // radians per second: one turn in 90 s
const START_LON = 2.0; // faces the Atlantic, between the Americas and Europe
const START_TILT = 0.32; // shows a little more of the north, where most of the lights are
const easeInOut = (s) => (s < 0.5 ? 4 * s * s * s : 1 - (-2 * s + 2) ** 3 / 2);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// The craft: a satellite with two solar panels, and the butterfly hidden inside it.
// Wings are drawn once for the left side and mirrored. page.js and the flight change only opacity and transforms.
const WING = `<path d="M-5-6C-22-58-92-74-94-30C-96 0-50 6-5 0Z"/><path d="M-5 4C-40 6-72 30-60 56C-50 76-16 50-4 10Z"/>
  <circle cx="-62" cy="-34" r="7" class="spot"/><circle cx="-36" cy="40" r="5" class="spot"/>`;
export const CRAFT = `
  <g class="wings" opacity="0">
    <g class="flap">${WING}</g><g transform="scale(-1 1)"><g class="flap">${WING}</g></g>
    <path d="M-2-24C-6-40-14-50-24-56M2-24C6-40 14-50 24-56" class="feelers"/>
    <ellipse rx="6" ry="30" class="body"/>
  </g>
  <g class="panels">
    <rect x="-88" y="-11" width="72" height="22"/><rect x="16" y="-11" width="72" height="22"/>
    <path d="M-70-11v22M-52-11v22M-34-11v22M34-11v22M52-11v22M70-11v22M-88 0h72M16 0h72" class="grid"/>
  </g>
  <g class="hull-group">
    <rect x="-9" y="-16" width="18" height="32" class="hull"/>
    <path d="M0-16v-12" class="mast"/><circle cy="-30" r="3.5" class="beacon"/>
  </g>`;
const CRAFT_STYLE = `
  .wings path { fill: #ffb547; stroke: #07090e; stroke-width: 3; stroke-linejoin: round; }
  .wings .spot { fill: #f3f5f8; }
  .wings .body { fill: #07090e; stroke: #f3f5f8; stroke-width: 2; }
  .wings .feelers { fill: none; stroke: #f3f5f8; stroke-width: 2.5; stroke-linecap: round; }
  .panels rect { fill: #1a2030; stroke: #c9ced6; stroke-width: 2; }
  .panels .grid { stroke: #c9ced6; stroke-width: 1; opacity: .55; fill: none; }
  .hull { fill: #f3f5f8; stroke: #07090e; stroke-width: 2; }
  .mast { stroke: #f3f5f8; stroke-width: 2; }
  .beacon { fill: #ffb547; }`;

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
  vec3 c = min(texture2D(map, uv).rgb * 1.3, 1.0);
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
  element("style", {}, back).textContent = CRAFT_STYLE;

  // Orbits: the whole ellipse behind the globe, its near half in front of it.
  const sats = ORBITS.map((orbit) => {
    element("ellipse", { class: "ring" + (orbit.butterfly ? " lit" : ""), rx: orbit.rx, ry: orbit.ry, transform: `rotate(${orbit.tilt})` }, back);
    element("path", { class: "ring" + (orbit.butterfly ? " lit" : ""), transform: `rotate(${orbit.tilt})`,
      d: `M${-orbit.rx} 0A${orbit.rx} ${orbit.ry} 0 0 0 ${orbit.rx} 0` }, front);
    const craft = element("g", { class: "craft" });
    craft.innerHTML = orbit.butterfly ? CRAFT
      : `<rect x="-60" y="-9" width="44" height="18" class="panel"/><rect x="16" y="-9" width="44" height="18" class="panel"/><rect x="-12" y="-12" width="24" height="24" class="hull"/>`;
    return { ...orbit, craft, side: null };
  });
  element("circle", { class: "rim", r: GLOBE_R }, front);
  element("style", {}, front).textContent = CRAFT_STYLE + ".panel { fill: #1a2030; stroke: #c9ced6; stroke-width: 3; }";
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

// The flight: as the page scrolls from the top, the butterfly satellite leaves its orbit, unfolds,
// drops to the bottom-left, then rises up and to the right, growing until it sweeps across the screen
// and leaves past the top-right corner. Driven by scroll position, smoothed so it keeps a little momentum.
export function startFlight(flight, anchor) {
  // Drawn at 1000 px and scaled down, so it stays sharp when it grows to cover the screen.
  flight.innerHTML = `<svg viewBox="-100 -70 200 140" width="1000" height="700"><style>${CRAFT_STYLE}</style>${CRAFT}</svg>`;
  const wings = flight.querySelector(".wings");
  const panels = flight.querySelector(".panels");
  const hull = flight.querySelector(".hull-group");
  const flaps = flight.querySelectorAll(".flap");
  let shown = 0, raf = 0, last = 0, phase = 0, prevShown = 0;
  const target = () => clamp(scrollY / (innerHeight * 1.15), 0, 1);

  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    const goal = target();
    shown += (goal - shown) * (1 - Math.exp(-dt * 9));
    if (Math.abs(goal - shown) < 0.0005) shown = goal;
    render(dt);
    const moving = shown !== goal || (shown > 0 && shown < 1);
    raf = moving ? requestAnimationFrame(frame) : 0;
    if (!raf) last = 0;
  }

  function render(dt) {
    const airborne = shown > 0.002 && shown < 0.999;
    flight.hidden = !airborne;
    anchor.style.opacity = shown > 0.002 ? "0" : ""; // the orbiting satellite becomes the flying one
    if (!airborne) return;
    const w = innerWidth, h = innerHeight, big = Math.max(w, h);
    const box = anchor.getBoundingClientRect();
    const start = [box.left + box.width / 2, box.top + box.height / 2];
    const unfold = clamp(shown / 0.16, 0, 1);
    const s = easeInOut(clamp((shown - 0.04) / 0.96, 0, 1));
    // A cubic Bezier: the orbit, the bottom-left corner, low across the middle, then out past the top-right.
    const pts = [start, [w * 0.06, h * 0.96], [w * 0.52, h * 0.86], [w + big * 0.35, -big * 0.4]];
    const [x, y] = [0, 1].map((k) => (1 - s) ** 3 * pts[0][k] + 3 * (1 - s) ** 2 * s * pts[1][k] + 3 * (1 - s) * s * s * pts[2][k] + s ** 3 * pts[3][k]);
    const startScale = Math.max(box.width / 176, 0.12); // the craft is 176 units wide at scale 1
    const scale = startScale + ((big * 2.4) / 200 - startScale) * s ** 2.2;
    const opacity = s < 0.8 ? 1 : 1 - (s - 0.8) / 0.2;
    // Wings beat on their own while it flies, and faster while the page is moving.
    phase += dt * TAU * 2.4 + Math.abs(shown - prevShown) * 60;
    prevShown = shown;
    const beat = 0.6 + 0.4 * Math.cos(phase);
    flaps.forEach((el) => el.setAttribute("transform", `scale(${(0.2 + (beat - 0.2) * unfold).toFixed(3)} 1)`));
    wings.setAttribute("opacity", unfold.toFixed(3));
    panels.setAttribute("opacity", (1 - unfold).toFixed(3));
    hull.setAttribute("opacity", (1 - unfold).toFixed(3));
    panels.setAttribute("transform", `scale(${1 - 0.6 * unfold} ${1 - 0.8 * unfold})`);
    flight.style.opacity = opacity.toFixed(3);
    flight.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(-8 + 30 * s).toFixed(2)}deg) scale(${(scale / 5).toFixed(5)})`;
  }

  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener("scroll", wake, { passive: true });
  addEventListener("resize", wake);
  wake();
}
