#!/usr/bin/env python3
"""
Convert PNG images larger than 3MB in `assets/` to WebP for web delivery.

Creates `.webp` sibling files (does not remove originals). Prints a summary.

Usage: python scripts/convert_large_pngs_to_webp.py
"""
from pathlib import Path
import shutil
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
THRESH = 3 * 1024 * 1024


def human(n: int) -> str:
    for unit in ['B','KB','MB','GB']:
        if n < 1024.0:
            return f"{n:.1f}{unit}"
        n /= 1024.0
    return f"{n:.1f}TB"


def find_large_pngs(folder: Path):
    out = []
    for p in folder.rglob('*.png'):
        try:
            if p.is_file() and p.stat().st_size > THRESH:
                out.append(p)
        except Exception:
            continue
    return out


def convert_to_webp(path: Path, quality: int = 80):
    out_path = path.with_suffix('.webp')
    try:
        with Image.open(path) as im:
            im = im.convert('RGBA') if im.mode in ('LA','RGBA','P') else im.convert('RGB')
            im.save(out_path, format='WEBP', quality=quality, method=6)
    except Exception as e:
        return {'path': str(path), 'error': str(e)}
    return {'path': str(path), 'out': str(out_path), 'new_size': out_path.stat().st_size}


def main():
    if not ASSETS.exists():
        print(f"Assets folder not found: {ASSETS}")
        sys.exit(1)

    imgs = find_large_pngs(ASSETS)
    if not imgs:
        print("No PNGs >3MB found in assets.")
        return

    print(f"Found {len(imgs)} PNG(s) >3MB to convert.")

    results = []
    for img in imgs:
        before = img.stat().st_size
        r = convert_to_webp(img)
        if r.get('error'):
            print(f"Error converting {img}: {r['error']}")
            results.append({'path':str(img),'before':before,'error':r['error']})
            continue
        after = r.get('new_size', 0)
        saved = before - after
        pct = (saved / before * 100) if before else 0
        print(f"Converted: {img.name} — {human(before)} → {human(after)} ({pct:.1f}% saved) -> {r['out']}")
        results.append({'path':str(img),'before':before,'after':after})

    total_before = sum(x.get('before',0) for x in results)
    total_after = sum(x.get('after',0) for x in results)
    print("\nSummary:")
    print(f"Total before: {human(total_before)}")
    print(f"Total after:  {human(total_after)}")
    print(f"Total saved:  {human(total_before - total_after)}")


if __name__ == '__main__':
    main()
