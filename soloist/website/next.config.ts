import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true, // Allow imports from outside the website directory
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Add alias for convex to point to the root convex directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/convex': path.resolve(__dirname, '../convex'),
    };
    return config;
  },
};

export default nextConfig;
