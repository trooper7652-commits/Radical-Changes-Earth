package radical;

import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Reads the 7 frames, applies the team's rules and writes song-data.json. */
public final class Main {
    private static final int FRAMES = 7;
    private static final String[] LABELS = { "2012", "2017", "2022", "2023",
        "Change 2012-2023", "Change 2012-2023", "Change 2012-2023" };

    public static void main(String[] args) throws Exception {
        Path framesDir = Path.of(args[0]);
        Path out = Path.of(args[1]);
        PrintStream console = new PrintStream(System.out, true, StandardCharsets.UTF_8);

        // Pass 1: load each frame once and measure it; f4-f6 are the change maps.
        Frame[] frames = new Frame[FRAMES];
        Measure.Raw[] raw = new Measure.Raw[FRAMES];
        for (int i = 0; i < FRAMES; i++) {
            frames[i] = Frame.load(framesDir.resolve("f" + i + ".png"), i >= 4);
            raw[i] = Measure.all(frames[i], 32);
        }

        // Stretch each variable across the 7 frames: scaled[variable][frame].
        double[][] scaled = new double[6][FRAMES];
        for (int i = 0; i < FRAMES; i++) {
            scaled[MusicRules.DISTANCE_FROM_RED][i] = raw[i].distanceFromRed();
            scaled[MusicRules.MELODY][i] = raw[i].melodyMean();
            scaled[MusicRules.VIBRANCY][i] = raw[i].vibrancy();
            scaled[MusicRules.HAPPINESS][i] = raw[i].happiness();
            scaled[MusicRules.UNIQUENESS][i] = raw[i].uniqueness();
            scaled[MusicRules.CONTRAST][i] = raw[i].contrast();
        }
        for (int v = 0; v < 6; v++) scaled[v] = Scale.stretch(scaled[v]);

        double[] change = Scale.changes(Scale.frameScores(scaled), Scale.AMPLIFY);

        // Pass 2: tempo gives the note count, which sets the column groups.
        double[] bpm = new double[FRAMES];
        double[][] cols = new double[FRAMES][];
        for (int i = 0; i < FRAMES; i++) {
            bpm[i] = MusicRules.bpm(scaled[MusicRules.VIBRANCY][i], change[i], i == 0);
            cols[i] = Measure.columnScores(frames[i], MusicRules.noteCount(bpm[i]));
        }
        double[][] stretched = Scale.stretchColumns(cols);

        List<SongJson.FrameEntry> entries = new ArrayList<>();
        for (int i = 0; i < FRAMES; i++) {
            double[] mine = new double[6];
            for (int v = 0; v < 6; v++) mine[v] = scaled[v][i];
            MusicRules.FramePlan plan = MusicRules.plan(i, mine, change[i], stretched[i]);
            entries.add(new SongJson.FrameEntry(plan, raw[i], mine, change[i], LABELS[i], 3.0 * i));

            // Each voice shows its instrument and note count; the last column is the change voices' volume.
            console.printf("%-17s | %6.1f %6.1f %6.1f %6.1f %6.1f %6.1f | chg %6.1f | %5.1f bpm | %s %s | %s"
                    + " | melody %s | bass %s | handpan %s | panHang %s | panBalafon %s | string bass %s | oboe %s | %s%n",
                LABELS[i], mine[0], mine[1], mine[2], mine[3], mine[4], mine[5], change[i], plan.bpm(),
                plan.mode(), plan.key(), plan.shortNotes() ? "short" : "long",
                voice(plan, "melody", plan.melodyInstrument()), voice(plan, "bass", plan.bassInstrument()),
                voice(plan, "handpan", plan.handpanInstrument()), voice(plan, "panHang", plan.panHangInstrument()),
                voice(plan, "panBalafon", plan.panBalafonInstrument()),
                voice(plan, "stringBass", plan.stringBassInstrument()), voice(plan, "oboe", plan.oboeInstrument()),
                change[i] > 0 ? String.format("%.1f dB", MusicRules.boostedChangeVoiceDb(MusicRules.presenceChange(change[i]))) : "-");
        }

        if (out.getParent() != null) Files.createDirectories(out.getParent());
        Files.writeString(out, SongJson.write(entries), StandardCharsets.UTF_8);
    }

    /** "synth x7": a voice's instrument and how many notes it plays, or "-" when the voice is silent in the frame. */
    private static String voice(MusicRules.FramePlan plan, String voice, String instrument) {
        if (instrument == null) return "-";
        return instrument + " x" + plan.notes().stream().filter(note -> note.voice().equals(voice)).count();
    }
}
