#!/home/painsearchdev/claude-bot/venv/bin/python3
"""
Fetch a single Unsplash photo for a query and save into the carousel's
public/images/. Stdlib + urllib only.

Usage:
  fetch_unsplash.py "офис ноутбук" [--orientation portrait|landscape|squarish] [--out DIR]

Env:
  UNSPLASH_ACCESS_KEY  required

Exit:
  0 ok — stdout = relative path "/images/<file>"
  2 no key
  3 no results
  4 network / API error
"""
from __future__ import annotations

import argparse
import json
import os
import secrets
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_OUT = Path("/home/painsearchdev/.claude/skills/threads-carousel/template/public/images")
API = "https://api.unsplash.com/search/photos"


def die(code: int, msg: str) -> None:
    print(f"fetch_unsplash: {msg}", file=sys.stderr)
    sys.exit(code)


def http_get(url: str, headers: dict[str, str], timeout: float = 15) -> bytes:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("query", help="search query")
    ap.add_argument("--orientation", choices=["portrait", "landscape", "squarish"], default="portrait")
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    args = ap.parse_args()

    key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not key:
        die(2, "UNSPLASH_ACCESS_KEY not set")

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    qs = urllib.parse.urlencode({
        "query": args.query,
        "per_page": 1,
        "orientation": args.orientation,
        "content_filter": "high",
    })
    try:
        raw = http_get(f"{API}?{qs}", {"Authorization": f"Client-ID {key}"})
        data = json.loads(raw)
    except Exception as e:
        die(4, f"search failed: {e}")

    results = data.get("results") or []
    if not results:
        die(3, f"no results for {args.query!r}")

    pic = results[0]
    url = pic["urls"]["regular"]
    photographer = pic.get("user", {}).get("name", "?")
    attrib = pic.get("links", {}).get("html", "?")

    try:
        img_bytes = http_get(url, {})
    except Exception as e:
        die(4, f"download failed: {e}")

    stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    rand = secrets.token_hex(3)
    ext = ".jpg"
    fname = f"{stamp}-unsplash-{rand}{ext}"
    out_path = out_dir / fname
    out_path.write_bytes(img_bytes)

    # log attribution alongside file
    (out_dir / (fname + ".credit.txt")).write_text(
        f"Photo by {photographer} on Unsplash — {attrib}\n",
        encoding="utf-8",
    )

    print(f"/images/{fname}")


if __name__ == "__main__":
    main()
