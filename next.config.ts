import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Full-bleed parallax art needs the large end of the ladder.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
