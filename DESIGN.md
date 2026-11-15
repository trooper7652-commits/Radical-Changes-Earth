# Design: Radical changes website

## Owner pick (2026-11-14)
Direction B, "Horizon Glow" (design/directions/b/index.html, summary in design/directions/README.md), chosen by the owner over A "Night Ledger" and C "Star Chart".

## System
- Idea: Earth seen from space, a dark planet arc with a glowing rim. The orange rim is skyglow; sodium orange against LED cool blue puts the change in lighting into the palette.
- Colors: near-black #05060d, sodium orange #ff8a2b, LED blue #8fd4ff, text #eef2ff, muted #aab2d1, lines #262c4c.
- Type: Syne (800, wide, headings and quote) with Hanken Grotesk (body).
- Layout: centered hero with the quote; content column max 1000 px; six rules as cards topped by bars that grow with each rule; seven-segment strip under the live visuals.
- Motion: transform and opacity only, eased with cubic-bezier(0.23, 1, 0.32, 1). The hero entrance plays once. The horizon glow breathes slowly and also pulses with the sound: with the live song each note flashes it (read from song-data.json); with the 30 s demo it follows the audio level. Under prefers-reduced-motion all animation is off and the glow is not driven.
- Showing, not telling: the page works without sight. Skip link, native controls, labelled selects; each frame's description (made from song-data.json) is announced politely while the frames play and is also listed in full.
- Graphics: only CSS plus the team's frames (site/img, crops of data/frames) and videos.
