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
        System.out.println("ALL CHECKS PASSED");
    }
}
