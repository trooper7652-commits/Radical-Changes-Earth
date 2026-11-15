package radical;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** The team's music rules: turns one frame's 1-100 values into tempo, key, instruments and notes. */
final class MusicRules {
    /**
     * voice: "melody", "bass", "handpan", "panHang", "panBalafon", "stringBass" or "oboe".
     * volumeDb: 0 is full volume, negative is quieter.
     */
    record Note(double time, String pitch, double duration, String voice, double volumeDb) {}

    /** The handpan, panHang, panBalafon, string bass and oboe instruments are null in a frame where that voice has no notes. */
    record FramePlan(int index, double bpm, String mode, String key, boolean shortNotes,
                     String melodyInstrument, String bassInstrument, String handpanInstrument,
                     String panHangInstrument, String panBalafonInstrument, String stringBassInstrument,
                     String oboeInstrument, List<Note> notes) {}

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

    /** Owner: "Make the notes overlap by 1 beat now". Every note rings this many beats past the next note of its voice. */
    static final double OVERLAP_BEATS = 1.0;

    /** The low synth plays the handpan's notes this many octaves lower (owner: "an octave or two lower"). */
    static final int LOW_SYNTH_OCTAVES = 1;

    /**
     * The change voices: panHang and panBalafon (the same notes, together) and stringBass.
     * The owner's "more present by a factor of 2": the change is doubled for the change voices only.
     */
    static final double CHANGE_VOICE_PRESENCE = 2.0;

    /** Song v3 (team): the change voices play 10 dB louder, but never above -3 dB. */
    static final double CHANGE_VOICE_BOOST_DB = 10, CHANGE_VOICE_MAX_DB = -3;

    /** The ranges the recordings cover, in semitones above C0 (octave * 12 + semitones above C). */
    private static final int HANDPAN_LOW = 3 * 12 + 9, HANDPAN_HIGH = 5 * 12 + 2;   // A3..D5
    private static final int BALAFON_LOW = 3 * 12 + 1, BALAFON_HIGH = 5 * 12 + 5;   // C#3..F5
    // The oboe recordings are D, F and A# from A#2 to F5; the player re-pitches the nearest recording for other notes.
    private static final int OBOE_LOW = 2 * 12 + 10, OBOE_HIGH = 5 * 12 + 5;        // A#2..F5

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

    /** The change value that drives the change voices, capped at 100. Tempo keeps the plain change. */
    static double presenceChange(double change) {
        return Math.min(100, change * CHANGE_VOICE_PRESENCE);
    }

    /** Base volume of the change voices: -30 dB at 1, rising to -6 dB at 100. */
    static double changeVoiceDb(double presenceChange) {
        return -30 + 24 * (presenceChange - 1) / 99;
    }

    /** The change voices' volume: the base volume plus CHANGE_VOICE_BOOST_DB, capped at CHANGE_VOICE_MAX_DB. */
    static double boostedChangeVoiceDb(double presenceChange) {
        return Math.min(CHANGE_VOICE_MAX_DB, changeVoiceDb(presenceChange) + CHANGE_VOICE_BOOST_DB);
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
        String melodyInstrument = !energetic && shortNotes ? "harp" : "synth";
        String bassInstrument = energetic ? "piano" : shortNotes ? "bells" : "sustain strings";
        boolean lowSynth = !energetic && !shortNotes;
        boolean handpan = !energetic; // the handpan joins the harp and the low synth

        // The change voices follow the change from the previous frame. Frame 0 has none, so they stay out.
        boolean changeVoices = change > 0;
        double presence = presenceChange(change);
        int changeNotes = changeVoices ? Math.max(1, (int) Math.round(melodyNotes * presence / 100)) : 0;
        int raise = (int) Math.round(presence / 100 * 7); // scale steps: up to one octave
        double changeDb = boostedChangeVoiceDb(presence);

        double start = 4.0 * index;
        double beat = 60 / bpm;
        double duration = (shortNotes ? SHORT_NOTE : LONG_NOTE) * beat;
        List<Note> notes = new ArrayList<>();
        int placed = 0; // notes of each change voice added so far
        for (int k = 0; k < melodyNotes; k++) {
            if (k % 4 == 0) notes.add(new Note(start + k * beat, pitch(tonic, 2), duration, "bass", 0));

            int degree = Math.min(13, (int) Math.floor(columnScores[k] * 14));
            int semitones = semitones(tonic, scale, degree);
            double time = start + k * beat;
            boolean offbeat = (k * 37) % 100 < scaled[DISTANCE_FROM_RED];
            if (offbeat && time + beat / 2 <= start + SECONDS_OF_MUSIC) time += beat / 2;
            int handpanPitch = intoRange(4 * 12 + semitones, HANDPAN_LOW, HANDPAN_HIGH);
            String melodyPitch = lowSynth ? pitch(handpanPitch - 12 * LOW_SYNTH_OCTAVES, 0) : pitch(semitones, 4);
            notes.add(new Note(time, melodyPitch, duration, "melody", 0));

            if (handpan) notes.add(new Note(time, pitch(handpanPitch, 0), duration, "handpan", 0));

            // Evenly spread: the j-th of these notes goes with melody note j * melodyNotes / changeNotes (rounded down).
            if (placed < changeNotes && k == placed * melodyNotes / changeNotes) {
                placed++;
                int raised = semitones(tonic, scale, degree + raise);
                int hang = intoRange(4 * 12 + raised, HANDPAN_LOW, HANDPAN_HIGH);
                int balafon = intoRange(4 * 12 + raised, BALAFON_LOW, BALAFON_HIGH);
                notes.add(new Note(time, pitch(hang, 0), duration, "panHang", changeDb));
                notes.add(new Note(time, pitch(balafon, 0), duration, "panBalafon", changeDb));
                notes.add(new Note(time, pitch(raised % 12, 2), duration, "stringBass", changeDb));
            }

            // Owner: "have the oboe play every melody note".
            notes.add(new Note(time, pitch(intoRange(4 * 12 + semitones, OBOE_LOW, OBOE_HIGH), 0), duration, "oboe", 0));
        }
        overlap(notes, beat);
        return new FramePlan(index, bpm, mode, (major ? MAJOR_KEYS : MINOR_KEYS)[keyIndex], shortNotes,
                melodyInstrument, bassInstrument, handpan ? "handpan" : null,
                changeVoices ? "handpan" : null, changeVoices ? "balafon" : null, changeVoices ? "string bass" : null,
                "oboe", notes);
    }

    /**
     * Owner: notes overlap. Each note that has a next note in its voice lasts at least until
     * OVERLAP_BEATS after that next note starts; the last note of each voice keeps its length.
     */
    private static void overlap(List<Note> notes, double beat) {
        notes.sort(Comparator.comparingDouble(Note::time)); // stable: notes at the same time keep their order
        for (int i = 0; i < notes.size(); i++) {
            Note note = notes.get(i);
            for (int j = i + 1; j < notes.size(); j++) {
                Note next = notes.get(j);
                if (!next.voice().equals(note.voice())) continue;
                double duration = Math.max(note.duration(), next.time() - note.time() + OVERLAP_BEATS * beat);
                notes.set(i, new Note(note.time(), note.pitch(), duration, note.voice(), note.volumeDb()));
                break;
            }
        }
    }

    /** Owner round 15, no pauses: the last note of each voice rings until OVERLAP_BEATS after the next frame starts. */
    static void joinNextFrame(FramePlan plan) {
        double nextStart = 4.0 * (plan.index() + 1);
        double beat = 60 / plan.bpm();
        List<Note> notes = plan.notes();
        java.util.Map<String, Integer> last = new java.util.HashMap<>();
        for (int i = 0; i < notes.size(); i++) last.put(notes.get(i).voice(), i); // sorted by time: last index is latest
        for (int i : last.values()) {
            Note n = notes.get(i);
            double duration = Math.max(n.duration(), nextStart - n.time() + OVERLAP_BEATS * beat);
            notes.set(i, new Note(n.time(), n.pitch(), duration, n.voice(), n.volumeDb()));
        }
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
