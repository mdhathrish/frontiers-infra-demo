#!/usr/bin/env python3
"""One-shot cleanup of the hero house cutout (public/assets/hero/house-cutout.png).

The curated cutout ships slightly tilted (~1.9 deg roofline slope) and its
alpha content runs to the very last pixel row, so the building base reads as
a hard horizontal cut. This script:

1. auto-detects the roofline slope and rotates the image to level it
2. crops to the alpha bounding box (+padding) so the content is centered
3. multiplies the bottom 15% of the alpha channel by a linear ramp -> the
   base dissolves softly (into the hero's cloud layers)

NOT idempotent — run it against the ORIGINAL cutout only (git 37dd92a).
Usage: python3 scripts/process-house-cutout.py [in.png] [out.png]
"""
import math
import sys

import numpy as np
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/assets/hero/house-cutout.png"
DST = sys.argv[2] if len(sys.argv) > 2 else SRC

PAD = 40          # px padding on sides/top after crop
FADE = 0.15       # fraction of content height for the bottom alpha fade
ALPHA_THRESH = 8  # bbox threshold


def roof_slope(alpha: np.ndarray, x0: int, x1: int) -> float:
    """Slope of the topmost-opaque-pixel line across the roof span."""
    cols, tops = [], []
    for x in range(x0, x1, 8):
        col = np.where(alpha[:, x] > 128)[0]
        if len(col):
            cols.append(x)
            tops.append(col[0])
    m, b = np.polyfit(cols, tops, 1)
    res = np.array(tops) - (m * np.array(cols) + b)
    mad = np.median(np.abs(res - np.median(res)))
    keep = np.abs(res) < max(6, 5 * mad)
    m2, _ = np.polyfit(np.array(cols)[keep], np.array(tops)[keep], 1)
    return m2


im = Image.open(SRC).convert("RGBA")
a = np.array(im.getchannel("A"))

# -- 1. level: y grows downward, so a positive slope means the right side
# sags; PIL rotate(+deg) turns counterclockwise (right side up) -> negate.
slope = roof_slope(a, 420, 1500)
angle = math.degrees(math.atan(slope))
print(f"detected roof slope {slope:.5f} -> rotating {angle:.3f} deg")
im = im.rotate(-angle, resample=Image.BICUBIC, expand=True)

# -- 2. crop to alpha bbox + padding (no bottom padding: the fade handles it)
a = np.array(im.getchannel("A"))
ys, xs = np.where(a > ALPHA_THRESH)
x0, x1 = max(int(xs.min()) - PAD, 0), min(int(xs.max()) + PAD, im.width)
y0, y1 = max(int(ys.min()) - PAD, 0), min(int(ys.max()) + 1, im.height)
im = im.crop((x0, y0, x1, y1))
print(f"cropped to {im.width}x{im.height}")

# -- 3. bottom alpha fade
arr = np.array(im)
h = arr.shape[0]
fade_rows = int(h * FADE)
ramp = np.linspace(1.0, 0.0, fade_rows)[:, None]
band = arr[h - fade_rows :, :, 3].astype(np.float64)
arr[h - fade_rows :, :, 3] = (band * ramp).astype(np.uint8)

Image.fromarray(arr).save(DST, optimize=True)
print(f"wrote {DST}")

# verify
check = np.array(Image.open(DST).getchannel("A"))
print("residual slope:", f"{roof_slope(check, 400, 1400):.5f}")
print("max alpha in last 5 rows:", int(check[-5:].max()))
