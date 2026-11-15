# Website redesign: design plan (no code yet)

**Status:** design plan only. The build starts after the owner picks a direction and answers the questions in section 11.
**Builder (owner, 2026-11-15):** a head-chef subagent, Claude Opus 5.5 at effort xhigh, builds the revised website. For this build, that replaces the earlier rule that free models write the website code.
**Audience:** the global Space Apps judges, and the challenge's core audience: blind and low-vision listeners.
**Mode:** Persuade. In about ten seconds a judge should know what this is (NASA's night-lights map turned into music), why it matters (you can hear the change without seeing it), and what to do (press play).

Impeccable process notes:
- The skill's dice roll and decision page were skipped, because the owner pinned the reference (fabric.vc) and the format (three directions plus a recommendation).
- This machine has no image generation, so the build is code-first.
- The PRODUCT.md facts are drafted in section 10, to be written after the owner confirms them.

---

## 1. Audit of the current page: the five highest-impact changes

| # | Pattern found | Evidence | Change |
|---|---|---|---|
| 1 | **Weak hierarchy, and a first viewport that doesn't say what this is.** The biggest text is a film quote. The `h1` "Radical changes" is a 20 px label, and there is no primary action. | Detector: "flat type hierarchy". h1 20 px, body 19 px, h3 22 px; largest step 1.10:1 (target 1.25). | A real headline, a factual lede and one primary action ("Play the 30-second demo"). The quote moves to the "Why sound" section; the content is kept. |
| 2 | **Near-black ground with glowing orange/blue edges.** A planet rim glow, a radial glow that breathes forever, and orange→blue gradient bars. This is the look AI tools produce for any space topic. | `styles.css:22-31, 53-54, 80` | No glows and no gradients. Colour has jobs: one accent marks "now playing" and the primary action. |
| 3 | **Seven equal-size cards whose bars look like data but mean nothing.** The bar widths step 18 % → 100 % by position. | `styles.css:78-80, 96-97` | A numbered two-column list (measurement → what it does to the music), each rule with one real value from `song-data.json`. |
| 4 | **Rounded containers everywhere, plus a side-tab stripe.** 18 px video frames with drop shadows, 14 px rule cards, 14 px picker cards that lift on hover (they aren't clickable), and a 4 px left stripe on the frame list. | Detector warning "side-tab" at `styles.css:86`; `:48, 68-70, 79` | Images become square-edged plates on a dark band. Hairline rules replace boxes. The pickers become a plain labelled column. No side stripes. |
| 5 | **A default display face.** Syne 800 is on the skill's list of overused faces; Atkinson Hyperlegible is the only deliberate type choice. | `index.html:12`, `styles.css:34, 46` | An expanded grotesk for display, set at fabric.vc's 100 % leading. Atkinson Hyperlegible Next stays for body text because the Braille Institute designed it for low-vision readers. |

Checked and **not found**: purple gradients, Inter or another default UI font, glass/blur effects.

## 2. Reference anchor: fabric.vc, measured from its stylesheet

| Property | fabric.vc (measured) | Radical changes (planned) |
|---|---|---|
| Display type | Monument Extended Regular, 48-56 px heroes, up to 6.2vw; line-height 100 % | Archivo, width 125 (expanded), weight 500, `clamp(48px, 7vw, 112px)`, line-height 1.0, tracking -0.01em |
| Body | Rale Grotesk 20 px / 150 %; hero lede 32/38 px | Atkinson Hyperlegible Next 19 px / 1.6 (low-vision floor); lede 24 px / 1.4 |
| Labels | Inter Tight 500, 11-14 px, uppercase, 0.04-0.08em, line-height 100 % | Atkinson Hyperlegible Next 700, 13 px, uppercase, 0.08em |
| Spacing | 4 px base, tokens 0.25 rem to 11 rem (4-176 px) | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 176 px |
| Ground and ink | `#f5f7fa` ground, `#000` text, `#626262` grey, hairline `#9fa1a3` at 22 % | `#f3f5f8` paper, `#0c0e13` ink, `#4a5160` secondary, `#c9ced6` staff lines |
| Accent discipline | One accent, `#f37021`, used only for hover, chips, counters and small markers | One accent, sodium amber, used only for "now playing", the primary action and focus on dark |
| Radius | 50 px pills on buttons; 4-8 px elsewhere | A pill on the single primary button only; 0 everywhere else |
| Motion | 0.2-0.5 s colour transitions, one 0.6 s opacity ease | 120/200/350/600 ms and one ease (section 4) |
| Width | 1440 px max; text blocks 384-900 px | 12-column grid, 1440 px max; text measure 62ch |

## 3. Page structure (shared by all three directions)

1. **Top bar:** skip link, then the wordmark "Radical changes" on the left and anchor links (Listen · Play · How it works · Credits) on the right. On phones it shows the wordmark and "Listen" only, with no hamburger.
2. **First viewport:** label, headline, lede and primary action. The night band with the seven frames starts just above the fold.
3. **Listen:** the judged 30-second video, large, on the night band, with a one-line caption.
4. **Play it live:**
   - the muted visuals video and the score/strip
   - Play/Pause
   - one picker per voice, set to the video's instruments by default (owner, 2026-11-15)
   - the status line and the live description
5. **How it works:** seven rules (six measurements plus the change voices) as a numbered list, each with a real value from the song.
6. **Frame by frame:** seven entries, each with a thumbnail, the year, BPM and key (set in mono), and the generated description. This is the text a screen reader hears.
7. **Why sound:** a short statement of the challenge theme, with the Bohr quote as a pull quote.
8. **Sources and credits, AI disclosure, footer:** the footer keeps the exact team line.

What the page keeps:
- every working behaviour: the demo video, the live player, the pickers, the live region, the generated descriptions, the credits and the disclosure
- every element ID the tests use: `#demo`, `#visuals`, `#play`, `#status`, `#heard`, `#frames`, `#timeline`, and the select IDs

## 4. System for the recommended direction (A, "The Score")

**Colour tokens**
| Token | Value | Job |
|---|---|---|
| `--paper` | `#f3f5f8` | Page ground (cool, not cream) |
| `--ink` | `#0c0e13` | Text, the focus ring on paper |
| `--ink-2` | `#4a5160` | Secondary text |
| `--staff` | `#c9ced6` | Hairlines and staff lines (decoration only) |
| `--night` | `#07090e` | The full-bleed band holding the NASA frames and videos |
| `--ink-night` / `--ink-2-night` | `#f3f5f8` / `#a3abba` | Text on the night band |
| `--sodium` | `#ffb547` | Now playing, the playhead, sounding notes, the primary button, focus on night |
| `--sodium-ink` | `#a65000` | Links and accent marks on paper |

The colour comes from the subject. Amber sodium-vapour streetlights are what a lot of the night-lights change is about: older amber lamps being replaced by white LEDs. Blue appears only inside NASA's imagery.

**Type pairing**
- Display: **Archivo** at width 125, weight 500, for the headline and section headings.
- Body and UI: **Atkinson Hyperlegible Next** 400/700.
- Data (BPM, key, pitch): **Atkinson Hyperlegible Mono** 400.
- All three are checked available on Google Fonts.
- Scale: 13 (label) · 16 (small) · 19 (body) · 24 (lede/h3) · 48 (h2) · `clamp(48, 7vw, 112)` (display). Every step from body upward is ≥ 1.25.

**Spacing:** a 4 px base, using the tokens in section 2.
- Sections: 128 px apart on desktop, 64 px on phones.
- Space above a heading: 48 px. Space below it: 24 px.
- Gaps between blocks: 48 px.

**Grid:** 12 columns, 32 px gutters, 64 px margins at 1440; 6 columns at 768; 4 columns with 20 px margins at 390.

**Motion rules**
- Tokens: press 120 ms, hover/colour 200 ms, state 350 ms, reveal 600 ms. One ease: `cubic-bezier(0.23, 1, 0.32, 1)`.
- Only `transform` and `opacity` animate.
- Motion is allowed only for these:
  1. the playhead and sounding notes, synced to the audio (the signature)
  2. the hero's one-time entrance, at most 700 ms
  3. sections revealing once on first view, at most 4 staggered children at 60 ms
  4. state feedback: a button press, a select loading
- Banned: idle loops (the current breathing glow), hover lifts on things you can't click, parallax, gradient sweeps.
- With `prefers-reduced-motion`, nothing moves. The playhead jumps from frame to frame, and content is visible by default.

## 5. Accessibility checks (calculated 2026-11-15, WCAG 2.2)

**Contrast**
| Pair | Ratio | Needs | Result |
|---|---|---|---|
| ink on paper | 17.67:1 | 4.5 | pass |
| ink-2 on paper | 7.29:1 | 4.5 | pass |
| sodium-ink on paper (links) | 5.10:1 | 4.5 | pass |
| paper text on night | 18.23:1 | 4.5 | pass |
| ink-2-night on night | 8.62:1 | 4.5 | pass |
| sodium on night (playhead, focus) | 11.34:1 | 3 | pass |
| ink on the sodium button | 10.99:1 | 4.5 | pass |
| staff lines on paper | 1.45:1 | decoration only | exempt; never carries meaning |

The other directions also pass, with one rule for C: its yellow is never used as text (1.44:1 on white). Yellow appears only behind black text (14.54:1).

**Keyboard focus**
- `:focus-visible` draws a 3 px solid outline with a 3 px offset: `--ink` on paper, `--sodium` on the night band. It is never removed.
- Tab order: skip link → nav → Play demo → demo controls → Play live → pickers in voice order → links.
- A select keeps focus while its sounds load (the existing `aria-busy` pattern).
- The score drawing is `aria-hidden`. The frame descriptions and the polite live region carry the same information.
- Targets are at least 44 × 44 px.

**Responsive**
- **1440 and 1024:** the headline spans 7 of 12 columns.
- **768:** the headline spans the full width; the rules list becomes one column.
- **390:**
  - the seven bars of the score compress to fit (about 48 px each, with notes as dots), so there's no sideways scroll
  - the pickers go to one column (two from 600 px, three from 1024 px)
- No horizontal page scroll down to 320 px.
- The page works at 200 % text zoom (rem and clamp sizes).

## 6. Three directions

**A. "The Score"** (light ground, music-notation world)
- **Thesis:** the page is the printed score of the song, and the seven NASA frames are its seven bars.
- **Palette and type:** the section 4 palette, with Archivo expanded, Atkinson Next and Atkinson Mono.
- **First viewport:**
  - left 7 columns: the label, a three-line headline, the lede and the Play button
  - the night band with the seven-frame strip starts just above the fold
- **Signature:** a live score drawn from `song-data.json`. Six or seven voice rows, each starting with its instrument picker. A playhead sweeps in sync with the visuals video, and each note lights amber as it sounds.
- **Why:** judges can *see* that the music comes from the data. The light page stands out among dark space-themed entries, and this is the closest match to fabric's neutral ground and one-accent discipline.
- **Risk:**
  - it's a light page for a night subject (the full-bleed band carries the dark)
  - the score drawing is the biggest build item
  - the rows must be labelled by instrument, not by clef, so non-musicians can read them

**B. "Black Marble"** (the night imagery is the page; NASA calls its night-lights product Black Marble)
- **Palette:** black `#020306`, ink `#f2f4f7`, secondary `#9aa3b2`, sodium `#ffb547` for the playing state only. No glows, no gradients, and a 70 % black scrim wherever text sits over lit areas.
- **Type:** Anybody at width 140, weight 600, for display; Atkinson Hyperlegible Next for body.
- **First viewport:** the 2012 frame full-bleed, the headline bottom-left over the dark ocean, Play bottom-right.
- **Signature:** a pinned stage that steps 2012 → 2017 → 2022 → 2023 → change as you scroll. Each step shows its measured numbers as big numerals (BPM, key), and you can play its four seconds.
- **Why:** the most immersive option; the change is visible at full size.
- **Risk:**
  - the ground is the same near-black as the AI default for space topics
  - text over imagery fights contrast
  - scroll-pinning is harder on phones and for keyboard users
  - large images slow loading

**C. "Large Print"** (the world of accessible signage and large-print books)
- **Palette:** white `#ffffff`, black `#000000`, secondary `#333840`, highlight yellow `#ffd23f` only *behind* black text, and a black band for the videos.
- **Type:** Atkinson Hyperlegible Next 800 as the display face, so one family designed for low vision works at every size; Atkinson Mono for data.
- **First viewport:** a giant two-line statement, black on white, with the demo video full width under it and a yellow "Sound on" marker.
- **Signature:** while the song plays, the current frame's description is highlighted line by line, like a large-print reader.
- **Why:** the visual language itself puts the low-vision audience first. It's the cleanest and the fastest to build.
- **Risk:**
  - it can read like a public-information sign rather than "expansive"
  - it shows less of the night imagery
  - black and yellow recalls warning signs (and fabric's "Danger Yellow"), so yellow stays a highlight only

## 7. Recommendation: A, "The Score", raised by B and C

- **From B:** the night band is full-bleed and tall, so the darkness of the NASA frames is still the strongest image on the page.
- **From C:** body text never goes below 19 px, focus rings are 3 px, and every rule is in plain words.

**Tradeoff:**
- A costs the most build time (the score drawing, about 150 lines of JS reading `song-data.json`).
- It gives up B's all-dark immersion.
- In return:
  - the mechanism (pixels → notes) is visible in one glance, which is what a judge scores
  - it reads cleanly for low-vision visitors
  - it stays out of the dark-neon space look
  - it matches fabric's rhythm most closely
- If time runs short tonight, the build can ship A's layout and system with the playhead on the existing seven-frame strip, and add the full score last.

## 8. Copy deck (facts only, from the team's rules and `song-data.json`)

- **Label:** NASA SPACE APPS 2026 · THE EARTH INFORMATION JUKEBOX
- **Headline:** Eleven years of Earth at night, played as music.
- **Lede:** We measured seven frames of NASA's night-lights map: 2012, 2017, 2022, 2023 and three maps of the change. Each measurement drives one rule of the music. More light pulls the song toward a minor key, and bigger changes between years bring in the hang drum, balafon and string bass, louder and higher. You don't have to see the map to hear it change.
- **Primary action:** Play the 30-second demo (sound on)
- **Listen caption:** Each NASA frame stays on screen for its own four seconds of music, so what you see is always what you hear.
- **Play it live, heading:** Swap the instruments. The map keeps the notes.
- **Play it live, body:** This is the same 27-second song, played in your browser from the numbers. Change any voice to another real recording; the pitches and timing stay where the map put them.
- **How it works, heading:** Seven rules, measured from the pixels.
  - Each rule keeps the team's wording and adds one real value. Tempo: 152 bpm in 2012, 61 bpm in the last change map. Key: C major in 2012, A♭ major in the change maps.
- **Frame by frame, heading:** Every frame, in words.
- **Frame by frame, intro:** Written for anyone listening without the picture. Screen readers announce the same text as each frame plays.
- **Why sound, heading:** Built for listening.
- **Why sound, body:** The Earth Information Jukebox challenge asks how NASA's Earth Information Center visualizations can reach people who can't see them. Our answer keeps the map's numbers and gives them to the ear: every note on this page comes from a measurement of a real NASA frame.
- **Pull quote:** Bohr, as portrayed in *Oppenheimer*, kept exactly as it is now.
- **Footer:** the exact team line, unchanged.

This copy is drafted by Claude from the team's facts, so it needs the owner's approval and a line in `SI_DISCLOSURE.md` / `SI_LOG.md`.

## 9. What we take from fabric.vc, and what we deliberately don't copy

**Taken (the discipline, not the look):**
- the very large expanded display type at 100 % leading
- small uppercase labels
- a 4 px spacing scale with big jumps between sections
- a neutral ground with one accent saved for state
- pill only for the primary button
- short, quiet transitions

**Not copied:**
- the Monument Extended face (we use Archivo expanded)
- the wordmark and symbol, the spiral-net illustrations and the gradient background images
- the bracket notation ("R[3]sidency"), the thread metaphor and their slogans
- their burnt orange `#f37021` (our accent is sodium amber, from the subject)
- their lavender and yellow palette
- the nav counter, and the linked rows with arrow connectors
- an all-light page (we add the night band)

## 10. Draft PRODUCT.md facts (to confirm, then write)

- **Users:** Space Apps 2026 judges, worldwide; blind and low-vision listeners, the challenge's core audience.
- **Purpose:** turn seven frames of NASA SVS 5313 ("Change in Night Lights 2012-2023") into a 27-second song, so the change can be heard.
- **Positioning:** every note comes from the team's rules applied to measurements of real NASA frames, and no AI made any sound.
- **Constraints:**
  - project code in Java
  - the site in plain HTML/CSS/JS, with Tone.js 15.1.22 from cdnjs
  - fonts from Google Fonts only
  - licensed samples only
  - full AI disclosure
- **Accessibility:** WCAG 2.2 AA, a 19 px body minimum, screen-reader descriptions, reduced motion respected.
- **Evidence on hand:** `data/frames/`, `site/media/`, `site/song-data.json`, `site/samples/` (with licences).

## 11. Questions for the owner (the build waits on these)

1. **Direction:** A (recommended), B or C?
2. **Copy:** approve the section 8 copy, or tell me what to change.
3. **Default instruments:** the bass uses piano in 2012-2023 and sustain strings in the change maps. The plan's reading: each picker's first option names the video's instrument, e.g. "Synth (as in the video)", and for the bass "Piano, then sustain strings (as in the video)". Choosing another instrument overrides it. OK?
4. **Handpan picker:** with the flute replaced by a low synth plus a handpan, the handpan voice now plays in the three change maps. Should its picker come back?

## Build handoff (after approval)

**Head chef (Opus 5.5, xhigh):**
- builds the chosen direction to sections 3-5 and 8
- keeps every test ID and behaviour
- updates `tests/page.spec.mjs` for the default-instrument pickers
- runs `impeccable detect`
- takes screenshots at 1440/768/390 into `.impeccable/review/`

**Manager:** reviews the diff, runs the full suite, and redeploys the preview with `vercel deploy` from `site/`.

**Fresh finish review:** the impeccable finish reviewer checks the build against this plan. Fixes go back to the head chef, and work is finished only on a YES.

**Song changes:** they follow `2026-11-15-rework-plan.md`, done in parallel by the free cooks. The media is re-rendered after both are done.
