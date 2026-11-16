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
| 2026-11-14 | Task 7 | Claude Sonnet 5.5 | Wrote the offline renderer (render.js), WAV encoder, video build script, extra player fixes and tests; added a master limiter after manager review; a second Sonnet instance reviewed it |
| 2026-11-14 | Task 7b | Claude Sonnet 5.5 | Switched the video to hold each chosen frame during its music (owner decision), added an alignment check |
| 2026-11-14 | Task 8 step 1 | Claude Sonnet 5.5 | Made three visual-direction mockups with the design skills for the owner to choose from |
| 2026-11-14 | Task 8 | Claude Sonnet 5.5 | Built the website from the team's chosen direction B with the impeccable, frontend-design, emil-design-eng, design-taste-frontend and web-design-guidelines skills; fixed review findings; other Sonnet instances reviewed it |
| 2026-11-14 | Docs | Claude Opus 5.5 | Wrote SI_DISCLOSURE.md from this log |
| 2026-11-14 | Task 10 | Claude Fable 5.2 (stopped), Claude Opus 5.5 (max effort) | Song v2 from the team's rules: longer notes, handpan with harp, bagpipes + string bass driven by change (2x presence), per-frame crossfades; fixed a doubled-first-note bug; Claude Sonnet 5.5 reviewed it |
| 2026-11-15 | Task 10b | Claude Haiku 5.5 | Downloaded/converted 8 more licensed instruments (CC0; picker-only choir/whistle/pan pipes MIT) |
| 2026-11-15 | Media | Claude Opus 5.5 | Re-rendered the song and rebuilt the demo video with the project scripts |
| 2026-11-15 | Cloud run: management | Claude Opus (manager) | Ran the cloud run: split the work, checked results against the team's design |
| 2026-11-15 | Cloud run: song v3, final gate | Claude Opus (max effort, head chef) | Wrote song v3 in Java and JavaScript (overlap, louder change voices, hang drum + balafon, oboe) and ran the final gate |
| 2026-11-15 | Cloud run: website polish, docs | Claude Sonnet (line cook) | Polished the website; wrote README, CREDITS, the tester request and the final check; updated the disclosure |
| 2026-11-15 | Plans: rework + website design | Claude Opus 5.5 (manager) | Wrote the rework plan and the website design plan (audit, fabric.vc rhythm, three directions; the owner picked A and added round 16); drafted the site copy for the owner to approve |
| 2026-11-15 | Song round 15 | Claude Sonnet 5.5 (line cook) | Java: 1-beat overlap including into the next frame, low synth + handpan in place of the flute, oboe on every melody note, piano credit line in the video script |
| 2026-11-15 | Transition, media | Claude Opus 5.5 (manager) | Player fade timing changed to the owner's "fade both at once"; re-rendered the song WAV and the 30 s video; checked there are no silent gaps |
| 2026-11-15 | Website rebuild (rounds 15-21) | Claude Opus 5.5, effort xhigh (head chef) | Rebuilt the site from the team's approved plan and the owner's rounds 16-21: the turning Earth (the team's SVS 5313 frame as its map), the satellite-to-butterfly transition, the video with side notes, the live score, one dark page, the rhythm removal, the score labels following the pickers |
| 2026-11-15 | Website reviews | Claude Opus 5.5 (impeccable finish reviewer) | Three reviews of the rebuilt site against the plan and the owner's words; every site fix it listed was applied and scored resolved |
| 2026-11-15 | Song: rhythm removed | Claude Sonnet 5.5 (line cook) | Removed the distance-from-red measurement, its off-beat rule and its place in the change average (owner round 20) |
| 2026-11-15 | DESIGN.md | Claude Opus 5.5 (impeccable documenter) | Rewrote DESIGN.md from the shipped site (the owner chose to overwrite the old direction) |
| 2026-11-15 | Deploy | Claude Opus 5.5 (manager) | Deployed previews and, with the owner's OK, the public Vercel link |
