import type { NextConfig } from "next";
import { availablePanoramas } from "./src/content/panoramas";

const initialPanorama = availablePanoramas[0];
const panoramaPreload = initialPanorama
  ? initialPanorama.faces
      .map((face) => `<${face}>; rel=preload; as=image; fetchpriority=low`)
      .join(", ")
  : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  // The arcade ships tens of megabytes of WebAssembly. Next's built-in
  // compression handles the dynamic response; static assets under public/ are
  // pre-compressed at build time by games/tools/optimize_assets.py.
  compress: true,
  async redirects() {
    return [
      {
        source: "/atlas",
        destination: "/safar",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      ...(panoramaPreload
        ? [
            {
              source: "/",
              headers: [{ key: "Link", value: panoramaPreload }],
            },
          ]
        : []),
      {
        source: "/panoramas/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/ui/minecraft/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Game builds are content-addressed by slug and only change on rebuild, so
      // they can be cached hard. Without this each visit re-downloaded tens of
      // megabytes of wasm and Python runtime.
      {
        source: "/arcade-runtime/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/arcade/:slug/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": [
        {
          condition: { not: { path: /\.module\.css$/ } },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      ],
    },
  },
};

export default nextConfig;
