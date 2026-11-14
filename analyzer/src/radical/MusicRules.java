package radical;

import java.util.ArrayList;
import java.util.List;

/** The team's music rules: turns one frame's 1-100 values into tempo, key, instruments and notes. */
final class MusicRules {
    record Note(double time, String pitch, double duration, String voice) {}

    record FramePlan(int index, double bpm, String mode, String key, boolean shortNotes,
                     String melodyInstrument, String bassInstrument, List<Note> notes) {}

    /** Positions of the six variables in every scaled array. */
    static final int DISTANCE_FROM_RED = 0, MELODY = 1, VIBRANCY = 2, HAPPINESS = 3, UNIQUENESS = 4, CONTRAST = 5;

    /** The team's key lists, in their order, with each tonic's semitones above C. */
    private static final String[] MAJOR_KEYS = { "C", "D", "G", "A", "E", "F", "E♭", "B♭", "D♭", "B", "F♯", "A♭" };
    private static final int[] MAJOR_TONICS = { 0, 2, 7, 9, 4, 5, 3, 10, 1, 11, 6, 8 };
    private static final String[] MINOR_KEYS = { "A", "E", "C", "D", "B", "G", "C♯", "F♯", "F", "D♯", "B♭", "G♯" };
    private static final int[] MINOR_TONICS = { 9, 4, 0, 2, 11, 7, 1, 6, 5, 3, 10, 8 };

    private static final int[] MAJOR_SCALE = { 0, 2, 4, 5, 7, 9, 11 };
    private static final int[] MINOR_SCALE = { 0, 2, 3, 5, 7, 8, 10 }; // natural minor
    private static final String[] PITCH_NAMES = { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" };

    private static final double SECONDS_OF_MUSIC = 3; // per frame; the 4th second is the transition
    private static final double SHORT_NOTE = 0.25, LONG_NOTE = 0.95; // in beats

    private MusicRules() {}

    /** 60..160 bpm from the average of vibrancy and change size; the first frame uses vibrancy alone. */
    static double bpm(double vibrancyScaled, double changeScaled, boolean firstFrame) {
        double average = firstFrame ? vibrancyScaled : (vibrancyScaled + changeScaled) / 2;
        return 60 + (average - 1) * 100 / 99;
    }

    /** One melody note per beat for 3 seconds. */
    static int noteCount(double bpm) {
        return (int) Math.floor(SECONDS_OF_MUSIC * bpm / 60);
    }

    /** Each of the 12 keys owns an equal slice of the 1-100 melody score. The list is 12 long in both modes. */
    static int keyIndex(double melodyScaled, String mode) {
        return Math.min(11, (int) Math.floor((melodyScaled - 1) / 99 * 12));
    }

    /**
     * scaled: the frame's six 1-100 values (see the index constants). change: its change size.
     * columnScores: one 0..1 score per melody note, already stretched over all frames.
     */
    static FramePlan plan(int index, double[] scaled, double change, double[] columnScores) {
        double bpm = bpm(scaled[VIBRANCY], change, index == 0);
        if (columnScores.length != noteCount(bpm))
            throw new IllegalArgumentException("need " + noteCount(bpm) + " column scores, got " + columnScores.length);

        boolean major = scaled[HAPPINESS] >= 50;
        String mode = major ? "major" : "minor";
        int keyIndex = keyIndex(scaled[MELODY], mode);
        int tonic = (major ? MAJOR_TONICS : MINOR_TONICS)[keyIndex];
        int[] scale = major ? MAJOR_SCALE : MINOR_SCALE;

        boolean shortNotes = scaled[UNIQUENESS] >= 50;
        boolean energetic = scaled[CONTRAST] >= 50;
        String melodyInstrument = energetic ? "synth" : shortNotes ? "harp" : "flute";
        String bassInstrument = energetic ? "piano" : shortNotes ? "bells" : "sustain strings";

        double start = 4.0 * index;
        double beat = 60 / bpm;
        double duration = (shortNotes ? SHORT_NOTE : LONG_NOTE) * beat;
        List<Note> notes = new ArrayList<>();
        for (int k = 0; k < columnScores.length; k++) {
            if (k % 4 == 0) notes.add(new Note(start + k * beat, pitch(tonic, 2), duration, "bass"));

            int degree = Math.min(13, (int) Math.floor(columnScores[k] * 14));
            int semitones = tonic + scale[degree % 7] + 12 * (degree / 7);
            double time = start + k * beat;
            boolean offbeat = (k * 37) % 100 < scaled[DISTANCE_FROM_RED];
            if (offbeat && time + beat / 2 <= start + SECONDS_OF_MUSIC) time += beat / 2;
            notes.add(new Note(time, pitch(semitones, 4), duration, "melody"));
        }
        return new FramePlan(index, bpm, mode, (major ? MAJOR_KEYS : MINOR_KEYS)[keyIndex], shortNotes,
                melodyInstrument, bassInstrument, notes);
    }

    /** Tone.js pitch name, e.g. "C#5", for a number of semitones above the C of the given octave. */
    private static String pitch(int semitonesAboveC, int octave) {
        return PITCH_NAMES[semitonesAboveC % 12] + (octave + semitonesAboveC / 12);
    }
}
