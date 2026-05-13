#!/home/painsearchdev/claude-bot/venv/bin/python3
"""
Remove a green chroma-key background from an image, writing a transparent PNG.
Pure Pillow — no numpy.

Usage:
  chroma_remove.py in.{png,jpg} out.png [--threshold 40] [--feather 1.0] [--despill]

A pixel is considered "green" when:
  g - max(r, b) >= threshold

Feather: gaussian blur radius applied to the alpha mask for soft edges.
Despill: reduce green channel where alpha is partial, kills green halo.

Exit:
  0 ok
  2 bad input (file missing, unreadable)
  3 nothing to remove (image had no green) — still writes RGBA copy
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


def die(code: int, msg: str) -> None:
    print(f"chroma_remove: {msg}", file=sys.stderr)
    sys.exit(code)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("in_path")
    ap.add_argument("out_path")
    ap.add_argument("--threshold", type=int, default=40,
                    help="g-max(r,b) >= threshold → treated as green (default 40)")
    ap.add_argument("--feather", type=float, default=1.0,
                    help="gaussian blur radius on the mask, in px (default 1.0)")
    ap.add_argument("--despill", action="store_true",
                    help="reduce green channel where alpha < 255 to kill green halo")
    args = ap.parse_args()

    inp = Path(args.in_path)
    outp = Path(args.out_path)
    if not inp.is_file():
        die(2, f"input not found: {inp}")

    try:
        img = Image.open(inp).convert("RGB")
    except Exception as e:
        die(2, f"cannot open: {e}")

    r, g, b = img.split()
    max_rb = ImageChops.lighter(r, b)
    green_diff = ImageChops.subtract(g, max_rb)  # 0..255, high where g dominates

    thresh = max(1, min(254, args.threshold))
    # Build a binary mask of "is green"
    green_mask = green_diff.point(lambda p: 255 if p >= thresh else 0)

    # Optional soft edge via gaussian
    if args.feather > 0:
        green_mask = green_mask.filter(ImageFilter.GaussianBlur(radius=args.feather))

    # Alpha is the inverse of green
    alpha = green_mask.point(lambda p: 255 - p)

    if args.despill:
        # Where alpha is partial (semi-transparent), pull green down toward max(r,b)
        # to kill green halo around the subject.
        partial_mask = green_mask.point(lambda p: 1 if 0 < p < 255 else 0)
        # New green = pixel where partial: min(g, max_rb); elsewhere keep g
        despilled = ImageChops.darker(g, max_rb)
        g = Image.composite(despilled, g, partial_mask)

    rgba = Image.merge("RGBA", (r, g, b, alpha))
    outp.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(outp, "PNG", optimize=True)

    # Report fraction made transparent — useful sanity check
    bbox = green_mask.getbbox()
    if bbox is None:
        # No green at all — exit 3 (still wrote file as PNG-RGBA copy)
        sys.exit(3)


if __name__ == "__main__":
    main()
