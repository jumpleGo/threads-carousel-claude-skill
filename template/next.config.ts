import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remotion-рендер тянет нативные модули (@rspack/*.node, esbuild) — их
  // нельзя бандлить, Next должен require'ить их в рантайме на сервере.
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/cli",
    "@rspack/core",
    "esbuild",
  ],
};

export default nextConfig;
