# Radical changes

NASA Space Apps 2026 entry (Earth Information Jukebox). It turns NASA's "Change in Night Lights 2012-2023" visualization (NASA SVS 5313) into a 27-second song, so blind and low-vision people, and anyone curious, can hear how light pollution is changing. Bigger change between frames gives a more chaotic, faster song; smaller change gives a smoother, slower one.

Website: https://radicalchanges.earth

## How the song is made

A Java analyzer measures 7 frames of SVS 5313 (at 0, 3, 6, 9, 12, 15 and 18 s; one copy of the world, printed labels masked). It computes six variables per frame, stretches each across the 7 frames to 1-100, and writes `site/song-data.json`. The website plays that file live with Tone.js. Each frame gets 3 s of music plus a 1 s transition.

| Variable | What it controls |
|---|---|
| 1. Main color's distance from red | Rhythm: further from red means more offbeat notes |
| 2. Main color vs each column's average color (hue 50%, saturation 25%, value 25%) | Melody pitch (one note per column group, left to right) and the key (12 equal slices of the score) |
| 3. Vibrancy (saturation and brightness) | Tempo, averaged with the size of change (60-160 BPM) |
| 4. Happiness (100 minus % of bright pixels) | 50 or more: major key; below 50: minor key |
| 5. Uniqueness (a bright spot vs the light around it) | 50 or more: short notes; below 50: long notes |
| 6. Contrast | 50 or more: synth and piano; below 50: harp/bells or flute/sustain strings |

Change size is the difference between consecutive frames' average of the six values (frame 0 has none). It drives the tempo, and the "change voices" (hang drum, balafon and string bass): bigger change means more notes, higher pitch and louder.

Song (round 15): notes overlap by 1 beat, including into the next frame, so the music never pauses; change voices are 10 dB louder, capped at -3 dB; a hang drum and a balafon play the same notes together; a low synth plays one octave below a handpan in place of the flute; the oboe doubles every melody note. See `analyzer/src/radical/MusicRules.java` and `docs/superpowers/specs/2026-11-14-radical-changes-design.md`.

## Run the analyzer

Needs Java 21.

Linux:

```
javac -d analyzer/out analyzer/src/radical/*.java analyzer/test/radical/*.java && java -ea -cp analyzer/out radical.SelfCheck && java -cp analyzer/out radical.Main data/frames site/song-data.json
```

Windows: `analyzer/run.ps1`

## Run the site and tests

```
npx http-server site -p 8081
npm ci && npx playwright test
```

The site runs on port 8081 so that port 8080 stays free for the tests, which start their own server there.

## Sources

- NASA Scientific Visualization Studio, SVS 5313: https://svs.gsfc.nasa.gov/5313/
- Wikipedia, "Light pollution": https://en.wikipedia.org/wiki/Light_pollution
- Hooktheory, "Key popularity" (key order): https://www.hooktheory.com/cheat-sheet/key-popularity
- Instrument samples: see `site/samples/LICENSES.md`. Tone.js license: see `CREDITS.md`.
- Full credits: `CREDITS.md`. AI use: `SI_DISCLOSURE.md` and `SI_LOG.md`. Design decisions: `docs/decisions/grill-log.md`.
