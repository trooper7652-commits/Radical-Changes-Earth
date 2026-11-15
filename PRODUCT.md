# Product

<!-- impeccable:product-schema 1 -->

Source: the approved website design plan, section 10 (`docs/superpowers/plans/2026-11-15-website-design-plan.md`), confirmed by the owner on 2026-11-15.

## Platform

web

## Users

- Space Apps 2026 judges, worldwide.
- Blind and low-vision listeners: the challenge's core audience.

## Product Purpose

Turn seven frames of NASA SVS 5313 ("Change in Night Lights 2012-2023") into a 27-second song, so the change can be heard.

## Positioning

Every note comes from the team's rules applied to measurements of real NASA frames, and no AI made any sound.

## Operating Context

- Entry for NASA Space Apps 2026, challenge "The Earth Information Jukebox": sonify NASA Earth Information Center visualizations.
- Judged artefact: the 30-second demo video with sound (`site/media/radical-changes-30s.mp4`). The website also plays the same song live in the browser.

## Capabilities and Constraints

- Project code in Java (`analyzer/`), which writes `site/song-data.json`.
- The site is plain HTML/CSS/JS with Tone.js 15.1.22 from cdnjs.
- Fonts from Google Fonts only.
- Licensed samples only.
- Full AI disclosure (`SI_DISCLOSURE.md`, `SI_LOG.md`).

## Evidence on Hand

- `data/frames/`: the seven measured NASA frames and their source note.
- `site/media/`: the demo video, the muted visuals video and the song WAV.
- `site/song-data.json`: every frame's measurements and notes.
- `site/samples/`: the instrument recordings, with licences in `site/samples/LICENSES.md`.

## Accessibility & Inclusion

WCAG 2.2 AA, a 19 px body minimum, screen-reader descriptions, reduced motion respected.
