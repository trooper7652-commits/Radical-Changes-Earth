package radical;

/** Turns raw measurements into 1-100 values, one score per frame, and the change between frames. */
final class Scale {
    /** How much the change between frames is amplified (the owner tunes this by ear). */
    static final double AMPLIFY = 1.5;

    private Scale() {}

    /** Stretches the values to 1..100: 1 + 99*(x-min)/(max-min). All equal gives 50. */
    static double[] stretch(double[] values) {
        double min = values[0], max = values[0];
        for (double v : values) { min = Math.min(min, v); max = Math.max(max, v); }
        double[] out = new double[values.length];
        for (int i = 0; i < values.length; i++)
            out[i] = max == min ? 50 : 1 + 99 * (values[i] - min) / (max - min);
        return out;
    }

    /** scaledByVariable[variable][frame] holds 1-100 values; returns the average of the variables per frame. */
    static double[] frameScores(double[][] scaledByVariable) {
        double[] scores = new double[scaledByVariable[0].length];
        for (double[] variable : scaledByVariable)
            for (int frame = 0; frame < scores.length; frame++)
                scores[frame] += variable[frame] / scaledByVariable.length;
        return scores;
    }

    /** Change size 1..100 against the previous frame; frame 0 has no previous frame, so it gets 0. */
    static double[] changes(double[] frameScores, double amplify) {
        double[] out = new double[frameScores.length];
        for (int i = 1; i < out.length; i++)
            out[i] = Math.min(100, Math.max(1, Math.abs(frameScores[i] - frameScores[i - 1]) * amplify));
        return out;
    }

    /** Stretches the column scores of all frames together to 0..1 (one min and max). All equal gives 0.5. */
    static double[][] stretchColumns(double[][] perFrame) {
        double min = Double.MAX_VALUE, max = -Double.MAX_VALUE;
        for (double[] frame : perFrame)
            for (double v : frame) { min = Math.min(min, v); max = Math.max(max, v); }
        double[][] out = new double[perFrame.length][];
        for (int f = 0; f < perFrame.length; f++) {
            out[f] = new double[perFrame[f].length];
            for (int k = 0; k < out[f].length; k++)
                out[f][k] = max == min ? 0.5 : (perFrame[f][k] - min) / (max - min);
        }
        return out;
    }
}
