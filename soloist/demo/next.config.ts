import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

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

  // Security headers - allow embedding in soloist.acdc.digital (and localhost in dev)
  async headers() {
    // In development, allow localhost origins for testing
    const frameAncestors = isDev 
      ? "'self' https://soloist.acdc.digital http://localhost:* https://localhost:*"
      : "'self' https://soloist.acdc.digital";
    
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
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
