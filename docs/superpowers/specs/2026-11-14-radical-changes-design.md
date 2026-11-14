# Radical changes: design (Space Apps 2026, Earth Information Jukebox)

Status: draft for owner approval, 2026-11-14. All ideas below are the owner's (see `decisions/grill-log.md`). Items marked **[builder call]** are Claude's implementation choices for the owner to check; items marked **[OPEN]** need the owner's answer.

## 1. Intent and why

- Turn NASA's "Change in Night Lights 2012-2023" visualization (SVS 5313, on the challenge Resources tab) into a song, so blind/low-vision people and curious people can *hear* how light pollution is changing.
- Big change between images → chaotic, punchy, faster song; small change → smoother, slower.
- Goal: win. Every choice is checked against the five judging criteria (Impact, Creativity, Validity, Relevance, Presentation; scored 1-5).

## 2. Goals, non-goals, anti-goals

- **Goals (in build order):** (1) a website with the 30-second video (top) and, further down the page, the same video with an instrument picker; (2) the 30-second judged demo video; (3) the instrument picker.
- **Non-goals now:** image uploads, a photo library, mountains, the beatboxing-animals idea (owner's later brainstorm).
- **Anti-goals:** any AI-invented project idea; unlicensed sounds or images; a demo over 30 s; a generic/cliché-looking site; code too advanced for the team to understand.

## 3. Constraints

- **Code:** all analysis/music logic in **Java** (Java 21 is installed), simple and readable, standard library only (`javax.imageio`, `java.awt.image`), only what is necessary. The website may use HTML/CSS/JavaScript and Tone.js (MIT) for in-browser sound.
- **Deadline:** submission closes Sun 2026-11-15 11:59 PM CST (Chicago local judging may be earlier).
- **Rules:** disclose all AI use (every Claude model, every FreeLLMAPI free model) in `SI_DISCLOSURE.md` + page meta tag + project page; label the song as made by AI-written code in its description and file metadata (to be safe; open question on Space Apps Connect); cite every source (NASA SVS 5313, Wikipedia "Light pollution" + linked sources, sound libraries, Tone.js); tick "Confirm All Work is Original"; demo ≤30 s; English; public, no-login link.
- **Execution:** the owner's kitchen workflow; FreeLLMAPI free models for mechanical coding/checks only; no Google models/credits.

## 4. Approaches (owner picked 1)

1. **Chosen:** Java analyzes the 7 frames once, ahead of time, and writes `song-data.json`; the website plays the song live in the browser with Tone.js; static hosting with radicalchanges.earth pointed at it. Simplest, keeps Java plain, sound still generated live.
2. Java compiled to run in the browser (TeaVM/CheerpJ): live analysis but advanced tooling, risky in the time left.
3. Java web server online: hosting sign-ups, cold starts, no benefit without uploads.

## 5. Data

- Source: `nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4` from https://svs.gsfc.nasa.gov/5313/ (43.3 s, 7680x2160).
- **Frames (owner's pick):** 0, 3, 6, 9, 12, 15, 18 s. Content: 0 s = 2012, 3 s = 2017, 6 s = 2022, 9 s = 2023 yearly maps; 12/15/18 s = the "change in lighting intensity 2012-2023" map.
- **One copy of the world** (each frame shows it twice): use the window x 1920-5760 (3840x2160, exactly one world, 16:9) for both the analysis and the video, so the melody's left-to-right matches what is on screen and the year label/legend stay visible **[builder call]**.
- **Mask printed text** (year label, legend bar) before measuring (owner: yes).
- Frames are extracted once with ffmpeg and committed as PNGs with a source note.

## 6. The six variables (owner's definitions)

"Brightness" = HSV value V (= max of R,G,B), 0-255 **[builder call]**.

| # | Variable | Owner's definition | Drives |
|---|---|---|---|
| 1 | Main color distance from red | Euclidean RGB distance between the image's main color (most common color) and (255,0,0) | Rhythm: further from red / closer to blue = more offbeat notes |
| 2 | Main color vs column average | For each column (or group of columns), left to right, the difference between the main color and that column's average color, scored with HSV weights Hue 50%, Saturation 25%, Value 25% | Melody pitch: score → note (score range split evenly across the available notes) |
| 3 | Vibrancy | Mix of HSV saturation and brightness **[builder call: 50/50, owner may change]** | Tempo, averaged 50/50 with the change size |
| 4 | Happiness | Percentage of pixels with brightness ≥ 127; more light = more upset → happiness = 100 − lit% | Key: happy (≥ 50) → a major key, not happy (< 50) → a minor key, from the owner's key list (below) [OPEN: what picks the key within each list] |
| 5 | Uniqueness (roundness merged in) | How much a bright spot (e.g., New York) contrasts with the light around it | Uniqueness ≥ 50 → short punchy (staccato) notes; < 50 → long smooth (legato) notes |
| 6 | Contrast | Count of full-brightness (V=255) pixels that touch at least one other V=255 pixel, divided by the count of pixels with V < 127 | Instruments: more contrast → synth and more energetic instruments; less contrast → orchestral, less energetic instruments. Owner's table (uniqueness = short/long, contrast = low/high): short+low → harp melody, bells bass; short+high → synth melody, piano bass; long+low → flute melody, sustain strings bass; long+high → synth melody, piano bass |

**Contrast cutoff:** contrast ≥ 50 → energetic (synth/piano); < 50 → orchestral (harp/bells or flute/sustain strings).

**Owner's key list (in this order):** Major: C, D, G, A, E, F, E♭, B♭, D♭, B, F♯, A♭. Minor: A, E, C, D, B, G, C♯, F♯, F, D♯, B♭, G♯.

**Scaling to 1-100 (owner: option b):** each variable is stretched across the 7 frames: the frame with the lowest value → 1, the highest → 100, the rest in proportion. If all 7 frames have the same value (e.g., distance from red = 247 everywhere), every frame gets 50 **[builder call]**.

**Change size:** average the six 1-100 values → one number per frame; change = difference between consecutive frames, **amplified** "a little so the change matches how much it actually is" (owner) → a single `AMPLIFY` constant the owner tunes by ear. Change affects tempo only (owner, "keep it as it is"). Frame 1 has no previous frame and uses only its own values.

**Tempo:** average of vibrancy (1-100) and change size (1-100), mapped to a BPM range **[builder call: 60-160 BPM]**.

## 7. Measured facts the owner should know (Claude, full-resolution frames)

| Frame | Happiness (100 − %V≥127) | Contrast ratio | Main color | Distance from red |
|---|---|---|---|---|
| 0 s (2012) | 99.88% | 0.00246% | ≈(8,8,8) | 247 |
| 3 s (2017) | 99.86% | 0.00249% | ≈(8,8,8) | 247 |
| 6 s (2022) | 99.84% | 0.00365% | ≈(8,8,8) | 247 |
| 9 s (2023) | 99.83% | 0.00431% | ≈(8,8,8) | 247 |
| 12/15/18 s (change map) | 99.83% | 0 | ≈(8,8,8) | 247 |

- Raw happiness is ≈99.8% on every frame, but with stretched scaling (option b) the brightest frames score low and the darkest high, so the key changes across the song. **Distance from red is 247 on every frame** (the main color is the near-black background), so it scales to 50 everywhere and the rhythm's offbeat amount stays the same throughout.
- Frames 12, 15, 18 are nearly identical; the largest measured jump is 9 s → 12 s, where the map type switches.

## 8. Song and video timeline

- Each frame: 3 s of music, then a 1 s transition to the next → 7×3 + 6×1 = **27 s** song.
- Video: the 5313 footage from 0 to ~20 s, **slowed to 0.75×** so the frame at video-time *t* is on screen at song-time *t*×4/3 (frame *i* at 4*i* s), matching its 3 s of music. Total ≤ 30 s including any title/credit card **[builder call: ≤ 29.5 s for safety]**.
- Exact schedule **[builder call]**: frame *i* (0-6) appears at song-time 4*i* s and its music plays 4*i* to 4*i*+3 s; transitions fill 4*i*+3 to 4*i*+4 s; the last frame's music ends at 27 s. Video footage 0 → 20.25 s at 0.75× = 27 s, then the last frame holds and fades into a ≤2.5 s credit card (NASA SVS 5313 credit, project name). MP4 total ≤ 29.5 s.
- The judged MP4 has the song baked in, NASA credit on screen, and the AI-audio label in its description/metadata.

## 9. Website (radicalchanges.earth)

- **Section 1 (top, main focus):** the 30-second video, sound on, starts when the user presses play (browsers block autoplay with sound) **[builder call]**.
- **Section 2 (scroll down):** the same video, muted, with the song generated live by Tone.js in sync, plus the **instrument picker** (harp, bells, synth, piano, flute, sustain strings). A user's pick replaces the contrast instrument rule: one choice for the melody instrument and one for the bass **[builder call]**; note lengths (short/long) still follow uniqueness **[builder call]**. Instruments are modular (one list to edit). Starting one video pauses the other **[builder call]**.
- **song-data.json** holds the six values per frame plus the finished musical decisions (key, mode, BPM, note list with times/lengths, default instruments), so all music logic stays in Java and the browser only plays it **[builder call]**.
- Also on the page: how the song is made (the six rules in plain words), sources/credits, AI disclosure.
- **Look:** themed around light pollution and night skies, with graphics that convey it, smooth animations, not generic. Built with impeccable, frontend-design, web-design-guidelines, plus vetted skills: emil-design-eng (approved), taste-skill (project-only, Stop hook removed), ui-ux-pro-max core folder only, Playwright (fresh isolated browser only, never the owner's logged-in Chrome); awesome-design-md as reference only (no copying a real brand's look).
- **Accessibility (WCAG basics):** fully keyboard-usable, screen-reader labels, a text description of what is heard for each frame, captions/transcript, reduced-motion support.
- **Hosting:** static files on a free host; radicalchanges.earth (currently WordPress.com "Coming Soon") pointed at it **[builder call: Vercel or GitHub Pages; repo must be public by submission]**.

## 10. Sounds

Free-licensed samples only, each license recorded and cited **[builder call: candidates VSCO 2 Community Edition (CC0) for harp/bells/flute/strings, Salamander Grand Piano (CC-BY) for piano, Tone.js synth for synth; verify licenses first]**.

## 11. Testing and validation

- Java: one small self-check per variable on a tiny synthetic image with a known answer; the analyzer prints the six values per frame for the owner to sanity-check.
- Website: Playwright smoke test (page loads, both videos play, picker changes sound, keyboard navigation, no console errors).
- Optional human test: anonymous tester request (draft in the plan) posted by the owner to r/Blind, AppleVis, Mastodon #Blind #A11y, NFB/ACB communities after checking each site's rules; no personal data kept.

## 12. Final pre-submit check (must all pass)

No pre-hackathon work; SI disclosure complete and accurate (all models listed); AI-audio label present; every source cited; ≥1 Resources-tab item (5313) used; demo ≤30 s and public, no-login link; English; team on the Chicago event; no unlicensed sounds/images; site link public.

## 13. OPEN (owner's answers needed before building)

Answered 2026-11-14: scaling = stretched across the 7 frames (b); contrast → instruments, happiness → major/minor key (two keys only); change affects tempo only.

Answered 2026-11-14: cutoffs at 50 for both; more unique → short punchy notes; keys come from the owner's 12 major / 12 minor list.

1. **Which key in the list (answered 2026-11-14):** the same HSV-weighted main-color vs column-average score as the melody picks the key, an equal slice of the score per key, in list order; the key changes frame to frame. Confirmed: the score picks one of the 12 keys in the list happiness chose.
2. **Front-page quote (confirmed):** "The important thing isn't can you read music, it's can you hear it. Can you hear the music, Robert?" — Niels Bohr, as portrayed in *Oppenheimer* (2023).

All design items are settled.

Status: owner approved moving to the plan on 2026-11-14 with this one item open.

## 14. Left to the builder

Code structure, note count per frame (from tempo × 3 s, one melody note per beat), melody column groups (the world copy split into as many equal column groups as the frame has melody notes, one note per group, left to right), mask regions (hard-coded rectangles, one set for the yearly maps and one for the change map), melody note range **[builder call: two octaves of the chosen key's scale, 14 notes, per the brainstorm's 14-note example]**, how "more offbeat" is spread across notes **[builder call: share of off-beat notes proportional to distance from red]**, how the bright spot for uniqueness is found **[builder call: largest connected V≥127 region vs a surrounding ring]**, transition sound between frames, page layout details within the owner's direction.
