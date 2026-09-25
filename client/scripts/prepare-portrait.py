#!/usr/bin/env python3
"""
Prepares the hero portrait from a source photograph.

    python scripts/prepare-portrait.py [source] [output]

Defaults:
    source  <repo>/uploads/image-1.jpeg
    output  <repo>/client/public/images/portrait.jpg

Paths are resolved relative to this file, so the project can live anywhere.

Deliberately minimal: Pillow and NumPy only. No machine-learning model, no
generative step, nothing that alters the subject. Features and skin tone come
through exactly as photographed.

Four operations, in order:
  1. Crop to the hero's 4:5 frame, trimming from the bottom so the head keeps
     its headroom. No upscaling - the image is never enlarged.
  2. Gentle contrast around the midtones, plus a small shadow lift so dark
     clothing keeps its detail. Both use smooth curves, so no clipping.
  3. Hue-preserving chroma: distances from luminance are scaled rather than the
     channels themselves, which keeps the colour balance from shifting.
  4. A light unsharp pass for screen.

The background is NOT removed. A studio backdrop is already usable, and cutting
the subject out risks the halos and fringing that background removal introduces.
If you do need that for a different photo, note that the usual segmentation
approach downloads a ~176 MB model - which is exactly why this script avoids it.

Requirements:
    pip install pillow numpy
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

# ---- Paths, resolved from this file so the project is portable --------------
HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO_ROOT / "uploads" / "image-1.jpeg"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else REPO_ROOT / "client" / "public" / "images" / "portrait.jpg"

# ---- Output geometry -------------------------------------------------------
# The hero's photo box is 4:5 - taller than it is wide - so height is the
# longer edge. FRAME is expressed as height relative to width: 5/4 means the
# output is 1.25x as tall as it is wide (e.g. 832x1040). `object-fit: cover`
# then trims nothing.
FRAME = 5 / 4

# Where the crop sits vertically: 0.0 keeps the very top of the frame.
TOP_ANCHOR = 0.0

# Sharpening strength. Deliberately low - enough for screen, no visible halo.
UNSHARP_AMOUNT = 0.35


def crop_to_frame(image: Image.Image) -> Image.Image:
    """Crops to the 4:5 hero frame, preserving width where possible."""
    width, height = image.size
    # FRAME is height/width, so the target height is width * FRAME.
    target_height = round(width * FRAME)

    if target_height <= height:
        # Taller than needed: remove the excess from the bottom, keeping the
        # headroom at the top.
        spare = height - target_height
        top = round(spare * TOP_ANCHOR)
        return image.crop((0, top, width, top + target_height))

    # Too wide to keep the full width at this ratio: crop the sides, centred.
    target_width = round(height / FRAME)
    left = round((width - target_width) / 2)
    return image.crop((left, 0, left + target_width, height))


def grade(array: np.ndarray) -> np.ndarray:
    """Contrast, shadow lift and hue-preserving chroma. All in float 0..1."""
    # Gentle S-curve: smooth, so nothing clips to pure black or white.
    array = array + 0.055 * np.sin(2 * np.pi * (array - 0.5))

    # Lift the shadows a touch so dark fabric keeps its detail.
    array = np.power(np.clip(array, 0, 1), 0.975)

    # Chroma: scale the distance from luminance rather than the channels, which
    # preserves hue. Adjusting channels directly would rotate the colour.
    luminance = (0.2126 * array[..., 0] + 0.7152 * array[..., 1] + 0.0722 * array[..., 2])[..., None]
    array = luminance + (array - luminance) * 1.03

    return np.clip(array, 0, 1)


def unsharp(image: Image.Image) -> Image.Image:
    """Unsharp mask, applied without an alpha channel to avoid edge fringing."""
    blurred = image.filter(ImageFilter.GaussianBlur(radius=1.2))
    return Image.blend(image, blurred, -UNSHARP_AMOUNT)


def main() -> int:
    if not SRC.exists():
        print(f"source photo not found: {SRC}", file=sys.stderr)
        print("pass a path explicitly:  python scripts/prepare-portrait.py <source> [output]", file=sys.stderr)
        return 1

    with Image.open(SRC) as opened:
        original = opened.convert("RGB")

    original_size = original.size
    cropped = crop_to_frame(original)

    array = np.asarray(cropped, dtype=np.float32) / 255.0
    array = grade(array)

    graded = Image.fromarray((array * 255).round().astype(np.uint8), "RGB")
    final = unsharp(graded)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT, "JPEG", quality=88, optimize=True, progressive=True, subsampling=1)

    size_kb = OUT.stat().st_size / 1024
    print(f"wrote {OUT}")
    print(f"  source   {original_size[0]}x{original_size[1]}")
    print(f"  portrait {final.size[0]}x{final.size[1]}  ({size_kb:.1f} KB)")
    if final.size[0] == original_size[0] and final.size[1] == original_size[1]:
        print("  note: no cropping was needed at this aspect ratio")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
