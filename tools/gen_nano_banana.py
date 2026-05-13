#!/home/painsearchdev/claude-bot/venv/bin/python3
"""
Generate one image via Gemini "nano-banana" image model (gemini-2.5-flash-image).
The prompt is auto-wrapped to force a pure green chroma-key background so the
companion chroma_remove.py can cleanly cut the subject out.

Usage:
  gen_nano_banana.py "subject description" \\
      [--style "minimal flat illustration"] \\
      [--mood "calm, professional"] \\
      [--orientation portrait|landscape|square] \\
      [--out DIR]

Env:
  GEMINI_API_KEY        required
  GEMINI_IMAGE_MODEL    optional, default gemini-2.5-flash-image

Exit:
  0 ok — stdout = relative path "/images/<file>"
  2 no key
  3 model refused / no image part
  4 network / API error
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_OUT = Path("/home/painsearchdev/.claude/skills/threads-carousel/template/public/images")
DEFAULT_MODEL = "gemini-2.5-flash-image"
API_TPL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

ORIENT_PROMPT = {
    "portrait": "vertical 4:5 portrait composition (1080x1350)",
    "landscape": "horizontal 16:9 landscape composition (1920x1080)",
    "square": "1:1 square composition (1080x1080)",
}


def die(code: int, msg: str) -> None:
    print(f"gen_nano_banana: {msg}", file=sys.stderr)
    sys.exit(code)


def build_prompt(subject: str, style: str, mood: str, orientation: str) -> str:
    return (
        "Generate a single isolated subject for use in a social media carousel slide.\n\n"
        f"Subject: {subject.strip()}\n\n"
        f"Composition: {ORIENT_PROMPT[orientation]}, subject centered with generous "
        "headroom and side padding, no cropping. Subject must be fully contained.\n\n"
        "Background: pure solid green chroma key, hex #00FF00, perfectly uniform, "
        "edge-to-edge, no gradient, no vignette, no shadow falloff onto the background, "
        "no texture. The background WILL be removed automatically via chroma key, so it "
        "must be flat and saturated.\n\n"
        f"Visual style: {style.strip()}.\n"
        f"Mood: {mood.strip()}.\n\n"
        "Constraints: NO text, NO logos, NO watermarks, NO captions, NO recognizable "
        "real human faces. Render only the subject described — nothing else in the frame."
    )


def call_gemini(prompt: str, model: str, key: str) -> dict:
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }
    url = API_TPL.format(model=model) + f"?key={key}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")[:400]
        die(4, f"HTTP {e.code}: {detail}")
    except Exception as e:
        die(4, f"network: {e}")
    return {}  # unreachable


def extract_image(resp: dict) -> tuple[bytes, str]:
    cands = resp.get("candidates") or []
    if not cands:
        block = (resp.get("promptFeedback") or {}).get("blockReason") or "unknown"
        die(3, f"no candidates — block={block}")
    for part in cands[0].get("content", {}).get("parts", []):
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            mime = inline.get("mimeType") or inline.get("mime_type") or "image/png"
            ext = ".png" if "png" in mime else ".jpg"
            return base64.b64decode(inline["data"]), ext
    finish = cands[0].get("finishReason", "unknown")
    die(3, f"no image part in response — finishReason={finish}")
    return b"", ""  # unreachable


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("subject", help="what to render (one sentence)")
    ap.add_argument("--style", default="clean modern illustration, flat colors, vector feel")
    ap.add_argument("--mood", default="professional, calm")
    ap.add_argument("--orientation", choices=list(ORIENT_PROMPT), default="portrait")
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    args = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        die(2, "GEMINI_API_KEY not set")

    model = os.environ.get("GEMINI_IMAGE_MODEL", DEFAULT_MODEL)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    prompt = build_prompt(args.subject, args.style, args.mood, args.orientation)
    resp = call_gemini(prompt, model, key)
    img_bytes, ext = extract_image(resp)

    stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    rand = secrets.token_hex(3)
    fname = f"{stamp}-gemini-{rand}{ext}"
    (out_dir / fname).write_bytes(img_bytes)

    # log the exact prompt so future cleanup / inspection knows why this file exists
    (out_dir / (fname + ".prompt.txt")).write_text(prompt, encoding="utf-8")

    print(f"/images/{fname}")


if __name__ == "__main__":
    main()
