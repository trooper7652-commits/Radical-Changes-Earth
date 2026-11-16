# Radical changes: design grilling log

Started 2026-11-14 (during the hackathon). Ground rule from the owner: **Claude asks questions only and does not invent project ideas**, to keep the NASA challenge entry the team's own work (Space Apps 2026 FAQ: SI "should not be used to (come up with your idea of how to solve the challenge)"). Ideas source: `brainstorm.md` (owner's).

End goal stated by the owner: a website where users move between slides of images, hear each image's sound, and upload their own image to hear what it would sound like. Questions are framed around the five judging criteria: Impact, Creativity, Validity, Relevance, Presentation.

## Rules check so far (2026-11-14)

1. **AI use must match the disclosure.** The team uses AI help (Claude writes code; machine-learning models were considered for two measurements), and the 2026 rules require disclosing all of it. Everything the project page says about AI must match that disclosure.
2. **Work before the hackathon.** Repo `trooper7652-commits/Radical` was created 2026-11-13 20:41 CST; its brainstorm.md held only the word "brainstorm" until 2026-11-14 12:03 CST (after the 9:00 AM start). Repo `Radical-Changes` was created 2026-11-14 12:30 CST. No challenge work found before the start. Low risk; keep it that way.
3. **NASA resource rule.** brainstorm.md links the SVS "Daily visualizations" gallery. Global judging needs at least one NASA resource from the challenge Resources tab; organizers said other SVS visualizations are allowed but advised also using a listed one.
4. **Copyright.** Instrument sounds (samples) must be licensed for use; the "Confirm All Work is Original" checkbox forbids unlicensed music/sounds. Cite hooktheory.com (key popularity) and every other source.
5. **ML models in the product.** If pre-trained models are used for Happiness/Uniqueness, their licenses and sources must be cited, and they count as AI in the disclosure discussion.
6. **Final pre-submit check** will be part of the plan: no pre-hackathon work, SI disclosure present and accurate, SI-labelled media (if any), all sources cited, ≥1 Resources-tab NASA item, demo ≤30 s video or ≤7 slides, public no-login links, English, team on one local event.

## Round 1 (asked 2026-11-14)

Q1 AI stance · Q2 Team · Q3 Impact: audience and change · Q4 Relevance: which NASA images · Q5 Validity: final measurement list · Q6 Validity: Happiness and Uniqueness models · Q7 Relevance/Impact: blind and low-vision access · Q8 Creativity: the one thing only you do · Q9 Build: live sound vs pre-made · Q10 Build: "Music Software Integration" · Q11 Copyright: instrument sounds · Q12 Presentation: demo format

### Round 1 answers (owner, 2026-11-14)

- **Q1 AI stance:** the project page makes no claims about AI beyond the disclosure; all AI use is disclosed.
- **Q2 Team:** everyone on the team is registered on the Chicago team page.
- **Q3 Impact:** users are visually impaired people and curious people who want to learn about Earth's changes through a new sensory perspective. After using the site they should better understand how the Earth is changing.
- **Q4 Relevance (images):** light pollution from SVS 5313 "Change in Night Lights between 2012 and 2023 - EIC Version" (https://svs.gsfc.nasa.gov/5313/; on the challenge Resources tab). In that video, 0-9 s shows actual light pollution on the world map, 10-20 s shows light intensity worldwide, and the rest repeats this zoomed in on specific regions. Other candidates the owner found: SVS 5475 "SOS - Change in Night Lights between 2012 and 2023", SVS 5477 "SOS - Day/Night cycle with Blue Marble and Black Marble Nightlights", SVS 5276 "Change in Night Lights between 2012 and 2023". Owner was unsure these are allowed.
  - *Fact (Claude):* on Space Apps Connect (#2048/#2099) the organizers confirmed SVS visualizations outside the Resources tab are allowed, as long as the project also uses a Resources-tab item; 5313 is one. So the other three are usable.
- **Q5 Final measurements (6):** (1) main color distance from red, (2) difference between the whole image's main color and each column's average color, (3) contrast, (4) vibrancy, (5) uniqueness, (6) happiness. Temperature is dropped. Owner is not yet sure how melody controls pitch.
- **Q6 Happiness:** means the overall world consensus on an opinion about the topic (e.g., people's opinion on light pollution). Owner wants an existing model; if none exists, Claude creates and trains one.
  - *Rule note (Claude):* if Claude designs/trains a model, the owner should define what it measures and from what data, so the idea stays the team's; Claude implements.
- **HARD CONSTRAINT (owner):** all project code must be in **Java** and be understandable: no extremely advanced code unless absolutely necessary; only write code that is necessary. Other languages may be used for other operations (e.g., the website itself).
- **Q7 Accessibility:** images should convey to blind and low-vision users how the world has changed over time (e.g., change in light pollution over the years). The change is conveyed through a song created from the 6 variables.
- **Q8 Creativity:** the song conveys the importance and urgency of how the world is changing. Small change → smoother, slower song. Critical, significant change → more chaotic, punchy, faster tempo.
- **Q9 Live sound:** yes, music is generated live for everything (the 7 slides and uploads) with one set of rules.
- **Q10 Music software:** everything runs inside the website, no external software. The owner knew a music engine was needed but not which one fits (must run in the website and communicate with the team's code). Claude to recommend.
- **Q11 Sounds:** use only free-licensed instrument sound files, each license recorded and cited.
- **Q12 Demo:** a 30-second video (lets a whole song play).
- **Website:** radicalchanges.earth; code also on GitHub (trooper7652-commits/Radical-Changes).
  - *Fact (Claude, 2026-11-14):* radicalchanges.earth resolves to 192.0.79.129/163 (WordPress.com / Automattic range) and serves a "Coming Soon" page. WordPress.com cannot run Java, which matters for where the Java code runs.

## Round 2 (asked 2026-11-14)

Q1 How change is measured · Q2 Melody and columns · Q3 Roundness and tempo · Q4 Happiness data source · Q5 Uniqueness in a night-lights map · Q6 The 7 slides · Q7 Instruments · Q8 Validity: checking with blind/low-vision listeners · Q9 Site accessibility basics · Q10 Uploaded images privacy · Q11 Domain timing

### Round 2 answers (owner, 2026-11-14)

- **Q1 Change:** the demo is a 30-second video. 7 light-pollution images are spread across the 30 s. The song compares each image's variables with the previous image's variables to find the magnitude of change between the two. (Uploads not yet answered.)
- **Q2 Melody:** yes, the song moves across the image left to right; each column or group of columns gives the next note. Each image has its own melody.
- **Q3 Roundness:** roundness and contrast merge into one instrument/articulation rule (owner's mapping):
  - More corners/sharp edges → punchier, shorter, staccato notes. Less contrast: harp (melody), bells (bass). More contrast: synth (melody), piano (bass).
  - More round → smoother, longer, legato notes. Less contrast: flute (melody), sustain strings (bass). More contrast: synth (melody), piano (bass).
- **Q4 Happiness source:** any reputable source that gathers the information from a large population sample. Claude to search for data/models.
- **Q5 Uniqueness:** in the night-lights map, how much the light in a specific bright area (e.g., New York) contrasts with the light around that large spot.
- **Q6 Images:** light pollution is locked in. Mountains maybe later if time allows. Owner asked whether the 30 s video replaces the 7 images (see clarification below).
  - *Clarification (Claude):* the judging demo is EITHER a ≤30 s video OR ≤7 slides, not both; the owner chose the video. The website's image slides are part of the product itself (brainstorm: "choose from 7 pre-picked images or upload"), separate from the demo format.
- **Q7 Instruments:** locked in: harp, bells, synth, piano, flute, sustain strings. Must be modular because instruments may change later. Owner idea: website users could pick and choose a mix of instruments for the song.
- **Q8 Testing:** owner unsure; asked Claude to research how to check, e.g., finding blind or low-vision people online, or places with many blind or low-vision people for in-person testing.
- **Q9 Accessibility basics (WCAG):** yes.
- **Q10 Uploads:** yes, analyze then discard; never stored.
- **Q11 Domain:** radicalchanges.earth was claimed from a NASA Space Apps offer after the hackathon started. OK under the no-early-work rule.

### Owner directions given with round 2 (2026-11-14)

- Use FreeLLMAPI free models wherever the kitchen rules allow, to use as little Claude as possible; use the owner's Google credits instead of Claude where possible.
- Keep competition integrity in every reply. Disclose ALL AI use when building (Claude models, Gemini, and every free model used).
- **Reminder rule:** if Claude builds the happiness model, Claude must remind the owner to decide what it learns from.
- AI limits the owner restated: disclose AI use; the idea must be the team's; label AI-made media (images/video watermark; audio labelled in description + file metadata); cite everything and tick "Confirm All Work is Original". Unclear whether sound made by AI-written code counts as "SI-generated audio": mention it in the disclosure or ask on Space Apps Connect.

### Facts found (Claude, 2026-11-14)

- Global Offers page would not render for Claude; per the 2026 kickoff post (Connect #2058) the offers are: GoDaddy domain + hosting, Google Cloud (Firebase, Maps API), Meteomatics weather API, Microsoft (Azure, Planetary Computer, GitHub Copilot), Miro. Some need a credit card for verification.
- **Google credits:** the owner could not get Google Cloud billing verified, so the Google credits are not usable. (Account details omitted from this public copy.)
- How Claude uses Google models: through the FreeLLMAPI gateway (its Google AI Studio key); credits apply only if that key's Cloud project has billing enabled on the credits account. graphify can also use Gemini directly via GEMINI_API_KEY.
- FreeLLMAPI gateway is running (http://127.0.0.1:31415 answered 200). No GEMINI_API_KEY is set. Java 21 is installed (javac available; no Maven or Gradle).

## Round 3 (asked 2026-11-14)

Q1 First image · Q2 Uploads and change · Q3 Change size vs each image's own music · Q4 Roundness as a measurement · Q5 The 7 images · Q6 Users picking instruments · Q7 Website slides vs video · Q8 Happiness for uploads · Q9 Song length · Q10 Google Cloud signups · Q11 Happiness source · Q12 Testing route

### Round 3 answers (owner, 2026-11-14)

- **Q1 First image:** the first image makes its own values of the variables with the algorithm (no comparison).
- **Q2 Uploads:** a machine-learning algorithm finds what is in the uploaded image, the image's approximate date, and its variables. It then finds similar images on the internet, the one most recent to the date the user is using the website (it only finds real images, never creates its own), extracts the same variables from that image, compares the two images, and creates a song from the comparison.
- **Q3:** owner did not understand the question; reword and ask again.
- **Q4 Roundness:** roundness is no longer a variable; it merged into contrast. Contrast now measures the difference between a spot on the map with a large amount of light and the light in the surrounding areas.
- **Q5 The 7 images:** frames of the SVS 5313 video at 0, 3, 6, 9, 12, 15 and 18 seconds. At 10 s the video switches from showing overall light pollution to showing the change in lighting intensity.
- **Q6 Instrument picker:** yes, in the first version; the user's pick replaces the contrast/roundness instrument rule.
- **Q7 Website slides:** the same 7 frames as the video.
- **Q8 Happiness for uploads:** a machine-learning algorithm picks the most important/prominent object in the photo, searches for the most important/prominent topic about that object, and then scores the world's happiness on that topic.
- **Q9 Song length:** each image's song plays 3 s with a 1 s transition to the next frame. An uploaded image's song plays until the user stops it: a start/stop button.
- **Q10 Google:** the owner tried to claim the credits but could not get verified. Do not use Google models/credits. (Owner: "find a different way".)
- **Q11 Happiness source:** Wikipedia "Light pollution" (https://en.wikipedia.org/wiki/Light_pollution) and the sources linked from it. Owner's rule: generally, the higher the light pollution, the more upset people are.
- **Q12 Testing:** try to find people online to test; testers are not required unless they boost the chances of winning.
- **Owner's overriding goal:** win the competition; every question and action should serve that.

### Facts found (Claude, 2026-11-14): the 7 frames of SVS 5313

Source video: nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4 (43.3 s, 7680x2160, 32:9, 30 fps).
- Each frame shows the world map **twice side by side** (two copies, Pacific in the middle), sized for the EIC display wall.
- 0 s = year **2012**, 3 s = **2017**, 6 s = **2022**, 9 s = **2023** (yearly night-lights maps with the year printed on the image; gaps of 5, 5, then 1 year).
- 12 s, 15 s, 18 s = **"Change in Lighting Intensity from 2012 to 2023"** map with an orange-to-purple legend bar printed on the image (lights lost vs new lights).
- Measured average pixel difference between consecutive frames (0-255 scale): 0→3 s ≈0.35, 3→6 ≈0.35, 6→9 ≈0.27, **9→12 ≈0.86 (largest: the map type switches)**, 12→15 ≈0.22, 15→18 ≈0.22.
- Printed text (year labels, legend) sits inside the image and will be included in pixel measurements unless masked.

## Round 4 (asked 2026-11-14)

Q1 Tempo rules disagree · Q2 Short vs long notes · Q3 Contrast vs uniqueness · Q4 How many variables · Q5 Keep these frames · Q6 World twice · Q7 Printed labels · Q8 Uploads with no date · Q9 Upload search source · Q10 Happiness for slides · Q11 Happiness for uploads · Q12 Upload song length · Q13 Build order · Q14 Online testers

### Round 4 answers (owner, 2026-11-14)

- **SCOPE CHANGE: no image upload.** Only a library of photos the user can scroll through. (Q2/Q8/Q9/Q11/Q12 upload answers from round 3 are dropped.)
- **Q1 Tempo:** weight vibrancy and change size 50/50; tempo comes from the average of the two.
- **Q2 / Q3 (final):** contrast and uniqueness swap. **Uniqueness** = how much a bright spot contrasts with the light around it (the earlier "contrast" definition); roundness is merged into uniqueness, so uniqueness decides short vs long notes (and the instrument rule). **Contrast** = the difference between the lowest and the highest brightness on the light-pollution map.
- **Q4 Variables (6, final):** vibrancy, contrast, happiness, uniqueness, difference between the main color and the average color of each column (or group of columns), main color distance from red on the RGB graph.
- **Q5 Frames:** owner asked Claude to suggest which frames to use.
- **Q6 World twice:** the left-to-right melody uses only one copy of the world.
- **Q7 Labels:** yes, cover printed labels/legend before measuring.
- **Q10 Happiness (slides):** yes, more light = more upset (lower happiness).
- **Q13 Build order:** 1) website with the 7 slides and their songs, 2) the 30-second video, 3) the instrument picker.
- **Later idea (owner's brainstorm, NOT in scope until the challenge is done):** a feature where the user picks an animal from a library; the animal introduces itself and then beatboxes, with the beatbox shaped by the animal's characteristics.
- **Q14 Testers:** yes, draft an anonymous tester request and recommend where to post it.
- **Owner process directions:** make a plan and get owner approval before any code. Before building the website, use UI/UX skills (impeccable, frontend-design, web-design-guidelines) and install extra design skills (e.g., Taste-skill, Awesome design, Emil Kowalski design-engineer, Playwright), but only after each passes a SkillSpector safety check; report unsafe ones. The site must be themed around the project's purpose, with graphics/elements that convey it and smooth animations; not basic or cliché.

### Facts found (Claude, 2026-11-14): rest of the 5313 video and brightness

- 0-9 s: global yearly maps stepping through the years 2012 → 2023 (e.g., 1.5 s = 2014, 3 s = 2017, 4.5 s = 2019, 6 s = 2022, 7.5-9 s = 2023), one map type throughout.
- ~10-20 s: global "change in lighting intensity 2012-2023" map; ~21 s: transition.
- ~24-36 s: zoomed insets (Western Europe, Eastern Mediterranean/Nile, India, and one more region) over the global map, with years 2012 (24-27 s), 2016 (30 s), 2022 (33 s), 2023 (36 s); ~39-42 s: zoomed change maps.
- Brightness of one world copy (0-255): mean ≈ 8.4 (2012) → 8.6 (2023); **min = 0 and max = 255 in every yearly frame**, so "highest minus lowest brightness" is 255 for every frame. Share of pixels brighter than 100: 0.13% (2012) → 0.15% (2017) → 0.18% (2022) → 0.19% (2023), i.e., about +46% from 2012 to 2023.

## Round 5 (2026-11-14)

### Answers (owner)
- **Q1 Build:** option (1): Java analyzes the frames ahead of time and writes a small data file; the website plays the music live in the browser (Tone.js). Static hosting with radicalchanges.earth.
- **Q2 Frames:** option (B), mixed frame types. **The owner will pick the exact frames personally**, so frame selection is not AI help (no disclosure needed for it).
- **Q3 Contrast:** the highest number of full-brightness (255) pixels that are connected to at least one other 255 pixel, compared to zero.
- **Q4 Happiness:** the percentage of pixels that have some brightness out of all pixels (more light = more upset).
- **Q5 Mapping table:** confirmed as written: distance from red → rhythm (offbeat); main color vs column average → melody pitch (left to right, one world copy); vibrancy → tempo (50/50 with change size); happiness → major (≥50%) / minor; uniqueness (bright spot vs surroundings, roundness merged) → instruments + short/long notes; contrast → key signature (from the key-popularity list).
- **Q6 Change size:** convert each of the 6 variables to 1-100, average them into one number per frame, and the change is the difference between consecutive frames' averages.
- **Q7 Vibrancy:** a mix of HSV saturation and brightness.
- **Q8 Judged product / scope:** what is judged is the 30-second video. The 7 frames are only used to create the song; the team creates the song and overlays the 30-second video on it. **Photo library dropped for now** (maybe later if time).

### Facts found (Claude, full-resolution frames, one world copy, HSV brightness V)
- Correction note: earlier brightness numbers came from downscaled frames. At full resolution in HSV brightness the yearly frames still have min 0 and max 255 (the change map at 12 s maxes at 237).
- Owner's contrast (V=255 pixels touching another V=255 pixel): 204 (2012, 0 s), 206 (2017, 3 s), 302 (2022, 6 s), 357 (2023, 9 s); 0 on the change map (12 s, 15 s). V=0 pixels are about 0.6% of the map.
- Owner's happiness input ("pixels with some brightness"): V>0 = 99.4% on every yearly frame (the ocean and gray land base map are dark but not zero; video compression adds noise), so happiness would be ~0.6% and never change. In grayscale, >0 = 70.4% (2012) → 69.2% (2023), slightly falling. With a threshold of V>20: 20.2% (2012) → 20.4% → 20.6% → 20.8% (2023) → 21.0% (change map), rising.
- SVS 5276 also offers per-year still images (e.g., nightlights_flat_series_stills_only_lights.2023_web.jpg), which avoid video compression; the owner picks the data.

## Round 6 (2026-11-14)

### Answers (owner)
- **Website stays:** it holds the 30-second video as the main focus at the top; scrolling further down shows the video again with the instrument picker.
- **Frames:** stills at 0, 3, 6, 9, 12, 15, 18 s of the 5313 video (owner's own pick).
- **Video over song:** the 5313 video plays over the song; each frame's 3 s of music lines up with that frame on screen; the video may be slowed to match the song.
- **Brightness threshold:** 127 (midpoint of 0-255). Happiness = share of pixels at or above it (more light = more upset).
- **Contrast:** count of connected full-brightness pixels divided by the count of pixels under the 127 threshold.
- **Change:** amplify the change a little so it matches how much it actually is.
- **Instrument picker:** lives on the website, below the main video, with the second copy of the video.

### Facts found (Claude): owner's rules on the 7 chosen frames
- Happiness (100 − % of pixels with V ≥ 127): 99.88% (0 s), 99.86% (3 s), 99.84% (6 s), 99.83% (9-18 s): always major.
- Contrast ratio: 0.00246% (0 s), 0.00249% (3 s), 0.00365% (6 s), 0.00431% (9 s), 0 (12-18 s change maps).
- Main color ≈ (8,8,8) near-black on every frame, so distance from red = 247 on every frame.
- Design doc written: decisions/2026-11-14-radical-changes-design.md (builder check running).

## Round 7: design-doc open items (2026-11-14)

### Answers (owner)
- **Scaling:** option (b): stretch each variable across the 7 frames (lowest → 1, highest → 100).
- **Contrast → instruments:** more contrast → synth and more energetic instruments; less contrast → orchestral, less energetic instruments.
- **Happiness → key:** only two keys are used: happy → the major key, not happy → the minor key. (Key-popularity ranking no longer used.)
- **Change:** keep as is (affects tempo only, 50/50 with vibrancy).
- Owner asked to reword the "one uniqueness number, two choices" question. Now that contrast picks the instruments, uniqueness only decides short vs long notes; asked for the cutoff and direction.

## Round 8: plan review (2026-11-14)

### Answers / directions (owner)
- **Front-page quote:** "The important thing isn't can you read music, it's can you hear it. Can you hear the music, Robert?" (owner attributes it to Niels Bohr).
  - *Fact (Claude):* this line is spoken by the character Niels Bohr (Kenneth Branagh) in the 2023 film *Oppenheimer*, written by Christopher Nolan; Claude knows of no record of the real Bohr saying it. Citation accuracy matters under "cite every source".
- **Key choice:** chosen by the same score as the melody: difference between the main color and each column's average color, HSV-weighted (Hue 50%, Saturation 25%, Value 25%); score in, key out, each key an equal slice of 0-100, in the owner's key-list order. Owner's example: "24 notes (12 major, 12 minor) and a score from 0-100 → first note 0-7 (100/14)". The key changes frame to frame.
  - *Open (Claude):* the example mixes 24 keys with a 100/14 slice; asked whether the score picks among the 12 keys of the happiness-chosen list or among all 24.
- **Kitchen:** Fable (head chef) also cooks the hardest coding problems (plan: Task 2 uniqueness, Task 3 music rules, Task 6 player sync).
- **Key list size (owner):** (a): the score picks one of the 12 keys in the list happiness chose (≈8.33 score points per key).
- **Quote credit (owner):** "— Niels Bohr, as portrayed in *Oppenheimer* (2023)", for accuracy.
- Design fully settled; plan updated; waiting for the owner's "start the project".

## Round 9: after Task 7 (2026-11-14)
- **Picture alignment (owner):** (b): hold each of the 7 chosen frames on screen for its 3 s of music with a 1 s transition, to keep Validity (what viewers see is always the frame they hear). May revisit if it looks scuffed; the continuous slowed video stays available as an option.
- **Fable (head chef):** owner asked for max effort on every Fable job.

## Round 10: website and song (2026-11-14)
- **Website (owner):** direction B "Horizon Glow". Must capture the judges' attention and be extremely memorable, jumping out without trying too hard. It should capture the challenge's theme, bridging NASA's Earth Information Center and people with low vision through an accessible, engaging, multi-sensory experience that unites scientific research, and convey it through visuals and effects ("show, don't tell").
- **Song (owner):** sounds basic and not good yet; add more elements so it sounds well composed and intentional. Reference: "Dreiton" by C418 (well composed, synths fit well). Owner asked Claude to ask questions about what the owner wants (no ideas from Claude).

## Round 11: song answers (owner, 2026-11-14)
- **Q1 What sounds basic:** it hits one note at a time and the sound is not well blended together.
- **Q2 From Dreiton:** use a **handpan**. Notes should be long, sustaining and fade out instead of cutting sharply: make BOTH the current short and long notes longer. Transitions must be smoother. It is fine for each frame's music to overlap several other frames.
- **Q3/Q4 New instruments:** add **bagpipes** and **string bass**, both dictated by every variable at once, using the average-of-variables value that measures the change from one frame to the next.
- **Q5 Transitions:** the two frames blend: the current frame gets quieter while the next frame gets louder.
- **Q6 Drums:** stay out of the song for now.
- **Q7 Instrument picker options:** strings, harp, bells, string bass, bagpipes, synth, drums (kick, hi-hat, click, snare, toms), piano, choir, pipes, guitar, whistle.
- **Q8 Sounds:** yes, search for CC0/CC-BY sounds; check every license at the source and credit it.

## Round 12: song details (owner, 2026-11-14)
- **Note lengths:** short notes twice as long as before; long notes three times as long as before.
- **Handpan:** as natural-sounding as possible. It is in the same category as the harp: both are controlled by the same variable in the same way. The hang drum (FreePats, CC0) stands in for the handpan.
- **Bagpipes and string bass:** a bigger change makes them louder, adds more notes and raises the pitch. For now they play the same notes as the synth (may change later).
- **Overlap:** one frame's sound may carry into at most one following frame. Some clash is OK, but keep the music as natural as possible.
- **Picker:** no drums for now. Add pan pipes and pipe organ, and the handpan. Visitors can also change the new parts. Choir, whistle and pan pipes: keep searching; include them if a good, licensed source is found, otherwise drop them from the picker.
- **Footer:** a small visible line about AI-assisted graphics and code.
- **Owner:** the frames, the instrument recordings and the actual music must not be AI-made; the music is produced by the team's algorithm.
- **Presence (owner):** make the bagpipes and string bass more present by a factor of 2 (applied to the change value that drives them; tempo unaffected).

## Round 13: website polish directions (owner, 2026-11-14 night)
- Install and use the `unslop` (heydamir) and `lemo-opuscar` (lemomo-ai) skills for the website, after the SkillSpector safety check, so it doesn't look like another AI-generated site and gets dedicated, polished animations per element. Also use ALL the other design skills: "this website is our main leverage to winning this competition."
- The website's font must be easy on the eyes to read.

## Round 14: instrument changes (owner, 2026-11-15)
- Notes must overlap more and flow more smoothly; bagpipes and string bass louder (being built by a free model: notes ring 0.75 beat past the next note; +10 dB, capped at -3 dB).
- **Replace the bagpipes** with hang drums / pan drums / handpans / any similar instrument; these play synchronously in tandem (together, the same notes at the same time).
- **Add the aulos** (the instrument used in the Sirens scene of The Odyssey).
- Chat stays a thin manager (option 1): Claude only when absolutely necessary; free models do the coding.
- **Aulos role (owner):** plays the melody alongside the current melody instrument (same notes, same times).

## Round 15: PR #1 answers (owner, 2026-11-15)
- **Overlap:** "Make the notes overlap by 1 beat now."
- **Balafon** is the second pan instrument; **Hooktheory** is the source of the key order.
- **Credit the piano** (CC BY 3.0) in the video, not only on the site.
- **Flute:** "Replace the flute with a low pitched synth and a handpan, both of these instruments should play harmoniously." Then: "the low synth and handpan should play the same notes, with the synth an octave or two lower" (builder call: one octave, `LOW_SYNTH_OCTAVES = 1`).
- **Oboe:** "have the oboe play every melody note."
- **Pickers:** "have the instruments for each voice prepicked, with the instruments used in the video as the default"; the bass picker starts on piano (piano, then sustain strings, as in the video); "Bring handpan back."
- **No pauses:** "each frame should flow smoothly into the other one ... Make the music so that there is absolutely no pauses whatsoever." Built as: each voice's last note in a frame rings 1 beat into the next frame. On the transition, the owner chose "fade both at once": a frame stays full until the next starts, then fades to about -12 dB over the next frame's first second while the next fades in.
- **Tester request:** dropped ("I don't think we will have time").
- **Vercel:** yes.
- **Website:** direction A "The Score" with B's full-width dark band (design plan `docs/superpowers/plans/2026-11-15-website-design-plan.md`); built by a head-chef subagent, Claude Opus 5.5 at effort xhigh.

## Round 16: more life on the website (owner, 2026-11-15)
- "I don't like how much blank space there is ... The website honestly looks dead."
- A rotating, interactable Earth on the landing page that belongs to the site's look.
- A butterfly in the site's colours that looks like one of the satellites orbiting the Earth at first, then flies from the bottom left up and to the right, covering the screen as the visitor scrolls down.
- The video in the middle, with the notes on how the music is made on the sides, while the visitor sees the video and hears the music.
- "REMEMBER TO USE GOOD ANIMATIONS."

## Round 17: website layout (owner, 2026-11-15 afternoon)
- "Switch the location of the spinning globe and the text next to it. I like both of them, but I think it makes more sense for the globe to be on the left because the butterfly should appear from the bottom left."
- "I also don't like how the page background turns from black to white, it hurts my eyes and makes the website less seamless." (The whole page goes dark; links use sodium amber.)
- "Also the font in the seven rules in the white background part seems out of place, make it more consistent with the black background part of the website."
- "Also make the Oppenheimer quote one of the first things the user sees when landing on the website."
- DESIGN.md: overwrite with the new system after the fixes. Public Vercel link: update to the new site after the fixes pass review.

## Round 18: the butterfly (owner, 2026-11-15 afternoon)
- "The butterfly just flies across the screen without blocking much out. When the butterfly crosses the screen, make sure it envelopes and covers the whole screen. Also add more deatil to the butterfly, it looks too basic right now. After the butterfly covers the screen, there should be a little pause, and then the website should show the next section."
- Built as: when leaving the hero downward, the butterfly covers the whole viewport, holds for about half a second, the page moves to the next section behind it, and it flies off to reveal it. Off under reduced motion.
- The 4:30 PM cloud routine was cancelled before it was created (the owner's limits reset).

## Round 19: the transition's pacing (owner, 2026-11-15 afternoon)
- "The butterfly jumps out too fast during the transition and I want there to be a blank screen after the butterfly appears, and then after a little pause, have the "Hear the map change." section load in from the bottom."
- Built as: an unhurried fly-in, then a cover hold, then a slower exit, then a blank night screen for a short pause, then "Hear the map change." rises in from the bottom.

## Round 20: rhythm (owner, 2026-11-15 afternoon)
- "Does rhythm change at all during the song? If not, remove the rhythm variable entirely."
- Finding: the main color's distance from red is 247.258974 in all seven frames (scaled 50 each time), so the off-beat pattern never changed.
- Owner's choice: **remove it entirely**: the measurement, the off-beat rule, and its place in the change average. There are now five measurements. Notes sit on the beat. The change values grow by about 20 %, tempos rise by 0-3 bpm (the first change map goes from 75.8 to 79.0 bpm), and the change voices get slightly louder and busier.

## Round 21: shorter pause, highlighter headings (owner, 2026-11-15 evening)
- "Make the pause a just a tad shorter." (Builder reading: both still moments shortened by about a quarter: the cover hold 0.5 → about 0.38 s, the blank screen 0.6 → about 0.45 s.)
- "when scrolling down the page, highlight the headers of information in a highlighter yellow that pops out. the highlight should go down left to right, up to down, the same way you would read english, and the highlight should highlight it and then unhighlight in the same left to right, up to down fashion as the user scrolls further down."
- Builder reading: the section and block headings below the hero; a new highlighter-yellow token used only for this, with dark text under it; scroll-driven; off under reduced motion.

## Round 22: last polish before submission (owner, 2026-11-15, 9:40 PM)
- "Make the earth have higher contrast so that it pops out more to the user."
- "when I scroll down, the header gets highlighted partially, only the "change" is highlighted in the hear the map change section." (Bug: the transition lands with the heading already in the clearing band.)
- "have the butterfly fills less of the screen and have it take longer to fill up the screen, I don't want the user to get jumpscared by the butterfly. Make the butterfly smooth and intentional." This changes round 18: the butterfly peaks at about 70-80 % of the width, and a night curtain fades in under it to hide the jump.
