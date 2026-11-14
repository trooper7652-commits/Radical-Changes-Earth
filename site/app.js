// Plays the song from song-data.json in time with the muted video.
// The video is the clock: song time is video.currentTime (both run 0..27 s).

import { INSTRUMENTS, createInstrument } from "./instruments.js";

// The video reports "playing" a few hundredths of a second after it really starts, so a note
// that began this recently still plays (at once) instead of being lost. Technical, not musical.
const LATE_NOTE_SECONDS = 0.1;

// Queues one frame's notes on the Tone transport and returns the Tone.Part.
// offset is the song time (seconds) that transport time 0 stands for; earlier notes are skipped.
// instrumentsByVoice is { melody, bass }, each a Tone instrument.
export function scheduleFrame(frame, instrumentsByVoice, Tone, offset) {
  const notes = frame.notes
    .filter((note) => note.time >= offset - LATE_NOTE_SECONDS)
    .map((note) => ({ ...note, time: Math.max(0, note.time - offset) }));
  const part = new Tone.Part((time, note) => {
    instrumentsByVoice[note.voice].triggerAttackRelease(note.pitch, note.duration, time);
  }, notes);
  return part.start(0);
}

export class SongPlayer {
  constructor(video, songData, Tone) {
    this.video = video;
    this.songData = songData;
    this.Tone = Tone;
    this.instruments = {}; // name -> loaded Tone instrument
    this.chosen = {}; // voice -> name picked with setInstrument (otherwise each frame's own)
    this.parts = [];

    // Notes always follow what the video is really doing, including stalls and seeks.
    video.addEventListener("playing", () => this.#startNotes());
    video.addEventListener("seeked", () => !video.paused && !video.ended && this.#startNotes());
    for (const event of ["pause", "waiting", "ended"]) {
      video.addEventListener(event, () => this.#stopNotes());
    }
  }

  // Loads every instrument the song names. Rejects with "Couldn't load <instrument>".
  async load() {
    const names = this.songData.frames.flatMap((f) => [f.melodyInstrument, f.bassInstrument]);
    await Promise.all([...new Set(names)].map((name) => this.#loadInstrument(name)));
  }

  // Call from a click: browsers only let sound start from a user action.
  async play() {
    await this.Tone.start();
    await this.video.play();
  }

  pause() {
    this.video.pause();
  }

  // Plays one voice ("melody" or "bass") on the named instrument for the whole song.
  async setInstrument(voice, name) {
    await this.#loadInstrument(name);
    this.chosen[voice] = name;
    if (this.parts.length > 0) this.#startNotes();
  }

  activeFrameIndex() {
    const frameWindow = this.songData.frameSeconds + this.songData.transitionSeconds;
    const index = Math.floor(this.video.currentTime / frameWindow);
    return Math.min(Math.max(index, 0), this.songData.frames.length - 1);
  }

  async #loadInstrument(name) {
    if (this.instruments[name]) return;
    try {
      this.instruments[name] = await createInstrument(name, this.Tone);
    } catch {
      throw new Error(`Couldn't load ${INSTRUMENTS[name]?.label ?? name}`);
    }
  }

  #startNotes() {
    this.#stopNotes();
    const offset = this.video.currentTime;
    this.parts = this.songData.frames.map((frame) => {
      const byVoice = {
        melody: this.instruments[this.chosen.melody ?? frame.melodyInstrument],
        bass: this.instruments[this.chosen.bass ?? frame.bassInstrument],
      };
      return scheduleFrame(frame, byVoice, this.Tone, offset);
    });
    this.Tone.getTransport().start();
  }

  #stopNotes() {
    this.Tone.getTransport().stop();
    for (const part of this.parts) part.dispose();
    this.parts = [];
    for (const instrument of Object.values(this.instruments)) instrument.releaseAll();
  }
}
