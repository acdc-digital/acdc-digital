import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep strict mode for development
  reactStrictMode: true,
  
  // Ensure convex packages are resolved from the same location
  transpilePackages: ['convex', '@convex-dev/auth'],
  
  // Image optimization - keep it enabled for server mode
  images: {
    unoptimized: false, // Enable optimization for web deployment
  },
};

export default nextConfig;
