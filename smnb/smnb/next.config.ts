import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'raw.githubusercontent.com'
    ],
  },
};

export default nextConfig;
