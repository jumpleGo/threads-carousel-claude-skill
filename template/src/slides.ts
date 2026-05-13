import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = [
  {
    "type": "hook",
    "text": "Ушёл с 250К\nна свой проект",
    "highlight": "250К",
    "highlightStyle": "italic-box"
  },
  {
    "type": "body",
    "badge": "01",
    "title": "Точка старта",
    "text": "Год назад была стабильная зарплата. Сегодня — продукт, клиенты и свой MRR.",
    "highlight": "Год назад"
  },
  {
    "type": "stats",
    "badge": "02",
    "title": "Цифры за год",
    "stats": [
      { "value": "47К", "label": "Средний чек" },
      { "value": "3.2%", "label": "Конверсия" },
      { "value": "480К", "label": "MRR" }
    ],
    "surface": "ember",
    "accent": "lime",
    "bg": "bignumber"
  },
  {
    "type": "quote",
    "text": "это первый сервис\nгде меня поняли",
    "author": "Клиент",
    "surface": "paper",
    "accent": "orange",
    "font": "editorial",
    "bg": "paper"
  },
  {
    "type": "comparison",
    "badge": "03",
    "leftLabel": "Зашло",
    "leftItems": [
      "Бесплатные консультации",
      "Личные звонки",
      "Кейс-стори"
    ],
    "rightLabel": "Мимо",
    "rightItems": [
      "Холодные рассылки",
      "Скидки",
      "Бот в Telegram"
    ]
  },
  {
    "type": "body",
    "badge": "04",
    "title": "Главный урок",
    "text": "Фокус на одной нише. Всё остальное — шум.",
    "highlight": "одной нише"
  },
  {
    "type": "cta",
    "text": "Подписывайся",
    "handle": "@painsearchdev"
  }
];

export const DEFAULT_FONT: FontId = "minimal";
export const DEFAULT_SURFACE: SurfaceId = "dark";
export const DEFAULT_ACCENT: AccentId = "yellow";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "glow";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
