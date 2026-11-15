package radical;

import java.util.ArrayList;
import java.util.List;

/** The team's music rules: turns one frame's 1-100 values into tempo, key, instruments and notes. */
final class MusicRules {
    /** voice: "melody", "bass", "handpan", "bagpipes" or "stringBass". volumeDb: 0 is full volume, negative is quieter. */
    record Note(double time, String pitch, double duration, String voice, double volumeDb) {}

    /** The handpan, bagpipes and string bass instruments are null in a frame where that voice has no notes. */
    record FramePlan(int index, double bpm, String mode, String key, boolean shortNotes,
                     String melodyInstrument, String bassInstrument, String handpanInstrument,
                     String bagpipesInstrument, String stringBassInstrument, List<Note> notes) {}

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
    private static final double SHORT_NOTE = 0.5, LONG_NOTE = 2.85; // in beats

    /** The owner's "more present by a factor of 2": the change is doubled for the bagpipes and string bass only. */
    static final double CHANGE_VOICE_PRESENCE = 2.0;

    /** The ranges the recordings cover, in semitones above C0 (octave * 12 + semitones above C). */
    private static final int HANDPAN_LOW = 3 * 12 + 9, HANDPAN_HIGH = 5 * 12 + 2;   // A3..D5
    private static final int BAGPIPES_LOW = 4 * 12 + 5, BAGPIPES_HIGH = 5 * 12 + 7; // F4..G5

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

    /** The change value that drives the bagpipes and string bass, capped at 100. Tempo keeps the plain change. */
    static double presenceChange(double change) {
        return Math.min(100, change * CHANGE_VOICE_PRESENCE);
    }

    /** Volume of the bagpipes and string bass: -30 dB at 1, rising to -6 dB at 100. */
    static double changeVoiceDb(double presenceChange) {
        return -30 + 24 * (presenceChange - 1) / 99;
    }

    /** Moves a pitch by whole octaves until it is inside low..high (all in semitones above C0). */
    static int intoRange(int semitones, int low, int high) {
        while (semitones > high) semitones -= 12;
        while (semitones < low) semitones += 12;
        return semitones;
    }

    /**
     * scaled: the frame's six 1-100 values (see the index constants). change: its change size.
     * columnScores: one 0..1 score per melody note, already stretched over all frames.
     */
    static FramePlan plan(int index, double[] scaled, double change, double[] columnScores) {
        double bpm = bpm(scaled[VIBRANCY], change, index == 0);
        int melodyNotes = columnScores.length;
        if (melodyNotes != noteCount(bpm))
            throw new IllegalArgumentException("need " + noteCount(bpm) + " column scores, got " + melodyNotes);

        boolean major = scaled[HAPPINESS] >= 50;
        String mode = major ? "major" : "minor";
        int keyIndex = keyIndex(scaled[MELODY], mode);
        int tonic = (major ? MAJOR_TONICS : MINOR_TONICS)[keyIndex];
        int[] scale = major ? MAJOR_SCALE : MINOR_SCALE;

        boolean shortNotes = scaled[UNIQUENESS] >= 50;
        boolean energetic = scaled[CONTRAST] >= 50;
        String melodyInstrument = energetic ? "synth" : shortNotes ? "harp" : "flute";
        String bassInstrument = energetic ? "piano" : shortNotes ? "bells" : "sustain strings";
        boolean handpan = melodyInstrument.equals("harp"); // the handpan joins whenever the harp plays the melody

        // Bagpipes and string bass follow the change from the previous frame. Frame 0 has none, so they stay out.
        boolean changeVoices = change > 0;
        double presence = presenceChange(change);
        int changeNotes = changeVoices ? Math.max(1, (int) Math.round(melodyNotes * presence / 100)) : 0;
        int raise = (int) Math.round(presence / 100 * 7); // scale steps: up to one octave
        double changeDb = changeVoiceDb(presence);

        double start = 4.0 * index;
        double beat = 60 / bpm;
        double duration = (shortNotes ? SHORT_NOTE : LONG_NOTE) * beat;
        List<Note> notes = new ArrayList<>();
        int placed = 0; // bagpipes and string bass notes added so far
        for (int k = 0; k < melodyNotes; k++) {
            if (k % 4 == 0) notes.add(new Note(start + k * beat, pitch(tonic, 2), duration, "bass", 0));

            int degree = Math.min(13, (int) Math.floor(columnScores[k] * 14));
            int semitones = semitones(tonic, scale, degree);
            double time = start + k * beat;
            boolean offbeat = (k * 37) % 100 < scaled[DISTANCE_FROM_RED];
            if (offbeat && time + beat / 2 <= start + SECONDS_OF_MUSIC) time += beat / 2;
            notes.add(new Note(time, pitch(semitones, 4), duration, "melody", 0));

            if (handpan) {
                int inRange = intoRange(4 * 12 + semitones, HANDPAN_LOW, HANDPAN_HIGH);
                notes.add(new Note(time, pitch(inRange, 0), duration, "handpan", 0));
            }

            // Evenly spread: the j-th of these notes goes with melody note j * melodyNotes / changeNotes (rounded down).
            if (placed < changeNotes && k == placed * melodyNotes / changeNotes) {
                placed++;
                int raised = semitones(tonic, scale, degree + raise);
                int inRange = intoRange(4 * 12 + raised, BAGPIPES_LOW, BAGPIPES_HIGH);
                notes.add(new Note(time, pitch(inRange, 0), duration, "bagpipes", changeDb));
                notes.add(new Note(time, pitch(raised % 12, 2), duration, "stringBass", changeDb));
            }
        }
        return new FramePlan(index, bpm, mode, (major ? MAJOR_KEYS : MINOR_KEYS)[keyIndex], shortNotes,
                melodyInstrument, bassInstrument, handpan ? "handpan" : null,
                changeVoices ? "bagpipes" : null, changeVoices ? "string bass" : null, notes);
    }

    /** Semitones above the C of octave 4 for a step of the key's scale: step 0 is the tonic, 7 steps make an octave. */
    private static int semitones(int tonic, int[] scale, int degree) {
        return tonic + scale[degree % 7] + 12 * (degree / 7);
    }

    /** Tone.js pitch name, e.g. "C#5", for a number of semitones above the C of the given octave. */
    private static String pitch(int semitonesAboveC, int octave) {
        return PITCH_NAMES[semitonesAboveC % 12] + (octave + semitonesAboveC / 12);
    }
}
