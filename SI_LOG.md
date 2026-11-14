# AI use log (feeds SI_DISCLOSURE.md)

Every AI model used on this project, as it is used. The project idea, the six measurement rules, the music rules and the frame choice are the team's own.

| Date | Task | Model | What it did |
|---|---|---|---|
| 2026-11-14 | Planning | Claude Opus 5.5 (Claude Code) | Asked the team questions, recorded answers, measured frame statistics, wrote the design and plan documents from the team's answers |
| 2026-11-14 | Research | Claude Sonnet 5.5, Claude Haiku 5.5 | Looked up sonification methods, data sources and testing options; security-checked design skills; knowledge-graph extraction |
| 2026-11-14 | Task 0 | Claude Opus 5.5 | Set up the repo, installed vetted design skills (project only), extracted the 7 frames with ffmpeg |
| 2026-11-14 | Task 1 | Claude Sonnet 5.5 | Wrote Frame.java (load, crop, label masks) and SelfCheck; a second Sonnet instance reviewed it |
| 2026-11-14 | Task 2 | Claude Sonnet 5.5 | Wrote Measure.java (the six measurements exactly as the team defined them) and checks; a second Sonnet instance reviewed it |
| 2026-11-14 | Task 5 prep | Claude Haiku 5.5 | Looked up free-licensed instrument samples and their licenses |
| 2026-11-14 | Task 3 | Claude Fable 5.2 | Wrote Scale.java and MusicRules.java (the team's scaling, change, tempo, key, note-length, instrument, melody and rhythm rules) and checks; Claude Sonnet 5.5 reviewed it |
| 2026-11-14 | Task 4 | FreeLLMAPI free model (auto:line_cooks-coding chain) | Wrote SongJson.java from an exact blueprint; verified by Claude Opus 5.5 |
| 2026-11-14 | Task 4 | Claude Sonnet 5.5 | Wrote Main.java and run.ps1; generated site/song-data.json |
| 2026-11-14 | Gate 1 | Claude Fable 5.2 | Reviewed the whole analyzer against the team's design: YES |
| 2026-11-14 | Task 5 | Claude Haiku 5.5 | Downloaded and converted free-licensed instrument samples, wrote instruments.js and LICENSES.md |
| 2026-11-14 | Task 6 | Claude Fable 5.2 | Wrote the live player (app.js), page harness and Playwright tests; made the slowed visuals video with ffmpeg; Claude Sonnet 5.5 reviewed it |
