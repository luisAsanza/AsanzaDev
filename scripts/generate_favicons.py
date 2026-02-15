#!/usr/bin/env python3
"""
Generate favicon PNGs and a root favicon.ico from `assets/favicon.png`.

Usage:
  python scripts/generate_favicons.py

Requires:
  pip install pillow

This writes the following files to the project root:
  - favicon.ico (contains 16x16,32x32,48x48)
  - favicon-48x48.png
  - android-chrome-192x192.png
  - android-chrome-512x512.png
  - apple-touch-icon.png

It reads `assets/favicon.png` as the source image. Adjust paths if your source differs.
"""
import sys
from pathlib import Path
try:
    from PIL import Image
except Exception:
    print("Pillow is required. Install with: pip install pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "favicon.png"
if not SRC.exists():
    print(f"Source image not found: {SRC}")
    sys.exit(1)

img = Image.open(SRC).convert("RGBA")

# If source has a solid white background, convert near-white to transparent.
# This helps ensure favicons render with transparent background in browsers.
def make_white_transparent(pil_img, threshold=250):
    if pil_img.mode != 'RGBA':
        pil_img = pil_img.convert('RGBA')
    datas = pil_img.getdata()
    newData = []
    for item in datas:
        r, g, b, a = item
        if r >= threshold and g >= threshold and b >= threshold:
            # make pixel fully transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append((r, g, b, a))
    pil_img.putdata(newData)
    return pil_img

# Apply transparency conversion with a conservative threshold
img = make_white_transparent(img, threshold=245)

OUT = ROOT
sizes = {
    "favicon-48x48.png": (48, 48),
    "android-chrome-192x192.png": (192, 192),
    "android-chrome-512x512.png": (512, 512),
    "apple-touch-icon.png": (180, 180),
}

for name, size in sizes.items():
    dest = OUT / name
    out = img.resize(size, Image.LANCZOS)
    out.save(dest, format="PNG")
    print(f"Saved {dest}")

# Create ICO with common browser sizes
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_path = OUT / "favicon.ico"
try:
    img.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"Saved {ico_path}")
except Exception as e:
    print("Failed to write ICO:", e)
    print("As a fallback, try installing the pillow-ico plugin or create ICO with ImageMagick.")

print("Done. Verify files are accessible at the site root and then request re-indexing in GSC.")
