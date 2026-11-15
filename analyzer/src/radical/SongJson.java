package radical;
import java.util.List;
final class SongJson {
    record FrameEntry(MusicRules.FramePlan plan, Measure.Raw raw, double[] scaled, double change, String label, double videoTime) {}
    static String write(List<FrameEntry> frames) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"version\":1");
        sb.append(",\"songSeconds\":27");
        sb.append(",\"frameSeconds\":3");
        sb.append(",\"transitionSeconds\":1");
        sb.append(",\"videoSpeed\":0.75");
        sb.append(",\"frames\":[");

        for (int i = 0; i < frames.size(); i++) {
            FrameEntry e = frames.get(i);
            if (i > 0) sb.append(",");
            sb.append("{");
            sb.append("\"index\":").append(e.plan().index());
            sb.append(",\"videoTime\":").append(num(e.videoTime()));
            sb.append(",\"startTime\":").append(num(4.0 * e.plan().index()));
            sb.append(",\"label\":").append(quote(e.label()));
            sb.append(",\"raw\":{");
            sb.append("\"melody\":").append(num(e.raw().melodyMean()));
            sb.append(",\"vibrancy\":").append(num(e.raw().vibrancy()));
            sb.append(",\"happiness\":").append(num(e.raw().happiness()));
            sb.append(",\"uniqueness\":").append(num(e.raw().uniqueness()));
            sb.append(",\"contrast\":").append(num(e.raw().contrast()));
            sb.append("}");
            sb.append(",\"scaled\":{");
            sb.append("\"melody\":").append(num(e.scaled()[0]));
            sb.append(",\"vibrancy\":").append(num(e.scaled()[1]));
            sb.append(",\"happiness\":").append(num(e.scaled()[2]));
            sb.append(",\"uniqueness\":").append(num(e.scaled()[3]));
            sb.append(",\"contrast\":").append(num(e.scaled()[4]));
            sb.append("}");
            sb.append(",\"change\":").append(num(e.change()));
            sb.append(",\"bpm\":").append(num(e.plan().bpm()));
            sb.append(",\"mode\":").append(quote(e.plan().mode()));
            sb.append(",\"key\":").append(quote(e.plan().key()));
            sb.append(",\"shortNotes\":").append(e.plan().shortNotes());
            sb.append(",\"melodyInstrument\":").append(quote(e.plan().melodyInstrument()));
            sb.append(",\"bassInstrument\":").append(quote(e.plan().bassInstrument()));
            sb.append(",\"handpanInstrument\":").append(quoteOrNull(e.plan().handpanInstrument()));
            sb.append(",\"panHangInstrument\":").append(quoteOrNull(e.plan().panHangInstrument()));
            sb.append(",\"panBalafonInstrument\":").append(quoteOrNull(e.plan().panBalafonInstrument()));
            sb.append(",\"stringBassInstrument\":").append(quoteOrNull(e.plan().stringBassInstrument()));
            sb.append(",\"oboeInstrument\":").append(quoteOrNull(e.plan().oboeInstrument()));
            sb.append(",\"notes\":[");

            for (int j = 0; j < e.plan().notes().size(); j++) {
                MusicRules.Note note = e.plan().notes().get(j);
                if (j > 0) sb.append(",");
                sb.append("{");
                sb.append("\"time\":").append(num(note.time()));
                sb.append(",\"pitch\":").append(quote(note.pitch()));
                sb.append(",\"duration\":").append(num(note.duration()));
                sb.append(",\"voice\":").append(quote(note.voice()));
                sb.append(",\"volumeDb\":").append(num(note.volumeDb()));
                sb.append("}");
            }

            sb.append("]}");
        }

        sb.append("],\"sources\":[\"https://svs.gsfc.nasa.gov/5313/\"]}");
        return sb.toString();
    }
    /** A voice that does not play in a frame has no instrument: JSON null. */
    static String quoteOrNull(String s) {
        return s == null ? "null" : quote(s);
    }
    static String quote(String s) {
        StringBuilder sb = new StringBuilder();
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': sb.append("\\\\"); break;
                case '"': sb.append("\\\""); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append('"');
        return sb.toString();
    }
    static String num(double d) {
        String s = Double.toString(d);
        if (Double.isNaN(d) || Double.isInfinite(d)) {
            throw new IllegalArgumentException("NaN or infinite not allowed");
        }
        return s;
    }
    private SongJson() {}
}
