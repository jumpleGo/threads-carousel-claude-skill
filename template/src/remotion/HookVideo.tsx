import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { z } from "zod";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/Playfair";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { SURFACES, ACCENTS } from "../lib/presets";
import type { FontId, BgType } from "../lib/types";

const fonts = {
  minimal: loadUnbounded().fontFamily,
  editorial: loadPlayfair().fontFamily,
  clean: loadInter().fontFamily,
  mono: loadJetBrains().fontFamily,
  condensed: loadOswald().fontFamily,
} satisfies Record<FontId, string>;

export const hookVideoSchema = z.object({
  text: z.string(),
  highlight: z.string().optional(),
  highlightStyle: z.enum(["default", "italic-box"]).optional(),
  badge: z.string().optional(),
  fontId: z.enum(["minimal", "editorial", "clean", "mono", "condensed"]),
  surfaceId: z.enum(["dark", "white", "light", "paper", "gradient", "pastel", "neon", "ember"]),
  accentId: z.enum(["yellow", "red", "teal", "coral", "orange", "violet", "lime", "blue", "fuchsia", "pink", "amber"]),
  bgType: z.enum(["none", "blobs", "grid", "lines", "noise", "bignumber", "glow", "paper"]),
  formatId: z.enum(["threads-4x5", "instagram-square", "linkedin-square", "tiktok-9x16", "story-9x16", "wide-16x9"]),
  index: z.number(),
  total: z.number(),
});

export type HookVideoProps = z.infer<typeof hookVideoSchema>;

export const defaultHookProps: HookVideoProps = {
  text: "Тренд:\nпервый слайд карусели —\nкороткое видео",
  highlight: "видео",
  highlightStyle: "default",
  badge: undefined,
  fontId: "minimal",
  surfaceId: "dark",
  accentId: "yellow",
  bgType: "glow",
  formatId: "threads-4x5",
  index: 0,
  total: 6,
};

function getAdaptiveFontSize(text: string): number {
  const chars = text.replace(/\n/g, "").length;
  const lines = text.split("\n").length;
  const maxLineLen = Math.max(...text.split("\n").map((l) => l.length));

  let sizeByChars = 170;
  if (chars > 70) sizeByChars = 104;
  else if (chars > 50) sizeByChars = 120;
  else if (chars > 30) sizeByChars = 140;
  else if (chars > 20) sizeByChars = 156;

  let sizeByLines = 170;
  if (lines > 4) sizeByLines = 104;
  else if (lines > 3) sizeByLines = 120;
  else if (lines > 2) sizeByLines = 144;

  let sizeByMaxLine = 170;
  if (lines > 1) {
    if (maxLineLen > 14) sizeByMaxLine = 88;
    else if (maxLineLen > 12) sizeByMaxLine = 108;
    else if (maxLineLen > 10) sizeByMaxLine = 124;
    else if (maxLineLen > 8) sizeByMaxLine = 140;
  }

  return Math.min(sizeByChars, sizeByLines, sizeByMaxLine);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function GlowBg({ accentColor, frame, fps }: { accentColor: string; frame: number; fps: number }) {
  const { r, g, b } = hexToRgb(accentColor);
  const t = frame / fps;
  const pulse = 0.18 + 0.07 * Math.sin(t * Math.PI * 0.8);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 25%, rgba(${r},${g},${b},${pulse}) 0%, rgba(${r},${g},${b},0) 55%)`,
      }}
    />
  );
}

function DotsGrid({ color }: { color: string }) {
  const dots: React.ReactNode[] = [];
  const step = 60;
  for (let y = step; y < 1350; y += step) {
    for (let x = step; x < 1080; x += step) {
      dots.push(
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill={color} fillOpacity={0.18} />
      );
    }
  }
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid slice">
        {dots}
      </svg>
    </AbsoluteFill>
  );
}

function LinesBg({ color }: { color: string }) {
  return (
    <AbsoluteFill style={{ opacity: 0.08 }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={i} x1={-200 + i * 80} y1={-100} x2={400 + i * 80} y2={1500} stroke={color} strokeWidth={2} />
        ))}
      </svg>
    </AbsoluteFill>
  );
}

function Background({
  bgType,
  bgGradient,
  bg,
  accentColor,
  textColor,
  frame,
  fps,
}: {
  bgType: BgType;
  bgGradient?: string;
  bg: string;
  accentColor: string;
  textColor: string;
  frame: number;
  fps: number;
}) {
  return (
    <AbsoluteFill style={{ background: bgGradient || bg }}>
      {bgType === "glow" && <GlowBg accentColor={accentColor} frame={frame} fps={fps} />}
      {bgType === "grid" && <DotsGrid color={textColor} />}
      {bgType === "lines" && <LinesBg color={textColor} />}
    </AbsoluteFill>
  );
}

export const HookVideo: React.FC<HookVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const surface = SURFACES[props.surfaceId];
  const accent = ACCENTS[props.accentId];
  const fontFamily = fonts[props.fontId];

  const words = props.text.split(/(\s+|\n)/);
  const wordStartFrame = 4;
  const wordStepFrame = 5;

  const zoomProgress = interpolate(frame, [0, durationInFrames - 1], [1.0, 1.05]);
  const tailFade = interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const badgeOpacity = spring({ frame: frame - 3, fps, config: { damping: 14 } });
  const badgeTranslate = interpolate(badgeOpacity, [0, 1], [12, 0]);

  const fontSize = getAdaptiveFontSize(props.text);
  const lineHeight = props.highlightStyle === "italic-box" ? 1.15 : 1.02;

  return (
    <AbsoluteFill
      style={{
        background: surface.bgGradient || surface.bg,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ transform: `scale(${zoomProgress})`, transformOrigin: "50% 50%" }}>
        <Background
          bgType={props.bgType}
          bgGradient={surface.bgGradient}
          bg={surface.bg}
          accentColor={accent.color}
          textColor={surface.textColor}
          frame={frame}
          fps={fps}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: "80px",
          fontFamily,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          opacity: tailFade,
        }}
      >
        {props.badge && (
          <div
            style={{
              display: "inline-block",
              alignSelf: "flex-start",
              fontFamily,
              fontSize: 26,
              fontWeight: 800,
              padding: "10px 22px",
              border: `3px solid ${surface.accentColor}`,
              color: surface.accentColor,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 40,
              borderRadius: 6,
              opacity: badgeOpacity,
              transform: `translateY(${badgeTranslate}px)`,
            }}
          >
            {props.badge}
          </div>
        )}

        <div
          style={{
            fontSize,
            fontWeight: 800,
            color: surface.textColor,
            lineHeight,
            whiteSpace: "pre-line",
            letterSpacing: "-0.03em",
            textWrap: "balance" as const,
          }}
        >
          {(() => {
            let wIdx = 0;
            return words.map((part, i) => {
              if (part === "\n") return <br key={i} />;
              if (/^\s+$/.test(part)) return <span key={i}>{part}</span>;

              const startFrame = wordStartFrame + wIdx * wordStepFrame;
              wIdx += 1;
              const wOpacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const wY = interpolate(wOpacity, [0, 1], [10, 0]);

              const isHi =
                props.highlight && part.toLowerCase() === props.highlight.toLowerCase();

              if (isHi && props.highlightStyle === "italic-box") {
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: wOpacity,
                      transform: `translateY(${wY}px)`,
                      fontFamily: fonts.editorial,
                      fontStyle: "italic",
                      fontWeight: 700,
                      background: accent.color,
                      color: "#fff",
                      padding: "0 0.22em",
                      borderRadius: 6,
                      textTransform: "none",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {part}
                  </span>
                );
              }

              if (isHi) {
                const huePulse = 0.85 + 0.15 * Math.sin((frame / fps) * Math.PI * 1.2);
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: wOpacity,
                      transform: `translateY(${wY}px)`,
                      color: accent.color,
                      filter: `brightness(${huePulse})`,
                    }}
                  >
                    {part}
                  </span>
                );
              }

              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: wOpacity,
                    transform: `translateY(${wY}px)`,
                  }}
                >
                  {part}
                </span>
              );
            });
          })()}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
          textAlign: "center",
          fontFamily,
          fontSize: 18,
          letterSpacing: "0.2em",
          color: surface.accentColor,
          opacity: tailFade * 0.7,
        }}
      >
        {String(props.index + 1).padStart(2, "0")} / {String(props.total).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};
