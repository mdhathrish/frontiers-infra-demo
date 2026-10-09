import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the site has no server code, so Cloudflare serves the
  // prebuilt files in /out directly (no Next.js server needed).
  output: "export",
  // next/image's optimizer needs a server; serve images as-is instead.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
