package radical;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;

public class SelfCheck {
    public static void main(String[] args) {
        BufferedImage img = new BufferedImage(4, 2, BufferedImage.TYPE_INT_RGB);
        img.setRGB(1, 0, 0x102030);
        Frame f = Frame.fromImage(img, new Rectangle[]{ new Rectangle(3, 0, 1, 2) });
        assert f.value(1, 0) == 0x30 : "value = max channel";
        assert f.isMasked(3, 1) && !f.isMasked(0, 0) : "mask";
        checkMeasure();
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
}
