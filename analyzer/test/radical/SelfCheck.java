package radical;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.util.Arrays;

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
        long melody = p.notes().stream().filter(n -> n.voice().equals("melody")).count();
        assert melody == 6 && p.notes().size() == 8 : "6 melody + bass on beats 0 and 4";
        for (MusicRules.Note n : p.notes()) assert n.time() >= 8 && n.time() <= 11 : "starts inside 4i..4i+3";
        // A natural minor from A4: degree 0 = A4, 13 = G6, floor(0.5*14) = 7 = A5, score 1.0 caps at 13
        assert p.notes().get(0).pitch().equals("A2") && p.notes().get(0).voice().equals("bass") : "bass tonic";
        assert p.notes().get(1).pitch().equals("A4") && p.notes().get(2).pitch().equals("G6")
                && p.notes().get(3).pitch().equals("A5") && p.notes().get(4).pitch().equals("G6") : "degrees";
        assert Math.abs(p.notes().get(2).time() - (8 + beat)) < 1e-9 : "one note per beat, not pushed at red 1";
        assert Math.abs(p.notes().get(1).duration() - 0.95 * beat) < 1e-9 : "long notes";

        MusicRules.FramePlan q = MusicRules.plan(0, scaled(100, 100, 70, 50, 80, 10), 0, cols);
        assert q.mode().equals("major") && q.key().equals("A♭") : "happiness 50 -> major, melody 100 -> last key";
        assert q.shortNotes() && q.melodyInstrument().equals("harp") && q.bassInstrument().equals("bells")
                : "contrast 10, uniqueness 80 -> harp/bells";
        assert q.notes().get(0).pitch().equals("G#2") && q.notes().get(1).pitch().equals("G#4") : "sharp pitch names";
        double qBeat = 60 / q.bpm();
        // red 100 pushes every note half a beat
        assert Math.abs(q.notes().get(1).time() - 0.5 * qBeat) < 1e-9 : "pushed half a beat late";
        assert Math.abs(q.notes().get(0).time()) < 1e-9 : "bass stays on the beat";
        MusicRules.Note last = q.notes().get(q.notes().size() - 1);
        assert Math.abs(last.time() - 5.5 * qBeat) < 1e-9 && last.time() <= 3 : "pushed last note still inside 3 s";
        assert Math.abs(last.duration() - 0.25 * qBeat) < 1e-9 : "short notes";

        MusicRules.FramePlan r = MusicRules.plan(0, scaled(1, 1, 70, 50, 10, 10), 0, cols);
        assert r.melodyInstrument().equals("flute") && r.bassInstrument().equals("sustain strings") : "long calm";
    }
}
