package radical;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Path;
import javax.imageio.ImageIO;

/** One analysis window of a frame, with printed labels masked out. */
final class Frame {
    /** The analysis window inside the 7680x2160 frame. */
    static final Rectangle WINDOW = new Rectangle(1920, 0, 3840, 2160);
    /** Mask boxes in window coordinates, with a margin around the text. */
    static final Rectangle[] YEAR_LABEL_MASKS = { new Rectangle(2038, 1060, 220, 100) };
    static final Rectangle[] CHANGE_MAP_MASKS = { new Rectangle(1820, 1160, 660, 140) };

    private final BufferedImage img;
    private final Rectangle[] masks;

    private Frame(BufferedImage img, Rectangle[] masks) {
        this.img = img;
        this.masks = masks;
    }

    static Frame load(Path png, boolean changeMap) {
        try {
            BufferedImage full = ImageIO.read(png.toFile());
            if (full == null) throw new IOException("not an image: " + png);
            return fromImage(full.getSubimage(WINDOW.x, WINDOW.y, WINDOW.width, WINDOW.height),
                    changeMap ? CHANGE_MAP_MASKS : YEAR_LABEL_MASKS);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    static Frame fromImage(BufferedImage img, Rectangle[] masks) {
        return new Frame(img, masks);
    }

    int width() { return img.getWidth(); }

    int height() { return img.getHeight(); }

    boolean isMasked(int x, int y) {
        for (Rectangle m : masks) if (m.contains(x, y)) return true;
        return false;
    }

    int rgb(int x, int y) { return img.getRGB(x, y) & 0xFFFFFF; }

    /** Brightness: the largest of the red, green and blue values. */
    int value(int x, int y) {
        int c = rgb(x, y);
        return Math.max(c >> 16 & 0xFF, Math.max(c >> 8 & 0xFF, c & 0xFF));
    }
}
