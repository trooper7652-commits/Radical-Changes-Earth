// Renders the whole song offline (no speakers, faster than real time) to a WAV file.
// Uses the same scheduleFrame as the live player, with each frame's own default instruments.

import { scheduleFrame } from "./app.js";
import { createInstrument } from "./instruments.js";

const SONG_SECONDS = 27;
const SAMPLE_RATE = 44100;
const FADE_SECONDS = 0.4;

// Returns a Promise of a Blob holding a 16-bit PCM WAV of the song.
export async function renderSong(songData) {
  const buffer = await Tone.Offline(async () => {
    // Created inside the callback, so they belong to the offline context.
    const names = songData.frames.flatMap((f) => [f.melodyInstrument, f.bassInstrument]);
    const instruments = {};
    for (const name of new Set(names)) instruments[name] = await createInstrument(name, Tone);
    for (const frame of songData.frames) {
      scheduleFrame(frame, {
        melody: instruments[frame.melodyInstrument],
        bass: instruments[frame.bassInstrument],
      }, Tone, 0);
    }
    // Fade out over the last 0.4 s so the ringing last notes do not cut off.
    const out = Tone.getDestination().volume;
    out.setValueAtTime(0, SONG_SECONDS - FADE_SECONDS);
    out.linearRampToValueAtTime(-60, SONG_SECONDS);
    Tone.getTransport().start(0);
  }, SONG_SECONDS, 2, SAMPLE_RATE);
  return encodeWav(buffer.get());
}

// audioBuffer: a Web Audio AudioBuffer. Writes interleaved 16-bit little-endian PCM.
export function encodeWav(audioBuffer) {
  const channels = audioBuffer.numberOfChannels;
  const frames = audioBuffer.length;
  const dataBytes = frames * channels * 2;
  const view = new DataView(new ArrayBuffer(44 + dataBytes));
  const text = (offset, s) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));

  text(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, dataBytes, true);

  const data = Array.from({ length: channels }, (_, c) => audioBuffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}
