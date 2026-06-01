import type { SlideData, BgType, FormatId, FontId, SurfaceId, AccentId, PurposeId } from "./lib/types";

export const SLIDES: SlideData[] = [
  {
    type: "hook",
    text: "Я веду фронтенд-команды\nи чиню то, что их тормозит",
    highlight: "чиню",
  },
  {
    type: "image",
    badge: "КТО",
    title: "Эмиль Латыпов",
    imageSrc: "/images/avatar.jpg",
    imageCaption: "Frontend Tech Lead в FitStars · 8+ лет в сложном вебе",
    imageLayout: "background",
  },
  {
    type: "stats",
    title: "В цифрах",
    stats: [
      { value: "8+", label: "лет в вебе" },
      { value: "7", label: "инженеров в команде" },
      { value: "3", label: "веб · SmartTV · SberBox" },
    ],
  },
  {
    type: "body",
    badge: "01",
    title: "Кодовая база, в которую я прихожу",
    text: "Легаси-стек, растущий техдолг, релизы, которые занимают больше времени, чем должны.",
    highlight: "техдолг",
  },
  {
    type: "list",
    badge: "02",
    title: "Что я делаю",
    items: [
      "Мигрирую легаси на Vue 3 / Nuxt / TS — не останавливая продукт",
      "Проектирую системы, которые команда расширяет без страха",
      "Уменьшаю бандлы, чиню Core Web Vitals, делаю CI/CD скучным",
      "Выстраиваю культуру ревью, убивающую баги до прода",
      "Внедряю AI там, где он реально экономит часы",
    ],
  },
  {
    type: "comparison",
    title: "Было / стало",
    leftLabel: "Было",
    leftItems: ["Медленные, рискованные релизы", "Растущий техдолг", "Страх рефакторить"],
    rightLabel: "Стало",
    rightItems: ["Скучный CI/CD", "Масштабируемая архитектура", "Релизы без страха"],
  },
  {
    type: "body",
    badge: "03",
    title: "Мой стек",
    text: "Vue 3, Vue 2, Nuxt 3, Nuxt 2, TypeScript — для нагруженных консьюмерских продуктов.",
    highlight: "TypeScript",
  },
  {
    type: "cta",
    text: "Открыт к ролям Senior / Tech Lead / Staff / AI-фронтенд. Удалёнка, EMEA-часы.",
    handle: "rrotatew@gmail.com",
  },
];

export const DEFAULT_FONT: FontId = "mono";
export const DEFAULT_SURFACE: SurfaceId = "dark";
export const DEFAULT_ACCENT: AccentId = "teal";
export const DEFAULT_PURPOSE: PurposeId = "carousel";
export const DEFAULT_BG: BgType = "grid";
export const DEFAULT_FORMAT: FormatId = "threads-4x5";
