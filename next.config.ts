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
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
