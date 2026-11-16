---
name: Radical changes
description: Eleven years of Earth at night, played as music, on one continuous night ground.
colors:
  night: "#07090e"
  field: "#10141c"
  text: "#f3f5f8"
  text-2: "#a3abba"
  sodium: "#ffb547"
  ink: "#0c0e13"
  hair: "rgba(201, 206, 214, .18)"
  note-idle: "#7b8396"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1rem + 4.6vw, 5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.2vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.1
    fontVariation: "'wdth' 125"
  quote:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(1.125rem, .95rem + .55vw, 1.375rem)"
    fontWeight: 500
    lineHeight: 1.35
    fontVariation: "'wdth' 125"
  lede:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1rem + .3vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  body-strong:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.3
  small:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: ".8125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: ".08em"
  data:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.35
  data-small:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0"
  pill: "999px"
  disc: "50%"
spacing:
  hair: "2px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  xxl: "64px"
  gutter: "clamp(20px, 4.45vw, 64px)"
  section: "clamp(64px, 6.7vw, 96px)"
components:
  button-cta:
    backgroundColor: "{colors.sodium}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
    height: "52px"
  button-play:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    padding: "14px 28px"
    height: "52px"
  button-play-playing:
    backgroundColor: "{colors.sodium}"
    textColor: "{colors.ink}"
  select-voice:
    backgroundColor: "{colors.field}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
    height: "48px"
  nav-link:
    textColor: "{colors.text-2}"
    typography: "{typography.small}"
    padding: "0 6px"
    height: "44px"
  nav-link-hover:
    textColor: "{colors.text}"
  side-note-label:
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
  side-note-value:
    textColor: "{colors.text}"
    typography: "{typography.data}"
---

# Design System: Radical changes

## Overview

**Creative North Star: "The Score at Night"**

The page is a musical score laid on the night side of the Earth. One flat, near-black ground runs from the top bar to the footer; everything on it is either type, a hairline, a NASA frame, or the turning Earth. The one warm colour is sodium amber, the colour of the streetlights whose replacement the song is about, and it is spent only on what is sounding now and on what the visitor can act on.

Density is editorial: a 12-column grid, generous measure limits (40-62ch), and sections separated by spacing and a single hairline, never by panels or a change of ground. Data (keys, tempos, measurements) is set in mono so it reads as values, not prose. Motion is orchestrated and transform/opacity only: the Earth turns, the satellite becomes a butterfly that covers the screen between the hero and the demo, and the score's playhead follows the audio.

Confirmed rejections (owner rounds 16-17): no glows, no gradients, no paper sections; the page never turns light.

**Key Characteristics:**
- One continuous night ground (#07090e); the field tone (#10141c) only inside controls, image wells and the Earth's oceans.
- Sodium amber marks "now playing", the primary action, links, selection and focus.
- Separation by 1px hairlines and spacing only.
- Archivo at width 125 for headings and the quote; Atkinson Hyperlegible Next for reading; Atkinson Hyperlegible Mono for values.
- The small uppercase label is the side-note device: rule names, side notes, legends.
- Square controls; one pill, the primary action.

## Colors

A near-monochrome night palette with a single warm accent taken from the subject.

### Primary
- **Sodium Streetlight** (sodium): the playhead, sounding notes, the lit bar wash (at 7% opacity), the active timeline frame, the "now playing" marker on a frame entry, the meter beside the frame readout, the playing state of Play, the primary action, links, text selection and the focus ring. Also the butterfly's wings and the satellite's beacon. 11.34:1 on night, 10.5:1 on field.

### Neutral
- **Night Ground** (night): the only page background, the theme colour, and the stroke that outlines butterfly parts.
- **Field** (field): select backgrounds, empty image wells, the satellite panels, and the floor the Earth's black oceans are lifted to so the globe stands off the ground without a glow (1.08:1 against night: tonal, not a border).
- **Starlight Text** (text): headings, body, values; also the Play button's ground. 18.23:1 on night.
- **Dim Text** (text-2): secondary prose, labels, captions, nav at rest, select borders, scrollbar thumb. 8.62:1 on night, 7.98:1 on field.
- **Ink** (ink): text on sodium (10.99:1) and on the light Play button (17.67:1). Never a ground.
- **Hairline** (hair): section rules, note and rule dividers, score staff and barlines, orbit rings. About 1.43:1 on night; decoration only, never carries meaning.
- **Idle Note** (note-idle): score notes not sounding. 5.24:1 on night; the score is aria-hidden.

Orbit details are alpha mixes of existing tokens, not new colours: the globe rim is the hairline grey at 40% and the butterfly's orbit is sodium at 45%.

### Named Rules
**The Sodium Means Now Rule.** Sodium marks what is sounding or what can be acted on (play, link, focus). It is never decoration on static text and never a background behind more than one action.

**The One Night Rule.** Every section sits on night. A new surface gets spacing and a hairline, never a lighter ground, a card or a gradient.

**The No Glow Rule.** No box-shadow, text-shadow, blur, bloom or gradient anywhere, including the Earth.

## Typography

**Display Font:** Archivo, width 125, weight 500 (with Arial Narrow)
**Body Font:** Atkinson Hyperlegible Next 400/700 (with Atkinson Hyperlegible, system-ui)
**Label/Mono Font:** Atkinson Hyperlegible Mono 400 (with ui-monospace)

**Character:** A wide, steady grotesque for headings over a face designed for low-vision reading, with a mono for every number the music comes from.

### Hierarchy
- **Display** (500, 44-80px fluid, 1.0): the hero headline only. On short laptop screens it follows viewport height (8.4vh).
- **Headline** (500, 32-48px fluid, 1.04): section headings; balanced wrap. In the credits and disclosure, 1.5rem.
- **Title** (500, 1.5rem, 1.1): frame entry headings; the wordmark uses the same face at 1.0625rem.
- **Quote** (500, 18-22px fluid, 1.35): the Bohr quote in the hero, text colour, max 40ch.
- **Lede** (400, 19-21px fluid, 1.45): the hero paragraph in dim text, max 60ch.
- **Body** (400, 19px, 1.6): the reading size and the floor for running text; selects and buttons also use 19px (selects drop to 16px under 600px).
- **Small** (400, 16px, 1.45-1.55): captions, rule text, frame descriptions, credits, nav, status, max 62ch.
- **Label** (700, 13px, 0.08em, uppercase): side-note names, rule names, the picker legend, the event line.
- **Data** (mono 400, 19px side-note values; 17px rule facts; 16px frame data and frame readout; 13px timeline captions).

### Named Rules
**The Values Are Mono Rule.** Any number or musical value produced by the rules (key, bpm, happiness, change, dB) is set in mono; prose about it is not.

**The Label Is a Side Note Rule.** The uppercase label names a value or a group beside it. It never sits above a heading as an eyebrow.

## Layout

- Content box: max 1440px, centred, with a fluid gutter (20-64px).
- 12 columns with 32px column gaps for the hero, the live deck, the "in words" header and the closing credits. Hero: the Earth spans columns 1-6 and bleeds past the left gutter (up to 800px, square); the copy takes 7-12 (6-12 on short laptop screens, 1024px+ wide and 820px or less tall).
- Listen stage: three tracks (1 : 2.5 : 1, 40px gaps); the demo video in the middle, three side notes right-aligned on the left and three on the right. Under 1024px the video spans the top and the notes form two columns; under 600px one.
- Live deck: muted visuals in columns 1-7, the panel in 8-12; the score and pickers run full width below. Pickers auto-fill at 24rem minimum.
- Rules auto-fill at 30rem minimum (40px column gap); frame entries are two columns, one under 1024px.
- Section spacing: the section token (64-96px). Within sections the steps are 8 / 16 / 24 / 32 / 48 / 64px. No viewport-height padding.
- Under 1024px every 12-column grid collapses to one column. 600-1023px: the Earth takes its own row at the left. Under 600px: the Earth sits behind the headline, offset 38% off the left edge; the hero order becomes headline, action, quote, lede, and the primary action goes full width.
- Under 768px the nav shows only "Listen".

## Elevation & Depth

Flat. There are no shadows anywhere. Depth comes from three things only: the field tone against night, the Earth's back orbit half drawn behind the canvas and its front half in front of it, and the full-screen flight layer (z 30) during the transition. Score labels use a night-coloured paint-order stroke to stay legible over staff lines; that is a knockout, not a shadow.

### Named Rules
**The Flat Night Rule.** Nothing lifts on hover. State shows as a colour change, an opacity change, or a 0.97 press scale.

## Shapes

Square by default: buttons (other than the primary action), selects, images and video have 0 radius. The primary action is the one pill (999px). The Earth is a disc (50%) circled by thin elliptical orbits (non-scaling strokes). Score notes are bars with radius half their thickness. Dividers are 1px hairlines along the top edge of each list item and section head.

## Components

### Buttons
- **Primary action** (the "Play the 30-second demo" link): sodium pill, ink text, 700 weight with a 400-weight "(sound on)" aside, at least 52px tall. Press scales to 0.97 over 120ms. Full width on phones, aside on its own line.
- **Play / Pause**: square, light (text colour) ground with ink, at least 52px tall and 8em wide. Turns sodium while playing; disabled at 50% opacity with a progress cursor until sounds load.
- **Focus (all)**: 3px solid sodium outline, 3px offset. Never removed.

### Inputs / Fields
- **Voice pickers**: native selects, square, field ground, 1px dim-text border, 48px tall, full width of their track. Hover lightens the border to text. While a sound loads the select keeps focus (aria-busy, not disabled) and pulses opacity to 0.55 every 600ms.

### Navigation
- Wordmark left in Archivo, links right in dim text at 16px, each at least 44px tall; hover goes to text colour over 200ms. A skip link appears on focus in text colour with ink.

### Hero
The turning Earth (WebGL, NASA SVS 5313 2023 frame) on the left with three satellites on hairline orbits; the butterfly's orbit is the sodium-tinted one. Copy on the right: headline, the Bohr quote with its citation in dim text, the lede, then the primary action beside the event label. Without WebGL the disc shows the f3 frame.

### Listen stage and side notes
Head row: the section headline, then the mono frame readout with a 48 x 2px sodium meter that scales with the audio level. Side notes: hairline-topped items of label, mono value (re-set per frame with a 260ms rise of 6px) and a dim one-line rule text.

### Live score
Aria-hidden SVG: one bar per frame, one row per voice with a mono row label, hairline staff and barlines, idle notes in note-idle. The current bar gets a 7% sodium wash; sounding notes turn sodium instantly; a 2px sodium playhead follows the audio. Above it, a seven-frame strip of thumbnails at 55% opacity, the current one at full opacity with its mono caption in sodium.

### Rules as notes
Six hairline-topped items: label-styled rule name, then a mono definition list (first frame and last change map, dim terms, text values), then the rule text in dim small type.

### Frame entries
Thumbnail (11rem, 7rem on phones) beside an Archivo title, a sodium mono data line (bpm, key, mode) and the description in dim small type. The frame playing in the live player gets a sodium mono "· now playing" after its title.

### Motion grammar
- Tokens: press 120ms, hover 200ms, state 350ms, reveal 600ms; one ease, cubic-bezier(0.23, 1, 0.32, 1). Only transform and opacity animate.
- The Earth turns once every 90s, can be dragged (with inertia) and turned with the arrow keys (15 degrees per press); it pauses off screen and when the tab is hidden.
- Hero entrance once: copy rises 16px with 60ms stagger; the globe settles from 0.94 scale and 4 degrees over 700ms.
- Scroll reveal once per block: 20px rise, at most four staggered children at 60ms. Focus inside an unrevealed block reveals it.
- The satellite-to-butterfly transition, on the first downward input after the hero copy has been seen, or on the primary action or the Listen link: fly (0-1.3s: panels fold, wings open in 280ms, curved path from the bottom left, even zoom to cover the viewport), hold (to 1.8s, fully covered, wings still, the page jumps to the listen section behind it), exit (to 2.8s, off the top right with beating wings), blank (to 3.4s, bare night), rise (section groups rise 10% of the viewport over 800ms, 70ms stagger; what follows fades in over 240ms). Input is held while it runs; focus then lands on the listen heading.
- Reduced motion: all animation and transitions off, no transition layer, the Earth moves only while dragged or stepped by keys, the playhead jumps bar to bar, everything visible by default.

## Do's and Don'ts

### Do:
- **Do** keep every surface on night (#07090e) and separate sections with spacing and a 1px hairline.
- **Do** spend sodium only on what is sounding, the primary action, links, selection and focus.
- **Do** set every rule-derived value in Atkinson Hyperlegible Mono.
- **Do** keep running text at 19px or larger and secondary prose at 16px or larger (only labels and timeline captions go to 13px), with targets at least 44px.
- **Do** give every decoration (the score, orbits, the flight layer) aria-hidden and carry its information in text: frame descriptions and the polite live regions.
- **Do** animate only transform and opacity with the one ease, and turn it all off under reduced motion.

### Don't:
- **Don't** add glows, shadows, blurs or gradients, including on the Earth.
- **Don't** introduce a light or paper section; the page never changes ground.
- **Don't** put the uppercase label above a heading as an eyebrow.
- **Don't** use the hairline colour for anything that carries meaning; at about 1.4:1 it is decoration only.
- **Don't** add hover lifts or parallax; the only scroll-linked motion is the butterfly transition.
- **Don't** round the controls; the primary action is the only pill.
