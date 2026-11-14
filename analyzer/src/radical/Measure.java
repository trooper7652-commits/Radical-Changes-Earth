package radical;

import java.awt.Color;
import java.util.HashMap;
import java.util.Map;

/** The six measurements of one frame. Masked pixels are ignored everywhere. */
final class Measure {
    record Raw(double distanceFromRed, double melodyMean, double[] columnScores,
               double vibrancy, double happiness, double uniqueness, double contrast) {}

    static final int MELODY_GROUPS = 32;
    private static final int BRIGHT = 127;
    private static final int RING = 50;

    private Measure() {}

    static Raw all(Frame f, int columnGroups) {
        int[] main = mainColor(f);
        double dr = Math.sqrt(Math.pow(main[0] - 255, 2) + main[1] * main[1] + main[2] * main[2]);
        double mean = 0;
        for (double s : columnScores(f, MELODY_GROUPS)) mean += s / MELODY_GROUPS;
        return new Raw(dr, mean, columnScores(f, columnGroups), vibrancy(f), happiness(f),
                uniqueness(f), contrast(f));
    }

    /** Most common color, each channel quantized to c/16*16+8 (compression noise). */
    static int[] mainColor(Frame f) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int y = 0; y < f.height(); y++)
            for (int x = 0; x < f.width(); x++) {
                if (f.isMasked(x, y)) continue;
                int c = f.rgb(x, y);
                int q = (((c >> 16 & 0xFF) / 16 * 16 + 8) << 16) | (((c >> 8 & 0xFF) / 16 * 16 + 8) << 8)
                        | ((c & 0xFF) / 16 * 16 + 8);
                counts.merge(q, 1, Integer::sum);
            }
        int best = 0, bestCount = -1;
        for (Map.Entry<Integer, Integer> e : counts.entrySet())
            if (e.getValue() > bestCount) { best = e.getKey(); bestCount = e.getValue(); }
        return new int[]{ best >> 16 & 0xFF, best >> 8 & 0xFF, best & 0xFF };
    }

    /** Per column group: 0.50*dH + 0.25*dS + 0.25*dV of its average color against the main color. */
    static double[] columnScores(Frame f, int groups) {
        float[] main = hsv(mainColor(f));
        long[][] sum = new long[groups][3];
        long[] n = new long[groups];
        for (int x = 0; x < f.width(); x++) {
            int g = (int) ((long) x * groups / f.width());
            for (int y = 0; y < f.height(); y++) {
                if (f.isMasked(x, y)) continue;
                int c = f.rgb(x, y);
                sum[g][0] += c >> 16 & 0xFF;
                sum[g][1] += c >> 8 & 0xFF;
                sum[g][2] += c & 0xFF;
                n[g]++;
            }
        }
        double[] scores = new double[groups];
        for (int g = 0; g < groups; g++) {
            if (n[g] == 0) continue; // fully masked group: no color to compare
            float[] h = hsv(new int[]{ (int) Math.round((double) sum[g][0] / n[g]),
                    (int) Math.round((double) sum[g][1] / n[g]), (int) Math.round((double) sum[g][2] / n[g]) });
            double dh = Math.abs(h[0] - main[0]);
            dh = Math.min(dh, 360 - dh) / 180;
            scores[g] = 0.50 * dh + 0.25 * Math.abs(h[1] - main[1]) + 0.25 * Math.abs(h[2] - main[2]);
        }
        return scores;
    }

    /** Hue in degrees, saturation and value in 0..1. */
    private static float[] hsv(int[] rgb) {
        float[] h = Color.RGBtoHSB(rgb[0], rgb[1], rgb[2], null);
        return new float[]{ h[0] * 360, h[1], h[2] };
    }

    static double vibrancy(Frame f) {
        double sum = 0;
        long n = 0;
        for (int y = 0; y < f.height(); y++)
            for (int x = 0; x < f.width(); x++) {
                if (f.isMasked(x, y)) continue;
                int c = f.rgb(x, y);
                float[] h = Color.RGBtoHSB(c >> 16 & 0xFF, c >> 8 & 0xFF, c & 0xFF, null);
                sum += (h[1] + h[2]) / 2;
                n++;
            }
        return n == 0 ? 0 : sum / n;
    }

    static double happiness(Frame f) {
        long bright = 0, n = 0;
        for (int y = 0; y < f.height(); y++)
            for (int x = 0; x < f.width(); x++) {
                if (f.isMasked(x, y)) continue;
                n++;
                if (f.value(x, y) >= BRIGHT) bright++;
            }
        return n == 0 ? 100 : 100 - 100.0 * bright / n;
    }

    /** Mean V of the largest bright region over mean V of the ring around its bounding box. */
    static double uniqueness(Frame f) {
        int w = f.width(), h = f.height();
        int[] label = new int[w * h]; // 0 = unvisited, else region id
        int[] queue = new int[w * h];
        int bestId = 0, bestSize = 0, id = 0;
        int[] bestBox = null;
        for (int start = 0; start < w * h; start++) {
            if (label[start] != 0 || !isBright(f, start % w, start / w)) continue;
            id++;
            int head = 0, tail = 0, size = 0;
            int[] box = { w, h, -1, -1 }; // minX, minY, maxX, maxY
            queue[tail++] = start;
            label[start] = id;
            while (head < tail) {
                int p = queue[head++], px = p % w, py = p / w;
                size++;
                box[0] = Math.min(box[0], px); box[1] = Math.min(box[1], py);
                box[2] = Math.max(box[2], px); box[3] = Math.max(box[3], py);
                for (int dy = -1; dy <= 1; dy++)
                    for (int dx = -1; dx <= 1; dx++) {
                        int nx = px + dx, ny = py + dy;
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                        int q = ny * w + nx;
                        if (label[q] != 0 || !isBright(f, nx, ny)) continue;
                        label[q] = id;
                        queue[tail++] = q;
                    }
            }
            if (size > bestSize) { bestSize = size; bestId = id; bestBox = box; }
        }
        if (bestId == 0) return 1.0;
        double inSum = 0, ringSum = 0;
        long ringN = 0;
        int x0 = Math.max(0, bestBox[0] - RING), x1 = Math.min(w - 1, bestBox[2] + RING);
        int y0 = Math.max(0, bestBox[1] - RING), y1 = Math.min(h - 1, bestBox[3] + RING);
        for (int y = y0; y <= y1; y++)
            for (int x = x0; x <= x1; x++) {
                if (f.isMasked(x, y)) continue;
                if (label[y * w + x] == bestId) inSum += f.value(x, y);
                else { ringSum += f.value(x, y); ringN++; }
            }
        double ringMean = ringN == 0 ? 0 : ringSum / ringN;
        return inSum / bestSize / Math.max(1, ringMean);
    }

    private static boolean isBright(Frame f, int x, int y) {
        return !f.isMasked(x, y) && f.value(x, y) >= BRIGHT;
    }

    /** Pixels at V=255 with a V=255 neighbour (8 around), over the count of dark pixels. */
    static double contrast(Frame f) {
        long touching = 0, dark = 0;
        for (int y = 0; y < f.height(); y++)
            for (int x = 0; x < f.width(); x++) {
                if (f.isMasked(x, y)) continue;
                int v = f.value(x, y);
                if (v < BRIGHT) dark++;
                if (v == 255 && hasWhiteNeighbour(f, x, y)) touching++;
            }
        return (double) touching / Math.max(1, dark);
    }

    private static boolean hasWhiteNeighbour(Frame f, int x, int y) {
        for (int dy = -1; dy <= 1; dy++)
            for (int dx = -1; dx <= 1; dx++) {
                int nx = x + dx, ny = y + dy;
                if ((dx == 0 && dy == 0) || nx < 0 || ny < 0 || nx >= f.width() || ny >= f.height()) continue;
                if (!f.isMasked(nx, ny) && f.value(nx, ny) == 255) return true;
            }
        return false;
    }
}
