from PIL import Image
import os

SRC = os.path.join('assets', 'logo.png')
DST = os.path.join('assets', 'favicon.ico')

if not os.path.exists(SRC):
    print('Source not found:', SRC)
    raise SystemExit(1)

im = Image.open(SRC).convert('RGBA')
# Create ICO with multiple sizes
sizes = [16, 32, 48, 64, 96, 128]
icon_sizes = [(s, s) for s in sizes]

# Pillow can save ICO with multiple sizes from a single image
im.save(DST, format='ICO', sizes=icon_sizes)
print('Wrote', DST)
