package radical;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.util.Arrays;
import java.util.List;

public class SelfCheck {
    public static void main(String[] args) {
        BufferedImage img = new BufferedImage(4, 2, BufferedImage.TYPE_INT_RGB);
        img.setRGB(1, 0, 0x102030);
        Frame f = Frame.fromImage(img, new Rectangle[]{ new Rectangle(3, 0, 1, 2) });
        assert f.value(1, 0) == 0x30 : "value = max channel";
        assert f.isMasked(3, 1) && !f.isMasked(0, 0) : "mask";
        checkMeasure();
        checkScale();
        checkMusicRules();
        checkSongV2();
        checkSongV3();
        {
            var note = new MusicRules.Note(0.0, "C4", 0.12, "melody", 0.0);
            var hang = new MusicRules.Note(0.0, "G4", 0.12, "panHang", -29.5);
            var plan = new MusicRules.FramePlan(0, 120.0, "major", "C", true, "harp", "bells", "handpan", "handpan", "balafon",
                    null, "oboe", java.util.List.of(note, hang));
            var raw = new Measure.Raw(247.0, 0.2, new double[] { 0.2 }, 0.39, 99.8, 7.6, 2.5e-5);
            String json = SongJson.write(java.util.List.of(new SongJson.FrameEntry(plan, raw, new double[] { 50, 1, 100, 50, 1, 100 }, 0.0, "2012", 0.0)));
            assert json.startsWith("{\"version\":1") : "json starts with version";
            assert json.contains("\"pitch\":\"C4\"") : "json has pitch";
            assert SongJson.quote("a\"b").equals("\"a\\\"b\"") : "quote escapes";
            assert json.contains("\"melodyInstrument\":\"harp\",\"bassInstrument\":\"bells\",\"handpanInstrument\":\"handpan\","
                    + "\"panHangInstrument\":\"handpan\",\"panBalafonInstrument\":\"balafon\",\"stringBassInstrument\":null,"
                    + "\"oboeInstrument\":\"oboe\"") : "json names an instrument per voice, null when silent";
            assert !json.contains("bagpipes") : "no bagpipes voice";
            assert json.contains("\"voice\":\"melody\",\"volumeDb\":0.0}") && json.contains("\"voice\":\"panHang\",\"volumeDb\":-29.5}")
                    : "json gives every note a voice and a volume";
        }
        System.out.println("ALL CHECKS PASSED");
    }

    private static Frame solid(int w, int h, int rgb) {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) img.setRGB(x, y, rgb);
        return Frame.fromImage(img, new Rectangle[0]);
    }

    private static Frame fromImg(BufferedImage img) { return Frame.fromImage(img, new Rectangle[0]); }

    private static void checkMeasure() {
        BufferedImage a = new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB);
        for (int i = 0; i < 4; i++) a.setRGB(i, 0, 0xC8C8C8);
        assert Math.abs(Measure.happiness(fromImg(a)) - 75.0) < 1e-9 : "happiness";

        BufferedImage c = new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB);
        c.setRGB(0, 0, 0xFFFFFF); c.setRGB(1, 0, 0xFFFFFF); c.setRGB(3, 3, 0xFFFFFF);
        assert Math.abs(Measure.contrast(fromImg(c)) - 2.0 / 13) < 1e-9 : "contrast";

        Frame blue = solid(4, 4, 0x0000FF);
        assert Math.abs(Measure.all(blue, 4).distanceFromRed() - 350.1) < 0.5 : "distanceFromRed (blue quantizes to 8,8,248)";
        assert Measure.vibrancy(solid(4, 4, 0)) == 0.0 : "vibrancy black";
        assert Math.abs(Measure.vibrancy(solid(4, 4, 0xFF0000)) - 1.0) < 1e-6 : "vibrancy red";

        assert Math.abs(Measure.uniqueness(solid(4, 4, 0x646464)) - 1.0) < 1e-9 : "uniqueness no bright";
        BufferedImage u = new BufferedImage(20, 20, BufferedImage.TYPE_INT_RGB);
        for (int y = 8; y < 11; y++) for (int x = 8; x < 11; x++) u.setRGB(x, y, 0xFFFFFF);
        assert Measure.uniqueness(fromImg(u)) > 50 : "uniqueness block";

        int[] m = Measure.mainColor(solid(4, 4, 0x286478));
        Frame same = solid(8, 4, (m[0] << 16) | (m[1] << 8) | m[2]);
        for (double s : Measure.columnScores(same, 4)) assert s == 0.0 : "columnScores";
    }

    private static void checkScale() {
        assert Arrays.equals(Scale.stretch(new double[]{2, 4, 6}), new double[]{1, 50.5, 100}) : "stretch";
        assert Arrays.equals(Scale.stretch(new double[]{7, 7, 7}), new double[]{50, 50, 50}) : "stretch all equal";
        double[] scores = Scale.frameScores(new double[][]{ {1, 100, 40}, {3, 50, 40} });
        assert Arrays.equals(scores, new double[]{2, 75, 40}) : "frameScores = mean over variables";
        // |75-2|*1.5 caps at 100; |40-75|*1.5 = 52.5; no change floors at 1; frame 0 has no previous frame
        assert Arrays.equals(Scale.changes(new double[]{2, 75, 40, 40}, Scale.AMPLIFY), new double[]{0, 100, 52.5, 1})
                : "changes";
        double[][] cols = Scale.stretchColumns(new double[][]{ {0.2, 0.4}, {0.6, 0.3} });
        assert cols[0][0] == 0.0 && cols[1][0] == 1.0 && Math.abs(cols[0][1] - 0.5) < 1e-9 : "stretchColumns";
        assert Scale.stretchColumns(new double[][]{ {0.3}, {0.3} })[1][0] == 0.5 : "stretchColumns all equal";
    }

    /** scaled values in the fixed variable order. */
    private static double[] scaled(double red, double melody, double vibrancy, double happiness,
                                   double uniqueness, double contrast) {
        return new double[]{ red, melody, vibrancy, happiness, uniqueness, contrast };
    }

    private static void checkMusicRules() {
        assert Math.abs(MusicRules.bpm(1, 1, false) - 60) < 1e-9 : "bpm low";
        assert Math.abs(MusicRules.bpm(100, 100, false) - 160) < 1e-9 : "bpm high";
        assert Math.abs(MusicRules.bpm(100, 1, true) - 160) < 1e-9 : "bpm first frame = vibrancy alone";
        assert MusicRules.noteCount(120) == 6 && MusicRules.noteCount(60) == 3 && MusicRules.noteCount(160) == 8
                : "noteCount";

        assert MusicRules.keyIndex(1, "major") == 0 && MusicRules.keyIndex(100, "minor") == 11 : "keyIndex ends";
        assert MusicRules.keyIndex(9.2, "major") == 0 && MusicRules.keyIndex(9.3, "major") == 1 : "keyIndex slice";

        // vibrancy 70 & change 60 -> 124.6 bpm -> 6 notes, frame 2 starts at 8 s
        double[] cols = { 0.0, 0.999, 0.5, 1.0, 0.0, 0.0 };
        MusicRules.FramePlan p = MusicRules.plan(2, scaled(1, 1, 70, 49, 10, 50), 60, cols);
        assert p.mode().equals("minor") && p.key().equals("A") : "happiness 49 -> minor, melody 1 -> A";
        assert !p.shortNotes() && p.melodyInstrument().equals("synth") && p.bassInstrument().equals("piano")
                : "contrast 50 -> synth/piano";
        double beat = 60 / p.bpm();
        List<MusicRules.Note> melody = voice(p, "melody"), bass = voice(p, "bass");
        assert melody.size() == 6 && bass.size() == 2 : "6 melody + bass on beats 0 and 4";
        for (MusicRules.Note n : p.notes()) assert n.time() >= 8 && n.time() <= 11 : "starts inside 4i..4i+3";
        // A natural minor from A4: degree 0 = A4, 13 = G6, floor(0.5*14) = 7 = A5, score 1.0 caps at 13
        assert p.notes().get(0) == bass.get(0) && bass.get(0).pitch().equals("A2") : "bass tonic";
        assert pitches(melody).subList(0, 4).equals(List.of("A4", "G6", "A5", "G6")) : "degrees";
        assert Math.abs(melody.get(1).time() - (8 + beat)) < 1e-9 : "one note per beat, not pushed at red 1";
        assert Math.abs(melody.get(0).duration() - 2.85 * beat) < 1e-9 : "long notes";

        MusicRules.FramePlan q = MusicRules.plan(0, scaled(100, 100, 70, 50, 80, 10), 0, cols);
        assert q.mode().equals("major") && q.key().equals("A♭") : "happiness 50 -> major, melody 100 -> last key";
        assert q.shortNotes() && q.melodyInstrument().equals("harp") && q.bassInstrument().equals("bells")
                : "contrast 10, uniqueness 80 -> harp/bells";
        melody = voice(q, "melody");
        bass = voice(q, "bass");
        assert bass.get(0).pitch().equals("G#2") && melody.get(0).pitch().equals("G#4") : "sharp pitch names";
        double qBeat = 60 / q.bpm();
        // red 100 pushes every note half a beat
        assert Math.abs(melody.get(0).time() - 0.5 * qBeat) < 1e-9 : "pushed half a beat late";
        assert Math.abs(bass.get(0).time()) < 1e-9 : "bass stays on the beat";
        MusicRules.Note last = melody.get(melody.size() - 1);
        assert Math.abs(last.time() - 5.5 * qBeat) < 1e-9 && last.time() <= 3 : "pushed last note still inside 3 s";
        assert Math.abs(last.duration() - 0.5 * qBeat) < 1e-9 : "short notes";
        for (MusicRules.Note n : q.notes()) assert n.volumeDb() == 0 : "melody, bass and handpan play at full volume";

        MusicRules.FramePlan r = MusicRules.plan(0, scaled(1, 1, 70, 50, 10, 10), 0, cols);
        assert r.melodyInstrument().equals("flute") && r.bassInstrument().equals("sustain strings") : "long calm";
        assert r.handpanInstrument() == null && voice(r, "handpan").isEmpty() : "no handpan without the harp";
    }

    /** Song v2 (design section 15): the handpan, and the change voices that follow the change (v3: hang and balafon). */
    private static void checkSongV2() {
        double[] cols = { 0.0, 0.999, 0.5, 1.0, 0.0, 0.0 };

        // Handpan: joins the harp (contrast 10, uniqueness 80) with the same notes, moved by octaves into A3..D5.
        MusicRules.FramePlan harp = MusicRules.plan(0, scaled(100, 100, 70, 50, 80, 10), 0, cols);
        List<MusicRules.Note> melody = voice(harp, "melody"), handpan = voice(harp, "handpan");
        assert "handpan".equals(harp.handpanInstrument()) && handpan.size() == 6 : "handpan joins the harp, note for note";
        for (int k = 0; k < 6; k++)
            assert handpan.get(k).time() == melody.get(k).time() && handpan.get(k).duration() == melody.get(k).duration()
                    : "handpan copies the melody's times and lengths";
        // the melody is G#4 G6 G#5 G6 G#4 G#4: G6 comes down two octaves, G#5 one
        assert pitches(handpan).equals(List.of("G#4", "G4", "G#4", "G4", "G#4", "G#4")) : "handpan inside A3..D5";
        assert MusicRules.intoRange(40, 45, 62) == 52 && MusicRules.intoRange(79, 45, 62) == 55
                && MusicRules.intoRange(56, 45, 62) == 56 : "below the range goes up, above comes down, inside stays";
        // C major: melody steps 0, 8, 9 are C4, D5, E5; D5 is the handpan's top note, E5 comes down to E4
        MusicRules.FramePlan edges = MusicRules.plan(0, scaled(1, 1, 70, 50, 80, 10), 0,
                new double[]{ 0.0, 0.6, 0.68, 0.0, 0.0, 0.0 });
        assert pitches(voice(edges, "melody")).subList(0, 3).equals(List.of("C4", "D5", "E5"))
                && pitches(voice(edges, "handpan")).subList(0, 3).equals(List.of("C4", "D5", "E4")) : "handpan range ends at D5";
        assert harp.panHangInstrument() == null && harp.panBalafonInstrument() == null && harp.stringBassInstrument() == null
                && voice(harp, "panHang").isEmpty() && voice(harp, "panBalafon").isEmpty() && voice(harp, "stringBass").isEmpty()
                : "frame 0: no change voices";

        // The owner's presence constant doubles the change (capped at 100) for the change voices only.
        assert MusicRules.CHANGE_VOICE_PRESENCE == 2.0 && MusicRules.presenceChange(32) == 64
                && MusicRules.presenceChange(60) == 100 : "presence doubles the change, capped at 100";
        assert MusicRules.changeVoiceDb(1) == -30 && MusicRules.changeVoiceDb(100) == -6 : "-30 dB at 1, -6 dB at 100";

        // vibrancy 70 & change 32 -> 110.5 bpm -> 5 melody notes. Presence 64 -> round(5 * 0.64) = 3 notes
        // (melody notes 0, 1 and 3), raised round(0.64 * 7) = 4 scale steps, at -30 + 24 * 63 / 99 + 10 dB.
        MusicRules.FramePlan changed = MusicRules.plan(1, scaled(1, 1, 70, 49, 10, 50), 32,
                new double[]{ 0.0, 0.999, 0.5, 1.0, 0.0 });
        assert Math.abs(changed.bpm() - (60 + 50 * 100 / 99.0)) < 1e-9 : "tempo keeps the plain change";
        assert "handpan".equals(changed.panHangInstrument()) && "balafon".equals(changed.panBalafonInstrument())
                && "string bass".equals(changed.stringBassInstrument())
                && changed.handpanInstrument() == null && voice(changed, "handpan").isEmpty() : "change voices, no handpan";
        melody = voice(changed, "melody");
        List<MusicRules.Note> hang = voice(changed, "panHang"), balafon = voice(changed, "panBalafon"),
                stringBass = voice(changed, "stringBass");
        assert hang.size() == 3 && balafon.size() == 3 && stringBass.size() == 3 : "round(N * presence / 100) notes";
        int[] spread = { 0, 1, 3 };
        for (int j = 0; j < 3; j++) {
            MusicRules.Note from = melody.get(spread[j]);
            // long notes (2.85 beats) already ring past the next note + 0.75 beat, so the overlap keeps them
            for (MusicRules.Note n : List.of(hang.get(j), balafon.get(j), stringBass.get(j)))
                assert n.time() == from.time() && n.duration() == from.duration()
                        && Math.abs(n.volumeDb() - (-20 + 24 * 63 / 99.0)) < 1e-9 : "evenly spread, together, at the change volume";
        }
        // A minor: melody steps 0, 13, 13 raised 4 steps are E5, D7, D7. The hang moves them into A3..D5
        // (E5 is above D5: E4; D7 comes down to the top note D5), the balafon into C#3..F5 (E5 stays).
        assert pitches(hang).equals(List.of("E4", "D5", "D5")) : "hang raised, inside A3..D5";
        assert pitches(balafon).equals(List.of("E5", "D5", "D5")) : "balafon raised, inside C#3..F5";
        assert pitches(stringBass).equals(List.of("E2", "D2", "D2")) : "string bass raised, in octave 2";

        // change 1 -> presence 2 -> round(4 * 0.02) = 0 notes, so the floor of one; raised round(0.14) = 0 steps
        MusicRules.FramePlan calm = MusicRules.plan(1, scaled(1, 1, 70, 49, 10, 50), 1, new double[]{ 0.5, 0.0, 0.0, 0.0 });
        assert pitches(voice(calm, "panHang")).equals(List.of("A4")) && pitches(voice(calm, "panBalafon")).equals(List.of("A4"))
                && pitches(voice(calm, "stringBass")).equals(List.of("A2")) : "never fewer than one note; melody A5 not raised";
        assert Math.abs(voice(calm, "panHang").get(0).volumeDb() - (-20 + 24 / 99.0)) < 1e-9 : "quiet at a small change";
        // Range tops, in C major at change 1: a melody F5 stays F5 on the balafon (F4 on the hang); G5 is G4 on both
        MusicRules.FramePlan atF5 = MusicRules.plan(1, scaled(1, 1, 70, 50, 10, 50), 1, new double[]{ 0.75, 0.0, 0.0, 0.0 });
        MusicRules.FramePlan atG5 = MusicRules.plan(1, scaled(1, 1, 70, 50, 10, 50), 1, new double[]{ 0.8, 0.0, 0.0, 0.0 });
        assert pitches(voice(atF5, "melody")).get(0).equals("F5") && pitches(voice(atG5, "melody")).get(0).equals("G5")
                : "melody F5 and G5";
        assert pitches(voice(atF5, "panBalafon")).equals(List.of("F5")) && pitches(voice(atF5, "panHang")).equals(List.of("F4"))
                && pitches(voice(atG5, "panBalafon")).equals(List.of("G4")) && pitches(voice(atG5, "panHang")).equals(List.of("G4"))
                : "balafon range ends at F5";

        // change 60 -> presence capped at 100: every melody note, raised 7 steps (one octave), at -6 + 10 capped to -3 dB
        MusicRules.FramePlan big = MusicRules.plan(2, scaled(1, 1, 70, 49, 10, 50), 60, cols);
        assert pitches(voice(big, "panHang")).equals(List.of("A4", "G4", "A4", "G4", "A4", "A4"))
                && pitches(voice(big, "panBalafon")).equals(List.of("A4", "G4", "A4", "G4", "A4", "A4")) : "all notes, an octave up";
        assert pitches(voice(big, "stringBass")).equals(List.of("A2", "G2", "A2", "G2", "A2", "A2")) : "string bass follows";
        for (String v : List.of("panHang", "panBalafon", "stringBass"))
            for (MusicRules.Note n : voice(big, v)) assert n.volumeDb() == -3 : "loudest at full presence, capped at -3 dB";
    }

    /** Song v3 (team): notes overlap, louder change voices, the oboe on the melody's D, F and A#. */
    private static void checkSongV3() {
        // Overlap. Harp frame: short notes (0.5 beat), red 100 pushes every melody note half a beat, one beat apart.
        // Each note rings 0.75 beat past the next note of its voice: melody 1.75 beats, bass (beats 0 and 4) 4.75.
        MusicRules.FramePlan harp = MusicRules.plan(0, scaled(100, 100, 70, 50, 80, 10), 0,
                new double[]{ 0.0, 0.999, 0.5, 1.0, 0.0, 0.0 });
        double beat = 60 / harp.bpm();
        List<MusicRules.Note> melody = voice(harp, "melody"), bass = voice(harp, "bass"), handpan = voice(harp, "handpan");
        assert MusicRules.OVERLAP_BEATS == 0.75 : "overlap 0.75 beat";
        for (int k = 0; k < 5; k++)
            assert Math.abs(melody.get(k).duration() - 1.75 * beat) < 1e-9 && handpan.get(k).duration() == melody.get(k).duration()
                    : "melody and handpan ring 0.75 beat past their next note";
        assert Math.abs(melody.get(5).duration() - 0.5 * beat) < 1e-9 && Math.abs(handpan.get(5).duration() - 0.5 * beat) < 1e-9
                : "the last note of a voice keeps its length";
        assert Math.abs(bass.get(0).duration() - 4.75 * beat) < 1e-9 && Math.abs(bass.get(1).duration() - 0.5 * beat) < 1e-9
                : "the bass rings to 0.75 beat past the next bass note";
        // Long notes (2.85 beats) that already ring past the next note + 0.75 beat (1.75 beats) keep their length.
        MusicRules.FramePlan flute = MusicRules.plan(0, scaled(1, 1, 70, 50, 10, 10), 0, new double[6]);
        assert Math.abs(voice(flute, "melody").get(1).duration() - 2.85 * 60 / flute.bpm()) < 1e-9 : "long notes keep 2.85 beats";

        // Louder change voices: 10 dB above -30..-6 dB, never above -3 dB (reached at presence 71.125).
        assert MusicRules.CHANGE_VOICE_BOOST_DB == 10 : "+10 dB";
        assert MusicRules.boostedChangeVoiceDb(1) == -20 && Math.abs(MusicRules.boostedChangeVoiceDb(64) - (-20 + 24 * 63 / 99.0)) < 1e-9
                : "-20 dB at 1, 10 dB above the v2 volume below the cap";
        assert MusicRules.boostedChangeVoiceDb(80) == -3 && MusicRules.boostedChangeVoiceDb(100) == -3 : "capped at -3 dB";

        // Oboe. B♭ major (melody 60), melody A#4 C5 A#5 D6 F6 F5: only the D, F and A# get an oboe note, at the
        // nearest recorded octave (A#2 D3 F3 A#3 D4 F4 A#4 D5 F5): A#4, A#4, D5, F5, F5. C5 gets none.
        MusicRules.FramePlan bflat = MusicRules.plan(0, scaled(1, 60, 70, 50, 10, 50), 0,
                new double[]{ 0.0, 0.1, 0.5, 0.68, 0.8, 0.3 });
        melody = voice(bflat, "melody");
        List<MusicRules.Note> oboe = voice(bflat, "oboe");
        assert bflat.key().equals("B♭") && pitches(melody).equals(List.of("A#4", "C5", "A#5", "D6", "F6", "F5")) : "B♭ major melody";
        assert "oboe".equals(bflat.oboeInstrument()) && pitches(oboe).equals(List.of("A#4", "A#4", "D5", "F5", "F5"))
                : "the oboe doubles D, F and A# at the nearest recorded octave, nothing else";
        int[] doubled = { 0, 2, 3, 4, 5 };
        for (int j = 0; j < 5; j++) {
            MusicRules.Note from = melody.get(doubled[j]);
            assert oboe.get(j).time() == from.time() && oboe.get(j).duration() == from.duration()
                    && oboe.get(j).volumeDb() == from.volumeDb() : "oboe at the melody note's time, length and volume";
        }
        // A minor melody A4 G6 A5 G6 A4 A4: no D, F or A#, so no oboe.
        MusicRules.FramePlan noOboe = MusicRules.plan(0, scaled(1, 1, 70, 49, 10, 50), 0, new double[]{ 0.0, 0.999, 0.5, 1.0, 0.0, 0.0 });
        assert pitches(voice(noOboe, "melody")).equals(List.of("A4", "G6", "A5", "G6", "A4", "A4"))
                && noOboe.oboeInstrument() == null && voice(noOboe, "oboe").isEmpty() : "no oboe without D, F or A#";
    }

    private static List<MusicRules.Note> voice(MusicRules.FramePlan plan, String voice) {
        return plan.notes().stream().filter(n -> n.voice().equals(voice)).toList();
    }

    private static List<String> pitches(List<MusicRules.Note> notes) {
        return notes.stream().map(MusicRules.Note::pitch).toList();
    }
}
