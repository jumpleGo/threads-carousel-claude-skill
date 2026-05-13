import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = [
  {
    type: "hook",
    text: "Утро\nбез возни",
    highlight: "без возни",
    highlightStyle: "italic-box"
  },
  {
    type: "comparison",
    badge: "01",
    leftLabel: "Bialetti",
    leftItems: [
      "15 минут возни",
      "Кофе — окей",
      "Плита и нервы"
    ],
    rightLabel: "Sage Barista",
    rightItems: [
      "30 секунд",
      "Кофе как в кафе",
      "Одна кнопка"
    ]
  },
  {
    type: "stats",
    badge: "02",
    title: "Цена утра",
    stats: [
      { value: "15 мин", label: "Старая возня" },
      { value: "30 сек", label: "Новый ритуал" },
      { value: "30×", label: "Быстрее" }
    ],
    surface: "ember",
    accent: "lime",
    bg: "bignumber"
  },
  {
    type: "image",
    imageSrc: "/images/20260513T082256Z-unsplash-9e9394.jpg",
    title: "Новая станция",
    imageCaption: "Sage Barista Express — кухня, май 2026"
  },
  {
    type: "quote",
    text: "Время важнее денег.\nОсобенно утром.",
    author: "Урок с кухни",
    role: "Май 2026"
  },
  {
    type: "cta",
    text: "Честные апдейты\nо жизни и тех.",
    handle: "@painsearchdev",
    highlight: "Честные",
    highlightStyle: "italic-box"
  }
];

export const DEFAULT_FONT: FontId = "editorial";
export const DEFAULT_SURFACE: SurfaceId = "paper";
export const DEFAULT_ACCENT: AccentId = "orange";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "paper";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
