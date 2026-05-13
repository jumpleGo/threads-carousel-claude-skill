import { NextResponse } from "next/server";
import { writeFile, rename } from "node:fs/promises";
import path from "node:path";
import type {
  SlideData,
  BgType,
  FormatId,
  FontId,
  SurfaceId,
  AccentId,
  PurposeId,
} from "../../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  slides: SlideData[];
  font: FontId;
  surface: SurfaceId;
  accent: AccentId;
  purpose: PurposeId;
  bg: BgType;
  format: FormatId;
}

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
const PURPOSE_IDS: ReadonlySet<string> = new Set(["carousel", "presentation"]);
const BG_IDS: ReadonlySet<string> = new Set([
  "none", "blobs", "grid", "lines", "noise", "bignumber", "glow", "paper",
]);
const FORMAT_IDS: ReadonlySet<string> = new Set([
  "threads-4x5", "instagram-square", "linkedin-square",
  "tiktok-9x16", "story-9x16", "wide-16x9",
]);
const SLIDE_TYPES: ReadonlySet<string> = new Set([
  "hook", "body", "cta", "quote", "stats", "list", "checklist",
  "process", "comparison", "image", "emoji", "number",
]);

function bad(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 400 });
}

function optionalInSet(v: unknown, set: ReadonlySet<string>): boolean {
  return v === undefined || (typeof v === "string" && set.has(v));
}

function validate(p: unknown): p is Payload {
  if (!p || typeof p !== "object") return false;
  const x = p as Record<string, unknown>;
  if (!Array.isArray(x.slides) || x.slides.length === 0) return false;
  for (const s of x.slides) {
    if (!s || typeof s !== "object") return false;
    const sl = s as Record<string, unknown>;
    if (typeof sl.type !== "string" || !SLIDE_TYPES.has(sl.type)) return false;
    if (!optionalInSet(sl.surface, SURFACE_IDS)) return false;
    if (!optionalInSet(sl.accent, ACCENT_IDS)) return false;
    if (!optionalInSet(sl.font, FONT_IDS)) return false;
    if (!optionalInSet(sl.bg, BG_IDS)) return false;
  }
  return (
    typeof x.font === "string" && FONT_IDS.has(x.font) &&
    typeof x.surface === "string" && SURFACE_IDS.has(x.surface) &&
    typeof x.accent === "string" && ACCENT_IDS.has(x.accent) &&
    typeof x.purpose === "string" && PURPOSE_IDS.has(x.purpose) &&
    typeof x.bg === "string" && BG_IDS.has(x.bg) &&
    typeof x.format === "string" && FORMAT_IDS.has(x.format)
  );
}

function serialize(p: Payload): string {
  return `import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = ${JSON.stringify(p.slides, null, 2)};

export const DEFAULT_FONT: FontId = ${JSON.stringify(p.font)};
export const DEFAULT_SURFACE: SurfaceId = ${JSON.stringify(p.surface)};
export const DEFAULT_ACCENT: AccentId = ${JSON.stringify(p.accent)};
export const DEFAULT_PURPOSE: PurposeId = ${JSON.stringify(p.purpose)};
export const DEFAULT_BG: BgType = ${JSON.stringify(p.bg)};
export const DEFAULT_FORMAT: FormatId = ${JSON.stringify(p.format)};
`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid JSON");
  }
  if (!validate(body)) return bad("invalid payload");

  const slidesPath = path.resolve(process.cwd(), "src/slides.ts");
  const tmpPath = `${slidesPath}.tmp-${process.pid}-${Date.now()}`;
  const content = serialize(body);

  try {
    await writeFile(tmpPath, content, "utf8");
    await rename(tmpPath, slidesPath);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, bytes: content.length });
}
