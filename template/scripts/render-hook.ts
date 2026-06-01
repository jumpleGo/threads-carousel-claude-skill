#!/usr/bin/env bun
/**
 * Programmatic Remotion render — used by the /api/render-video route
 * and as a standalone CLI: `bun scripts/render-hook.ts <props.json> <out.mp4>`
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

// Выбираем исполняемый Chrome: переменная окружения, затем системный
// браузер (macOS/Linux). Если ни один путь не существует — возвращаем null,
// тогда Remotion сам скачает headless-браузер.
function resolveBrowserExecutable(): string | null {
  const candidates = [
    process.env.REMOTION_CHROME_EXECUTABLE,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((p): p is string => Boolean(p));
  return candidates.find((p) => existsSync(p)) ?? null;
}

const BROWSER_EXECUTABLE = resolveBrowserExecutable();

// Якорим к рабочей директории (template/), а не к __dirname: при сборке
// внутри Next-роута __dirname указывает в .next/server/, где исходников нет.
const PROJECT_ROOT = process.cwd();
const ENTRY = path.join(PROJECT_ROOT, "src/remotion/index.ts");

let cachedBundleLocation: string | null = null;

export async function ensureBundle(): Promise<string> {
  if (cachedBundleLocation) return cachedBundleLocation;
  const bundleLocation = await bundle({
    entryPoint: ENTRY,
    webpackOverride: (c) => c,
  });
  cachedBundleLocation = bundleLocation;
  return bundleLocation;
}

export async function renderHook(opts: {
  inputProps: Record<string, unknown>;
  formatId: string;
  outPath: string;
}): Promise<{ outPath: string; ms: number }> {
  const t0 = Date.now();
  const bundleLocation = await ensureBundle();

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: `Hook-${opts.formatId}`,
    inputProps: opts.inputProps,
    browserExecutable: BROWSER_EXECUTABLE,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: opts.outPath,
    inputProps: opts.inputProps,
    browserExecutable: BROWSER_EXECUTABLE,
    crf: 22,
    pixelFormat: "yuv420p",
  });

  return { outPath: opts.outPath, ms: Date.now() - t0 };
}

if (import.meta.main) {
  const [propsPath, outPath] = process.argv.slice(2);
  if (!propsPath || !outPath) {
    console.error("usage: bun scripts/render-hook.ts <props.json> <out.mp4>");
    process.exit(1);
  }
  const props = JSON.parse(await fs.readFile(propsPath, "utf8")) as {
    formatId: string;
    [k: string]: unknown;
  };
  const r = await renderHook({
    inputProps: props,
    formatId: props.formatId,
    outPath,
  });
  console.log(JSON.stringify(r));
}
