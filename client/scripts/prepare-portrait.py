#!/usr/bin/env python3
"""
Prepare a photo for the portfolio hero.

Deliberately minimal, and deliberately dependency-light: Pillow + NumPy only.
No machine-learning model, no generative step, nothing that alters the subject.
Facial features, skin tone and identity come through exactly as photographed.

    cd client
    pip install pillow numpy
    python scripts/prepare-portrait.py

Edit SRC below to point at your photo, then run it. It writes
public/images/portrait.jpg at the hero's 4:5 aspect ratio.

What it does, and why nothing more:
  1. Crops to 4:5, anchored so the head keeps its headroom.
  2. Very light contrast, a small shadow lift so dark clothing keeps its detail,
     and a gentle output sharpen for web display.
  3. Saves an optimised progressive JPEG at native resolution - no upscaling.

What it does NOT do: remove or replace the background. A studio photo already
has a usable background, and cutting a subject out risks the halos and fringing
that background-removal introduces. If you genuinely need the background gone,
do it deliberately and expect to inspect the result at high zoom - the previous
approach for this project is in git history, but note it downloads a ~176 MB
segmentation model, which is why it is not the default here.
"""
import numpy as np
from PIL import Image, ImageFilter

SRC = "/home/user/uploads/image-1.jpeg"          # <-- your photo
OUT = "/home/user/client/public/images/portrait.jpg"

FRAME = 5 / 4          # height / width for the hero's 4:5 box
TOP_ANCHOR = 0.0       # 0 keeps the top of the frame; raise to trim headroom


def crop_to_frame(img):
    """Crop to 4:5. Trims from the bottom so the head keeps its headroom."""
    w, h = img.size
    target_h = int(round(w * FRAME))
    if target_h >= h:                      # already taller than 4:5: trim width
        target_w = int(round(h / FRAME))
        left = (w - target_w) // 2
        return img.crop((left, 0, left + target_w, h))
    top = int(round((h - target_h) * TOP_ANCHOR))
    top = max(0, min(h - target_h, top))
    return img.crop((0, top, w, top + target_h))


def grade(rgb):
    """
    Restrained tonal adjustment. No colour shift: tinting the whole frame moves
    the skin tone, and the skin tone must stay as photographed.
    """
    x = np.clip(rgb / 255.0, 0, 1)

    # Gentle contrast around midtones (~+7/255 at the steepest point).
    x = x + 0.028 * np.sin(2 * np.pi * (x - 0.5))

    # Small shadow lift so dark clothing does not become a flat mass.
    x = np.power(np.clip(x, 0, 1), 0.975)

    # Hue-preserving chroma restoration: scale distance from luminance only.
    lum = (0.2126 * x[:, :, 0] + 0.7152 * x[:, :, 1] + 0.0722 * x[:, :, 2])[:, :, None]
    x = lum + (x - lum) * 1.03

    return np.clip(x * 255.0, 0, 255)


def unsharp(rgb, amount=0.35, radius=1.2):
    img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    blur = np.asarray(img.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)
    return np.clip(rgb + amount * (rgb - blur), 0, 255)


def main():
    original = Image.open(SRC).convert("RGB")
    framed = crop_to_frame(original)
    print(f"source {original.size} -> cropped {framed.size}")

    rgb = np.asarray(framed, dtype=np.float32)
    rgb = unsharp(grade(rgb))

    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    out.save(OUT, "JPEG", quality=88, optimize=True, progressive=True, subsampling=1)
    print(f"wrote {OUT}  {out.size[0]}x{out.size[1]}")


if __name__ == "__main__":
    main()
