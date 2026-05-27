import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = [
  {
    "type": "hook",
    "text": "я люблю карину",
    "highlight": "люблю",
    "highlightStyle": "italic-box"
  },
  {
    "type": "body",
    "badge": "01",
    "title": "это не просто слова",
    "text": "это утро, ночь и каждая минута между нам.",
    "highlight": "каждая"
  },
  {
    "type": "list",
    "badge": "02",
    "title": "что в ней моё",
    "items": [
      "смех в неожиданные моменты",
      "глаза, в которых видно всё",
      "руки, к которым возвращаюсь"
    ]
  },
  {
    "type": "quote",
    "text": "любовь — это когда дом перестаёт быть местом и становится человеком.",
    "author": "о ней",
    "role": "2026"
  },
  {
    "type": "emoji",
    "emoji": "❤️",
    "title": "и всё остальное — фон",
    "text": "только она в фокусе.",
    "highlight": "фокусе",
    "surface": "gradient",
    "accent": "amber",
    "bg": "blobs"
  },
  {
    "type": "number",
    "badge": "03",
    "bigNumber": "1",
    "title": "одна",
    "text": "ни до, ни после.",
    "highlight": "одна"
  },
  {
    "type": "cta",
    "text": "карина, это мое...",
    "handle": ""
  }
];

export const DEFAULT_FONT: FontId = "editorial";
export const DEFAULT_SURFACE: SurfaceId = "paper";
export const DEFAULT_ACCENT: AccentId = "orange";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "noise";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
