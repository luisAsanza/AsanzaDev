#!/usr/bin/env python3
"""
Optimize raster images in `assets/` for web without changing filenames or dimensions.

Creates a timestamped backup under `backups/images_backup_<ts>/` before modifying files.
Supports: .jpg, .jpeg, .png, .webp, .gif (basic). Skips .avif and .svg.

Usage: python scripts/optimize_images.py
"""
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
BACKUPS = ROOT / "backups"

EXTS = {"jpg", "jpeg", "png", "webp", "gif"}
SKIP = {"avif", "svg", "ico"}


def should_optimize(path: Path) -> bool:
    ext = path.suffix.lower().lstrip('.')
    return ext in EXTS


def make_backup(files, dest_base: Path) -> Path:
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dest = dest_base / f"images_backup_{ts}"
    dest.mkdir(parents=True, exist_ok=True)
    for f in files:
        rel = f.relative_to(ASSETS)
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(f, target)
    return dest


def optimize_image(path: Path) -> dict:
    orig_size = path.stat().st_size
    ext = path.suffix.lower()
    try:
        with Image.open(path) as im:
            im_format = im.format
            if im_format == 'JPEG' or ext in ('.jpg', '.jpeg'):
                im = im.convert('RGB')
                path_tmp = path.with_suffix(path.suffix + '.tmp')
                im.save(path_tmp, format='JPEG', quality=85, optimize=True, progressive=True)
                path_tmp.replace(path)
            elif im_format == 'PNG' or ext == '.png':
                path_tmp = path.with_suffix(path.suffix + '.tmp')
                im.save(path_tmp, format='PNG', optimize=True, compress_level=9)
                path_tmp.replace(path)
            elif im_format == 'WEBP' or ext == '.webp':
                path_tmp = path.with_suffix(path.suffix + '.tmp')
                im.save(path_tmp, format='WEBP', quality=85, method=6)
                path_tmp.replace(path)
            elif im_format == 'GIF' or ext == '.gif':
                path_tmp = path.with_suffix(path.suffix + '.tmp')
                im.save(path_tmp, format='GIF', optimize=True)
                path_tmp.replace(path)
            else:
                # Unknown raster format — skip
                return {"path": str(path), "orig": orig_size, "new": orig_size, "skipped": True}
    except Exception as e:
        return {"path": str(path), "orig": orig_size, "new": orig_size, "error": str(e)}

    new_size = path.stat().st_size
    return {"path": str(path), "orig": orig_size, "new": new_size}


def find_images(folder: Path):
    out = []
    for p in folder.rglob('*'):
        if p.is_file():
            ext = p.suffix.lower().lstrip('.')
            if ext in SKIP:
                continue
            if should_optimize(p):
                out.append(p)
    return out


def human(n: int) -> str:
    for unit in ['B','KB','MB','GB']:
        if n < 1024.0:
            return f"{n:.1f}{unit}"
        n /= 1024.0
    return f"{n:.1f}TB"


def main():
    if not ASSETS.exists():
        print(f"Assets folder not found: {ASSETS}")
        sys.exit(1)

    imgs = find_images(ASSETS)
    if not imgs:
        print("No raster images found to optimize.")
        return

    print(f"Found {len(imgs)} images to consider for optimization.")

    backup_dir = make_backup(imgs, BACKUPS)
    print(f"Backed up originals to: {backup_dir}")

    results = []
    for img in imgs:
        r = optimize_image(img)
        results.append(r)
        if r.get('skipped'):
            print(f"Skipped: {img}")
        elif r.get('error'):
            print(f"Error optimizing {img}: {r['error']}")
        else:
            saved = r['orig'] - r['new']
            pct = (saved / r['orig'] * 100) if r['orig'] else 0
            print(f"Optimized: {img} — {human(r['orig'])} → {human(r['new'])} ({pct:.1f}% saved)")

    # Summary
    total_before = sum(r.get('orig',0) for r in results)
    total_after = sum(r.get('new',0) for r in results)
    total_saved = total_before - total_after
    print("\nSummary:")
    print(f"Total before: {human(total_before)}")
    print(f"Total after:  {human(total_after)}")
    print(f"Total saved:  {human(total_saved)}")


if __name__ == '__main__':
    main()
