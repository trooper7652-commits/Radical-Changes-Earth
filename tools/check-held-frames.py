# Usage: python -I tools/check-held-frames.py <sampled-png-dir>  (t0..t6.png sampled at 4i+1.5 s)
import sys
import numpy as np
from PIL import Image
def gray(p):  # downscaled gray, mean removed so video level range does not matter
    im = Image.open(p).convert('L')
    if p.startswith('data'):  # still: same crop window as the video
        im = im.crop((1920, 0, 5760, 2160))
    a = np.asarray(im.resize((480, 270), Image.BOX), float)
    return a - a.mean()
stills = [gray(f'data/frames/f{i}.png') for i in range(7)]
ok = True
for i in range(7):
    s = gray(f'{sys.argv[1]}/t{i}.png')
    d = [float(np.abs(s - f).mean()) for f in stills]
    best = d.index(min(d))
    good = best == i or (i >= 4 and best >= 4)  # f4-f6 are identical change maps
    ok &= good
    print(f't={4*i+1.5}s expected f{i} closest f{best} diffs={[round(x,1) for x in d]} {"OK" if good else "FAIL"}')
sys.exit(0 if ok else 1)
