// Plays the song from song-data.json in time with the muted video.
// The video is the clock: song time is video.currentTime (both run 0..27 s).

import { INSTRUMENTS, createInstrument } from "./instruments.js";

// The video reports "playing" a few hundredths of a second after it really starts, so a note
// that began this recently still plays (at once) instead of being lost. Technical, not musical.
const LATE_NOTE_SECONDS = 0.1;

// The song's parts. A frame names each part's instrument in "<part>Instrument" (null: silent in that frame).
export const VOICES = ["melody", "bass", "handpan", "panHang", "panBalafon", "stringBass", "oboe"];

// A frame fades out while the next one fades in, so even and odd frames play on separate copies of
// their instruments, and each copy follows its own frame's volume.
// shortcut: two copies are enough while every note dies before the end of the next frame (true for
// releases up to 2.65 s; the longest is 2.5 s); a longer release needs a third copy.
export const INSTRUMENT_COPIES = 2;

// "About -12 dB" (design section 15) as a gain: a frame's volume at the end of its transition,
// and the next frame's volume as it starts.
const TRANSITION_GAIN = 10 ** (-12 / 20);

// A frame's volume over song time, as [time, gain] points joined by straight ramps (design section 15):
// from frame 1 on it fades in from about -12 dB over its first second; it is full until its music ends
// (4i+3 s), falls to about -12 dB by the end of the transition (4i+4 s) and is silent by the end of the
// next frame (4i+8 s), so its sound never carries past one following frame.
function frameEnvelope(frame) {
  const t = frame.startTime;
  return [[t, frame.index === 0 ? 1 : TRANSITION_GAIN], [t + 1, 1], [t + 3, 1], [t + 4, TRANSITION_GAIN], [t + 8, 0]];
}

// The envelope's gain at a song time between its first and last points.
function gainAt(envelope, time) {
  const next = envelope.findIndex(([t]) => t > time);
  const [t1, g1] = envelope[next - 1];
  const [t2, g2] = envelope[next];
  return g1 + (g2 - g1) * (time - t1) / (t2 - t1);
}

// Queues one frame from song time `offset`, which plays at audio time `at` (when the transport starts):
// its notes as a Tone.Part (returned) and its volume envelope on the instruments it plays.
// Notes in `played` are skipped and each note joins it as it plays, so starting again never doubles a note.
// instrumentsByVoice: { voice: Tone instrument } for each of VOICES.
export function scheduleFrame(frame, instrumentsByVoice, Tone, offset, at, played = new Set()) {
  const envelope = frameEnvelope(frame);
  const from = Math.max(offset, envelope[0][0]); // the frame's start, or the offset once it has started
  const ahead = envelope.filter(([time]) => time > from);
  if (ahead.length > 0) {
    for (const instrument of new Set(frame.notes.map((note) => instrumentsByVoice[note.voice]))) {
      instrument.volume.setValueAtTime(Tone.gainToDb(gainAt(envelope, from)), at + from - offset);
      for (const [time, gain] of ahead) {
        instrument.volume.linearRampToValueAtTime(Tone.gainToDb(gain), at + time - offset);
      }
    }
  }

  const notes = frame.notes.filter((note) => note.time >= offset - LATE_NOTE_SECONDS && !played.has(note));
  const part = new Tone.Part((time, { note }) => {
    // Tone counts ticks lazily: after a quick stop and restart, the stopped run's leftover ticks can
    // reach this part too, at times before it starts. Only this run's own ticks play.
    if (time < at) return;
    played.add(note);
    const velocity = Tone.dbToGain(note.volumeDb); // the note's own volume (the change voices follow the change)
    instrumentsByVoice[note.voice].triggerAttackRelease(note.pitch, note.duration, time, velocity);
  }, notes.map((note) => ({ time: Math.max(0, note.time - offset), note })));
  return part.start(0);
}

// Every instrument the song itself names, once each.
export function instrumentNames(songData) {
  const names = songData.frames.flatMap((frame) => VOICES.map((voice) => frame[`${voice}Instrument`]));
  return [...new Set(names)].filter(Boolean);
}

// The instruments one frame plays, { voice: Tone instrument }, taken from the frame's copy.
// copies: a list of { name: Tone instrument }; chosen (voice -> name) replaces the frame's own choices.
export function frameInstruments(frame, copies, chosen = {}) {
  const copy = copies[frame.index % copies.length];
  return Object.fromEntries(VOICES.map((voice) => [voice, copy[chosen[voice] ?? frame[`${voice}Instrument`]]]));
}

export class SongPlayer {
  constructor(video, songData, Tone) {
    this.video = video;
    this.songData = songData;
    this.Tone = Tone;
    this.instruments = Array.from({ length: INSTRUMENT_COPIES }, () => ({})); // copies of name -> loaded Tone instrument
    this.chosen = {}; // voice -> name picked with setInstrument (otherwise each frame's own)
    this.parts = [];
    this.played = new Set(); // notes already sounded since the last seek

    // Notes always follow what the video is really doing, including stalls and seeks.
    video.addEventListener("playing", () => this.#startNotes());
    video.addEventListener("seeked", () => !video.paused && !video.ended && this.#startNotes());
    video.addEventListener("seeking", () => this.played.clear()); // after a seek, notes may sound again
    for (const event of ["pause", "waiting", "ended", "seeking"]) {
      video.addEventListener(event, () => this.#stopNotes());
    }
  }

  // Loads every instrument the song names. Rejects with "Couldn't load <instrument>".
  async load() {
    await Promise.all(instrumentNames(this.songData).map((name) => this.#loadInstrument(name)));
  }

  // Call from a click: browsers only let sound start from a user action.
  async play() {
    await this.Tone.start();
    await this.video.play();
  }

  pause() {
    this.video.pause();
  }

  // Plays one voice (one of VOICES) on the named instrument for the whole song.
  async setInstrument(voice, name) {
    if (name) await this.#loadInstrument(name); // an empty name goes back to the song's own choice
    this.chosen[voice] = name || undefined;
    if (this.parts.length > 0) this.#startNotes();
  }

  activeFrameIndex() {
    const frameWindow = this.songData.frameSeconds + this.songData.transitionSeconds;
    const index = Math.floor(this.video.currentTime / frameWindow);
    return Math.min(Math.max(index, 0), this.songData.frames.length - 1);
  }

  async #loadInstrument(name) {
    if (this.instruments[0][name]) return;
    try {
      const copies = await Promise.all(this.instruments.map(() => createInstrument(name, this.Tone)));
      copies.forEach((instrument, i) => (this.instruments[i][name] = instrument));
    } catch {
      throw new Error(`Couldn't load ${INSTRUMENTS[name]?.label ?? name}`);
    }
  }

  #startNotes() {
    this.#stopNotes();
    const offset = this.video.currentTime;
    const at = this.Tone.now();
    this.parts = this.songData.frames.map((frame) => {
      const byVoice = frameInstruments(frame, this.instruments, this.chosen);
      return scheduleFrame(frame, byVoice, this.Tone, offset, at, this.played);
    });
    this.Tone.getTransport().start(at);
  }

  #stopNotes() {
    const now = this.Tone.now();
    this.Tone.getTransport().stop(now);
    for (const part of this.parts) part.dispose();
    this.parts = [];
    for (const instrument of this.instruments.flatMap(Object.values)) {
      instrument.releaseAll(now);
      instrument.volume.cancelAndHoldAtTime(now); // the frames' volumes are scheduled again with the notes
    }
  }
}
