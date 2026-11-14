// Instrument catalogue for the song. Samples and their licenses: site/samples/LICENSES.md.
// To add an instrument, add one entry here. Sampler urls map Tone pitch names
// (sharps as "#") to files in baseUrl; release is in seconds.

export const INSTRUMENTS = {
  harp: {
    label: "Harp",
    kind: "sampler",
    baseUrl: "samples/harp/",
    urls: {
      C3: "C3.mp3", E3: "E3.mp3", G3: "G3.mp3", D4: "D4.mp3", F4: "F4.mp3",
      A4: "A4.mp3", C5: "C5.mp3", E5: "E5.mp3", G5: "G5.mp3", D6: "D6.mp3",
    },
    release: 1.5,
  },
  bells: {
    label: "Bells",
    kind: "sampler",
    baseUrl: "samples/bells/",
    urls: {
      G4: "G4.mp3", C5: "C5.mp3", G5: "G5.mp3", C6: "C6.mp3", G6: "G6.mp3", C7: "C7.mp3",
    },
    release: 2.0,
  },
  synth: {
    label: "Synth",
    kind: "synth",
    release: 0.8,
  },
  piano: {
    label: "Piano",
    kind: "sampler",
    baseUrl: "samples/piano/",
    urls: {
      C2: "C2.mp3", "F#2": "Fs2.mp3", C3: "C3.mp3", "F#3": "Fs3.mp3", C4: "C4.mp3",
      "F#4": "Fs4.mp3", C5: "C5.mp3", "F#5": "Fs5.mp3", C6: "C6.mp3",
    },
    release: 1.5,
  },
  flute: {
    label: "Flute",
    kind: "sampler",
    baseUrl: "samples/flute/",
    urls: {
      C3: "C3.mp3", E3: "E3.mp3", A3: "A3.mp3", C4: "C4.mp3", E4: "E4.mp3",
      A4: "A4.mp3", C5: "C5.mp3", E5: "E5.mp3", A5: "A5.mp3", C6: "C6.mp3",
    },
    release: 1.0,
  },
  "sustain strings": {
    label: "Sustain strings",
    kind: "sampler",
    baseUrl: "samples/sustain-strings/",
    urls: {
      D2: "D2.mp3", F2: "F2.mp3", A2: "A2.mp3", C3: "C3.mp3", E3: "E3.mp3",
      G3: "G3.mp3", B3: "B3.mp3", D4: "D4.mp3", F4: "F4.mp3",
    },
    release: 1.2,
  },
};

// Resolves to a Tone instrument connected to the output. Rejects for unknown names
// or when a sampler fails to load its files.
export function createInstrument(name, Tone) {
  if (!Object.hasOwn(INSTRUMENTS, name)) {
    return Promise.reject(new Error(`Unknown instrument: ${name}`));
  }
  const spec = INSTRUMENTS[name];

  if (spec.kind === "synth") {
    const synth = new Tone.PolySynth(Tone.Synth, { envelope: { release: spec.release } });
    return Promise.resolve(synth.toDestination());
  }

  return new Promise((resolve, reject) => {
    const sampler = new Tone.Sampler({
      urls: spec.urls,
      baseUrl: spec.baseUrl,
      release: spec.release,
      onload: () => resolve(sampler),
      onerror: reject,
    }).toDestination();
  });
}
