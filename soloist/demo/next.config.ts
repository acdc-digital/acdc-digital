import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep strict mode for development
  reactStrictMode: true,

  // Configure for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Ignore type errors during build for demo mode
    ignoreBuildErrors: true,
  },

  // Image optimization - keep it enabled for server mode
  images: {
    unoptimized: false, // Enable optimization for web deployment
  },

  // Security headers - allow embedding in soloist.acdc.digital
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Allow being framed by the main Soloist website
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://soloist.acdc.digital",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://soloist.acdc.digital",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
