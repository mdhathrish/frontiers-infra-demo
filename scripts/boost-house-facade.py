#!/usr/bin/env python3
"""Derive the desktop hero house asset from house-cutout.png.

The processed cutout's lower floor (glass doors, balcony, ledge) came out of
matting at ~50% alpha, so on desktop the bottom half of the building reads as
a translucent ghost and looks "cut". The RGB under that matte is a clean
facade, so this script restores opacity inside a feathered region covering
the building body (the right-hand block + the left pillar bay down to the
ledge), leaving the junky far-left area and the soft base fade untouched.

Output is a SEPARATE file used only by the desktop hero stage; mobile and the
masked wordmark keep house-cutout.png.

Usage: python3 scripts/boost-house-facade.py [in.png] [out.png]
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/assets/hero/house-cutout.png"
DST = sys.argv[2] if len(sys.argv) > 2 else "public/assets/hero/house-cutout-desktop.png"

GAIN = 2.2  # alpha multiplier inside the facade region
# Facade region as fractions of the image (x0, y0, x1, y1).
REGIONS = [
    (0.47, 0.30, 0.955, 0.735),  # right block: balcony, glass doors, ledge
    (0.17, 0.38, 0.47, 0.70),    # left bay under the overhang (palm side)
]
FEATHER = 28  # px blur on the region mask so the boost has no visible edge

im = Image.open(SRC).convert("RGBA")
w, h = im.size
arr = np.asarray(im).astype(np.float32)
alpha = arr[..., 3]

mask = Image.new("L", (w, h), 0)
m = np.zeros((h, w), dtype=np.uint8)
for x0, y0, x1, y1 in REGIONS:
    m[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)] = 255
mask = Image.fromarray(m).filter(ImageFilter.GaussianBlur(FEATHER))
k = np.asarray(mask).astype(np.float32) / 255.0

boosted = np.clip(alpha * GAIN, 0, 255)
# Only ever raise alpha, and only where the matte already saw the building.
arr[..., 3] = np.maximum(alpha, alpha + (boosted - alpha) * k)

Image.fromarray(arr.astype(np.uint8), "RGBA").save(DST, optimize=True)
print(f"wrote {DST}")
