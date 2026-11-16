// Highlighter on the headings below the hero (owner round 21). As a heading scrolls up through the reading band,
// a highlighter-yellow mark sweeps across it in reading order (line 1 left to right, then line 2, ...), then
// retracts in the same order. Scroll-linked, so scrolling back reverses it. The marks are aria-hidden
// decoration: each line is a window (two nested clipping boxes moved with translateX) over a yellow band that
// carries a dark copy of the heading's text, so text on yellow is always dark. Not started under reduced motion.

// The reading band, as fractions of the viewport height measured at the heading's top.
const BAND = { start: 0.85, full: 0.55, retract: 0.3, gone: 0.1 };
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function highlightHeadings(headings) {
  const items = [];
  let raf = 0;

  // The heading's rendered lines (from its own text, not the mark), relative to the heading's padding box.
  function measure(item) {
    const { el } = item;
    item.mark?.remove();
    const range = document.createRange();
    range.selectNodeContents(el);
    const box = el.getBoundingClientRect();
    const lines = [];
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const same = lines.find((l) => Math.abs(l.top + l.height / 2 - (r.top + r.height / 2)) < r.height / 2);
      if (same) {
        const right = Math.max(same.left + same.width, r.right);
        same.left = Math.min(same.left, r.left);
        same.width = right - same.left;
      } else lines.push({ left: r.left, top: r.top, width: r.width, height: r.height });
    }
    lines.sort((a, b) => a.top - b.top);
    const cs = getComputedStyle(el);
    const pad = parseFloat(cs.fontSize) * 0.12; // the mark runs a little past the letters, like a real highlighter
    const mark = document.createElement("span");
    mark.className = "hl";
    mark.setAttribute("aria-hidden", "true");
    const text = el.textContent;
    // The copy must break lines exactly like the heading: its fractional width (clientWidth rounds down, which
    // made a heading sized to its own text wrap one word early), plus a pixel of slack.
    const width = box.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth) + 1;
    item.lines = lines.map((l) => {
      const x = l.left - box.left - pad, y = l.top - box.top, w = l.width + 2 * pad, h = l.height;
      const line = document.createElement("span");
      line.className = "hl-line";
      line.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      line.innerHTML = `<span class="hl-in"><span class="hl-ink"><span class="hl-text" style="left:${parseFloat(cs.paddingLeft) - x}px;` +
        `top:${parseFloat(cs.paddingTop) - y}px;width:${width}px"></span></span></span>`;
      line.querySelector(".hl-text").textContent = text;
      mark.appendChild(line);
      return { line, inner: line.firstChild, ink: line.firstChild.firstChild, w, shown: "" };
    });
    item.total = item.lines.reduce((sum, l) => sum + l.w, 0);
    item.mark = mark;
    el.appendChild(mark);
  }

  // Shows the window [x0, x1] of each line: the outer box's right edge sits at x1, the inner box's left edge at
  // x0, and the ink moves back by x0, so the text copy stays exactly over the heading's own letters.
  function update() {
    raf = 0;
    const H = innerHeight;
    const tops = items.map((item) => item.el.getBoundingClientRect().top);
    items.forEach((item, i) => {
      const top = tops[i];
      const on = clamp01((BAND.start * H - top) / ((BAND.start - BAND.full) * H)) * item.total;
      const off = clamp01((BAND.retract * H - top) / ((BAND.retract - BAND.gone) * H)) * item.total;
      let before = 0;
      for (const l of item.lines) {
        const x1 = Math.min(Math.max(on - before, 0), l.w), x0 = Math.min(Math.max(off - before, 0), l.w);
        before += l.w;
        const key = `${x0.toFixed(1)} ${x1.toFixed(1)}`;
        if (key === l.shown) continue;
        l.shown = key;
        l.line.dataset.x0 = x0.toFixed(1);
        l.line.dataset.x1 = x1.toFixed(1);
        l.line.style.visibility = x1 - x0 > 0.5 ? "" : "hidden";
        l.line.style.transform = `translateX(${(x1 - l.w).toFixed(2)}px)`;
        l.inner.style.transform = `translateX(${(x0 - x1 + l.w).toFixed(2)}px)`;
        l.ink.style.transform = `translateX(${(-x0).toFixed(2)}px)`;
      }
    });
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

  // Lines are measured again whenever a heading's size changes (resize, fonts loading, content).
  const resized = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const item = items.find((it) => it.el === entry.target);
      if (item) { measure(item); item.lines.forEach((l) => (l.shown = "")); }
    }
    schedule();
  });
  for (const el of headings) {
    const item = { el };
    items.push(item);
    measure(item);
    resized.observe(el);
  }
  document.fonts?.ready.then(() => { items.forEach(measure); schedule(); });
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  schedule();
}
