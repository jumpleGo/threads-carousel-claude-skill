import { NextResponse } from "next/server";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { renderHook } from "../../../../scripts/render-hook";
import type { FontId, SurfaceId, AccentId, BgType, FormatId } from "../../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FONT_IDS: ReadonlySet<string> = new Set([
  "minimal", "editorial", "clean", "mono", "condensed",
]);
const SURFACE_IDS: ReadonlySet<string> = new Set([
  "dark", "white", "light", "paper", "gradient", "pastel", "neon", "ember",
]);
const ACCENT_IDS: ReadonlySet<string> = new Set([
  "yellow", "red", "teal", "coral", "orange", "violet",
  "lime", "blue", "fuchsia", "pink", "amber",
]);
const BG_IDS: ReadonlySet<string> = new Set([
  "none", "blobs", "grid", "lines", "noise", "bignumber", "glow", "paper",
]);
const FORMAT_IDS: ReadonlySet<string> = new Set([
  "threads-4x5", "instagram-square", "linkedin-square",
  "tiktok-9x16", "story-9x16", "wide-16x9",
]);

interface HookProps {
  text: string;
  highlight?: string;
  highlightStyle?: "default" | "italic-box";
  badge?: string;
  fontId: FontId;
  surfaceId: SurfaceId;
  accentId: AccentId;
  bgType: BgType;
  formatId: FormatId;
  index: number;
  total: number;
}

function validate(p: unknown): p is HookProps {
  if (!p || typeof p !== "object") return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.text === "string" && x.text.length > 0 && x.text.length < 500 &&
    (x.highlight === undefined || (typeof x.highlight === "string" && x.highlight.length < 80)) &&
    (x.highlightStyle === undefined || x.highlightStyle === "default" || x.highlightStyle === "italic-box") &&
    (x.badge === undefined || (typeof x.badge === "string" && x.badge.length < 16)) &&
    typeof x.fontId === "string" && FONT_IDS.has(x.fontId) &&
    typeof x.surfaceId === "string" && SURFACE_IDS.has(x.surfaceId) &&
    typeof x.accentId === "string" && ACCENT_IDS.has(x.accentId) &&
    typeof x.bgType === "string" && BG_IDS.has(x.bgType) &&
    typeof x.formatId === "string" && FORMAT_IDS.has(x.formatId) &&
    typeof x.index === "number" && typeof x.total === "number"
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!validate(body)) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const outPath = path.join(
    os.tmpdir(),
    `hook-${Date.now()}-${Math.floor(Math.random() * 1e6)}.mp4`,
  );

  try {
    const { ms } = await renderHook({
      inputProps: body as unknown as Record<string, unknown>,
      formatId: body.formatId,
      outPath,
    });

    const bytes = await readFile(outPath);
    await unlink(outPath).catch(() => {});

    return new Response(bytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename="01-hook.mp4"`,
        "X-Render-Ms": String(ms),
      },
    });
  } catch (err) {
    await unlink(outPath).catch(() => {});
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
